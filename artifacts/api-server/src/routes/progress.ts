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

  const entry = {
id: Date.now().toString(), // ✅ ADD THIS LINE
weight,
date: new Date().toISOString(),
 };

  progressData.push(entry);

  res.json({ success: true, entry });
});

// GET progress
router.get("/progress", (req, res) => {
  res.json({ progress: progressData });
});
router.delete("/progress/:id", (req, res) => {
  const { id } = req.params;

  const initialLength = progressData.length;

  progressData = progressData.filter(item => item.id !== id);

  if (progressData.length === initialLength) {
    return res.status(404).json({ error: "Item not found" });
  }

  res.json({ success: true });
});
export default router;
