import express from "express";
import Note from "../models/Note.js";
import Task from "../models/Task.js";
import DailyDigest from "../models/DailyDigest.js";
import { generateDigest } from "../ai/generateDigest.js";
import { authMiddleware } from "../middleware/auth.js";
const router = express.Router();
router.use(authMiddleware);

router.post("/generate", async (req, res) => {
  try {
    const today = new Date().toISOString().split("T")[0];

    const notes = await Note.find({
      userId: req.user._id,
      createdAt: {
        $gte: new Date(today + "T00:00:00Z"),
      },
    });

    const tasks = await Task.find({ userId: req.user._id });

    const digestContent = await generateDigest(notes, tasks);

    const digest = await DailyDigest.findOneAndUpdate(
      { userId: req.user._id, dateKey: today },
      {
        userId: req.user._id,
        dateKey: today,
        noteIds: notes.map((n) => n._id),
        taskIds: tasks.map((t) => t._id),
        summary: digestContent.summary,
        highlights: digestContent.highlights,
        focusAreas: digestContent.focusAreas,
      },
      { upsert: true, new: true },
    );
    res.status(200).json({ digest: digest });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// get today digest

router.get("/", async (req, res) => {
  try {
    const today = new Date().toISOString().split("T")[0];

    const digest = await DailyDigest.findOne({
      userId: req.user._id,
      dateKey: today,
    });

    if (!digest) {
      return res.status(404).json({ error: "Digest not found" });
    }

    res.status(200).json({ digest: digest });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
