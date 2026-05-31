// src/hooks/useReports.js
import { useState, useCallback, useRef } from 'react';
import {
  fetchWeeklyReport,
  fetchMonthlyReport,
  fetchInstructorPerformance,
  fetchStudentProgress,
  fetchFinancialSummary,
  sendWeeklyReportEmail,
  exportReport,
} from './Reportapi';

// ─── per-report slice ─────────────────────────────────────────────────────────
const emptySlice = () => ({ data: null, loading: false, error: null });

// ─────────────────────────────────────────────────────────────────────────────
export const useReports = (schoolId) => {
  // Each report type lives in its own slice so they can load independently
  const [weekly,      setWeekly]      = useState(emptySlice());
  const [monthly,     setMonthly]     = useState(emptySlice());
  const [instructors, setInstructors] = useState(emptySlice());
  const [students,    setStudents]    = useState(emptySlice());
  const [financial,   setFinancial]   = useState(emptySlice());

  // Email send feedback
  const [emailStatus, setEmailStatus] = useState({ sending: false, result: null });

  // Export feedback
  const [exportStatus, setExportStatus] = useState({ loading: false, result: null });

  // Active tab – drives which panel is visible in the UI
  const [activeTab, setActiveTab] = useState('weekly');

  // Abort controller refs so stale requests are cancelled
  const abortRefs = useRef({});

  // ── Generic fetch wrapper ───────────────────────────────────────────────────
  const fetchWith = useCallback(async (key, setter, apiFn, ...args) => {
    // Cancel any in-flight request for this key
    abortRefs.current[key]?.abort?.();

    setter((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const data = await apiFn(...args);
      setter({ data, loading: false, error: null });
      return data;
    } catch (err) {
      const msg =
        err?.response?.data?.error ||
        err?.response?.data?.detail ||
        err.message ||
        'Something went wrong';
      setter({ data: null, loading: false, error: msg });
      return null;
    }
  }, []);

  // ── Public fetch actions ────────────────────────────────────────────────────

  /** Load weekly report. date: YYYY-MM-DD (optional) */
  const loadWeekly = useCallback(
    (date = null) => fetchWith('weekly', setWeekly, fetchWeeklyReport, schoolId, date),
    [schoolId, fetchWith]
  );

  /** Load monthly report. month: YYYY-MM (optional) */
  const loadMonthly = useCallback(
    (month = null) => fetchWith('monthly', setMonthly, fetchMonthlyReport, schoolId, month),
    [schoolId, fetchWith]
  );

  /** Load instructor performance report.
   *  options: { instructorId, startDate, endDate } */
  const loadInstructorPerformance = useCallback(
    (options = {}) =>
      fetchWith('instructors', setInstructors, fetchInstructorPerformance, schoolId, options),
    [schoolId, fetchWith]
  );

  /** Load student progress report.
   *  options: { status, minProgress } */
  const loadStudentProgress = useCallback(
    (options = {}) =>
      fetchWith('students', setStudents, fetchStudentProgress, schoolId, options),
    [schoolId, fetchWith]
  );

  /** Load financial summary report.
   *  options: { startDate, endDate } */
  const loadFinancialSummary = useCallback(
    (options = {}) =>
      fetchWith('financial', setFinancial, fetchFinancialSummary, schoolId, options),
    [schoolId, fetchWith]
  );

  // ── Email action ─────────────────────────────────────────────────────────────
  const sendWeeklyEmail = useCallback(
    async (date = null) => {
      setEmailStatus({ sending: true, result: null });
      try {
        const result = await sendWeeklyReportEmail(schoolId, date);
        setEmailStatus({ sending: false, result: { success: true, ...result } });
        return result;
      } catch (err) {
        const msg =
          err?.response?.data?.error || err.message || 'Failed to send email';
        setEmailStatus({ sending: false, result: { success: false, message: msg } });
        return null;
      }
    },
    [schoolId]
  );

  // ── Export action ─────────────────────────────────────────────────────────────
  const triggerExport = useCallback(
    async (reportType = 'weekly', format = 'csv') => {
      setExportStatus({ loading: true, result: null });
      try {
        const result = await exportReport(schoolId, reportType, format);
        setExportStatus({ loading: false, result: { success: true, ...result } });
        return result;
      } catch (err) {
        const msg = err.message || 'Export failed';
        setExportStatus({ loading: false, result: { success: false, message: msg } });
        return null;
      }
    },
    [schoolId]
  );

  // ── Reset helpers ─────────────────────────────────────────────────────────────
  const resetWeekly      = () => setWeekly(emptySlice());
  const resetMonthly     = () => setMonthly(emptySlice());
  const resetInstructors = () => setInstructors(emptySlice());
  const resetStudents    = () => setStudents(emptySlice());
  const resetFinancial   = () => setFinancial(emptySlice());
  const resetEmailStatus = () => setEmailStatus({ sending: false, result: null });
  const resetExportStatus = () => setExportStatus({ loading: false, result: null });

  // ── Convenience: load the report that matches the active tab ──────────────────
  const loadActiveTab = useCallback(
    (params = {}) => {
      switch (activeTab) {
        case 'weekly':
          return loadWeekly(params.date);
        case 'monthly':
          return loadMonthly(params.month);
        case 'instructors':
          return loadInstructorPerformance(params);
        case 'students':
          return loadStudentProgress(params);
        case 'financial':
          return loadFinancialSummary(params);
        default:
          return Promise.resolve(null);
      }
    },
    [activeTab, loadWeekly, loadMonthly, loadInstructorPerformance, loadStudentProgress, loadFinancialSummary]
  );

  return {
    // State slices
    weekly,
    monthly,
    instructors,
    students,
    financial,

    // Email / export
    emailStatus,
    exportStatus,

    // Active tab
    activeTab,
    setActiveTab,

    // Fetch actions
    loadWeekly,
    loadMonthly,
    loadInstructorPerformance,
    loadStudentProgress,
    loadFinancialSummary,
    loadActiveTab,

    // Side-effect actions
    sendWeeklyEmail,
    triggerExport,

    // Resets
    resetWeekly,
    resetMonthly,
    resetInstructors,
    resetStudents,
    resetFinancial,
    resetEmailStatus,
    resetExportStatus,
  };
};

export default useReports;