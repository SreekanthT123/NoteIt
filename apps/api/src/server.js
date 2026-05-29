import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import mongoose from "mongoose";
dotenv.config();
import notesRoutes from "./routes/notes.routes.js";
import tasksRoutes from "./routes/tasks.routes.js";
import digestRoutes from "./routes/digest.routes.js";
import authRoutes from "./routes/auth.routes.js";

const app = express();
app.use(cors({
  origin: process.env.ALLOWED_ORIGIN || "http://localhost:5173",
  credentials: true,
}));
app.use(express.json());

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later." },
});

// Routes
app.use("/notes", notesRoutes);
app.use("/tasks", tasksRoutes);
app.use("/digest", digestRoutes);
app.use("/auth/login", authLimiter);
app.use("/auth/signup", authLimiter);
app.use("/auth/google", authLimiter);
app.use("/auth", authRoutes);

app.get("/", (req, res) => {
  res.send("noteit API is working");
});

const start = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // Drop the legacy aiFingerprint unique index if it still exists
    try {
      await mongoose.connection.collection("tasks").dropIndex("noteId_1_aiFingerprint_1");
      console.log("Dropped legacy aiFingerprint index");
    } catch {
      // Index already gone — ignore
    }

    app.listen(process.env.PORT, () => {
      console.log(`Server is running on port ${process.env.PORT}`);
    });
  } catch (err) {
    console.log(err);
  }
};

start();
