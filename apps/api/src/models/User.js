import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    name: { type: String, default: "" },
    picture: { type: String, default: "" },
    passwordHash: { type: String },
    provider: { type: String, enum: ["google", "local"], default: "local" },
    aiUsageCount: { type: Number, default: 0 },
    aiUsageLimit: { type: Number, default: 100 },
    lastUsageReset: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

export default mongoose.model("User", UserSchema);
