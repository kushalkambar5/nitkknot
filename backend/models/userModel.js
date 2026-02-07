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
        "OTHER",
      ],
      required: true,
    },

    year: {
      type: Number,
      enum: [1, 2, 3, 4, 5, 6, 7],
      required: true,
    },

    gender: {
      type: String,
      enum: ["MALE", "FEMALE"],
      required: true,
    },

    interestedIn: {
      type: String,
      enum: ["MALE", "FEMALE"],
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

    profilePics: {
      type: [String], // Base64 strings
      default: [],
    },

    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    likesReceived: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    rightSwipes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    rightSwipesReceived: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    // Timestamps for when the user performed right-swipes (used for rate limiting)
    rightSwipeTimestamps: {
      type: [Date],
      default: [],
    },

    leftSwipes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    matches: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    isPremium: {
      type: Boolean,
      default: true,
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
