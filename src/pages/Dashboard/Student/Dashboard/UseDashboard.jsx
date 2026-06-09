// src/pages/StudentDashboard/UseDashboardS.js
import { useState, useEffect, useCallback } from 'react';
import { dashboardApi } from './Dashboardapi';

export const useDashboard = () => {
  const [overview,      setOverview]      = useState(null);
  const [quickStats,    setQuickStats]    = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [ov, qs, notif] = await Promise.all([
        dashboardApi.getOverview(),       // GET /api/dashboard/overview/  → _student_dashboard shape
        dashboardApi.getQuickStats(),     // GET /api/dashboard/quick-stats/
        dashboardApi.getNotifications(10),
      ]);

      setOverview(ov);
      setQuickStats(qs);
      setNotifications(notif.notifications || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return { overview, quickStats, notifications, loading, error, refetch: fetchAll };
};