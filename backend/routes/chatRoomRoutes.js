import express from "express";
import {
  createChatRoom,
  sendMessage,
  getMyChatRooms,
  getChatRoom,
  blockChatRoom,
} from "../controller/chatRoomController.js";
import { protect, restrictToPremium } from "../middleware/authMiddleware.js";

const router = express.Router();

// Apply protection and premium restriction to all routes
router.use(protect);
router.use(restrictToPremium);

router.post("/", restrictToPremium, createChatRoom);
router.post("/:roomId/message", restrictToPremium, sendMessage);
router.get("/", restrictToPremium, getMyChatRooms);
router.get("/:roomId", restrictToPremium, getChatRoom);
router.put("/:roomId/block", restrictToPremium, blockChatRoom);

export default router;
