// src/pages/InstructorProfilePage/InstructorProfilePage.jsx
//
// Instructor-scoped profile page.
// Instructors can: view their own profile, upload a profile picture.
// Read-only: school, role, stats — managed by school owner.
//
// APIs used:
//   GET    /api/studentprofile/my_profile/            → instructor's own profile
//   POST   /api/studentprofile/:id/upload_picture/    → avatar upload (if available)
//   GET    /api/attendance/statistics/                → instructor teaching stats
//   GET    /api/lesson/                               → instructor's lessons

import { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import Sidebar from '../Dashboard/Sidebar';

const API = import.meta.env.VITE_API_URL;

/* ─── Auth header ────────────────────────────────────────────── */
const authHeader = () => {
  const token = localStorage.getItem('access') || sessionStorage.getItem('access');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

/* ─── API layer ──────────────────────────────────────────────── */
const instructorApi = {
  getMyProfile: () =>
    axios.get(`${API}/studentprofile/my_profile/`, { headers: authHeader() }).then(r => r.data),

  uploadPicture: (id, file) => {
    const fd = new FormData();
    fd.append('picture_profile', file);
    return axios.patch(`${API}/studentprofile/${id}/`, fd, {
      headers: { ...authHeader(), 'Content-Type': 'multipart/form-data' },
    }).then(r => r.data);
  },

  getStats: () =>
    axios.get(`${API}/attendance/statistics/`, { headers: authHeader() }).then(r => r.data),

  getLessons: () =>
    axios.get(`${API}/lesson/`, { headers: authHeader() }).then(r => r.data.results ?? r.data),
};

/* ─── Helpers ────────────────────────────────────────────────── */
const cls = (...a) => a.filter(Boolean).join(' ');

const fmtDate = (d) => {
  if (!d) return '—';
  const dt = new Date(d);
  if (isNaN(dt)) return '—';
  return dt.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

const licenseLabel = (l) => l === 'C' ? 'Car' : l === 'M' ? 'Moto' : l || '—';
const statusLabel  = (s) => s === 'A' ? 'Active' : s === 'C' ? 'Completed' : 'Paused';

/* ─── Skeleton ───────────────────────────────────────────────── */
const Sk = ({ className }) => (
  <div className={cls('animate-pulse bg-white/[0.07] rounded', className)} />
);

/* ─── Toast ──────────────────────────────────────────────────── */
const Toast = ({ toast }) => {
  if (!toast) return null;
  return (
    <div className={cls(
      'fixed bottom-5 right-5 z-50 px-4 py-2.5 rounded-xl text-[12px] font-dm font-semibold',
      'border shadow-xl transition-all',
      toast.type === 'error'
        ? 'bg-red-900/80 text-red-300 border-red-500/30'
        : 'bg-[#1A1200]/90 text-amber-300 border-amber-500/30',
    )}>
      {toast.msg}
    </div>
  );
};

/* ─── Avatar ─────────────────────────────────────────────────── */
const Avatar = ({ pictureUrl, initials, onUpload, uploading }) => {
  const ref = useRef();
  return (
    <div className="relative group w-24 h-24 flex-shrink-0">
      {pictureUrl
        ? <img src={pictureUrl} alt="avatar"
            className="w-24 h-24 rounded-2xl object-cover ring-2 ring-white/10" />
        : (
          <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-amber-500/30 to-orange-700/30
            border border-amber-500/20 flex items-center justify-center
            text-[26px] font-bold text-amber-300 font-sora">
            {initials}
          </div>
        )
      }
      <button onClick={() => ref.current?.click()} disabled={uploading}
        className="absolute inset-0 rounded-2xl bg-black/60 opacity-0 group-hover:opacity-100
          transition-opacity flex items-center justify-center cursor-pointer">
        {uploading
          ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          : (
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="text-white">
              <path d="M9 3v9M5 7l4-4 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 15h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          )
        }
      </button>
      <input ref={ref} type="file" accept="image/*" className="hidden" onChange={onUpload} />
    </div>
  );
};

/* ─── Tab ────────────────────────────────────────────────────── */
const Tab = ({ label, active, onClick, icon }) => (
  <button onClick={onClick}
    className={cls(
      'flex items-center gap-1.5 px-4 py-2.5 text-[11px] font-semibold font-dm transition-all',
      'border-b-2',
      active
        ? 'text-amber-400 border-amber-500'
        : 'text-white/30 border-transparent hover:text-white/60 hover:border-white/20',
    )}>
    <span className="text-[13px]">{icon}</span>
    {label}
  </button>
);

/* ─── Field ──────────────────────────────────────────────────── */
const Field = ({ label, value, loading, wide }) => (
  <div className={wide ? 'col-span-2' : ''}>
    <div className="text-[9px] font-black text-white/20 font-dm tracking-[1px] uppercase mb-1.5">{label}</div>
    {loading
      ? <Sk className="h-4 w-32" />
      : <div className="text-[13px] text-white/75 font-dm">{value || '—'}</div>
    }
  </div>
);

/* ─── Teaching stat card ─────────────────────────────────────── */
const TeachStat = ({ icon, label, value, loading, accent = false }) => (
  <div className={cls(
    'rounded-[14px] px-4 py-4 flex flex-col gap-2 border',
    accent
      ? 'bg-amber-500/[0.07] border-amber-500/20'
      : 'bg-white/[0.03] border-white/[0.06]',
  )}>
    <span className="text-[20px] leading-none">{icon}</span>
    {loading
      ? <Sk className="h-6 w-16" />
      : <span className={cls(
          'font-sora text-[24px] font-black leading-none',
          accent ? 'text-amber-300' : 'text-white',
        )}>
          {value ?? '—'}
        </span>
    }
    <span className="text-[9px] text-white/25 uppercase tracking-[0.6px] font-dm">{label}</span>
  </div>
);

/* ─── Lesson row ─────────────────────────────────────────────── */
const LessonRow = ({ lesson }) => {
  const isPast = lesson.date && new Date(lesson.date) < new Date();
  return (
    <div className="flex items-center gap-3 py-3 border-b border-white/[0.05] last:border-0">
      <div className={cls(
        'w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0',
        isPast ? 'bg-white/[0.04] text-white/30' : 'bg-amber-500/10 text-amber-400',
      )}>
        {isPast ? '✓' : '→'}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[12px] font-semibold text-white truncate">
          {lesson.title || `Lesson #${lesson.id}`}
        </p>
        <p className="text-[10px] text-white/30 mt-0.5">
          {fmtDate(lesson.date)}
          {lesson.lesson_type && (
            <span className="ml-2 text-[9px] font-bold uppercase tracking-[0.5px] text-white/20">
              {lesson.lesson_type === 'T' ? 'Theory' : 'Driving'}
            </span>
          )}
        </p>
      </div>
      {lesson.school_name && (
        <span className="text-[9px] text-white/20 font-dm truncate max-w-[90px]">
          {lesson.school_name}
        </span>
      )}
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────────────────────── */
const InstructorProfilePage = () => {
  const [profile,   setProfile]   = useState(null);
  const [stats,     setStats]     = useState(null);
  const [lessons,   setLessons]   = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [uploading, setUploading] = useState(false);
  const [toast,     setToast]     = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [error,     setError]     = useState('');

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const [prof, st, ls] = await Promise.allSettled([
        instructorApi.getMyProfile(),
        instructorApi.getStats(),
        instructorApi.getLessons(),
      ]);
      if (prof.status === 'fulfilled') setProfile(prof.value);
      else setError('Could not load profile.');
      if (st.status === 'fulfilled') setStats(st.value);
      if (ls.status === 'fulfilled') setLessons(Array.isArray(ls.value) ? ls.value : []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !profile?.id) return;
    setUploading(true);
    try {
      await instructorApi.uploadPicture(profile.id, file);
      await load();
      showToast('Profile picture updated.');
    } catch {
      showToast('Upload failed.', 'error');
    } finally {
      setUploading(false);
    }
  };

  /* ── derived ── */
  const initials = profile
    ? `${profile.user_first_name?.charAt(0) || ''}${profile.user_last_name?.charAt(0) || ''}`.toUpperCase() || '?'
    : '?';
  const fullName = profile
    ? `${profile.user_first_name || ''} ${profile.user_last_name || ''}`.trim() || profile.user_username
    : '';

  const totalLessons    = lessons.length;
  const pastLessons     = lessons.filter(l => l.date && new Date(l.date) < new Date()).length;
  const upcomingLessons = totalLessons - pastLessons;

  const attendanceRate  = stats?.overall_attendance_rate;
  const totalHours      = stats?.total_hours_taught;
  const studentsPresent = stats?.students_present;
  const totalRecords    = stats?.total_attendance_records;

  /* ── rate bar color ── */
  const rateColor = attendanceRate >= 80 ? '#f59e0b' : attendanceRate >= 60 ? '#fb923c' : '#f87171';

  return (
    <div className="flex h-screen bg-[#060B18] overflow-hidden font-dm">
      <Sidebar />

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-5 py-6">

          {/* ── Page heading ── */}
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h1 className="font-sora text-[20px] font-bold text-white">My Profile</h1>
              <p className="text-[12px] text-white/30 mt-0.5">Your instructor identity and teaching record</p>
            </div>
            <button onClick={load}
              className="w-8 h-8 rounded-lg bg-white/[0.04] hover:bg-white/[0.08]
                text-white/30 hover:text-white flex items-center justify-center transition-all"
              title="Refresh">
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                <path d="M11 6.5A4.5 4.5 0 112 6.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                <path d="M11 3v3.5H7.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>

          {error && (
            <div className="mb-4 flex items-center gap-3 bg-red-500/[0.07] border border-red-500/20
              rounded-xl px-4 py-3">
              <p className="text-[12px] text-red-400">{error}</p>
            </div>
          )}

          {/* ── Hero card ── */}
          <div className="bg-[#0B1221] border border-white/[0.07] rounded-2xl overflow-hidden mb-4">

            {/* Banner — amber gradient with subtle texture marks */}
            <div className="relative h-24 bg-gradient-to-r from-amber-900/30 via-orange-900/20 to-[#0B1221] overflow-hidden">
              {/* Decorative tick marks — a nod to driving test score sheets */}
              {[...Array(18)].map((_, i) => (
                <div key={i}
                  className="absolute bottom-0 w-px bg-amber-500/[0.08]"
                  style={{ left: `${(i + 1) * 5.5}%`, height: `${12 + (i % 3) * 8}px` }}
                />
              ))}
              {/* Instructor badge top-right */}
              <div className="absolute top-3 right-4 flex items-center gap-1.5
                bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-1.5">
                <span className="text-[9px] font-black text-amber-400 tracking-[1px] uppercase">
                  Instructor
                </span>
              </div>
            </div>

            {/* Avatar + identity */}
            <div className="px-5 pb-5">
              <div className="flex items-end justify-between -mt-12 mb-4">
                <div className="ring-[3px] ring-[#0B1221] rounded-2xl">
                  <Avatar
                    pictureUrl={profile?.picture_profile_url}
                    initials={initials}
                    onUpload={handleUpload}
                    uploading={uploading}
                  />
                </div>

                {/* Status pill */}
                {loading
                  ? <Sk className="h-6 w-16 rounded-lg" />
                  : (
                    <span className={cls(
                      'text-[10px] font-bold px-3 py-1 rounded-lg border',
                      profile?.status === 'A'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : 'bg-white/[0.05] text-white/40 border-white/[0.08]',
                    )}>
                      {statusLabel(profile?.status)}
                    </span>
                  )
                }
              </div>

              {loading
                ? (
                  <div className="space-y-2">
                    <Sk className="h-5 w-44" />
                    <Sk className="h-3 w-32" />
                    <Sk className="h-3 w-28" />
                  </div>
                )
                : (
                  <>
                    <h2 className="font-sora text-[20px] font-bold text-white leading-tight">
                      {fullName || '—'}
                    </h2>
                    <p className="text-[11px] text-white/35 mt-0.5">@{profile?.user_username}</p>
                    <p className="text-[11px] text-white/35">{profile?.user_email}</p>

                    <div className="flex flex-wrap gap-2 mt-3">
                      {profile?.school_name && (
                        <span className="flex items-center gap-1 text-[10px] font-bold
                          bg-blue-500/10 text-blue-400 border border-blue-500/20
                          rounded-lg px-2.5 py-1">
                          🏫 {profile.school_name}
                        </span>
                      )}
                      {profile?.license_type && (
                        <span className="flex items-center gap-1 text-[10px] font-bold
                          bg-amber-500/10 text-amber-400 border border-amber-500/20
                          rounded-lg px-2.5 py-1">
                          🪪 {licenseLabel(profile.license_type)} License
                        </span>
                      )}
                      <span className="flex items-center gap-1 text-[10px] font-bold
                        bg-white/[0.04] text-white/30 border border-white/[0.07]
                        rounded-lg px-2.5 py-1">
                        📅 Since {fmtDate(profile?.joined_at)}
                      </span>
                    </div>
                  </>
                )
              }
            </div>
          </div>

          {/* ── Teaching impact strip ── */}
          <div className="grid grid-cols-4 gap-3 mb-4">
            <TeachStat icon="📋" label="Total records"   value={totalRecords}    loading={loading} />
            <TeachStat icon="✅" label="Students present" value={studentsPresent}  loading={loading} accent />
            <TeachStat icon="⏱"  label="Hours taught"    value={totalHours != null ? `${Number(totalHours).toFixed(1)}h` : null} loading={loading} />
            <TeachStat icon="📊" label="Attendance rate"
              value={attendanceRate != null ? `${attendanceRate}%` : null}
              loading={loading} />
          </div>

          {/* ── Tabs ── */}
          <div className="flex border-b border-white/[0.07] mb-4 gap-1">
            <Tab label="Overview"   icon="👤" active={activeTab === 'overview'}  onClick={() => setActiveTab('overview')} />
            <Tab label="Details"    icon="📋" active={activeTab === 'details'}   onClick={() => setActiveTab('details')} />
            <Tab label="Lessons"    icon="📚" active={activeTab === 'lessons'}   onClick={() => setActiveTab('lessons')} />
          </div>

          {/* ── Overview tab ── */}
          {activeTab === 'overview' && (
            <div className="flex flex-col gap-4">

              {/* Attendance quality bar */}
              <div className="bg-[#0B1221] border border-white/[0.07] rounded-2xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[10px] font-black text-white/25 uppercase tracking-[0.8px]">
                    Class Attendance Quality
                  </p>
                  {loading
                    ? <Sk className="h-4 w-10" />
                    : <span className="font-sora text-[18px] font-black"
                        style={{ color: rateColor }}>
                        {attendanceRate != null ? `${attendanceRate}%` : '—'}
                      </span>
                  }
                </div>
                <div className="w-full h-2 bg-white/[0.05] rounded-full overflow-hidden">
                  {!loading && (
                    <div className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${attendanceRate ?? 0}%`, background: rateColor }} />
                  )}
                </div>
                <div className="flex justify-between mt-2">
                  <span className="text-[9px] text-white/20">0%</span>
                  <span className="text-[9px] text-white/20">100%</span>
                </div>

                {/* Lesson split */}
                <div className="grid grid-cols-2 gap-3 mt-4">
                  <div className="bg-white/[0.03] border border-white/[0.05] rounded-xl px-4 py-3">
                    <div className="font-sora text-[20px] font-black text-white">{pastLessons}</div>
                    <div className="text-[9px] text-white/25 uppercase tracking-[0.5px]">Lessons taught</div>
                  </div>
                  <div className="bg-amber-500/[0.05] border border-amber-500/15 rounded-xl px-4 py-3">
                    <div className="font-sora text-[20px] font-black text-amber-300">{upcomingLessons}</div>
                    <div className="text-[9px] text-white/25 uppercase tracking-[0.5px]">Upcoming</div>
                  </div>
                </div>
              </div>

              {/* Quick info */}
              <div className="bg-[#0B1221] border border-white/[0.07] rounded-2xl p-5">
                <p className="text-[10px] font-black text-white/25 uppercase tracking-[0.8px] mb-4">
                  Quick Info
                </p>
                <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                  <Field label="Full Name"    value={fullName}                      loading={loading} />
                  <Field label="School"       value={profile?.school_name}          loading={loading} />
                  <Field label="License Type" value={licenseLabel(profile?.license_type)} loading={loading} />
                  <Field label="Status"       value={statusLabel(profile?.status)}  loading={loading} />
                </div>
              </div>
            </div>
          )}

          {/* ── Details tab ── */}
          {activeTab === 'details' && (
            <div className="bg-[#0B1221] border border-white/[0.07] rounded-2xl p-5">
              <p className="text-[10px] font-black text-white/25 uppercase tracking-[0.8px] mb-5">
                Personal & Account Details
              </p>
              <div className="grid grid-cols-2 gap-x-8 gap-y-5">
                <Field label="First Name"    value={profile?.user_first_name}     loading={loading} />
                <Field label="Last Name"     value={profile?.user_last_name}      loading={loading} />
                <Field label="Username"      value={profile?.user_username}       loading={loading} />
                <Field label="Email"         value={profile?.user_email}          loading={loading} />
                <Field label="Phone"         value={profile?.user_phone_number}   loading={loading} />
                <Field label="License Type"  value={licenseLabel(profile?.license_type)} loading={loading} />
                <Field label="School"        value={profile?.school_name}         loading={loading} />
                <Field label="Status"        value={statusLabel(profile?.status)} loading={loading} />
                <Field label="Member Since"  value={fmtDate(profile?.joined_at)}  loading={loading} />
                {profile?.completion_date && (
                  <Field label="Completed"   value={fmtDate(profile.completion_date)} loading={loading} />
                )}
              </div>

              <div className="mt-5 pt-4 border-t border-white/[0.06]">
                <p className="text-[10px] text-white/20 font-dm">
                  To update your personal details, contact your school administrator.
                </p>
              </div>
            </div>
          )}

          {/* ── Lessons tab ── */}
          {activeTab === 'lessons' && (
            <div className="bg-[#0B1221] border border-white/[0.07] rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <p className="text-[10px] font-black text-white/25 uppercase tracking-[0.8px]">
                  Your Lessons
                </p>
                <span className="text-[10px] text-white/20">
                  {lessons.length} total
                </span>
              </div>

              {loading
                ? Array(4).fill(0).map((_, i) => (
                    <div key={i} className="py-3 border-b border-white/[0.05] flex items-center gap-3">
                      <Sk className="w-8 h-8 rounded-lg" />
                      <div className="flex-1">
                        <Sk className="h-3 w-40 mb-1.5" />
                        <Sk className="h-2.5 w-24" />
                      </div>
                    </div>
                  ))
                : lessons.length === 0
                ? (
                  <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
                    <span className="text-3xl opacity-20">📚</span>
                    <p className="text-[12px] text-white/25">No lessons assigned yet.</p>
                  </div>
                )
                : lessons.map(l => <LessonRow key={l.id} lesson={l} />)
              }
            </div>
          )}

        </div>
      </div>

      <Toast toast={toast} />
    </div>
  );
};

export default InstructorProfilePage;