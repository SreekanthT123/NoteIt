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

    priority: {
      type: String,
      default: "low",
    },

    recurrence: {
      type: String,
      default: "none",
    },

    type: {
      type: String,
      default: "one_time",
    },

  },
  { timestamps: true },
);

export default mongoose.model("Task", TaskSchema);
