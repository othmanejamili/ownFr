// src/pages/auth/RegisterPage.jsx
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const API = 'http://127.0.0.1:8000/api';

/* ─────────────────────────────────────────────
   Tiny helpers
───────────────────────────────────────────── */
const cls = (...args) => args.filter(Boolean).join(' ');

const Field = ({ label, error, children }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/35">
      {label}
    </label>
    {children}
    {error && <p className="text-[11px] text-red-400 mt-0.5">{error}</p>}
  </div>
);

const Input = ({ className = '', ...props }) => (
  <input
    {...props}
    className={cls(
      'w-full bg-white/[0.04] border rounded-xl px-4 py-3 text-[13px] text-white',
      'placeholder:text-white/15 outline-none transition-all duration-200',
      'focus:bg-white/[0.07]',
      props.disabled ? 'opacity-40 cursor-not-allowed' : '',
      className
    )}
    style={{
      borderColor: 'rgba(255,255,255,0.09)',
      ...props.style,
    }}
    onFocus={e => { e.target.style.borderColor = '#3b82f6'; e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.12)'; }}
    onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.09)'; e.target.style.boxShadow = 'none'; }}
  />
);

const Btn = ({ children, variant = 'primary', className = '', ...props }) => {
  const base = 'relative w-full py-3.5 rounded-xl font-bold text-[13px] tracking-wide transition-all duration-200 flex items-center justify-center gap-2 overflow-hidden';
  const variants = {
    primary: 'bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-40 disabled:cursor-not-allowed',
    ghost:   'border border-white/10 text-white/50 hover:text-white hover:border-white/25 hover:bg-white/[0.04]',
  };
  return (
    <button {...props} className={cls(base, variants[variant], className)}>
      {children}
    </button>
  );
};

/* ─────────────────────────────────────────────
   Step indicator
───────────────────────────────────────────── */
const STEPS = ['Account', 'School', 'Plan', 'Done'];

const StepBar = ({ current }) => (
  <div className="flex items-center gap-0 mb-10 select-none">
    {STEPS.map((label, i) => {
      const done    = current > i + 1;
      const active  = current === i + 1;
      const pending = current < i + 1;
      return (
        <div key={i} className="flex items-center flex-1 last:flex-none">
          <div className="flex flex-col items-center gap-1.5">
            <div
              className={cls(
                'w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-black transition-all duration-300 flex-shrink-0',
                done    ? 'bg-emerald-500 text-white'        : '',
                active  ? 'bg-blue-600 text-white ring-4 ring-blue-600/20' : '',
                pending ? 'bg-white/[0.06] text-white/25'   : ''
              )}
            >
              {done ? (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ) : i + 1}
            </div>
            <span className={cls(
              'text-[10px] font-semibold tracking-widest uppercase',
              active  ? 'text-white'     : '',
              done    ? 'text-emerald-400' : '',
              pending ? 'text-white/20'  : ''
            )}>
              {label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div className={cls(
              'flex-1 h-px mx-2 mb-5 transition-all duration-500',
              done ? 'bg-emerald-500/40' : 'bg-white/[0.07]'
            )} />
          )}
        </div>
      );
    })}
  </div>
);

