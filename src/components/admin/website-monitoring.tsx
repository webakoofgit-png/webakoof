import { useData } from "./shared";
type MonitoringReport = {
  enabled: boolean;
  lastError: string | null;
  check: {
    state: string;
    failures: number;
    successes: number;
    last_checked_at: string | null;
    last_result: string;
  } | null;
};
export function WebsiteMonitoring({
  id,
  enabled,
  onChange,
}: {
  id: string;
  enabled: boolean;
  onChange: (enabled: boolean) => void;
}) {
  const { data, error } = useData<MonitoringReport>(
    "website-monitoring" + (id === "new" ? "" : "?project=" + id),
  );
  return (
    <div>
      <div className="adm-field">
        <span>Automatic website monitoring</span>
        <label>
          <input
            type="checkbox"
            checked={enabled}
            onChange={(event) => onChange(event.target.checked)}
          />{" "}
          Enable automatic unavailable notice and recovery
        </label>
      </div>
      <p className="adm-help">
        Checks every 15 minutes. Three consecutive failures hide the external website link; two
        successful checks restore it. A manually selected unavailable status takes priority.
      </p>
      {error ? (
        <p role="status">Monitoring information is temporarily unavailable.</p>
      ) : data?.lastError ? (
        <p role="status">Automatic monitoring needs attention. Check the server database setup.</p>
      ) : data && !data.enabled ? (
        <p className="adm-help">The automatic worker is disabled on this server.</p>
      ) : null}
      {data?.check && (
        <div aria-live="polite">
          <p>
            Automatic result:{" "}
            {data.check.state === "unknown"
              ? "Awaiting confirmation"
              : data.check.state === "healthy"
                ? "Available"
                : "Temporarily unavailable"}
          </p>
          <p className="adm-help">
            Consecutive failures: {data.check.failures} / 3 · Recovery checks:{" "}
            {data.check.successes} / 2
          </p>
          {data.check.last_checked_at && (
            <p className="adm-help">Automatic check time (UTC): {data.check.last_checked_at}</p>
          )}
          <p className="adm-help">{data.check.last_result}</p>
        </div>
      )}
    </div>
  );
}
