import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import handleAsyncError from "./handleAsyncError.js";

export const protect = handleAsyncError(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    // Set token from Bearer token in header
    token = req.headers.authorization.split(" ")[1];
  }

  // Make sure token exists
  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: "Not authorized to access this route" });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user to request
    req.user = await User.findById(decoded.id);

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "User belonging to this token no longer exists",
      });
    }

    next();
  } catch (err) {
    return res
      .status(401)
      .json({ success: false, message: "Not authorized to access this route" });
  }
});

// Middleware to restrict access to premium users
export const restrictToPremium = (req, res, next) => {
  if (!req.user || !req.user.isPremium) {
    return res.status(403).json({
      success: false,
      message: "This feature is available for Premium users only.",
    });
  }
  next();
};
