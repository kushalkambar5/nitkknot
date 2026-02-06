import api from "./axiosInstance";

export const getSlides = () => api.get("/slides");
export const rightSwipe = (id) => api.post(`/slides/right-swipe/${id}`);
export const leftSwipe = (id) => api.post(`/slides/left-swipe/${id}`);
export const like = (id) => api.post(`/slides/like/${id}`);
export const report = (id, reason) =>
  api.post(`/slides/report/${id}`, { reason });

const slidesService = {
  getSlides,
  rightSwipe,
  leftSwipe,
  like,
  report,
};

export default slidesService;
