// src/pages/AutomatedMessage/automatedmessageapi.js
import axios from "axios";

const API = import.meta.env.VITE_API_URL;

// ── Auth header helper ────────────────────────────────────────
const authHeader = () => {
  const access =
    localStorage.getItem("access") || sessionStorage.getItem("access");
  return access ? { Authorization: `Bearer ${access}` } : {};
};

// ─── Automated Messages ───────────────────────────────────────

export const automatedMessageAPI = {
  // List / CRUD
  list: (params = {}) =>
    axios
      .get(`${API}/automatedmessage/`, { params, headers: authHeader() })
      .then((r) => r.data),


  // ── Custom actions ──────────────────────────────────────────

  myMessages: (params = {}) =>
    axios
      .get(`${API}/automatedmessage/my_messages/`, { params, headers: authHeader() })
      .then((r) => r.data),

  pending: () =>
    axios
      .get(`${API}/automatedmessage/pending/`, { headers: authHeader() })
      .then((r) => r.data),

  sent: (params = {}) =>
    axios
      .get(`${API}/automatedmessage/sent/`, { params, headers: authHeader() })
      .then((r) => r.data),

  failed: () =>
    axios
      .get(`${API}/automatedmessage/failed/`, { headers: authHeader() })
      .then((r) => r.data),

  statistics: (params = {}) =>
    axios
      .get(`${API}/automatedmessage/statistics/`, { params, headers: authHeader() })
      .then((r) => r.data),

  summary: () =>
    axios
      .get(`${API}/automatedmessage/summary/`, { headers: authHeader() })
      .then((r) => r.data),

  upcomingSchedule: (params = {}) =>
    axios
      .get(`${API}/automatedmessage/upcoming_schedule/`, { params, headers: authHeader() })
      .then((r) => r.data),

  cancel: (id) =>
    axios
      .post(`${API}/automatedmessage/${id}/cancel/`, {}, { headers: authHeader() })
      .then((r) => r.data),

};

