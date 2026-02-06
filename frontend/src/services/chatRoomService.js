import api from "./axiosInstance";

export const getMyChatRooms = () => api.get("/chat");
export const getChatRoom = (roomId) => api.get(`/chat/${roomId}`);
export const createChatRoom = (targetUserId) =>
  api.post("/chat", { targetUserId });
export const sendMessage = (roomId, content) =>
  api.post(`/chat/${roomId}/message`, { content });
export const blockChatRoom = (roomId) => api.put(`/chat/${roomId}/block`);

const chatRoomService = {
  getMyChatRooms,
  getChatRoom,
  createChatRoom,
  sendMessage,
  blockChatRoom,
};

export default chatRoomService;
