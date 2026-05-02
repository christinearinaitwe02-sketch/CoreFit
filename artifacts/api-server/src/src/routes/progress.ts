import { Router } from "express";

const router = Router();

let progressData: any[] = [];

router.post("/progress", (req, res) => {
  const { weight } = req.body;

  if (!weight) {
    return res.status(400).json({ error: "Weight required" });
  }

  const entry = {
    weight,
    date: new Date(),
  };

  progressData.push(entry);

  res.json({ success: true, entry });
});

router.get("/progress", (req, res) => {
  res.json({ progress: progressData });
});

export default router;
