// src/pages/ScheduleCrud/ScheduleApi.js
import axios from "axios";

const API = import.meta.env.VITE_API_URL;

// ── Core CRUD ─────────────────────────────────────────────────

export const fetchSchedules = (params = {}) =>
  axios.get(`${API}/schedule/`, { params }).then(r => r.data);

export const fetchSchedule = (id) =>
  axios.get(`${API}/schedule/${id}/`).then(r => r.data);

export const createSchedule = (data) =>
  axios.post(`${API}/schedule/`, data).then(r => r.data);

export const updateSchedule = (id, data) =>
  axios.put(`${API}/schedule/${id}/`, data).then(r => r.data);

export const patchSchedule = (id, data) =>
  axios.patch(`${API}/schedule/${id}/`, data).then(r => r.data);

export const deleteSchedule = (id) =>
  axios.delete(`${API}/schedule/${id}/`).then(r => r.data);

// ── Custom actions ────────────────────────────────────────────

export const fetchMySchedule = (params = {}) =>
  axios.get(`${API}/schedule/my_schedule/`, { params }).then(r => r.data);

export const fetchMyScheduleMobile = (params = {}) =>
  axios.get(`${API}/schedule/my_schedule_mobile/`, { params }).then(r => r.data);

export const fetchUpcoming = () =>
  axios.get(`${API}/schedule/upcoming/`).then(r => r.data);

export const fetchInstructorAvailability = (instructorId, date, duration = 60) =>
  axios.get(`${API}/schedule/instructor_availability/`, {
    params: { instructor_id: instructorId, date, duration },
  }).then(r => r.data);

export const fetchVehicleAvailability = (vehicleId, date, duration = 60) =>
  axios.get(`${API}/schedule/vehicle_availability/`, {
    params: { vehicle_id: vehicleId, date, duration },
  }).then(r => r.data);

export const cancelSchedule = (id) =>
  axios.post(`${API}/schedule/${id}/cancel_schedule/`).then(r => r.data);

export const rescheduleLesson = (id, data) =>
  axios.post(`${API}/schedule/${id}/reschedule/`, data).then(r => r.data);

// ── Supporting resources ──────────────────────────────────────

export const fetchLessons = (params = {}) =>
  axios.get(`${API}/lesson/`, { params }).then(r => r.data);

export const fetchInstructors = () =>
  axios.get(`${API}/users/school_users/`, { params: { role: 'I' } })
    .then(r => r.data.results ?? r.data);

export const fetchVehicles = (params = {}) =>
  axios.get(`${API}/vehicle/`, { params }).then(r => r.data);