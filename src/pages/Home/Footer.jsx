const LogoMark = ({ size = 32 }) => (
  <div
    className="bg-blue-600 flex items-center justify-center flex-shrink-0"
    style={{ width: size, height: size, borderRadius: Math.round(size * 0.28) }}
  >
    <svg
      width={Math.round(size * 0.56)}
      height={Math.round(size * 0.56)}
      viewBox="0 0 18 18"
      fill="none"
    >
      <path d="M9 2L15 7.5V16H3V7.5L9 2Z" fill="white" />
      <rect x="6.5" y="10" width="5" height="6" rx="1" fill="#1D4ED8" />
    </svg>
  </div>
);

const Footer = () => (
    <footer className="px-11 py-7 border-t border-white/[0.06] flex items-center justify-between flex-wrap gap-4">
      <div className="flex items-center gap-2">
        <LogoMark size={24} />
        <span className="font-sora text-[13px] font-bold text-white/40">DriveOJ © 2026</span>
      </div>
      <div className="flex gap-5">
        {['Privacy','Terms','Contact','Status'].map(l => (
          <a key={l} href="#" className="text-[12px] text-white/25 hover:text-white/50 transition-colors duration-200 font-dm">{l}</a>
        ))}
      </div>
      <span className="text-[11px] text-white/20 font-dm">Made with care in Morocco</span>
    </footer>
  );
export default Footer;