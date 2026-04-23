import { Router } from "express";
import jwt from "jsonwebtoken";
import { pool } from "@workspace/db";

const router = Router();
const JWT_SECRET = process.env.SESSION_SECRET || "corehr-jwt-secret-fallback";

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
}

function now() {
  return new Date().toISOString();
}

function requireAuth(req: any, res: any): string | null {
  const auth = req.headers.authorization as string | undefined;
  if (!auth?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized" });
    return null;
  }
  try {
    // JWT is signed with { id: userId } — see auth.ts jwt.sign({ id: user.id }, ...)
    const payload = jwt.verify(auth.slice(7), JWT_SECRET) as { id: string };
    return payload.id;
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
    return null;
  }
}

// ─── WORKOUTS ────────────────────────────────────────────────────────────────

router.get("/workouts", async (req, res) => {
  const userId = requireAuth(req, res);
  if (!userId) return;
  try {
    const { rows } = await pool.query(
      `SELECT id, user_id AS "userId", date, type, duration, calories, notes, created_at AS "createdAt"
       FROM workouts WHERE user_id = $1 ORDER BY created_at DESC`,
      [userId]
    );
    return res.json({ workouts: rows });
  } catch (err) {
    console.error("[workouts] GET error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

router.post("/workouts", async (req, res) => {
  const userId = requireAuth(req, res);
  if (!userId) return;
  try {
    const { date, type, duration, calories, notes } = req.body;
    if (!date || !type || duration == null || calories == null) {
      return res.status(400).json({ error: "date, type, duration and calories are required" });
    }
    const id = generateId();
    const { rows } = await pool.query(
      `INSERT INTO workouts (id, user_id, date, type, duration, calories, notes, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, user_id AS "userId", date, type, duration, calories, notes, created_at AS "createdAt"`,
      [id, userId, date, type, Number(duration), Number(calories), notes ?? null, now()]
    );
    return res.status(201).json({ workout: rows[0] });
  } catch (err) {
    console.error("[workouts] POST error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

router.delete("/workouts/:id", async (req, res) => {
  const userId = requireAuth(req, res);
  if (!userId) return;
  try {
    await pool.query(
      `DELETE FROM workouts WHERE id = $1 AND user_id = $2`,
      [req.params.id, userId]
    );
    return res.json({ success: true });
  } catch (err) {
    console.error("[workouts] DELETE error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

// ─── MEALS ───────────────────────────────────────────────────────────────────

router.get("/meals", async (req, res) => {
  const userId = requireAuth(req, res);
  if (!userId) return;
  try {
    const { rows } = await pool.query(
      `SELECT id, user_id AS "userId", date, category, name, calories, notes, created_at AS "createdAt"
       FROM meals WHERE user_id = $1 ORDER BY created_at DESC`,
      [userId]
    );
    return res.json({ meals: rows });
  } catch (err) {
    console.error("[meals] GET error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

router.post("/meals", async (req, res) => {
  const userId = requireAuth(req, res);
  if (!userId) return;
  try {
    const { date, category, name, calories, notes } = req.body;
    if (!date || !category || !name) {
      return res.status(400).json({ error: "date, category and name are required" });
    }
    const id = generateId();
    const { rows } = await pool.query(
      `INSERT INTO meals (id, user_id, date, category, name, calories, notes, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, user_id AS "userId", date, category, name, calories, notes, created_at AS "createdAt"`,
      [id, userId, date, category, name, calories != null ? Number(calories) : null, notes ?? null, now()]
    );
    return res.status(201).json({ meal: rows[0] });
  } catch (err) {
    console.error("[meals] POST error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

router.delete("/meals/:id", async (req, res) => {
  const userId = requireAuth(req, res);
  if (!userId) return;
  try {
    await pool.query(
      `DELETE FROM meals WHERE id = $1 AND user_id = $2`,
      [req.params.id, userId]
    );
    return res.json({ success: true });
  } catch (err) {
    console.error("[meals] DELETE error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

// ─── WATER ───────────────────────────────────────────────────────────────────

router.get("/water", async (req, res) => {
  const userId = requireAuth(req, res);
  if (!userId) return;
  try {
    const { rows } = await pool.query(
      `SELECT id, user_id AS "userId", date, litres, updated_at AS "updatedAt"
       FROM water_entries WHERE user_id = $1 ORDER BY date DESC`,
      [userId]
    );
    return res.json({ waterEntries: rows });
  } catch (err) {
    console.error("[water] GET error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

router.post("/water", async (req, res) => {
  const userId = requireAuth(req, res);
  if (!userId) return;
  try {
    const { date, litres } = req.body;
    if (!date || litres == null) {
      return res.status(400).json({ error: "date and litres are required" });
    }
    const existing = await pool.query(
      `SELECT id, litres FROM water_entries WHERE user_id = $1 AND date = $2 LIMIT 1`,
      [userId, date]
    );
    let row;
    if (existing.rows.length > 0) {
      const prev = existing.rows[0] as { id: string; litres: number };
      const newTotal = Math.round((Number(prev.litres) + Number(litres)) * 100) / 100;
      const updated = await pool.query(
        `UPDATE water_entries SET litres = $1, updated_at = $2 WHERE id = $3
         RETURNING id, user_id AS "userId", date, litres, updated_at AS "updatedAt"`,
        [newTotal, now(), prev.id]
      );
      row = updated.rows[0];
    } else {
      const inserted = await pool.query(
        `INSERT INTO water_entries (id, user_id, date, litres, updated_at)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, user_id AS "userId", date, litres, updated_at AS "updatedAt"`,
        [generateId(), userId, date, Number(litres), now()]
      );
      row = inserted.rows[0];
    }
    return res.json({ waterEntry: row });
  } catch (err) {
    console.error("[water] POST error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

// ─── SLEEP ───────────────────────────────────────────────────────────────────

router.get("/sleep", async (req, res) => {
  const userId = requireAuth(req, res);
  if (!userId) return;
  try {
    const { rows } = await pool.query(
      `SELECT id, user_id AS "userId", date, hours, quality, updated_at AS "updatedAt"
       FROM sleep_entries WHERE user_id = $1 ORDER BY date DESC`,
      [userId]
    );
    return res.json({ sleepEntries: rows });
  } catch (err) {
    console.error("[sleep] GET error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

router.post("/sleep", async (req, res) => {
  const userId = requireAuth(req, res);
  if (!userId) return;
  try {
    const { date, hours, quality } = req.body;
    if (!date || hours == null) {
      return res.status(400).json({ error: "date and hours are required" });
    }
    const existing = await pool.query(
      `SELECT id FROM sleep_entries WHERE user_id = $1 AND date = $2 LIMIT 1`,
      [userId, date]
    );
    let row;
    if (existing.rows.length > 0) {
      const prev = existing.rows[0] as { id: string };
      const updated = await pool.query(
        `UPDATE sleep_entries SET hours = $1, quality = $2, updated_at = $3 WHERE id = $4
         RETURNING id, user_id AS "userId", date, hours, quality, updated_at AS "updatedAt"`,
        [Number(hours), quality ?? null, now(), prev.id]
      );
      row = updated.rows[0];
    } else {
      const inserted = await pool.query(
        `INSERT INTO sleep_entries (id, user_id, date, hours, quality, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id, user_id AS "userId", date, hours, quality, updated_at AS "updatedAt"`,
        [generateId(), userId, date, Number(hours), quality ?? null, now()]
      );
      row = inserted.rows[0];
    }
    return res.json({ sleepEntry: row });
  } catch (err) {
    console.error("[sleep] POST error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

export default router;
