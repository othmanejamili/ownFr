// ─────────────────────────────────────────────
//  useSchedule — data fetching + mutations
// ─────────────────────────────────────────────
import { useState, useEffect, useCallback } from 'react';
import { fetchSchedules, fetchMySchedule, fetchUpcoming,
  fetchInstructorAvailability, fetchVehicleAvailability,
  createSchedule, updateSchedule, patchSchedule,
  deleteSchedule, cancelSchedule, rescheduleLesson,
  fetchLessons, fetchInstructors, fetchVehicles,
} from  './Scheduleapi';

export function useSchedules(params = {}) {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchSchedules(params);
      setSchedules(Array.isArray(data) ? data : data.results ?? []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(params)]);

  useEffect(() => { load(); }, [load]);

  return { schedules, loading, error, refetch: load };
}

export function useMySchedule(params = {}) {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchMySchedule(params);
      setData(res);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(params)]);

  useEffect(() => { load(); }, [load]);

  return { data, loading, error, refetch: load };
}

export function useUpcoming() {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    fetchUpcoming()
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return { data, loading, error };
}

export function useInstructorAvailability(instructorId, date, duration) {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  useEffect(() => {
    if (!instructorId || !date) return;
    setLoading(true);
    fetchInstructorAvailability(instructorId, date, duration)
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [instructorId, date, duration]);

  return { data, loading, error };
}

export function useVehicleAvailability(vehicleId, date, duration) {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  useEffect(() => {
    if (!vehicleId || !date) return;
    setLoading(true);
    fetchVehicleAvailability(vehicleId, date, duration)
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [vehicleId, date, duration]);

  return { data, loading, error };
}

export function useScheduleResources() {
  const [lessons,     setLessons]     = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [vehicles,    setVehicles]    = useState([]);
  const [loading,     setLoading]     = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetchLessons({ status: 'S' }),
      fetchInstructors(),
      fetchVehicles({ status: 'available' }),
    ])
      .then(([l, i, v]) => {
        setLessons(Array.isArray(l) ? l : l.results ?? []);
        setInstructors(Array.isArray(i) ? i : i.results ?? []);
        setVehicles(Array.isArray(v) ? v : v.results ?? []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return { lessons, instructors, vehicles, loading };
}

export function useScheduleMutations(refetch) {
  const [saving,   setSaving]   = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error,    setError]    = useState(null);

  const create = async (data) => {
    setSaving(true); setError(null);
    try { const res = await createSchedule(data); refetch?.(); return res; }
    catch (e) { setError(e.message); throw e; }
    finally { setSaving(false); }
  };

  const update = async (id, data) => {
    setSaving(true); setError(null);
    try { const res = await updateSchedule(id, data); refetch?.(); return res; }
    catch (e) { setError(e.message); throw e; }
    finally { setSaving(false); }
  };

  const patch = async (id, data) => {
    setSaving(true); setError(null);
    try { const res = await patchSchedule(id, data); refetch?.(); return res; }
    catch (e) { setError(e.message); throw e; }
    finally { setSaving(false); }
  };

  const remove = async (id) => {
    setDeleting(true); setError(null);
    try { await deleteSchedule(id); refetch?.(); }
    catch (e) { setError(e.message); throw e; }
    finally { setDeleting(false); }
  };

  const cancel = async (id) => {
    setSaving(true); setError(null);
    try { const res = await cancelSchedule(id); refetch?.(); return res; }
    catch (e) { setError(e.message); throw e; }
    finally { setSaving(false); }
  };

  const reschedule = async (id, data) => {
    setSaving(true); setError(null);
    try { const res = await rescheduleLesson(id, data); refetch?.(); return res; }
    catch (e) { setError(e.message); throw e; }
    finally { setSaving(false); }
  };

  return { create, update, patch, remove, cancel, reschedule, saving, deleting, error };
}