// src/hooks/UseFeedback.jsx
import { useState, useEffect, useCallback, useRef } from 'react';
import {
  fetchAllFeedback,
  fetchLessonFeedback,
  deleteFeedback,
} from './Feedbackapi';
import { computeStats, filterFeedback } from './Feedbackutils';

// ── Main hook ──────────────────────────────────────────────────
export const useFeedback = () => {
  const [rawList,   setRawList]   = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);
  const [deleting,  setDeleting]  = useState(null);   // id being deleted

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
  const handleDelete = useCallback(async (id) => {
    setDeleting(id);
    try {
      await deleteFeedback(id);
      setRawList((prev) => prev.filter((f) => f.id !== id));
      return { success: true };
    } catch (err) {
      return {
        success: false,
        message:
          err.response?.data?.detail ||
          err.response?.data?.error  ||
          'Delete failed.',
      };
    } finally {
      setDeleting(null);
    }
  }, []);

  return {
    // Data
    list: paginated,
    rawList,
    stats,
    loading,
    error,
    deleting,

    // Filters
    search,  setSearch,
    rating,  setRating,
    sortBy,  setSortBy,

    // Pagination
    page, setPage, totalPages, PAGE_SIZE,
    totalFiltered: filtered.length,

    // Actions
    reload: load,
    handleDelete,
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