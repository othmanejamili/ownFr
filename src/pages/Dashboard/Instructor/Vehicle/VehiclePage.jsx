// src/pages/VehiclePage/VehiclePage.jsx
//
// Full vehicle management — list, create, edit, delete, pictures, maintenance.
// Matches DriveIQ dashboard design system exactly.
//
// APIs used:
//   GET    /api/vehicle/                          → list vehicles
//   POST   /api/vehicle/                          → create vehicle
//   PATCH  /api/vehicle/:id/                      → update vehicle
//   DELETE /api/vehicle/:id/                      → delete vehicle
//   GET    /api/vehicle/statistics/               → stats
//   GET    /api/vehicle/maintenance_due/          → maintenance alerts
//   GET    /api/vehicle/available/                → available only
//   POST   /api/vehicle/:id/upload_pictures/      → upload images
//   DELETE /api/vehicle/:id/delete_picture/       → delete a picture
//   POST   /api/vehicle/:id/set_primary_picture/  → set primary
//   POST   /api/vehicle/:id/schedule_maintenance/ → schedule maint.
//   POST   /api/vehicle/:id/complete_maintenance/ → complete maint.
//   GET    /api/vehicle/:id/history/              → usage history
//   GET    /api/drivingschool/                    → schools (for select)

import { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import Sidebar from '../Dashboard/Sidebar';

const API = import.meta.env.VITE_API_URL;

/* ─── API layer ──────────────────────────────────────────────── */
const vehicleApi = {
  getAll:               (qs = '')   => axios.get(`${API}/vehicle/${qs ? `?${qs}` : ''}`).then(r => r.data),
  create:               (data)      => axios.post(`${API}/vehicle/`, data).then(r => r.data),
  update:               (id, data)  => axios.patch(`${API}/vehicle/${id}/`, data).then(r => r.data),
  remove:               (id)        => axios.delete(`${API}/vehicle/${id}/`),
  statistics:           ()          => axios.get(`${API}/vehicle/statistics/`).then(r => r.data),
  maintenanceDue:       ()          => axios.get(`${API}/vehicle/maintenance_due/`).then(r => r.data),
  available:            ()          => axios.get(`${API}/vehicle/available/`).then(r => r.data),
  uploadPictures:       (id, form)  => axios.post(`${API}/vehicle/${id}/upload_pictures/`, form, { headers: { 'Content-Type': 'multipart/form-data' } }).then(r => r.data),
  deletePicture:        (id, picId) => axios.delete(`${API}/vehicle/${id}/delete_picture/?picture_id=${picId}`).then(r => r.data),
  setPrimaryPicture:    (id, picId) => axios.post(`${API}/vehicle/${id}/set_primary_picture/`, { picture_id: picId }).then(r => r.data),
  scheduleMaintenance:  (id, data)  => axios.post(`${API}/vehicle/${id}/schedule_maintenance/`, data).then(r => r.data),
  completeMaintenance:  (id, data)  => axios.post(`${API}/vehicle/${id}/complete_maintenance/`, data).then(r => r.data),
  history:              (id)        => axios.get(`${API}/vehicle/${id}/history/`).then(r => r.data),
  getSchools:           ()          => axios.get(`${API}/drivingschool/`).then(r => r.data.results ?? r.data),
};

/* ─── Helpers ────────────────────────────────────────────────── */
const cls = (...a) => a.filter(Boolean).join(' ');
const fmtDate = iso => iso ? new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

/* ─── Constants ──────────────────────────────────────────────── */
const STATUSES = {
  available:      { label: 'Available',      cls: 'bg-emerald-500/12 text-emerald-400 border-emerald-500/20' },
  maintenance:    { label: 'Maintenance',    cls: 'bg-amber-500/12 text-amber-400 border-amber-500/20' },
  reserved:       { label: 'Reserved',       cls: 'bg-blue-500/12 text-blue-400 border-blue-500/20' },
  out_of_service: { label: 'Out of Service', cls: 'bg-red-500/12 text-red-400 border-red-500/20' },
};
const TRANSMISSIONS = {
  manual:    { label: 'Manual',    cls: 'bg-violet-600/12 text-violet-400 border-violet-500/20' },
  automatic: { label: 'Automatic', cls: 'bg-teal-500/12 text-teal-400 border-teal-500/20' },
};

/* ─── Icons ──────────────────────────────────────────────────── */
const Icon = {
  plus:     <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><path d="M5.5 1v9M1 5.5h9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>,
  search:   <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><circle cx="5.5" cy="5.5" r="4" stroke="currentColor" strokeWidth="1.3"/><path d="M9 9l2.5 2.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>,
  refresh:  <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M11 6.5A4.5 4.5 0 112 6.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/><path d="M11 3v3.5H7.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  edit:     <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M8.5 1.5l2 2L4 10H2v-2L8.5 1.5z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/></svg>,
  trash:    <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 3h8M5 3V2h2v1M4 3v7h4V3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  close:    <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2 2l9 9M11 2l-9 9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>,
  warn:     <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 2L13 12H1L7 2z" stroke="#f87171" strokeWidth="1.2"/><path d="M7 6v3" stroke="#f87171" strokeWidth="1.2" strokeLinecap="round"/><circle cx="7" cy="10.5" r="0.6" fill="#f87171"/></svg>,
  wrench:   <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M8.5 1.5a3 3 0 00-3 3c0 .4.1.8.2 1.1L2 9.5a1 1 0 001.5 1.5l3.9-3.7c.3.1.7.2 1.1.2a3 3 0 000-6z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/></svg>,
  image:    <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><rect x="1" y="2" width="11" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.2"/><circle cx="4.5" cy="5.5" r="1" stroke="currentColor" strokeWidth="1"/><path d="M1 9l3-3 2.5 2.5L9 6l3 3" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round"/></svg>,
  clock:    <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.2"/><path d="M6 3.5V6l2 1.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  history:  <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M6.5 2a4.5 4.5 0 100 9 4.5 4.5 0 000-9zM2 6.5H1M6.5 2V1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/><path d="M6.5 4.5V6.5l1.5 1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  check:    <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6l3.5 3.5L10 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  car:      <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2.5 9h9M4 9V11M10 9V11M3 9l2-5h4l2 5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/><circle cx="4.5" cy="9" r="0.8" fill="currentColor"/><circle cx="9.5" cy="9" r="0.8" fill="currentColor"/></svg>,
};

/* ─── Primitives ─────────────────────────────────────────────── */
const StatusBadge = ({ s }) => {
  const info = STATUSES[s] || { label: s, cls: 'bg-white/[0.06] text-white/40 border-white/[0.08]' };
  return <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md border ${info.cls}`}>{info.label}</span>;
};

const TransmissionBadge = ({ t }) => {
  const info = TRANSMISSIONS[t] || { label: t, cls: 'bg-white/[0.06] text-white/40 border-white/[0.08]' };
  return <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md border ${info.cls}`}>{info.label}</span>;
};

