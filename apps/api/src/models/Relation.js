import mongoose from "mongoose";

const RelationSchema = new mongoose.Schema(
  {
    fromNoteId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Note",
      required: true,
    },
    toNoteId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Note",
      required: true,
    },
    type: {
      type: String,
      enum: ["reference", "similar", "follow_up"],
      default: "similar",
    },
    confidence: {
      type: Number,
      default: 0.5,
    },
    approved: {
      type: Boolean,
      default: false,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
  },
  { timestamps: true },
);

export default mongoose.model("Relation", RelationSchema);
