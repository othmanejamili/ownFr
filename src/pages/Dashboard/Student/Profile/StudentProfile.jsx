import { useState, useEffect, useRef } from 'react';
import { studentApi } from '../Progress/Studentapi';
import Sidebar from '../Dashboard/Sidebar';

/* ── Tiny helpers ─────────────────────────────────────────── */
const Skeleton = ({ className }) => (
  <div className={`animate-pulse bg-white/10 rounded ${className}`} />
);

const Badge = ({ children, color = 'blue' }) => {
  const map = {
    blue:   'bg-blue-600/20 text-blue-400 border-blue-500/20',
    green:  'bg-emerald-500/20 text-emerald-400 border-emerald-500/20',
    amber:  'bg-amber-500/20 text-amber-400 border-amber-500/20',
    red:    'bg-red-500/20 text-red-400 border-red-500/20',
    violet: 'bg-violet-500/20 text-violet-400 border-violet-500/20',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold border font-dm ${map[color]}`}>
      {children}
    </span>
  );
};

const Field = ({ label, value, loading }) => (
  <div>
    <div className="text-[10px] font-bold text-white/25 font-dm tracking-[0.6px] mb-1">{label}</div>
    {loading
      ? <Skeleton className="h-4 w-32" />
      : <div className="text-[13px] text-white/80 font-dm">{value || '—'}</div>}
  </div>
);

const licenseLabel = (l) => l === 'C' ? 'Car' : l === 'M' ? 'Moto' : '—';
const statusColor  = (s) => s === 'A' ? 'green' : s === 'C' ? 'blue' : 'amber';
const statusLabel  = (s) => s === 'A' ? 'Active' : s === 'C' ? 'Completed' : 'Paused';

const fmtDate = (d) => {
  if (!d) return '—';
  const dt = new Date(d);
  if (isNaN(dt)) return '—';
  return dt.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

/* ── Circular progress ring ───────────────────────────────── */
const Ring = ({ value = 0, size = 100, stroke = 7, color = '#3B82F6', label }) => {
  const r     = (size - stroke) / 2;
  const cx    = size / 2;
  const circ  = 2 * Math.PI * r;
  const offset = circ - (value / 100) * circ;
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90" style={{ display: 'block' }}>
          <circle cx={cx} cy={cx} r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={stroke} />
          <circle
            cx={cx} cy={cx} r={r} fill="none"
            stroke={color} strokeWidth={stroke}
            strokeDasharray={circ} strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.8s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[18px] font-bold text-white font-dm">{Math.round(value)}%</span>
        </div>
      </div>
      {label && <span className="text-[11px] text-white/40 font-dm">{label}</span>}
    </div>
  );
};

/* ── Progress bar ─────────────────────────────────────────── */
const ProgressBar = ({ value = 0, color = '#3B82F6' }) => (
  <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
    <div
      className="h-full rounded-full transition-all duration-700"
      style={{ width: `${Math.min(100, value)}%`, background: color }}
    />
  </div>
);

/* ── Stat metric card ─────────────────────────────────────── */
const StatCard = ({ icon, label, value, loading }) => (
  <div className="bg-white/[0.04] rounded-xl p-3 flex flex-col gap-1">
    <div className="text-[18px] leading-none">{icon}</div>
    {loading
      ? <Skeleton className="h-4 w-16 mt-1" />
      : <div className="text-[15px] font-bold text-white font-dm">{value || '—'}</div>}
    <div className="text-[10px] text-white/30 font-dm">{label}</div>
  </div>
);

/* ── Avatar upload button ─────────────────────────────────── */
const AvatarUpload = ({ pictureUrl, initials, onUpload, uploading }) => {
  const ref = useRef();
  return (
    <div className="relative group w-20 h-20 flex-shrink-0">
      {pictureUrl
        ? <img src={pictureUrl} alt="avatar" className="w-20 h-20 rounded-full object-cover ring-2 ring-white/20" />
        : (
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-violet-600
            flex items-center justify-center text-[22px] font-bold text-white">
            {initials}
          </div>
        )
      }
      <button
        onClick={() => ref.current?.click()}
        disabled={uploading}
        className="absolute inset-0 rounded-full bg-black/60 opacity-0 group-hover:opacity-100
          transition-opacity flex items-center justify-center cursor-pointer"
      >
        {uploading
          ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
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

/* ── Tab button ───────────────────────────────────────────── */
const Tab = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 text-[12px] font-semibold font-dm transition-colors border-b-2 ${
      active
        ? 'text-white border-blue-500'
        : 'text-white/30 border-transparent hover:text-white/60'
    }`}
  >
    {label}
  </button>
);

