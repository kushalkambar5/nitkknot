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
router.get("/requests", protect, restrictToPremium, showRequests);
router.post("/like/:id", protect, createLike);

export default router;
