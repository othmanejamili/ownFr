// src/context/AuthContext.jsx
import { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();
const API_URL = `${import.meta.env.VITE_API_URL}`;

export const AuthProvider = ({ children }) => {
  const [user, setUser]                       = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading]                 = useState(true);
  const [error, setError]                     = useState(null);

  // ── Restore session on refresh ──────────────────────────────
  useEffect(() => {
    const access   = localStorage.getItem('access')   || sessionStorage.getItem('access');
    const userData = localStorage.getItem('user')     || sessionStorage.getItem('user');

    if (access && userData) {
      try {
        const parsed = JSON.parse(userData);
        setUser(parsed);
        setIsAuthenticated(true);
        axios.defaults.headers.common['Authorization'] = `Bearer ${access}`;
      } catch {
        _clearStorage();
      }
    }
    setLoading(false);
  }, []);

  // ── Login ───────────────────────────────────────────────────
  const login = async (email, password, rememberMe = false) => {
    setError(null);
    try {
      const { data } = await axios.post(`${API_URL}/auth/login/`, { email, password });
      const { access, refresh, user_id, username, email: userEmail, role, first_name, last_name } = data;

      const userData = { user_id, username, email: userEmail, role, first_name, last_name };
      const storage  = rememberMe ? localStorage : sessionStorage;

      storage.setItem('access',  access);
      storage.setItem('refresh', refresh);
      storage.setItem('user',    JSON.stringify(userData));

      axios.defaults.headers.common['Authorization'] = `Bearer ${access}`;
      setUser(userData);
      setIsAuthenticated(true);

      return { success: true, userData };
    } catch (err) {
      const msg = err.response?.data?.error || 'Login failed.';
      setError(msg);
      return { success: false, message: msg };
    }
  };

  // ── Register (school owner — 3 sequential API calls) ────────
  //
  //  1. POST /auth/register/     → creates user (role=A, is_active=False)
  //                                returns { access, refresh, user_id, username, … }
  //  2. POST /drivingschool/     → creates school linked to the new user
  //  3. POST /schoolsubscription/→ creates subscription in 'trialing' state
  //
  //  The account is NOT activated yet — admin must approve.
  //  We store the token in sessionStorage so the school + subscription
  //  calls succeed, but we do NOT set isAuthenticated (user can't navigate).
  //  After submit the UI shows the "pending review" confirmation screen.
  //
  const register = async ({ account, school, planId }) => {
    setError(null);
    try {
      // ── 1. Create user account ──
      const { data: regData } = await axios.post(`${API_URL}/auth/register/`, {
        first_name: account.first_name,
        last_name:  account.last_name,
        username:   account.username,
        email:      account.email,
        password:   account.password,
        role:       'A',                  // school owner = Admin
      });

      const { access, refresh, user_id, username, email: userEmail, first_name, last_name } = regData;

      // Store token temporarily so the next two calls are authenticated.
      // We deliberately skip setIsAuthenticated — account is pending review.
      sessionStorage.setItem('access',  access);
      sessionStorage.setItem('refresh', refresh);
      axios.defaults.headers.common['Authorization'] = `Bearer ${access}`;

      // ── 2. Create driving school ──
      const { data: schoolData } = await axios.post(`${API_URL}/drivingschool/`, {
        name:         school.name,
        address:      school.address,
        email:        school.email,
        phone_number: school.phone_number,
      });

      // ── 3. Create subscription (trialing — gated until admin approves) ──
      const now     = new Date();
      const trialEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

      await axios.post(`${API_URL}/schoolsubscription/`, {
        school:               schoolData.id,
        plan:                 planId,
        status:               'trialing',
        current_period_start: now.toISOString(),
        current_period_end:   trialEnd.toISOString(),
      });

      return {
        success: true,
        email: userEmail,   // used for the confirmation screen
      };

    } catch (err) {
      // Clean up the temp token on failure so nothing leaks
      _clearStorage();
      delete axios.defaults.headers.common['Authorization'];

      const data = err.response?.data;

      // Return structured field errors when the backend provides them,
      // so RegisterPage can map them back to the right form field.
      if (data && typeof data === 'object' && !data.error && !data.detail) {
        return {
          success:     false,
          fieldErrors: data,                          // e.g. { username: ['already taken'] }
          message:     'Please fix the errors below.',
        };
      }

      const msg = data?.error || data?.detail || 'Registration failed. Please try again.';
      setError(msg);
      return { success: false, message: msg };
    }
  };

  // ── Logout ──────────────────────────────────────────────────
  const logout = () => {
    _clearStorage();
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
    setIsAuthenticated(false);
  };

  // ── Refresh access token ────────────────────────────────────
  const refreshToken = async () => {
    const refresh = localStorage.getItem('refresh') || sessionStorage.getItem('refresh');
    if (!refresh) { logout(); return null; }

    try {
      const { data } = await axios.post(`${API_URL}/auth/token/refresh/`, { refresh });
      const storage  = localStorage.getItem('refresh') ? localStorage : sessionStorage;
      storage.setItem('access', data.access);
      axios.defaults.headers.common['Authorization'] = `Bearer ${data.access}`;
      return data.access;
    } catch {
      logout();
      return null;
    }
  };

  // ── Password reset — step 1: send code to email ─────────────
  const requestPasswordReset = async (email) => {
    setError(null);
    try {
      const { data } = await axios.post(`${API_URL}/auth/password-reset/request/`, {
        email: email.trim()
      });
      return { success: true, message: data.message || 'Reset code sent to your email.' };
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to send reset code.';
      setError(msg);
      return { success: false, message: msg };
    }
  };

  // ── Password reset — step 2: verify code ────────────────────
  const verifyResetCode = async (email, code) => {
    setError(null);
    try {
      const { data } = await axios.post(`${API_URL}/auth/password-reset/verify/`, {
        email: email.trim(),
        code:  code.trim()
      });
      return { success: true, message: data.message || 'Code verified.' };
    } catch (err) {
      const msg = err.response?.data?.error || 'Invalid or expired code.';
      setError(msg);
      return { success: false, message: msg };
    }
  };

  // ── Password reset — step 3: set new password ───────────────
  const resetPassword = async (email, code, newPassword) => {
    setError(null);
    try {
      const { data } = await axios.post(`${API_URL}/auth/password-reset/confirm/`, {
        email:        email.trim(),
        code:         code.trim(),
        new_password: newPassword
      });
      return { success: true, message: data.message || 'Password reset successfully.' };
    } catch (err) {
      console.log('Full error response:', err.response?.data);
      const msg = err.response?.data?.error || 'Failed to reset password.';
      setError(msg);
      return { success: false, message: msg };
    }
  };

  // ── Private helper ───────────────────────────────────────────
  const _clearStorage = () => {
    ['access', 'refresh', 'user'].forEach(k => {
      localStorage.removeItem(k);
      sessionStorage.removeItem(k);
    });
  };

  return (
    <AuthContext.Provider value={{
      // State
      user,
      isAuthenticated,
      loading,
      error,

      // Role shortcuts
      isAdmin:      user?.role === 'A',
      isInstructor: user?.role === 'I',
      isStudent:    user?.role === 'S',

      // Auth
      login,
      logout,
      register,
      refreshToken,

      // Password reset (3 steps)
      requestPasswordReset,
      verifyResetCode,
      resetPassword,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
export default AuthContext;