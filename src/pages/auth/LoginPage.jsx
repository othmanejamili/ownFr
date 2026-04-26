import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
/* ─────────────────────────────────────────────
   DriveIQ — Login Page
   Stack : React + Tailwind CSS
   Font  : Add to index.html:
     <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
   tailwind.config.js → extend fontFamily:
     fontFamily: { dm: ['DM Sans', 'sans-serif'] }
   Matches Register.jsx design system exactly.
───────────────────────────────────────────── */

/* ── Inline icons ── */
const LogoMark = () => (
  <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M10 2L16 7.5V17H4V7.5L10 2Z" fill="white" />
      <rect x="7" y="11" width="6" height="6" rx="1" fill="#1D4ED8" />
    </svg>
  </div>
);

const EyeIcon = ({ open }) => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    {open ? (
      <>
        <circle cx="8" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.2" />
        <path d="M1 8c1.5-3.5 4-5 7-5s5.5 1.5 7 5c-1.5 3.5-4 5-7 5s-5.5-1.5-7-5z"
          stroke="currentColor" strokeWidth="1.2" />
      </>
    ) : (
      <>
        <path d="M2 2l12 12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        <path d="M6.5 6.6A2.5 2.5 0 009.4 9.5M4 4.3C2.6 5.3 1.5 6.5 1 8c1.5 3.5 4 5 7 5 1.3 0 2.5-.3 3.5-.9M10 5.3A5.5 5.5 0 0115 8c-.5 1.1-1.3 2.1-2.3 2.9"
          stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      </>
    )}
  </svg>
);

const CheckIcon = () => (
  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
    <path d="M2 5l2.5 2.5L8 3" stroke="currentColor" strokeWidth="1.4"
      strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const StarIcon = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="#FBBF24">
    <path d="M6 1l1.3 3.7H11L8.2 6.9l1 3.5L6 8.5l-3.2 1.9 1-3.5L1 4.7h3.7z" />
  </svg>
);

const MailIcon = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
    <rect x="1" y="3" width="13" height="9" rx="2" stroke="currentColor" strokeWidth="1.2" />
    <path d="M1 5l6.5 4.5L14 5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
  </svg>
);

const LockIcon = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
    <rect x="2.5" y="6.5" width="10" height="8" rx="2" stroke="currentColor" strokeWidth="1.2" />
    <path d="M4.5 6.5V4.5a3 3 0 016 0v2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    <circle cx="7.5" cy="10.5" r="1" fill="currentColor" />
  </svg>
);

/* ── Reusable Field wrapper ── */
function Field({ label, error, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-semibold uppercase tracking-widest text-white/40">
        {label}
      </label>
      {children}
      {error && (
        <p className="text-[11px] text-red-400 font-medium flex items-center gap-1.5">
          <span className="inline-flex w-3.5 h-3.5 rounded-full bg-red-500/20 text-red-400 items-center justify-center text-[9px] font-bold flex-shrink-0">!</span>
          {error}
        </p>
      )}
    </div>
  );
}

/* ── Text Input ── */
function TextInput({ icon, right, hasError, ...props }) {
  return (
    <div className="relative">
      {icon && (
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none">
          {icon}
        </span>
      )}
      <input
        {...props}
        className={[
          'w-full bg-white/[0.04] border rounded-xl',
          'text-[13px] text-white placeholder:text-white/20 font-medium',
          'outline-none transition-all duration-200',
          'focus:border-blue-500 focus:bg-blue-600/[0.08] focus:ring-2 focus:ring-blue-500/20',
          hasError
            ? 'border-red-500/60 bg-red-500/[0.05]'
            : 'border-white/10',
          icon ? 'pl-10 py-3' : 'pl-4 py-3',
          right ? 'pr-11' : 'pr-4',
        ].join(' ')}
      />
      {right && (
        <span className="absolute right-3.5 top-1/2 -translate-y-1/2">
          {right}
        </span>
      )}
    </div>
  );
}

