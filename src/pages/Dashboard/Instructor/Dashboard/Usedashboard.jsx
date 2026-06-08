// src/hooks/useDashboard.js
import { useState, useEffect, useCallback } from 'react';
import { dashboardApi } from './Dashboarapi';

export const useDashboard = (range = '7d') => {
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
        dashboardApi.getOverview(),
        dashboardApi.getQuickStats(),
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
  }, [range]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return { overview, quickStats, notifications, loading, error, refetch: fetchAll };
};