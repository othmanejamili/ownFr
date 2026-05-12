// src/services/membersApi.js
import axios from 'axios';

const API = import.meta.env.VITE_API_URL;

export const membersApi = {

  // ── School ─────────────────────────────────────────────────
  // Get the owner's school list (needed to know school_id)
  getMySchools: () =>
    axios.get(`${API}/drivingschool/`).then(r => r.data.results ?? r.data),

  // ── Students ───────────────────────────────────────────────
  // List students in a specific school (paginated)
  getStudents: (schoolId, page = 1, search = '') =>
    axios.get(`${API}/drivingschool/${schoolId}/students/`, {
      params: { page, search: search || undefined },
    }).then(r => r.data),

  // List student profiles (owner sees all in their schools)
  getStudentProfiles: (search = '') =>
    axios.get(`${API}/studentprofile/`, {
      params: { search: search || undefined },
    }).then(r => r.data.results ?? r.data),

  // ── Instructors ────────────────────────────────────────────
  // Instructors are stored as StudentProfile with user__role='I'
  // We fetch all profiles and filter by user role on the backend via school_users
  getInstructors: (schoolId) =>
    axios.get(`${API}/users/school_users/`, {
      params: { role: 'I' },
    }).then(r => r.data.results ?? r.data),

  // ── Register (Step 1) — creates User account ───────────────
  // POST /api/users/register_student/
  // Backend sets role automatically from data['role'] = 'S' or 'I'
  registerMember: (payload) =>
    axios.post(`${API}/users/register_student/`, payload).then(r => r.data),

  // ── Create Profile (Step 2) — links user to school ─────────
  // POST /api/studentprofile/
  createProfile: (payload) =>
    axios.post(`${API}/studentprofile/`, payload).then(r => r.data),

  // ── Update profile ─────────────────────────────────────────
  updateProfile: (profileId, payload) =>
    axios.patch(`${API}/studentprofile/${profileId}/`, payload).then(r => r.data),

  // ── Delete / deactivate ────────────────────────────────────
  deleteProfile: (profileId) =>
    axios.delete(`${API}/studentprofile/${profileId}/`),

  // ── Progress detail ────────────────────────────────────────
  getProgress: (profileId) =>
    axios.get(`${API}/studentprofile/${profileId}/progress/`).then(r => r.data),
};