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
      const [ov, qs, notif] = await Promise.all([
        dashboardApi.getOverview(),
        dashboardApi.getQuickStats(),
        dashboardApi.getNotifications(10),
      ]);

      setOverview(ov);
      setQuickStats(qs);
      setNotifications(notif.notifications || []);

      // Pick first school_id from owner overview to fetch analytics
      const schoolId = ov?.schools?.[0]?.school_id ?? null;
      if (schoolId) {
        try {
          const anal = await dashboardApi.getAnalyticsDashboard(
            schoolId,
            rangeMap[range] || 'week',
          );
          setAnalytics(anal);
        } catch {
          // analytics is optional — dashboard still works without it
          setAnalytics(null);
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