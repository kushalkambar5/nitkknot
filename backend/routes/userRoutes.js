import express from "express";
import rateLimit from "express-rate-limit";
import {
  sendSignupOtp,
  verifySignupOtp,
  sendLoginOtp,
  verifyLoginOtp,
  showProfile,
  showMyProfile,
  showRequests,
  createLike,
  whoLikedMe,
  getMatches,
  getSwipeHistory,
  updateProfile,
  logout,
  upgradeToPremium,
} from "../controller/userController.js";
import upload from "../middleware/uploadMiddleware.js";
import { protect, restrictToPremium } from "../middleware/authMiddleware.js";

const router = express.Router();

// Rate Limiter for Auth
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 requests per windowMs
  message: {
    success: false,
    message: "Too many login/signup attempts, please try again later.",
  },
});

// router.post("/signup/send-otp", sendSignupOtp);
router.post(
  "/signup/send-otp",
  authLimiter,
  upload.array("profilePics", 5),
  sendSignupOtp,
);
router.post("/signup/verify-otp", authLimiter, verifySignupOtp);
router.post("/login/send-otp", authLimiter, sendLoginOtp);
router.post("/login/verify-otp", authLimiter, verifyLoginOtp);
router.get("/profiles", showProfile);
router.get("/me", protect, showMyProfile);
// Routes for Connections Page (Blur logic handled in frontend)
router.get("/requests", protect, showRequests); // Who right swiped me
router.get("/likes", protect, whoLikedMe); // Who liked me
router.get("/matches", protect, getMatches); // Mutual matches
router.get("/history", protect, getSwipeHistory); // My right swipe history
router.put("/update", protect, upload.array("profilePics", 6), updateProfile);
router.post("/logout", logout);
router.post("/upgrade", protect, upgradeToPremium);

export default router;
