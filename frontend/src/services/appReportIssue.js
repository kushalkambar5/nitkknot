import api from "./axiosInstance";

export const reportIssue = (category, description, priority) => {
  return api.post("/report-issue", { category, description, priority });
};

const appReportIssueService = {
  reportIssue,
};

export default appReportIssueService;
