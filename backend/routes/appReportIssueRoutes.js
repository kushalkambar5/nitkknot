import express from "express";
import { reportIssue } from "../controller/appReportIssueController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Report an issue (Protected Route)
router.post("/", protect, reportIssue);

export default router;
