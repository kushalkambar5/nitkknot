import AppReportIssue from "../models/appReportIssueModel.js";
import handleAsyncError from "../middleware/handleAsyncError.js";

// Report an Issue
export const reportIssue = handleAsyncError(async (req, res, next) => {
  const { category, description, deviceInfo } = req.body;

  if (!category || !description) {
    return res.status(400).json({
      success: false,
      message: "Category and description are required.",
    });
  }

  const allowedCategories = ["Bug", "Feedback", "Feature Request", "Other"];
  if (!allowedCategories.includes(category)) {
    return res.status(400).json({
      success: false,
      message: `Category must be one of: ${allowedCategories.join(", ")}`,
    });
  }

  const issue = await AppReportIssue.create({
    user: req.user.id,
    category,
    description,
    deviceInfo,
  });

  res.status(201).json({
    success: true,
    message: "Issue reported successfully.",
    issue,
  });
});
