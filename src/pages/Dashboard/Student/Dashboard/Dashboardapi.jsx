// src/pages/StudentDashboard/Dashboardapi.jsx
import axios from 'axios';

const API = import.meta.env.VITE_API_URL;

export const dashboardApi = {
  // GET /api/dashboard/overview/  → _student_dashboard response shape
  getOverview: () =>
    axios.get(`${API}/dashboard/overview/`).then(r => r.data),

  // GET /api/dashboard/quick-stats/  → { stats: { theory_progress, driving_progress, total_hours, achievements } }
  getQuickStats: () =>
    axios.get(`${API}/dashboard/quick-stats/`).then(r => r.data),

  // GET /api/dashboard/notifications/?limit=10
  getNotifications: (limit = 10) =>
    axios.get(`${API}/dashboard/notifications/`, { params: { limit } }).then(r => r.data),
};