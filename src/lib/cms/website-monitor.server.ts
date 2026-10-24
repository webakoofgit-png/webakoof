import { randomUUID } from "node:crypto";
import { database, rows, json, cmsEnabled } from "./db.server";
import { checkWebsite } from "./website-check.server";
import {
  nextMonitorState,
  monitorIntervalMinutes,
  failureThreshold,
  recoveryThreshold,
} from "./website-monitor-state";
import type { MonitorState } from "./website-monitor-state";

// Separate state prevents automatic checks and stale admin forms from overwriting project content.
export const monitoringSchema = `CREATE TABLE IF NOT EXISTS portfolio_website_checks (
 project_id INT UNSIGNED PRIMARY KEY,
 url VARCHAR(1000) NOT NULL,
 state ENUM('unknown','healthy','unavailable') NOT NULL DEFAULT 'unknown',
 failures INT UNSIGNED NOT NULL DEFAULT 0,
 successes INT UNSIGNED NOT NULL DEFAULT 0,
 last_checked_at DATETIME(3) NULL,
 next_check_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
 changed_at DATETIME(3) NULL,
 lease_until DATETIME(3) NULL,
 lease_token VARCHAR(36) NULL,
 http_status SMALLINT UNSIGNED NULL,
 last_result TEXT NOT NULL,
 FOREIGN KEY(project_id) REFERENCES portfolio_projects(id) ON DELETE CASCADE
)`;
type Project = {
  liveUrl?: string;
  websiteAvailability?: string;
  websiteMonitoringEnabled?: boolean;
};
type MonitorRow = {
  project_id: number;
  url: string;
  state: MonitorState;
  failures: number;
  successes: number;
  last_checked_at: string | null;
  next_check_at: string;
  changed_at: string | null;
  http_status: number | null;
  last_result: string;
};
function eligible(project: Project, status: string) {
  return (
    status === "published" &&
    !!project.liveUrl &&
    project.websiteMonitoringEnabled !== false &&
    (project.websiteAvailability ?? "live") === "live"
  );
}
let schemaPromise: Promise<void> | undefined;
export function ensureMonitoringSchema() {
  return (schemaPromise ??= database()
    .query("SELECT project_id FROM portfolio_website_checks LIMIT 0")
    .catch((error) => {
      if ((error as { code?: string }).code !== "ER_NO_SUCH_TABLE") throw error;
      return database().query(monitoringSchema);
    })
    .then(() => {})
    .catch((error) => {
      schemaPromise = undefined;
      throw error;
    }));
}
export async function loadWebsiteMonitoring() {
  try {
    return new Map(
      (await rows<MonitorRow>("SELECT * FROM portfolio_website_checks")).map((row) => [
        Number(row.project_id),
        row,
      ]),
    );
  } catch (error) {
    if ((error as { code?: string }).code === "ER_NO_SUCH_TABLE")
      return new Map<number, MonitorRow>();
    throw error;
  }
}
export function publicMonitorState(project: Project, row: MonitorRow | undefined) {
  return row && row.url === project.liveUrl && project.websiteMonitoringEnabled !== false
    ? row.state
    : ("unknown" as const);
}

