import mongoose from "mongoose";

const NoteSchema = new mongoose.Schema(
  {
    title: { type: String, trim: true },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    body: { type: String, required: true },
    tags: { type: [String], default: [], index: true },
    aiSummary: { type: String, default: "" },
    userSummary: { type: String, default: "" },
    extractedTasks: [{ type: mongoose.Schema.Types.ObjectId, ref: "Task" }],
    processingStatus: {
      type: String,
      enum: ["idle", "processing", "completed", "failed"],
      default: "idle",
      index: true,
    },
    theme: {
      type: String,
      enum: ["lavender", "mint", "sky", "peach", "gray"],
      default: "lavender",
    },
    aiProcessedAt: { type: Date, default: null },
    lastProcessingError: { type: String, default: "" },
    lastAnalyzedContentHash: { type: String, default: "" },
  },
  { timestamps: true },
);

export default mongoose.model("Note", NoteSchema);
