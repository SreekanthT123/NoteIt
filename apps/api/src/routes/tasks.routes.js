import express from "express";
import Task from "../models/Task.js";
import { authMiddleware } from "../middleware/auth.js";
const router = express.Router();
router.use(authMiddleware);

// get all tasks
router.get("/", async (req, res) => {
  try {
    const tasks = await Task.find({ userId: req.user._id }).sort({
      createdAt: -1,
    });
    res.status(200).json({ tasks: tasks });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// update task status
router.patch("/:id", async (req, res) => {
  const { status } = req.body;
  if (!["todo", "in_progress", "done"].includes(status)) {
    return res.status(400).json({ error: "Invalid status value" });
  }
  try {
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { status: status },
      { new: true },
    );
    res.status(200).json({ task: task });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
