import express from "express";
import {
  getChats,
  getMessages,
  sendMessage,
  getChatByUserId,
} from "../controller/chatController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect); // All chat routes require authentication

router.get("/", getChats);
router.get("/user/:userId", getChatByUserId); // Get/Create chat with specific user
router.get("/:chatId/messages", getMessages);
router.post("/:chatId/messages", sendMessage);

export default router;
