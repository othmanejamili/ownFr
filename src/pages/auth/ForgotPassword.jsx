// ForgotPassword.jsx — Tailwind restyled, all core logic preserved
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [step, setStep] = useState('request'); // 'request', 'verify', 'resetPassword'
  const [verificationCode, setVerificationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const { loading, resetPassword, verifyResetCode, requestPasswordReset } = useAuth();
  const navigate = useNavigate();

  // ── all handlers untouched ──────────────────────────────────────────────
  const handleRequestReset = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    if (!email) { setError('Email is required'); return; }
    const result = await requestPasswordReset(email);
    if (result.success) {
      setMessage('A verification code has been sent to your email');
      setStep('verify');
    } else {
      setError(result.message || 'Failed to send reset email');
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    if (!verificationCode) { setError('Verification code is required'); return; }
    const result = await verifyResetCode(email, verificationCode);
    if (result.success) {
      setMessage('Code verified. Please set your new password');
      setStep('resetPassword');
    } else {
      setError(result.message || 'Invalid verification code');
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    if (!newPassword) { setError('New password is required'); return; }
    if (newPassword !== confirmPassword) { setError('Passwords do not match'); return; }
    if (newPassword.length < 8) { setError('Password must be at least 8 characters long'); return; }
    const result = await resetPassword(email, verificationCode, newPassword);
    if (result.success) {
      setMessage('Your password has been reset successfully');
      setTimeout(() => navigate('/login'), 3000);
    } else {
      setError(result.message || 'Failed to reset password');
    }
  };
  // ────────────────────────────────────────────────────────────────────────

  // step meta
  const stepMeta = {
    request:       { title: 'Forgot Your Password?',   sub: 'Enter your email to receive a reset code',             badge: 'Step 1 of 3' },
    verify:        { title: 'Verify Your Identity',     sub: 'Enter the verification code sent to your email',       badge: 'Step 2 of 3' },
    resetPassword: { title: 'Create New Password',      sub: 'Create a strong, secure password to protect your account', badge: 'Step 3 of 3' },
  };

  const steps = ['request', 'verify', 'resetPassword'];
  const currentStepIndex = steps.indexOf(step);

  // ── shared input wrapper ─────────────────────────────────────────────────
  const InputField = ({ id, label, type = 'text', placeholder, value, onChange, icon }) => (
    <div className="mb-5">
      <label htmlFor={id} className="block text-sm font-semibold text-slate-700 mb-1.5">
        {label}
      </label>
      <div className="relative">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4">
          {icon}
        </span>
        <input
          type={type}
          id={id}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50
                     text-slate-800 text-sm placeholder-slate-400
                     focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400
                     focus:bg-white transition-all duration-200"
        />
      </div>
    </div>
  );

  // ── icons ────────────────────────────────────────────────────────────────
  const EmailIcon = (
    <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
      <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M22 6L12 13L2 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
  const LockIcon = (
    <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
      <rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M7 11V7C7 5.67 7.53 4.4 8.46 3.46C9.4 2.53 10.67 2 12 2C13.33 2 14.6 2.53 15.54 3.46C16.47 4.4 17 5.67 17 7V11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
  const CodeIcon = (
    <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
      <path d="M7 11V7C7 5.67 7.53 4.4 8.46 3.46C9.4 2.53 10.67 2 12 2C13.33 2 14.6 2.53 15.54 3.46C16.47 4.4 17 5.67 17 7V11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12 15a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" fill="currentColor"/>
      <rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );

  // ── step forms ───────────────────────────────────────────────────────────
  const renderRequestForm = () => (
    <form onSubmit={handleRequestReset}>
      <InputField
        id="email" label="Email Address" type="email"
        placeholder="Enter your email address"
        value={email} onChange={(e) => setEmail(e.target.value)}
        icon={EmailIcon}
      />
      <button
        type="submit" disabled={loading}
        className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98]
                   text-white font-semibold text-sm tracking-wide transition-all duration-200
                   disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
      >
        {loading ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Sending...</> : 'Send Reset Code'}
      </button>
      <div className="mt-5 text-center">
        <a href="/login" className="text-sm text-indigo-600 hover:text-indigo-800 font-medium transition-colors">
          ← Back to Login
        </a>
      </div>
    </form>
  );

  const renderVerifyForm = () => (
    <form onSubmit={handleVerifyCode}>
      <InputField
        id="verificationCode" label="Verification Code" type="text"
        placeholder="Enter the 6-digit code"
        value={verificationCode} onChange={(e) => setVerificationCode(e.target.value)}
        icon={CodeIcon}
      />
      <button
        type="submit" disabled={loading}
        className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98]
                   text-white font-semibold text-sm tracking-wide transition-all duration-200
                   disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
      >
        {loading ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Verifying...</> : 'Verify Code'}
      </button>
      <div className="mt-5 flex items-center justify-between">
        <button type="button" onClick={() => setStep('request')}
          className="text-sm text-slate-500 hover:text-slate-700 font-medium transition-colors">
          ← Back
        </button>
        <button type="button" onClick={handleRequestReset} disabled={loading}
          className="text-sm text-indigo-600 hover:text-indigo-800 font-medium transition-colors disabled:opacity-50">
          Resend Code
        </button>
      </div>
    </form>
  );

  const renderResetPasswordForm = () => (
    <form onSubmit={handlePasswordReset}>
      <InputField
        id="newPassword" label="New Password" type="password"
        placeholder="Enter new password (min. 8 characters)"
        value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
        icon={LockIcon}
      />
      <InputField
        id="confirmPassword" label="Confirm Password" type="password"
        placeholder="Confirm your new password"
        value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
        icon={LockIcon}
      />
      <button
        type="submit" disabled={loading}
        className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98]
                   text-white font-semibold text-sm tracking-wide transition-all duration-200
                   disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
      >
        {loading ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Resetting...</> : 'Reset Password'}
      </button>
      <div className="mt-5 text-center">
        <button type="button" onClick={() => setStep('verify')}
          className="text-sm text-slate-500 hover:text-slate-700 font-medium transition-colors">
          ← Back
        </button>
      </div>
    </form>
  );

  // ── render ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 p-4">
      <div className="w-full max-w-4xl flex rounded-2xl shadow-2xl overflow-hidden min-h-[580px]">

        {/* ── LEFT SIDEBAR ── */}
        <div className="hidden md:flex flex-col justify-between w-2/5 bg-gradient-to-br from-indigo-700 via-indigo-600 to-violet-700 p-10 relative overflow-hidden">
          {/* decorative circles */}
          <div className="absolute -top-16 -left-16 w-64 h-64 rounded-full bg-white/5" />
          <div className="absolute -bottom-20 -right-10 w-72 h-72 rounded-full bg-white/5" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-white/[0.03]" />

          <div className="relative z-10">
            {/* logo */}
            <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center mb-10">
              <span className="text-white font-bold text-lg tracking-tight">DS</span>
            </div>

            <span className="inline-block px-3 py-1 rounded-full bg-white/20 text-white/90 text-xs font-semibold tracking-wide mb-6">
              Password Reset
            </span>

            <h1 className="text-white text-2xl font-bold leading-snug mb-4">
              Recover your account securely
            </h1>
            <p className="text-indigo-200 text-sm leading-relaxed">
              Lost access? No worries. Follow the three simple steps to reset your password and get back on the road.
            </p>
          </div>

          {/* step progress */}
          <div className="relative z-10 space-y-3">
            {[
              { key: 'request',       label: 'Enter email address' },
              { key: 'verify',        label: 'Verify reset code'   },
              { key: 'resetPassword', label: 'Set new password'    },
            ].map(({ key, label }, idx) => {
              const done    = steps.indexOf(key) < currentStepIndex;
              const current = key === step;
              return (
                <div key={key} className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all
                    ${done    ? 'bg-emerald-400 text-white'
                    : current ? 'bg-white text-indigo-700'
                              : 'bg-white/20 text-white/50'}`}>
                    {done ? '✓' : idx + 1}
                  </div>
                  <span className={`text-sm font-medium transition-all
                    ${current ? 'text-white' : done ? 'text-indigo-200' : 'text-white/40'}`}>
                    {label}
                  </span>
                </div>
              );
            })}
          </div>

          <p className="relative z-10 text-indigo-300/60 text-xs">
            © 2025 DriveSchool. All rights reserved.
          </p>
        </div>

        {/* ── RIGHT FORM ── */}
        <div className="flex-1 bg-white flex flex-col justify-center px-8 py-10 md:px-12">

          {/* mobile logo */}
          <div className="md:hidden flex items-center gap-3 mb-8">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">DS</span>
            </div>
            <span className="font-bold text-slate-800 text-lg">DriveSchool</span>
          </div>

          {/* badge */}
          <span className="inline-block mb-3 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-xs font-semibold w-fit">
            {stepMeta[step].badge}
          </span>

          <h2 className="text-2xl font-bold text-slate-800 mb-1">
            {stepMeta[step].title}
          </h2>
          <p className="text-slate-500 text-sm mb-7">
            {stepMeta[step].sub}
          </p>

          {/* alerts */}
          {message && (
            <div className="flex items-start gap-3 p-4 mb-5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm">
              <svg className="w-5 h-5 flex-shrink-0 mt-0.5 text-emerald-500" viewBox="0 0 24 24" fill="none">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M22 4L12 14.01l-3-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {message}
            </div>
          )}

          {error && (
            <div className="flex items-start gap-3 p-4 mb-5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm">
              <svg className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-500" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                <path d="M12 8v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <circle cx="12" cy="16" r="1" fill="currentColor"/>
              </svg>
              {error}
            </div>
          )}

          {/* step forms */}
          {step === 'request'       && renderRequestForm()}
          {step === 'verify'        && renderVerifyForm()}
          {step === 'resetPassword' && renderResetPasswordForm()}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;