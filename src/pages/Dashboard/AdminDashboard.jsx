import { useState, useEffect, useRef } from 'react';
import useSchoolCount from './SchoolNumbers'; 
import useStudentCount from './StudentNumbers';
import useInstructoreCount from './InstructorNumbers';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, ArcElement, Filler, Tooltip, Legend,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { useNavigate } from "react-router-dom";

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, ArcElement, Filler, Tooltip, Legend
);

/* ─────────────────────────────────────────────────────────────
   DriveIQ — Platform Admin Dashboard
   Stack  : React 18 + Tailwind CSS v3 + react-chartjs-2
   Install: npm install chart.js react-chartjs-2
   Fonts  : Add to index.html:
     <link href="https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet">
   tailwind.config.js → extend:
     fontFamily: { sora:['Sora','sans-serif'], dm:['DM Sans','sans-serif'], mono:['DM Mono','monospace'] }
───────────────────────────────────────────────────────────── */

// ── Range datasets ────────────────────────────────────────────
const RANGE_DATA = {
  '7d': {
    labels: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],
    schools:  [210,215,220,228,235,241,248],
    students: [1050,1080,1110,1150,1190,1220,1247],
    revenue:  [5200,6800,7100,9400,8200,7600,4900],
  },
  '30d': {
    labels: ['W1','W2','W3','W4','W5'],
    schools:  [200,215,228,238,248],
    students: [980,1050,1120,1190,1247],
    revenue:  [28000,34000,38500,44000,48200],
  },
  '90d': {
    labels: ['Jan','Feb','Mar','Apr'],
    schools:  [160,190,220,248],
    students: [720,900,1100,1247],
    revenue:  [95000,118000,138000,165000],
  },
};

// ── Shared chart options helpers ──────────────────────────────
const tickStyle = { color:'rgba(240,244,255,0.28)', font:{ family:'DM Sans', size:10 } };
const gridStyle = { color:'rgba(255,255,255,0.05)' };
const tooltipStyle = {
  backgroundColor:'#1E2D45', titleColor:'rgba(240,244,255,0.55)',
  bodyColor:'#fff', borderColor:'rgba(255,255,255,0.12)', borderWidth:0.5,
  padding:10, cornerRadius:8,
};

// ── SVG Icons ─────────────────────────────────────────────────
const Icons = {
  Grid: () => <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><rect x="1" y="1" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.3"/><rect x="9" y="1" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.3"/><rect x="1" y="9" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.3"/><rect x="9" y="9" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.3"/></svg>,
  School: () => <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M8 1L14 5V11L8 15L2 11V5L8 1Z" stroke="currentColor" strokeWidth="1.3"/></svg>,
  User: () => <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="5" r="3" stroke="currentColor" strokeWidth="1.3"/><path d="M2 15c0-3 2.7-4.5 6-4.5s6 1.5 6 4.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>,
  Star: () => <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M8 1l1.5 4h4L10 7.5l1.5 4.5L8 9.5l-3.5 2.5L6 7.5 2.5 5h4z" stroke="currentColor" strokeWidth="1.2"/></svg>,
  Calendar: () => <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><rect x="1" y="3" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.3"/><path d="M1 6h14M5 1v2M11 1v2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>,
  Revenue: () => <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.3"/><path d="M8 4v8M6 6h3a1 1 0 010 2H7a1 1 0 000 2h3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>,
  Message: () => <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M13 2H3a1 1 0 00-1 1v7a1 1 0 001 1h3l2 3 2-3h3a1 1 0 001-1V3a1 1 0 00-1-1z" stroke="currentColor" strokeWidth="1.3"/></svg>,
  Feedback: () => <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M8 1l1.8 4.2L14 6.2l-3 3 .7 4.3L8 11.2 4.3 13.5l.7-4.3-3-3 4.2-.9z" stroke="currentColor" strokeWidth="1.2"/></svg>,
  Clock: () => <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.3"/><path d="M8 5v3l2 2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>,
  Settings: () => <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.3"/><path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.05 3.05l1.41 1.41M11.54 11.54l1.41 1.41M3.05 12.95l1.41-1.41M11.54 4.46l1.41-1.41" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>,
  Alert: () => <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M6.5 1L12 11H1L6.5 1Z" stroke="currentColor" strokeWidth="1.2"/><path d="M6.5 5v3M6.5 9.5v.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>,
  Info: () => <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><circle cx="6.5" cy="6.5" r="5.5" stroke="currentColor" strokeWidth="1.2"/><path d="M6.5 4v3M6.5 8.5v.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>,
  Check: () => <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><circle cx="6.5" cy="6.5" r="5.5" stroke="currentColor" strokeWidth="1.2"/><path d="M4 6.5l2 2 3-3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  ChevronRight: () => <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M4.5 3l3 3-3 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  TrendUp: () => <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 7l3-3 2 2 3-4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
};
  
  

