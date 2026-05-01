import { getApiBase } from "@/utils/api";

type EventName =
  | "upgrade_funnel_started"
  | "upgrade_funnel_converted";

type EventProperties = Record<string, string | number | boolean | undefined>;

let _lastUpgradeSource: string | undefined;

export function setUpgradeSource(source: string | undefined): void {
  _lastUpgradeSource = source;
}

export function getUpgradeSource(): string | undefined {
  return _lastUpgradeSource;
}

function trackEvent(event: EventName, properties?: EventProperties): void {
  if (__DEV__) {
    const label = properties
      ? Object.entries(properties)
          .map(([k, v]) => `${k}=${v}`)
          .join(", ")
      : "";
    // eslint-disable-next-line no-console
    console.log(`[Analytics] ${event}${label ? ` { ${label} }` : ""}`);
    return;
  }

  const apiBase = getApiBase();
  if (!apiBase) return;

  fetch(`${apiBase}/api/analytics/events`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ event, properties }),
  }).catch(() => {});
}

export { trackEvent };
export type { EventName, EventProperties };