const MaintenancePill = ({ status }) => {
  if (!status) return <span className="text-[10px] text-white/20">—</span>;
  const isOverdue = status.startsWith('Overdue');
  const isDueSoon = status.startsWith('Due in') && parseInt(status.match(/\d+/)?.[0]) <= 7;
  return (
    <span className={cls(
      'text-[9px] font-semibold',
      isOverdue ? 'text-red-400' : isDueSoon ? 'text-amber-400' : 'text-white/40'
    )}>
      {status}
    </span>
  );
};

const SkeletonRow = () => (
  <tr>{[40, 130, 80, 70, 70, 80, 90, 50].map((w, i) => (
    <td key={i} className="px-4 py-3.5">
      <div className="h-3 rounded-full bg-white/[0.05] animate-pulse" style={{ width: w }} />
    </td>
  ))}</tr>
);

const EmptyState = ({ onAdd }) => (
  <tr><td colSpan={9}>
    <div className="flex flex-col items-center justify-center py-20 gap-5">
      <div className="relative">
        <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/[0.07]
          flex items-center justify-center text-3xl">🚗</div>
        <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-lg bg-blue-600/20
          border border-blue-500/30 flex items-center justify-center text-blue-400">
          {Icon.plus}
        </div>
      </div>
      <div className="text-center">
        <p className="font-sora text-[14px] font-bold text-white/60">No vehicles yet</p>
        <p className="text-[11px] text-white/25 mt-1">Add your first vehicle to the fleet.</p>
      </div>
      <button onClick={onAdd}
        className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500
          rounded-xl text-[12px] font-semibold text-white transition-all">
        {Icon.plus} Add Vehicle
      </button>
    </div>
  </td></tr>
);

/* ─── Form helpers ───────────────────────────────────────────── */
const Field = ({ label, children, error }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-[10px] font-bold text-white/40 tracking-[0.5px] uppercase">{label}</label>
    {children}
    {error && <p className="text-[10px] text-red-400">{error}</p>}
  </div>
);
const inputCls = `w-full bg-white/[0.04] border border-white/[0.08] rounded-xl
  px-3 py-2.5 text-[12px] text-white placeholder:text-white/20
  outline-none focus:border-blue-500/50 focus:bg-white/[0.06] transition-all`;
const selectCls = `w-full bg-[#0B1221] border border-white/[0.08] rounded-xl
  px-3 py-2.5 text-[12px] text-white outline-none focus:border-blue-500/50
  transition-all appearance-none cursor-pointer`;

/* ─── Vehicle Form Modal ─────────────────────────────────────── */
const EMPTY_FORM = {
  school: '', plate_number: '', make: '', model: '',
  year: new Date().getFullYear(), color: '',
  transmission: 'manual', status: 'available',
  last_maintenance: '', next_maintenance: '',
};

