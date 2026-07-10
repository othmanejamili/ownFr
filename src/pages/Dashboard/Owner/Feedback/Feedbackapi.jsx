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

// ── 2. Get a single feedback record ──────────────────────────────
export const fetchFeedbackById = async (id) => {
  const { data } = await axios.get(`${BASE}/${id}/`, {
    headers: authHeader(),
  });
  return data;
};

// ── 3. Delete feedback (owner can delete feedback in their school) ─
export const deleteFeedback = async (id) => {
  await axios.delete(`${BASE}/${id}/`, { headers: authHeader() });
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

// ── 5. Analytics trends for the school ──────────────────────────
//    GET /api/schoolanalytics/?school=<id>  (or dedicated endpoint)
//    We use the FeedbackViewSet queryset which already scopes to owner.
export const fetchFeedbackTrends = async (schoolId, days = 30) => {
  const { data } = await axios.get(`${API_URL}/api/schoolanalytics/`, {
    headers: authHeader(),
    params: { school: schoolId, days },
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