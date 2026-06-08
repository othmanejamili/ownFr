// src/services/membersApi.js
import axios from 'axios';

const API = import.meta.env.VITE_API_URL;

export const studentApi = {

  // ── School ──────────────────────────────────────────────────
  getMySchools: () =>
    axios.get(`${API}/drivingschool/`).then(r => r.data.results ?? r.data),

  // ── Student profiles ────────────────────────────────────────
  getStudentProfiles: (search = '') =>
    axios.get(`${API}/studentprofile/`, {
      params: { search: search || undefined },
    }).then(r => r.data.results ?? r.data),

  // Get a single profile by ID
  getProfile: (profileId) =>
    axios.get(`${API}/studentprofile/${profileId}/`).then(r => r.data),

  // ── Register (Step 1) ───────────────────────────────────────
  registerMember: (payload) =>
    axios.post(`${API}/users/register_student/`, payload).then(r => r.data),

  // ── Create / update profile ─────────────────────────────────
  createProfile: (payload) =>
    axios.post(`${API}/studentprofile/`, payload).then(r => r.data),

  // JSON PATCH (no file)
  updateProfile: (profileId, payload) =>
    axios.patch(`${API}/studentprofile/${profileId}/`, payload).then(r => r.data),

  // FormData PATCH (with file upload)
  updateProfileForm: (profileId, formData) =>
    axios.patch(`${API}/studentprofile/${profileId}/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(r => r.data),

  // ── Delete ──────────────────────────────────────────────────
  deleteProfile: (profileId) =>
    axios.delete(`${API}/studentprofile/${profileId}/`),

  // ── Progress ────────────────────────────────────────────────
  // GET /api/studentprofile/{id}/progress/
  getProgress: (profileId) =>
    axios.get(`${API}/studentprofile/${profileId}/progress/`).then(r => r.data),

  // POST /api/studentprofile/{id}/update_progress/
  // payload: { lesson_type: 'T' | 'D', hours_completed: number }
  updateStudentProgress: (profileId, payload) =>
    axios.post(`${API}/studentprofile/${profileId}/update_progress/`, payload).then(r => r.data),

  // GET /api/studentprofile/{id}/performance_prediction/
  getPerformancePrediction: (profileId) =>
    axios.get(`${API}/studentprofile/${profileId}/performance_prediction/`).then(r => r.data),
  // ── Instructors ─────────────────────────────────────────────
  getInstructors: (schoolId) =>
    axios.get(`${API}/users/school_users/`, {
      params: { role: 'I' },
    }).then(r => r.data.results ?? r.data),
};