import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import handleError from "./utils/handleError.js";
import userRoutes from "./routes/userRoutes.js";
import appReportIssueRoutes from "./routes/appReportIssueRoutes.js";
// import chatRoomRoutes from "./routes/chatRoomRoutes.js"; // Removed dead code
import chatRoutes from "./routes/chatRoutes.js";
import slideRoutes from "./routes/slideRoutes.js";

dotenv.config();

import {
  generalLimiter,
  authLimiter,
} from "./middleware/rateLimitMiddleware.js";

const app = express();

// ==================== Middleware ====================
app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL || "*" })); // Allow all origins for MVP. For production, specify origin.
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

app.use("/", (req, res) => {
  res.send("Server is running");
});

// Apply General Limiter to all API routes
app.use("/api/", generalLimiter);

// Routes
app.use("/api/auth", authLimiter, userRoutes);
app.use("/api/report-issue", appReportIssueRoutes);
// app.use("/api/chatrooms", chatRoomRoutes); // Removed dead code
app.use("/api/chats", chatRoutes);
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
