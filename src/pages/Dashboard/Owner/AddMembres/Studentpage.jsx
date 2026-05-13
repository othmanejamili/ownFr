// src/pages/StudentsPage/StudentsPage.jsx

import { useState, useEffect, useCallback } from 'react';
import Sidebar from '../Sidebar';
import AddMemberModal from '../AddMembres/Addmembermodal';
import { membersApi } from '../AddMembres/Membersapi';
import StudentDetailPage from '../AddMembres/Studentdetailpage';

/* ── primitives ──────────────────────────────────────────────── */
const cls = (...a) => a.filter(Boolean).join(' ');

const AVATAR_COLORS = [
  'bg-blue-700', 'bg-violet-700', 'bg-emerald-700',
  'bg-amber-700', 'bg-teal-700', 'bg-rose-700',
];
const getAvatarColor = str => AVATAR_COLORS[(str?.charCodeAt(0) || 0) % AVATAR_COLORS.length];
const initials = (fn, ln) => `${(fn || '?')[0]}${(ln || '')[0] || ''}`.toUpperCase();

/* ── Skeleton row ─────────────────────────────────────────────── */
const SkeletonRow = () => (
  <tr>
    {[40, 120, 100, 80, 80, 60].map((w, i) => (
      <td key={i} className="px-4 py-3.5">
        <div className="h-3 rounded-full bg-white/[0.05] animate-pulse"
          style={{ width: w }} />
      </td>
    ))}
  </tr>
);

/* ── Empty state ─────────────────────────────────────────────── */
const EmptyState = ({ onAdd }) => (
  <tr>
    <td colSpan={7}>
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <div className="w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/[0.07]
          flex items-center justify-center text-2xl">
          👨‍🎓
        </div>
        <div className="text-center">
          <p className="font-sora text-[14px] font-bold text-white/60">No students yet</p>
          <p className="text-[11px] text-white/25 mt-1">
            Add your first student to get started.
          </p>
        </div>
        <button onClick={onAdd}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500
            rounded-xl text-[12px] font-semibold text-white transition-all">
          <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
            <path d="M5.5 1v9M1 5.5h9" stroke="white" strokeWidth="1.6" strokeLinecap="round"/>
          </svg>
          Add student
        </button>
      </div>
    </td>
  </tr>
);

/* ── Progress bar ─────────────────────────────────────────────── */
const ProgressBar = ({ value, color = 'bg-blue-500' }) => (
  <div className="flex items-center gap-2">
    <div className="w-20 h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
      <div className={`h-full rounded-full transition-all ${color}`}
        style={{ width: `${Math.min(100, value || 0)}%` }} />
    </div>
    <span className={cls(
      'text-[10px] font-semibold',
      value >= 80 ? 'text-emerald-400' : value >= 40 ? 'text-blue-400' : 'text-amber-400',
    )}>
      {Math.round(value || 0)}%
    </span>
  </div>
);