/* ── Mini stat card for left panel ── */
function StatCard({ val, lbl, accent }) {
  return (
    <div className="flex-1 bg-white/[0.02] border border-white/[0.07] rounded-xl px-4 py-3.5 text-center">
      <div className={`text-[20px] font-black tracking-tight ${accent || 'text-white'}`}>{val}</div>
      <div className="text-[10px] text-white/30 mt-0.5 font-medium">{lbl}</div>
    </div>
  );
}

/* ── Live schedule item ── */
function ScheduleRow({ name, time, status, color }) {
  const colors = {
    blue:   { dot: 'bg-blue-500',   badge: 'bg-blue-500/15 text-blue-300' },
    purple: { dot: 'bg-violet-500', badge: 'bg-violet-500/15 text-violet-300' },
    green:  { dot: 'bg-emerald-500',badge: 'bg-emerald-500/15 text-emerald-300' },
  };
  const c = colors[color] || colors.blue;
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-white/[0.05] last:border-0">
      <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${c.dot}`} />
      <div className="flex-1 min-w-0">
        <div className="text-[12px] font-semibold text-white/80 truncate">{name}</div>
        <div className="text-[10px] text-white/30 mt-0.5">{time}</div>
      </div>
      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${c.badge}`}>
        {status}
      </span>
    </div>
  );
}

