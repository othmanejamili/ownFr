// src/pages/VehiclePage/StudentVehiclePage.jsx
//
// Student-only vehicle page — read-only fleet browser.
// Students can browse vehicles in their school, view photos, and see details.
//
// APIs used (read-only):
//   GET  /api/vehicle/                   → list vehicles
//   GET  /api/vehicle/statistics/        → fleet stats
//   GET  /api/vehicle/:id/pictures/      → pictures for a vehicle
//   GET  /api/vehicle/available/         → available vehicles

import { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import Sidebar from '../Dashboard/Sidebar';

const API = import.meta.env.VITE_API_URL;

/* ─── API layer (read-only) ──────────────────────────────────── */
const vehicleApi = {
  getAll:     (qs = '') => axios.get(`${API}/vehicle/${qs ? `?${qs}` : ''}`).then(r => r.data),
  statistics: ()        => axios.get(`${API}/vehicle/statistics/`).then(r => r.data),
  pictures:   (id)      => axios.get(`${API}/vehicle/${id}/pictures/`).then(r => r.data),
  available:  ()        => axios.get(`${API}/vehicle/available/`).then(r => r.data),
};

/* ─── Helpers ─────────────────────────────────────────────────── */
const cls = (...a) => a.filter(Boolean).join(' ');
const fmtDate = iso =>
  iso ? new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

/* ─── Constants ───────────────────────────────────────────────── */
const STATUS_META = {
  available:      { label: 'Available',      dot: '#34d399', bg: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' },
  maintenance:    { label: 'Maintenance',    dot: '#fbbf24', bg: 'bg-amber-500/10 border-amber-500/20 text-amber-400' },
  reserved:       { label: 'Reserved',       dot: '#60a5fa', bg: 'bg-blue-500/10 border-blue-500/20 text-blue-400' },
  out_of_service: { label: 'Out of Service', dot: '#f87171', bg: 'bg-red-500/10 border-red-500/20 text-red-400' },
};
const TRANS_META = {
  manual:    { label: 'Manual',    emoji: '🕹️', cls: 'text-violet-400 bg-violet-500/10 border-violet-500/20' },
  automatic: { label: 'Automatic', emoji: '🤖', cls: 'text-teal-400 bg-teal-500/10 border-teal-500/20' },
};

/* ─── Icons ───────────────────────────────────────────────────── */
const Ico = {
  search:  <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.4"/><path d="M10 10l2.5 2.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>,
  close:   <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2 2l9 9M11 2l-9 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
  chevL:   <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M6.5 2L3.5 5l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  chevR:   <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M3.5 2l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  image:   <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><rect x="1" y="2" width="11" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.2"/><circle cx="4.5" cy="5.5" r="1" stroke="currentColor" strokeWidth="1"/><path d="M1 9l3-3 2.5 2.5L9 6l3 3" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round"/></svg>,
  refresh: <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M11 6.5A4.5 4.5 0 112 6.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/><path d="M11 3v3.5H7.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  expand:  <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M7.5 1.5H10.5V4.5M4.5 10.5H1.5V7.5M10.5 1.5L7 5M1.5 10.5L5 7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  info:    <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><circle cx="6.5" cy="6.5" r="5.5" stroke="currentColor" strokeWidth="1.2"/><path d="M6.5 5.5v4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/><circle cx="6.5" cy="3.5" r="0.7" fill="currentColor"/></svg>,
  grid:    <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><rect x="1" y="1" width="4.5" height="4.5" rx="1" stroke="currentColor" strokeWidth="1.2"/><rect x="7.5" y="1" width="4.5" height="4.5" rx="1" stroke="currentColor" strokeWidth="1.2"/><rect x="1" y="7.5" width="4.5" height="4.5" rx="1" stroke="currentColor" strokeWidth="1.2"/><rect x="7.5" y="7.5" width="4.5" height="4.5" rx="1" stroke="currentColor" strokeWidth="1.2"/></svg>,
  list:    <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M4 3.5h7.5M4 6.5h7.5M4 9.5h7.5M1.5 3.5h.1M1.5 6.5h.1M1.5 9.5h.1" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>,
};

/* ─── Skeleton card ───────────────────────────────────────────── */
const SkeletonCard = () => (
  <div className="bg-[#0C1728] border border-white/[0.06] rounded-2xl overflow-hidden animate-pulse">
    <div className="h-44 bg-white/[0.05]" />
    <div className="p-4 flex flex-col gap-3">
      <div className="h-3.5 bg-white/[0.06] rounded-full w-2/3" />
      <div className="h-2.5 bg-white/[0.04] rounded-full w-1/2" />
      <div className="flex gap-2 mt-1">
        <div className="h-5 w-16 bg-white/[0.04] rounded-lg" />
        <div className="h-5 w-20 bg-white/[0.04] rounded-lg" />
      </div>
    </div>
  </div>
);

/* ─── Status badge ────────────────────────────────────────────── */
const StatusBadge = ({ s, size = 'sm' }) => {
  const m = STATUS_META[s] || { label: s, dot: '#aaa', bg: 'bg-white/[0.06] border-white/[0.08] text-white/40' };
  return (
    <span className={cls('inline-flex items-center gap-1.5 border rounded-full font-semibold', m.bg,
      size === 'sm' ? 'text-[9px] px-2 py-0.5' : 'text-[11px] px-3 py-1')}>
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: m.dot }} />
      {m.label}
    </span>
  );
};

