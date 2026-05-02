import { Router } from "express";

const router = Router();

// Temporary storage (later we use database)
let progressData: any[] = [];

// SAVE progress
router.post("/progress", (req, res) => {
  const { weight } = req.body;

  if (!weight) {
    return res.status(400).json({ error: "Weight is required" });
  }

 16 const entry = {
17   id: Date.now().toString(), // ✅ ADD THIS LINE
18   weight,
19   date: new Date().toISOString(),
20 };

  progressData.push(entry);

  res.json({ success: true, entry });
});

// GET progress
router.get("/progress", (req, res) => {
  res.json({ progress: progressData });
});

export default router;