// Transactional claims allow overlapping Node processes/redeploys without counting duplicate checks.
async function claimProject(id: number) {
  const connection = await database().getConnection();
  try {
    await connection.beginTransaction();
    const [records] = await connection.execute(
      "SELECT status,content FROM portfolio_projects WHERE id=? FOR UPDATE",
      [id],
    );
    const record = (records as { status: string; content: unknown }[])[0];
    const project = record && json<Project>(record.content);
    if (!record || !project || !eligible(project, record.status)) {
      await connection.rollback();
      return null;
    }
    const url = project.liveUrl!;
    await connection.execute(
      "INSERT IGNORE INTO portfolio_website_checks(project_id,url,last_result) VALUES (?,?,'')",
      [id, url],
    );
    const [checks] = await connection.execute(
      "SELECT *, (next_check_at<=UTC_TIMESTAMP(3)) due, (lease_until>UTC_TIMESTAMP(3)) leased FROM portfolio_website_checks WHERE project_id=? FOR UPDATE",
      [id],
    );
    const previous = (checks as (MonitorRow & { due: number; leased: number })[])[0]!;
    if (previous.leased || (previous.url === url && !previous.due)) {
      await connection.rollback();
      return null;
    }
    const token = randomUUID();
    if (previous.url !== url) {
      await connection.execute(
        "UPDATE portfolio_website_checks SET url=?,state='unknown',failures=0,successes=0,last_checked_at=NULL,http_status=NULL,last_result='',changed_at=NULL WHERE project_id=?",
        [url, id],
      );
      Object.assign(previous, { url, state: "unknown", failures: 0, successes: 0 });
    }
    await connection.execute(
      "UPDATE portfolio_website_checks SET lease_until=DATE_ADD(UTC_TIMESTAMP(3),INTERVAL 60 SECOND),lease_token=? WHERE project_id=?",
      [token, id],
    );
    await connection.commit();
    return { id, url, token, previous };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export async function monitorProject(id: number, checker = checkWebsite) {
  const claim = await claimProject(id);
  if (!claim) return false;
  const result = await checker(claim.url);
  const connection = await database().getConnection();
  try {
    await connection.beginTransaction();
    const [records] = await connection.execute(
      "SELECT status,content FROM portfolio_projects WHERE id=? FOR UPDATE",
      [id],
    );
    const record = (records as { status: string; content: unknown }[])[0];
    const project = record && json<Project>(record.content);
    const next = nextMonitorState(claim.previous, result.outcome);
    // Discard results if an admin changed the URL, disabled monitoring, unpublished or overrode status.
    if (record && project && eligible(project, record.status) && project.liveUrl === claim.url) {
      await connection.execute(
        `UPDATE portfolio_website_checks SET
        state=?,failures=?,successes=?,last_checked_at=UTC_TIMESTAMP(3),
        next_check_at=DATE_ADD(UTC_TIMESTAMP(3),INTERVAL ${monitorIntervalMinutes} MINUTE),
        changed_at=IF(?<>?,UTC_TIMESTAMP(3),changed_at),http_status=?,last_result=?,lease_until=NULL,lease_token=NULL
        WHERE project_id=? AND lease_token=? AND url=?`,
        [
          next.state,
          next.failures,
          next.successes,
          next.state,
          claim.previous.state,
          result.status,
          result.result,
          id,
          claim.token,
          claim.url,
        ],
      );
    } else {
      await connection.execute(
        "UPDATE portfolio_website_checks SET lease_until=NULL,lease_token=NULL WHERE project_id=? AND lease_token=?",
        [id, claim.token],
      );
    }
    await connection.commit();
    return true;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

let started = false;
let running = false;
let lastCycleAt: string | null = null;
let lastError: string | null = null;
export function automaticMonitoringEnabled() {
  return (
    cmsEnabled() &&
    (import.meta.env?.PROD === true || process.env["NODE_ENV"] === "production") &&
    !process.env["VERCEL"] &&
    process.env["WEBSITE_MONITOR_ENABLED"] !== "false"
  );
}
export async function runMonitoringCycle() {
  if (running) return;
  running = true;
  try {
    await ensureMonitoringSchema();
    const candidates = await rows<{ id: number; content: unknown; status: string }>(
      "SELECT id,content,status FROM portfolio_projects WHERE status='published' ORDER BY id",
    );
    const ids = candidates
      .filter((p) => eligible(json<Project>(p.content), p.status))
      .map((p) => Number(p.id));
    let cursor = 0;
    let failure: unknown;
    // Two requests at a time keep monitoring from saturating the production host.
    await Promise.all(
      [0, 1].map(async () => {
        while (cursor < ids.length) {
          const id = ids[cursor++]!;
          try {
            await monitorProject(id);
          } catch (error) {
            failure = error;
          }
        }
      }),
    );
    if (failure)
      throw new Error("Website monitoring check could not be stored", { cause: failure });
    lastCycleAt = new Date().toISOString();
    lastError = null;
  } finally {
    running = false;
  }
}
export function startWebsiteMonitor() {
  if (started || !automaticMonitoringEnabled()) return;
  started = true;
  const tick = () =>
    void runMonitoringCycle().catch((error) => {
      lastError =
        (error.cause as { code?: string } | undefined)?.code || error.code || "MONITOR_UNAVAILABLE";
      console.error("Automatic website monitor:", lastError);
    });
  setTimeout(tick, 1000).unref();
  setInterval(tick, 60000).unref();
}
export async function monitoringDiagnostics(projectId?: number) {
  const checks = await loadWebsiteMonitoring();
  let check: MonitorRow | null = null;
  if (projectId) {
    const project = (
      await rows<{ content: unknown }>("SELECT content FROM portfolio_projects WHERE id=?", [
        projectId,
      ])
    )[0];
    const row = checks.get(projectId);
    if (project && row && row.url === json<Project>(project.content).liveUrl) check = row;
  }
  return {
    trackedProjects: checks.size,
    lastObservationAt:
      [...checks.values()]
        .map((row) => row.last_checked_at)
        .filter((value): value is string => !!value)
        .sort()
        .at(-1) ?? null,
    enabled: automaticMonitoringEnabled(),
    started,
    running,
    lastCycleAt,
    lastError,
    intervalMinutes: monitorIntervalMinutes,
    failureThreshold,
    recoveryThreshold,
    check,
  };
}