const LogoMark = ({ size = 28 }) => (
  <div className="bg-blue-600 flex items-center justify-center flex-shrink-0"
    style={{ width: size, height: size, borderRadius: size * 0.25 }}>
    <svg width={size * 0.56} height={size * 0.56} viewBox="0 0 18 18" fill="none">
      <path d="M9 2L15 7.5V16H3V7.5L9 2Z" fill="white" />
      <rect x="6.5" y="10" width="5" height="6" rx="1" fill="#1D4ED8" />
    </svg>
  </div>
);

// ── Sidebar ───────────────────────────────────────────────────
const NAV_ITEMS = [
  { section: 'PLATFORM', items: [
    { label:'Overview',    icon:'Grid',     active:true },
    { label:'Schools',     icon:'School',   badge:'48',   badgeColor:'bg-blue-600/20 text-blue-400' },
    { label:'Students',    icon:'User',     badge:'1.2k', badgeColor:'bg-emerald-600/15 text-emerald-400' },
    { label:'Instructors', icon:'Star' },
  ]},
  { section: 'OPERATIONS', items: [
    { label:'Lessons',  icon:'Calendar' },
    { label:'Revenue',  icon:'Revenue' },
    { label:'Messages', icon:'Message', badge:'12', badgeColor:'bg-amber-600/20 text-amber-400' },
    { label:'Feedback', icon:'Feedback', badge:'3', badgeColor:'bg-red-600/20 text-red-400' },
  ]},
  { section: 'SYSTEM', items: [
    { label:'Logs',     icon:'Clock' },
    { label:'Settings', icon:'Settings' },
  ]},
];

