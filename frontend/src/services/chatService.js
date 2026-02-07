import api from "./axiosInstance";

const chatService = {
  getChats: () => api.get("/chats"),
  getMessages: (chatId) => api.get(`/chats/${chatId}/messages`),
  sendMessage: (chatId, content) =>
    api.post(`/chats/${chatId}/messages`, { content }),
  getChatByUserId: (userId) => api.get(`/chats/user/${userId}`),
};

export default chatService;
