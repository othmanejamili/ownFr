import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
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

/* ── Circular progress ring ───────────────────────────────── */
const Ring = ({ value = 0, size = 80, stroke = 6, color = '#3B82F6', label }) => {
  const r     = (size - stroke) / 2;
  const cx    = size / 2;
  const circ  = 2 * Math.PI * r;
  const offset = circ - (value / 100) * circ;
  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={cx} cy={cx} r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={stroke} />
        <circle
          cx={cx} cy={cx} r={r} fill="none"
          stroke={color} strokeWidth={stroke}
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.8s ease' }}
        />
      </svg>
      <div className="flex flex-col items-center -mt-[64px] mb-[14px]">
        <span className="text-[16px] font-bold text-white font-dm">{Math.round(value)}%</span>
      </div>
      {label && <span className="text-[10px] text-white/40 font-dm">{label}</span>}
    </div>
  );
};

/* ── Avatar upload button ─────────────────────────────────── */
const AvatarUpload = ({ pictureUrl, initials, onUpload, uploading }) => {
  const ref = useRef();
  return (
    <div className="relative group w-20 h-20 flex-shrink-0">
      {pictureUrl
        ? <img src={pictureUrl} alt="avatar" className="w-20 h-20 rounded-2xl object-cover ring-2 ring-blue-500/30" />
        : (
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600
            flex items-center justify-center text-[22px] font-bold text-white">
            {initials}
          </div>
        )
      }
      <button
        onClick={() => ref.current?.click()}
        disabled={uploading}
        className="absolute inset-0 rounded-2xl bg-black/60 opacity-0 group-hover:opacity-100
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



/* ════════════════════════════════════════════════════════════
   ProfilePage
═══════════════════════════════════════════════════════════ */
const ProfilePage = () => {
  const [profile,   setProfile]   = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);
  const [uploading, setUploading] = useState(false);
  const [toast,     setToast]     = useState(null);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await studentApi.getMyProfile();   // ← was fetchMyProfile()
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
      await studentApi.uploadProfilePicture(profile.id, file);   // ← was uploadProfilePicture()
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

  return (
    
    <div className="flex h-screen bg-[#060E1C] overflow-hidden">
      <Sidebar />

      {/* Page header */}
      <div className="mb-6">
        <h1 className="font-sora text-[20px] font-bold text-white">My Profile</h1>
        <p className="text-[12px] text-white/30 font-dm mt-0.5">Manage your personal information</p>
      </div>

      {/* Hero card */}
      <div className="bg-[#0B1221] border border-white/[0.07] rounded-2xl p-5 mb-4">
        <div className="flex items-start gap-4">
          <AvatarUpload
            pictureUrl={profile?.picture_profile_url}
            initials={initials}
            onUpload={handleUpload}
            uploading={uploading}
          />

          <div className="flex-1 min-w-0">
            {loading
              ? <div className="space-y-2"><Skeleton className="h-5 w-40" /><Skeleton className="h-3 w-28" /></div>
              : (
                <>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="font-sora text-[16px] font-bold text-white">{fullName || '—'}</h2>
                    <Badge color={statusColor(profile?.status)}>
                      {statusLabel(profile?.status)}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-white/35 font-dm mt-0.5">
                    @{profile?.user_username}
                  </p>
                  <p className="text-[11px] text-white/35 font-dm">
                    {profile?.user_email}
                  </p>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    {profile?.license_type && (
                      <Badge color="violet">
                        {licenseLabel(profile.license_type)} License
                      </Badge>
                    )}
                    <Badge color="blue">{profile?.school_name || 'No school'}</Badge>
                  </div>
                </>
              )
            }
          </div>


        </div>

        {/* Quick progress rings */}
        {!loading && profile && (
          <div className="mt-5 pt-4 border-t border-white/[0.06] flex gap-6">
            <Ring
              value={parseFloat(profile.progress_theory  || 0)}
              size={72} stroke={5}
              color="#3B82F6"
              label="Theory"
            />
            <Ring
              value={parseFloat(profile.progress_driving || 0)}
              size={72} stroke={5}
              color="#8B5CF6"
              label="Driving"
            />
            <div className="flex-1 flex flex-col justify-center gap-3 pl-4">
              <StatRow icon="📚" label="Theory hours"  value={`${profile.total_hours_theory}h`} />
              <StatRow icon="🚗" label="Driving hours" value={`${profile.total_hours_driving}h`} />
              <StatRow icon="📅" label="Enrolled"      value={fmtDate(profile.joined_at)} />
            </div>
          </div>
        )}
      </div>

      {/* Details grid */}
      <div className="bg-[#0B1221] border border-white/[0.07] rounded-2xl p-5 mb-4">
        <h3 className="text-[11px] font-bold text-white/25 font-dm tracking-[0.8px] mb-4">PERSONAL DETAILS</h3>
        {error
          ? <p className="text-[12px] text-red-400/70 font-dm">{error}</p>
          : (
            <div className="grid grid-cols-2 gap-x-8 gap-y-4">
              <Field label="FIRST NAME"    value={profile?.user_first_name}             loading={loading} />
              <Field label="LAST NAME"     value={profile?.user_last_name}              loading={loading} />
              <Field label="EMAIL"         value={profile?.user_email}                  loading={loading} />
              <Field label="PHONE"         value={profile?.user_phone_number}           loading={loading} />
              <Field label="SCHOOL"        value={profile?.school_name}                 loading={loading} />
              <Field label="LICENSE TYPE"  value={licenseLabel(profile?.license_type)}   loading={loading} />
              {profile?.completion_date && (
                <Field label="COMPLETED"   value={fmtDate(profile?.completion_date)}     loading={loading} />
              )}
            </div>
          )
        }
      </div>

      {/* Account info */}
      <div className="bg-[#0B1221] border border-white/[0.07] rounded-2xl p-5">
        <h3 className="text-[11px] font-bold text-white/25 font-dm tracking-[0.8px] mb-4">ACCOUNT</h3>
        <div className="grid grid-cols-2 gap-x-8 gap-y-4">
          <Field label="USERNAME"       value={profile?.user_username}                        loading={loading} />
          <Field label="ACCOUNT STATUS" value={profile?.status}             loading={loading} />
          <Field label="MEMBER SINCE"   value={fmtDate(profile?.joined_at)}            loading={loading} />
        </div>
      </div>
    </div>
  );
};
/* ── Helpers ─────────────────────────────────────────────── */
const StatRow = ({ icon, label, value }) => (
  <div className="flex items-center gap-2">
    <span className="text-[13px]">{icon}</span>
    <span className="text-[11px] text-white/35 font-dm flex-1">{label}</span>
    <span className="text-[12px] font-semibold text-white/70 font-dm">{value}</span>
  </div>
);

const fmtDate = (d, withTime = false) => {
  if (!d) return '—';
  const dt = new Date(d);
  if (isNaN(dt)) return '—';
  return withTime
    ? dt.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    : dt.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

export default ProfilePage;