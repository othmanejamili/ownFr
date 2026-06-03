// src/pages/LessonCrud/Lessonapi.js
import axios from "axios";

const API = import.meta.env.VITE_API_URL;

export const api = {

  getLessons: (queryString = '') =>
    axios.get(`${API}/lesson/${queryString ? `?${queryString}` : ''}`).then(r => r.data),

  createLesson: (payload) =>
    axios.post(`${API}/lesson/`, payload).then(r => r.data),

  updateLesson: (lessonId, payload) =>
    axios.patch(`${API}/lesson/${lessonId}/`, payload).then(r => r.data),

  deleteLesson: (lessonId) =>
    axios.delete(`${API}/lesson/${lessonId}/`),

  // NEW — enroll students into a driving lesson
  bulkEnroll: (lessonId, studentIds) =>
    axios.post(`${API}/lesson/${lessonId}/bulk_enroll/`, {
      student_ids: studentIds,
    }).then(r => r.data),

  getInstructors: () =>
    axios.get(`${API}/users/school_users/`, {
      params: { role: 'I' },
    }).then(r => r.data.results ?? r.data),

  getSchools: () =>
    axios.get(`${API}/drivingschool/`).then(r => r.data.results ?? r.data),

  // NEW — fetch active students for a school (for the enroll picker)
  getStudentsBySchool: (schoolId) =>
    axios.get(`${API}/studentprofile/`, {
      params: { school: schoolId, status: 'A' },
    }).then(r => r.data.results ?? r.data),

    // Fetches the schedule for a lesson — maps to GET /api/lesson/{id}/schedule/
    getLessonSchedule: (lessonId) =>
      axios.get(`${API}/lesson/${lessonId}/schedule/`)
        .then(r => r.data)
        .catch(err => {
          // 404 means no schedule yet — return null so EnrollModal handles it gracefully
          if (err?.response?.status === 404) return null;
          throw err;
        }),
  
  // GET /api/schedule/check_student_conflicts/?school=&start_time=&end_time=&lesson_id=
  checkStudentConflicts: ({ school, start_time, end_time, lesson_id }) =>
    axios.get(`${API}/schedule/check_student_conflicts/`, {
      params: { school, start_time, end_time, lesson_id },
    }).then(r => r.data),
};