/* ─────────────────────────────────────────────
   Plan card
───────────────────────────────────────────── */
const PlanCard = ({ plan, selected, onSelect }) => {
  const feats = Array.isArray(plan.features)
    ? plan.features
    : Object.values(plan.features || {});

  return (
    <div
      onClick={() => onSelect(plan.id)}
      className={cls(
        'border rounded-2xl p-5 cursor-pointer transition-all duration-200 relative overflow-hidden',
        selected
          ? 'border-blue-500 bg-blue-600/[0.08]'
          : 'border-white/[0.08] bg-white/[0.025] hover:border-white/20 hover:bg-white/[0.04]'
      )}
    >
      {selected && (
        <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center">
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M1.5 5l2.5 2.5 4.5-4.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      )}
      <div className="flex items-start justify-between gap-4 mb-3">
        <div>
          <p className="text-[15px] font-extrabold text-white tracking-tight">{plan.name}</p>
          <p className="text-[11px] text-white/35 mt-0.5">
            {plan.max_students} students · {plan.max_instructors} instructors
          </p>
        </div>
        <div className="text-right flex-shrink-0">
          <span className="text-[22px] font-black text-white">${plan.price}</span>
          <span className="text-[11px] text-white/30">/mo</span>
        </div>
      </div>
      {feats.length > 0 && (
        <ul className="flex flex-col gap-1.5 mt-3 border-t border-white/[0.06] pt-3">
          {feats.slice(0, 4).map((f, i) => (
            <li key={i} className="flex items-center gap-2 text-[12px] text-white/50">
              <span className="w-1 h-1 rounded-full bg-blue-500/60 flex-shrink-0" />
              {f}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

/* ─────────────────────────────────────────────
   Password strength meter
───────────────────────────────────────────── */
const strength = pwd => {
  if (!pwd) return 0;
  let s = 0;
  if (pwd.length >= 8)             s++;
  if (/[A-Z]/.test(pwd))           s++;
  if (/[0-9]/.test(pwd))           s++;
  if (/[^A-Za-z0-9]/.test(pwd))    s++;
  return s;
};
const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'];
const strengthColor = ['', '#ef4444', '#f59e0b', '#3b82f6', '#10b981'];

const PasswordMeter = ({ value }) => {
  const s = strength(value);
  return value ? (
    <div className="flex items-center gap-2 mt-1">
      <div className="flex gap-1 flex-1">
        {[1,2,3,4].map(i => (
          <div key={i} className="h-1 flex-1 rounded-full transition-all duration-300"
            style={{ background: i <= s ? strengthColor[s] : 'rgba(255,255,255,0.08)' }} />
        ))}
      </div>
      <span className="text-[10px] font-semibold" style={{ color: strengthColor[s] }}>
        {strengthLabel[s]}
      </span>
    </div>
  ) : null;
};

/* ─────────────────────────────────────────────
   Main component
───────────────────────────────────────────── */
const RegisterPage = () => {
  const [step, setStep]               = useState(1);
  const [plans, setPlans]             = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isLoading, setIsLoading]     = useState(false);
  const [globalError, setGlobalError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [showPwd, setShowPwd]         = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');

  const [account, setAccount] = useState({
    first_name: '', last_name: '', username: '', email: '', password: '', confirm_password: ''
  });
  const [school, setSchool] = useState({
    name: '', address: '', email: '', phone_number: ''
  });

  useEffect(() => {
    axios.get(`${API}/subscriptionplan/`)
      .then(res => setPlans(res.data.results || res.data))
      .catch(() => setGlobalError('Could not load subscription plans.'));
  }, []);

  const setAcc = key => e => {
    setAccount(p => ({ ...p, [key]: e.target.value }));
    setFieldErrors(p => ({ ...p, [key]: '' }));
    setGlobalError('');
  };
  const setSch = key => e => {
    setSchool(p => ({ ...p, [key]: e.target.value }));
    setFieldErrors(p => ({ ...p, [key]: '' }));
    setGlobalError('');
  };

  /* ── Step 1 validation ── */
  const validateAccount = () => {
    const errs = {};
    if (!account.first_name.trim()) errs.first_name = 'Required';
    if (!account.last_name.trim())  errs.last_name  = 'Required';
    if (!account.username.trim())   errs.username   = 'Required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(account.email)) errs.email = 'Enter a valid email';
    if (account.password.length < 8) errs.password = 'At least 8 characters';
    if (!account.confirm_password)  errs.confirm_password = 'Required';
    else if (account.password !== account.confirm_password) errs.confirm_password = "Passwords don't match";
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  /* ── Step 2 validation ── */
  const validateSchool = () => {
    const errs = {};
    if (!school.name.trim())    errs.name    = 'Required';
    if (!school.address.trim()) errs.address = 'Required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(school.email)) errs.email = 'Enter a valid email';
    if (!school.phone_number.trim()) errs.phone_number = 'Required';
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  /* ── Submit: single call — backend creates user + school + subscription ── */
  const handleSubmit = async () => {
    if (!selectedPlan) return;
    setIsLoading(true);
    setGlobalError('');
    try {
      const res = await axios.post(`${API}/auth/register/`, {
        // Account
        first_name:       account.first_name,
        last_name:        account.last_name,
        username:         account.username,
        email:            account.email,
        password:         account.password,
        confirm_password: account.confirm_password,
        // School
        school_name:    school.name,
        school_address: school.address,
        school_email:   school.email,
        school_phone:   school.phone_number,
        // Plan
        plan_id: selectedPlan,
      });

      setSubmittedEmail(res.data.email || account.email);
      setStep(4);
    } catch (err) {
      const data = err.response?.data;
      if (data && typeof data === 'object') {
        const mapped = {};
        Object.entries(data).forEach(([k, v]) => {
          mapped[k] = Array.isArray(v) ? v[0] : v;
        });
        setFieldErrors(mapped);
        setGlobalError('Please fix the errors below.');
        // Navigate back to the step that has the error
        const accountFields = ['first_name', 'last_name', 'username', 'email', 'password', 'confirm_password'];
        const schoolFields  = ['school_name', 'school_address', 'school_email', 'school_phone'];
        if (Object.keys(mapped).some(k => accountFields.includes(k))) setStep(1);
        else if (Object.keys(mapped).some(k => schoolFields.includes(k))) setStep(2);
      } else {
        setGlobalError(data?.error || data?.detail || 'Something went wrong. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const goNext = () => {
    setGlobalError('');
    if (step === 1 && !validateAccount()) return;
    if (step === 2 && !validateSchool())  return;
    setStep(s => s + 1);
  };

  /* ─────────────────────────────────────────────
     Render
  ───────────────────────────────────────────── */
  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12 relative"
      style={{ background: '#080E1A' }}
    >
      {/* Background glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 60% 50% at 50% -10%, rgba(59,130,246,0.08) 0%, transparent 70%)',
        }}
      />

      {/* Card */}
      <div
        className="relative w-full max-w-[480px] rounded-3xl p-8"
        style={{
          background: 'rgba(255,255,255,0.025)',
          border: '1px solid rgba(255,255,255,0.07)',
          backdropFilter: 'blur(24px)',
        }}
      >
        {/* Logo / Brand */}
        <div className="flex items-center gap-2.5 mb-8">
          <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center flex-shrink-0">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <rect x="2" y="10" width="12" height="4" rx="2" fill="white"/>
              <circle cx="5" cy="10" r="2" fill="#3b82f6"/>
              <circle cx="11" cy="10" r="2" fill="#3b82f6"/>
              <path d="M2 10V7a2 2 0 012-2h4l3 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="text-[13px] font-black tracking-tight text-white/80">DriveSchool</span>
        </div>

        {step < 4 && <StepBar current={step} />}

        {/* Global error */}
        {globalError && (
          <div className="mb-5 flex items-start gap-3 bg-red-500/[0.08] border border-red-500/20 rounded-xl px-4 py-3">
            <svg className="flex-shrink-0 mt-0.5" width="14" height="14" viewBox="0 0 14 14" fill="none">
              <circle cx="7" cy="7" r="6" stroke="#f87171" strokeWidth="1.5"/>
              <path d="M7 4v3.5" stroke="#f87171" strokeWidth="1.5" strokeLinecap="round"/>
              <circle cx="7" cy="10" r="0.75" fill="#f87171"/>
            </svg>
            <p className="text-[12px] text-red-400">{globalError}</p>
          </div>
        )}

        {/* ══ Step 1: Account ══ */}
        {step === 1 && (
          <div className="flex flex-col gap-4">
            <div className="mb-1">
              <h2 className="text-[22px] font-extrabold text-white tracking-tight">Create your account</h2>
              <p className="text-[12px] text-white/35 mt-1">You'll be the owner and admin of your school.</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="First name" error={fieldErrors.first_name}>
                <Input
                  type="text"
                  placeholder="Jane"
                  value={account.first_name}
                  onChange={setAcc('first_name')}
                  style={fieldErrors.first_name ? { borderColor: '#f87171' } : {}}
                />
              </Field>
              <Field label="Last name" error={fieldErrors.last_name}>
                <Input
                  type="text"
                  placeholder="Doe"
                  value={account.last_name}
                  onChange={setAcc('last_name')}
                  style={fieldErrors.last_name ? { borderColor: '#f87171' } : {}}
                />
              </Field>
            </div>

            <Field label="Username" error={fieldErrors.username}>
              <Input
                type="text"
                placeholder="janedoe"
                value={account.username}
                onChange={setAcc('username')}
                style={fieldErrors.username ? { borderColor: '#f87171' } : {}}
              />
            </Field>

            <Field label="Email address" error={fieldErrors.email}>
              <Input
                type="email"
                placeholder="jane@example.com"
                value={account.email}
                onChange={setAcc('email')}
                style={fieldErrors.email ? { borderColor: '#f87171' } : {}}
              />
            </Field>

            <Field label="Password" error={fieldErrors.password}>
              <div className="relative">
                <Input
                  type={showPwd ? 'text' : 'password'}
                  placeholder="Min. 8 characters"
                  value={account.password}
                  onChange={setAcc('password')}
                  className="pr-11"
                  style={fieldErrors.password ? { borderColor: '#f87171' } : {}}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(p => !p)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                >
                  {showPwd ? (
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M2 8s2.5-4 6-4 6 4 6 4-2.5 4-6 4-6-4-6-4z" stroke="currentColor" strokeWidth="1.5"/>
                      <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.5"/>
                      <path d="M2 2l12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M2 8s2.5-4 6-4 6 4 6 4-2.5 4-6 4-6-4-6-4z" stroke="currentColor" strokeWidth="1.5"/>
                      <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.5"/>
                    </svg>
                  )}
                </button>
              </div>
              <PasswordMeter value={account.password} />
            </Field>

            <Field label="Confirm password" error={fieldErrors.confirm_password}>
              <Input
                type="password"
                placeholder="Repeat your password"
                value={account.confirm_password}
                onChange={setAcc('confirm_password')}
                style={fieldErrors.confirm_password ? { borderColor: '#f87171' } : {}}
              />
            </Field>

            <Btn onClick={goNext} className="mt-1">
              Continue
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M3 7h8M8 4l3 3-3 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Btn>

            <p className="text-center text-[12px] text-white/25">
              Already have an account?{' '}
              <a href="/login" className="text-blue-400 hover:text-blue-300 transition-colors font-semibold">
                Sign in
              </a>
            </p>
          </div>
        )}

        {/* ══ Step 2: School ══ */}
        {step === 2 && (
          <div className="flex flex-col gap-4">
            <div className="mb-1">
              <h2 className="text-[22px] font-extrabold text-white tracking-tight">Your driving school</h2>
              <p className="text-[12px] text-white/35 mt-1">Tell us about your school. This will be reviewed by our team.</p>
            </div>

            <Field label="School name" error={fieldErrors.name}>
              <Input
                type="text"
                placeholder="City Drive Academy"
                value={school.name}
                onChange={setSch('name')}
                style={fieldErrors.name ? { borderColor: '#f87171' } : {}}
              />
            </Field>

            <Field label="Address" error={fieldErrors.address}>
              <Input
                type="text"
                placeholder="123 Main St, Casablanca"
                value={school.address}
                onChange={setSch('address')}
                style={fieldErrors.address ? { borderColor: '#f87171' } : {}}
              />
            </Field>

            <Field label="School email" error={fieldErrors.email}>
              <Input
                type="email"
                placeholder="contact@myschool.com"
                value={school.email}
                onChange={setSch('email')}
                style={fieldErrors.email ? { borderColor: '#f87171' } : {}}
              />
            </Field>

            <Field label="Phone number" error={fieldErrors.phone_number}>
              <Input
                type="tel"
                placeholder="+212 600 000 000"
                value={school.phone_number}
                onChange={setSch('phone_number')}
                style={fieldErrors.phone_number ? { borderColor: '#f87171' } : {}}
              />
            </Field>

            <div className="flex gap-3 mt-1">
              <Btn variant="ghost" onClick={() => setStep(1)} className="flex-none w-[80px]">
                ← Back
              </Btn>
              <Btn onClick={goNext} className="flex-1">
                Continue
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M3 7h8M8 4l3 3-3 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Btn>
            </div>
          </div>
        )}

        {/* ══ Step 3: Plan ══ */}
        {step === 3 && (
          <div className="flex flex-col gap-4">
            <div className="mb-1">
              <h2 className="text-[22px] font-extrabold text-white tracking-tight">Choose your plan</h2>
              <p className="text-[12px] text-white/35 mt-1">
                Select the plan that fits your school. No payment needed now — our team will reach out after approval.
              </p>
            </div>

            {plans.length === 0 ? (
              <div className="flex flex-col gap-3">
                {[1,2,3].map(i => (
                  <div key={i} className="h-24 rounded-2xl bg-white/[0.03] animate-pulse border border-white/[0.05]" />
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-3 max-h-[360px] overflow-y-auto pr-1 -mr-1"
                style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.1) transparent' }}>
                {plans.map(plan => (
                  <PlanCard
                    key={plan.id}
                    plan={plan}
                    selected={selectedPlan === plan.id}
                    onSelect={setSelectedPlan}
                  />
                ))}
              </div>
            )}

            {/* Info badge */}
            <div className="flex items-start gap-2.5 bg-blue-600/[0.07] border border-blue-500/20 rounded-xl px-4 py-3">
              <svg className="flex-shrink-0 mt-0.5" width="14" height="14" viewBox="0 0 14 14" fill="none">
                <circle cx="7" cy="7" r="6" stroke="#60a5fa" strokeWidth="1.5"/>
                <path d="M7 6v4" stroke="#60a5fa" strokeWidth="1.5" strokeLinecap="round"/>
                <circle cx="7" cy="4" r="0.75" fill="#60a5fa"/>
              </svg>
              <p className="text-[11px] text-blue-300/70 leading-relaxed">
                Your account will be reviewed before activation. We'll email you once approved. This is <strong className="text-blue-300">free</strong> during the trial period.
              </p>
            </div>

            <div className="flex gap-3">
              <Btn variant="ghost" onClick={() => setStep(2)} className="flex-none w-[80px]">
                ← Back
              </Btn>
              <Btn
                onClick={handleSubmit}
                disabled={!selectedPlan || isLoading}
                className="flex-1"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin" width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <circle cx="7" cy="7" r="5.5" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5"/>
                      <path d="M7 1.5A5.5 5.5 0 0112.5 7" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                    Submitting…
                  </>
                ) : (
                  <>
                    Submit for review
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M3 7h8M8 4l3 3-3 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </>
                )}
              </Btn>
            </div>
          </div>
        )}

        {/* ══ Step 4: Pending review ══ */}
        {step === 4 && (
          <div className="flex flex-col items-center text-center py-4 gap-6">
            {/* Animated checkmark */}
            <div className="relative">
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center"
                style={{
                  background: 'radial-gradient(circle, rgba(16,185,129,0.15) 0%, transparent 70%)',
                  border: '1px solid rgba(16,185,129,0.2)',
                }}
              >
                <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                  <circle cx="18" cy="18" r="17" stroke="rgba(16,185,129,0.4)" strokeWidth="1.5" strokeDasharray="4 3"/>
                  <path d="M10 18l6 6 10-10" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>

            <div>
              <h2 className="text-[24px] font-extrabold text-white tracking-tight">You're on the list!</h2>
              <p className="text-[13px] text-white/40 mt-2 leading-relaxed max-w-[320px]">
                Your school has been submitted for review. We'll send a confirmation to{' '}
                <span className="text-white/70 font-semibold">{submittedEmail || account.email}</span>{' '}
                within <strong className="text-white/60">24–48 hours</strong>.
              </p>
            </div>

            {/* What happens next */}
            <div className="w-full bg-white/[0.025] border border-white/[0.07] rounded-2xl p-5 text-left">
              <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-white/30 mb-4">What happens next</p>
              <div className="flex flex-col gap-4">
                {[
                  { icon: '📋', title: 'We review your application', desc: 'Our team checks your school details within 1–2 business days.' },
                  { icon: '📧', title: 'You get an email', desc: 'We will email you with login credentials once approved.' },
                  { icon: '🚀', title: 'You are live', desc: 'Log in and start adding instructors and students right away.' },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-white/[0.05] flex items-center justify-center text-[14px] flex-shrink-0">
                      {item.icon}
                    </div>
                    <div>
                      <p className="text-[12px] font-semibold text-white/80">{item.title}</p>
                      <p className="text-[11px] text-white/35 mt-0.5 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <a
              href="/login"
              className="text-[12px] text-blue-400 hover:text-blue-300 transition-colors font-semibold"
            >
              Return to login →
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default RegisterPage;