import mongoose from "mongoose";

const ChatRoomSchema = new mongoose.Schema(
  {
    // Exactly 2 users, always stored in sorted order
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],

    // All messages of this chat (short-term app)
    messages: [
      {
        sender: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        text: {
          type: String,
          required: true,
          maxlength: 1000,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // Chat usable or frozen
    isActive: {
      type: Boolean,
      default: true,
    },

    // If chat is blocked, who blocked it
    blockedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // For sorting chat list
    lastMessageAt: {
      type: Date,
    },
  },
  { timestamps: true },
);

// Prevent duplicate chat rooms for same user pair
ChatRoomSchema.index({ participants: 1 }, { unique: true });

export default mongoose.model("ChatRoom", ChatRoomSchema);