/* ─── Transmission badge ──────────────────────────────────────── */
const TransBadge = ({ t, size = 'sm' }) => {
  const m = TRANS_META[t] || { label: t, emoji: '⚙️', cls: 'text-white/40 bg-white/[0.06] border-white/[0.08]' };
  return (
    <span className={cls('inline-flex items-center gap-1 border rounded-full font-semibold', m.cls,
      size === 'sm' ? 'text-[9px] px-2 py-0.5' : 'text-[11px] px-3 py-1')}>
      {m.emoji} {m.label}
    </span>
  );
};

/* ─── Fleet Stats Strip ───────────────────────────────────────── */
const StatsStrip = ({ stats, total }) => {
  const cards = [
    { emoji: '🚗', label: 'Total in Fleet',    value: stats?.total_vehicles ?? total, color: 'from-blue-600/15'    },
    { emoji: '✅', label: 'Available Now',      value: stats?.by_status?.available ?? '—', color: 'from-emerald-600/15' },
    { emoji: '🔧', label: 'In Maintenance',    value: stats?.by_status?.maintenance ?? '—', color: 'from-amber-600/15'  },
    { emoji: '📅', label: 'Avg. Fleet Age',    value: stats?.average_age != null ? `${stats.average_age}y` : '—', color: 'from-violet-600/15' },
  ];
  return (
    <div className="grid grid-cols-4 gap-3">
      {cards.map(c => (
        <div key={c.label}
          className={cls(
            'relative bg-gradient-to-br to-transparent border border-white/[0.07]',
            'rounded-2xl px-4 py-4 overflow-hidden', c.color,
          )}>
          <div className="text-2xl mb-2">{c.emoji}</div>
          <div className="font-sora text-[28px] font-black text-white tracking-tight leading-none">{c.value}</div>
          <div className="text-[10px] text-white/30 mt-1.5 font-medium">{c.label}</div>
        </div>
      ))}
    </div>
  );
};

