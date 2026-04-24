import { useState } from 'react';
import axios from 'axios';

/* ─────────────────────────────────────────────
   DriveIQ — Register Page
   Stack : React + Tailwind CSS
   Font  : Add to index.html or tailwind config:
     <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
   Tailwind config  — extend fontFamily:
     fontFamily: { dm: ['DM Sans', 'sans-serif'] }
───────────────────────────────────────────── */

const EyeIcon = ({ open }) => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-current">
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
    <path d="M2 5l2.5 2.5L8 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const StarIcon = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="#FBBF24">
    <path d="M6 1l1.3 3.7H11L8.2 6.9l1 3.5L6 8.5l-3.2 1.9 1-3.5L1 4.7h3.7z" />
  </svg>
);

const LogoMark = () => (
  <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M10 2L16 7.5V17H4V7.5L10 2Z" fill="white" />
      <rect x="7" y="11" width="6" height="6" rx="1" fill="#1D4ED8" />
    </svg>
  </div>
);

/* ── Field wrapper ── */
function Field({ label, error, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-semibold uppercase tracking-widest text-white/40">
        {label}
      </label>
      {children}
      {error && (
        <p className="text-[11px] text-red-400 font-medium flex items-center gap-1">
          <span className="inline-block w-3 h-3 rounded-full bg-red-500/20 text-red-400 text-[9px] flex items-center justify-center">!</span>
          {error}
        </p>
      )}
    </div>
  );
}

/* ── Text Input ── */
function TextInput({ icon, right, className = '', ...props }) {
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
          'w-full bg-white/[0.04] border border-white/10 rounded-xl',
          'text-[13px] text-white placeholder:text-white/20 font-medium',
          'outline-none transition-all duration-200',
          'focus:border-blue-500 focus:bg-blue-600/[0.08] focus:ring-2 focus:ring-blue-500/20',
          props['data-error'] === 'true' ? 'border-red-500/60 bg-red-500/[0.05]' : '',
          icon ? 'pl-10 pr-4 py-3' : right ? 'pl-4 pr-11 py-3' : 'px-4 py-3',
          className,
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

/* ── Strength bar ── */
function StrengthBar({ score, label }) {
  const colors = {
    Weak:   { bar: 'bg-red-500',    text: 'text-red-400' },
    Medium: { bar: 'bg-amber-500',  text: 'text-amber-400' },
    Good:   { bar: 'bg-blue-500',   text: 'text-blue-400' },
    Strong: { bar: 'bg-emerald-500',text: 'text-emerald-400' },
  };
  const fill = Math.min(score, 5);
  const c = colors[label] || {};
  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-1.5">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i}
            className={[
              'h-1 flex-1 rounded-full transition-all duration-300',
              i <= fill ? c.bar || 'bg-white/20' : 'bg-white/[0.08]',
            ].join(' ')}
          />
        ))}
      </div>
      {label && (
        <p className={`text-[11px] font-semibold ${c.text}`}>
          Password strength: {label}
        </p>
      )}
    </div>
  );
}

/* ── Requirement item ── */
function Req({ met, text }) {
  return (
    <div className={`flex items-center gap-2 text-[11px] transition-colors duration-200 ${met ? 'text-emerald-400' : 'text-white/30'}`}>
      <span className={[
        'w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-200',
        met ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/[0.06] text-transparent',
      ].join(' ')}>
        <CheckIcon />
      </span>
      {text}
    </div>
  );
}

