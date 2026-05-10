// src/hooks/useDashboard.js
import { useState, useEffect, useCallback } from 'react';
import { dashboardApi } from './Dashboardapi';

export const useDashboard = (range = '7d') => {
  const [overview,      setOverview]      = useState(null);
  const [quickStats,    setQuickStats]    = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [analytics,     setAnalytics]     = useState(null);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState(null);

  // Map range selector → backend date_range param
  const rangeMap = { '7d': 'week', '30d': 'month', '90d': 'year' };

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Parallel fetch — overview + quick stats + notifications
      const [ov, qs, notif] = await Promise.all([
        dashboardApi.getOverview(),
        dashboardApi.getQuickStats(),
        dashboardApi.getNotifications(10),
      ]);

      setOverview(ov);
      setQuickStats(qs);
      setNotifications(notif.notifications || []);

      // If we have a school id, fetch analytics for that school
      const schoolId = ov?.schools?.[0]?.school_id ?? ov?.overview?.total_schools > 0
        ? ov?.schools?.[0]?.school_id
        : null;

      if (schoolId) {
        try {
          const anal = await dashboardApi.getAnalyticsDashboard(
            schoolId,
            rangeMap[range] || 'week',
          );
          setAnalytics(anal);
        } catch {
          // analytics optional — don't fail the whole dashboard
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

  return { overview, quickStats, notifications, analytics, loading, error, refetch: fetchAll };
};