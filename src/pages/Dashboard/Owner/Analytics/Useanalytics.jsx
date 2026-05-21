// ─────────────────────────────────────────────
//  useAnalytics.js  —  data hooks
// ─────────────────────────────────────────────
import { useState, useEffect, useCallback } from 'react';
import {
  fetchDashboard, fetchTrends, fetchAlerts,
  fetchPredictions, fetchSummary, generateDaily,
  exportAnalytics,
} from './Analyticsapi';

// ── Generic fetch hook ────────────────────────────────────────
function useFetch(fn, deps = []) {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try { setData(await fn()); }
    catch (e) { setError(e.message); }
    finally { setLoading(false); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => { load(); }, [load]);
  return { data, loading, error, refetch: load };
}

// ── Dashboard ─────────────────────────────────────────────────
export function useDashboard(schoolId, dateRange = 'month') {
  return useFetch(
    () => fetchDashboard(schoolId, dateRange),
    [schoolId, dateRange]
  );
}

// ── Trends ────────────────────────────────────────────────────
export function useTrends(schoolId, metric = 'students', days = 30) {
  return useFetch(
    () => fetchTrends(schoolId, metric, days),
    [schoolId, metric, days]
  );
}

// ── Alerts ────────────────────────────────────────────────────
export function useAlerts(schoolId, days = 7) {
  return useFetch(
    () => fetchAlerts(schoolId, days),
    [schoolId, days]
  );
}

// ── Predictions ───────────────────────────────────────────────
export function usePredictions(schoolId, horizon = 'month') {
  return useFetch(
    () => fetchPredictions(schoolId, horizon),
    [schoolId, horizon]
  );
}

// ── Summary ───────────────────────────────────────────────────
export function useSummary() {
  return useFetch(fetchSummary, []);
}

// ── Mutations ─────────────────────────────────────────────────
export function useAnalyticsMutations() {
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState(null);

  const generate = async (schoolId, date) => {
    setSaving(true); setError(null);
    try { return await generateDaily(schoolId, date); }
    catch (e) { setError(e.message); throw e; }
    finally { setSaving(false); }
  };

  const exportData = async (schoolId, startDate, endDate, format = 'json') => {
    setSaving(true); setError(null);
    try { return await exportAnalytics(schoolId, startDate, endDate, format); }
    catch (e) { setError(e.message); throw e; }
    finally { setSaving(false); }
  };

  return { generate, exportData, saving, error };
}