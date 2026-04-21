import { Router } from "express";
import { db, coachesTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

const DEFAULT_COACH = {
  id: "coach-tina-barks",
  name: "Coach TinaBarks",
  email: "coach@corehrfitness.com",
  phone: "+256702568383",
  role: "coach",
  isActive: true,
};

router.get("/coach", async (_req, res) => {
  try {
    const rows = await db
      .select()
      .from(coachesTable)
      .where(eq(coachesTable.isActive, true))
      .limit(1);

    if (rows.length > 0) {
      return res.json({ coach: rows[0] });
    }

    return res.json({ coach: DEFAULT_COACH });
  } catch {
    return res.json({ coach: DEFAULT_COACH });
  }
});

export default router;