const Sidebar = () => (
  <aside className="w-[220px] flex-shrink-0 bg-[#0B1221] border-r border-white/[0.07] flex flex-col h-screen sticky top-0">
    {/* Logo */}
    <div className="flex items-center gap-2.5 px-5 py-4 border-b border-white/[0.07]">
      <LogoMark size={28} />
      <span className="font-sora text-[14px] font-bold text-white">DriveIQ</span>
    </div>

    {/* Nav */}
    <nav className="flex-1 overflow-y-auto py-3">
      {NAV_ITEMS.map(group => (
        <div key={group.section}>
          <div className="px-5 pt-4 pb-1.5 text-[10px] font-semibold text-white/25 tracking-[0.8px] font-dm">
            {group.section}
          </div>
          {group.items.map(item => {
            const IconComp = Icons[item.icon];
            return (
              <div key={item.label}
                className={[
                  'flex items-center gap-2.5 mx-2 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-200',
                  'text-[13px] font-medium font-dm',
                  item.active
                    ? 'bg-blue-600/15 text-blue-400 font-semibold'
                    : 'text-white/45 hover:bg-white/[0.04] hover:text-white/80',
                ].join(' ')}>
                {IconComp && <IconComp />}
                <span className="flex-1">{item.label}</span>
                {item.badge && (
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-lg ${item.badgeColor}`}>
                    {item.badge}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </nav>

    {/* Admin pill */}
    <div className="p-3 border-t border-white/[0.07]">
      <div className="flex items-center gap-2.5 bg-[#0F1A2E] border border-white/[0.07] rounded-xl p-2.5">
        <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0">
          AD
        </div>
        <div className="min-w-0">
          <div className="text-[12px] font-semibold text-white font-dm">Admin</div>
          <div className="text-[10px] text-white/30 font-dm">Platform Admin</div>
        </div>
      </div>
    </div>
  </aside>
);

// ── Top Bar ───────────────────────────────────────────────────
const Topbar = ({ range, onRangeChange }) => (
  <div className="h-14 bg-[#0B1221] border-b border-white/[0.07] flex items-center px-6 gap-4 flex-shrink-0 sticky top-0 z-20">
    <div>
      <span className="font-sora text-[15px] font-bold text-white">Platform Overview</span>
      <span className="text-[12px] text-white/25 ml-2 font-dm">Last updated: just now</span>
    </div>
    <div className="flex-1" />

    {/* Range selector */}
    <div className="flex bg-[#0F1A2E] border border-white/[0.07] rounded-lg p-0.5 gap-0.5">
      {['7d','30d','90d'].map(r => (
        <button key={r} onClick={() => onRangeChange(r)}
          className={[
            'px-3.5 py-1.5 rounded-md text-[12px] font-medium font-dm transition-all duration-200',
            range === r ? 'bg-blue-600 text-white font-semibold' : 'text-white/30 hover:text-white/60',
          ].join(' ')}>
          {r.toUpperCase()}
        </button>
      ))}
    </div>

    {/* Alert badge */}
    <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/25 rounded-lg px-3 py-1.5 cursor-pointer hover:bg-red-500/15 transition-colors">
      <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
      <span className="text-[12px] font-semibold text-red-300 font-dm">3 failed messages</span>
    </div>
  </div>
);

// ── Stat Card ─────────────────────────────────────────────────
const StatCard = ({ value, label, delta, deltaType = 'up', accent, glowColor, iconColor, icon: IconComp }) => {
  const accents = {
    blue:   { border: 'after:bg-gradient-to-r after:from-transparent after:via-blue-500 after:to-transparent', glow: 'bg-blue-600/10' },
    purple: { border: 'after:bg-gradient-to-r after:from-transparent after:via-violet-500 after:to-transparent', glow: 'bg-violet-600/8' },
    green:  { border: 'after:bg-gradient-to-r after:from-transparent after:via-emerald-500 after:to-transparent', glow: 'bg-emerald-600/8' },
    cyan:   { border: 'after:bg-gradient-to-r after:from-transparent after:via-cyan-500 after:to-transparent', glow: 'bg-cyan-600/8' },
  };
  return (
    <div className={[
      'relative bg-[#0F1A2E] border border-white/[0.07] rounded-2xl p-5 overflow-hidden',
      'transition-all duration-250 hover:border-white/[0.13] hover:-translate-y-0.5',
      'after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px]',
      accents[accent]?.border,
    ].join(' ')}>
      {/* Glow orb */}
      <div className={`absolute w-28 h-28 rounded-full -top-8 -right-6 pointer-events-none ${accents[accent]?.glow}`} />

      <div className="relative z-10">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-4 ${iconColor}`}>
          {IconComp && <IconComp />}
        </div>
        <div className="font-sora text-[34px] font-black text-white tracking-[-1.5px] leading-none mb-1">
          {value}
        </div>
        <div className="text-[12px] text-white/30 font-medium font-dm mb-3">{label}</div>
        <div className={[
          'inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-full',
          deltaType === 'up' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-blue-500/10 text-blue-400',
        ].join(' ')}>
          <Icons.TrendUp />
          {delta}
        </div>
      </div>
    </div>
  );
};

// ── Line Chart ────────────────────────────────────────────────
const GrowthLineChart = ({ data }) => {
  const cfg = {
    labels: data.labels,
    datasets: [
      {
        label: 'Schools ×10',
        data: data.schools.map(v => v / 10),
        borderColor: '#3B82F6',
        backgroundColor: (ctx) => {
          const g = ctx.chart.ctx.createLinearGradient(0, 0, 0, 150);
          g.addColorStop(0, 'rgba(59,130,246,0.2)');
          g.addColorStop(1, 'rgba(59,130,246,0)');
          return g;
        },
        fill: true, tension: 0.4, pointRadius: 3,
        pointBackgroundColor: '#3B82F6', pointBorderColor: '#0F1A2E', pointBorderWidth: 2,
      },
      {
        label: 'Students /10',
        data: data.students.map(v => v / 10),
        borderColor: '#8B5CF6',
        backgroundColor: (ctx) => {
          const g = ctx.chart.ctx.createLinearGradient(0, 0, 0, 150);
          g.addColorStop(0, 'rgba(139,92,246,0.15)');
          g.addColorStop(1, 'rgba(139,92,246,0)');
          return g;
        },
        fill: true, tension: 0.4, borderDash: [4, 3], pointRadius: 3,
        pointBackgroundColor: '#8B5CF6', pointBorderColor: '#0F1A2E', pointBorderWidth: 2,
      },
    ],
  };
  const opts = {
    responsive: true, maintainAspectRatio: false, animation: { duration: 600 },
    plugins: {
      legend: { display: false },
      tooltip: { ...tooltipStyle, callbacks: {
        label: ctx => ctx.datasetIndex === 0
          ? ` Schools: ${Math.round(ctx.raw * 10)}`
          : ` Students: ${Math.round(ctx.raw * 10)}`,
      }},
    },
    scales: {
      x: { grid: gridStyle, ticks: tickStyle, border: { color: 'transparent' } },
      y: { grid: gridStyle, ticks: tickStyle, border: { color: 'transparent' } },
    },
  };
  return (
    <div className="h-[140px]">
      <Line data={cfg} options={opts} />
    </div>
  );
};

// ── Bar Chart ─────────────────────────────────────────────────
const RevenueBarChart = ({ data }) => {
  const maxVal = Math.max(...data.revenue);
  const cfg = {
    labels: data.labels,
    datasets: [{
      label: 'Revenue (MAD)',
      data: data.revenue,
      backgroundColor: data.revenue.map(v =>
        v === maxVal ? 'rgba(37,99,235,0.9)' : 'rgba(37,99,235,0.3)'
      ),
      hoverBackgroundColor: 'rgba(59,130,246,0.9)',
      borderRadius: 5,
      borderSkipped: false,
    }],
  };
  const opts = {
    responsive: true, maintainAspectRatio: false, animation: { duration: 600 },
    plugins: {
      legend: { display: false },
      tooltip: { ...tooltipStyle, callbacks: {
        label: ctx => ` ${ctx.raw.toLocaleString()} MAD`,
      }},
    },
    scales: {
      x: { grid: { display: false }, ticks: tickStyle, border: { color: 'transparent' } },
      y: { grid: gridStyle, ticks: { ...tickStyle, callback: v => v >= 1000 ? `${v/1000}k` : v }, border: { color: 'transparent' } },
    },
  };
  return (
    <div className="h-[140px]">
      <Bar data={cfg} options={opts} />
    </div>
  );
};

// ── Donut Chart ───────────────────────────────────────────────
const CompletionDonut = () => {
  const cfg = {
    labels: ['Completed','In Progress','Pending'],
    datasets: [{
      data: [28, 2, 1],
      backgroundColor: ['#10B981','#3B82F6','rgba(245,158,11,0.7)'],
      borderWidth: 0,
      hoverOffset: 4,
    }],
  };
  const opts = {
    responsive: true, maintainAspectRatio: false, cutout: '72%',
    plugins: {
      legend: { display: false },
      tooltip: { ...tooltipStyle },
    },
  };
  const legendItems = [
    { color: 'bg-emerald-500', label: 'Completed', val: 28 },
    { color: 'bg-blue-500',    label: 'In progress', val: 2 },
    { color: 'bg-amber-500/70',label: 'Pending',     val: 1 },
  ];
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-[120px] h-[120px] mx-auto">
        <Doughnut data={cfg} options={opts} />
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="font-sora text-[22px] font-black text-white tracking-tight">90%</span>
          <span className="text-[9px] text-white/30 font-medium mt-0.5 font-dm">today</span>
        </div>
      </div>
      <div className="mt-4 flex flex-col gap-2 w-full">
        {legendItems.map(item => (
          <div key={item.label} className="flex items-center justify-between text-[11px] text-white/50 font-dm">
            <div className="flex items-center gap-1.5">
              <div className={`w-2 h-2 rounded-[2px] ${item.color}`} />
              {item.label}
            </div>
            <span className="font-semibold text-white">{item.val}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ── Health Alert Card ─────────────────────────────────────────
const AlertCard = ({ type, icon: IconComp, label, value, subValue, desc, actionLabel, actionDetail }) => {
  const styles = {
    critical: {
      wrap:   'bg-red-500/[0.07] border-red-500/25',
      icon:   'bg-red-500/18 text-red-400',
      label:  'text-red-300',
      action: 'bg-red-500/20 text-red-300 hover:bg-red-500/30',
      dot:    'bg-red-500',
      status: 'text-red-400/60',
    },
    warning: {
      wrap:   'bg-amber-500/[0.07] border-amber-500/25',
      icon:   'bg-amber-500/18 text-amber-400',
      label:  'text-amber-300',
      action: 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30',
      dot:    'bg-amber-500',
      status: 'text-amber-400/60',
    },
    success: {
      wrap:   'bg-emerald-500/[0.07] border-emerald-500/20',
      icon:   'bg-emerald-500/18 text-emerald-400',
      label:  'text-emerald-300',
      action: null,
      dot:    'bg-emerald-500',
      status: 'text-emerald-400/60',
    },
  };
  const s = styles[type];
  return (
    <div className={`border rounded-xl p-4 ${s.wrap}`}>
      <div className="flex items-center gap-2 mb-3">
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${s.icon}`}>
          {IconComp && <IconComp />}
        </div>
        <span className={`text-[12px] font-bold font-dm ${s.label}`}>{label}</span>
        <div className="ml-auto flex items-center gap-1.5">
          <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${s.dot}`} />
          <span className={`text-[10px] font-dm ${s.status}`}>{actionDetail}</span>
        </div>
      </div>

      <div className="flex items-baseline gap-1.5 mb-1">
        <span className="font-sora text-[28px] font-black text-white tracking-tight leading-none">
          {value}
        </span>
        {subValue && <span className="text-[13px] text-white/30 font-dm">{subValue}</span>}
      </div>
      <p className="text-[11px] text-white/30 font-dm mb-3">{desc}</p>

      {type === 'success' && (
        <div className="mb-3">
          <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
            <div className="h-full w-[90%] bg-emerald-500 rounded-full transition-all duration-700" />
          </div>
        </div>
      )}

      <div className="flex items-center justify-between pt-3 border-t border-white/[0.06]">
        {s.action ? (
          <button className={`text-[11px] font-semibold px-2.5 py-1.5 rounded-lg transition-colors font-dm ${s.action}`}>
            {actionLabel}
          </button>
        ) : (
          <span className="text-[11px] text-white/30 font-dm">{actionLabel}</span>
        )}
        <div className="flex items-center gap-1">
          <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
          <span className="text-[10px] text-white/25 font-dm">Live</span>
        </div>
      </div>
    </div>
  );
};

// ── Schools Table ─────────────────────────────────────────────
const SCHOOLS = [
  { rank:1, initials:'AA', color:'bg-blue-600',    name:'Auto École Atlas',  city:'Casablanca', pct:97, rating:5, students:142, rankStyle:'bg-yellow-500/20 text-yellow-400' },
  { rank:2, initials:'EL', color:'bg-violet-600',  name:'École Lumière',     city:'Rabat',      pct:94, rating:5, students:118, rankStyle:'bg-slate-500/15 text-slate-400' },
  { rank:3, initials:'AE', color:'bg-emerald-700', name:'Auto École Étoile', city:'Marrakech',  pct:91, rating:4, students:97,  rankStyle:'bg-orange-700/20 text-orange-400' },
  { rank:4, initials:'RS', color:'bg-amber-700',   name:'Route Sûre',        city:'Fès',        pct:87, rating:4, students:76,  rankStyle:'bg-white/5 text-white/30' },
  { rank:5, initials:'MR', color:'bg-cyan-800',    name:'MaRoad Academy',    city:'Tanger',     pct:82, rating:4, students:64,  rankStyle:'bg-white/5 text-white/30' },
];

const pctColor = (pct) => {
  if (pct >= 93) return 'text-emerald-400';
  if (pct >= 85) return 'text-blue-400';
  return 'text-amber-400';
};
const barColor = (pct) => {
  if (pct >= 93) return 'bg-emerald-500';
  if (pct >= 85) return 'bg-blue-500';
  return 'bg-amber-500';
};

const SchoolsTable = () => (
  <div>
    <div className="flex items-center justify-between mb-4">
      <div>
        <h3 className="font-sora text-[13px] font-bold text-white">Top performing schools</h3>
        <p className="text-[11px] text-white/30 mt-0.5 font-dm">By completion rate this week</p>
      </div>
      <span className="text-[10px] font-semibold px-2.5 py-1 rounded-lg bg-blue-600/12 text-blue-400 border border-blue-500/20 font-dm">
        Top 5
      </span>
    </div>
    <table className="w-full border-collapse">
      <thead>
        <tr>
          {['#','School','Completion','Rating','Students'].map(h => (
            <th key={h} className="text-left text-[10px] font-semibold text-white/25 tracking-[0.6px] pb-3 px-2 border-b border-white/[0.05] font-dm">
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {SCHOOLS.map(s => (
          <tr key={s.rank} className="group hover:bg-white/[0.02] transition-colors duration-150">
            <td className="py-3 px-2">
              <div className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold ${s.rankStyle}`}>
                {s.rank}
              </div>
            </td>
            <td className="py-3 px-2">
              <div className="flex items-center gap-2.5">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0 ${s.color}`}>
                  {s.initials}
                </div>
                <div>
                  <div className="text-[12px] font-semibold text-white group-hover:text-white font-dm">{s.name}</div>
                  <div className="text-[10px] text-white/25 font-dm">{s.city}</div>
                </div>
              </div>
            </td>
            <td className="py-3 px-2">
              <div className="flex items-center gap-2">
                <div className="w-16 h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${barColor(s.pct)}`} style={{ width: `${s.pct}%` }} />
                </div>
                <span className={`text-[11px] font-semibold ${pctColor(s.pct)}`}>{s.pct}%</span>
              </div>
            </td>
            <td className="py-3 px-2">
              <div className="flex gap-0.5">
                {[1,2,3,4,5].map(i => (
                  <svg key={i} width="11" height="11" viewBox="0 0 12 12" fill={i <= s.rating ? '#FBBF24' : 'rgba(255,255,255,0.1)'}>
                    <path d="M6 1l1.3 3.7H11L8.2 6.9l1 3.5L6 8.5l-3.2 1.9 1-3.5L1 4.7h3.7z"/>
                  </svg>
                ))}
              </div>
            </td>
            <td className="py-3 px-2">
              <span className="text-[12px] font-semibold text-white font-dm">{s.students}</span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// ── Feedback List ─────────────────────────────────────────────
const FEEDBACK = [
  { name:'Karim Benali',   lesson:'Highway driving · Atlas School', rating:5, comment:'Best instructor I\'ve had. Very patient and clear.' },
  { name:'Sara Moussaoui', lesson:'City route · École Lumière',     rating:4, comment:'Good lesson but started 10 minutes late. Overall solid.' },
  { name:'Yassir Moktari', lesson:'Exam prep · Auto École Étoile',  rating:5, comment:'Passed first try! DriveIQ scheduling made it easy.' },
  { name:'Lina Oussama',   lesson:'Route A · MaRoad Academy',       rating:3, comment:'App crashed during booking. Fixed quickly but frustrating.' },
];

const FeedbackList = () => (
  <div>
    <div className="flex items-center justify-between mb-4">
      <div>
        <h3 className="font-sora text-[13px] font-bold text-white">Recent feedback</h3>
        <p className="text-[11px] text-white/30 mt-0.5 font-dm">Avg platform rating: 4.8 / 5</p>
      </div>
      <span className="text-[10px] font-semibold px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-dm">
        4.8 ★
      </span>
    </div>
    <div className="flex flex-col">
      {FEEDBACK.map((f, i) => (
        <div key={f.name} className={`py-3.5 ${i < FEEDBACK.length - 1 ? 'border-b border-white/[0.04]' : ''}`}>
          <div className="flex items-start justify-between gap-3 mb-2">
            <div>
              <div className="text-[12px] font-semibold text-white font-dm">{f.name}</div>
              <div className="text-[10px] text-white/25 mt-0.5 font-dm">{f.lesson}</div>
            </div>
            <div className="flex gap-0.5 flex-shrink-0">
              {[1,2,3,4,5].map(i => (
                <svg key={i} width="11" height="11" viewBox="0 0 12 12"
                  fill={i <= f.rating ? '#FBBF24' : 'rgba(255,255,255,0.08)'}>
                  <path d="M6 1l1.3 3.7H11L8.2 6.9l1 3.5L6 8.5l-3.2 1.9 1-3.5L1 4.7h3.7z"/>
                </svg>
              ))}
            </div>
          </div>
          <p className="text-[12px] text-white/45 leading-relaxed italic font-dm">"{f.comment}"</p>
        </div>
      ))}
    </div>
  </div>
);

// ── Section Card wrapper ──────────────────────────────────────
const Card = ({ children, className = '' }) => (
  <div className={`bg-[#0F1A2E] border border-white/[0.07] rounded-2xl p-5 hover:border-white/[0.11] transition-colors duration-200 ${className}`}>
    {children}
  </div>
);



  
// ─────────────────────────────────────────────────────────────
// MAIN DASHBOARD
// ─────────────────────────────────────────────────────────────
const AdminDashboard = () => {
  const [range, setRange] = useState('7d');
  const data = RANGE_DATA[range];
  const {
    count: schoolCount,
    loading: schoolLoading,
    error: schoolError
  } = useSchoolCount();
  
  const {
    count: studentCount,
    loading: studentLoading,
    error: studentError
  } = useStudentCount();

  const {
    count: instructoretCount,
    loading: instructoreLoading,
    error: instructorError
  } = useInstructoreCount();


  return (
    <div className="flex h-screen bg-[#060B18] font-dm overflow-hidden">
      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.3} }
      `}</style>
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar range={range} onRangeChange={setRange} />

        {/* Scrollable content */}
        <main className="flex-1 overflow-y-auto p-6 space-y-5">

          {/* ── STAT STRIP ── */}
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
            <StatCard value={schoolLoading ? '…' : schoolCount}   label="Total schools"     delta="+7 this week"    accent="blue"   icon={Icons.School} iconColor="bg-blue-600/15 text-blue-400" />
            <StatCard value={studentLoading ? '…' : studentCount} label="Total students"    delta="+84 this week"   accent="purple" icon={Icons.User}   iconColor="bg-violet-600/15 text-violet-400" />
            <StatCard value={studentLoading ? '…' : studentCount}  label="Active students"   delta="71% of total"    accent="green"  icon={Icons.Grid}   iconColor="bg-emerald-600/15 text-emerald-400" />
            <StatCard value={instructoreLoading ? '…' : instructoretCount}  label="Total instructors" delta="+18 this week" deltaType="neutral" accent="cyan" icon={Icons.Star} iconColor="bg-cyan-600/15 text-cyan-400" />
          </div>

          {/* ── CHARTS + HEALTH ── */}
          <div className="grid grid-cols-1 xl:grid-cols-[1fr_1fr_300px] gap-4">
            {/* Line chart */}
            <Card>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-sora text-[13px] font-bold text-white">Platform growth</h3>
                  <p className="text-[11px] text-white/30 mt-0.5 font-dm">Schools & students over time</p>
                </div>
                <span className="text-[10px] font-semibold px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-dm">+12% MoM</span>
              </div>
              <GrowthLineChart data={data} />
              <div className="flex gap-5 mt-3">
                <div className="flex items-center gap-1.5 text-[11px] text-white/30 font-dm">
                  <div className="w-5 h-0.5 bg-blue-500 rounded" />Schools ×10
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-white/30 font-dm">
                  <div className="w-5 h-0 border-t-2 border-dashed border-violet-500" />Students
                </div>
              </div>
            </Card>

            {/* Bar chart */}
            <Card>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-sora text-[13px] font-bold text-white">Weekly revenue</h3>
                  <p className="text-[11px] text-white/30 mt-0.5 font-dm">Total across all schools (MAD)</p>
                </div>
                <span className="text-[10px] font-semibold px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 font-dm">48,200 MAD</span>
              </div>
              <RevenueBarChart data={data} />
              <div className="flex justify-between mt-3">
                <span className="text-[11px] text-white/25 font-dm">Peak: Thu 9,400 MAD</span>
                <span className="text-[11px] font-semibold text-emerald-400 font-dm">↑ +18% vs last week</span>
              </div>
            </Card>

            {/* System Health */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <h3 className="font-sora text-[13px] font-bold text-white">System health</h3>
              </div>
              <AlertCard
                type="critical" icon={Icons.Alert}
                label="Failed messages" value="3"
                desc="Undelivered SMS in the last hour"
                actionLabel="Retry all" actionDetail="Needs action"
              />
              <AlertCard
                type="warning" icon={Icons.Info}
                label="Pending messages" value="12"
                desc="Awaiting delivery confirmation"
                actionLabel="View queue" actionDetail="Monitoring"
              />
              <AlertCard
                type="success" icon={Icons.Check}
                label="Today's lessons" value="28" subValue="/31 done"
                desc="90% completion · 3 in progress"
                actionLabel="3 lessons in progress" actionDetail="On track"
              />
            </div>
          </div>

          {/* ── DONUT + BOTTOM ── */}
          <div className="grid grid-cols-1 xl:grid-cols-[200px_1fr] gap-4">

            {/* Donut */}
            <Card className="flex flex-col justify-center">
              <h3 className="font-sora text-[13px] font-bold text-white text-center mb-4">Completion rate</h3>
              <CompletionDonut />
            </Card>

            {/* Table + Feedback */}
            <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-4">
              <Card><SchoolsTable /></Card>
              <Card><FeedbackList /></Card>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;