/* ─── Lightbox / Photo Viewer ─────────────────────────────────── */
const Lightbox = ({ open, pictures, startIndex, onClose }) => {
  const [idx, setIdx] = useState(startIndex);
  useEffect(() => { setIdx(startIndex); }, [startIndex]);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (e.key === 'Escape')     onClose();
      if (e.key === 'ArrowLeft')  setIdx(i => Math.max(0, i - 1));
      if (e.key === 'ArrowRight') setIdx(i => Math.min(pictures.length - 1, i + 1));
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, pictures.length]);

  if (!open || !pictures.length) return null;
  const pic = pictures[idx];

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center"
      style={{ background: 'rgba(4,8,18,0.97)', backdropFilter: 'blur(20px)' }}
      onClick={onClose}>

      {/* Close */}
      <button className="absolute top-5 right-5 w-9 h-9 rounded-xl bg-white/[0.07] hover:bg-white/[0.14]
        text-white/60 hover:text-white flex items-center justify-center transition-all z-10"
        onClick={onClose}>{Ico.close}</button>

      {/* Counter */}
      <div className="absolute top-5 left-1/2 -translate-x-1/2 text-[11px] text-white/30 font-medium z-10">
        {idx + 1} / {pictures.length}
      </div>

      {/* Prev */}
      {idx > 0 && (
        <button className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl
          bg-white/[0.07] hover:bg-white/[0.14] text-white flex items-center justify-center
          transition-all z-10"
          onClick={e => { e.stopPropagation(); setIdx(i => i - 1); }}>
          {Ico.chevL}
        </button>
      )}

      {/* Image */}
      <div className="relative max-w-[80vw] max-h-[80vh]" onClick={e => e.stopPropagation()}>
        <img
          src={pic.image_url || pic.image}
          alt={pic.caption || 'Vehicle'}
          className="max-w-full max-h-[80vh] rounded-2xl object-contain"
          style={{ boxShadow: '0 24px 80px rgba(0,0,0,0.6)' }}
        />
        {pic.is_primary && (
          <span className="absolute top-3 left-3 text-[9px] font-bold px-2 py-1 rounded-lg
            bg-blue-600 text-white tracking-wide">PRIMARY</span>
        )}
        {pic.caption && (
          <div className="absolute bottom-0 left-0 right-0 px-5 py-3 rounded-b-2xl
            bg-gradient-to-t from-black/80 to-transparent">
            <p className="text-[12px] text-white/80 font-medium">{pic.caption}</p>
          </div>
        )}
      </div>

      {/* Next */}
      {idx < pictures.length - 1 && (
        <button className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl
          bg-white/[0.07] hover:bg-white/[0.14] text-white flex items-center justify-center
          transition-all z-10"
          onClick={e => { e.stopPropagation(); setIdx(i => i + 1); }}>
          {Ico.chevR}
        </button>
      )}

      {/* Thumbnail strip */}
      {pictures.length > 1 && (
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2 z-10"
          onClick={e => e.stopPropagation()}>
          {pictures.map((p, i) => (
            <button key={p.id} onClick={() => setIdx(i)}
              className={cls(
                'w-10 h-10 rounded-lg overflow-hidden border-2 transition-all',
                i === idx ? 'border-blue-500 scale-110' : 'border-transparent opacity-50 hover:opacity-80',
              )}>
              <img src={p.thumbnail_url || p.image_url || p.image} alt=""
                className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

/* ─── Vehicle Detail Panel (right drawer) ─────────────────────── */
const VehiclePanel = ({ vehicle, onClose, showToast }) => {
  const [pictures,  setPictures]  = useState([]);
  const [loadingPics, setLoadingPics] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIdx,  setLightboxIdx]  = useState(0);

  useEffect(() => {
    if (!vehicle) return;
    setPictures([]);
    setLoadingPics(true);
    vehicleApi.pictures(vehicle.id)
      .then(d => setPictures(d.pictures || []))
      .catch(() => {})
      .finally(() => setLoadingPics(false));
  }, [vehicle]);

  const openLightbox = (idx) => { setLightboxIdx(idx); setLightboxOpen(true); };

  if (!vehicle) return null;

  const primary = pictures.find(p => p.is_primary) || pictures[0];
  const m = STATUS_META[vehicle.status];

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-[50]" onClick={onClose}
        style={{ background: 'rgba(4,8,18,0.6)', backdropFilter: 'blur(4px)' }} />

      {/* Panel */}
      <div className="fixed right-0 top-0 h-full w-[400px] z-[55] flex flex-col
        bg-[#090F1E] border-l border-white/[0.07]"
        style={{ boxShadow: '-32px 0 80px rgba(0,0,0,0.5)' }}>

        {/* Hero image */}
        <div className="relative w-full h-52 flex-shrink-0 overflow-hidden">
          {primary ? (
            <img src={primary.image_url || primary.image} alt={vehicle.plate_number}
              className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-900/40 to-[#090F1E]
              flex items-center justify-center text-6xl">🚗</div>
          )}
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#090F1E] via-transparent to-transparent" />
          {/* Close */}
          <button onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 rounded-xl bg-black/50 hover:bg-black/70
              text-white/70 hover:text-white flex items-center justify-center transition-all backdrop-blur-sm">
            {Ico.close}
          </button>
          {/* Title overlay */}
          <div className="absolute bottom-3 left-4">
            <p className="font-sora text-[18px] font-black text-white">
              {vehicle.make} {vehicle.model}
            </p>
            <p className="text-[11px] text-white/50">{vehicle.plate_number} · {vehicle.year}</p>
          </div>
          {/* Expand trigger */}
          {primary && (
            <button onClick={() => openLightbox(0)}
              className="absolute bottom-3 right-4 w-7 h-7 rounded-lg bg-black/50 hover:bg-black/70
                text-white/70 hover:text-white flex items-center justify-center transition-all backdrop-blur-sm">
              {Ico.expand}
            </button>
          )}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">

          {/* Status + transmission */}
          <div className="flex items-center gap-2 px-5 pt-4 pb-3 border-b border-white/[0.05]">
            <StatusBadge s={vehicle.status} size="md" />
            <TransBadge t={vehicle.transmission} size="md" />
            {vehicle.color && (
              <span className="text-[11px] px-3 py-1 rounded-full border bg-white/[0.04]
                border-white/[0.08] text-white/40">
                {vehicle.color}
              </span>
            )}
          </div>

          {/* Info grid */}
          <div className="px-5 py-4 flex flex-col gap-3">
            <p className="text-[9px] font-bold text-white/20 uppercase tracking-[0.7px]">Details</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'School',       value: vehicle.school_name },
                { label: 'Vehicle Age',  value: vehicle.vehicle_age != null ? `${vehicle.vehicle_age} years` : '—' },
                { label: 'Last Service', value: fmtDate(vehicle.last_maintenance) },
                { label: 'Next Service', value: fmtDate(vehicle.next_maintenance) },
              ].map(({ label, value }) => (
                <div key={label}
                  className="bg-white/[0.03] border border-white/[0.05] rounded-xl px-3 py-2.5">
                  <p className="text-[8px] font-bold text-white/20 uppercase tracking-[0.5px]">{label}</p>
                  <p className="text-[12px] font-semibold text-white mt-0.5">{value || '—'}</p>
                </div>
              ))}
            </div>

            {/* Maintenance status */}
            {vehicle.maintenance_status && (
              <div className={cls(
                'rounded-xl px-4 py-3 border flex items-center gap-3',
                vehicle.maintenance_status.startsWith('Overdue')
                  ? 'bg-red-500/[0.07] border-red-500/20'
                  : vehicle.maintenance_status.startsWith('Due in') && parseInt(vehicle.maintenance_status.match(/\d+/)?.[0]) <= 7
                  ? 'bg-amber-500/[0.07] border-amber-500/20'
                  : 'bg-white/[0.03] border-white/[0.05]',
              )}>
                <span className="text-base">🔧</span>
                <div>
                  <p className="text-[9px] font-bold text-white/25 uppercase tracking-wide">Service</p>
                  <p className={cls(
                    'text-[12px] font-semibold mt-0.5',
                    vehicle.maintenance_status.startsWith('Overdue') ? 'text-red-400'
                    : vehicle.maintenance_status.startsWith('Due in') && parseInt(vehicle.maintenance_status.match(/\d+/)?.[0]) <= 7 ? 'text-amber-400'
                    : 'text-white/60',
                  )}>{vehicle.maintenance_status}</p>
                </div>
              </div>
            )}
          </div>

          {/* Photo gallery */}
          <div className="px-5 pb-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[9px] font-bold text-white/20 uppercase tracking-[0.7px]">
                Photos · {pictures.length}
              </p>
              {pictures.length > 0 && (
                <button onClick={() => openLightbox(0)}
                  className="text-[10px] text-blue-400 hover:text-blue-300 font-semibold transition-colors">
                  View all →
                </button>
              )}
            </div>

            {loadingPics ? (
              <div className="grid grid-cols-3 gap-2">
                {[1,2,3].map(i => (
                  <div key={i} className="h-20 rounded-xl bg-white/[0.04] animate-pulse" />
                ))}
              </div>
            ) : pictures.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 gap-2
                border border-dashed border-white/[0.07] rounded-2xl">
                <span className="text-2xl opacity-40">📷</span>
                <p className="text-[10px] text-white/20">No photos available</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {pictures.slice(0, 9).map((pic, i) => (
                  <button key={pic.id} onClick={() => openLightbox(i)}
                    className="relative group h-20 rounded-xl overflow-hidden border border-white/[0.06]
                      hover:border-blue-500/40 transition-all">
                    <img src={pic.thumbnail_url || pic.image_url || pic.image}
                      alt={pic.caption || ''}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    {pic.is_primary && (
                      <span className="absolute top-1 left-1 text-[7px] font-bold px-1 py-0.5
                        rounded bg-blue-600 text-white">★</span>
                    )}
                    {/* 9+ overflow indicator */}
                    {i === 8 && pictures.length > 9 && (
                      <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                        <span className="text-[13px] font-black text-white">+{pictures.length - 8}</span>
                      </div>
                    )}
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-blue-600/20 opacity-0 group-hover:opacity-100
                      transition-opacity flex items-center justify-center">
                      {Ico.expand}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Lightbox */}
      <Lightbox
        open={lightboxOpen}
        pictures={pictures}
        startIndex={lightboxIdx}
        onClose={() => setLightboxOpen(false)}
      />
    </>
  );
};

/* ─── Vehicle Card (grid view) ────────────────────────────────── */
const VehicleCard = ({ vehicle, onClick }) => {
  const thumb = vehicle.primary_thumbnail;
  const isAvailable = vehicle.status === 'available';

  return (
    <button onClick={() => onClick(vehicle)}
      className="group text-left bg-[#0C1728] border border-white/[0.06] rounded-2xl overflow-hidden
        hover:border-blue-500/30 hover:shadow-[0_0_32px_rgba(59,130,246,0.08)]
        transition-all duration-300 flex flex-col">

      {/* Photo */}
      <div className="relative w-full h-44 overflow-hidden bg-gradient-to-br from-blue-900/30 to-[#0C1728]">
        {thumb ? (
          <img src={thumb} alt={vehicle.plate_number}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl opacity-30">🚗</div>
        )}
        {/* Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0C1728]/80 via-transparent to-transparent" />

        {/* Status dot */}
        <div className="absolute top-3 right-3">
          <StatusBadge s={vehicle.status} />
        </div>

        {/* Photo count */}
        {vehicle.images_summary?.total_images > 0 && (
          <div className="absolute bottom-3 right-3 flex items-center gap-1
            text-[9px] text-white/50 bg-black/50 px-2 py-1 rounded-lg backdrop-blur-sm">
            {Ico.image}
            <span>{vehicle.images_summary.total_images}</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col gap-2 flex-1">
        <div>
          <p className="font-sora text-[14px] font-bold text-white leading-tight">
            {vehicle.make} {vehicle.model}
          </p>
          <p className="text-[10px] text-white/35 mt-0.5">
            {vehicle.plate_number} · {vehicle.year} {vehicle.color ? `· ${vehicle.color}` : ''}
          </p>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <TransBadge t={vehicle.transmission} />
        </div>

        <div className="mt-auto pt-2 border-t border-white/[0.05] flex items-center justify-between">
          <p className="text-[10px] text-white/25">{vehicle.school_name || '—'}</p>
          <span className={cls(
            'text-[10px] font-semibold',
            isAvailable ? 'text-emerald-400' : 'text-white/20',
          )}>
            {isAvailable ? 'Available' : '—'}
          </span>
        </div>
      </div>
    </button>
  );
};

/* ─── Vehicle List Row (list view) ───────────────────────────── */
const VehicleListRow = ({ vehicle, onClick }) => (
  <button onClick={() => onClick(vehicle)}
    className="group w-full text-left flex items-center gap-4 px-4 py-3.5
      border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">

    {/* Thumb */}
    <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0
      bg-gradient-to-br from-blue-900/30 to-[#0C1728]">
      {vehicle.primary_thumbnail ? (
        <img src={vehicle.primary_thumbnail} alt="" className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-xl opacity-30">🚗</div>
      )}
    </div>

    {/* Main info */}
    <div className="flex-1 min-w-0">
      <p className="font-sora text-[13px] font-bold text-white">
        {vehicle.make} {vehicle.model}
      </p>
      <p className="text-[10px] text-white/35 mt-0.5">
        {vehicle.plate_number} · {vehicle.year} {vehicle.color ? `· ${vehicle.color}` : ''}
      </p>
    </div>

    {/* School */}
    <div className="hidden md:block text-[11px] text-white/30 w-32 text-right truncate flex-shrink-0">
      {vehicle.school_name}
    </div>

    {/* Badges */}
    <div className="flex items-center gap-2 flex-shrink-0">
      <TransBadge t={vehicle.transmission} />
      <StatusBadge s={vehicle.status} />
    </div>

    {/* Arrow */}
    <span className="text-white/20 group-hover:text-white/50 transition-colors flex-shrink-0">
      {Ico.chevR}
    </span>
  </button>
);

/* ─── Empty State ─────────────────────────────────────────────── */
const EmptyState = ({ filtered }) => (
  <div className="flex flex-col items-center justify-center py-24 gap-4">
    <span className="text-5xl">{filtered ? '🔍' : '🚗'}</span>
    <div className="text-center">
      <p className="font-sora text-[14px] font-bold text-white/50">
        {filtered ? 'No vehicles match your filters' : 'No vehicles in your school yet'}
      </p>
      <p className="text-[11px] text-white/20 mt-1">
        {filtered ? 'Try adjusting the search or filters.' : 'Check back later.'}
      </p>
    </div>
  </div>
);

/* ─────────────────────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────────────────────── */
const StudentVehiclePage = () => {
  const [vehicles,     setVehicles]     = useState([]);
  const [stats,        setStats]        = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [search,       setSearch]       = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [transFilter,  setTransFilter]  = useState('');
  const [viewMode,     setViewMode]     = useState('grid');   // 'grid' | 'list'
  const [selected,     setSelected]     = useState(null);     // vehicle for detail panel
  const [error,        setError]        = useState('');

  /* ── Load stats once ── */
  useEffect(() => {
    vehicleApi.statistics().then(setStats).catch(() => {});
  }, []);

  /* ── Load vehicles ── */
  const fetchVehicles = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const params = new URLSearchParams();
      if (search)       params.set('search', search);
      if (statusFilter) params.set('status', statusFilter);
      if (transFilter)  params.set('transmission', transFilter);
      const data = await vehicleApi.getAll(params.toString());
      setVehicles(Array.isArray(data) ? data : data?.results || []);
    } catch {
      setError('Unable to load vehicles. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, transFilter]);

  useEffect(() => { fetchVehicles(); }, [fetchVehicles]);

  const isFiltered = !!(search || statusFilter || transFilter);

  return (
    <div className="flex h-screen bg-[#060B18] overflow-hidden font-dm">
      <Sidebar />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">

        {/* ── Header ── */}
        <header className="h-[52px] flex-shrink-0 bg-[#0B1221] border-b border-white/[0.06]
          flex items-center gap-3 px-5">
          <div className="flex items-baseline gap-2">
            <span className="font-sora text-[14px] font-bold text-white">My School Fleet</span>
            <span className="text-[11px] text-white/25">Browse your school's vehicles</span>
          </div>
          <div className="flex-1" />

          {/* View toggle */}
          <div className="flex bg-white/[0.04] rounded-lg p-0.5 gap-0.5">
            {[['grid', Ico.grid], ['list', Ico.list]].map(([mode, icon]) => (
              <button key={mode} onClick={() => setViewMode(mode)}
                className={cls(
                  'w-7 h-7 rounded-md flex items-center justify-center transition-all',
                  viewMode === mode
                    ? 'bg-blue-600 text-white'
                    : 'text-white/30 hover:text-white/60',
                )}>
                {icon}
              </button>
            ))}
          </div>

          {/* Refresh */}
          <button onClick={fetchVehicles}
            className="w-8 h-8 rounded-lg bg-white/[0.04] hover:bg-white/[0.08]
              text-white/30 hover:text-white flex items-center justify-center transition-all">
            {Ico.refresh}
          </button>
        </header>

        {/* ── Scroll area ── */}
        <main className="flex-1 overflow-y-auto p-5 flex flex-col gap-5">

          {/* Error */}
          {error && (
            <div className="flex items-center gap-3 bg-red-500/[0.07] border border-red-500/20 rounded-xl px-4 py-3">
              <span className="text-red-400">⚠</span>
              <p className="text-[12px] text-red-400">{error}</p>
            </div>
          )}

          {/* Stats */}
          <StatsStrip stats={stats} total={vehicles.length} />

          {/* Filters */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* Search */}
            <div className="relative w-[240px]">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20">{Ico.search}</span>
              <input
                type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search make, model, plate…"
                className="w-full bg-white/[0.03] border border-white/[0.07] rounded-xl
                  pl-9 pr-4 py-2 text-[12px] text-white placeholder:text-white/20
                  outline-none focus:border-blue-500/50 transition-all" />
            </div>

            {/* Status */}
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
              className="bg-white/[0.03] border border-white/[0.07] rounded-xl
                px-3 py-2 text-[11px] text-white/60 outline-none focus:border-blue-500/40
                transition-all appearance-none cursor-pointer bg-[#0B1221]">
              <option value="">All statuses</option>
              {Object.entries(STATUS_META).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>

            {/* Transmission */}
            <div className="flex bg-white/[0.04] rounded-xl p-0.5 gap-0.5">
              {[['', 'All'], ['manual', '🕹️ Manual'], ['automatic', '🤖 Auto']].map(([v, l]) => (
                <button key={v} onClick={() => setTransFilter(v)}
                  className={cls(
                    'px-3 py-1.5 rounded-[9px] text-[10px] font-semibold transition-all',
                    transFilter === v
                      ? 'bg-blue-600 text-white'
                      : 'text-white/30 hover:text-white/60',
                  )}>{l}</button>
              ))}
            </div>

            <div className="flex-1" />

            {/* Count */}
            {!loading && (
              <span className="text-[10px] text-white/20">
                {vehicles.length} vehicle{vehicles.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>

          {/* ── Grid / List ── */}
          {loading ? (
            viewMode === 'grid' ? (
              <div className="grid grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
                {Array(8).fill(0).map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : (
              <div className="bg-[#0C1728] border border-white/[0.06] rounded-2xl overflow-hidden">
                {Array(6).fill(0).map((_, i) => (
                  <div key={i} className="flex items-center gap-4 px-4 py-3.5 border-b border-white/[0.04] animate-pulse">
                    <div className="w-12 h-12 rounded-xl bg-white/[0.05]" />
                    <div className="flex-1 flex flex-col gap-2">
                      <div className="h-3 bg-white/[0.05] rounded-full w-40" />
                      <div className="h-2.5 bg-white/[0.04] rounded-full w-24" />
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : vehicles.length === 0 ? (
            <EmptyState filtered={isFiltered} />
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
              {vehicles.map(v => (
                <VehicleCard key={v.id} vehicle={v} onClick={setSelected} />
              ))}
            </div>
          ) : (
            <div className="bg-[#0C1728] border border-white/[0.06] rounded-2xl overflow-hidden">
              {vehicles.map(v => (
                <VehicleListRow key={v.id} vehicle={v} onClick={setSelected} />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* ── Detail Panel ── */}
      <VehiclePanel
        vehicle={selected}
        onClose={() => setSelected(null)}
      />
    </div>
  );
};

export default StudentVehiclePage;