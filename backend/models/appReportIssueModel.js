import mongoose from "mongoose";

const appReportIssueSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    category: {
      type: String,
      enum: ["Bug", "Feedback", "Feature Request", "Other"],
      required: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
    },
    status: {
      type: String,
      enum: ["Pending", "Reviewed", "Resolved"],
      default: "Pending",
    },
    deviceInfo: {
      type: String, // Optional: e.g., "Android 13, Pixel 7"
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("AppReportIssue", appReportIssueSchema);
