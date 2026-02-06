const handleError = (err, req, res, next) => {
  console.error("Error:", err);

  // Extract error details
  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || "Internal Server Error";
  const errorDetails =
    process.env.NODE_ENV === "production" ? {} : { stack: err.stack };

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const validationErrors = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({
      success: false,
      message: "Validation Error",
      errors: validationErrors,
    });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({
      success: false,
      message: `${field} already exists`,
    });
  }

  // Mongoose cast error
  if (err.name === "CastError") {
    return res.status(400).json({
      success: false,
      message: "Invalid ID format",
    });
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      success: false,
      message: "Invalid token",
    });
  }

  if (err.name === "TokenExpiredError") {
    return res.status(401).json({
      success: false,
      message: "Token has expired",
    });
  }

  // Default error response
  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV !== "production" && { details: errorDetails }),
  });
};

export default handleError;
