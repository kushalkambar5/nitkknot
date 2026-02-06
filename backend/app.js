import express from "express";
import dotenv from "dotenv";
import handleError from "./utils/handleError.js";

dotenv.config();

const app = express();

// ==================== Middleware ====================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
