import Chat from "../models/chatModel.js";
import Message from "../models/messageModel.js";
import User from "../models/userModel.js";
import handleAsyncError from "../middleware/handleAsyncError.js";

// Get all chats for the current user
export const getChats = handleAsyncError(async (req, res, next) => {
  const userId = req.user.id;

  // Sync: Ensure all matches have a chat
  const user = await User.findById(userId);
  if (user.matches && user.matches.length > 0) {
    for (const matchId of user.matches) {
      const chatExists = await Chat.findOne({
        participants: { $all: [userId, matchId] },
      });
      if (!chatExists) {
        await Chat.create({
          participants: [userId, matchId],
        });
      }
    }
  }

  // Fetch all chats where user is a participant
  const allChats = await Chat.find({ participants: userId })
    .populate("participants", "name profilePics")
    .populate("lastMessage")
    .sort({ updatedAt: -1 });

  // Filter chats to only include those with matched users
  const chats = allChats.filter((chat) => {
    const otherParticipant = chat.participants.find(
      (p) => p._id.toString() !== userId.toString(),
    );
    // If no other participant (shouldn't happen) or other participant is in matches
    return otherParticipant && user.matches.includes(otherParticipant._id);
  });

  res.status(200).json({
    success: true,
    chats,
  });
});

// Get messages for a specific chat
export const getMessages = handleAsyncError(async (req, res, next) => {
  const { chatId } = req.params;

  const messages = await Message.find({ chatId })
    .populate("sender", "name profilePics")
    .sort({ createdAt: 1 });

  res.status(200).json({
    success: true,
    messages,
  });
});

// Send a message
export const sendMessage = handleAsyncError(async (req, res, next) => {
  const { chatId } = req.params;
  const { content } = req.body;
  const senderId = req.user.id;

  let chat = await Chat.findById(chatId);

  if (!chat) {
    return res.status(404).json({ success: false, message: "Chat not found" });
  }

  // Verify participant
  if (!chat.participants.includes(senderId)) {
    return res.status(403).json({
      success: false,
      message: "Not authorized to send message in this chat",
    });
  }

  const newMessage = await Message.create({
    sender: senderId,
    chatId,
    content,
    readBy: [senderId],
  });

  // Update last message in chat
  chat.lastMessage = newMessage._id;
  await chat.save();

  // Populate sender for immediate frontend display if needed
  await newMessage.populate("sender", "name profilePics");

  res.status(201).json({
    success: true,
    message: newMessage,
  });
});

// Create Chat (Internal use mainly, or specific endpoint if needed)
export const createChat = async (userId1, userId2) => {
  // Check if chat exists
  let chat = await Chat.findOne({
    participants: { $all: [userId1, userId2] },
  });

  if (!chat) {
    chat = await Chat.create({
      participants: [userId1, userId2],
    });
  }
  return chat;
};

// Get Chat by User ID (Redirect to existing or create new if matched)
export const getChatByUserId = handleAsyncError(async (req, res, next) => {
  const { userId } = req.params;
  const currentUserId = req.user.id;

  // Check if they are matched?
  const currentUser = await User.findById(currentUserId);
  console.log(`Chat Request - User: ${currentUserId}, Target: ${userId}`);
  console.log(`Matches:`, currentUser.matches);

  const isMatched = currentUser.matches.some((match) => {
    const id = match._id || match;
    return id.toString() === userId.toString();
  });

  if (!isMatched) {
    console.log("Match verification failed");
    return res
      .status(403)
      .json({ success: false, message: "You are not matched with this user." });
  }

  let chat = await Chat.findOne({
    participants: { $all: [currentUserId, userId] },
  }).populate("participants", "name profilePics");

  // If matches exist but no chat (e.g. migration or missed trigger), create it
  if (!chat) {
    chat = await Chat.create({
      participants: [currentUserId, userId],
    });
    await chat.populate("participants", "name profilePics");
  }

  res.status(200).json({
    success: true,
    chat,
  });
});
