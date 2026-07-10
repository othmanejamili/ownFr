// src/pages/owner/SettingsPage.jsx
import { useState, useRef, useCallback } from 'react';
import { useAuth } from '../../../context/AuthContext';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;
const authHeader = () => {
  const t = localStorage.getItem('access') || sessionStorage.getItem('access');
  return t ? { Authorization: `Bearer ${t}` } : {};
};

// ══════════════════════════════════════════════════════════════════
//  SHARED PRIMITIVES
// ══════════════════════════════════════════════════════════════════

const Spinner = ({ sm }) => (
  <div className={`border-2 border-white/20 border-t-blue-400 rounded-full animate-spin ${sm ? 'w-4 h-4' : 'w-6 h-6'}`} />
);

const Toast = ({ toast }) => {
  if (!toast) return null;
  const styles = {
    success: 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400',
    error:   'bg-red-500/10 border-red-500/25 text-red-400',
    info:    'bg-blue-500/10 border-blue-500/25 text-blue-400',
  };
  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3
      border rounded-xl text-sm font-dm shadow-2xl animate-fade-in ${styles[toast.type] ?? styles.info}`}>
      <span>{toast.type === 'success' ? '✓' : toast.type === 'error' ? '✗' : 'ℹ'}</span>
      {toast.message}
    </div>
  );
};

const Field = ({ label, hint, children }) => (
  <div className="space-y-1.5">
    <label className="block text-xs font-semibold text-white/50 font-dm tracking-wide">{label}</label>
    {children}
    {hint && <p className="text-[11px] text-white/20 font-dm">{hint}</p>}
  </div>
);

const Input = ({ className = '', ...props }) => (
  <input
    className={`w-full bg-white/[0.04] border border-white/[0.08] text-white text-sm
      rounded-xl px-4 py-2.5 font-dm placeholder-white/20
      focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.06]
      transition-all duration-200 ${className}`}
    {...props}
  />
);

const Textarea = ({ className = '', ...props }) => (
  <textarea
    rows={3}
    className={`w-full bg-white/[0.04] border border-white/[0.08] text-white text-sm
      rounded-xl px-4 py-2.5 font-dm placeholder-white/20 resize-none
      focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.06]
      transition-all duration-200 ${className}`}
    {...props}
  />
);

const Select = ({ children, className = '', ...props }) => (
  <select
    className={`w-full bg-[#0F1A2E] border border-white/[0.08] text-white/80 text-sm
      rounded-xl px-4 py-2.5 font-dm focus:outline-none focus:border-blue-500/50
      transition-all duration-200 ${className}`}
    {...props}>
    {children}
  </select>
);

const Btn = ({ children, variant = 'primary', loading, className = '', ...props }) => {
  const styles = {
    primary:  'bg-blue-600 hover:bg-blue-500 text-white',
    ghost:    'bg-white/[0.04] hover:bg-white/[0.08] text-white/70 border border-white/[0.08]',
    danger:   'bg-red-600/20 hover:bg-red-600/40 text-red-400 border border-red-500/20',
    success:  'bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-400 border border-emerald-500/20',
  };
  return (
    <button
      className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold
        font-dm transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed
        ${styles[variant]} ${className}`}
      disabled={loading}
      {...props}>
      {loading && <Spinner sm />}
      {children}
    </button>
  );
};

const Toggle = ({ checked, onChange, label, description }) => (
  <div className="flex items-start justify-between gap-4 py-3">
    <div>
      <div className="text-sm font-medium text-white/80 font-dm">{label}</div>
      {description && <div className="text-[11px] text-white/30 font-dm mt-0.5">{description}</div>}
    </div>
    <button
      onClick={() => onChange(!checked)}
      className={`relative w-10 h-5.5 rounded-full flex-shrink-0 transition-all duration-300 mt-0.5
        ${checked ? 'bg-blue-600' : 'bg-white/10'}`}
      style={{ minWidth: 40, height: 22 }}>
      <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all duration-300
        ${checked ? 'left-[22px]' : 'left-0.5'}`} />
    </button>
  </div>
);

const SectionCard = ({ title, description, icon, children, danger }) => (
  <div className={`bg-[#0B1221] border rounded-2xl overflow-hidden
    ${danger ? 'border-red-500/20' : 'border-white/[0.07]'}`}>
    <div className={`px-6 py-4 border-b flex items-center gap-3
      ${danger ? 'border-red-500/10 bg-red-500/[0.03]' : 'border-white/[0.05]'}`}>
      <span className="text-lg">{icon}</span>
      <div>
        <h2 className={`text-sm font-bold font-sora ${danger ? 'text-red-400' : 'text-white'}`}>{title}</h2>
        {description && <p className="text-[11px] text-white/30 font-dm mt-0.5">{description}</p>}
      </div>
    </div>
    <div className="p-6">{children}</div>
  </div>
);

const Divider = () => <div className="border-t border-white/[0.05] my-4" />;

const Badge = ({ children, color = 'blue' }) => {
  const c = {
    blue:   'bg-blue-500/10 text-blue-400 border-blue-500/20',
    green:  'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    amber:  'bg-amber-500/10 text-amber-400 border-amber-500/20',
    violet: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
    red:    'bg-red-500/10 text-red-400 border-red-500/20',
  };
  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border font-dm ${c[color]}`}>
      {children}
    </span>
  );
};

