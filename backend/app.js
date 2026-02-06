import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import handleError from "./utils/handleError.js";
import userRoutes from "./routes/userRoutes.js";
import appReportIssueRoutes from "./routes/appReportIssueRoutes.js";
import chatRoomRoutes from "./routes/chatRoomRoutes.js";
import slideRoutes from "./routes/slideRoutes.js";

dotenv.config();

const app = express();

// ==================== Middleware ====================
app.use(cors()); // Allow all origins for MVP. For production, specify origin.
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", userRoutes);
app.use("/api/report-issue", appReportIssueRoutes);
app.use("/api/chatrooms", chatRoomRoutes);
app.use("/api/slides", slideRoutes);
// Health check endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({ message: "Server is running" });
});

// ==================== 404 Handler ====================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    path: req.originalUrl,
  });
});

// ==================== Global Error Handler ====================
app.use(handleError);

export default app;