/* ════════════════════════════════════════════
   MAIN COMPONENT
════════════════════════════════════════════ */
const Login = () => {
  const { login } = useAuth();

  // ✅ All state declarations — were missing
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors,   setErrors]   = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPw,   setShowPw]   = useState(false);
  const [remember, setRemember] = useState(false);
  const [success,  setSuccess]  = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const e = {};
    if (!formData.email.trim())
      e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      e.email = 'Enter a valid email address';
    if (!formData.password)
      e.password = 'Password is required';
    else if (formData.password.length < 6)
      e.password = 'Password must be at least 6 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);

    try {
      // ✅ login() returns { success, userData } — destructure correctly
      const result = await login(formData.email, formData.password, remember);

      if (!result.success) {
        setErrors({ form: result.message || 'Login failed.' });
        return;
      }

      const { role } = result.userData;
      const routes = { A: '/dashboard/admin', I: '/dashboard/instructor', S: '/dashboard/student' };

      setSuccess(true);
      setTimeout(() => {
        window.location.href = routes[role] || '/';
      }, 1200);

    } catch (error) {
      setErrors({ form: error.response?.data?.error || 'Login failed.' });
    } finally {
      setIsLoading(false);
    }
  };

  // ... rest of JSX unchanged

  /* ── today's schedule (static demo data) ── */
  const schedule = [
    { name: 'Karim Benali',    time: '09:00 – 10:30 · Route A',  status: 'Confirmed',   color: 'blue'   },
    { name: 'Lina Oussama',    time: '11:00 – 12:30 · Highway',  status: 'In progress', color: 'purple' },
    { name: 'Yassir Moktari',  time: '14:00 – 15:30 · City',     status: 'Upcoming',    color: 'green'  },
  ];

  return (
    <div className="min-h-screen bg-[#080E1A] font-dm flex">

      {/* ══════════════ LEFT PANEL ══════════════ */}
      <div className="hidden lg:flex w-[48%] flex-col justify-between p-10 relative overflow-hidden border-r border-white/[0.06]">

        {/* Grid texture */}
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(rgba(37,99,235,1) 1px,transparent 1px),linear-gradient(90deg,rgba(37,99,235,1) 1px,transparent 1px)',
            backgroundSize: '44px 44px',
          }}
        />

        {/* Glow orbs */}
        <div className="absolute w-96 h-96 rounded-full bg-blue-600/[0.10] -top-20 -left-20 pointer-events-none" />
        <div className="absolute w-56 h-56 rounded-full bg-emerald-500/[0.07] bottom-16 left-32 pointer-events-none" />

        {/* ── Top section ── */}
        <div className="relative z-10">

          {/* Logo */}
          <div className="flex items-center gap-2.5 mb-12">
            <LogoMark />
            <span className="text-white font-bold text-[15px] tracking-tight">DriveIQ</span>
          </div>

          {/* Headline */}
          <div className="mb-8">
            <h1 className="text-[36px] font-extrabold text-white leading-[1.1] tracking-tight mb-4">
              Welcome back.<br />
              Your school<br />
              <span className="text-blue-500">awaits you.</span>
            </h1>
            <p className="text-[14px] text-white/40 leading-relaxed max-w-[290px]">
              Everything you need to run your driving school efficiently — all in one place.
            </p>
          </div>

          {/* Stats row */}
          <div className="flex gap-2.5 mb-8">
            <StatCard val="248+" lbl="Active schools" />
            <StatCard val="91%"  lbl="Pass rate avg"  accent="text-emerald-400" />
            <StatCard val="4.9"  lbl="User rating"    accent="text-amber-400" />
          </div>

          {/* Live dashboard preview card */}
          <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl overflow-hidden">

            {/* Fake browser bar */}
            <div className="flex items-center gap-2 px-4 py-3 bg-white/[0.03] border-b border-white/[0.05]">
              <div className="flex gap-1.5">
                <div className="w-2 h-2 rounded-full bg-red-500/60" />
                <div className="w-2 h-2 rounded-full bg-amber-500/60" />
                <div className="w-2 h-2 rounded-full bg-emerald-500/60" />
              </div>
              <div className="flex-1 bg-white/[0.05] rounded-md h-5 mx-4 flex items-center px-2">
                <span className="text-[10px] text-white/20 font-mono">app.driveiq.ma/dashboard</span>
              </div>
            </div>

            {/* KPI mini row */}
            <div className="grid grid-cols-3 border-b border-white/[0.05]">
              {[
                { val: '31',  lbl: 'Lessons today',  color: 'text-white' },
                { val: '48k', lbl: 'Revenue (MAD)',   color: 'text-emerald-400' },
                { val: '3',   lbl: 'Pending confirm', color: 'text-amber-400' },
              ].map((k, i) => (
                <div key={i} className={`px-4 py-3 ${i < 2 ? 'border-r border-white/[0.05]' : ''}`}>
                  <div className={`text-[16px] font-black ${k.color}`}>{k.val}</div>
                  <div className="text-[10px] text-white/30 mt-0.5">{k.lbl}</div>
                </div>
              ))}
            </div>

            {/* Schedule preview */}
            <div className="px-4 pt-3 pb-1">
              <div className="text-[10px] font-bold text-white/30 tracking-widest uppercase mb-1">
                Today's schedule
              </div>
              {schedule.map((s, i) => (
                <ScheduleRow key={i} {...s} />
              ))}
            </div>
          </div>
        </div>

        {/* ── Bottom: testimonial ── */}
        <div className="relative z-10 bg-white/[0.03] border border-white/[0.07] rounded-2xl p-5 mt-6">
          <div className="flex gap-0.5 mb-3">
            {[1, 2, 3, 4, 5].map(i => <StarIcon key={i} />)}
          </div>
          <p className="text-[13px] text-white/50 leading-relaxed italic mb-4">
            "Logging into DriveIQ every morning is the first thing I do — everything I need is right there."
          </p>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0">
              SM
            </div>
            <div>
              <div className="text-[12px] font-semibold text-white/80">Sara Moussaoui</div>
              <div className="text-[11px] text-white/30">Owner · Auto École Lumière, Rabat</div>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════ RIGHT PANEL ══════════════ */}
      <div className="flex-1 flex items-center justify-center px-6 py-10 bg-[#0D1526] overflow-y-auto">
        <div className="w-full max-w-[380px]">

          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2.5 mb-8">
            <LogoMark />
            <span className="text-white font-bold text-[15px]">DriveIQ</span>
          </div>

          {/* Header */}
          <div className="mb-8">
            {/* Live badge */}
            <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-3 py-1.5 mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] font-semibold text-emerald-400 tracking-wide">
                31 lessons running today
              </span>
            </div>
            <h2 className="text-[28px] font-extrabold text-white tracking-tight mb-1.5">
              Login to DriveIQ
            </h2>
            <p className="text-[13px] text-white/35">
              No account yet?{' '}
              <a href="/register" className="text-blue-400 font-semibold hover:text-blue-300 transition-colors">
                Create one free
              </a>
            </p>
          </div>

          {/* Success banner */}
          {success && (
            <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-4 py-3.5 mb-6 animate-pulse">
              <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
                <CheckIcon />
              </span>
              <p className="text-[13px] text-emerald-400 font-semibold">
                Login successful! Redirecting to dashboard…
              </p>
            </div>
          )}

          {/* Form-level error */}
          {errors.form && (
            <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3.5 mb-6">
              <span className="w-6 h-6 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center flex-shrink-0 text-[11px] font-bold mt-px">
                !
              </span>
              <p className="text-[13px] text-red-400 font-medium leading-snug">{errors.form}</p>
            </div>
          )}

          {/* ── Form ── */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>

            {/* Email */}
            <Field label="Email address" error={errors.email}>
              <TextInput
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@drivingschool.ma"
                hasError={!!errors.email}
                icon={<MailIcon />}
                autoComplete="email"
              />
            </Field>

            {/* Password */}
            <Field label="Password" error={errors.password}>
              <TextInput
                type={showPw ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Your password"
                hasError={!!errors.password}
                icon={<LockIcon />}
                autoComplete="current-password"
                right={
                  <button
                    type="button"
                    onClick={() => setShowPw(v => !v)}
                    className="text-white/25 hover:text-white/60 transition-colors p-0.5"
                    tabIndex={-1}
                  >
                    <EyeIcon open={showPw} />
                  </button>
                }
              />
            </Field>

            {/* Remember me + Forgot password */}
            <div className="flex items-center justify-between -mt-1">
              <label className="flex items-center gap-2.5 cursor-pointer group">
                <div
                  onClick={() => setRemember(v => !v)}
                  className={[
                    'w-4 h-4 rounded border transition-all duration-150 flex items-center justify-center flex-shrink-0',
                    remember
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : 'bg-white/[0.04] border-white/20 group-hover:border-white/40',
                  ].join(' ')}
                >
                  {remember && <CheckIcon />}
                </div>
                <span className="text-[12px] text-white/40 group-hover:text-white/60 transition-colors select-none">
                  Remember me
                </span>
              </label>
              <Link
                to={"/forgot-password"}
                className="text-[12px] text-blue-400 font-semibold hover:text-blue-300 transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading || success}
              className={[
                'w-full py-3.5 rounded-xl text-[14px] font-bold tracking-tight transition-all duration-200 mt-1',
                'flex items-center justify-center gap-2',
                isLoading || success
                  ? 'bg-blue-600/60 text-white/60 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-500 active:scale-[0.99] text-white shadow-lg shadow-blue-600/20',
              ].join(' ')}
            >
              {isLoading && (
                <svg className="animate-spin w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.25" />
                  <path d="M12 2a10 10 0 0110 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                </svg>
              )}
              {isLoading ? 'Logging in…' : success ? 'Redirecting…' : 'Login to DriveIQ'}
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-white/[0.07]" />
              <span className="text-[11px] text-white/20 font-medium">or continue with</span>
              <div className="flex-1 h-px bg-white/[0.07]" />
            </div>

            {/* Google SSO */}
            <button
              type="button"
              className="w-full py-3 rounded-xl bg-white/[0.04] border border-white/10 text-[13px] font-medium text-white/65 hover:bg-white/[0.07] hover:text-white hover:border-white/20 transition-all duration-200 flex items-center justify-center gap-2.5"
            >
              <svg width="16" height="16" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Continue with Google
            </button>

          </form>

          {/* Trust footer */}
          <div className="flex items-center justify-center gap-2 mt-8">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] text-white/20">SSL secured · Your data is safe with DriveIQ</span>
          </div>

        </div>
      </div>

    </div>
  );
};

export default Login;