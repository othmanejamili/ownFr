// src/services/dashboardApi.js
import axios from 'axios';

const API = import.meta.env.VITE_API_URL;

export const dashboardApi = {
  // GET /api/dashboard/overview/  → full school owner dashboard data
  getOverview: () =>
    axios.get(`${API}/dashboard/overview/`).then(r => r.data),

  // GET /api/dashboard/quick-stats/  → KPI numbers
  getQuickStats: () =>
    axios.get(`${API}/dashboard/quick-stats/`).then(r => r.data),

  // GET /api/dashboard/notifications/?limit=10
  getNotifications: (limit = 10) =>
    axios.get(`${API}/dashboard/notifications/`, { params: { limit } }).then(r => r.data),

  // GET /api/schoolanalytics/dashboard/?school_id=X&date_range=week
  getAnalyticsDashboard: (schoolId, dateRange = 'week') =>
    axios.get(`${API}/schoolanalytics/dashboard/`, {
      params: { school_id: schoolId, date_range: dateRange },
    }).then(r => r.data),
};