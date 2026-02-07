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

// Upgrade to Premium (simple toggle for demo/payment integration outside scope)
export const upgradeToPremium = handleAsyncError(async (req, res, next) => {
  const user = req.user;
  if (!user)
    return res
      .status(401)
      .json({ success: false, message: "Not authenticated" });

  if (user.isPremium) {
    return res
      .status(200)
      .json({ success: true, message: "Already a Premier user", user });
  }

  user.isPremium = true;
  await user.save();

  res.status(200).json({ success: true, message: "Upgraded to Premier", user });
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
  // const likesReceivedCount = await User.countDocuments({ likes: req.user.id });

  const userObj = user.toObject();
  userObj.likesReceivedCount = user.likesReceived
    ? user.likesReceived.length
    : 0;

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

  // NEW: Add to targetUser's likesReceived
  await User.findByIdAndUpdate(targetUserId, {
    $addToSet: { likesReceived: req.user.id },
  });

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

// Get Swipe History (Who I right swiped, left swiped, or matched)
export const getSwipeHistory = handleAsyncError(async (req, res, next) => {
  const user = await User.findById(req.user.id)
    .populate("rightSwipes", "name bio profilePics year branch")
    .populate("leftSwipes", "name bio profilePics year branch")
    .populate("matches", "name bio profilePics year branch");

  const historyMap = new Map();

  // 1. Left Swipes (Passed)
  if (user.leftSwipes) {
    user.leftSwipes.forEach((u) => {
      historyMap.set(u._id.toString(), { user: u, type: "Passed" });
    });
  }

  // 2. Right Swipes (Liked)
  if (user.rightSwipes) {
    user.rightSwipes.forEach((u) => {
      historyMap.set(u._id.toString(), { user: u, type: "Liked" });
    });
  }

  // 3. Matches (Overwrite others as this is the highest status)
  if (user.matches) {
    user.matches.forEach((u) => {
      historyMap.set(u._id.toString(), { user: u, type: "Matched" });
    });
  }

  const history = Array.from(historyMap.values());

  res.status(200).json({
    success: true,
    count: history.length,
    users: history,
  });
});

// Update Profile
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

  // 1. Add existing photos that were kept
  if (existingPhotos) {
    // FormData sends arrays with same key as separate entries, but express/body-parser might handle differently
    // If multiple sends as array, if single sends as string.
    const kept = Array.isArray(existingPhotos)
      ? existingPhotos
      : [existingPhotos];
    finalProfilePics.push(...kept);
  }

  // 2. Add new uploads
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

  // Helper to parse comma-separated strings to arrays
  const parseArrayField = (field) => {
    if (!field) return undefined;
    if (Array.isArray(field)) return field;
    return field
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  };

  if (interests) user.interests = parseArrayField(interests);
  if (greenFlags) user.greenFlags = parseArrayField(greenFlags);
  if (redFlags) user.redFlags = parseArrayField(redFlags);

  // Only update profilePics if we have a definitive list (new + existing)
  // If no photos sent (finalProfilePics empty) AND no existingPhotos key was present,
  // it might mean no change intended?
  // But if existingPhotos KEY is present in body (even if empty, though FormData usually omits), it implies update.
  // Ideally, if finalProfilePics is empty but user intended to delete all, we should allow it?
  // Let's assume valid state requires at least 1 photo for a profile usually, but for update:
  if (finalProfilePics.length > 0) {
    user.profilePics = finalProfilePics;
  } else if (
    req.body.existingPhotos !== undefined ||
    (req.files && req.files.length > 0)
  ) {
    // If explicit update attempted but resulted in 0 photos, maybe allow?
    // user.profilePics = []; // Uncomment if we allow 0 photos
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
