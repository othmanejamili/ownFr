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

  retrieve: (id) =>
    axios
      .get(`${API}/automatedmessage/${id}/`, { headers: authHeader() })
      .then((r) => r.data),

  create: (payload) =>
    axios
      .post(`${API}/automatedmessage/`, payload, { headers: authHeader() })
      .then((r) => r.data),

  update: (id, payload) =>
    axios
      .put(`${API}/automatedmessage/${id}/`, payload, { headers: authHeader() })
      .then((r) => r.data),

  partialUpdate: (id, payload) =>
    axios
      .patch(`${API}/automatedmessage/${id}/`, payload, { headers: authHeader() })
      .then((r) => r.data),

  destroy: (id) =>
    axios.delete(`${API}/automatedmessage/${id}/`, { headers: authHeader() }),

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

  sendNow: (id) =>
    axios
      .post(`${API}/automatedmessage/${id}/send_now/`, {}, { headers: authHeader() })
      .then((r) => r.data),

  reschedule: (id, payload) =>
    axios
      .post(`${API}/automatedmessage/${id}/reschedule/`, payload, { headers: authHeader() })
      .then((r) => r.data),

  bulkCreate: (payload) =>
    axios
      .post(`${API}/automatedmessage/bulk_create/`, payload, { headers: authHeader() })
      .then((r) => r.data),

  bulkCancel: (payload) =>
    axios
      .post(`${API}/automatedmessage/bulk_cancel/`, payload, { headers: authHeader() })
      .then((r) => r.data),
};

// ─── Communication Templates ──────────────────────────────────

export const communicationTemplateAPI = {
  // List / CRUD
  list: (params = {}) =>
    axios
      .get(`${API}/communicationtemplate/`, { params, headers: authHeader() })
      .then((r) => r.data),

  retrieve: (id) =>
    axios
      .get(`${API}/communicationtemplate/${id}/`, { headers: authHeader() })
      .then((r) => r.data),

  create: (payload) =>
    axios
      .post(`${API}/communicationtemplate/`, payload, { headers: authHeader() })
      .then((r) => r.data),

  update: (id, payload) =>
    axios
      .put(`${API}/communicationtemplate/${id}/`, payload, { headers: authHeader() })
      .then((r) => r.data),

  partialUpdate: (id, payload) =>
    axios
      .patch(`${API}/communicationtemplate/${id}/`, payload, { headers: authHeader() })
      .then((r) => r.data),

  destroy: (id) =>
    axios.delete(`${API}/communicationtemplate/${id}/`, { headers: authHeader() }),

  // ── Custom actions ──────────────────────────────────────────

  availableVariables: () =>
    axios
      .get(`${API}/communicationtemplate/available_variables/`, { headers: authHeader() })
      .then((r) => r.data),

  byType: (params = {}) =>
    axios
      .get(`${API}/communicationtemplate/by_type/`, { params, headers: authHeader() })
      .then((r) => r.data),

  usageStats: () =>
    axios
      .get(`${API}/communicationtemplate/usage_stats/`, { headers: authHeader() })
      .then((r) => r.data),

  mySchoolTemplates: (params = {}) =>
    axios
      .get(`${API}/communicationtemplate/my_school_templates/`, { params, headers: authHeader() })
      .then((r) => r.data),

  duplicate: (id, payload = {}) =>
    axios
      .post(`${API}/communicationtemplate/${id}/duplicate/`, payload, { headers: authHeader() })
      .then((r) => r.data),

  preview: (id, payload = {}) =>
    axios
      .post(`${API}/communicationtemplate/${id}/preview/`, payload, { headers: authHeader() })
      .then((r) => r.data),

  toggleActive: (id) =>
    axios
      .post(`${API}/communicationtemplate/${id}/toggle_active/`, {}, { headers: authHeader() })
      .then((r) => r.data),
};