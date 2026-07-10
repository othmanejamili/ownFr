// src/pages/LessonCrud/Lessonapi.js
import axios from "axios";

const API = import.meta.env.VITE_API_URL;

const authHeader = () => {
  const token =
    localStorage.getItem('access') || sessionStorage.getItem('access');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const api = {

  getLessons: (queryString = '') =>
    axios.get(`${API}/lesson/${queryString ? `?${queryString}` : ''}`, {
      headers: authHeader(),
    }).then(r => r.data),

  createLesson: (payload) =>
    axios.post(`${API}/lesson/`, payload, {
      headers: authHeader(),
    }).then(r => r.data),

  updateLesson: (lessonId, payload) =>
    axios.patch(`${API}/lesson/${lessonId}/`, payload, {
      headers: authHeader(),
    }).then(r => r.data),

  deleteLesson: (lessonId) =>
    axios.delete(`${API}/lesson/${lessonId}/`, {
      headers: authHeader(),
    }),

  bulkEnroll: (lessonId, studentIds) =>
    axios.post(`${API}/lesson/${lessonId}/bulk_enroll/`, {
      student_ids: studentIds,
    }, {
      headers: authHeader(),
    }).then(r => r.data),

  getInstructors: () =>
    axios.get(`${API}/users/school_users/`, {
      headers: authHeader(),
      params: { role: 'I' },
    }).then(r => r.data.results ?? r.data),

  getSchools: () =>
    axios.get(`${API}/drivingschool/`, {
      headers: authHeader(),
    }).then(r => r.data.results ?? r.data),

  // Fixed: accepts optional licenseType filter
  getStudentsBySchool: (schoolId, licenseType) =>
    axios.get(`${API}/studentprofile/`, {
      headers: authHeader(),
      params: {
        school: schoolId,
        status: 'A',
        ...(licenseType && licenseType !== 'A' ? { license_type: licenseType } : {}),
      },
    }).then(r => r.data.results ?? r.data),

  getLessonSchedule: (lessonId) =>
    axios.get(`${API}/lesson/${lessonId}/schedule/`, {
      headers: authHeader(),
    })
      .then(r => r.data)
      .catch(err => {
        if (err?.response?.status === 404) return null;
        throw err;
      }),

  checkStudentConflicts: ({ school, start_time, end_time, lesson_id }) =>
    axios.get(`${API}/schedule/check_student_conflicts/`, {
      headers: authHeader(),
      params: { school, start_time, end_time, lesson_id },
    }).then(r => r.data),
};