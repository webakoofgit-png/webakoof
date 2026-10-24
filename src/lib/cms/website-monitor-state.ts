export type MonitorState = "unknown" | "healthy" | "unavailable";
export type CheckOutcome = "available" | "unavailable" | "inconclusive";
export const monitorIntervalMinutes = 15;
export const failureThreshold = 3;
export const recoveryThreshold = 2;
export type MonitorCounters = { state: MonitorState; failures: number; successes: number };
export function nextMonitorState(
  previous: MonitorCounters,
  outcome: CheckOutcome,
): MonitorCounters {
  if (outcome === "inconclusive") return { ...previous, failures: 0, successes: 0 };
  if (outcome === "available") {
    const successes = Math.min(previous.successes + 1, recoveryThreshold);
    return {
      state: successes >= recoveryThreshold ? "healthy" : previous.state,
      successes,
      failures: 0,
    };
  }
  const failures = Math.min(previous.failures + 1, failureThreshold);
  return {
    state: failures >= failureThreshold ? "unavailable" : previous.state,
    failures,
    successes: 0,
  };
}
