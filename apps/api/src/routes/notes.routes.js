import express from "express";
import Note from "../models/Note.js";
import Task from "../models/Task.js";
import { summarizeNote } from "../ai/summarizeNote.js";
import { extractTasks } from "../ai/extractTasks.js";
import Relation from "../models/Relation.js";
import { findRelations } from "../ai/findRelation.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();
router.use(authMiddleware);

// Syncs AI-extracted tasks for a note, preserving existing task status on title match.
// Orphaned tasks (removed from note content) are deleted.
async function syncTasksForNote(note, body, user) {
  const tasks = await extractTasks(body, user); // throws "AI usage limit reached" if quota hit
  if (!Array.isArray(tasks)) return;

  const existingTasks = await Task.find({ noteId: note._id, userId: user._id });
  const existingByTitle = new Map(
    existingTasks.map((t) => [t.title.toLowerCase().trim(), t])
  );
  const newTitles = new Set(tasks.map((t) => t.title.toLowerCase().trim()));
  const survivingIds = [];

  for (const t of tasks) {
    const key = t.title.toLowerCase().trim();
    const existing = existingByTitle.get(key);
    if (existing) {
      // Update metadata but keep the user's current status
      existing.dueAt = isValidDate(t.dueAt) ? new Date(t.dueAt) : null;
      existing.priority = t.priority || "low";
      existing.recurrence = t.recurrence || "none";
      existing.type = t.type || "one_time";
      existing.sourceText = t.sourceText;
      await existing.save();
      survivingIds.push(existing._id);
    } else {
      const created = await Task.create({
        noteId: note._id,
        userId: user._id,
        title: t.title,
        status: "todo",
        dueAt: isValidDate(t.dueAt) ? new Date(t.dueAt) : null,
        priority: t.priority || "low",
        recurrence: t.recurrence || "none",
        type: t.type || "one_time",
        sourceText: t.sourceText,
      });
      survivingIds.push(created._id);
    }
  }

  // Remove tasks that are no longer in the AI output
  const orphanedIds = existingTasks
    .filter((t) => !newTitles.has(t.title.toLowerCase().trim()))
    .map((t) => t._id);
  if (orphanedIds.length) {
    await Task.deleteMany({ _id: { $in: orphanedIds } });
  }

  note.extractedTasks = survivingIds;
}

router.post("/", async (req, res) => {
  try {
    const { title, body, theme } = req.body;

    if (!body || body.trim() === "") {
      return res.status(400).json({ error: "Body is required" });
    }

    const note = await Note.create({
      userId: req.user._id,
      title,
      body,
      processingStatus: "processing",
      theme: ["lavender", "mint", "sky", "peach", "gray"].includes(theme)
        ? theme
        : "lavender",
    });

    try {
      let aiResult;
      try {
        aiResult = await summarizeNote(body, req.user);
      } catch (err) {
        if (err.message === "AI usage limit reached") {
          return res.status(403).json({ error: err.message });
        }
        throw err;
      }

      if (!aiResult) throw new Error("AI summary failed");

      note.aiSummary = aiResult.summary;
      note.tags = aiResult.tags;
      note.processingStatus = "completed";
      note.aiProcessedAt = new Date();

      try {
        await syncTasksForNote(note, body, req.user);
      } catch (err) {
        if (err.message === "AI usage limit reached") {
          return res.status(403).json({ error: err.message });
        }
        console.error("Task extraction error:", err.message);
      }

      const existingNotes = await Note.find({
        _id: { $ne: note._id },
        userId: req.user._id,
      });
      const relations = await findRelations(note, existingNotes);
      for (const rel of relations) {
        try {
          await Relation.findOneAndUpdate(
            { fromNoteId: note._id, toNoteId: rel.toNoteId, type: rel.type },
            {
              fromNoteId: note._id,
              toNoteId: rel.toNoteId,
              type: rel.type,
              confidence: rel.confidence,
              userId: req.user._id,
            },
            { upsert: true }
          );
        } catch (err) {
          console.error("Relation error:", err.message);
        }
      }

      await note.save();
    } catch (err) {
      console.error("AI failed to process note:", err);
      note.processingStatus = "failed";
      note.lastProcessingError = err.message;
      await note.save();
    }

    res.status(201).json(note);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/:id", async (req, res) => {
  try {
    const { body, theme, title } = req.body;

    if (!body || body.trim() === "") {
      return res.status(400).json({ error: "Body is required" });
    }

    const note = await Note.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!note) {
      return res.status(404).json({ error: "Note not found" });
    }

    // Update editable fields
    note.body = body;
    if (title !== undefined) note.title = title;
    note.theme = ["lavender", "mint", "sky", "peach", "gray"].includes(theme)
      ? theme
      : "lavender";

    // Mark as processing without wiping extractedTasks yet
    note.processingStatus = "processing";
    note.aiSummary = "";
    note.tags = [];
    await note.save();

    try {
      let aiResult;
      try {
        aiResult = await summarizeNote(body, req.user);
      } catch (err) {
        if (err.message === "AI usage limit reached") {
          return res.status(403).json({ error: err.message });
        }
        throw err;
      }

      note.aiSummary = aiResult.summary;
      note.tags = aiResult.tags;
      note.processingStatus = "completed";
      note.aiProcessedAt = new Date();

      try {
        await syncTasksForNote(note, body, req.user);
      } catch (err) {
        if (err.message === "AI usage limit reached") {
          return res.status(403).json({ error: err.message });
        }
        console.error("Task extraction error:", err.message);
      }

      const existingNotes = await Note.find({ _id: { $ne: note._id } });
      const relations = await findRelations(note, existingNotes);
      for (const rel of relations) {
        try {
          await Relation.findOneAndUpdate(
            { fromNoteId: note._id, toNoteId: rel.toNoteId, type: rel.type },
            {
              fromNoteId: note._id,
              toNoteId: rel.toNoteId,
              type: rel.type,
              confidence: rel.confidence,
              userId: req.user._id,
            },
            { upsert: true }
          );
        } catch (err) {
          console.error("Relation error:", err.message);
        }
      }

      await note.save();
    } catch (err) {
      console.error("AI failed:", err);
      note.processingStatus = "failed";
      note.lastProcessingError = err.message;
      await note.save();
    }

    res.json(note);
  } catch (err) {
    res.status(500).json({ error: "Update failed" });
  }
});

// get all notes
router.get("/", async (req, res) => {
  try {
    const { q, limit, skip, startDate, endDate } = req.query;
    const filter = { userId: req.user._id };

    if (q && q.trim() !== "") {
      filter.$or = [
        { title: { $regex: q, $options: "i" } },
        { body: { $regex: q, $options: "i" } },
        { tags: { $regex: q, $options: "i" } },
      ];
    }

    if (startDate && endDate) {
      const end = new Date(endDate);
      end.setUTCHours(23, 59, 59, 999);
      filter.createdAt = { $gte: new Date(startDate), $lte: end };
      const notes = await Note.find(filter)
        .populate("extractedTasks")
        .sort({ createdAt: -1 });
      return res.status(200).json({ notes });
    }

    const parsedLimit = Math.min(parseInt(limit) || 20, 100);
    const parsedSkip = parseInt(skip) || 0;
    const total = await Note.countDocuments(filter);
    const notes = await Note.find(filter)
      .populate("extractedTasks")
      .sort({ createdAt: -1 })
      .skip(parsedSkip)
      .limit(parsedLimit);

    res.status(200).json({ notes, total, hasMore: parsedSkip + notes.length < total });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;

function isValidDate(d) {
  return d && !isNaN(new Date(d).getTime());
}
