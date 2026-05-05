import mongoose from "mongoose";

const DailyDigestSchema = new mongoose.Schema(
  {
    dateKey: {
      type: String,
      required: true,
      unique: true,
    },
    noteIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Note",
      },
    ],
    taskIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Task",
      },
    ],
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    summary: {
      type: String,
      required: true,
    },
    highlights: {
      type: [String],
      default: [],
    },
    focusAreas: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true },
);
export default mongoose.model("DailyDigest", DailyDigestSchema);
