import express from "express";
import {
  sendSignupOtp,
  verifySignupOtp,
  sendLoginOtp,
  verifyLoginOtp,
} from "../controller/userController.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

// router.post("/signup/send-otp", sendSignupOtp);
router.post("/signup/send-otp", upload.array("profilePics", 5), sendSignupOtp);
router.post("/signup/verify-otp", verifySignupOtp);
router.post("/login/send-otp", sendLoginOtp);
router.post("/login/verify-otp", verifyLoginOtp);

export default router;