/* ── Status badge ────────────────────────────────────────────── */
const StatusBadge = ({ status }) => {
  const map = {
    A: { label: 'Active',    cls: 'bg-emerald-500/12 text-emerald-400 border-emerald-500/20' },
    C: { label: 'Completed', cls: 'bg-blue-600/12 text-blue-400 border-blue-500/20' },
    P: { label: 'Paused',    cls: 'bg-amber-500/12 text-amber-400 border-amber-500/20' },
  };
  const s = map[status] || { label: status, cls: 'bg-white/[0.06] text-white/40 border-white/[0.08]' };
  return (
    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md border ${s.cls}`}>
      {s.label}
    </span>
  );
};

/* ── License badge ───────────────────────────────────────────── */
const LicenseBadge = ({ type }) => (
  <span className="text-[9px] font-bold px-2 py-0.5 rounded-md
    bg-white/[0.05] text-white/40 border border-white/[0.07]">
    {type === 'C' ? '🚗 Car' : type === 'M' ? '🏍 Moto' : '—'}
  </span>
);

/* ── Search bar ───────────────────────────────────────────────── */
const SearchBar = ({ value, onChange }) => (
  <div className="relative">
    <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20"
      width="13" height="13" viewBox="0 0 13 13" fill="none">
      <circle cx="5.5" cy="5.5" r="4" stroke="currentColor" strokeWidth="1.3"/>
      <path d="M9 9l2.5 2.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
    <input
      type="text"
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder="Search students…"
      className="w-full bg-white/[0.03] border border-white/[0.07] rounded-xl
        pl-9 pr-4 py-2 text-[12px] text-white placeholder:text-white/20
        outline-none focus:border-blue-500/50 focus:bg-white/[0.05]
        transition-all"
    />
  </div>
);

/* ── Student row ─────────────────────────────────────────────── */
const StudentRow = ({ profile, onDelete, onSelect }) => {
  const fullName =
    [profile.user_first_name, profile.user_last_name].filter(Boolean).join(' ')
    || profile.user_username;
  const theory  = parseFloat(profile.progress_theory  || 0);
  const driving = parseFloat(profile.progress_driving || 0);

  return (
    <tr
      onClick={() => onSelect(profile.id)}
      className="border-b border-white/[0.03] hover:bg-white/[0.03]
        transition-colors group cursor-pointer"
    >
      {/* Avatar */}
      <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
        {profile.picture_profile_url ? (
          <img
            src={profile.picture_profile_url}
            alt={profile.user_username}
            className="w-8 h-8 rounded-[9px] object-cover"
          />
        ) : (
          <div className={cls(
            'w-8 h-8 rounded-[9px] flex items-center justify-center',
            'text-[10px] font-bold text-white flex-shrink-0',
            getAvatarColor(profile.user_username),
          )}>
            {initials(profile.user_first_name, profile.user_last_name)
              || profile.user_username?.[0]?.toUpperCase()}
          </div>
        )}
      </td>

      {/* Name */}
      <td className="px-4 py-3">
        <div className="text-[12px] font-semibold text-white">{fullName}</div>
        <div className="text-[10px] text-white/35 mt-0.5">@{profile.user_username}</div>
      </td>

      {/* Email */}
      <td className="px-4 py-3 text-[11px] text-white/45">{profile.user_email || '—'}</td>

      {/* License */}
      <td className="px-4 py-3"><LicenseBadge type={profile.license_type} /></td>

      {/* Progress */}
      <td className="px-4 py-3">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5">
            <span className="text-[9px] text-white/25 w-9">Theory</span>
            <ProgressBar value={theory} color={theory >= 80 ? 'bg-emerald-500' : 'bg-blue-500'} />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[9px] text-white/25 w-9">Drive</span>
            <ProgressBar value={driving} color={driving >= 80 ? 'bg-emerald-500' : 'bg-violet-500'} />
          </div>
        </div>
      </td>

      {/* Status */}
      <td className="px-4 py-3"><StatusBadge status={profile.status} /></td>

      {/* Actions */}
      <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          {/* View detail */}
          <button
            onClick={() => onSelect(profile.id)}
            className="w-6 h-6 rounded-lg bg-blue-500/10 hover:bg-blue-500/20
              text-blue-400 flex items-center justify-center transition-colors"
            title="View profile"
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M1 5s1.5-3 4-3 4 3 4 3-1.5 3-4 3-4-3-4-3z"
                stroke="currentColor" strokeWidth="1.2"/>
              <circle cx="5" cy="5" r="1.2" stroke="currentColor" strokeWidth="1.2"/>
            </svg>
          </button>
          {/* Delete */}
          <button
            onClick={() => onDelete(profile.id)}
            className="w-6 h-6 rounded-lg bg-red-500/10 hover:bg-red-500/20
              text-red-400 flex items-center justify-center transition-colors text-[11px]"
            title="Remove"
          >
            ×
          </button>
        </div>
      </td>
    </tr>
  );
};

/* ── Confirm delete dialog ───────────────────────────────────── */
const ConfirmDialog = ({ open, onConfirm, onCancel, loading }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      style={{ background: 'rgba(6,11,24,0.8)', backdropFilter: 'blur(6px)' }}>
      <div className="bg-[#0F1A2E] border border-white/[0.08] rounded-2xl p-6 w-full max-w-[320px]">
        <div className="text-center mb-5">
          <div className="text-3xl mb-3">⚠️</div>
          <h3 className="font-sora text-[15px] font-bold text-white">Remove student?</h3>
          <p className="text-[12px] text-white/40 mt-1.5">
            This will remove the profile from your school. The user account will remain.
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

/* ─────────────────────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────────────────────── */
const StudentsPage = () => {
  const [profiles,          setProfiles]          = useState([]);
  const [schoolId,          setSchoolId]          = useState(null);
  const [loading,           setLoading]           = useState(true);
  const [search,            setSearch]            = useState('');
  const [modalOpen,         setModalOpen]         = useState(false);
  const [deleteId,          setDeleteId]          = useState(null);
  const [deleting,          setDeleting]          = useState(false);
  const [error,             setError]             = useState('');
  const [selectedProfileId, setSelectedProfileId] = useState(null); // ← detail view

  /* ── fetch school id once ── */
  useEffect(() => {
    membersApi.getMySchools()
      .then(schools => {
        if (schools.length > 0) setSchoolId(schools[0].id);
        else setError('No school found. Create your school first.');
      })
      .catch(() => setError('Failed to load school info.'));
  }, []);

  /* ── fetch student profiles ── */
  const fetchProfiles = useCallback(async () => {
    if (!schoolId) return;
    setLoading(true);
    setError('');
    try {
      const data = await membersApi.getStudentProfiles(search);
      const all  = Array.isArray(data) ? data : [];
      setProfiles(all.filter(p => p.user_role === 'S'));
    } catch {
      setError('Failed to load students.');
    } finally {
      setLoading(false);
    }
  }, [schoolId, search]);

  useEffect(() => { fetchProfiles(); }, [fetchProfiles]);

  /* ── delete ── */
  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await membersApi.deleteProfile(deleteId);
      setProfiles(p => p.filter(x => x.id !== deleteId));
    } catch {
      setError('Failed to remove student.');
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  };

  /* ── show detail page ── */
  if (selectedProfileId) {
    return (
      <div className="flex h-screen bg-[#060B18] overflow-hidden font-dm">
        <Sidebar />
        <StudentDetailPage
          profileId={selectedProfileId}
          onBack={() => {
            setSelectedProfileId(null);
            fetchProfiles(); // refresh list in case something changed
          }}
        />
      </div>
    );
  }

  const tableHeaders = ['', 'Name', 'Email', 'License', 'Progress', 'Status', ''];

  return (
    <div className="flex h-screen bg-[#060B18] overflow-hidden font-dm">
      <Sidebar />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">

        {/* ── Page header ── */}
        <header className="h-[52px] flex-shrink-0 bg-[#0B1221] border-b border-white/[0.06]
          flex items-center gap-3 px-5">
          <div className="flex items-baseline gap-2">
            <span className="font-sora text-[14px] font-bold text-white">Students</span>
            <span className="text-[11px] text-white/30">Your school's students</span>
          </div>
          <div className="flex-1" />
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600
              hover:bg-blue-500 rounded-[7px] text-[11px] font-semibold text-white
              transition-all font-dm">
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M5 1v8M1 5h8" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            Add student
          </button>
        </header>

        {/* ── Main content ── */}
        <main className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">

          {/* Error banner */}
          {error && (
            <div className="flex items-center gap-3 bg-red-500/[0.07] border border-red-500/20
              rounded-xl px-4 py-3">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <circle cx="7" cy="7" r="6" stroke="#f87171" strokeWidth="1.3"/>
                <path d="M7 4.5v3" stroke="#f87171" strokeWidth="1.3" strokeLinecap="round"/>
                <circle cx="7" cy="9.5" r="0.7" fill="#f87171"/>
              </svg>
              <p className="text-[12px] text-red-400">{error}</p>
            </div>
          )}

          {/* ── Stats strip ── */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: '👨‍🎓', label: 'Total students',   value: profiles.length },
              { icon: '✅',   label: 'Active students',  value: profiles.filter(p => p.status === 'A').length },
              { icon: '🎓',   label: 'Completed',        value: profiles.filter(p => p.status === 'C').length },
            ].map(card => (
              <div key={card.label}
                className="bg-[#0F1A2E] border border-white/[0.07] rounded-[14px] px-4 py-3.5
                  hover:border-white/[0.12] transition-colors">
                <div className="text-xl mb-2">{card.icon}</div>
                <div className="font-sora text-[24px] font-black text-white tracking-tight">
                  {card.value}
                </div>
                <div className="text-[10px] text-white/30 mt-0.5">{card.label}</div>
              </div>
            ))}
          </div>

          {/* ── Table card ── */}
          <div className="bg-[#0F1A2E] border border-white/[0.07] rounded-[14px] flex flex-col overflow-hidden">

            {/* Toolbar */}
            <div className="flex items-center gap-3 px-5 py-3.5 border-b border-white/[0.06]">
              <div className="flex-1 max-w-[260px]">
                <SearchBar value={search} onChange={setSearch} />
              </div>
              <div className="flex-1" />
              {/* Refresh */}
              <button onClick={fetchProfiles}
                className="w-8 h-8 rounded-lg bg-white/[0.04] hover:bg-white/[0.08]
                  text-white/30 hover:text-white flex items-center justify-center transition-all">
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                  <path d="M11 6.5A4.5 4.5 0 112 6.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                  <path d="M11 3v3.5H7.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    {tableHeaders.map((h, i) => (
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
                    : profiles.length === 0
                    ? <EmptyState onAdd={() => setModalOpen(true)} />
                    : profiles.map(profile => (
                        <StudentRow
                          key={profile.id}
                          profile={profile}
                          onDelete={setDeleteId}
                          onSelect={setSelectedProfileId}
                        />
                      ))
                  }
                </tbody>
              </table>
            </div>

            {/* Footer */}
            {!loading && profiles.length > 0 && (
              <div className="px-5 py-3 border-t border-white/[0.05] flex items-center justify-between">
                <span className="text-[10px] text-white/25">
                  {profiles.length} students total
                </span>
                <span className="text-[10px] text-white/20">
                  {profiles.filter(p => p.status === 'A').length} active
                  {' · '}
                  {profiles.filter(p => p.status === 'C').length} completed
                </span>
              </div>
            )}
          </div>

        </main>
      </div>

      {/* Add student modal */}
      <AddMemberModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={() => {
          setModalOpen(false);
          fetchProfiles();
        }}
        schoolId={schoolId}
        mode="student"
      />

      {/* Confirm delete */}
      <ConfirmDialog
        open={!!deleteId}
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
};

export default StudentsPage;