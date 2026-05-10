// src/hooks/useDashboard.js
// Fetches real data from GET /api/dashboard/overview/
// Maps the backend response to exactly what AdminDashboard needs

import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API_URL = `${import.meta.env.VITE_API_URL}`;

const POLL_INTERVAL_MS = 2 * 60 * 1000; // match backend cache TTL (2 min)

/**
 * useDashboard
 * Returns the full platform admin dashboard response, plus
 * derived helpers that plug directly into your existing chart/card components.
 */
const useDashboard = () => {
  const [raw, setRaw]       = useState(null);   // raw API response
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState(null);
  const [lastFetched, setLastFetched] = useState(null);

  const fetch = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setError(null);
    try {
      const { data } = await axios.get(`${API_URL}/dashboard/overview/`);
      setRaw(data);
      setLastFetched(new Date());
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  }, []);

  // initial load
  useEffect(() => { fetch(); }, [fetch]);

  // silent background poll every 2 min
  useEffect(() => {
    const timer = setInterval(() => fetch(true), POLL_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [fetch]);

  // ── Derived / shaped data ────────────────────────────────────

  /** StatCard values — plug straight into your 4 stat cards */
  const stats = raw ? {
    totalSchools:      raw.system_overview.total_schools,
    totalStudents:     raw.system_overview.total_students,
    activeStudents:    raw.system_overview.active_students,
    totalInstructors:  raw.system_overview.total_instructors,
    newSchoolsWeek:    raw.system_overview.new_schools_this_week,
    newStudentsWeek:   raw.system_overview.new_students_this_week,
  } : null;

  /** System health numbers — plug into AlertCard */
  const health = raw ? {
    pendingMessages: raw.platform_metrics.pending_messages,
    failedMessages:  raw.platform_metrics.failed_messages,
    todayTotal:      raw.today_snapshot.total_lessons,
    todayCompleted:  raw.today_snapshot.completed_lessons,
    todayRate:       raw.today_snapshot.completion_rate,
  } : null;

  /** Top schools table rows — replaces your static SCHOOLS array */
  const topSchools = raw
    ? raw.top_performing_schools.map((s, idx) => ({
        rank:     idx + 1,
        id:       s.school__id,
        name:     s.school__name,
        // generate initials from name
        initials: s.school__name
          .split(' ')
          .slice(0, 2)
          .map(w => w[0])
          .join(''),
        pct:      Math.round(parseFloat(s.avg_completion)),
        rating:   Math.round(parseFloat(s.avg_rating)),
        students: s.total_students,
      }))
    : [];

  /** Recent feedback — replaces your static FEEDBACK array */
  const recentFeedback = raw
    ? raw.recent_feedback.map(f => ({
        name:    f.student,
        lesson:  f.lesson,
        rating:  f.rating,
        comment: '',           // backend doesn't return comment text yet
        createdAt: f.created_at,
      }))
    : [];

  /** Platform avg rating */
  const avgRating = raw
    ? raw.platform_metrics.average_rating.toFixed(1)
    : '—';

  /** This-week revenue for topbar / chart label */
  const weekRevenue = raw
    ? raw.this_week.total_revenue
    : 0;

  /** For Topbar "last updated" */
  const lastUpdated = lastFetched
    ? lastFetched.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : 'loading…';

  return {
    loading,
    error,
    raw,
    refetch: () => fetch(false),
    lastUpdated,

    // shaped data
    stats,
    health,
    topSchools,
    recentFeedback,
    avgRating,
    weekRevenue,
  };
};

export default useDashboard;