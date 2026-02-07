import mongoose from "mongoose";

const TempUserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    otpHash: {
      type: String,
      required: true,
    },
    otpExpires: {
      type: Date,
      required: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

export default mongoose.model("TempUser", TempUserSchema);
