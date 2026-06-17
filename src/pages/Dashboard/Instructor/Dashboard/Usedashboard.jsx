// src/hooks/useDashboard.js
import { useState, useEffect, useCallback } from 'react';
import { dashboardApi } from './Dashboarapi';

export const useDashboard = (range = '7d') => {
  const [overview,      setOverview]      = useState(null);
  const [quickStats,    setQuickStats]    = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [weeklyData,    setWeeklyData]    = useState(null);   // ← per-day chart data
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [ov, qs, notif] = await Promise.all([
        dashboardApi.getOverview(),
        dashboardApi.getQuickStats(),
        dashboardApi.getNotifications(10),
      ]);

      setOverview(ov);
      setQuickStats(qs);
      setNotifications(notif.notifications || []);

      // Fetch per-day analytics once we know the school ID (instructor role)
      const schoolId = ov?.school?.id;
      if (schoolId && ov?.dashboard_type === 'instructor') {
        try {
          const analytics = await dashboardApi.getAnalyticsDashboard(schoolId, 'week');
          // analytics.daily_breakdown is expected to be an array like:
          // [{ date: '2025-06-11', scheduled: 5, completed: 4 }, ...]
          if (analytics?.daily_breakdown?.length) {
            setWeeklyData(analytics.daily_breakdown);
          } else if (analytics?.lessons_per_day?.length) {
            // alternate key name the backend might use
            setWeeklyData(analytics.lessons_per_day);
          }
        } catch {
          // analytics fetch failing is non-fatal — chart falls back to aggregate
        }
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  }, [range]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return { overview, quickStats, notifications, weeklyData, loading, error, refetch: fetchAll };
};