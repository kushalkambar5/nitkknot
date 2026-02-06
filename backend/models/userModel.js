import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

    otpHash: {
      type: String,
      select: false,
    },
    otpExpires: {
      type: Date,
      select: false,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    branch: {
      type: String,
      enum: [
        "CSE",
        "AI",
        "IT",
        "ECE",
        "EEE",
        "MECH",
        "CIVIL",
        "META",
        "MIN",
        "CHEM",
      ],
      required: true,
    },

    year: {
      type: Number,
      enum: [1, 2, 3, 4],
      required: true,
    },

    gender: {
      type: String,
      enum: ["MALE", "FEMALE", "OTHER"],
      required: true,
    },

    interestedIn: {
      type: String,
      enum: ["MALE", "FEMALE", "OTHER"],
      required: true,
    },

    interests: {
      type: [String],
      default: [],
    },

    greenFlags: {
      type: [String],
      default: [],
    },

    redFlags: {
      type: [String],
      default: [],
    },

    profilePics: [
      {
        type: String,
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    rightSwipes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    leftSwipes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    matches: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    isPremium: {
      type: Boolean,
      default: false,
    },

    reportsMade: [
      {
        reportedUser: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        reason: String,
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true },
);

export default mongoose.model("User", UserSchema);