// ══════════════════════════════════════════════════════════════════
//  NAV TABS
// ══════════════════════════════════════════════════════════════════

const TABS = [
  { id: 'profile',       icon: '👤', label: 'Profile' },
  { id: 'school',        icon: '🏫', label: 'School Info' },
  { id: 'security',      icon: '🔒', label: 'Security' },
  { id: 'notifications', icon: '🔔', label: 'Notifications' },
  { id: 'appearance',    icon: '🎨', label: 'Appearance' },
  { id: 'subscription',  icon: '💳', label: 'Subscription' },
  { id: 'integrations',  icon: '🔗', label: 'Integrations' },
  { id: 'danger',        icon: '⚠️', label: 'Danger Zone' },
];

// ══════════════════════════════════════════════════════════════════
//  SECTION: PROFILE
// ══════════════════════════════════════════════════════════════════

const ProfileSection = ({ showToast }) => {
  const { user } = useAuth();
  const [form, setForm] = useState({
    first_name: user?.first_name || '',
    last_name:  user?.last_name  || '',
    username:   user?.username   || '',
    email:      user?.email      || '',
    phone:      '',
    bio:        '',
    language:   'en',
    timezone:   'Africa/Casablanca',
  });
  const [saving, setSaving] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const fileRef = useRef();

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setAvatarPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.patch(`${API_URL}/api/users/${user?.user_id}/`, form, { headers: authHeader() });
      showToast('Profile updated successfully', 'success');
    } catch (e) {
      showToast(e?.response?.data?.error || 'Failed to update profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  const initials = `${form.first_name[0] || ''}${form.last_name[0] || ''}`.toUpperCase() || 'KA';

  return (
    <div className="space-y-5">
      {/* Avatar */}
      <SectionCard title="Profile Photo" icon="🖼" description="Your public profile picture">
        <div className="flex items-center gap-5">
          <div className="relative">
            {avatarPreview ? (
              <img src={avatarPreview} alt="avatar"
                className="w-20 h-20 rounded-2xl object-cover border border-white/10" />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-600 to-violet-700
                flex items-center justify-center text-2xl font-bold text-white font-sora border border-white/10">
                {initials}
              </div>
            )}
            <button onClick={() => fileRef.current?.click()}
              className="absolute -bottom-2 -right-2 w-7 h-7 rounded-lg bg-blue-600
                flex items-center justify-center text-xs shadow-lg hover:bg-blue-500 transition-colors">
              ✏️
            </button>
          </div>
          <div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            <Btn variant="ghost" onClick={() => fileRef.current?.click()}>Upload Photo</Btn>
            <p className="text-[11px] text-white/25 font-dm mt-2">JPG, PNG or WebP · max 2 MB</p>
          </div>
        </div>
      </SectionCard>

      {/* Personal info */}
      <SectionCard title="Personal Information" icon="👤" description="Your name and contact details">
        <div className="grid md:grid-cols-2 gap-4">
          <Field label="First Name">
            <Input value={form.first_name} onChange={set('first_name')} placeholder="Karim" />
          </Field>
          <Field label="Last Name">
            <Input value={form.last_name} onChange={set('last_name')} placeholder="Alaoui" />
          </Field>
          <Field label="Username">
            <Input value={form.username} onChange={set('username')} placeholder="karim.alaoui" />
          </Field>
          <Field label="Phone Number">
            <Input value={form.phone} onChange={set('phone')} placeholder="+212 6XX XXX XXX" type="tel" />
          </Field>
          <Field label="Email Address" hint="Used for login and notifications">
            <Input value={form.email} onChange={set('email')} type="email" placeholder="karim@autoecole.ma" />
          </Field>
          <Field label="Language">
            <Select value={form.language} onChange={set('language')}>
              <option value="en">English</option>
              <option value="fr">Français</option>
              <option value="ar">العربية</option>
            </Select>
          </Field>
          <Field label="Timezone" className="md:col-span-2">
            <Select value={form.timezone} onChange={set('timezone')}>
              <option value="Africa/Casablanca">Africa/Casablanca (GMT+1)</option>
              <option value="Europe/Paris">Europe/Paris (GMT+2)</option>
              <option value="UTC">UTC</option>
            </Select>
          </Field>
          <Field label="Bio" className="md:col-span-2">
            <Textarea value={form.bio} onChange={set('bio')} placeholder="Tell students a bit about yourself…" />
          </Field>
        </div>
        <div className="flex justify-end mt-5">
          <Btn onClick={handleSave} loading={saving}>Save Changes</Btn>
        </div>
      </SectionCard>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════
//  SECTION: SCHOOL INFO
// ══════════════════════════════════════════════════════════════════

const SchoolSection = ({ showToast }) => {
  const [form, setForm] = useState({
    name:         'Auto École Atlas',
    address:      'Rue Ibn Batouta, Casablanca',
    city:         'Casablanca',
    region:       'Casablanca-Settat',
    country:      'Morocco',
    postal_code:  '20000',
    phone_number: '+212 522 000 000',
    email:        'contact@autoecole-atlas.ma',
    website:      'https://autoecole-atlas.ma',
    description:  '',
    license_number: 'AE-2024-0042',
    founded_year: '2018',
    capacity:     '50',
  });
  const [saving, setSaving] = useState(false);
  const [logoPreview, setLogoPreview] = useState(null);
  const logoRef = useRef();

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setLogoPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.patch(`${API_URL}/api/drivingschool/1/`, form, { headers: authHeader() });
      showToast('School information updated', 'success');
    } catch (e) {
      showToast(e?.response?.data?.error || 'Failed to update school info', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Logo */}
      <SectionCard title="School Logo" icon="🏫" description="Your school's brand logo">
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-2xl bg-blue-600/10 border border-blue-500/20
            flex items-center justify-center overflow-hidden">
            {logoPreview
              ? <img src={logoPreview} alt="logo" className="w-full h-full object-cover" />
              : <span className="text-3xl">🏫</span>}
          </div>
          <div>
            <input ref={logoRef} type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
            <Btn variant="ghost" onClick={() => logoRef.current?.click()}>Upload Logo</Btn>
            <p className="text-[11px] text-white/25 font-dm mt-2">Recommended 256×256 px, PNG or SVG</p>
          </div>
        </div>
      </SectionCard>

      {/* Basic info */}
      <SectionCard title="School Details" icon="📋" description="Official information about your driving school">
        <div className="grid md:grid-cols-2 gap-4">
          <Field label="School Name" className="md:col-span-2">
            <Input value={form.name} onChange={set('name')} placeholder="Auto École Atlas" />
          </Field>
          <Field label="License Number" hint="Issued by Ministry of Transport">
            <Input value={form.license_number} onChange={set('license_number')} placeholder="AE-2024-XXXX" />
          </Field>
          <Field label="Founded Year">
            <Input value={form.founded_year} onChange={set('founded_year')} type="number" placeholder="2018" />
          </Field>
          <Field label="Max Student Capacity">
            <Input value={form.capacity} onChange={set('capacity')} type="number" placeholder="50" />
          </Field>
          <Field label="School Email">
            <Input value={form.email} onChange={set('email')} type="email" />
          </Field>
          <Field label="Phone Number">
            <Input value={form.phone_number} onChange={set('phone_number')} type="tel" />
          </Field>
          <Field label="Website">
            <Input value={form.website} onChange={set('website')} placeholder="https://…" />
          </Field>
          <Field label="Description" className="md:col-span-2">
            <Textarea value={form.description} onChange={set('description')}
              placeholder="Briefly describe your school, specialities, etc." rows={4} />
          </Field>
        </div>
      </SectionCard>

      {/* Address */}
      <SectionCard title="Location" icon="📍" description="Physical address of your school">
        <div className="grid md:grid-cols-2 gap-4">
          <Field label="Street Address" className="md:col-span-2">
            <Input value={form.address} onChange={set('address')} />
          </Field>
          <Field label="City">
            <Input value={form.city} onChange={set('city')} />
          </Field>
          <Field label="Region / Province">
            <Input value={form.region} onChange={set('region')} />
          </Field>
          <Field label="Postal Code">
            <Input value={form.postal_code} onChange={set('postal_code')} />
          </Field>
          <Field label="Country">
            <Select value={form.country} onChange={set('country')}>
              <option value="Morocco">Morocco</option>
              <option value="France">France</option>
              <option value="Algeria">Algeria</option>
              <option value="Tunisia">Tunisia</option>
              <option value="Other">Other</option>
            </Select>
          </Field>
        </div>
      </SectionCard>

      <div className="flex justify-end">
        <Btn onClick={handleSave} loading={saving}>Save School Info</Btn>
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════
//  SECTION: SECURITY
// ══════════════════════════════════════════════════════════════════

const SecuritySection = ({ showToast }) => {
  const [pwForm, setPwForm] = useState({ current: '', new: '', confirm: '' });
  const [pwSaving, setPwSaving]   = useState(false);
  const [showPw, setShowPw]       = useState({ current: false, new: false, confirm: false });
  const [twoFa, setTwoFa]         = useState(false);
  const [sessions] = useState([
    { id: 1, device: 'Chrome · MacOS',  location: 'Casablanca, MA', time: 'Active now',   current: true },
    { id: 2, device: 'Safari · iPhone', location: 'Casablanca, MA', time: '2 hours ago',  current: false },
    { id: 3, device: 'Firefox · Windows', location: 'Rabat, MA',   time: '3 days ago',   current: false },
  ]);

  const pwSet = (k) => (e) => setPwForm((f) => ({ ...f, [k]: e.target.value }));

  const handlePasswordChange = async () => {
    if (pwForm.new !== pwForm.confirm) {
      showToast('New passwords do not match', 'error'); return;
    }
    if (pwForm.new.length < 8) {
      showToast('Password must be at least 8 characters', 'error'); return;
    }
    setPwSaving(true);
    try {
      await axios.post(`${API_URL}/api/auth/password-reset/confirm/`, {
        new_password: pwForm.new,
      }, { headers: authHeader() });
      showToast('Password updated successfully', 'success');
      setPwForm({ current: '', new: '', confirm: '' });
    } catch (e) {
      showToast(e?.response?.data?.error || 'Failed to update password', 'error');
    } finally {
      setPwSaving(false);
    }
  };

  const strength = (() => {
    const p = pwForm.new;
    if (!p) return null;
    let score = 0;
    if (p.length >= 8)  score++;
    if (p.length >= 12) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    if (score <= 2) return { label: 'Weak',   color: 'bg-red-500',    w: 'w-1/4' };
    if (score <= 3) return { label: 'Fair',   color: 'bg-amber-500',  w: 'w-2/4' };
    if (score <= 4) return { label: 'Strong', color: 'bg-blue-500',   w: 'w-3/4' };
    return              { label: 'Very Strong', color: 'bg-emerald-500', w: 'w-full' };
  })();

  const eyeIcon = (show) => show
    ? <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1 7C1 7 3 3 7 3s6 4 6 4-2 4-6 4S1 7 1 7z" stroke="currentColor" strokeWidth="1.2"/><circle cx="7" cy="7" r="1.5" stroke="currentColor" strokeWidth="1.2"/></svg>
    : <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 2l10 10M5.5 5.7A1.5 1.5 0 009 7M1 7s2-4 6-4M13 7c0 0-.8 1.6-2.5 2.8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>;

  const PwInput = ({ field, placeholder }) => (
    <div className="relative">
      <Input
        type={showPw[field] ? 'text' : 'password'}
        value={pwForm[field]}
        onChange={pwSet(field)}
        placeholder={placeholder}
        className="pr-10"
      />
      <button type="button"
        onClick={() => setShowPw((s) => ({ ...s, [field]: !s[field] }))}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
        {eyeIcon(showPw[field])}
      </button>
    </div>
  );

  return (
    <div className="space-y-5">
      {/* Password */}
      <SectionCard title="Change Password" icon="🔑" description="Use a strong unique password">
        <div className="space-y-4 max-w-md">
          <Field label="Current Password">
            <PwInput field="current" placeholder="••••••••" />
          </Field>
          <Field label="New Password">
            <PwInput field="new" placeholder="Min 8 characters" />
            {strength && (
              <div className="mt-2 space-y-1">
                <div className="h-1 bg-white/[0.06] rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all ${strength.color} ${strength.w}`} />
                </div>
                <p className="text-[11px] text-white/30 font-dm">{strength.label}</p>
              </div>
            )}
          </Field>
          <Field label="Confirm New Password">
            <PwInput field="confirm" placeholder="Repeat new password" />
          </Field>
          <Btn onClick={handlePasswordChange} loading={pwSaving}>Update Password</Btn>
        </div>
      </SectionCard>

      {/* 2FA */}
      <SectionCard title="Two-Factor Authentication" icon="🛡" description="Add an extra layer of security">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-white/70 font-dm">
              {twoFa
                ? '2FA is active. Your account is protected.'
                : 'Enable 2FA via authenticator app (Google Authenticator, Authy…)'}
            </p>
            {twoFa && <Badge color="green" className="mt-1">Enabled</Badge>}
          </div>
          <Btn variant={twoFa ? 'danger' : 'success'} onClick={() => {
            setTwoFa(!twoFa);
            showToast(twoFa ? '2FA disabled' : '2FA enabled (demo)', twoFa ? 'info' : 'success');
          }}>
            {twoFa ? 'Disable 2FA' : 'Enable 2FA'}
          </Btn>
        </div>
      </SectionCard>

      {/* Active sessions */}
      <SectionCard title="Active Sessions" icon="💻" description="Devices currently logged in">
        <div className="space-y-3">
          {sessions.map((s) => (
            <div key={s.id}
              className="flex items-center justify-between p-3 bg-white/[0.02]
                border border-white/[0.05] rounded-xl">
              <div className="flex items-center gap-3">
                <span className="text-lg">{s.device.includes('iPhone') ? '📱' : '💻'}</span>
                <div>
                  <div className="text-xs font-semibold text-white font-dm flex items-center gap-2">
                    {s.device}
                    {s.current && <Badge color="green">Current</Badge>}
                  </div>
                  <div className="text-[11px] text-white/30 font-dm">{s.location} · {s.time}</div>
                </div>
              </div>
              {!s.current && (
                <button className="text-xs text-red-400 hover:text-red-300 font-dm transition-colors">
                  Revoke
                </button>
              )}
            </div>
          ))}
        </div>
        <div className="mt-4">
          <Btn variant="danger" onClick={() => showToast('All other sessions revoked', 'success')}>
            Revoke All Other Sessions
          </Btn>
        </div>
      </SectionCard>

      {/* Login history */}
      <SectionCard title="Recent Login Activity" icon="📜" description="Last sign-in events">
        <div className="space-y-2">
          {[
            { when: 'Today, 09:14',    where: 'Casablanca · Chrome',  ok: true },
            { when: 'Yesterday, 18:32', where: 'Casablanca · Safari',  ok: true },
            { when: '3 days ago',       where: 'Rabat · Firefox',      ok: true },
            { when: '5 days ago',       where: 'Unknown · Unknown',    ok: false },
          ].map((e, i) => (
            <div key={i} className="flex items-center justify-between text-xs font-dm py-1.5
              border-b border-white/[0.04] last:border-0">
              <span className="text-white/50">{e.when}</span>
              <span className="text-white/40">{e.where}</span>
              <Badge color={e.ok ? 'green' : 'red'}>{e.ok ? 'Success' : 'Failed'}</Badge>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════
//  SECTION: NOTIFICATIONS
// ══════════════════════════════════════════════════════════════════

const NotificationsSection = ({ showToast }) => {
  const [prefs, setPrefs] = useState({
    email_weekly_report:     true,
    email_new_student:       true,
    email_lesson_cancelled:  true,
    email_payment_received:  true,
    email_low_rating:        false,
    email_monthly_report:    false,
    push_new_student:        true,
    push_lesson_reminder:    true,
    push_feedback_received:  false,
    push_system_alerts:      true,
    sms_lesson_reminder:     false,
    sms_payment_received:    false,
    digest_frequency:        'weekly',
    report_email_time:       '08:00',
  });

  const toggle = (k) => setPrefs((p) => ({ ...p, [k]: !p[k] }));
  const set = (k) => (e) => setPrefs((p) => ({ ...p, [k]: e.target.value }));

  const groups = [
    {
      title: '📧 Email Notifications',
      items: [
        { key: 'email_weekly_report',    label: 'Weekly Report',          desc: 'Receive your weekly school summary every Monday' },
        { key: 'email_monthly_report',   label: 'Monthly Report',         desc: 'End-of-month full analytics digest' },
        { key: 'email_new_student',      label: 'New Student Enrolled',   desc: 'When a student registers to your school' },
        { key: 'email_lesson_cancelled', label: 'Lesson Cancelled',       desc: 'When a lesson is cancelled by student or instructor' },
        { key: 'email_payment_received', label: 'Payment Received',       desc: 'Confirmation when a payment is processed' },
        { key: 'email_low_rating',       label: 'Low Rating Alert',       desc: 'When an instructor receives a rating below 3' },
      ],
    },
    {
      title: '🔔 Push Notifications',
      items: [
        { key: 'push_new_student',       label: 'New Student',            desc: 'Browser push when a student enrolls' },
        { key: 'push_lesson_reminder',   label: 'Lesson Reminders',       desc: '30-minute reminder before each lesson' },
        { key: 'push_feedback_received', label: 'Feedback Received',      desc: 'When a student leaves feedback' },
        { key: 'push_system_alerts',     label: 'System Alerts',          desc: 'Maintenance windows and important updates' },
      ],
    },
    {
      title: '📱 SMS Notifications',
      items: [
        { key: 'sms_lesson_reminder',    label: 'Lesson Reminders',       desc: 'SMS reminder 1 hour before lesson' },
        { key: 'sms_payment_received',   label: 'Payment Confirmation',   desc: 'SMS receipt for every payment' },
      ],
    },
  ];

  return (
    <div className="space-y-5">
      {groups.map((g) => (
        <SectionCard key={g.title} title={g.title} icon="">
          <div className="divide-y divide-white/[0.04]">
            {g.items.map((item) => (
              <Toggle
                key={item.key}
                checked={prefs[item.key]}
                onChange={() => toggle(item.key)}
                label={item.label}
                description={item.desc}
              />
            ))}
          </div>
        </SectionCard>
      ))}

      {/* Digest settings */}
      <SectionCard title="⏰ Report Schedule" icon="" description="When to receive automated reports">
        <div className="grid md:grid-cols-2 gap-4">
          <Field label="Digest Frequency">
            <Select value={prefs.digest_frequency} onChange={set('digest_frequency')}>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="never">Never</option>
            </Select>
          </Field>
          <Field label="Send Reports At">
            <Input type="time" value={prefs.report_email_time} onChange={set('report_email_time')} />
          </Field>
        </div>
      </SectionCard>

      <div className="flex justify-end">
        <Btn onClick={() => showToast('Notification preferences saved', 'success')}>
          Save Preferences
        </Btn>
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════
//  SECTION: APPEARANCE
// ══════════════════════════════════════════════════════════════════

const AppearanceSection = ({ showToast }) => {
  const [theme,    setTheme]    = useState('dark');
  const [accent,   setAccent]   = useState('blue');
  const [density,  setDensity]  = useState('comfortable');
  const [fontSize, setFontSize] = useState('medium');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [animations,       setAnimations]       = useState(true);

  const accents = [
    { id: 'blue',   label: 'Ocean',    bg: 'bg-blue-600' },
    { id: 'violet', label: 'Violet',   bg: 'bg-violet-600' },
    { id: 'emerald',label: 'Emerald',  bg: 'bg-emerald-600' },
    { id: 'amber',  label: 'Amber',    bg: 'bg-amber-500' },
    { id: 'rose',   label: 'Rose',     bg: 'bg-rose-600' },
    { id: 'cyan',   label: 'Cyan',     bg: 'bg-cyan-500' },
  ];

  return (
    <div className="space-y-5">
      {/* Theme */}
      <SectionCard title="Theme" icon="🌙" description="Dashboard colour scheme">
        <div className="flex gap-3">
          {[
            { id: 'dark',  label: 'Dark',  preview: 'bg-[#080E1C] border-blue-500/40' },
            { id: 'light', label: 'Light', preview: 'bg-gray-100 border-transparent' },
            { id: 'auto',  label: 'System', preview: 'bg-gradient-to-r from-[#080E1C] to-gray-100 border-transparent' },
          ].map((t) => (
            <button key={t.id}
              onClick={() => { setTheme(t.id); showToast(`${t.label} theme selected (UI demo only)`, 'info'); }}
              className={`flex-1 rounded-xl border-2 p-3 transition-all ${
                theme === t.id ? 'border-blue-500 bg-blue-500/5' : 'border-white/[0.07] hover:border-white/20'
              }`}>
              <div className={`h-10 rounded-lg mb-2 border ${t.preview}`} />
              <p className="text-xs text-center font-dm text-white/50">{t.label}</p>
            </button>
          ))}
        </div>
      </SectionCard>

      {/* Accent colour */}
      <SectionCard title="Accent Colour" icon="🎨" description="Primary colour used throughout the dashboard">
        <div className="flex gap-3 flex-wrap">
          {accents.map((a) => (
            <button key={a.id}
              onClick={() => { setAccent(a.id); showToast(`Accent: ${a.label} (UI demo only)`, 'info'); }}
              className={`flex flex-col items-center gap-1.5 p-2 rounded-xl border-2 transition-all ${
                accent === a.id ? 'border-white/40' : 'border-transparent'
              }`}>
              <div className={`w-8 h-8 rounded-lg ${a.bg}`} />
              <span className="text-[10px] text-white/40 font-dm">{a.label}</span>
            </button>
          ))}
        </div>
      </SectionCard>

      {/* Density / font */}
      <SectionCard title="Layout & Typography" icon="📐" description="Spacing and font preferences">
        <div className="grid md:grid-cols-2 gap-4">
          <Field label="UI Density">
            <Select value={density} onChange={(e) => setDensity(e.target.value)}>
              <option value="compact">Compact</option>
              <option value="comfortable">Comfortable</option>
              <option value="spacious">Spacious</option>
            </Select>
          </Field>
          <Field label="Font Size">
            <Select value={fontSize} onChange={(e) => setFontSize(e.target.value)}>
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
            </Select>
          </Field>
        </div>
        <Divider />
        <Toggle checked={sidebarCollapsed} onChange={setSidebarCollapsed}
          label="Collapsed Sidebar by Default"
          description="Show only icons in the sidebar when the page loads" />
        <Toggle checked={animations} onChange={setAnimations}
          label="Enable Animations"
          description="Transition effects and micro-interactions" />
      </SectionCard>

      <div className="flex justify-end">
        <Btn onClick={() => showToast('Appearance saved (UI demo — refresh to see full effect)', 'success')}>
          Save Appearance
        </Btn>
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════
//  SECTION: SUBSCRIPTION
// ══════════════════════════════════════════════════════════════════

const SubscriptionSection = ({ showToast }) => {
  const plan = {
    name:       'Pro Plan',
    price:      '499 MAD / month',
    status:     'active',
    renewsAt:   '2025-07-01',
    features:   ['Unlimited students','Advanced analytics','Email reports','Priority support','5 instructor seats'],
  };

  const plans = [
    { id: 'starter', name: 'Starter', price: '199 MAD', students: 'Up to 30 students', seats: '2 instructors', badge: null },
    { id: 'pro',     name: 'Pro',     price: '499 MAD', students: 'Unlimited',          seats: '5 instructors', badge: 'Current' },
    { id: 'elite',   name: 'Elite',   price: '899 MAD', students: 'Unlimited',          seats: 'Unlimited',    badge: 'Popular' },
  ];

  const invoices = [
    { date: '2025-06-01', amount: '499 MAD', status: 'Paid', id: 'INV-0024' },
    { date: '2025-05-01', amount: '499 MAD', status: 'Paid', id: 'INV-0023' },
    { date: '2025-04-01', amount: '499 MAD', status: 'Paid', id: 'INV-0022' },
  ];

  return (
    <div className="space-y-5">
      {/* Current plan */}
      <SectionCard title="Current Plan" icon="💳" description="Your active subscription">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-bold font-sora text-white">{plan.name}</h3>
              <Badge color="green">Active</Badge>
            </div>
            <p className="text-sm text-white/50 font-dm">{plan.price}</p>
            <p className="text-xs text-white/25 font-dm mt-1">Renews {plan.renewsAt}</p>
            <div className="flex flex-wrap gap-2 mt-3">
              {plan.features.map((f) => (
                <span key={f} className="text-[11px] text-white/50 font-dm
                  bg-white/[0.04] border border-white/[0.07] px-2 py-0.5 rounded-lg">
                  ✓ {f}
                </span>
              ))}
            </div>
          </div>
          <Btn variant="ghost" onClick={() => showToast('Contact support to cancel', 'info')}>
            Cancel Plan
          </Btn>
        </div>
      </SectionCard>

      {/* Plan picker */}
      <SectionCard title="Change Plan" icon="🚀" description="Upgrade or downgrade at any time">
        <div className="grid md:grid-cols-3 gap-4">
          {plans.map((p) => (
            <div key={p.id}
              className={`rounded-xl border p-4 relative transition-all cursor-pointer
                ${p.badge === 'Current'
                  ? 'border-blue-500/40 bg-blue-500/5'
                  : 'border-white/[0.07] hover:border-white/20 bg-white/[0.02]'}`}
              onClick={() => showToast(`Plan upgrade to ${p.name} — contact billing`, 'info')}>
              {p.badge && (
                <Badge color={p.badge === 'Current' ? 'blue' : 'amber'} className="absolute top-3 right-3">
                  {p.badge}
                </Badge>
              )}
              <h4 className="text-sm font-bold font-sora text-white">{p.name}</h4>
              <p className="text-lg font-bold text-white font-sora mt-1">{p.price}<span className="text-xs text-white/30">/mo</span></p>
              <div className="mt-3 space-y-1">
                <p className="text-[11px] text-white/40 font-dm">👥 {p.students}</p>
                <p className="text-[11px] text-white/40 font-dm">🏫 {p.seats}</p>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Billing info */}
      <SectionCard title="Payment Method" icon="💰" description="Card on file for billing">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-8 bg-gradient-to-r from-blue-600 to-violet-700
              rounded-lg flex items-center justify-center text-xs text-white font-bold">VISA</div>
            <div>
              <p className="text-sm text-white font-dm">•••• •••• •••• 4242</p>
              <p className="text-[11px] text-white/30 font-dm">Expires 12/2027</p>
            </div>
          </div>
          <Btn variant="ghost" onClick={() => showToast('Card update — contact billing', 'info')}>Update Card</Btn>
        </div>
      </SectionCard>

      {/* Invoice history */}
      <SectionCard title="Invoice History" icon="🧾" description="Past billing statements">
        <div className="space-y-2">
          {invoices.map((inv) => (
            <div key={inv.id}
              className="flex items-center justify-between p-3 bg-white/[0.02]
                border border-white/[0.05] rounded-xl text-xs font-dm">
              <span className="text-white/40">{inv.date}</span>
              <span className="text-white/60">{inv.id}</span>
              <span className="text-white font-semibold">{inv.amount}</span>
              <Badge color="green">{inv.status}</Badge>
              <button className="text-blue-400 hover:text-blue-300 transition-colors">⬇ PDF</button>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════
//  SECTION: INTEGRATIONS
// ══════════════════════════════════════════════════════════════════

const IntegrationsSection = ({ showToast }) => {
  const [connected, setConnected] = useState({ google: false, whatsapp: false, sms: false, webhook: false });

  const integrations = [
    {
      id: 'google',
      icon: '📅',
      name: 'Google Calendar',
      desc: 'Sync lessons directly to Google Calendar for instructors and students',
      badge: 'Popular',
    },
    {
      id: 'whatsapp',
      icon: '💬',
      name: 'WhatsApp Business',
      desc: 'Send lesson reminders and notifications via WhatsApp',
      badge: null,
    },
    {
      id: 'sms',
      icon: '📱',
      name: 'SMS Gateway',
      desc: 'Connect an SMS provider (Twilio, Infobip) for text notifications',
      badge: null,
    },
    {
      id: 'webhook',
      icon: '🔗',
      name: 'Webhook',
      desc: 'Push real-time events to your own server or third-party service',
      badge: 'Dev',
    },
  ];

  const [webhookUrl, setWebhookUrl] = useState('');

  return (
    <div className="space-y-5">
      <SectionCard title="Available Integrations" icon="🔗" description="Connect third-party services to DriveIQ">
        <div className="space-y-4">
          {integrations.map((ig) => (
            <div key={ig.id}
              className="flex items-center justify-between gap-4 p-4
                bg-white/[0.02] border border-white/[0.05] rounded-xl">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{ig.icon}</span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-white font-dm">{ig.name}</span>
                    {ig.badge && <Badge color="violet">{ig.badge}</Badge>}
                    {connected[ig.id] && <Badge color="green">Connected</Badge>}
                  </div>
                  <p className="text-[11px] text-white/30 font-dm mt-0.5">{ig.desc}</p>
                </div>
              </div>
              <Btn
                variant={connected[ig.id] ? 'danger' : 'ghost'}
                onClick={() => {
                  setConnected((c) => ({ ...c, [ig.id]: !c[ig.id] }));
                  showToast(connected[ig.id] ? `${ig.name} disconnected` : `${ig.name} connected (demo)`,
                    connected[ig.id] ? 'info' : 'success');
                }}>
                {connected[ig.id] ? 'Disconnect' : 'Connect'}
              </Btn>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* API key */}
      <SectionCard title="API Access" icon="🗝" description="Use the DriveIQ API in your own apps">
        <div className="space-y-4">
          <Field label="Your API Key" hint="Keep this secret — it grants full access to your school data">
            <div className="flex gap-2">
              <Input type="password" value="sk-driveiq-••••••••••••••••••••••••••" readOnly className="font-mono text-xs" />
              <Btn variant="ghost" onClick={() => showToast('API key copied to clipboard', 'success')}>Copy</Btn>
              <Btn variant="danger" onClick={() => showToast('New API key generated', 'success')}>Rotate</Btn>
            </div>
          </Field>
          <Field label="Webhook URL" hint="We'll POST events to this URL in real time">
            <div className="flex gap-2">
              <Input value={webhookUrl} onChange={(e) => setWebhookUrl(e.target.value)}
                placeholder="https://yourserver.com/webhook" />
              <Btn variant="ghost" onClick={() => showToast('Webhook URL saved', 'success')}>Save</Btn>
            </div>
          </Field>
        </div>
      </SectionCard>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════
//  SECTION: DANGER ZONE
// ══════════════════════════════════════════════════════════════════

const DangerSection = ({ showToast }) => {
  const [confirm, setConfirm] = useState({ export: false, deactivate: false, delete: false });
  const [deleteWord, setDeleteWord] = useState('');

  const toggle = (k) => setConfirm((c) => ({ ...c, [k]: !c[k] }));

  return (
    <div className="space-y-5">
      {/* Export data */}
      <SectionCard title="Export All Data" icon="📦" description="Download a full copy of your school data" >
        <p className="text-sm text-white/50 font-dm mb-4">
          Get a ZIP archive containing all students, lessons, feedback, analytics and financial data
          in JSON and CSV format. Useful for backups or migration.
        </p>
        {!confirm.export ? (
          <Btn variant="ghost" onClick={() => toggle('export')}>Request Data Export</Btn>
        ) : (
          <div className="flex items-center gap-3">
            <p className="text-xs text-amber-400 font-dm">Are you sure? This may take a few minutes.</p>
            <Btn variant="success" onClick={() => {
              toggle('export');
              showToast('Data export requested — you will receive an email when ready', 'success');
            }}>Yes, Export</Btn>
            <Btn variant="ghost" onClick={() => toggle('export')}>Cancel</Btn>
          </div>
        )}
      </SectionCard>

      {/* Deactivate */}
      <SectionCard title="Deactivate School" icon="⏸" description="Temporarily pause your school account" danger>
        <p className="text-sm text-white/50 font-dm mb-4">
          Deactivating hides your school from all users and pauses billing.
          Students and instructors lose access until you reactivate. All data is preserved.
        </p>
        {!confirm.deactivate ? (
          <Btn variant="danger" onClick={() => toggle('deactivate')}>Deactivate School</Btn>
        ) : (
          <div className="flex items-center gap-3">
            <p className="text-xs text-red-400 font-dm">All users will lose access immediately.</p>
            <Btn variant="danger" onClick={() => {
              toggle('deactivate');
              showToast('School deactivated (demo only)', 'error');
            }}>Confirm Deactivate</Btn>
            <Btn variant="ghost" onClick={() => toggle('deactivate')}>Cancel</Btn>
          </div>
        )}
      </SectionCard>

      {/* Delete */}
      <SectionCard title="Delete School Permanently" icon="🗑" description="Irreversible — all data will be erased" danger>
        <p className="text-sm text-white/50 font-dm mb-4">
          This action <span className="text-red-400 font-semibold">cannot be undone</span>.
          Every student, lesson, payment record, and report will be permanently deleted.
          Your subscription will be cancelled immediately with no refund.
        </p>
        <div className="space-y-3 max-w-sm">
          <Field label={`Type DELETE to confirm`}>
            <Input
              value={deleteWord}
              onChange={(e) => setDeleteWord(e.target.value)}
              placeholder="DELETE"
              className="border-red-500/20 focus:border-red-500/50"
            />
          </Field>
          <Btn
            variant="danger"
            disabled={deleteWord !== 'DELETE'}
            onClick={() => showToast('School deletion requested — support will contact you', 'error')}>
            Delete School Forever
          </Btn>
        </div>
      </SectionCard>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════
//  MAIN PAGE
// ══════════════════════════════════════════════════════════════════

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');
  const [toast, setToast]         = useState(null);
  const toastTimer = useRef(null);

  const showToast = useCallback((message, type = 'success') => {
    clearTimeout(toastTimer.current);
    setToast({ message, type });
    toastTimer.current = setTimeout(() => setToast(null), 4000);
  }, []);

  const panels = {
    profile:       <ProfileSection       showToast={showToast} />,
    school:        <SchoolSection        showToast={showToast} />,
    security:      <SecuritySection      showToast={showToast} />,
    notifications: <NotificationsSection showToast={showToast} />,
    appearance:    <AppearanceSection    showToast={showToast} />,
    subscription:  <SubscriptionSection  showToast={showToast} />,
    integrations:  <IntegrationsSection  showToast={showToast} />,
    danger:        <DangerSection        showToast={showToast} />,
  };

  return (
    <div className="flex min-h-screen bg-[#080E1C] text-white">

      {/* ── Left settings nav ──────────────────────────────────── */}
      <aside className="w-52 flex-shrink-0 border-r border-white/[0.06] pt-6 pb-8 sticky top-0 h-screen overflow-y-auto">
        <div className="px-4 mb-5">
          <h1 className="font-sora text-base font-bold text-white">Settings</h1>
          <p className="text-[11px] text-white/25 font-dm mt-0.5">School Owner</p>
        </div>
        <nav className="space-y-0.5 px-2">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={[
                'w-full flex items-center gap-2.5 px-3 py-2 rounded-[10px]',
                'text-[12px] font-medium font-dm transition-all duration-200 text-left',
                activeTab === t.id
                  ? t.id === 'danger'
                    ? 'bg-red-500/10 text-red-400'
                    : 'bg-blue-600/15 text-blue-300'
                  : t.id === 'danger'
                    ? 'text-red-400/60 hover:bg-red-500/5 hover:text-red-400'
                    : 'text-white/35 hover:bg-white/[0.04] hover:text-white/70',
              ].join(' ')}>
              <span className="text-sm">{t.icon}</span>
              {t.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* ── Main content ───────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-8 py-8">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-[11px] text-white/20 font-dm mb-6">
            <span>Settings</span>
            <span>›</span>
            <span className="text-white/50 capitalize">{TABS.find(t => t.id === activeTab)?.label}</span>
          </div>

          {/* Active panel */}
          <div key={activeTab} className="animate-fade-in">
            {panels[activeTab]}
          </div>
        </div>
      </main>

      <Toast toast={toast} />

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 0.2s ease-out both; }
      `}</style>
    </div>
  );
}