/* ════════════════════════════════════════════════════════════
   ProfilePage
═══════════════════════════════════════════════════════════ */
const ProfilePage = () => {
  const [profile,   setProfile]   = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);
  const [uploading, setUploading] = useState(false);
  const [toast,     setToast]     = useState(null);
  const [activeTab, setActiveTab] = useState('personal');

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await studentApi.getMyProfile();
      setProfile(data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Could not load profile.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !profile?.id) return;
    setUploading(true);
    try {
      await studentApi.uploadProfilePicture(profile.id, file);
      await load();
      showToast('Profile picture updated.');
    } catch {
      showToast('Upload failed.', 'error');
    } finally {
      setUploading(false);
    }
  };

  const initials = profile
    ? `${profile.user_first_name?.charAt(0) || ''}${profile.user_last_name?.charAt(0) || ''}`.toUpperCase() || '?'
    : '?';
  const fullName = profile
    ? `${profile.user_first_name || ''} ${profile.user_last_name || ''}`.trim() || profile.user_username
    : '';

  const theoryPct  = parseFloat(profile?.progress_theory  || 0);
  const drivingPct = parseFloat(profile?.progress_driving || 0);

  return (
    <div className="flex h-screen bg-[#060E1C] overflow-hidden">
      <Sidebar />

      {/* Main scroll area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-4 py-6">

          {/* Page title */}
          <div className="mb-5">
            <h1 className="font-sora text-[20px] font-bold text-white">My Profile</h1>
            <p className="text-[12px] text-white/30 font-dm mt-0.5">Manage your personal information</p>
          </div>

          {/* ── Hero card ── */}
          <div className="bg-[#0B1221] border border-white/[0.07] rounded-2xl overflow-hidden mb-4">

            {/* Banner */}
            <div className="h-20 bg-gradient-to-r from-blue-900/40 to-violet-900/30" />

            {/* Avatar + name row */}
            <div className="px-5 pb-5">
              <div className="flex items-end justify-between -mt-10 mb-3">
                <div className="ring-2 ring-[#0B1221] rounded-full">
                  <AvatarUpload
                    pictureUrl={profile?.picture_profile_url}
                    initials={initials}
                    onUpload={handleUpload}
                    uploading={uploading}
                  />
                </div>
                <Badge color={statusColor(profile?.status)}>
                  {loading ? '…' : statusLabel(profile?.status)}
                </Badge>
              </div>

              {loading ? (
                <div className="space-y-2">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-3 w-28" />
                </div>
              ) : (
                <>
                  <h2 className="font-sora text-[18px] font-bold text-white">{fullName || '—'}</h2>
                  <p className="text-[11px] text-white/35 font-dm mt-0.5">@{profile?.user_username}</p>
                  <p className="text-[11px] text-white/35 font-dm">{profile?.user_email}</p>
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {profile?.license_type && (
                      <Badge color="violet">{licenseLabel(profile.license_type)} License</Badge>
                    )}
                    <Badge color="blue">{profile?.school_name || 'No school'}</Badge>
                  </div>
                </>
              )}

              {/* Stat cards */}
              <div className="grid grid-cols-3 gap-3 mt-4">
                <StatCard icon="📚" label="Theory hours"  value={profile?.total_hours_theory  ? `${profile.total_hours_theory}h`  : null} loading={loading} />
                <StatCard icon="🚗" label="Driving hours" value={profile?.total_hours_driving ? `${profile.total_hours_driving}h` : null} loading={loading} />
                <StatCard icon="📅" label="Enrolled"      value={fmtDate(profile?.joined_at)} loading={loading} />
              </div>
            </div>
          </div>

          {/* ── Tabs ── */}
          <div className="flex border-b border-white/[0.07] mb-4">
            <Tab label="Personal" active={activeTab === 'personal'} onClick={() => setActiveTab('personal')} />
            <Tab label="Account"  active={activeTab === 'account'}  onClick={() => setActiveTab('account')}  />
            <Tab label="Progress" active={activeTab === 'progress'} onClick={() => setActiveTab('progress')} />
          </div>

          {/* ── Personal tab ── */}
          {activeTab === 'personal' && (
            <div className="bg-[#0B1221] border border-white/[0.07] rounded-2xl p-5">
              <h3 className="text-[10px] font-bold text-white/25 font-dm tracking-[0.8px] mb-4">PERSONAL DETAILS</h3>
              {error
                ? <p className="text-[12px] text-red-400/70 font-dm">{error}</p>
                : (
                  <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                    <Field label="FIRST NAME"   value={profile?.user_first_name}           loading={loading} />
                    <Field label="LAST NAME"    value={profile?.user_last_name}            loading={loading} />
                    <Field label="EMAIL"        value={profile?.user_email}                loading={loading} />
                    <Field label="PHONE"        value={profile?.user_phone_number}         loading={loading} />
                    <Field label="SCHOOL"       value={profile?.school_name}               loading={loading} />
                    <Field label="LICENSE TYPE" value={licenseLabel(profile?.license_type)} loading={loading} />
                    {profile?.completion_date && (
                      <Field label="COMPLETED"  value={fmtDate(profile.completion_date)}  loading={loading} />
                    )}
                  </div>
                )
              }
            </div>
          )}

          {/* ── Account tab ── */}
          {activeTab === 'account' && (
            <div className="bg-[#0B1221] border border-white/[0.07] rounded-2xl p-5">
              <h3 className="text-[10px] font-bold text-white/25 font-dm tracking-[0.8px] mb-4">ACCOUNT</h3>
              <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                <Field label="USERNAME"       value={profile?.user_username}    loading={loading} />
                <Field label="ACCOUNT STATUS" value={statusLabel(profile?.status)} loading={loading} />
                <Field label="MEMBER SINCE"   value={fmtDate(profile?.joined_at)} loading={loading} />
              </div>
            </div>
          )}

          {/* ── Progress tab ── */}
          {activeTab === 'progress' && (
            <div className="bg-[#0B1221] border border-white/[0.07] rounded-2xl p-5">
              <h3 className="text-[10px] font-bold text-white/25 font-dm tracking-[0.8px] mb-5">PROGRESS OVERVIEW</h3>

              {/* Rings */}
              <div className="flex justify-center gap-12 mb-6">
                <Ring value={theoryPct}  size={100} stroke={7} color="#3B82F6" label="Theory" />
                <Ring value={drivingPct} size={100} stroke={7} color="#8B5CF6" label="Driving" />
              </div>

              {/* Progress detail cards */}
              <div className="grid grid-cols-2 gap-3">
                {/* Theory */}
                <div className="bg-white/[0.04] rounded-xl p-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] text-white/40 font-dm">Theory hours</span>
                    <span className="text-[10px] text-blue-400 font-dm font-bold">{Math.round(theoryPct)}%</span>
                  </div>
                  <div className="text-[20px] font-bold text-white font-dm mb-2">
                    {profile?.total_hours_theory || 0}
                    <span className="text-[12px] text-white/30 font-normal ml-1">h done</span>
                  </div>
                  <ProgressBar value={theoryPct} color="#3B82F6" />
                </div>

                {/* Driving */}
                <div className="bg-white/[0.04] rounded-xl p-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] text-white/40 font-dm">Driving hours</span>
                    <span className="text-[10px] text-violet-400 font-dm font-bold">{Math.round(drivingPct)}%</span>
                  </div>
                  <div className="text-[20px] font-bold text-white font-dm mb-2">
                    {profile?.total_hours_driving || 0}
                    <span className="text-[12px] text-white/30 font-normal ml-1">h done</span>
                  </div>
                  <ProgressBar value={drivingPct} color="#8B5CF6" />
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-5 right-5 px-4 py-2.5 rounded-xl text-[12px] font-dm font-semibold shadow-lg z-50 transition-all
          ${toast.type === 'error' ? 'bg-red-500/20 text-red-300 border border-red-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'}`}>
          {toast.msg}
        </div>
      )}
    </div>
  );
};

export default ProfilePage;