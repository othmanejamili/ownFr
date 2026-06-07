// ─────────────────────────────────────────────
//  StatCard.jsx  —  KPI metric tile
// ─────────────────────────────────────────────
import React from 'react';

const StatCard = ({
  label,
  value,
  sub,
  delta,         // number | null
  deltaLabel,
  icon,
  accent = '#3b82f6',
  loading = false,
}) => {
  const deltaPositive = delta > 0;
  const deltaZero     = delta === 0 || delta == null;

  return (
    <div className="relative bg-[#0D1828] border border-white/[0.06] rounded-2xl p-5 overflow-hidden
      hover:border-white/[0.1] transition-all duration-200 group">
      {/* ambient glow */}
      <div
        className="absolute -top-8 -right-8 w-24 h-24 rounded-full opacity-0 group-hover:opacity-100
          transition-opacity duration-300 blur-2xl pointer-events-none"
        style={{ background: accent }}
      />

      {/* Icon */}
      {icon && (
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center mb-3 flex-shrink-0"
          style={{ background: `${accent}22` }}
        >
          <span style={{ color: accent }} className="text-[15px]">{icon}</span>
        </div>
      )}

      {loading ? (
        <div className="space-y-2 animate-pulse">
          <div className="h-7 w-20 bg-white/[0.06] rounded" />
          <div className="h-3 w-28 bg-white/[0.04] rounded" />
        </div>
      ) : (
        <>
          <div className="text-[26px] font-bold text-white tracking-tight leading-none mb-1">
            {value}
          </div>
          <div className="text-[12px] font-medium text-white/40 mb-2">{label}</div>

          {(delta != null || sub) && (
            <div className="flex items-center gap-2 flex-wrap">
              {delta != null && !deltaZero && (
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-full
                    ${deltaPositive
                      ? 'bg-emerald-500/15 text-emerald-400'
                      : 'bg-red-500/15 text-red-400'}`}
                >
                  {deltaPositive ? '↑' : '↓'} {Math.abs(delta)}
                  {deltaLabel ? ` ${deltaLabel}` : ''}
                </span>
              )}
              {sub && (
                <span className="text-[11px] text-white/25">{sub}</span>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default StatCard;