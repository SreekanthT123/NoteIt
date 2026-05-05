import mongoose from "mongoose";

const TaskSchema = new mongoose.Schema(
  {
    noteId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Note",
      required: true,
    },

    title: {
      type: String,
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    status: {
      type: String,
      enum: ["todo", "in_progress", "done"],
      default: "todo",
    },

    dueAt: {
      type: Date,
      default: null,
    },

    sourceText: {
      type: String,
      default: "",
    },

    aiFingerprint: {
      type: String,
    },
  },
  { timestamps: true },
);

TaskSchema.index(
  { noteId: 1, aiFingerprint: 1 },
  { unique: true, sparse: true },
);

export default mongoose.model("Task", TaskSchema);
