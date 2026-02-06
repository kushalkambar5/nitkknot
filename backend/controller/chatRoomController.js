import ChatRoom from "../models/chatRoomModel.js";
import User from "../models/userModel.js";
import handleAsyncError from "../middleware/handleAsyncError.js";

// Create Chat Room
export const createChatRoom = handleAsyncError(async (req, res, next) => {
  const { userId } = req.body; // The OTHER user's ID

  if (!userId) {
    return res
      .status(400)
      .json({ success: false, message: "User ID is required" });
  }

  // Check if other user exists
  const otherUser = await User.findById(userId);
  if (!otherUser) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  // Ensure participants are always sorted to prevent duplicates like [A, B] and [B, A]
  const participants = [req.user.id, userId].sort();

  // Check if room already exists
  let chatRoom = await ChatRoom.findOne({ participants });

  if (!chatRoom) {
    chatRoom = await ChatRoom.create({
      participants,
      messages: [],
    });
  }

  res.status(200).json({
    success: true,
    chatRoom,
  });
});

// Send Message
export const sendMessage = handleAsyncError(async (req, res, next) => {
  const { roomId } = req.params;
  const { text } = req.body;

  if (!text) {
    return res
      .status(400)
      .json({ success: false, message: "Message text is required" });
  }

  const chatRoom = await ChatRoom.findById(roomId);

  if (!chatRoom) {
    return res
      .status(404)
      .json({ success: false, message: "Chat room not found" });
  }

  // Check if user is participant
  if (!chatRoom.participants.includes(req.user.id)) {
    return res.status(403).json({ success: false, message: "Not authorized" });
  }

  // Check if active
  if (!chatRoom.isActive) {
    return res
      .status(400)
      .json({ success: false, message: "Chat room is blocked" });
  }

  const newMessage = {
    sender: req.user.id,
    text,
    createdAt: Date.now(),
  };

  chatRoom.messages.push(newMessage);
  chatRoom.lastMessageAt = Date.now();
  await chatRoom.save();

  res.status(200).json({
    success: true,
    message: "Message sent",
    data: newMessage,
  });
});

// Get My Chat Rooms
export const getMyChatRooms = handleAsyncError(async (req, res, next) => {
  const chatRooms = await ChatRoom.find({ participants: req.user.id })
    .populate("participants", "name email profilePics") // Populate basic user details
    .sort({ lastMessageAt: -1 });

  res.status(200).json({
    success: true,
    count: chatRooms.length,
    chatRooms,
  });
});

// Get Single Chat Room
export const getChatRoom = handleAsyncError(async (req, res, next) => {
  const { roomId } = req.params;

  const chatRoom = await ChatRoom.findById(roomId).populate(
    "participants",
    "name email profilePics",
  );

  if (!chatRoom) {
    return res
      .status(404)
      .json({ success: false, message: "Chat room not found" });
  }

  if (!chatRoom.participants.some((p) => p._id.toString() === req.user.id)) {
    return res.status(403).json({ success: false, message: "Not authorized" });
  }

  res.status(200).json({
    success: true,
    chatRoom,
  });
});

// Block Chat Room
export const blockChatRoom = handleAsyncError(async (req, res, next) => {
  const { roomId } = req.params;

  const chatRoom = await ChatRoom.findById(roomId);

  if (!chatRoom) {
    return res
      .status(404)
      .json({ success: false, message: "Chat room not found" });
  }

  if (!chatRoom.participants.includes(req.user.id)) {
    return res.status(403).json({ success: false, message: "Not authorized" });
  }

  chatRoom.isActive = false;
  chatRoom.blockedBy = req.user.id;
  await chatRoom.save();

  res.status(200).json({
    success: true,
    message: "Chat room blocked",
  });
});
