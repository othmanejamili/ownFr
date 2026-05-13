// src/components/members/AddMemberModal.jsx
//
// Modal form that adds a student OR instructor in two steps:
//   Step 1 → POST /api/users/register_student/  (creates the User)
//   Step 2 → POST /api/studentprofile/           (links to school)
//
// Props:
//   open        boolean
//   onClose     () => void
//   onSuccess   (newProfile) => void
//   schoolId    number   — the school to enroll into
//   mode        'student' | 'instructor'

import { useState, useEffect } from 'react';
import { membersApi } from '../AddMembres/Membersapi';

/* ── tiny helpers ──────────────────────────────────────────── */
const cls = (...a) => a.filter(Boolean).join(' ');

const Field = ({ label, error, hint, children }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/35">
      {label}
    </label>
    {children}
    {hint  && !error && <p className="text-[10px] text-white/25">{hint}</p>}
    {error && <p className="text-[10px] text-red-400">{error}</p>}
  </div>
);

const Input = ({ error, className = '', ...props }) => (
  <input
    {...props}
    className={cls(
      'w-full bg-white/[0.04] border rounded-xl px-4 py-2.5 text-[13px] text-white',
      'placeholder:text-white/15 outline-none transition-all duration-150',
      'focus:bg-white/[0.07]',
      error ? 'border-red-500/50' : 'border-white/[0.08]',
      props.disabled ? 'opacity-40 cursor-not-allowed' : '',
      className,
    )}
    onFocus={e => {
      if (!error) {
        e.target.style.borderColor = '#3b82f6';
        e.target.style.boxShadow   = '0 0 0 3px rgba(59,130,246,0.10)';
      }
    }}
    onBlur={e => {
      e.target.style.borderColor = error ? '' : 'rgba(255,255,255,0.08)';
      e.target.style.boxShadow   = 'none';
    }}
  />
);

const Select = ({ error, children, className = '', ...props }) => (
  <select
    {...props}
    className={cls(
      'w-full bg-[#0F1A2E] border rounded-xl px-4 py-2.5 text-[13px] text-white',
      'outline-none transition-all duration-150 cursor-pointer',
      error ? 'border-red-500/50' : 'border-white/[0.08]',
      props.disabled ? 'opacity-40 cursor-not-allowed' : '',
      className,
    )}
  >
    {children}
  </select>
);

/* ── steps config ──────────────────────────────────────────── */
const STEPS = ['Account', 'Profile', 'Done'];

const StepDots = ({ current }) => (
  <div className="flex items-center gap-2 mb-6">
    {STEPS.map((label, i) => {
      const done   = current > i + 1;
      const active = current === i + 1;
      return (
        <div key={i} className="flex items-center gap-2 flex-1 last:flex-none">
          <div className="flex flex-col items-center gap-1">
            <div className={cls(
              'w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all',
              done   ? 'bg-emerald-500 text-white'           : '',
              active ? 'bg-blue-600 text-white ring-4 ring-blue-600/15' : '',
              !done && !active ? 'bg-white/[0.07] text-white/25' : '',
            )}>
              {done ? '✓' : i + 1}
            </div>
            <span className={cls(
              'text-[9px] font-semibold tracking-wider uppercase',
              active ? 'text-white'        : '',
              done   ? 'text-emerald-400'  : '',
              !done && !active ? 'text-white/20' : '',
            )}>
              {label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div className={cls(
              'flex-1 h-px mb-4 transition-all',
              done ? 'bg-emerald-500/40' : 'bg-white/[0.06]',
            )} />
          )}
        </div>
      );
    })}
  </div>
);

