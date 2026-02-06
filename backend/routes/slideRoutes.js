import express from "express";
import {
  sendSlideData,
  rightSwipe,
  leftSwipe,
  like,
  report,
} from "../controller/slideController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// All routes require authentication
router.use(protect);

router.get("/", sendSlideData);
router.post("/right-swipe/:id", rightSwipe);
router.post("/left-swipe/:id", leftSwipe);
router.post("/like/:id", like);
router.post("/report/:id", report);

export default router;
