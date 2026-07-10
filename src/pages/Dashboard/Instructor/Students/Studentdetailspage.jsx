// src/pages/StudentDetailPage/StudentDetailPage.jsx
//
// APIs used:
//   GET    /api/studentprofile/{id}/                        → load profile
//   PATCH  /api/studentprofile/{id}/                        → update profile fields / picture
//   GET    /api/studentprofile/{id}/progress/               → detailed progress
//   POST   /api/studentprofile/{id}/update_progress/        → instructor updates hours
//   GET    /api/studentprofile/{id}/performance_prediction/ → AI prediction

import { useState, useEffect, useRef } from 'react';
import { studentApi } from './Studentsapi';

/* ─────────────────── helpers ─────────────────── */
const cls = (...a) => a.filter(Boolean).join(' ');

const AVATAR_COLORS = [
  '#1d4ed8','#6d28d9','#047857','#b45309','#0f766e','#be123c',
];
const avatarColor = str =>
  AVATAR_COLORS[(str?.charCodeAt(0) || 0) % AVATAR_COLORS.length];

const initials = (fn, ln) =>
  `${(fn||'?')[0]}${(ln||'')[0]||''}`.toUpperCase();

const fmt = dateStr =>
  dateStr
    ? new Date(dateStr).toLocaleDateString('en-GB',
        { day:'2-digit', month:'short', year:'numeric' })
    : '—';

/* ─────────────────── primitives ─────────────────── */

const Spinner = ({ size = 16 }) => (
  <svg className="animate-spin" width={size} height={size} viewBox="0 0 16 16" fill="none">
    <circle cx="8" cy="8" r="6" stroke="rgba(255,255,255,0.2)" strokeWidth="1.6"/>
    <path d="M8 2a6 6 0 016 6" stroke="white" strokeWidth="1.6" strokeLinecap="round"/>
  </svg>
);

