// src/api/FeedbackApi.jsx
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

// ── Base endpoint ──────────────────────────────────────────────
const BASE = `${API_URL}/feedback`; 


// ── Helper: attach auth header ─────────────────────────────────
const authHeader = () => {
  const token =
    localStorage.getItem('access') || sessionStorage.getItem('access');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// ── 1. List all feedback (school-owner scope applied by backend) ──
export const fetchAllFeedback = async (params = {}) => {
  const { data } = await axios.get(`${BASE}/`, {
    headers: authHeader(),
    params,          // supports: student, lesson, rating, search, ordering
  });
  return data;
};

export const fetchStudentProfile = async () => {
  const { data } = await axios.get(`${API_URL}/users/me/`, {
    headers: authHeader(),
  });
  console.log('Student profile response:', data);
  return data; // expects { id, user, ... }
};

// Fetch lessons the student attended (for the dropdown)
export const fetchAttendedLessons = async () => {
  const { data } = await axios.get(`${API_URL}/attendance/`, {
    headers: authHeader(),
    params: { presence: true },
  });
  const results = Array.isArray(data) ? data : (data.results ?? []);
  
  return results.map((a) => ({
    lesson:      a.lesson,
    lesson_name: a.lesson_name,
    student:     a.student,   // ← add this back
  }));
};

// ── 2. Get a single feedback record ──────────────────────────────
export const fetchFeedbackById = async (id) => {
  const { data } = await axios.get(`${BASE}/${id}/`, {
    headers: authHeader(),
  });
  return data;
};

// ── 4. Lesson feedback with statistics ──────────────────────────
//    GET /api/feedback/lesson_feedback/?lesson_id=<id>
export const fetchLessonFeedback = async (lessonId) => {
  const { data } = await axios.get(`${BASE}/lesson_feedback/`, {
    headers: authHeader(),
    params: { lesson_id: lessonId },
  });
  return data;
};

// ── 6. Rating distribution helper (client-side aggregation) ──────
export const buildRatingDistribution = (feedbackList) => {
  const dist = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  feedbackList.forEach(({ rating }) => {
    if (rating >= 1 && rating <= 5) dist[rating]++;
  });
  const total = feedbackList.length;
  return Object.entries(dist).map(([star, count]) => ({
    star: Number(star),
    count,
    percentage: total ? Math.round((count / total) * 100) : 0,
  }));
};

// ── 3. Create feedback ──────────────────────────────────────────
export const createFeedback = async (payload) => {
  const { data } = await axios.post(`${BASE}/`, payload, {
    headers: authHeader(),
  });
  return data;
};

// ── 5. Update feedback (partial) ──────────────────────────────────
export const updateFeedback = async (id, payload) => {
  const { data } = await axios.patch(`${BASE}/${id}/`, payload, {
    headers: authHeader(),
  });
  return data;
};

export const fetchMyFeedback = async () => {
  const { data } = await axios.get(`${BASE}/my_feedback/`, {
    headers: authHeader(),
  });
  return data.feedback_list ?? [];
};