const VehicleModal = ({ open, onClose, onSuccess, vehicle, schools }) => {
  const isEdit = !!vehicle;
  const [form,   setForm]   = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [apiErr, setApiErr] = useState('');

  useEffect(() => {
    if (!open) return;
    setErrors({}); setApiErr('');
    if (isEdit && vehicle) {
      setForm({
        school:           vehicle.school || '',
        plate_number:     vehicle.plate_number || '',
        make:             vehicle.make || '',
        model:            vehicle.model || '',
        year:             vehicle.year || new Date().getFullYear(),
        color:            vehicle.color || '',
        transmission:     vehicle.transmission || 'manual',
        status:           vehicle.status || 'available',
        last_maintenance: vehicle.last_maintenance || '',
        next_maintenance: vehicle.next_maintenance || '',
      });
    } else {
      setForm(EMPTY_FORM);
    }
  }, [open, vehicle]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const validate = () => {
    const e = {};
    if (!form.school)        e.school = 'Select a school';
    if (!form.plate_number.trim()) e.plate_number = 'Plate number is required';
    if (!form.make.trim())   e.make = 'Make is required';
    if (!form.model.trim())  e.model = 'Model is required';
    if (!form.year)          e.year = 'Year is required';
    if (form.year < 1990 || form.year > new Date().getFullYear() + 1)
      e.year = 'Year out of range';
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setSaving(true); setApiErr('');
    try {
      const payload = {
        ...form,
        school: Number(form.school),
        year: Number(form.year),
        last_maintenance: form.last_maintenance || null,
        next_maintenance: form.next_maintenance || null,
      };
      const result = isEdit
        ? await vehicleApi.update(vehicle.id, payload)
        : await vehicleApi.create(payload);

      if (result?.id) {
        onSuccess(result, isEdit);
      } else {
        const msg = Object.values(result || {}).flat().join(' ');
        setApiErr(msg || 'Something went wrong');
      }
    } catch (err) {
      const data = err.response?.data;
      setApiErr(data ? Object.values(data).flat().join(' ') : 'Network error.');
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      style={{ background: 'rgba(6,11,24,0.85)', backdropFilter: 'blur(8px)' }}>
      <div className="bg-[#0B1221] border border-white/[0.08] rounded-2xl w-full max-w-[580px]
        shadow-2xl flex flex-col max-h-[90vh]"
        style={{ boxShadow: '0 0 0 1px rgba(255,255,255,0.04), 0 32px 64px rgba(0,0,0,0.6)' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-600/15 border border-blue-500/20
              flex items-center justify-center text-blue-400">{Icon.car}</div>
            <div>
              <h2 className="font-sora text-[14px] font-bold text-white">
                {isEdit ? 'Edit Vehicle' : 'Add Vehicle'}
              </h2>
              <p className="text-[10px] text-white/30">
                {isEdit ? 'Update vehicle details' : 'Register a new vehicle'}
              </p>
            </div>
          </div>
          <button onClick={onClose}
            className="w-7 h-7 rounded-lg bg-white/[0.04] hover:bg-white/[0.08]
              text-white/40 hover:text-white flex items-center justify-center transition-all">
            {Icon.close}
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-6 py-5 flex flex-col gap-4">
          {apiErr && (
            <div className="flex items-start gap-2.5 bg-red-500/[0.07] border border-red-500/20
              rounded-xl px-4 py-3">
              {Icon.warn}
              <p className="text-[11px] text-red-400 leading-relaxed">{apiErr}</p>
            </div>
          )}

          {/* School */}
          <Field label="School" error={errors.school}>
            <select className={selectCls} value={form.school}
              onChange={e => set('school', e.target.value)} disabled={isEdit}>
              <option value="">Select school…</option>
              {schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </Field>

          {/* Make / Model / Year */}
          <div className="grid grid-cols-3 gap-3">
            <Field label="Make" error={errors.make}>
              <input className={inputCls} placeholder="e.g. Toyota"
                value={form.make} onChange={e => set('make', e.target.value)} />
            </Field>
            <Field label="Model" error={errors.model}>
              <input className={inputCls} placeholder="e.g. Corolla"
                value={form.model} onChange={e => set('model', e.target.value)} />
            </Field>
            <Field label="Year" error={errors.year}>
              <input type="number" className={inputCls} placeholder="2022"
                min={1990} max={new Date().getFullYear() + 1}
                value={form.year} onChange={e => set('year', e.target.value)} />
            </Field>
          </div>

          {/* Plate / Color */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Plate Number" error={errors.plate_number}>
              <input className={inputCls} placeholder="e.g. A-12345"
                value={form.plate_number}
                onChange={e => set('plate_number', e.target.value.toUpperCase())} />
            </Field>
            <Field label="Color">
              <input className={inputCls} placeholder="e.g. White"
                value={form.color} onChange={e => set('color', e.target.value)} />
            </Field>
          </div>

          {/* Transmission + Status */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Transmission">
              <div className="grid grid-cols-2 gap-2">
                {['manual', 'automatic'].map(t => (
                  <button key={t} type="button" onClick={() => set('transmission', t)}
                    className={cls(
                      'py-2.5 rounded-xl border text-[11px] font-semibold transition-all capitalize',
                      form.transmission === t
                        ? t === 'manual'
                          ? 'bg-violet-600/20 border-violet-500/40 text-violet-300'
                          : 'bg-teal-600/20 border-teal-500/40 text-teal-300'
                        : 'bg-white/[0.03] border-white/[0.08] text-white/40 hover:text-white/70',
                    )}>
                    {t === 'manual' ? '🕹️' : '🤖'} {t}
                  </button>
                ))}
              </div>
            </Field>
            <Field label="Status">
              <select className={selectCls} value={form.status}
                onChange={e => set('status', e.target.value)}>
                {Object.entries(STATUSES).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </select>
            </Field>
          </div>

          {/* Maintenance dates */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Last Maintenance">
              <input type="date" className={inputCls} style={{ colorScheme: 'dark' }}
                value={form.last_maintenance}
                onChange={e => set('last_maintenance', e.target.value)} />
            </Field>
            <Field label="Next Maintenance">
              <input type="date" className={inputCls} style={{ colorScheme: 'dark' }}
                value={form.next_maintenance}
                onChange={e => set('next_maintenance', e.target.value)} />
            </Field>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/[0.06] flex gap-3">
          <button onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-white/[0.08]
              text-[12px] text-white/50 hover:text-white transition-all">
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={saving}
            className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500
              text-[13px] font-bold text-white transition-all disabled:opacity-50
              flex items-center justify-center gap-2">
            {saving
              ? <><span className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin"/>Saving…</>
              : isEdit ? 'Save Changes' : 'Add Vehicle'}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ─── Delete Dialog ──────────────────────────────────────────── */
const DeleteDialog = ({ open, vehicle, onConfirm, onCancel, loading }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4"
      style={{ background: 'rgba(6,11,24,0.85)', backdropFilter: 'blur(8px)' }}>
      <div className="bg-[#0F1A2E] border border-white/[0.08] rounded-2xl p-6 w-full max-w-[340px]">
        <div className="text-center mb-5">
          <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20
            flex items-center justify-center mx-auto mb-4 text-2xl">🗑️</div>
          <h3 className="font-sora text-[15px] font-bold text-white">Remove vehicle?</h3>
          <p className="text-[12px] text-white/40 mt-2 leading-relaxed">
            <span className="text-white/70 font-semibold">
              {vehicle?.make} {vehicle?.model} · {vehicle?.plate_number}
            </span><br/>This cannot be undone.
          </p>
        </div>
        <div className="flex gap-2.5">
          <button onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl border border-white/[0.08]
              text-[12px] text-white/50 hover:text-white transition-all">
            Cancel
          </button>
          <button onClick={onConfirm} disabled={loading}
            className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500
              text-[13px] font-bold text-white transition-all disabled:opacity-50">
            {loading ? 'Removing…' : 'Remove'}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ─── Maintenance Modal ──────────────────────────────────────── */
const MaintenanceModal = ({ open, vehicle, mode, onClose, onSuccess }) => {
  // mode: 'schedule' | 'complete'
  const [date,  setDate]  = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [err,   setErr]   = useState('');

  useEffect(() => { if (open) { setDate(''); setNotes(''); setErr(''); } }, [open]);

  const handleSubmit = async () => {
    if (!date) { setErr('Date is required'); return; }
    setSaving(true); setErr('');
    try {
      const payload = mode === 'schedule'
        ? { next_maintenance: date, notes }
        : { next_maintenance: date };
      const fn = mode === 'schedule' ? vehicleApi.scheduleMaintenance : vehicleApi.completeMaintenance;
      const result = await fn(vehicle.id, payload);
      onSuccess(result.vehicle || result);
    } catch (e) {
      setErr(e.response?.data?.error || 'Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;
  const isSchedule = mode === 'schedule';

  return (
    <div className="fixed inset-0 z-[65] flex items-center justify-center p-4"
      style={{ background: 'rgba(6,11,24,0.85)', backdropFilter: 'blur(8px)' }}>
      <div className="bg-[#0B1221] border border-white/[0.08] rounded-2xl w-full max-w-[380px] p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center
            bg-amber-500/15 border border-amber-500/20 text-amber-400">
            {Icon.wrench}
          </div>
          <div>
            <h2 className="font-sora text-[14px] font-bold text-white">
              {isSchedule ? 'Schedule Maintenance' : 'Complete Maintenance'}
            </h2>
            <p className="text-[10px] text-white/30">
              {vehicle?.make} {vehicle?.model} · {vehicle?.plate_number}
            </p>
          </div>
          <button onClick={onClose} className="ml-auto w-7 h-7 rounded-lg bg-white/[0.04]
            hover:bg-white/[0.08] text-white/40 hover:text-white flex items-center justify-center transition-all">
            {Icon.close}
          </button>
        </div>

        {err && <p className="text-[11px] text-red-400 mb-3">{err}</p>}

        <div className="flex flex-col gap-3">
          <Field label={isSchedule ? 'Next Maintenance Date' : 'Completion Date'}>
            <input type="date" className={inputCls} style={{ colorScheme: 'dark' }}
              value={date} onChange={e => setDate(e.target.value)} />
          </Field>
          {isSchedule && (
            <Field label="Notes (optional)">
              <textarea className={cls(inputCls, 'resize-none h-16')}
                placeholder="Maintenance notes…"
                value={notes} onChange={e => setNotes(e.target.value)} />
            </Field>
          )}
        </div>

        <div className="flex gap-3 mt-5">
          <button onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-white/[0.08]
              text-[12px] text-white/50 hover:text-white transition-all">
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={saving}
            className={cls(
              'flex-1 py-2.5 rounded-xl text-[13px] font-bold text-white transition-all',
              'disabled:opacity-50 flex items-center justify-center gap-2',
              isSchedule ? 'bg-amber-600 hover:bg-amber-500' : 'bg-emerald-600 hover:bg-emerald-500',
            )}>
            {saving
              ? <><span className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin"/>Saving…</>
              : isSchedule ? 'Schedule' : 'Mark Complete'}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ─── Detail Drawer ──────────────────────────────────────────── */
const VehicleDrawer = ({ vehicle, onClose, onEdit, onMaintenance, onPictures, onHistory, showToast }) => {
  if (!vehicle) return null;

  return (
    <>
      <div className="fixed inset-0 z-[50]" onClick={onClose}
        style={{ background: 'rgba(6,11,24,0.5)' }} />
      <div className="fixed right-0 top-0 h-full w-[360px] z-[55]
        bg-[#0B1221] border-l border-white/[0.07] flex flex-col"
        style={{ boxShadow: '-24px 0 64px rgba(0,0,0,0.4)' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
          <span className="font-sora text-[13px] font-bold text-white">Vehicle Details</span>
          <button onClick={onClose}
            className="w-7 h-7 rounded-lg bg-white/[0.04] hover:bg-white/[0.08]
              text-white/40 hover:text-white flex items-center justify-center transition-all">
            {Icon.close}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
          {/* Hero card */}
          <div className="bg-blue-600/08 border border-blue-500/15 rounded-2xl p-5">
            {vehicle.primary_thumbnail ? (
              <img src={vehicle.primary_thumbnail} alt={vehicle.plate_number}
                className="w-full h-36 object-cover rounded-xl mb-3" />
            ) : (
              <div className="w-full h-28 rounded-xl bg-white/[0.04] border border-white/[0.07]
                flex items-center justify-center text-4xl mb-3">🚗</div>
            )}
            <p className="font-sora text-[17px] font-black text-white">
              {vehicle.make} {vehicle.model}
            </p>
            <p className="text-[11px] text-white/40 mt-0.5 mb-3">{vehicle.plate_number} · {vehicle.year}</p>
            <div className="flex items-center gap-2 flex-wrap">
              <StatusBadge s={vehicle.status} />
              <TransmissionBadge t={vehicle.transmission} />
              {vehicle.color && (
                <span className="text-[9px] font-bold px-2 py-0.5 rounded-md border
                  bg-white/[0.04] text-white/40 border-white/[0.07]">
                  {vehicle.color}
                </span>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'School',      value: vehicle.school_name },
              { label: 'Age',         value: vehicle.vehicle_age != null ? `${vehicle.vehicle_age}y` : '—' },
              { label: 'Last Maint.', value: fmtDate(vehicle.last_maintenance) },
              { label: 'Next Maint.', value: fmtDate(vehicle.next_maintenance) },
            ].map(s => (
              <div key={s.label}
                className="bg-white/[0.03] border border-white/[0.06] rounded-xl px-3 py-2.5">
                <p className="text-[9px] text-white/25 uppercase tracking-[0.5px]">{s.label}</p>
                <p className="text-[12px] font-semibold text-white mt-0.5">{s.value || '—'}</p>
              </div>
            ))}
          </div>

          {/* Maintenance status */}
          {vehicle.maintenance_status && (
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3
              flex items-center justify-between">
              <span className="text-[10px] text-white/30">Maintenance Status</span>
              <MaintenancePill status={vehicle.maintenance_status} />
            </div>
          )}

          {/* Images summary */}
          {vehicle.images_summary && (
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3
              flex items-center justify-between">
              <span className="text-[10px] text-white/30">Photos</span>
              <span className="text-[12px] font-semibold text-white">
                {vehicle.images_summary.total_images} / 15
              </span>
            </div>
          )}

          {/* Quick actions */}
          <div className="flex flex-col gap-2">
            <p className="text-[9px] font-bold text-white/25 uppercase tracking-[0.6px]">Actions</p>
            <button onClick={() => { onClose(); onEdit(vehicle); }}
              className="flex items-center gap-2 w-full py-2.5 px-4 rounded-xl
                bg-blue-600/10 border border-blue-500/20 text-blue-400 hover:bg-blue-600/20
                text-[12px] font-semibold transition-all">
              {Icon.edit} Edit Vehicle
            </button>
            <button onClick={() => onPictures(vehicle)}
              className="flex items-center gap-2 w-full py-2.5 px-4 rounded-xl
                bg-violet-600/10 border border-violet-500/20 text-violet-400 hover:bg-violet-600/20
                text-[12px] font-semibold transition-all">
              {Icon.image} Manage Photos
            </button>
            <button onClick={() => onMaintenance(vehicle, 'schedule')}
              className="flex items-center gap-2 w-full py-2.5 px-4 rounded-xl
                bg-amber-600/10 border border-amber-500/20 text-amber-400 hover:bg-amber-600/20
                text-[12px] font-semibold transition-all">
              {Icon.wrench} Schedule Maintenance
            </button>
            {vehicle.status === 'maintenance' && (
              <button onClick={() => onMaintenance(vehicle, 'complete')}
                className="flex items-center gap-2 w-full py-2.5 px-4 rounded-xl
                  bg-emerald-600/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-600/20
                  text-[12px] font-semibold transition-all">
                {Icon.check} Mark Maintenance Done
              </button>
            )}
            <button onClick={() => onHistory(vehicle)}
              className="flex items-center gap-2 w-full py-2.5 px-4 rounded-xl
                bg-white/[0.03] border border-white/[0.07] text-white/40 hover:text-white
                hover:bg-white/[0.06] text-[12px] font-semibold transition-all">
              {Icon.history} View Usage History
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

/* ─── Pictures Modal ─────────────────────────────────────────── */
/* ─── Pictures Modal ─────────────────────────────────────────── */
const PicturesModal = ({ open, vehicle, onClose, showToast }) => {
  const [pictures,  setPictures]  = useState([]);
  const [loading,   setLoading]   = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editing,   setEditing]   = useState(null);   // { id, caption }
  const [err,       setErr]       = useState('');
  const fileRef    = useRef();
  const replaceRef = useRef();
  const [replaceId, setReplaceId] = useState(null);

  /* ── fetch via dedicated endpoint ── */
  const fetchPictures = useCallback(async () => {
    if (!vehicle) return;
    setLoading(true); setErr('');
    try {
      const data = await axios
        .get(`${API}/vehicle/${vehicle.id}/pictures/`)
        .then(r => r.data);
      setPictures(data.pictures || []);
    } catch { setErr('Failed to load pictures'); }
    finally   { setLoading(false); }
  }, [vehicle]);

  useEffect(() => { if (open) { setPictures([]); setEditing(null); fetchPictures(); } }, [open, fetchPictures]);

  /* ── upload new ── */
  const handleUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setUploading(true); setErr('');
    try {
      const form = new FormData();
      files.forEach(f => form.append('images', f));
      await vehicleApi.uploadPictures(vehicle.id, form);
      showToast('Photos uploaded');
      fetchPictures();
    } catch (ex) {
      setErr(ex.response?.data?.error || 'Upload failed');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  /* ── replace a single picture ── */
  const handleReplace = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !replaceId) return;
    setErr('');
    try {
      // Delete old, then upload replacement
      await vehicleApi.deletePicture(vehicle.id, replaceId);
      const form = new FormData();
      form.append('images', file);
      await vehicleApi.uploadPictures(vehicle.id, form);
      showToast('Photo replaced');
      fetchPictures();
    } catch (ex) {
      setErr(ex.response?.data?.error || 'Replace failed');
    } finally {
      setReplaceId(null);
      e.target.value = '';
    }
  };

  /* ── save caption edit ── */
  const handleSaveCaption = async () => {
    if (!editing) return;
    try {
      await axios.patch(
        `${API}/vehicle/${vehicle.id}/pictures/${editing.id}/`,
        { caption: editing.caption }
      );
      setPictures(p => p.map(x => x.id === editing.id ? { ...x, caption: editing.caption } : x));
      showToast('Caption updated');
      setEditing(null);
    } catch {
      showToast('Failed to update caption', 'error');
    }
  };

  /* ── delete ── */
  const handleDelete = async (picId) => {
    try {
      await vehicleApi.deletePicture(vehicle.id, picId);
      setPictures(p => p.filter(x => x.id !== picId));
      showToast('Photo removed');
    } catch { showToast('Failed to remove photo', 'error'); }
  };

  /* ── set primary ── */
  const handleSetPrimary = async (picId) => {
    try {
      await vehicleApi.setPrimaryPicture(vehicle.id, picId);
      setPictures(p => p.map(x => ({ ...x, is_primary: x.id === picId })));
      showToast('Primary photo updated');
    } catch { showToast('Failed to update primary', 'error'); }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[65] flex items-center justify-center p-4"
      style={{ background: 'rgba(6,11,24,0.85)', backdropFilter: 'blur(8px)' }}>
      <div className="bg-[#0B1221] border border-white/[0.08] rounded-2xl w-full max-w-[680px]
        shadow-2xl flex flex-col max-h-[85vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-violet-600/15 border border-violet-500/20
              flex items-center justify-center text-violet-400">{Icon.image}</div>
            <div>
              <h2 className="font-sora text-[14px] font-bold text-white">Vehicle Photos</h2>
              <p className="text-[10px] text-white/30">
                {vehicle?.make} {vehicle?.model} · {pictures.length}/15 photos
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Upload new photos button */}
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading || pictures.length >= 15}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-600/20 border
                border-violet-500/30 rounded-lg text-[11px] font-semibold text-violet-300
                hover:bg-violet-600/30 transition-all disabled:opacity-40">
              {uploading
                ? <span className="w-3 h-3 rounded-full border-2 border-violet-300/30 border-t-violet-300 animate-spin" />
                : Icon.plus}
              Upload
            </button>
            <button onClick={onClose}
              className="w-7 h-7 rounded-lg bg-white/[0.04] hover:bg-white/[0.08]
                text-white/40 hover:text-white flex items-center justify-center transition-all">
              {Icon.close}
            </button>
          </div>
        </div>

        {/* Hidden file inputs */}
        <input ref={fileRef}    type="file" accept="image/*" multiple className="hidden" onChange={handleUpload} />
        <input ref={replaceRef} type="file" accept="image/*"           className="hidden" onChange={handleReplace} />

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">

          {err && (
            <div className="flex items-center gap-2 bg-red-500/[0.07] border border-red-500/20
              rounded-xl px-4 py-2.5">
              {Icon.warn}
              <p className="text-[11px] text-red-400">{err}</p>
            </div>
          )}

          {/* Caption edit inline banner */}
          {editing && (
            <div className="flex items-center gap-3 bg-blue-600/10 border border-blue-500/20
              rounded-xl px-4 py-3">
              <span className="text-[10px] text-blue-400 font-bold uppercase tracking-wide flex-shrink-0">
                Editing caption
              </span>
              <input
                className={cls(inputCls, 'flex-1 py-1.5')}
                value={editing.caption}
                onChange={e => setEditing(ed => ({ ...ed, caption: e.target.value }))}
                onKeyDown={e => { if (e.key === 'Enter') handleSaveCaption(); if (e.key === 'Escape') setEditing(null); }}
                autoFocus
              />
              <button onClick={handleSaveCaption}
                className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-500
                  rounded-lg text-[11px] font-bold text-white transition-all flex-shrink-0">
                {Icon.check} Save
              </button>
              <button onClick={() => setEditing(null)}
                className="w-7 h-7 rounded-lg bg-white/[0.04] hover:bg-white/[0.08]
                  text-white/40 hover:text-white flex items-center justify-center transition-all flex-shrink-0">
                {Icon.close}
              </button>
            </div>
          )}

          {/* Grid */}
          {loading ? (
            <div className="grid grid-cols-3 gap-3">
              {Array(6).fill(0).map((_, i) => (
                <div key={i} className="h-36 rounded-xl bg-white/[0.04] animate-pulse" />
              ))}
            </div>
          ) : pictures.length === 0 ? (
            /* Empty drop zone */
            <button
              onClick={() => fileRef.current?.click()}
              className="w-full border-2 border-dashed border-white/[0.08] rounded-2xl
                py-14 flex flex-col items-center gap-3 hover:border-violet-500/40
                hover:bg-violet-600/05 transition-all cursor-pointer">
              <span className="text-3xl">📷</span>
              <p className="text-[12px] font-semibold text-white/50">No photos yet — click to upload</p>
              <p className="text-[10px] text-white/25">JPG, PNG, WEBP · Max 10 MB each</p>
            </button>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {pictures.map(pic => (
                <div key={pic.id}
                  className={cls(
                    'relative group rounded-xl overflow-hidden border transition-all',
                    editing?.id === pic.id
                      ? 'border-blue-500/50 ring-1 ring-blue-500/30'
                      : 'border-white/[0.06]',
                  )}>

                  {/* Image */}
                  <img
                    src={pic.thumbnail_url || pic.image_url || pic.image}
                    alt={pic.caption || 'Vehicle photo'}
                    className="w-full h-36 object-cover"
                  />

                  {/* Primary badge */}
                  {pic.is_primary && (
                    <span className="absolute top-2 left-2 text-[8px] font-bold px-1.5 py-0.5
                      rounded-md bg-blue-600 text-white z-10">PRIMARY</span>
                  )}

                  {/* Caption strip */}
                  <div className="px-2.5 py-2 bg-[#0B1221]">
                    <p className="text-[10px] text-white/40 truncate">
                      {pic.caption || <span className="italic text-white/20">No caption</span>}
                    </p>
                  </div>

                  {/* Hover action overlay */}
                  <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100
                    transition-opacity flex flex-col items-center justify-center gap-2 px-2">

                    {/* Row 1: primary + edit caption */}
                    <div className="flex items-center gap-1.5">
                      {!pic.is_primary && (
                        <button onClick={() => handleSetPrimary(pic.id)}
                          title="Set as primary"
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg
                            bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-semibold
                            transition-colors">
                          ⭐ Primary
                        </button>
                      )}
                      <button
                        onClick={() => setEditing({ id: pic.id, caption: pic.caption || '' })}
                        title="Edit caption"
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg
                          bg-white/[0.15] hover:bg-white/[0.25] text-white text-[10px] font-semibold
                          transition-colors">
                        {Icon.edit} Caption
                      </button>
                    </div>

                    {/* Row 2: replace + delete */}
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => { setReplaceId(pic.id); replaceRef.current?.click(); }}
                        title="Replace photo"
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg
                          bg-amber-600/80 hover:bg-amber-600 text-white text-[10px] font-semibold
                          transition-colors">
                        {Icon.refresh} Replace
                      </button>
                      <button onClick={() => handleDelete(pic.id)}
                        title="Delete photo"
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg
                          bg-red-600/80 hover:bg-red-600 text-white text-[10px] font-semibold
                          transition-colors">
                        {Icon.trash} Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer count */}
        {!loading && pictures.length > 0 && (
          <div className="px-5 py-3 border-t border-white/[0.05] flex items-center justify-between">
            <span className="text-[10px] text-white/25">
              {pictures.length} photo{pictures.length !== 1 ? 's' : ''} · {15 - pictures.length} slots remaining
            </span>
            <span className="text-[10px] text-white/20">
              Hover a photo to edit, replace, or delete it
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

/* ─── History Drawer ─────────────────────────────────────────── */
const HistoryDrawer = ({ vehicle, onClose }) => {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!vehicle) return;
    setLoading(true);
    vehicleApi.history(vehicle.id)
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [vehicle]);

  if (!vehicle) return null;

  return (
    <>
      <div className="fixed inset-0 z-[50]" onClick={onClose}
        style={{ background: 'rgba(6,11,24,0.5)' }} />
      <div className="fixed right-0 top-0 h-full w-[360px] z-[55]
        bg-[#0B1221] border-l border-white/[0.07] flex flex-col"
        style={{ boxShadow: '-24px 0 64px rgba(0,0,0,0.4)' }}>

        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
          <div>
            <span className="font-sora text-[13px] font-bold text-white">Usage History</span>
            <p className="text-[10px] text-white/30 mt-0.5">
              {vehicle.make} {vehicle.model} · {vehicle.plate_number}
            </p>
          </div>
          <button onClick={onClose}
            className="w-7 h-7 rounded-lg bg-white/[0.04] hover:bg-white/[0.08]
              text-white/40 hover:text-white flex items-center justify-center transition-all">
            {Icon.close}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-3">
          {loading ? (
            Array(5).fill(0).map((_, i) => (
              <div key={i} className="h-14 rounded-xl bg-white/[0.04] animate-pulse" />
            ))
          ) : !data || data.recent_lessons?.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
              <span className="text-3xl">📭</span>
              <p className="text-[12px] text-white/30">No usage history yet</p>
            </div>
          ) : (
            <>
              <div className="bg-blue-600/08 border border-blue-500/15 rounded-xl px-4 py-3">
                <p className="font-sora text-[22px] font-black text-white">{data.total_lessons}</p>
                <p className="text-[10px] text-white/35 mt-0.5">Total lessons scheduled</p>
              </div>
              {(data.recent_lessons || []).map((s, i) => (
                <div key={i}
                  className="bg-white/[0.02] border border-white/[0.05] rounded-xl px-4 py-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[12px] font-semibold text-white">
                        {s.lesson_title || s.lesson?.title || `Lesson #${s.lesson}`}
                      </p>
                      <p className="text-[10px] text-white/30 mt-0.5">
                        {s.instructor_name || s.instructor?.username || '—'}
                      </p>
                    </div>
                    <p className="text-[10px] text-white/25">
                      {fmtDate(s.start_time || s.date)}
                    </p>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </>
  );
};

/* ─── Toast ──────────────────────────────────────────────────── */
const Toast = ({ msg, type, onDone }) => {
  useEffect(() => {
    if (!msg) return;
    const t = setTimeout(onDone, 3000);
    return () => clearTimeout(t);
  }, [msg]);
  if (!msg) return null;
  return (
    <div className={cls(
      'fixed bottom-6 right-6 z-[80] flex items-center gap-3 px-4 py-3 rounded-2xl border',
      'shadow-2xl text-[12px] font-semibold font-dm',
      type === 'error'
        ? 'bg-red-950 border-red-500/30 text-red-300'
        : 'bg-[#0B2A1A] border-emerald-500/30 text-emerald-300',
    )} style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>
      <span>{type === 'error' ? '❌' : '✅'}</span>{msg}
    </div>
  );
};

/* ─── Stat Card ──────────────────────────────────────────────── */
const StatCard = ({ emoji, label, value, accent }) => {
  const accents = {
    blue:    'from-blue-600/10 to-transparent border-blue-500/10',
    emerald: 'from-emerald-600/10 to-transparent border-emerald-500/10',
    amber:   'from-amber-600/10 to-transparent border-amber-500/10',
    red:     'from-red-600/10 to-transparent border-red-500/10',
    violet:  'from-violet-600/10 to-transparent border-violet-500/10',
  };
  return (
    <div className={cls(
      'bg-[#0F1A2E] rounded-[14px] px-4 py-3.5 border bg-gradient-to-br',
      'hover:border-white/[0.12] transition-colors',
      accents[accent] || 'border-white/[0.07]',
    )}>
      <div className="text-xl mb-2">{emoji}</div>
      <div className="font-sora text-[26px] font-black text-white tracking-tight">{value ?? '—'}</div>
      <div className="text-[10px] text-white/30 mt-0.5">{label}</div>
    </div>
  );
};

/* ─── Vehicle Row ────────────────────────────────────────────── */
const VehicleRow = ({ vehicle, onEdit, onDelete, onDetails, onMaintenance, onPictures }) => (
  <tr className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors group cursor-default">

    {/* Thumbnail + plate */}
    <td className="px-4 py-3.5">
      <div className="flex items-center gap-2.5">
        {vehicle.primary_thumbnail ? (
          <img src={vehicle.primary_thumbnail} alt={vehicle.plate_number}
            className="w-9 h-9 rounded-[9px] object-cover flex-shrink-0"
            onClick={() => onDetails(vehicle)} />
        ) : (
          <div className="w-9 h-9 rounded-[9px] bg-blue-700/30 flex items-center justify-center
            flex-shrink-0 text-sm cursor-pointer" onClick={() => onDetails(vehicle)}>🚗</div>
        )}
        <div>
          <div className="text-[12px] font-bold text-white">{vehicle.plate_number}</div>
          <div className="text-[10px] text-white/35">{vehicle.color || '—'}</div>
        </div>
      </div>
    </td>

    {/* Make / Model */}
    <td className="px-4 py-3.5">
      <div className="text-[12px] font-semibold text-white">
        {vehicle.make} {vehicle.model}
      </div>
      <div className="text-[10px] text-white/35 mt-0.5">{vehicle.year}</div>
    </td>

    {/* School */}
    <td className="px-4 py-3.5">
      <div className="text-[11px] text-white/50">{vehicle.school_name || '—'}</div>
    </td>

    {/* Transmission */}
    <td className="px-4 py-3.5">
      <TransmissionBadge t={vehicle.transmission} />
    </td>

    {/* Status */}
    <td className="px-4 py-3.5">
      <StatusBadge s={vehicle.status} />
    </td>

    {/* Maintenance */}
    <td className="px-4 py-3.5">
      <MaintenancePill status={vehicle.maintenance_status} />
    </td>

    {/* Photos count */}
    <td className="px-4 py-3.5">
      <button onClick={() => onPictures(vehicle)}
        className="flex items-center gap-1.5 text-[10px] text-white/35
          hover:text-violet-400 transition-colors">
        {Icon.image}
        <span>{vehicle.images_summary?.total_images ?? 0}</span>
      </button>
    </td>

    {/* Actions */}
    <td className="px-4 py-3.5">
      <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={() => onDetails(vehicle)}
          className="w-7 h-7 rounded-lg bg-white/[0.05] hover:bg-white/[0.1]
            text-white/40 hover:text-white flex items-center justify-center transition-colors text-[11px]"
          title="Details">👁</button>
        <button onClick={() => onMaintenance(vehicle, 'schedule')}
          className="w-7 h-7 rounded-lg bg-amber-500/10 hover:bg-amber-500/20
            text-amber-400 flex items-center justify-center transition-colors"
          title="Maintenance">{Icon.wrench}</button>
        <button onClick={() => onEdit(vehicle)}
          className="w-7 h-7 rounded-lg bg-blue-500/10 hover:bg-blue-500/20
            text-blue-400 flex items-center justify-center transition-colors"
          title="Edit">{Icon.edit}</button>
        <button onClick={() => onDelete(vehicle)}
          className="w-7 h-7 rounded-lg bg-red-500/10 hover:bg-red-500/20
            text-red-400 flex items-center justify-center transition-colors"
          title="Delete">{Icon.trash}</button>
      </div>
    </td>
  </tr>
);

/* ─────────────────────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────────────────────── */
const InstructorVehiclePage = () => {
  const [vehicles,      setVehicles]      = useState([]);
  const [schools,       setSchools]       = useState([]);
  const [stats,         setStats]         = useState(null);
  const [loading,       setLoading]       = useState(true);
  const [search,        setSearch]        = useState('');
  const [statusFilter,  setStatusFilter]  = useState('');
  const [transFilter,   setTransFilter]   = useState('');
  const [modalOpen,     setModalOpen]     = useState(false);
  const [editVehicle,   setEditVehicle]   = useState(null);
  const [deleteTarget,  setDeleteTarget]  = useState(null);
  const [deleting,      setDeleting]      = useState(false);
  const [drawer,        setDrawer]        = useState(null);      // vehicle for detail drawer
  const [historyTarget, setHistoryTarget] = useState(null);      // vehicle for history drawer
  const [maintTarget,   setMaintTarget]   = useState(null);      // { vehicle, mode }
  const [picTarget,     setPicTarget]     = useState(null);      // vehicle for picture modal
  const [toast,         setToast]         = useState({ msg: '', type: 'success' });
  const [error,         setError]         = useState('');

  const showToast = (msg, type = 'success') => setToast({ msg, type });

  /* ── fetch meta ── */
  useEffect(() => {
    vehicleApi.getSchools()
      .then(d => setSchools(Array.isArray(d) ? d : d?.results || []))
      .catch(() => {});
    vehicleApi.statistics().then(setStats).catch(() => {});
  }, []);

  /* ── fetch vehicles ── */
  const fetchVehicles = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const params = new URLSearchParams();
      if (search)       params.set('search', search);
      if (statusFilter) params.set('status', statusFilter);
      if (transFilter)  params.set('transmission', transFilter);
      const data = await vehicleApi.getAll(params.toString());
      setVehicles(Array.isArray(data) ? data : data?.results || []);
    } catch { setError('Failed to load vehicles.'); }
    finally { setLoading(false); }
  }, [search, statusFilter, transFilter]);

  useEffect(() => { fetchVehicles(); }, [fetchVehicles]);

  /* ── CRUD handlers ── */
  const handleSuccess = (v, isEdit) => {
    setModalOpen(false); setEditVehicle(null);
    if (isEdit) {
      setVehicles(vs => vs.map(x => x.id === v.id ? v : x));
      showToast('Vehicle updated');
    } else {
      setVehicles(vs => [v, ...vs]);
      showToast('Vehicle added');
    }
    vehicleApi.statistics().then(setStats).catch(() => {});
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await vehicleApi.remove(deleteTarget.id);
      setVehicles(vs => vs.filter(v => v.id !== deleteTarget.id));
      showToast('Vehicle removed');
    } catch { showToast('Failed to remove vehicle', 'error'); }
    finally { setDeleting(false); setDeleteTarget(null); }
  };

  const handleMaintenanceSuccess = (updated) => {
    setVehicles(vs => vs.map(v => v.id === updated.id ? updated : v));
    setMaintTarget(null);
    showToast(maintTarget?.mode === 'schedule' ? 'Maintenance scheduled' : 'Maintenance completed');
    vehicleApi.statistics().then(setStats).catch(() => {});
  };

  const openCreate = () => { setEditVehicle(null); setModalOpen(true); };
  const openEdit   = (v) => { setEditVehicle(v); setModalOpen(true); setDrawer(null); };

  /* ── derived counts ── */
  const available   = vehicles.filter(v => v.status === 'available').length;
  const maintenance = vehicles.filter(v => v.status === 'maintenance').length;

  const TABLE_HEADS = ['Vehicle', 'Make / Model', 'School', 'Transmission', 'Status', 'Maintenance', 'Photos', ''];

  return (
    <div className="flex h-screen bg-[#060B18] overflow-hidden font-dm">
      <Sidebar />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">

        {/* ── Page header ── */}
        <header className="h-[52px] flex-shrink-0 bg-[#0B1221] border-b border-white/[0.06]
          flex items-center gap-3 px-5">
          <div className="flex items-baseline gap-2">
            <span className="font-sora text-[14px] font-bold text-white">Vehicles</span>
            <span className="text-[11px] text-white/30">Manage your school fleet</span>
          </div>
          <div className="flex-1" />
          <button onClick={openCreate}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600
              hover:bg-blue-500 rounded-[7px] text-[11px] font-semibold text-white transition-all">
            {Icon.plus} Add Vehicle
          </button>
        </header>

        {/* ── Main scroll area ── */}
        <main className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">

          {/* Error */}
          {error && (
            <div className="flex items-center gap-3 bg-red-500/[0.07] border border-red-500/20
              rounded-xl px-4 py-3">
              {Icon.warn}
              <p className="text-[12px] text-red-400">{error}</p>
            </div>
          )}

          {/* Maintenance alerts */}
          {stats?.maintenance?.overdue > 0 && (
            <div className="flex items-center gap-3 bg-amber-500/[0.07] border border-amber-500/20
              rounded-xl px-4 py-3">
              <span className="text-amber-400">⚠️</span>
              <p className="text-[12px] text-amber-400">
                <span className="font-bold">{stats.maintenance.overdue}</span> vehicle
                {stats.maintenance.overdue > 1 ? 's have' : ' has'} overdue maintenance.
              </p>
            </div>
          )}

          {/* ── Stats strip ── */}
          <div className="grid grid-cols-5 gap-3">
            <StatCard emoji="🚗" label="Total vehicles"    value={stats?.total_vehicles   ?? vehicles.length} accent="blue" />
            <StatCard emoji="✅" label="Available"          value={stats?.available_vehicles ?? available}      accent="emerald" />
            <StatCard emoji="🔧" label="In maintenance"    value={stats?.maintenance_vehicles ?? maintenance}   accent="amber" />
            <StatCard emoji="⚠️" label="Overdue maint."   value={stats?.maintenance?.overdue ?? '—'}           accent="red" />
            <StatCard emoji="📅" label="Due in 30 days"   value={stats?.maintenance?.upcoming_30_days ?? '—'}  accent="violet" />
          </div>

          {/* ── Table card ── */}
          <div className="bg-[#0F1A2E] border border-white/[0.07] rounded-[14px] flex flex-col overflow-hidden">

            {/* Toolbar */}
            <div className="flex items-center gap-3 px-5 py-3.5 border-b border-white/[0.06] flex-wrap">

              {/* Search */}
              <div className="relative w-[220px]">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20">
                  {Icon.search}
                </span>
                <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Search make, model, plate…"
                  className="w-full bg-white/[0.03] border border-white/[0.07] rounded-xl
                    pl-9 pr-4 py-2 text-[12px] text-white placeholder:text-white/20
                    outline-none focus:border-blue-500/50 transition-all" />
              </div>

              {/* Status filter */}
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                className="bg-white/[0.03] border border-white/[0.07] rounded-xl
                  px-3 py-2 text-[11px] text-white/60 outline-none
                  focus:border-blue-500/40 transition-all appearance-none cursor-pointer">
                <option value="">All statuses</option>
                {Object.entries(STATUSES).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </select>

              {/* Transmission filter */}
              <div className="flex bg-white/[0.04] rounded-[8px] p-0.5 gap-0.5">
                {[['', 'All'], ['manual', '🕹️ Manual'], ['automatic', '🤖 Auto']].map(([v, l]) => (
                  <button key={v} onClick={() => setTransFilter(v)}
                    className={cls(
                      'px-3 py-1.5 rounded-[6px] text-[10px] font-semibold transition-all',
                      transFilter === v ? 'bg-white/[0.1] text-white' : 'text-white/30 hover:text-white/60',
                    )}>{l}</button>
                ))}
              </div>

              <div className="flex-1" />

              <button onClick={fetchVehicles}
                className="w-8 h-8 rounded-lg bg-white/[0.04] hover:bg-white/[0.08]
                  text-white/30 hover:text-white flex items-center justify-center transition-all">
                {Icon.refresh}
              </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    {TABLE_HEADS.map((h, i) => (
                      <th key={i}
                        className="px-4 py-3 text-left text-[9px] font-bold text-white/25
                          tracking-[0.6px] uppercase border-b border-white/[0.05]">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading
                    ? Array(5).fill(0).map((_, i) => <SkeletonRow key={i} />)
                    : vehicles.length === 0
                    ? <EmptyState onAdd={openCreate} />
                    : vehicles.map(v => (
                        <VehicleRow
                          key={v.id}
                          vehicle={v}
                          onEdit={openEdit}
                          onDelete={setDeleteTarget}
                          onDetails={setDrawer}
                          onMaintenance={(veh, mode) => setMaintTarget({ vehicle: veh, mode })}
                          onPictures={setPicTarget}
                        />
                      ))
                  }
                </tbody>
              </table>
            </div>

            {/* Footer */}
            {!loading && vehicles.length > 0 && (
              <div className="px-5 py-3 border-t border-white/[0.05] flex items-center justify-between">
                <span className="text-[10px] text-white/25">
                  {vehicles.length} vehicle{vehicles.length !== 1 ? 's' : ''}
                </span>
                <span className="text-[10px] text-white/20">
                  {available} available · {maintenance} in maintenance
                </span>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* ── Detail Drawer ── */}
      <VehicleDrawer
        vehicle={drawer}
        onClose={() => setDrawer(null)}
        onEdit={openEdit}
        onMaintenance={(v, mode) => { setDrawer(null); setMaintTarget({ vehicle: v, mode }); }}
        onPictures={(v) => { setDrawer(null); setPicTarget(v); }}
        onHistory={(v) => { setDrawer(null); setHistoryTarget(v); }}
        showToast={showToast}
      />

      {/* ── History Drawer ── */}
      <HistoryDrawer vehicle={historyTarget} onClose={() => setHistoryTarget(null)} />

      {/* ── Vehicle Form Modal ── */}
      <VehicleModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditVehicle(null); }}
        onSuccess={handleSuccess}
        vehicle={editVehicle}
        schools={schools}
      />

      {/* ── Maintenance Modal ── */}
      <MaintenanceModal
        open={!!maintTarget}
        vehicle={maintTarget?.vehicle}
        mode={maintTarget?.mode}
        onClose={() => setMaintTarget(null)}
        onSuccess={handleMaintenanceSuccess}
      />

      {/* ── Pictures Modal ── */}
      <PicturesModal
        open={!!picTarget}
        vehicle={picTarget}
        onClose={() => setPicTarget(null)}
        showToast={showToast}
      />

      {/* ── Delete Confirm ── */}
      <DeleteDialog
        open={!!deleteTarget}
        vehicle={deleteTarget}
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* ── Toast ── */}
      <Toast msg={toast.msg} type={toast.type} onDone={() => setToast({ msg: '', type: 'success' })} />
    </div>
  );
};

export default InstructorVehiclePage;