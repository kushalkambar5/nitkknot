import User from "../models/userModel.js";
import sendEmail from "../utils/sendEmail.js";
import { generateOTP, hashOTP, verifyOTP } from "../utils/otpUtil.js";
import jwt from "jsonwebtoken";
import handleAsyncError from "../middleware/handleAsyncError.js";

// Helper to create JWT token
const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || "secret_key", {
    expiresIn: process.env.JWT_EXPIRE || "30d",
  });
};

// Parameters confirmed: email, name, branch, year, gender, interestedIn, interests, greenFlags, redFlags, profilePics (files)
// ==================== SIGNUP FLOW ====================

// Send OTP for Signup
export const sendSignupOtp = handleAsyncError(async (req, res, next) => {
  const {
    email,
    name,
    branch,
    year,
    gender,
    interestedIn,
    interests,
    greenFlags,
    redFlags,
    // profilePics, // Taken from req.files instead
  } = req.body;

  // 0. Validate Images
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({
      success: false,
      message: "At least one profile picture is required.",
    });
  }

  // Convert images to Base64
  const profilePics = req.files.map((file) => {
    return `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;
  });

  // 1. Check email domain
  if (!email.endsWith("@nitk.edu.in")) {
    return res.status(400).json({
      success: false,
      message: "Only @nitk.edu.in email addresses are allowed.",
    });
  }

  // 2. Check if user exists
  let user = await User.findOne({ email });

  if (user && user.isVerified) {
    return res.status(400).json({
      success: false,
      message: "User already exists. Please login.",
    });
  }

  // 3. Generate OTP
  const otp = generateOTP();
  const hashedOtp = await hashOTP(otp);
  const otpExpires = Date.now() + 5 * 60 * 1000; // 5 minutes

  // 4. Create or Update user (if unverified)
  if (!user) {
    user = await User.create({
      email,
      name,
      branch,
      year,
      gender,
      interestedIn,
      interests,
      greenFlags,
      redFlags,
      profilePics,
      otpHash: hashedOtp,
      otpExpires,
      isVerified: false,
    });
  } else {
    // User exists but is not verified -> Update OTP and details
    user.name = name;
    user.branch = branch;
    user.year = year;
    user.gender = gender;
    user.interestedIn = interestedIn;
    user.interests = interests;
    user.greenFlags = greenFlags;
    user.redFlags = redFlags;
    user.profilePics = profilePics;
    user.otpHash = hashedOtp;
    user.otpExpires = otpExpires;
    await user.save();
  }

  // 5. Send Email
  const message = `Your OTP for NITK Knot Signup is: ${otp}.\nIt is valid for 5 minutes.`;
  const emailSent = await sendEmail({
    email: user.email,
    subject: "NITK Knot Signup OTP",
    message,
  });

  if (!emailSent) {
    return res.status(500).json({
      success: false,
      message: "Failed to send OTP email. Please try again.",
    });
  }

  res.status(200).json({
    success: true,
    message: `OTP sent to ${user.email}`,
  });
});

// Verify OTP for Signup
export const verifySignupOtp = handleAsyncError(async (req, res, next) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res
      .status(400)
      .json({ success: false, message: "Email and OTP are required" });
  }

  const user = await User.findOne({ email }).select("+otpHash +otpExpires");

  if (!user) {
    return res.status(400).json({ success: false, message: "User not found" });
  }

  if (user.isVerified) {
    return res.status(400).json({
      success: false,
      message: "User already verified. Please login.",
    });
  }

  // Check expiry
  if (user.otpExpires < Date.now()) {
    return res.status(400).json({ success: false, message: "OTP has expired" });
  }

  // Verify OTP
  const isMatch = await verifyOTP(otp, user.otpHash);
  if (!isMatch) {
    return res.status(400).json({ success: false, message: "Invalid OTP" });
  }

  // Success: Clear OTP, set verified, send token
  user.isVerified = true;
  user.otpHash = undefined;
  user.otpExpires = undefined;
  await user.save();

  const token = createToken(user._id);

  res.status(200).json({
    success: true,
    message: "Signup successful",
    token,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role, // assuming optional role
    },
  });
});

// ==================== LOGIN FLOW ====================

// Send OTP for Login
export const sendLoginOtp = handleAsyncError(async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return res
      .status(400)
      .json({ success: false, message: "Email is required" });
  }

  const user = await User.findOne({ email });

  if (!user) {
    return res
      .status(404)
      .json({ success: false, message: "User not found. Please sign up." });
  }

  if (!user.isVerified) {
    return res.status(400).json({
      success: false,
      message: "User exists but not verified. Please complete signup.",
    });
  }

  // Generate OTP
  const otp = generateOTP();
  const hashedOtp = await hashOTP(otp);
  const otpExpires = Date.now() + 5 * 60 * 1000;

  user.otpHash = hashedOtp;
  user.otpExpires = otpExpires;
  await user.save();

  // Send Email
  const message = `Your OTP for NITK Knot Login is: ${otp}.\nIt is valid for 5 minutes.`;
  const emailSent = await sendEmail({
    email: user.email,
    subject: "NITK Knot Login OTP",
    message,
  });

  if (!emailSent) {
    return res.status(500).json({
      success: false,
      message: "Failed to send OTP email. Please try again.",
    });
  }

  res.status(200).json({
    success: true,
    message: `OTP sent to ${user.email}`,
  });
});

// Verify OTP for Login
export const verifyLoginOtp = handleAsyncError(async (req, res, next) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res
      .status(400)
      .json({ success: false, message: "Email and OTP are required" });
  }

  const user = await User.findOne({ email }).select("+otpHash +otpExpires");

  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  // Check expiry
  if (!user.otpExpires || user.otpExpires < Date.now()) {
    return res
      .status(400)
      .json({ success: false, message: "OTP has expired or invalid" });
  }

  // Verify OTP
  const isMatch = await verifyOTP(otp, user.otpHash);
  if (!isMatch) {
    return res.status(400).json({ success: false, message: "Invalid OTP" });
  }

  // Success
  user.otpHash = undefined;
  user.otpExpires = undefined;
  // Ensure isVerified is true on successful login as well (safety)
  user.isVerified = true;
  await user.save();

  const token = createToken(user._id);

  res.status(200).json({
    success: true,
    message: "Login successful",
    token,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
    },
  });
});

// Show All Profiles
export const showProfile = handleAsyncError(async (req, res, next) => {
  const users = await User.find({}).select("name bio profilePics"); // Limit fields

  res.status(200).json({
    success: true,
    count: users.length,
    users,
  });
});

// Show My Profile
export const showMyProfile = handleAsyncError(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  const likesReceivedCount = await User.countDocuments({ likes: req.user.id });

  const userObj = user.toObject();
  userObj.likesReceivedCount = likesReceivedCount;

  res.status(200).json({
    success: true,
    user: userObj,
  });
});

// Show Requests (Who right swiped me)
export const showRequests = handleAsyncError(async (req, res, next) => {
  // Find users where my ID is in their rightSwipes array
  const requests = await User.find({ rightSwipes: req.user.id });

  res.status(200).json({
    success: true,
    count: requests.length,
    users: requests,
  });
});

// Create Like
export const createLike = handleAsyncError(async (req, res, next) => {
  const targetUserId = req.params.id;

  // Prevent self-like
  if (targetUserId === req.user.id) {
    return res.status(400).json({
      success: false,
      message: "You cannot like yourself.",
    });
  }

  // Check if target user exists
  const targetUser = await User.findById(targetUserId);
  if (!targetUser) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  // Add to likes array (using $addToSet to avoid duplicates)
  const user = await User.findByIdAndUpdate(
    req.user.id,
    { $addToSet: { likes: targetUserId } },
    { new: true },
  );

  res.status(200).json({
    success: true,
    message: `You liked ${targetUser.name}`,
    user,
  });
});

// Who Liked Me (Premium)
export const whoLikedMe = handleAsyncError(async (req, res, next) => {
  // Find users who have the current user's ID in their 'likes' array
  const likedBy = await User.find({ likes: req.user.id });

  res.status(200).json({
    success: true,
    count: likedBy.length,
    users: likedBy,
  });
});

// Update Profile
export const updateProfile = handleAsyncError(async (req, res, next) => {
  const {
    name,
    branch,
    year,
    gender,
    interestedIn,
    interests,
    greenFlags,
    redFlags,
    existingPhotos, // Array of URLs to keep
  } = req.body;

  let user = await User.findById(req.user.id);
  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  // Handle Photos: Combine existing kept photos with new uploads
  let finalProfilePics = [];

  // 1. Add existing photos that were kept (passed as JSON string or array)
  if (existingPhotos) {
    // Ensure it's an array (might come as string if FormData logic is tricky)
    const kept = Array.isArray(existingPhotos)
      ? existingPhotos
      : [existingPhotos];
    finalProfilePics.push(...kept);
  } else if (req.body.existingPhotos === undefined) {
    // If client didn't send 'existingPhotos' field at all, assume we keep all?
    // safer to assume we keep none if it's an update form?
    // Actually, standard FormData practice: if not sent, maybe means empty.
    // But let's assume the frontend sends everything effectively.
    // If we are strictly replacing, we typically rely on what's sent.
    // Let's rely on the frontend sending the list of "final" URLs or "indices".
    // Simplified approach: Frontend sends 'profilePics' as files and 'existingPhotos' as URLs.
  }

  // However, form-data arrays can be messy. Let's assume frontend sends:
  // - existingPhotos: [url1, url2]
  // - profilePics: [file1, file2]
  // We just append new files to existing ones? Or replace?
  // The UI suggests re-ordering.
  // For MVP: append new uploads to the provided existingPhotos list.

  if (req.files && req.files.length > 0) {
    const newPics = req.files.map((file) => {
      return `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;
    });
    finalProfilePics.push(...newPics);
  }

  // Update fields
  if (name) user.name = name;
  if (branch) user.branch = branch;
  if (year) user.year = year;
  if (gender) user.gender = gender;
  if (interestedIn) user.interestedIn = interestedIn;
  if (interests) user.interests = interests; // Assuming comma-separated string or array
  if (greenFlags) user.greenFlags = greenFlags;
  if (redFlags) user.redFlags = redFlags;

  // Only update profilePics if we have a definitive list (either existing or new)
  // If both empty, user might be deleting all photos? (Validation rule: need at least 1?)
  if (finalProfilePics.length > 0) {
    user.profilePics = finalProfilePics;
  }

  await user.save();

  res.status(200).json({
    success: true,
    message: "Profile updated successfully",
    user,
  });
});

// Logout
export const logout = (req, res) => {
  res.cookie("token", "none", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
};
