import api from "./axiosInstance";

export const reportIssue = (data) => api.post("/report-issue", data); // /api/report-issue

const reportService = {
  reportIssue,
};

export default reportService;
