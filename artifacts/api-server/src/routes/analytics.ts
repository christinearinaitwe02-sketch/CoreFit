import { Router } from "express";

const router = Router();

const MAX_EVENT_NAME_LENGTH = 64;
const MAX_PROPERTY_KEY_LENGTH = 64;
const MAX_PROPERTY_VALUE_LENGTH = 256;
const MAX_PROPERTY_COUNT = 20;

function sanitizeProperties(
  raw: unknown
): Record<string, string | number | boolean> {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  const entries = Object.entries(raw as Record<string, unknown>).slice(0, MAX_PROPERTY_COUNT);
  const result: Record<string, string | number | boolean> = {};
  for (const [k, v] of entries) {
    if (typeof k !== "string" || k.length > MAX_PROPERTY_KEY_LENGTH) continue;
    if (typeof v === "string") {
      result[k] = v.slice(0, MAX_PROPERTY_VALUE_LENGTH);
    } else if (typeof v === "number" || typeof v === "boolean") {
      result[k] = v;
    }
  }
  return result;
}

router.post("/analytics/events", (req, res) => {
  const { event, properties } = req.body;
  if (!event || typeof event !== "string" || event.length > MAX_EVENT_NAME_LENGTH) {
    return res.status(400).json({ error: "event name is required and must be under 64 characters" });
  }
  const props = sanitizeProperties(properties);
  req.log.info({ event, ...props }, `[analytics] ${event}`);
  return res.status(200).json({ ok: true });
});

export default router;
