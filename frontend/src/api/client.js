import axios from "axios";

// Vite dev: proxy sends /api to the Express port (vite.config.js)
const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || "/api",
  timeout: 45000,
});

export const getSummary = () => http.get("/stats/summary");
export const getTopVendors = (limit = 10) => http.get("/stats/top-vendors", { params: { limit } });
export const getCweDistribution = (limit = 12) =>
  http.get("/stats/cwe-distribution", { params: { limit } });
export const getAdditionsByMonth = (limit = 18) =>
  http.get("/stats/additions-by-month", { params: { limit } });
export const getVulnerabilities = (params) => http.get("/vulnerabilities", { params });
export const getVulnerabilityByCve = (cveId) =>
  http.get(`/vulnerabilities/${encodeURIComponent(cveId)}`);

export default http;