/* ── main modal ────────────────────────────────────────────── */
const AddMemberModal = ({ open, onClose, onSuccess, schoolId, mode = 'student' }) => {
  const isInstructor = mode === 'instructor';
  const role         = isInstructor ? 'I' : 'S';
  const modeLabel    = isInstructor ? 'Instructor' : 'Student';

  const [step,        setStep]        = useState(1);
  const [isLoading,   setIsLoading]   = useState(false);
  const [globalError, setGlobalError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [createdUser, setCreatedUser] = useState(null); // user from step 1

  // Step 1 — account
  const [account, setAccount] = useState({
    first_name: '', last_name: '', username: '', email: '',
    password: '', phone_number: '',
  });

  // Step 2 — profile
  const [profile, setProfile] = useState({
    license_type: 'C',
    theory_start_date: '',
    driving_start_date: '',
    picture_profile: null,  
  });

  // preview state
  const [picturePreview, setPicturePreview] = useState(null);

  // Handle file change
  const handlePictureChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setProfile(p => ({ ...p, picture_profile: file }));
    setPicturePreview(URL.createObjectURL(file));
  };

  // reset on open
  useEffect(() => {
    if (open) {
      setStep(1);
      setGlobalError('');
      setFieldErrors({});
      setCreatedUser(null);
      setPicturePreview(null);
      setAccount({ first_name: '', last_name: '', username: '', email: '', password: '', phone_number: '' });
      setProfile({ license_type: 'C', theory_start_date: '', driving_start_date: '',picture_profile: null  });
    }
  }, [open]);

  const setAcc = k => e => {
    setAccount(p => ({ ...p, [k]: e.target.value }));
    setFieldErrors(p => ({ ...p, [k]: '' }));
    setGlobalError('');
  };
  const setPro = k => e => {
    setProfile(p => ({ ...p, [k]: e.target.value }));
    setFieldErrors(p => ({ ...p, [k]: '' }));
  };

  /* ── Step 1 client validation ── */
  const validateAccount = () => {
    const errs = {};
    if (!account.first_name.trim()) errs.first_name = 'Required';
    if (!account.last_name.trim())  errs.last_name  = 'Required';
    if (!account.username.trim())   errs.username   = 'Required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(account.email)) errs.email = 'Valid email required';
    if (account.password.length < 8) errs.password = 'Min 8 characters';
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  /* ── Step 1 submit — create User ── */
  const handleCreateAccount = async () => {
    if (!validateAccount()) return;
    setIsLoading(true);
    setGlobalError('');
    try {
      const data = await membersApi.registerMember({
        ...account,
        role,
        confirm_password: account.password,
        driving_school_id: schoolId,
      });
      setCreatedUser(data);
      setStep(2);
    } catch (err) {
      const errData = err.response?.data;
      if (errData && typeof errData === 'object' && !errData.error) {
        const mapped = {};
        Object.entries(errData).forEach(([k, v]) => { mapped[k] = Array.isArray(v) ? v[0] : v; });
        setFieldErrors(mapped);
        setGlobalError('Please fix the errors below.');
      } else {
        setGlobalError(errData?.error || errData?.detail || 'Failed to create account.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  /* ── Step 2 submit — create StudentProfile ── */
  const handleCreateProfile = async () => {
    if (!createdUser) return;
    setIsLoading(true);
    setGlobalError('');
    try {
      const profiles = await membersApi.getStudentProfiles();
      const existing = profiles.find(p => p.user === createdUser.id);
  
      if (existing) {
        // Build FormData instead of plain object (required for file upload)
        const formData = new FormData();
        if (profile.license_type)       formData.append('license_type',       profile.license_type);
        if (profile.theory_start_date)  formData.append('theory_start_date',  profile.theory_start_date);
        if (profile.driving_start_date) formData.append('driving_start_date', profile.driving_start_date);
        if (profile.picture_profile)    formData.append('picture_profile',    profile.picture_profile);
  
        const updated = await membersApi.updateProfileForm(existing.id, formData); // ← new method
        setStep(3);
        onSuccess?.(updated);
      }
    } catch (err) {
      const errData = err.response?.data;
      if (errData && typeof errData === 'object' && !errData.error) {
        const mapped = {};
        Object.entries(errData).forEach(([k, v]) => {
          mapped[k] = Array.isArray(v) ? v[0] : v;
        });
        setFieldErrors(mapped);
        setGlobalError('Please fix the errors below.');
      } else {
        setGlobalError(errData?.error || errData?.detail || 'Failed to save profile.');
      }
    } finally {
      setIsLoading(false);
    }
  };
  if (!open) return null;

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(6,11,24,0.85)', backdropFilter: 'blur(8px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Panel */}
      <div
        className="relative w-full max-w-[460px] rounded-2xl p-6"
        style={{
          background: 'rgba(15,26,46,0.98)',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 32px 80px rgba(0,0,0,0.6)',
        }}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-7 h-7 rounded-lg bg-white/[0.05]
            hover:bg-white/[0.1] text-white/40 hover:text-white
            flex items-center justify-center transition-all text-[16px]"
        >
          ×
        </button>

        {/* Header */}
        <div className="mb-5">
          <div className="flex items-center gap-2.5 mb-1">
            <div className={cls(
              'w-7 h-7 rounded-lg flex items-center justify-center',
              isInstructor ? 'bg-violet-600/20' : 'bg-blue-600/20',
            )}>
              {isInstructor ? (
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <circle cx="7" cy="4" r="2.5" stroke={isInstructor ? '#a78bfa' : '#60a5fa'} strokeWidth="1.3"/>
                  <path d="M1.5 13c0-2.5 2.5-4 5.5-4s5.5 1.5 5.5 4" stroke={isInstructor ? '#a78bfa' : '#60a5fa'} strokeWidth="1.3" strokeLinecap="round"/>
                  <path d="M9.5 2.5l1 1 2-2" stroke={isInstructor ? '#a78bfa' : '#60a5fa'} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <circle cx="7" cy="4" r="2.5" stroke="#60a5fa" strokeWidth="1.3"/>
                  <path d="M1.5 13c0-2.5 2.5-4 5.5-4s5.5 1.5 5.5 4" stroke="#60a5fa" strokeWidth="1.3" strokeLinecap="round"/>
                </svg>
              )}
            </div>
            <h2 className="font-sora text-[16px] font-bold text-white">
              Add {modeLabel}
            </h2>
          </div>
          <p className="text-[11px] text-white/30">
            {step === 1
              ? `Create an account for the new ${modeLabel.toLowerCase()}.`
              : step === 2
              ? 'Set up their school profile and preferences.'
              : `${modeLabel} added successfully!`}
          </p>
        </div>

        <StepDots current={step} />

        {/* Global error */}
        {globalError && (
          <div className="mb-4 flex items-start gap-2.5 bg-red-500/[0.07]
            border border-red-500/20 rounded-xl px-3.5 py-3">
            <svg className="flex-shrink-0 mt-px" width="13" height="13" viewBox="0 0 13 13" fill="none">
              <circle cx="6.5" cy="6.5" r="5.5" stroke="#f87171" strokeWidth="1.3"/>
              <path d="M6.5 4v3" stroke="#f87171" strokeWidth="1.3" strokeLinecap="round"/>
              <circle cx="6.5" cy="9" r="0.7" fill="#f87171"/>
            </svg>
            <p className="text-[11px] text-red-400">{globalError}</p>
          </div>
        )}

        {/* ══ Step 1: Account ══ */}
        {step === 1 && (
          <div className="flex flex-col gap-3.5">
            <div className="grid grid-cols-2 gap-3">
              <Field label="First name" error={fieldErrors.first_name}>
                <Input placeholder="Jane" value={account.first_name}
                  onChange={setAcc('first_name')} error={fieldErrors.first_name} />
              </Field>
              <Field label="Last name" error={fieldErrors.last_name}>
                <Input placeholder="Doe" value={account.last_name}
                  onChange={setAcc('last_name')} error={fieldErrors.last_name} />
              </Field>
            </div>

            <Field label="Username" error={fieldErrors.username}>
              <Input placeholder="janedoe" value={account.username}
                onChange={setAcc('username')} error={fieldErrors.username} />
            </Field>

            <Field label="Email" error={fieldErrors.email}>
              <Input type="email" placeholder="jane@example.com" value={account.email}
                onChange={setAcc('email')} error={fieldErrors.email} />
            </Field>

            <Field label="Phone number (optional)" error={fieldErrors.phone_number}
              hint="Format: +212600000000">
              <Input type="tel" placeholder="+212 600 000 000" value={account.phone_number}
                onChange={setAcc('phone_number')} error={fieldErrors.phone_number} />
            </Field>

            <Field label="Temporary password" error={fieldErrors.password}
              hint="They can change it after first login.">
              <Input type="password" placeholder="Min. 8 characters" value={account.password}
                onChange={setAcc('password')} error={fieldErrors.password} />
            </Field>

            <div className="flex gap-2.5 mt-1">
              <button onClick={onClose}
                className="flex-none px-4 py-2.5 rounded-xl border border-white/[0.08]
                  text-[12px] text-white/40 hover:text-white hover:border-white/20
                  transition-all font-dm">
                Cancel
              </button>
              <button onClick={handleCreateAccount} disabled={isLoading}
                className={cls(
                  'flex-1 py-2.5 rounded-xl text-[13px] font-bold text-white transition-all font-dm',
                  isInstructor
                    ? 'bg-violet-600 hover:bg-violet-500 disabled:bg-violet-600/40'
                    : 'bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/40',
                  'disabled:cursor-not-allowed flex items-center justify-center gap-2',
                )}>
                {isLoading ? (
                  <>
                    <svg className="animate-spin" width="13" height="13" viewBox="0 0 13 13" fill="none">
                      <circle cx="6.5" cy="6.5" r="5" stroke="rgba(255,255,255,0.25)" strokeWidth="1.4"/>
                      <path d="M6.5 1.5A5 5 0 0111.5 6.5" stroke="white" strokeWidth="1.4" strokeLinecap="round"/>
                    </svg>
                    Creating…
                  </>
                ) : 'Create account →'}
              </button>
            </div>
          </div>
        )}

        {/* ══ Step 2: Profile ══ */}
        {step === 2 && (
          <div className="flex flex-col gap-3.5">

            {/* Confirmation chip */}
            <div className="flex items-center gap-2.5 p-3 bg-emerald-500/[0.06]
              border border-emerald-500/20 rounded-xl mb-1">
              <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path d="M2 5l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div>
                <p className="text-[11px] font-semibold text-emerald-400">Account created</p>
                <p className="text-[10px] text-white/35">{createdUser?.email}</p>
              </div>
            </div>

            {/* License type — only for students */}
            {!isInstructor && (
              <Field label="License type" error={fieldErrors.license_type}>
                <Select value={profile.license_type} onChange={setPro('license_type')}
                  error={fieldErrors.license_type}>
                  <option value="C">🚗 Car (Permis B)</option>
                  <option value="M">🏍 Moto (Permis A)</option>
                </Select>
              </Field>
            )}

            <Field label="Theory start date (optional)" error={fieldErrors.theory_start_date}>
              <Input type="date" value={profile.theory_start_date}
                onChange={setPro('theory_start_date')} error={fieldErrors.theory_start_date}
                className="text-white/60"
              />
            </Field>

            <Field label="Driving start date (optional)" error={fieldErrors.driving_start_date}>
              <Input type="date" value={profile.driving_start_date}
                onChange={setPro('driving_start_date')} error={fieldErrors.driving_start_date}
                className="text-white/60"
              />
            </Field>
            {/* Picture upload — add this above the license_type field */}
            <Field label="Profile picture (optional)">
              <div className="flex items-center gap-3">
                
                {/* Preview circle */}
                <div className="w-12 h-12 rounded-full flex-shrink-0 overflow-hidden
                  bg-white/[0.05] border border-white/[0.08] flex items-center justify-center">
                  {picturePreview ? (
                    <img src={picturePreview} alt="preview"
                      className="w-full h-full object-cover" />
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                      <circle cx="9" cy="7" r="3" stroke="rgba(255,255,255,0.2)" strokeWidth="1.3"/>
                      <path d="M3 16c0-3 2.7-5 6-5s6 2 6 5"
                        stroke="rgba(255,255,255,0.2)" strokeWidth="1.3" strokeLinecap="round"/>
                    </svg>
                  )}
                </div>

                {/* Upload button */}
                <label className="flex-1 flex items-center justify-center gap-2
                  bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.08]
                  border-dashed rounded-xl px-4 py-2.5 cursor-pointer transition-all group">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M6 1v7M3 4l3-3 3 3" stroke="rgba(255,255,255,0.4)"
                      strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M1 10h10" stroke="rgba(255,255,255,0.2)"
                      strokeWidth="1.3" strokeLinecap="round"/>
                  </svg>
                  <span className="text-[11px] text-white/30 group-hover:text-white/50 transition-colors">
                    {profile.picture_profile ? profile.picture_profile.name : 'Choose photo'}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePictureChange}
                  />
                </label>

                {/* Clear button */}
                {picturePreview && (
                  <button
                    onClick={() => {
                      setProfile(p => ({ ...p, picture_profile: null }));
                      setPicturePreview(null);
                    }}
                    className="w-7 h-7 rounded-lg bg-red-500/10 hover:bg-red-500/20
                      text-red-400 flex items-center justify-center transition-colors text-[13px]"
                  >×</button>
                )}
              </div>
            </Field>
            <div className="flex gap-2.5 mt-1">
              <button onClick={() => setStep(1)}
                className="flex-none px-4 py-2.5 rounded-xl border border-white/[0.08]
                  text-[12px] text-white/40 hover:text-white hover:border-white/20
                  transition-all font-dm">
                ← Back
              </button>
              <button onClick={handleCreateProfile} disabled={isLoading}
                className={cls(
                  'flex-1 py-2.5 rounded-xl text-[13px] font-bold text-white transition-all font-dm',
                  isInstructor
                    ? 'bg-violet-600 hover:bg-violet-500 disabled:bg-violet-600/40'
                    : 'bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/40',
                  'disabled:cursor-not-allowed flex items-center justify-center gap-2',
                )}>
                {isLoading ? (
                  <>
                    <svg className="animate-spin" width="13" height="13" viewBox="0 0 13 13" fill="none">
                      <circle cx="6.5" cy="6.5" r="5" stroke="rgba(255,255,255,0.25)" strokeWidth="1.4"/>
                      <path d="M6.5 1.5A5 5 0 0111.5 6.5" stroke="white" strokeWidth="1.4" strokeLinecap="round"/>
                    </svg>
                    Saving…
                  </>
                ) : `Add to school →`}
              </button>
            </div>
          </div>
        )}

        {/* ══ Step 3: Done ══ */}
        {step === 3 && (
          <div className="flex flex-col items-center text-center gap-5 py-4">
            <div className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.2)' }}>
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <path d="M7 14l5 5 10-10" stroke="#10b981" strokeWidth="2.5"
                  strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <h3 className="font-sora text-[18px] font-bold text-white">
                {modeLabel} added!
              </h3>
              <p className="text-[12px] text-white/40 mt-1">
                {createdUser?.first_name} {createdUser?.last_name} is now enrolled in your school.
              </p>
            </div>
            <div className="flex gap-2.5 w-full">
              <button
                onClick={() => {
                  setStep(1);
                  setCreatedUser(null);
                  setAccount({ first_name:'',last_name:'',username:'',email:'',password:'',phone_number:'' });
                  setProfile({ license_type:'C', theory_start_date:'', driving_start_date:'' });
                  setGlobalError('');
                  setFieldErrors({});
                }}
                className="flex-1 py-2.5 rounded-xl border border-white/[0.08]
                  text-[12px] text-white/50 hover:text-white hover:border-white/20
                  transition-all font-dm"
              >
                Add another
              </button>
              <button onClick={onClose}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500
                  text-[13px] font-bold text-white transition-all font-dm">
                Done ✓
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddMemberModal;