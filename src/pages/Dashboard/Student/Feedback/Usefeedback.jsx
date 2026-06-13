// src/hooks/UseFeedback.jsx
import { useState, useEffect, useCallback, useRef } from 'react';
import { computeStats, filterFeedback } from './Feedbackutils';
import {
  fetchAllFeedback,
  fetchLessonFeedback,
  createFeedback,
  updateFeedback,
  fetchMyFeedback,
  fetchAttendedLessons,
     // ← add this
} from './Feedbackapi';
// ── Main hook ──────────────────────────────────────────────────
export const useFeedback = () => {
  const [rawList,   setRawList]   = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);

  // ── Filter / sort state ──────────────────────────────────────
  const [search,  setSearch]  = useState('');
  const [rating,  setRating]  = useState('');
  const [sortBy,  setSortBy]  = useState('-created_at');
  const [page,    setPage]    = useState(1);
  const PAGE_SIZE = 10;

  // ── Fetch all feedback (owner scope enforced by backend) ──────
  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAllFeedback();
      // Handle both paginated { results: [] } and plain []
      setRawList(Array.isArray(data) ? data : (data.results ?? []));
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        err.response?.data?.error  ||
        'Failed to load feedback.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // ── Derived: filtered + sorted list ─────────────────────────
  const filtered = filterFeedback(rawList, { search, rating, sortBy });

  // ── Pagination ───────────────────────────────────────────────
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Reset to page 1 whenever filters change
  const prevSearch = useRef(search);
  const prevRating = useRef(rating);
  useEffect(() => {
    if (prevSearch.current !== search || prevRating.current !== rating) {
      setPage(1);
      prevSearch.current = search;
      prevRating.current = rating;
    }
  }, [search, rating]);

  // ── Stats ────────────────────────────────────────────────────
  const stats = computeStats(rawList);

  // ── Delete ───────────────────────────────────────────────────


  return {
    // Data
    list: paginated,
    rawList,
    stats,
    loading,
    error,

    // Filters
    search,  setSearch,
    rating,  setRating,
    sortBy,  setSortBy,

    // Pagination
    page, setPage, totalPages, PAGE_SIZE,
    totalFiltered: filtered.length,

    // Actions
    reload: load,
  };
};

// ── Lesson-level feedback hook ─────────────────────────────────
export const useLessonFeedback = (lessonId) => {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  const load = useCallback(async () => {
    if (!lessonId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetchLessonFeedback(lessonId);
      setData(res);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        err.response?.data?.error  ||
        'Failed to load lesson feedback.'
      );
    } finally {
      setLoading(false);
    }
  }, [lessonId]);

  useEffect(() => { load(); }, [load]);

  return { data, loading, error, reload: load };
};


export const useStudentFeedback = () => {
  const [rawList, setRawList] = useState([]);
  const [attendedLessons, setAttendedLessons] = useState([]); // ← add this
  const [studentId, setStudentId] = useState(null);   // ← add this
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const [list, lessons] = await Promise.all([
        fetchMyFeedback(),
        fetchAttendedLessons(),
      ]);
      setRawList(list);
      setAttendedLessons(lessons);
      
      if (lessons.length > 0 && lessons[0].student) {
        setStudentId(lessons[0].student);  // ← guard against undefined
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load your feedback.');
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const submit = useCallback(async ({ id, student, lesson, rating, comment }) => {
    setSubmitting(true);
    try {
      const payload = { student, lesson, rating, comment };
      const result = id
        ? await updateFeedback(id, { rating, comment })
        : await createFeedback(payload);
      await load();
      return { ok: true, data: result };
    } catch (err) {
      const detail =
        err.response?.data?.detail ||
        err.response?.data?.error  ||
        Object.values(err.response?.data || {}).flat().join(' ') ||
        'Submission failed.';
      return { ok: false, error: detail };
    } finally { setSubmitting(false); }
  }, [load]);

  const stats = computeStats(rawList);

  return { rawList, attendedLessons, studentId, stats, loading, error, submitting, submit, reload: load };


};