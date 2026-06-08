// src/pages/ScheduleCrud/Useanalytics.js
import { useState, useEffect, useCallback } from "react";
import {
  fetchDashboard, fetchTrends, fetchAlerts, fetchPredictions,
  fetchSummary, fetchSystemHealth, fetchComparison, fetchSchools,
  generateDaily, refreshAnalytics, bulkGenerate, exportAnalytics,
} from "./Analyticsapi";

// ── Dashboard ─────────────────────────────────────────────────
export function useDashboard(schoolId, dateRange) {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  const load = useCallback(async () => {
    if (!schoolId) {
      setLoading(false);
      setData(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await fetchDashboard(schoolId, dateRange);
      setData(result);
    } catch (e) {
      console.error("Dashboard error:", e);
      // If 404, don't treat as error - use mock data fallback
      if (e.response?.status === 404) {
        setData(null);
      } else {
        setError(e.response?.data?.error || e.message || "Failed to load dashboard");
      }
    } finally {
      setLoading(false);
    }
  }, [schoolId, dateRange]);

  useEffect(() => { load(); }, [load]);

  return { data, loading, error, refetch: load };
}

// ── Trends ────────────────────────────────────────────────────
export function useTrends(schoolId, metric, days) {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  const load = useCallback(async () => {
    if (!schoolId) {
      setLoading(false);
      setData(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await fetchTrends(schoolId, metric, days);
      setData(result);
    } catch (e) {
      console.error("Trends error:", e);
      if (e.response?.status === 404) {
        setData(null);
      } else {
        setError(e.response?.data?.error || e.message || "Failed to load trends");
      }
    } finally {
      setLoading(false);
    }
  }, [schoolId, metric, days]);

  useEffect(() => { load(); }, [load]);

  return { data, loading, error, refetch: load };
}

// ── Alerts ────────────────────────────────────────────────────
export function useAlerts(schoolId, days) {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  const load = useCallback(async () => {
    if (!schoolId) {
      setLoading(false);
      setData(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await fetchAlerts(schoolId, days);
      setData(result);
    } catch (e) {
      console.error("Alerts error:", e);
      if (e.response?.status === 404) {
        setData(null);
      } else {
        setError(e.response?.data?.error || e.message || "Failed to load alerts");
      }
    } finally {
      setLoading(false);
    }
  }, [schoolId, days]);

  useEffect(() => { load(); }, [load]);

  return { data, loading, error, refetch: load };
}

// ── Predictions ───────────────────────────────────────────────
export function usePredictions(schoolId, horizon) {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  const load = useCallback(async () => {
    if (!schoolId) {
      setLoading(false);
      setData(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await fetchPredictions(schoolId, horizon);
      setData(result);
    } catch (e) {
      console.error("Predictions error:", e);
      if (e.response?.status === 404) {
        setData(null);
      } else {
        setError(e.response?.data?.error || e.message || "Failed to load predictions");
      }
    } finally {
      setLoading(false);
    }
  }, [schoolId, horizon]);

  useEffect(() => { load(); }, [load]);

  return { data, loading, error, refetch: load };
}

// ── Summary ───────────────────────────────────────────────────
export function useSummary() {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchSummary();
      setData(result);
    } catch (e) {
      console.error("Summary error:", e);
      if (e.response?.status === 404) {
        setData(null);
      } else {
        setError(e.response?.data?.error || e.message || "Failed to load summary");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return { data, loading, error, refetch: load };
}

// ── System health ─────────────────────────────────────────────
export function useSystemHealth(enabled = false) {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchSystemHealth();
      setData(result);
    } catch (e) {
      console.error("System health error:", e);
      if (e.response?.status === 404) {
        setData(null);
      } else {
        setError(e.response?.data?.error || e.message || "Failed to load system health");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { if (enabled) load(); }, [enabled, load]);

  return { data, loading, error, refetch: load };
}

// ── Comparison ────────────────────────────────────────────────
export function useComparison() {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  const compare = useCallback(async (schoolIds, startDate, endDate) => {
    setLoading(true);
    setError(null);
    setData(null);
    try {
      const res = await fetchComparison(schoolIds, startDate, endDate);
      setData(res);
      return res;
    } catch (e) {
      console.error("Comparison error:", e);
      if (e.response?.status === 404) {
        setData(null);
      } else {
        setError(e.response?.data?.error || e.message || "Failed to compare schools");
      }
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, loading, error, compare };
}

// ── Schools list ──────────────────────────────────────────────
export function useSchools() {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchSchools();
      // Handle paginated response
      const schools = Array.isArray(result) ? result : result?.results ?? [];
      setData(schools);
    } catch (e) {
      console.error("Schools error:", e);
      setError(e.response?.data?.error || e.message || "Failed to load schools");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return { data, loading, error, refetch: load };
}

// ── Mutations ─────────────────────────────────────────────────
export function useAnalyticsMutations() {
  const [saving,     setSaving]     = useState(false);
  const [error,      setError]      = useState(null);
  const [lastResult, setLastResult] = useState(null);

  const clearError = () => setError(null);

  const generate = async (schoolId, date) => {
    setSaving(true);
    setError(null);
    try {
      const res = await generateDaily(schoolId, date);
      setLastResult(res);
      return res;
    } catch (e) {
      const msg = e.response?.data?.error || e.message || "Failed to generate analytics";
      setError(msg);
      throw new Error(msg);
    } finally {
      setSaving(false);
    }
  };

  const refresh = async (id) => {
    setSaving(true);
    setError(null);
    try {
      const res = await refreshAnalytics(id);
      setLastResult(res);
      return res;
    } catch (e) {
      const msg = e.response?.data?.error || e.message || "Failed to refresh analytics";
      setError(msg);
      throw new Error(msg);
    } finally {
      setSaving(false);
    }
  };

  const bulkGen = async (payload) => {
    setSaving(true);
    setError(null);
    try {
      const res = await bulkGenerate(payload);
      setLastResult(res);
      return res;
    } catch (e) {
      const msg = e.response?.data?.error || e.message || "Failed to bulk generate";
      setError(msg);
      throw new Error(msg);
    } finally {
      setSaving(false);
    }
  };

  const exportData = async (schoolId, startDate, endDate, fmt) => {
    setSaving(true);
    setError(null);
    try {
      const res = await exportAnalytics(schoolId, startDate, endDate, fmt);
      setLastResult(res);
      return res;
    } catch (e) {
      const msg = e.response?.data?.error || e.message || "Failed to export data";
      setError(msg);
      throw new Error(msg);
    } finally {
      setSaving(false);
    }
  };

  return { 
    generate, 
    refresh, 
    bulkGen, 
    exportData, 
    saving, 
    error, 
    lastResult, 
    clearError 
  };
}