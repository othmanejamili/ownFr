// src/pages/AutomatedMessage/useautomatedmessage.js
import { useState, useEffect, useCallback, useRef } from 'react';
import { automatedMessageAPI } from './Automatedmessageapi';
import { filterMessages, sortMessages } from './Automatedmessageutils';

// ─── Generic async hook ───────────────────────────────────────
// API functions already return r.data, so no .data unwrapping here.

const useAsync = (asyncFn, immediate = true, deps = []) => {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(immediate);
  const [error, setError]     = useState(null);
  const mountedRef            = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const execute = useCallback(async (...args) => {
    setLoading(true);
    setError(null);
    try {
      const result = await asyncFn(...args);         // already r.data
      if (mountedRef.current) setData(result);
      return result;
    } catch (err) {
      const msg = err?.response?.data || err.message || 'Something went wrong';
      if (mountedRef.current) setError(msg);
      throw err;
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => { if (immediate) execute(); }, [execute, immediate]);

  return { data, loading, error, execute, setData };
};

// ─── Automated Messages ───────────────────────────────────────

export const useAutomatedMessages = (initialParams = {}) => {
  const [params, setParams]             = useState(initialParams);
  const [search, setSearch]             = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortConfig, setSortConfig]     = useState({ field: 'scheduled_for', direction: 'desc' });

  const { data, loading, error, execute } = useAsync(
    () => automatedMessageAPI.list(params),
    true,
    [JSON.stringify(params)],
  );

  const messages = data?.results ?? (Array.isArray(data) ? data : []);
  const filtered = filterMessages(messages, { search, status: statusFilter });
  const sorted   = sortMessages(filtered, sortConfig);

  return {
    messages: sorted,
    rawData: data,
    loading,
    error,
    refresh: execute,
    search, setSearch,
    statusFilter, setStatusFilter,
    sortConfig, setSortConfig,
    params, setParams,
    total: filtered.length,
  };
};

export const useAutomatedMessage = (id) => {
  const { data, loading, error, execute } = useAsync(
    () => automatedMessageAPI.retrieve(id),
    !!id,
    [id],
  );
  return { message: data, loading, error, refresh: execute };
};

export const useAutomatedMessageMutations = (onSuccess) => {
  const [saving, setSaving]     = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [mutError, setMutError] = useState(null);

  const wrap = (fn, key = 'saving') => async (...args) => {
    key === 'deleting' ? setDeleting(true) : setSaving(true);
    setMutError(null);
    try {
      const result = await fn(...args);
      return result;
    } catch (err) {
      const msg = err?.response?.data ?? err.message ?? 'Error';
      setMutError(msg);
      throw err;
    } finally {
      key === 'deleting' ? setDeleting(false) : setSaving(false);
    }
  };

  const createMessage  = wrap(async (data)         => { const r = await automatedMessageAPI.create(data);           onSuccess?.('created', r);    return r; });
  const updateMessage  = wrap(async (id, data)      => { const r = await automatedMessageAPI.partialUpdate(id,data); onSuccess?.('updated', r);    return r; });
  const deleteMessage  = wrap(async (id)            => { await automatedMessageAPI.destroy(id);                      onSuccess?.('deleted', {id});         }, 'deleting');
  const cancelMessage  = wrap(async (id)            => { const r = await automatedMessageAPI.cancel(id);             onSuccess?.('cancelled', r);  return r; });
  const sendNow        = wrap(async (id)            => { const r = await automatedMessageAPI.sendNow(id);            onSuccess?.('sent', r);       return r; });
  const reschedule     = wrap(async (id, newTime)   => { const r = await automatedMessageAPI.reschedule(id, { new_time: newTime }); onSuccess?.('rescheduled', r); return r; });
  const bulkCreate     = wrap(async (payload)       => { const r = await automatedMessageAPI.bulkCreate(payload);   onSuccess?.('bulk_created', r); return r; });
  const bulkCancel     = wrap(async (payload)       => { const r = await automatedMessageAPI.bulkCancel(payload);   onSuccess?.('bulk_cancelled', r); return r; });

  return {
    saving, deleting, mutError, setMutError,
    createMessage, updateMessage, deleteMessage,
    cancelMessage, sendNow, reschedule,
    bulkCreate, bulkCancel,
  };
};

export const useMessageStatistics = (params = {}) => {
  const { data, loading, error, execute } = useAsync(
    () => automatedMessageAPI.statistics(params),
    true,
    [JSON.stringify(params)],
  );
  return { stats: data, loading, error, refresh: execute };
};

export const useMessageSummary = () => {
  const { data, loading, error, execute } = useAsync(automatedMessageAPI.summary);
  return { summary: data, loading, error, refresh: execute };
};

export const usePendingMessages = () => {
  const { data, loading, error, execute } = useAsync(automatedMessageAPI.pending);
  return {
    overdue:      data?.overdue  ?? { count: 0, messages: [] },
    upcoming:     data?.upcoming ?? { count: 0, messages: [] },
    totalPending: data?.total_pending ?? 0,
    loading, error, refresh: execute,
  };
};

export const useUpcomingSchedule = (params = {}) => {
  const { data, loading, error, execute } = useAsync(
    () => automatedMessageAPI.upcomingSchedule(params),
    true,
    [JSON.stringify(params)],
  );
  return { schedule: data, loading, error, refresh: execute };
};

