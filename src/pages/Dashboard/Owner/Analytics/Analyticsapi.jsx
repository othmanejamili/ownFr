// src/pages/ScheduleCrud/AnalyticsApi.js
import axios from "axios";

const API = "http://127.0.0.1:8000/";

const client = axios.create({ baseURL: API });

client.interceptors.request.use((cfg) => {
  const access =
    localStorage.getItem("access") || sessionStorage.getItem("access");
  if (access) cfg.headers.Authorization = `Bearer ${access}`;
  return cfg;
});

const d = (r) => r.data;

// ── CRUD ──────────────────────────────────────────────────────
export const fetchAnalyticsList    = (params = {}) => client.get("/schoolanalytics/", { params }).then(d);
export const fetchAnalyticsRecord  = (id)           => client.get(`/schoolanalytics/${id}/`).then(d);
export const deleteAnalyticsRecord = (id)           => client.delete(`/schoolanalytics/${id}/`).then(d);

// ── Dashboard ─────────────────────────────────────────────────
export const fetchDashboard = (schoolId, dateRange = "month") =>
  client.get("/schoolanalytics/dashboard/", { params: { school_id: schoolId, date_range: dateRange } }).then(d);

// ── Trends ────────────────────────────────────────────────────
export const fetchTrends = (schoolId, metric = "students", days = 30) =>
  client.get("/schoolanalytics/trends/", { params: { school_id: schoolId, metric, days } }).then(d);

// ── Alerts ────────────────────────────────────────────────────
export const fetchAlerts = (schoolId, days = 7) =>
  client.get("/schoolanalytics/alerts/", { params: { school_id: schoolId, days } }).then(d);

// ── Predictions ───────────────────────────────────────────────
export const fetchPredictions = (schoolId, horizon = "month") =>
  client.get("/schoolanalytics/predictions/", { params: { school_id: schoolId, horizon } }).then(d);

// ── Summary ───────────────────────────────────────────────────
export const fetchSummary = () => client.get("/schoolanalytics/summary/").then(d);

// ── Generate daily ────────────────────────────────────────────
export const generateDaily = (schoolId, date = null) => {
  const payload = { school_id: schoolId };
  if (date) payload.date = date;
  return client.post("/schoolanalytics/generate_daily/", payload).then(d);
};

// ── Refresh a specific record ─────────────────────────────────
export const refreshAnalytics = (id) => client.post(`/schoolanalytics/${id}/refresh/`).then(d);

// ── Bulk generate ─────────────────────────────────────────────
export const bulkGenerate = (payload) => client.post("/schoolanalytics/bulk_generate/", payload).then(d);

// ── Export (CSV or JSON) ──────────────────────────────────────
export const exportAnalytics = (schoolId, startDate, endDate, format = "json") =>
  client.get("/schoolanalytics/export/", {
    params: { school_id: schoolId, start_date: startDate, end_date: endDate, format },
    ...(format === "csv" ? { responseType: "blob" } : {}),
  }).then(d);

// ── Comparison ────────────────────────────────────────────────
export const fetchComparison = (schoolIds, startDate, endDate) =>
  client.get("/schoolanalytics/comparison/", {
    params: { school_ids: schoolIds.join(","), start_date: startDate, end_date: endDate },
  }).then(d);

// ── System health ─────────────────────────────────────────────
export const fetchSystemHealth = () => client.get("/schoolanalytics/system_health/").then(d);

// ── School list ───────────────────────────────────────────────
export const fetchSchools = () => client.get("/drivingschool/").then(d);