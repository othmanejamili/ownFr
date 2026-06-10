// src/services/studentApi.js
import axios from 'axios';

const API = import.meta.env.VITE_API_URL;

export const studentApi = {

  // ── Student Profile ──────────────────────────────────────────
  getMyProfile: () =>
    axios.get(`${API}/studentprofile/my_profile/`).then(r => r.data),

  getProfile: (profileId) =>
    axios.get(`${API}/studentprofile/${profileId}/`).then(r => r.data),

  updateProfile: (profileId, payload) =>
    axios.patch(`${API}/studentprofile/${profileId}/`, payload).then(r => r.data),

  // FormData PATCH (with file upload)
  uploadProfilePicture: (profileId, file) => {
    const form = new FormData();
    form.append('picture_profile', file);
    return axios.patch(`${API}/studentprofile/${profileId}/`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(r => r.data);
  },

  // ── Progress ─────────────────────────────────────────────────
  getProgress: (profileId) =>
    axios.get(`${API}/studentprofile/${profileId}/progress/`).then(r => r.data),

  // ── Performance Prediction ───────────────────────────────────
  getPrediction: (profileId) =>
    axios.get(`${API}/studentprofile/${profileId}/performance_prediction/`).then(r => r.data),

  // ── Achievements ─────────────────────────────────────────────
  getAchievements: (profileId) =>
    axios.get(`${API}/achievement/`, {
      params: { student: profileId },
    }).then(r => r.data.results ?? r.data),

  // ── Attendance ───────────────────────────────────────────────
  getAttendance: (profileId) =>
    axios.get(`${API}/attendance/`, {
      params: { student: profileId },
    }).then(r => r.data.results ?? r.data),
};