/* ════════════════════════════════════════════
   MAIN COMPONENT
════════════════════════════════════════════ */
const Register = () => {
  const [formData, setFormData] = useState({
    username: '', first_name: '', last_name: '',
    phone_number: '', email: '', password: '', confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, label: '' });
  const [showPw, setShowPw] = useState(false);
  const [showCf, setShowCf] = useState(false);

  /* ── handlers ── */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    if (name === 'password') calcStrength(value);
  };

  const calcStrength = (pw) => {
    if (!pw) return setPasswordStrength({ score: 0, label: '' });
    let score = 0;
    if (pw.length >= 8)  score++;
    if (pw.length >= 12) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    const label = score <= 2 ? 'Weak' : score <= 3 ? 'Medium' : score <= 4 ? 'Good' : 'Strong';
    setPasswordStrength({ score, label });
  };

  const validateForm = () => {
    const e = {};
    if (!formData.username.trim())      e.username     = 'Username is required';
    else if (formData.username.length < 3) e.username  = 'Min. 3 characters';
    if (!formData.first_name.trim())    e.first_name   = 'First name is required';
    else if (formData.first_name.length < 2) e.first_name = 'Min. 2 characters';
    if (!formData.last_name.trim())     e.last_name    = 'Last name is required';
    else if (formData.last_name.length < 2)  e.last_name  = 'Min. 2 characters';
    if (!formData.phone_number.trim())  e.phone_number = 'Phone number is required';
    else if (!/^\+?[0-9\s\-]{10,15}$/.test(formData.phone_number))
      e.phone_number = 'Enter a valid number (e.g. +212 721221670)';
    if (!formData.email.trim())         e.email        = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) e.email = 'Email is invalid';
    if (!formData.password)             e.password     = 'Password is required';
    else if (formData.password.length < 8) e.password  = 'Min. 8 characters';
    if (!formData.confirmPassword)      e.confirmPassword = 'Please confirm your password';
    else if (formData.password !== formData.confirmPassword) e.confirmPassword = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);
    try {
      await axios.post('http://127.0.0.1:8000/api/users/', {
        username:     formData.username,
        first_name:   formData.first_name,
        last_name:    formData.last_name,
        phone_number: formData.phone_number,
        email:        formData.email,
        password:     formData.password,
      }, { headers: { 'Content-Type': 'application/json' } });

      setSuccess(true);
      setFormData({ username:'', first_name:'', last_name:'', phone_number:'', email:'', password:'', confirmPassword:'' });
      setPasswordStrength({ score: 0, label: '' });
    } catch (error) {
      if (error.response?.data && typeof error.response.data === 'object' && !Array.isArray(error.response.data)) {
        const serverErrors = {};
        Object.keys(error.response.data).forEach(k => {
          serverErrors[k] = Array.isArray(error.response.data[k])
            ? error.response.data[k].join(' ')
            : error.response.data[k];
        });
        setErrors(prev => ({ ...prev, ...serverErrors, form: 'Please correct the errors below.' }));
      } else {
        setErrors(prev => ({ ...prev, form: error.response?.data?.detail || error.message || 'Registration failed. Please try again.' }));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const pw = formData.password;
  const pwReqs = [
    { met: pw.length >= 8,        text: 'At least 8 characters' },
    { met: /[A-Z]/.test(pw),      text: 'Contains uppercase letter' },
    { met: /[0-9]/.test(pw),      text: 'Contains a number' },
    { met: /[^A-Za-z0-9]/.test(pw), text: 'Contains special character' },
  ];

  /* ── icons (inline SVG keeps it self-contained) ── */
  const UserIcon = () => (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
      <circle cx="7.5" cy="5" r="3" stroke="currentColor" strokeWidth="1.2" />
      <path d="M1.5 14c0-3.3 2.7-5.5 6-5.5s6 2.2 6 5.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
  const MailIcon = () => (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
      <rect x="1" y="3" width="13" height="9" rx="2" stroke="currentColor" strokeWidth="1.2" />
      <path d="M1 5l6.5 4.5L14 5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
  const PhoneIcon = () => (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
      <path d="M5 1h5a1 1 0 011 1v11a1 1 0 01-1 1H5a1 1 0 01-1-1V2a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="7.5" cy="11.5" r="0.75" fill="currentColor" />
    </svg>
  );
  const AtIcon = () => (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
      <circle cx="7.5" cy="7.5" r="2.5" stroke="currentColor" strokeWidth="1.2" />
      <path d="M10 7.5c0 1.5.7 2.5 2 2.5V5A4.5 4.5 0 103 7.5a4.5 4.5 0 004 4.4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );

  return (
    /* Root — full viewport, dark background */
    <div className="min-h-screen bg-[#080E1A] font-dm flex">

      {/* ══════════════ LEFT PANEL ══════════════ */}
      <div className="hidden lg:flex w-[46%] flex-col justify-between p-10 relative overflow-hidden border-r border-white/[0.06]">

        {/* Grid texture */}
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage:'linear-gradient(rgba(37,99,235,1) 1px,transparent 1px),linear-gradient(90deg,rgba(37,99,235,1) 1px,transparent 1px)', backgroundSize:'44px 44px' }} />

        {/* Glow orbs */}
        <div className="absolute w-96 h-96 rounded-full bg-blue-600/[0.10] -top-20 -left-20 pointer-events-none" />
        <div className="absolute w-64 h-64 rounded-full bg-emerald-500/[0.06] bottom-10 left-28 pointer-events-none" />

        {/* Top: logo + headline */}
        <div className="relative z-10">
          <div className="flex items-center gap-2.5 mb-14">
            <LogoMark />
            <span className="text-white font-bold text-[15px] tracking-tight">DriveIQ</span>
          </div>

          <div className="mb-6">
            <div className="inline-flex items-center gap-2 bg-blue-600/[0.15] border border-blue-500/30 rounded-full px-3.5 py-1.5 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] font-semibold text-blue-300 tracking-wide">Free 14-day trial · No card needed</span>
            </div>
          </div>

          <h1 className="text-[36px] font-extrabold text-white leading-[1.1] tracking-tight mb-4">
            Your driving school,<br />
            <span className="text-blue-500">on autopilot.</span>
          </h1>
          <p className="text-[14px] text-white/40 leading-relaxed max-w-[300px]">
            Join 248+ schools across Morocco already saving hours every week on scheduling, billing, and student management.
          </p>

          {/* Stats */}
          <div className="mt-10 grid grid-cols-3 border border-white/[0.07] rounded-2xl overflow-hidden">
            {[
              { val: '248+', lbl: 'Schools active' },
              { val: '91%',  lbl: 'Avg pass rate' },
              { val: '4.9',  lbl: 'User rating' },
            ].map((s, i) => (
              <div key={i} className={`px-5 py-4 ${i < 2 ? 'border-r border-white/[0.07]' : ''} bg-white/[0.02]`}>
                <div className="text-[22px] font-black text-white tracking-tight">{s.val}</div>
                <div className="text-[11px] text-white/35 mt-0.5">{s.lbl}</div>
              </div>
            ))}
          </div>

          {/* Feature list */}
          <div className="mt-8 flex flex-col gap-3">
            {[
              'Smart scheduling & calendar sync',
              'Student progress & test tracking',
              'Automated invoicing & payments',
              'SMS & email reminders',
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-2.5 text-[13px] text-white/55">
                <span className="w-4 h-4 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 flex-shrink-0">
                  <CheckIcon />
                </span>
                {f}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom: testimonial */}
        <div className="relative z-10 bg-white/[0.03] border border-white/[0.07] rounded-2xl p-5">
          <div className="flex gap-0.5 mb-3">
            {[1,2,3,4,5].map(i => <StarIcon key={i} />)}
          </div>
          <p className="text-[13px] text-white/55 leading-relaxed italic mb-4">
            "DriveIQ cut our admin work in half. Scheduling used to take 3 hours a week — now it's 20 minutes."
          </p>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0">KA</div>
            <div>
              <div className="text-[12px] font-semibold text-white/80">Karim Alaoui</div>
              <div className="text-[11px] text-white/30">Owner · Auto École Atlas, Casablanca</div>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════ RIGHT PANEL ══════════════ */}
      <div className="flex-1 flex items-center justify-center px-6 py-10 bg-[#0D1526] overflow-y-auto">
        <div className="w-full max-w-[420px]">

          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2.5 mb-8">
            <LogoMark />
            <span className="text-white font-bold text-[15px]">DriveIQ</span>
          </div>

          {/* Header */}
          <div className="mb-7">
            <h2 className="text-[28px] font-extrabold text-white tracking-tight mb-1">Create your account</h2>
            <p className="text-[13px] text-white/35">
              Already have one?{' '}
              <a href="/login" className="text-blue-400 font-semibold hover:text-blue-300 transition-colors">Login here</a>
            </p>
          </div>

          {/* Success banner */}
          {success && (
            <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-4 py-3.5 mb-6">
              <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
                <CheckIcon />
              </span>
              <p className="text-[13px] text-emerald-400 font-medium">Account created! You can now <a href="/login" className="underline">login</a>.</p>
            </div>
          )}

          {/* Form error */}
          {errors.form && (
            <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3.5 mb-6">
              <span className="w-6 h-6 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center flex-shrink-0 text-[11px] font-bold">!</span>
              <p className="text-[13px] text-red-400 font-medium">{errors.form}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>

            {/* First + Last name row */}
            <div className="grid grid-cols-2 gap-3">
              <Field label="First name" error={errors.first_name}>
                <TextInput
                  type="text" name="first_name" value={formData.first_name}
                  onChange={handleChange} placeholder="Karim"
                  data-error={!!errors.first_name ? 'true' : 'false'}
                  icon={<UserIcon />}
                />
              </Field>
              <Field label="Last name" error={errors.last_name}>
                <TextInput
                  type="text" name="last_name" value={formData.last_name}
                  onChange={handleChange} placeholder="Alaoui"
                  data-error={!!errors.last_name ? 'true' : 'false'}
                />
              </Field>
            </div>

            {/* Username */}
            <Field label="Username" error={errors.username}>
              <TextInput
                type="text" name="username" value={formData.username}
                onChange={handleChange} placeholder="karim.alaoui"
                data-error={!!errors.username ? 'true' : 'false'}
                icon={<AtIcon />}
              />
            </Field>

            {/* Phone */}
            <Field label="Phone number" error={errors.phone_number}>
              <TextInput
                type="tel" name="phone_number" value={formData.phone_number}
                onChange={handleChange} placeholder="+212 721 221 670"
                data-error={!!errors.phone_number ? 'true' : 'false'}
                icon={<PhoneIcon />}
              />
            </Field>

            {/* Email */}
            <Field label="Email address" error={errors.email}>
              <TextInput
                type="email" name="email" value={formData.email}
                onChange={handleChange} placeholder="karim@autoecole.ma"
                data-error={!!errors.email ? 'true' : 'false'}
                icon={<MailIcon />}
              />
            </Field>

            {/* Password */}
            <Field label="Password" error={errors.password}>
              <TextInput
                type={showPw ? 'text' : 'password'} name="password" value={formData.password}
                onChange={handleChange} placeholder="Min. 8 characters"
                data-error={!!errors.password ? 'true' : 'false'}
                right={
                  <button type="button" onClick={() => setShowPw(v => !v)}
                    className="text-white/25 hover:text-white/60 transition-colors p-0.5">
                    <EyeIcon open={showPw} />
                  </button>
                }
              />
              {pw && (
                <div className="mt-1">
                  <StrengthBar score={passwordStrength.score} label={passwordStrength.label} />
                  <div className="mt-2.5 flex flex-col gap-1.5">
                    {pwReqs.map((r, i) => <Req key={i} met={r.met} text={r.text} />)}
                  </div>
                </div>
              )}
            </Field>

            {/* Confirm password */}
            <Field label="Confirm password" error={errors.confirmPassword}>
              <TextInput
                type={showCf ? 'text' : 'password'} name="confirmPassword" value={formData.confirmPassword}
                onChange={handleChange} placeholder="Repeat your password"
                data-error={!!errors.confirmPassword ? 'true' : 'false'}
                right={
                  <button type="button" onClick={() => setShowCf(v => !v)}
                    className="text-white/25 hover:text-white/60 transition-colors p-0.5">
                    <EyeIcon open={showCf} />
                  </button>
                }
              />
            </Field>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className={[
                'w-full py-3.5 rounded-xl text-[14px] font-bold tracking-tight transition-all duration-200 mt-2',
                'flex items-center justify-center gap-2',
                isLoading
                  ? 'bg-blue-600/60 text-white/60 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-500 active:scale-[0.99] text-white',
              ].join(' ')}
            >
              {isLoading && (
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.25" />
                  <path d="M12 2a10 10 0 0110 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                </svg>
              )}
              {isLoading ? 'Creating account…' : 'Create my account'}
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3 my-1">
              <div className="flex-1 h-px bg-white/[0.07]" />
              <span className="text-[11px] text-white/20 font-medium">or sign up with</span>
              <div className="flex-1 h-px bg-white/[0.07]" />
            </div>

            {/* Google */}
            <button
              type="button"
              className="w-full py-3 rounded-xl bg-white/[0.04] border border-white/10 text-[13px] font-medium text-white/65 hover:bg-white/[0.07] hover:text-white hover:border-white/20 transition-all duration-200 flex items-center justify-center gap-2.5"
            >
              <svg width="16" height="16" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>

          </form>

          {/* Trust footer */}
          <div className="flex items-center justify-center gap-2 mt-6">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] text-white/20">SSL secured · Your data is safe with DriveIQ</span>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Register;