// ─────────────────────────────────────────────
//  analyticsApi.js  —  /api/schoolanalytics/*
// ─────────────────────────────────────────────
import axios from "axios";

const API = import.meta.env.VITE_API_URL;

// ── CRUD ──────────────────────────────────────────────────────
export const fetchAnalyticsList = (params = {}) =>
  axios.get(`${API}/schoolanalytics/`, { params }).then(r => r.data);

export const fetchAnalyticsRecord = (id) =>
  axios.get(`${API}/schoolanalytics/${id}/`).then(r => r.data);

// ── Dashboard ─────────────────────────────────────────────────
export const fetchDashboard = (schoolId, dateRange = 'month') =>
  axios.get(`${API}/schoolanalytics/dashboard/`, {
    params: { school_id: schoolId, date_range: dateRange },
  }).then(r => r.data);

// ── Trends ────────────────────────────────────────────────────
export const fetchTrends = (schoolId, metric = 'students', days = 30) =>
  axios.get(`${API}/schoolanalytics/trends/`, {
    params: { school_id: schoolId, metric, days },
  }).then(r => r.data);

// ── Alerts ────────────────────────────────────────────────────
export const fetchAlerts = (schoolId, days = 7) =>
  axios.get(`${API}/schoolanalytics/alerts/`, {
    params: { school_id: schoolId, days },
  }).then(r => r.data);

// ── Predictions ───────────────────────────────────────────────
export const fetchPredictions = (schoolId, horizon = 'month') =>
  axios.get(`${API}/schoolanalytics/predictions/`, {
    params: { school_id: schoolId, horizon },
  }).then(r => r.data);

// ── Summary ───────────────────────────────────────────────────
export const fetchSummary = () =>
  axios.get(`${API}/schoolanalytics/summary/`).then(r => r.data);

// ── Generate daily ────────────────────────────────────────────
export const generateDaily = (schoolId, date = null) =>
  axios.post(`${API}/schoolanalytics/generate_daily/`, {
    school_id: schoolId,
    ...(date ? { date } : {}),
  }).then(r => r.data);

// ── Export ────────────────────────────────────────────────────
export const exportAnalytics = (schoolId, startDate, endDate, format = 'json') =>
  axios.get(`${API}/schoolanalytics/export/`, {
    params: { school_id: schoolId, start_date: startDate, end_date: endDate, format },
  }).then(r => r.data);

// ── Comparison ────────────────────────────────────────────────
export const fetchComparison = (schoolIds, startDate, endDate) =>
  axios.get(`${API}/schoolanalytics/comparison/`, {
    params: { school_ids: schoolIds.join(','), start_date: startDate, end_date: endDate },
  }).then(r => r.data);

// ── System health (admin only) ────────────────────────────────
export const fetchSystemHealth = () =>
  axios.get(`${API}/schoolanalytics/system_health/`).then(r => r.data);