const Badge = ({ children, color = 'blue' }) => {
  const map = {
    blue:    'bg-blue-500/10 text-blue-400 border-blue-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    amber:   'bg-amber-500/10 text-amber-400 border-amber-500/20',
    red:     'bg-red-500/10 text-red-400 border-red-500/20',
    violet:  'bg-violet-500/10 text-violet-400 border-violet-500/20',
    gray:    'bg-white/[0.06] text-white/40 border-white/[0.08]',
  };
  return (
    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md border ${map[color] ?? map.gray}`}>
      {children}
    </span>
  );
};

const statusColor = s => s === 'A' ? 'emerald' : s === 'C' ? 'blue' : 'amber';
const statusLabel = s => s === 'A' ? 'Active' : s === 'C' ? 'Completed' : s === 'P' ? 'Paused' : s;

const riskColor = level => {
  if (!level) return 'gray';
  const l = level.toLowerCase();
  if (l === 'low')    return 'emerald';
  if (l === 'medium') return 'amber';
  if (l === 'high')   return 'red';
  return 'gray';
};

/* radial progress ring */
const Ring = ({ value, size = 88, stroke = 7, color = '#3b82f6', label }) => {
  const r   = (size - stroke) / 2;
  const c   = 2 * Math.PI * r;
  const pct = Math.min(100, Math.max(0, value || 0));
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform:'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none"
          stroke="rgba(255,255,255,0.05)" strokeWidth={stroke}/>
        <circle cx={size/2} cy={size/2} r={r} fill="none"
          stroke={color} strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct / 100)}
          style={{ transition:'stroke-dashoffset 0.6s ease' }}
        />
      </svg>
      <div className="absolute text-center">
        <div className="text-[15px] font-black text-white">{Math.round(pct)}%</div>
        {label && <div className="text-[8px] text-white/30 mt-0.5">{label}</div>}
      </div>
    </div>
  );
};

/* horizontal bar */
const Bar = ({ value, color = '#3b82f6', label, sublabel }) => (
  <div className="flex flex-col gap-1.5">
    {(label || sublabel) && (
      <div className="flex items-center justify-between">
        {label    && <span className="text-[11px] text-white/60">{label}</span>}
        {sublabel && <span className="text-[11px] font-semibold text-white">{sublabel}</span>}
      </div>
    )}
    <div className="w-full h-2 bg-white/[0.05] rounded-full overflow-hidden">
      <div className="h-full rounded-full transition-all duration-700"
        style={{ width: `${Math.min(100, value || 0)}%`, background: color }}/>
    </div>
  </div>
);



/* ══════════════════════════════════════════════════
   PREDICTION TAB — standalone component
══════════════════════════════════════════════════ */
const PredictionTab = ({ profileId }) => {
  const [prediction, setPrediction] = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await studentApi.getPerformancePrediction(profileId);
      setPrediction(data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load prediction.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [profileId]);

  /* loading */
  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <Spinner size={24}/>
      <p className="text-[11px] text-white/30">Calculating prediction…</p>
    </div>
  );

  /* error */
  if (error) return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="8" r="6" stroke="#f87171" strokeWidth="1.4"/>
          <path d="M8 5v3.5" stroke="#f87171" strokeWidth="1.4" strokeLinecap="round"/>
          <circle cx="8" cy="10.5" r="0.8" fill="#f87171"/>
        </svg>
      </div>
      <p className="text-[12px] text-red-400">{error}</p>
      <button onClick={load}
        className="px-4 py-2 bg-white/[0.06] rounded-xl text-[11px] text-white/50
          hover:text-white transition-all">
        Try again
      </button>
    </div>
  );

  /* insufficient data */
  if (prediction?.message) return (
    <div className="flex flex-col items-center justify-center py-20 gap-4
      max-w-[400px] mx-auto text-center">
      <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20
        flex items-center justify-center text-2xl">
        📊
      </div>
      <div>
        <p className="text-[14px] font-bold text-white">Not enough data yet</p>
        <p className="text-[12px] text-white/40 mt-1.5">{prediction.message}</p>
      </div>
      {prediction.minimum_data_required && (
        <div className="w-full bg-[#0F1A2E] border border-white/[0.07] rounded-[14px] p-4">
          <p className="text-[10px] font-bold text-white/30 uppercase tracking-wider mb-3">
            Minimum required
          </p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'days enrolled',    value: prediction.minimum_data_required.days_enrolled },
              { label: 'lessons attended', value: prediction.minimum_data_required.lessons_attended },
            ].map(item => (
              <div key={item.label} className="bg-white/[0.03] rounded-xl p-3 text-center">
                <p className="font-sora text-[20px] font-black text-amber-400">{item.value}</p>
                <p className="text-[10px] text-white/30 mt-0.5">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  if (!prediction?.prediction) return null;

  const pred        = prediction.prediction;
  const currentProg = prediction.current_progress;
  const risks       = prediction.risk_factors   || {};
  const recs        = prediction.recommendations || [];
  const riskSummary = prediction.risk_summary   || {};
  const successPct = Math.round(pred.success_probability || 0);
  const confPct    = Math.round((pred.confidence_level || 0) * 100); 

  const successColor =
    successPct >= 70 ? '#10b981' :
    successPct >= 40 ? '#f59e0b' : '#ef4444';

  return (
    <div className="flex flex-col gap-5 max-w-[700px]">

      {/* ── KPI row ── */}
      <div className="grid grid-cols-3 gap-3">

        {/* Success probability */}
        <div className="bg-[#0F1A2E] border border-white/[0.07] rounded-[14px] p-4
          flex flex-col items-center gap-2">
          <Ring value={successPct} size={72} stroke={6} color={successColor}/>
          <p className="text-[9px] font-bold text-white/30 uppercase tracking-wider text-center">
            Success probability
          </p>
        </div>

        {/* Confidence */}
        <div className="bg-[#0F1A2E] border border-white/[0.07] rounded-[14px] p-4
          flex flex-col items-center gap-2">
          <Ring value={confPct} size={72} stroke={6} color="#8b5cf6"/>
          <p className="text-[9px] font-bold text-white/30 uppercase tracking-wider text-center">
            Confidence
          </p>
          {pred.confidence_percentage && (
            <p className="text-[10px] text-white/40">{pred.confidence_percentage}</p>
          )}
        </div>

        {/* Risk level */}
        <div className="bg-[#0F1A2E] border border-white/[0.07] rounded-[14px] p-4
          flex flex-col items-center justify-center gap-3">
          <div className={cls(
            'w-12 h-12 rounded-xl flex items-center justify-center text-2xl',
            pred.risk_level?.toLowerCase() === 'low'    ? 'bg-emerald-500/10' :
            pred.risk_level?.toLowerCase() === 'medium' ? 'bg-amber-500/10'   :
            pred.risk_level?.toLowerCase() === 'high'   ? 'bg-red-500/10'     :
            'bg-white/[0.05]',
          )}>
            {pred.risk_level?.toLowerCase() === 'low'    ? '✅' :
             pred.risk_level?.toLowerCase() === 'medium' ? '⚠️' :
             pred.risk_level?.toLowerCase() === 'high'   ? '🚨' : '❓'}
          </div>
          <Badge color={riskColor(pred.risk_level)}>
            {pred.risk_level ? `${pred.risk_level} risk` : 'Unknown'}
          </Badge>
          <p className="text-[9px] font-bold text-white/30 uppercase tracking-wider">
            Risk level
          </p>
        </div>
      </div>

      {/* ── Completion forecast ── */}
      <div className="bg-[#0F1A2E] border border-white/[0.07] rounded-[14px] p-5">
        <p className="text-[10px] font-bold text-white/30 uppercase tracking-wider mb-4">
          Completion forecast
        </p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-[9px] text-white/25 uppercase tracking-widest">Predicted date</p>
            <p className="text-[18px] font-black text-white mt-1">
              {pred.predicted_completion_date ? fmt(pred.predicted_completion_date) : '—'}
            </p>
          </div>
          <div>
            <p className="text-[9px] text-white/25 uppercase tracking-widest">Days remaining</p>
            <p className={cls(
              'text-[18px] font-black mt-1',
              pred.days_until_completion < 0   ? 'text-red-400'     :
              pred.days_until_completion <= 30  ? 'text-amber-400'   : 'text-emerald-400',
            )}>
              {pred.days_until_completion != null
                ? pred.days_until_completion < 0
                  ? `${Math.abs(pred.days_until_completion)}d overdue`
                  : `${pred.days_until_completion}d`
                : '—'}
            </p>
          </div>
        </div>
        {pred.last_updated && (
          <p className="text-[10px] text-white/20 mt-4">
            Last updated {fmt(pred.last_updated)}
          </p>
        )}
      </div>

      {/* ── Current progress ── */}
      {currentProg && (
        <div className="bg-[#0F1A2E] border border-white/[0.07] rounded-[14px] p-5">
          <p className="text-[10px] font-bold text-white/30 uppercase tracking-wider mb-4">
            Current progress
          </p>
          <div className="flex flex-col gap-3">
            <Bar value={currentProg.theory}  color="#3b82f6"
              label="Theory"  sublabel={`${Math.round(currentProg.theory)}%`}/>
            <Bar value={currentProg.driving} color="#8b5cf6"
              label="Driving" sublabel={`${Math.round(currentProg.driving)}%`}/>
            <Bar value={currentProg.overall} color={successColor}
              label="Overall" sublabel={`${Math.round(currentProg.overall)}%`}/>
          </div>
        </div>
      )}

      {/* ── Risk factors ── */}
      {Object.keys(risks).length > 0 && (
        <div className="bg-[#0F1A2E] border border-white/[0.07] rounded-[14px] p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[10px] font-bold text-white/30 uppercase tracking-wider">
              Risk factors
            </p>
            <div className="flex items-center gap-2">
              {riskSummary.high_severity > 0 && (
                <Badge color="red">{riskSummary.high_severity} high</Badge>
              )}
              {riskSummary.medium_severity > 0 && (
                <Badge color="amber">{riskSummary.medium_severity} medium</Badge>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-2.5">
            {Object.entries(risks).map(([key, risk]) => (
              <div key={key} className={cls(
                'flex items-start gap-3 p-3 rounded-xl border',
                risk.severity === 'high'
                  ? 'bg-red-500/[0.05] border-red-500/15'
                  : risk.severity === 'medium'
                  ? 'bg-amber-500/[0.05] border-amber-500/15'
                  : 'bg-white/[0.03] border-white/[0.06]',
              )}>
                <div className={cls(
                  'w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0',
                  risk.severity === 'high'   ? 'bg-red-400'   :
                  risk.severity === 'medium' ? 'bg-amber-400' : 'bg-white/30',
                )}/>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-[11px] font-semibold text-white/80 capitalize">
                      {key.replace(/_/g, ' ')}
                    </p>
                    <Badge color={
                      risk.severity === 'high'   ? 'red'   :
                      risk.severity === 'medium' ? 'amber' : 'gray'
                    }>
                      {risk.severity}
                    </Badge>
                  </div>
                  {risk.message && (
                    <p className="text-[10px] text-white/40 mt-0.5">{risk.message}</p>
                  )}
                  {risk.value != null && (
                    <p className="text-[10px] text-white/30 mt-0.5">
                      Value: <span className="text-white/50">{risk.value}</span>
                      {risk.threshold != null && (
                        <> · Threshold: <span className="text-white/50">{risk.threshold}</span></>
                      )}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Recommendations ── */}
      {recs.length > 0 && (
        <div className="bg-[#0F1A2E] border border-white/[0.07] rounded-[14px] p-5">
          <p className="text-[10px] font-bold text-white/30 uppercase tracking-wider mb-4">
            Recommendations
          </p>
          <div className="flex flex-col gap-2.5">
            {recs.map((rec, i) => (
              <div key={i} className="flex items-start gap-3 p-3
                bg-blue-500/[0.04] border border-blue-500/10 rounded-xl">
                <div className="w-5 h-5 rounded-full bg-blue-600/20
                  flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-[9px] font-bold text-blue-400">{i + 1}</span>
                </div>
                <p className="text-[11px] text-white/60 leading-relaxed">
                  {typeof rec === 'string' ? rec : rec.message || rec.text || JSON.stringify(rec)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── All clear ── */}
      {Object.keys(risks).length === 0 && recs.length === 0 && (
        <div className="flex flex-col items-center justify-center py-8 gap-3
          bg-emerald-500/[0.04] border border-emerald-500/10 rounded-[14px]">
          <div className="text-2xl">🎉</div>
          <p className="text-[12px] font-semibold text-emerald-400">No risk factors detected</p>
          <p className="text-[11px] text-white/30">This student is on track.</p>
        </div>
      )}

      {/* ── Refresh ── */}
      <div className="flex justify-end">
        <button onClick={load}
          className="flex items-center gap-2 px-4 py-2 bg-white/[0.04]
            hover:bg-white/[0.08] border border-white/[0.07] rounded-xl
            text-[11px] text-white/40 hover:text-white transition-all">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M10 6A4 4 0 112 6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
            <path d="M10 3v3H7" stroke="currentColor" strokeWidth="1.3"
              strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Refresh prediction
        </button>
      </div>

    </div>
  );
};

/* ══════════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════════ */
const StudentDetailPage = ({ profileId, onBack }) => {
  const [profile,          setProfile]          = useState(null);
  const [progress,         setProgress]         = useState(null);
  const [loading,          setLoading]          = useState(true);
  const [error,            setError]            = useState('');
  const [activeTab,        setActiveTab]        = useState('overview');
  const [toast,            setToast]            = useState('');
  const [lessonType,       setLessonType]       = useState('T');
  const [hoursCompleted,   setHoursCompleted]   = useState('');
  const [updatingProgress, setUpdatingProgress] = useState(false);
  const [progressError,    setProgressError]    = useState('');
  const [uploadingPic,     setUploadingPic]     = useState(false);
  const fileInputRef = useRef();

  const showToast = msg => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  useEffect(() => {
    if (!profileId) return;
    setLoading(true);
    setError('');
    Promise.all([
      studentApi.getProfile(profileId),
      studentApi.getProgress(profileId),
    ])
      .then(([prof, prog]) => { setProfile(prof); setProgress(prog); })
      .catch(() => setError('Failed to load student data.'))
      .finally(() => setLoading(false));
  }, [profileId]);



  /* loading */
  if (loading) return (
    <div className="flex flex-1 items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <Spinner size={28}/>
        <p className="text-[12px] text-white/30">Loading student profile…</p>
      </div>
    </div>
  );

  /* error */
  if (error || !profile) return (
    <div className="flex flex-1 items-center justify-center">
      <div className="text-center">
        <p className="text-red-400 text-[13px]">{error || 'Profile not found.'}</p>
        <button onClick={onBack}
          className="mt-4 px-4 py-2 bg-white/[0.06] rounded-xl text-[12px]
            text-white/60 hover:text-white transition-all">
          ← Go back
        </button>
      </div>
    </div>
  );

  const fullName = [profile.user_first_name, profile.user_last_name].filter(Boolean).join(' ')
                 || profile.user_username;
  const theory   = parseFloat(profile.progress_theory  || 0);
  const driving  = parseFloat(profile.progress_driving || 0);
  const overall  = (theory + driving) / 2;

  const NAV_ITEMS = [
    { key: 'overview',   label: 'Overview',     icon: 'M3 4h8M3 7h6M3 10h4',             ai: false },
    { key: 'progress',   label: 'Progress',     icon: 'M2 10l3-4 3 2 3-5 3 3',           ai: false },
    { key: 'prediction', label: 'Prediction',   icon: 'M2 9l2-4 2 2 2-3 2 1 2-2',        ai: true  },
  ];

  return (
    <div className="flex flex-col flex-1 overflow-hidden">

      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-[99] bg-[#0F1A2E] border border-white/[0.1]
          rounded-xl px-4 py-2.5 text-[12px] text-white shadow-xl flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400"/>
          {toast}
        </div>
      )}

      {/* Top bar */}
      <header className="h-[52px] flex-shrink-0 bg-[#0B1221] border-b border-white/[0.06]
        flex items-center gap-3 px-5">
        <button onClick={onBack}
          className="flex items-center gap-1.5 text-[11px] text-white/40
            hover:text-white transition-colors">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M9 11L5 7l4-4" stroke="currentColor" strokeWidth="1.4"
              strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Students
        </button>
        <span className="text-white/15">/</span>
        <span className="text-[13px] font-semibold text-white">{fullName}</span>
        <div className="ml-1">
          <Badge color={statusColor(profile.status)}>{statusLabel(profile.status)}</Badge>
        </div>

      </header>

      <div className="flex flex-1 overflow-hidden">

        {/* Left sidebar */}
        <aside className="w-[220px] flex-shrink-0 border-r border-white/[0.05]
          bg-[#080f1e] flex flex-col overflow-y-auto">

          <div className="flex flex-col items-center px-5 pt-7 pb-5 gap-3">
            <div className="relative group/avatar">
              {profile.picture_profile_url ? (
                <img src={profile.picture_profile_url} alt={fullName}
                  className="w-20 h-20 rounded-2xl object-cover"/>
              ) : (
                <div className="w-20 h-20 rounded-2xl flex items-center justify-center
                  text-[22px] font-black text-white"
                  style={{ background: avatarColor(profile.user_username) }}>
                  {initials(profile.user_first_name, profile.user_last_name)}
                </div>
              )}

            </div>
            <div className="text-center">
              <p className="font-sora text-[14px] font-bold text-white">{fullName}</p>
              <p className="text-[10px] text-white/35 mt-0.5">@{profile.user_username}</p>
            </div>
            <Ring value={overall} size={80} stroke={6}
              color={overall >= 80 ? '#10b981' : overall >= 40 ? '#3b82f6' : '#f59e0b'}
              label="Overall"/>
          </div>

          <div className="border-t border-white/[0.05] mx-4"/>

          <div className="flex flex-col gap-3.5 px-5 py-5">
            {[
              { label: 'Email',   value: profile.user_email  || '—', wrap: true },
              { label: 'School',  value: profile.school_name || '—' },
              { label: 'License', value: profile.license_type === 'C' ? '🚗 Car (Permis B)'
                : profile.license_type === 'M' ? '🏍 Moto (Permis A)' : '—' },
              { label: 'Joined',  value: fmt(profile.joined_at) },
            ].map(item => (
              <div key={item.label}>
                <p className="text-[9px] font-bold uppercase tracking-widest text-white/25">
                  {item.label}
                </p>
                <p className={cls('text-[11px] text-white/60 mt-0.5', item.wrap && 'break-all')}>
                  {item.value}
                </p>
              </div>
            ))}
            <div>
              <p className="text-[9px] font-bold uppercase tracking-widest text-white/25">Status</p>
              <div className="mt-1">
                <Badge color={statusColor(profile.status)}>{statusLabel(profile.status)}</Badge>
              </div>
            </div>
          </div>

          {/* Nav */}
          <div className="flex flex-col gap-0.5 px-3 pb-5 mt-auto">
            {NAV_ITEMS.map(item => (
              <button key={item.key} onClick={() => setActiveTab(item.key)}
                className={cls(
                  'flex items-center gap-2.5 px-3 py-2 rounded-[8px] text-[11px]',
                  'font-semibold transition-all text-left',
                  activeTab === item.key
                    ? 'bg-blue-600/15 text-blue-400'
                    : 'text-white/30 hover:text-white/70 hover:bg-white/[0.04]',
                )}>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d={item.icon} stroke="currentColor" strokeWidth="1.3"
                    strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                {item.label}
                {item.ai && (
                  <span className="ml-auto text-[8px] font-bold px-1.5 py-0.5 rounded
                    bg-violet-500/20 text-violet-400">AI</span>
                )}
              </button>
            ))}
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-6">

          {/* ══ OVERVIEW ══ */}
          {activeTab === 'overview' && (
            <div className="flex flex-col gap-5 max-w-[700px]">
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Theory',  value: theory,  color: '#3b82f6',
                    hours: progress?.theory_hours  ?? profile.total_hours_theory },
                  { label: 'Driving', value: driving, color: '#8b5cf6',
                    hours: progress?.driving_hours ?? profile.total_hours_driving },
                  { label: 'Overall', value: overall,
                    color: overall >= 80 ? '#10b981' : overall >= 40 ? '#3b82f6' : '#f59e0b',
                    hours: null },
                ].map(card => (
                  <div key={card.label}
                    className="bg-[#0F1A2E] border border-white/[0.07] rounded-[14px]
                      px-4 py-4 flex flex-col items-center gap-2">
                    <Ring value={card.value} size={72} stroke={6} color={card.color}/>
                    <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider">
                      {card.label}
                    </p>
                    {card.hours != null && (
                      <p className="text-[10px] text-white/25">{card.hours}h completed</p>
                    )}
                  </div>
                ))}
              </div>

              <div className="bg-[#0F1A2E] border border-white/[0.07] rounded-[14px] p-5">
                <p className="text-[10px] font-bold text-white/30 uppercase tracking-wider mb-3">
                  Timeline
                </p>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { label: 'Enrolled',      value: fmt(profile.joined_at) },
                    { label: 'Theory start',  value: fmt(profile.theory_start_date) },
                    { label: 'Driving start', value: fmt(profile.driving_start_date) },
                  ].map(item => (
                    <div key={item.label}>
                      <p className="text-[9px] text-white/25 uppercase tracking-widest">{item.label}</p>
                      <p className="text-[12px] text-white/70 mt-0.5">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-[#0F1A2E] border border-white/[0.07] rounded-[14px] p-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[10px] font-bold text-white/30 uppercase tracking-wider">
                    Completion
                  </p>
                  <span className="text-[20px] font-black text-white">
                    {progress?.completion_percentage ?? Math.round(overall)}%
                  </span>
                </div>
                <Bar
                  value={progress?.completion_percentage ?? overall}
                  color={overall >= 80 ? '#10b981' : overall >= 40 ? '#3b82f6' : '#f59e0b'}
                />
                <div className="flex justify-between mt-2">
                  <p className="text-[10px] text-white/25">Theory: {theory}%</p>
                  <p className="text-[10px] text-white/25">Driving: {driving}%</p>
                </div>
              </div>
            </div>
          )}

          {/* ══ PROGRESS ══ */}
          {activeTab === 'progress' && (
            <div className="flex flex-col gap-5 max-w-[600px]">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Theory hours',
                    value: progress?.theory_hours  ?? profile.total_hours_theory,  color: '#3b82f6' },
                  { label: 'Driving hours',
                    value: progress?.driving_hours ?? profile.total_hours_driving, color: '#8b5cf6' },
                  { label: 'Theory progress',  value: `${theory}%`,  color: '#3b82f6' },
                  { label: 'Driving progress', value: `${driving}%`, color: '#8b5cf6' },
                ].map(s => (
                  <div key={s.label}
                    className="bg-[#0F1A2E] border border-white/[0.07] rounded-[14px] p-4">
                    <p className="text-[9px] text-white/25 uppercase tracking-widest">{s.label}</p>
                    <p className="font-sora text-[24px] font-black mt-1" style={{ color: s.color }}>
                      {s.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ══ PREDICTION ══ */}
          {activeTab === 'prediction' && (
            <PredictionTab profileId={profileId}/>
          )}
        </main>
      </div>
    </div>
  );
};

export default StudentDetailPage;