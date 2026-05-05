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
        throw err; // 🔥 important
      }

      if (!aiResult) {
        throw new Error("AI summary failed");
      }

      note.aiSummary = aiResult.summary;
      note.tags = aiResult.tags;
      note.processingStatus = "completed";
      note.aiProcessedAt = new Date();
      // TASK EXTRACTION
      let tasks;
      try {
        tasks = await extractTasks(body, req.user);
      } catch (err) {
        if (err.message === "AI usage limit reached") {
          return res.status(403).json({ error: err.message });
        }
      }

      for (const t of tasks) {
        const fingerprint = `${t.title}-${t.sourceText}`;

        try {
          const task = await Task.findOneAndUpdate(
            { noteId: note._id, aiFingerprint: fingerprint },
            {
              noteId: note._id,
              userId: req.user._id,
              title: t.title,
              dueAt: isValidDate(t.dueAt) ? new Date(t.dueAt) : null,
              sourceText: t.sourceText,
              aiFingerprint: fingerprint,
            },
            { upsert: true, new: true },
          );

          note.extractedTasks.push(task._id);
        } catch (err) {
          console.error("Task error:", err.message);
        }
      }
      // FIND RELATIONS
      const existingNotes = await Note.find({
        _id: { $ne: note._id },
      });

      const relations = await findRelations(note, existingNotes);

      for (const rel of relations) {
        try {
          await Relation.findOneAndUpdate(
            {
              fromNoteId: note._id,
              toNoteId: rel.toNoteId,
              type: rel.type,
            },
            {
              fromNoteId: note._id,
              toNoteId: rel.toNoteId,
              type: rel.type,
              confidence: rel.confidence,
              userId: req.user._id,
            },
            { upsert: true },
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
    const { body, theme } = req.body;

    if (!body || body.trim() === "") {
      return res.status(400).json({ error: "Body is required" });
    }

    const note = await Note.findOneAndUpdate({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!note) {
      return res.status(404).json({ error: "Note not found" });
    }

    // 1. Update content
    note.body = body;
    note.theme = ["lavender", "mint", "sky", "peach", "gray"].includes(theme)
      ? theme
      : "lavender";
    // 2. Reset AI-related fields
    note.processingStatus = "processing";
    note.aiSummary = "";
    note.tags = [];
    note.extractedTasks = []; // IMPORTANT

    await note.save();

    try {
      // 3. Run AI

      let aiResult;
      try {
        aiResult = await summarizeNote(body, req.user);
      } catch (err) {
        if (err.message === "AI usage limit reached") {
          return res.status(403).json({ error: err.message });
        }
      }
      note.aiSummary = aiResult.summary;
      note.tags = aiResult.tags;
      note.processingStatus = "completed";
      note.aiProcessedAt = new Date();

      // 4. TASK EXTRACTION
      let tasks;
      try {
        tasks = await extractTasks(body, req.user);
      } catch (err) {
        if (err.message === "AI usage limit reached") {
          return res.status(403).json({ error: err.message });
        }
      }

      for (const t of tasks) {
        const fingerprint = `${t.title}-${t.sourceText}`;

        const task = await Task.findOneAndUpdate(
          { noteId: note._id, aiFingerprint: fingerprint },
          {
            noteId: note._id,
            title: t.title,
            dueAt: isValidDate(t.dueAt) ? new Date(t.dueAt) : null,
            sourceText: t.sourceText,
            aiFingerprint: fingerprint,
          },
          { upsert: true, new: true },
        );

        note.extractedTasks.push(task._id);
      }

      // 5. RELATIONS
      const existingNotes = await Note.find({
        _id: { $ne: note._id },
      });

      const relations = await findRelations(note, existingNotes);

      for (const rel of relations) {
        await Relation.findOneAndUpdate(
          {
            fromNoteId: note._id,
            toNoteId: rel.toNoteId,
            type: rel.type,
          },
          {
            fromNoteId: note._id,
            toNoteId: rel.toNoteId,
            type: rel.type,
            confidence: rel.confidence,
          },
          { upsert: true },
        );
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
    const notes = await Note.find({ userId: req.user._id })
      .populate("extractedTasks")
      .sort({
        createdAt: -1,
      });
    res.status(200).json({ notes: notes });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;

function isValidDate(d) {
  return d && !isNaN(new Date(d).getTime());
}
