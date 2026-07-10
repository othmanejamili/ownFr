// src/pages/student/StudentProgressPage.jsx
// Integrated layout: Sidebar + Progress content — matches DriveIQ design system

import { useState, useEffect, useRef } from 'react';
import Sidebar from '../Dashboard/Sidebar';
import { NavLink, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { studentApi } from './Studentapi';


const API = import.meta.env.VITE_API_URL;

/* ══════════════════════════════════════════════════════════════
   SHARED PRIMITIVES
══════════════════════════════════════════════════════════════ */
const Skeleton = ({ className }) => (
  <div className={`animate-pulse bg-white/10 rounded ${className}`} />
);

const fmtDate = (d) => {
  if (!d) return '—';
  const dt = new Date(d);
  return isNaN(dt) ? '—' : dt.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

/* ══════════════════════════════════════════════════════════════
   SIDEBAR
══════════════════════════════════════════════════════════════ */
const LogoMark = () => (
  <div className="w-7 h-7 bg-blue-600 rounded-[7px] flex items-center justify-center flex-shrink-0">
    <svg width="15" height="15" viewBox="0 0 18 18" fill="none">
      <path d="M9 2L15 7.5V16H3V7.5L9 2Z" fill="white" />
      <rect x="6.5" y="10" width="5" height="6" rx="1" fill="#1D4ED8" />
    </svg>
  </div>
);

const NavItem = ({ to, icon, label, badge, badgeColor = 'blue' }) => {
  const badgeStyles = {
    blue:  'bg-blue-600/20 text-blue-400',
    amber: 'bg-amber-500/20 text-amber-400',
    red:   'bg-red-500/20 text-red-400',
    green: 'bg-emerald-500/20 text-emerald-400',
  };
  return (
    <NavLink
      to={to}
      className={({ isActive }) => [
        'flex items-center gap-2.5 px-2.5 py-2 rounded-[9px] mx-2 my-px',
        'text-[12px] font-medium transition-all duration-200 group',
        isActive
          ? 'bg-blue-600/15 text-blue-300 font-semibold'
          : 'text-white/40 hover:bg-white/[0.04] hover:text-white/80',
      ].join(' ')}
    >
      <span className="w-3.5 h-3.5 flex-shrink-0 opacity-70 group-[.active]:opacity-100">{icon}</span>
      <span className="flex-1 font-dm">{label}</span>
      {badge !== undefined && (
        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md font-dm ${badgeStyles[badgeColor]}`}>
          {badge}
        </span>
      )}
    </NavLink>
  );
};

const SectionLabel = ({ text }) => (
  <div className="px-4 pt-3 pb-1 text-[10px] font-bold text-white/20 tracking-[0.8px] font-dm">{text}</div>
);

const icons = {
  grid:       <svg viewBox="0 0 14 14" fill="none" className="w-full h-full"><rect x="1" y="1" width="5" height="5" rx="1.2" stroke="currentColor" strokeWidth="1.3"/><rect x="8" y="1" width="5" height="5" rx="1.2" stroke="currentColor" strokeWidth="1.3"/><rect x="1" y="8" width="5" height="5" rx="1.2" stroke="currentColor" strokeWidth="1.3"/><rect x="8" y="8" width="5" height="5" rx="1.2" stroke="currentColor" strokeWidth="1.3"/></svg>,
  calendar:   <svg viewBox="0 0 14 14" fill="none" className="w-full h-full"><rect x="1" y="2" width="12" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.3"/><path d="M1 5h12M4 1v2M10 1v2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>,
  progress:   <svg viewBox="0 0 14 14" fill="none" className="w-full h-full"><path d="M2 10l3-5 2.5 3L10 4l2 5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  lessons:    <svg viewBox="0 0 14 14" fill="none" className="w-full h-full"><path d="M2 2h8v8H2z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/><path d="M10 4l2-1v7l-2 1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/><path d="M4 5h4M4 7h3" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/></svg>,
  attendance: <svg viewBox="0 0 14 14" fill="none" className="w-full h-full"><circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.2"/><path d="M7 3v4l2.5 2.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  profile:    <svg viewBox="0 0 14 14" fill="none" className="w-full h-full"><circle cx="7" cy="4.5" r="2.8" stroke="currentColor" strokeWidth="1.2"/><path d="M1.5 13c0-3 2.5-4.5 5.5-4.5S12 10 12 13" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>,
  settings:   <svg viewBox="0 0 14 14" fill="none" className="w-full h-full"><circle cx="7" cy="7" r="2" stroke="currentColor" strokeWidth="1.2"/><path d="M7 1v1.5M7 11.5V13M1 7h1.5M11.5 7H13M2.5 2.5l1 1M10.5 10.5l1 1M11.5 2.5l-1 1M3.5 10.5l-1 1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>,
  logout:     <svg viewBox="0 0 14 14" fill="none" className="w-full h-full"><path d="M5 2H2a1 1 0 00-1 1v8a1 1 0 001 1h3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/><path d="M9.5 9.5L13 7l-3.5-2.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/><path d="M13 7H5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>,
  feedback:   <svg viewBox="0 0 14 14" fill="none" className="w-full h-full"><path d="M7 1l1.4 4h4.1L9.1 7.4l1.4 4.2L7 8.8 3.5 11.6l1.4-4.2L1.5 5h4.1z" stroke="currentColor" strokeWidth="1.1"/></svg>,
};

const getInitials = (first = '', last = '') =>
  `${first.charAt(0)}${last.charAt(0)}`.toUpperCase() || '?';

const ProfileMenu = ({ student, fullName, initials, pictureUrl, onClose, menuRef }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    const refresh = localStorage.getItem('refresh') || sessionStorage.getItem('refresh');
    try {
      await axios.post(`${API}/auth/logout/`, { refresh }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('access') || sessionStorage.getItem('access')}` },
      });
    } catch {}
    finally {
      ['access', 'refresh', 'user'].forEach(k => {
        localStorage.removeItem(k); sessionStorage.removeItem(k);
      });
      delete axios.defaults.headers.common['Authorization'];
      navigate('/login');
    }
  };

  return (
    <div
      ref={menuRef}
      className="absolute bottom-[calc(100%+8px)] left-2 right-2 z-50 bg-[#0F1A2E] border border-white/[0.09] rounded-2xl shadow-2xl shadow-black/60 overflow-hidden"
      style={{ animation: 'slideUp 0.18s ease' }}
    >
      <style>{`@keyframes slideUp { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }`}</style>

      <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/[0.06]">
        {pictureUrl ? (
          <img src={pictureUrl} alt={fullName} className="w-9 h-9 rounded-full object-cover ring-2 ring-blue-500/30 flex-shrink-0" />
        ) : (
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0">
            {initials}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="text-[12px] font-semibold text-white font-dm truncate">{fullName || '—'}</div>
          <div className="text-[10px] text-white/35 font-dm truncate">{student?.email || 'Student'}</div>
        </div>
        <span className="flex-shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-blue-500/20 text-blue-400 font-dm">STUDENT</span>
      </div>

      <div className="py-1.5">
        <button
          onClick={() => { navigate('/dashboard/student/settings'); onClose(); }}
          className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/[0.05] transition-colors group text-left"
        >
          <span className="w-3.5 h-3.5 flex-shrink-0 text-white/35 group-hover:text-white/60">{icons.settings}</span>
          <div>
            <div className="text-[11.5px] font-medium text-white/70 group-hover:text-white/90 font-dm">Settings</div>
            <div className="text-[10px] text-white/25 font-dm">Preferences & security</div>
          </div>
        </button>
      </div>

      <div className="border-t border-white/[0.06] px-2.5 py-2">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-500/10 transition-colors group text-left"
        >
          <span className="w-3.5 h-3.5 flex-shrink-0 text-red-400/60 group-hover:text-red-400">{icons.logout}</span>
          <div>
            <div className="text-[11.5px] font-medium text-red-400/70 group-hover:text-red-400 font-dm">Log out</div>
            <div className="text-[10px] text-white/20 font-dm">End your session</div>
          </div>
        </button>
      </div>
    </div>
  );
};



/* ══════════════════════════════════════════════════════════════
   PROGRESS PAGE SUB-COMPONENTS
══════════════════════════════════════════════════════════════ */
const Ring = ({ value = 0, size = 96, stroke = 7, color = '#3B82F6', trackColor = 'rgba(255,255,255,0.06)' }) => {
  const r    = (size - stroke) / 2;
  const cx   = size / 2;
  const circ = 2 * Math.PI * r;
  const off  = circ - (Math.min(value, 100) / 100) * circ;
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={cx} cy={cx} r={r} fill="none" stroke={trackColor} strokeWidth={stroke} />
      <circle cx={cx} cy={cx} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={circ} strokeDashoffset={off} strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 1s cubic-bezier(.4,0,.2,1)' }} />
    </svg>
  );
};

const Bar = ({ value = 0, color = '#3B82F6', label, sublabel, loading }) => (
  <div>
    <div className="flex items-center justify-between mb-1.5">
      <span className="text-[11px] font-dm text-white/60">{label}</span>
      {loading
        ? <Skeleton className="h-3 w-8" />
        : <span className="text-[11px] font-bold font-dm text-white/80">{Math.round(value)}%</span>}
    </div>
    <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
      <div className="h-full rounded-full transition-all duration-1000 ease-out"
        style={{ width: `${value}%`, background: color }} />
    </div>
    {sublabel && <div className="text-[10px] text-white/25 font-dm mt-1">{sublabel}</div>}
  </div>
);

const RiskBadge = ({ level }) => {
  const map = {
    low:    { cls: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20', label: 'Low Risk' },
    medium: { cls: 'bg-amber-500/15 text-amber-400 border-amber-500/20',       label: 'Moderate Risk' },
    high:   { cls: 'bg-red-500/15 text-red-400 border-red-500/20',             label: 'High Risk' },
  };
  const { cls, label } = map[level] || map.medium;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold border font-dm ${cls}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {label}
    </span>
  );
};

const AchievementChip = ({ item }) => (
  <div className="flex items-center gap-2.5 bg-white/[0.03] border border-white/[0.06] rounded-xl px-3 py-2.5">
    <span className="text-[20px]">{item.icon}</span>
    <div className="min-w-0">
      <div className="text-[11.5px] font-semibold text-white/80 font-dm truncate">{item.title}</div>
      <div className="text-[10px] text-white/30 font-dm truncate">{item.description}</div>
    </div>
    <div className="ml-auto flex-shrink-0">
      <span className="text-[10px] font-bold text-amber-400 font-dm">+{item.points}</span>
    </div>
  </div>
);

const Card = ({ children, className = '' }) => (
  <div className={`bg-[#0B1221] border border-white/[0.07] rounded-2xl p-5 ${className}`}>
    {children}
  </div>
);

const SectionHead = ({ title, sub }) => (
  <div className="mb-4">
    <h2 className="text-[13px] font-bold text-white font-sora">{title}</h2>
    {sub && <p className="text-[11px] text-white/30 font-dm mt-0.5">{sub}</p>}
  </div>
);

const StatusPill = ({ icon, label, value }) => (
  <div className="flex items-center gap-1.5 bg-white/[0.03] border border-white/[0.06] rounded-lg px-2.5 py-1.5">
    <span className="text-[12px]">{icon}</span>
    <span className="text-[10px] text-white/30 font-dm">{label}:</span>
    <span className="text-[10px] font-semibold text-white/60 font-dm">{value || '—'}</span>
  </div>
);

const MetricBox = ({ label, value, sub, valueColor }) => (
  <div className="bg-white/[0.03] border border-white/[0.05] rounded-xl p-3 text-center">
    <div className="text-[10px] text-white/25 font-dm tracking-[0.5px] mb-1">{label.toUpperCase()}</div>
    <div className="text-[14px] font-bold font-sora" style={{ color: valueColor || 'white' }}>{value}</div>
    {sub && <div className="text-[9px] text-white/20 font-dm mt-0.5">{sub}</div>}
  </div>
);

const severityColor = (s) =>
  s === 'high' ? '#EF4444' : s === 'medium' ? '#F59E0B' : '#10B981';

const successColor = (prob) => {
  const p = parseFloat(prob || 0);
  return p >= 70 ? '#10B981' : p >= 40 ? '#F59E0B' : '#EF4444';
};

const RiskRow = ({ name, risk }) => (
  <div className="flex items-start gap-2.5 bg-white/[0.02] border border-white/[0.04] rounded-xl p-3">
    <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0"
      style={{ background: severityColor(risk.severity) }} />
    <div className="flex-1 min-w-0">
      <div className="text-[11.5px] font-medium text-white/70 font-dm capitalize">
        {name.replace(/_/g, ' ')}
      </div>
      {risk.description && (
        <div className="text-[10px] text-white/30 font-dm mt-0.5">{risk.description}</div>
      )}
    </div>
    <span className="text-[9px] font-bold font-dm capitalize flex-shrink-0"
      style={{ color: severityColor(risk.severity) }}>
      {risk.severity}
    </span>
  </div>
);

const ConfidenceMeter = ({ value = 0 }) => {
  const pct   = Math.round(value * 100);
  const color = pct >= 70 ? '#10B981' : pct >= 40 ? '#F59E0B' : '#EF4444';
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[10px] font-bold text-white/25 font-dm tracking-[0.6px]">CONFIDENCE</span>
        <span className="text-[12px] font-bold font-dm" style={{ color }}>{pct}%</span>
      </div>
      <div className="h-1 bg-white/[0.06] rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-1000"
          style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════
   PROGRESS CONTENT
══════════════════════════════════════════════════════════════ */
const ProgressContent = () => {
  const [profile,      setProfile]      = useState(null);
  const [progress,     setProgress]     = useState(null);
  const [prediction,   setPrediction]   = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [predLoading,  setPredLoading]  = useState(true);
  const [error,        setError]        = useState(null);
  const [predError,    setPredError]    = useState(null);
  const [showAllRisks, setShowAllRisks] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const prof = await studentApi.getMyProfile();
        setProfile(prof);
        const [prog, ach] = await Promise.all([
          studentApi.getProgress(prof.id),
          studentApi.getAchievements(prof.id).catch(() => []),
        ]);
        setProgress(prog);
        setAchievements(Array.isArray(ach) ? ach : ach?.results || []);
      } catch (err) {
        setError(err.response?.data?.detail || 'Could not load progress.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (!profile?.id) return;
    const loadPred = async () => {
      try {
        setPredLoading(true);
        const p = await studentApi.getPrediction(profile.id);
        setPrediction(p);
      } catch (err) {
        setPredError(err.response?.data?.detail || 'Prediction unavailable.');
      } finally {
        setPredLoading(false);
      }
    };
    loadPred();
  }, [profile?.id]);

  const overall = progress
    ? Math.round((parseFloat(progress.theory_progress) + parseFloat(progress.driving_progress)) / 2)
    : 0;

  const riskEntries  = prediction?.risk_factors ? Object.entries(prediction.risk_factors) : [];
  const visibleRisks = showAllRisks ? riskEntries : riskEntries.slice(0, 3);

  return (
    <div className="flex-1 overflow-y-auto bg-[#060E1C]">
      <div className="max-w-3xl mx-auto px-6 py-8">

        {/* Page header */}
        <div className="mb-6">
          <h1 className="font-sora text-[20px] font-bold text-white">My Progress</h1>
          <p className="text-[12px] text-white/30 font-dm mt-0.5">
            Theory, driving progress and AI-powered predictions
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-4">
            <p className="text-[12px] text-red-400 font-dm">{error}</p>
          </div>
        )}

        {/* ── Overall summary ── */}
        <Card className="mb-4">
          <div className="flex items-center gap-5">
            <div className="relative flex-shrink-0">
              <Ring value={overall} size={96} stroke={7} color="#3B82F6" />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-[18px] font-bold text-white font-sora">{overall}%</span>
                <span className="text-[9px] text-white/30 font-dm">overall</span>
              </div>
            </div>
            <div className="flex-1 space-y-3">
              {loading ? (
                <><Skeleton className="h-3 w-full" /><Skeleton className="h-3 w-4/5" /></>
              ) : (
                <>
                  <Bar value={parseFloat(progress?.theory_progress  || 0)} color="#3B82F6" label="Theory"  sublabel={`${progress?.theory_hours  || 0}h completed`} />
                  <Bar value={parseFloat(progress?.driving_progress || 0)} color="#8B5CF6" label="Driving" sublabel={`${progress?.driving_hours || 0}h completed`} />
                </>
              )}
            </div>
          </div>
          {!loading && progress && (
            <div className="mt-4 pt-4 border-t border-white/[0.06] flex items-center gap-3 flex-wrap">
              <StatusPill icon="👤" label="Student" value={progress.student?.full_name || progress.student?.username} />
              <StatusPill icon="🏫" label="School"  value={progress.school?.name} />
              <StatusPill icon="📊" label="Status"  value={progress.status} />
            </div>
          )}
        </Card>

        {/* ── AI Prediction ── */}
        <Card className="mb-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-[13px] font-bold text-white font-sora flex items-center gap-2">
                <span className="text-[15px]">🤖</span> AI Prediction
              </h2>
              <p className="text-[11px] text-white/30 font-dm mt-0.5">
                Estimated completion and risk analysis
              </p>
            </div>
            {!predLoading && prediction?.prediction?.risk_level && (
              <RiskBadge level={prediction.prediction.risk_level} />
            )}
          </div>

          {predLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-16 w-full rounded-xl" />
              <Skeleton className="h-3 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ) : predError || prediction?.message ? (
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4">
              <p className="text-[12px] text-white/40 font-dm">{predError || prediction?.message}</p>
              {prediction?.minimum_data_required && (
                <ul className="mt-2 space-y-1">
                  {Object.entries(prediction.minimum_data_required).map(([k, v]) => (
                    <li key={k} className="text-[11px] text-white/25 font-dm">
                      • {k.replace(/_/g, ' ')}: {v}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ) : prediction ? (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <MetricBox
                  label="Completion"
                  value={fmtDate(prediction.prediction?.predicted_completion_date)}
                  sub={prediction.prediction?.days_until_completion != null
                    ? `${prediction.prediction.days_until_completion} days left` : null}
                />
                <MetricBox
                  label="Success rate"
                  value={`${Math.round(prediction.prediction?.success_probability || 0)}%`}
                  sub="probability"
                  valueColor={successColor(prediction.prediction?.success_probability)}
                />
                <MetricBox
                  label="Confidence"
                  value={prediction.prediction?.confidence_percentage || '—'}
                  sub="model confidence"
                />
              </div>

              <ConfidenceMeter value={prediction.prediction?.confidence_level || 0} />

              {riskEntries.length > 0 && (
                <div>
                  <div className="text-[10px] font-bold text-white/25 font-dm tracking-[0.6px] mb-2">
                    RISK FACTORS ({prediction.risk_summary?.total_risks || 0})
                  </div>
                  <div className="space-y-2">
                    {visibleRisks.map(([key, risk]) => (
                      <RiskRow key={key} name={key} risk={risk} />
                    ))}
                  </div>
                  {riskEntries.length > 3 && (
                    <button
                      onClick={() => setShowAllRisks(v => !v)}
                      className="mt-2 text-[10px] text-blue-400/70 hover:text-blue-400 font-dm transition-colors"
                    >
                      {showAllRisks ? 'Show less' : `Show ${riskEntries.length - 3} more…`}
                    </button>
                  )}
                </div>
              )}

              {prediction.recommendations?.length > 0 && (
                <div>
                  <div className="text-[10px] font-bold text-white/25 font-dm tracking-[0.6px] mb-2">
                    RECOMMENDATIONS
                  </div>
                  <ul className="space-y-1.5">
                    {prediction.recommendations.map((rec, i) => (
                      <li key={i} className="flex items-start gap-2 text-[11.5px] text-white/60 font-dm">
                        <span className="text-blue-400 mt-0.5 flex-shrink-0">→</span>
                        {typeof rec === 'string' ? rec : rec.message || JSON.stringify(rec)}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <p className="text-[10px] text-white/20 font-dm">
                Last updated: {fmtDate(prediction.prediction?.last_updated)}
              </p>
            </div>
          ) : null}
        </Card>

        {/* ── Detailed breakdown ── */}
        <Card className="mb-4">
          <SectionHead title="Progress Breakdown" sub="Hours and percentage by category" />
          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-4/5" />
            </div>
          ) : (
            <div className="space-y-5">
              {/* Theory */}
              <div className="flex items-center gap-4">
                <div className="relative w-14 h-14 flex-shrink-0">
                  <Ring value={parseFloat(progress?.theory_progress || 0)} size={56} stroke={5} color="#3B82F6" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-[10px] font-bold text-white font-dm">
                      {Math.round(parseFloat(progress?.theory_progress || 0))}%
                    </span>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[12px] font-semibold text-white font-dm">Theory</span>
                    <span className="text-[11px] text-white/40 font-dm">{progress?.theory_hours || 0}h logged</span>
                  </div>
                  <div className="h-1 bg-white/[0.06] rounded-full">
                    <div className="h-full bg-blue-500 rounded-full transition-all duration-1000"
                      style={{ width: `${progress?.theory_progress || 0}%` }} />
                  </div>
                </div>
              </div>

              <div className="h-px bg-white/[0.04]" />

              {/* Driving */}
              <div className="flex items-center gap-4">
                <div className="relative w-14 h-14 flex-shrink-0">
                  <Ring value={parseFloat(progress?.driving_progress || 0)} size={56} stroke={5} color="#8B5CF6" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-[10px] font-bold text-white font-dm">
                      {Math.round(parseFloat(progress?.driving_progress || 0))}%
                    </span>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[12px] font-semibold text-white font-dm">Driving</span>
                    <span className="text-[11px] text-white/40 font-dm">{progress?.driving_hours || 0}h logged</span>
                  </div>
                  <div className="h-1 bg-white/[0.06] rounded-full">
                    <div className="h-full bg-violet-500 rounded-full transition-all duration-1000"
                      style={{ width: `${progress?.driving_progress || 0}%` }} />
                  </div>
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* ── Achievements ── */}
        {(achievements.length > 0 || loading) && (
          <Card>
            <SectionHead title="Achievements" sub={`${achievements.length} earned`} />
            {loading ? (
              <div className="space-y-2">
                <Skeleton className="h-12 w-full rounded-xl" />
                <Skeleton className="h-12 w-full rounded-xl" />
              </div>
            ) : (
              <div className="space-y-2">
                {achievements.map((a) => <AchievementChip key={a.id} item={a} />)}
              </div>
            )}
          </Card>
        )}
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════
   PAGE ROOT — Sidebar + Content
══════════════════════════════════════════════════════════════ */
const StudentProgressPage = () => (
  <div className="flex h-screen bg-[#060E1C] overflow-hidden">
    <Sidebar />
    <ProgressContent />
  </div>
);

export default StudentProgressPage;