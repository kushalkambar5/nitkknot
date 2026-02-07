import express from "express";
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
  getSwipeHistory,
  updateProfile,
  logout,
  upgradeToPremium,
} from "../controller/userController.js";
import upload from "../middleware/uploadMiddleware.js";
import { protect, restrictToPremium } from "../middleware/authMiddleware.js";

const router = express.Router();

// router.post("/signup/send-otp", sendSignupOtp);
router.post("/signup/send-otp", upload.array("profilePics", 5), sendSignupOtp);
router.post("/signup/verify-otp", verifySignupOtp);
router.post("/login/send-otp", sendLoginOtp);
router.post("/login/verify-otp", verifyLoginOtp);
router.get("/profiles", showProfile);
router.get("/me", protect, showMyProfile);
// Routes for Connections Page (Blur logic handled in frontend)
router.get("/requests", protect, showRequests); // Who right swiped me
router.get("/likes", protect, whoLikedMe); // Who liked me
router.get("/history", protect, getSwipeHistory); // My right swipe history
router.put("/update", protect, upload.array("profilePics", 6), updateProfile);
router.post("/logout", logout);
router.post("/upgrade", protect, upgradeToPremium);

export default router;
