import api from "./axiosInstance";

// Auth
export const signupSendOtp = (formData) => {
  // Use FormData for file uploads (axios handles Content-Type automatically if we pass FormData)
  return api.post("/auth/signup/send-otp", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const signupVerifyOtp = (data) =>
  api.post("/auth/signup/verify-otp", data);
export const loginSendOtp = (data) => api.post("/auth/login/send-otp", data);
export const loginVerifyOtp = (data) =>
  api.post("/auth/login/verify-otp", data);

// Profile
export const getMyProfile = () => api.get("/auth/me"); // userRoutes mounts to /auth
export const getRequests = () => api.get("/auth/requests"); // "Who swipes right on me"
export const getLikes = () => api.get("/auth/likes"); // "Who liked me" (Premium)
export const getAllProfiles = () => api.get("/auth/profiles"); // Admin/Debug usage?
export const createLike = (userId) => api.post(`/auth/like/${userId}`);
export const updateProfile = (formData) =>
  api.put("/auth/update", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
export const logout = () => api.post("/auth/logout");
export const upgradeToPremium = () => api.post("/auth/upgrade");
export const getSwipeHistory = () => {
  const token = localStorage.getItem("token");
  return api.get("/history", {
    headers: { Authorization: `Bearer ${token}` },
  });
};

const userService = {
  signupSendOtp,
  signupVerifyOtp,
  loginSendOtp,
  loginVerifyOtp,
  getMyProfile,
  getRequests,
  getLikes,
  getAllProfiles,
  createLike,
  updateProfile,
  logout,
  upgradeToPremium,
  getSwipeHistory,
};

export default userService;
