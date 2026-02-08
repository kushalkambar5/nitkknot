import rateLimit from "express-rate-limit";

// General Limiter: 100 requests per 15 minutes
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    message:
      "Too many requests from this IP, please try again after 15 minutes",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Auth Limiter: 5 requests per 1 hour (Strict)
export const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    message: "Too many login/signup attempts. Please try again after an hour.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
