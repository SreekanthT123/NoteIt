import express from "express";
import Task from "../models/Task.js";
import { authMiddleware } from "../middleware/auth.js";
const router = express.Router();
router.use(authMiddleware);

// get all tasks
router.get("/", async (req, res) => {
  try {
    const {status,due}= req.query;
    const filter = { userId: req.user._id };
    if(status) filter.status = status;
    if(due === "today"){
      const today= new Date();
      today.setHours(0,0,0,0);

      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate()+ 1);

      filter.dueAt = {$gte: today, $lt:tomorrow};
    }

    if(due === "overdue"){
      filter.dueAt = {$lt: new Date()};
      filter.status= {$ne: "done"};
    }
    
    const tasks = await Task.find(filter).sort({
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
    const task = await Task.findOne({ _id: req.params.id, userId: req.user._id });
    if (!task) return res.status(404).json({ error: "Task not found" });
    task.status = status;
    await task.save();
    res.status(200).json({ task });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
