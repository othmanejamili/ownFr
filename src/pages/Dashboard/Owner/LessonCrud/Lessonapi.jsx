// src/pages/LessonCrud/Lessonapi.js
import axios from "axios";

const API = import.meta.env.VITE_API_URL;

export const api = {

  // GET /api/lesson/?search=...&lesson_type=T&status=S
  getLessons: (queryString = '') =>
    axios.get(`${API}/lesson/${queryString ? `?${queryString}` : ''}`).then(r => r.data),

  createLesson: (payload) =>
    axios.post(`${API}/lesson/`, payload).then(r => r.data),

  updateLesson: (lessonId, payload) =>
    axios.patch(`${API}/lesson/${lessonId}/`, payload).then(r => r.data),

  deleteLesson: (lessonId) =>
    axios.delete(`${API}/lesson/${lessonId}/`),

  getInstructors: () =>
    axios.get(`${API}/users/school_users/`, {
      params: { role: 'I' },
    }).then(r => r.data.results ?? r.data),

  getSchools: () =>
    axios.get(`${API}/drivingschool/`).then(r => r.data.results ?? r.data),
};