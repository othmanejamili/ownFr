// src/api/reportApi.js
import axios from 'axios';

const API_URL = `${import.meta.env.VITE_API_URL}/report`;

// ─── Helper: attach Authorization header ──────────────────────────────────────
const authHeader = () => {
  const token =
    localStorage.getItem('access') || sessionStorage.getItem('access');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// ─── Weekly Report ─────────────────────────────────────────────────────────────
/**
 * GET /api/report/report-weekly/
 * @param {number|string} schoolId
 * @param {string|null}   date      YYYY-MM-DD (optional)
 */
export const fetchWeeklyReport = async (schoolId, date = null) => {
  const params = { school_id: schoolId };
  if (date) params.date = date;

  const { data } = await axios.get(`${API_URL}/report-weekly/`, {
    params,
    headers: authHeader(),
  });
  return data;
};

// ─── Monthly Report ────────────────────────────────────────────────────────────
/**
 * GET /api/report/report-monthly/
 * @param {number|string} schoolId
 * @param {string|null}   month     YYYY-MM (optional)
 */
export const fetchMonthlyReport = async (schoolId, month = null) => {
  const params = { school_id: schoolId };
  if (month) params.month = month;

  const { data } = await axios.get(`${API_URL}/report-monthly/`, {
    params,
    headers: authHeader(),
  });
  return data;
};

// ─── Instructor Performance Report ────────────────────────────────────────────
/**
 * GET /api/report/instructor_performance/
 * @param {number|string} schoolId
 * @param {object} options  { instructorId, startDate, endDate }
 */
export const fetchInstructorPerformance = async (schoolId, options = {}) => {
  const params = { school_id: schoolId };
  if (options.instructorId) params.instructor_id = options.instructorId;
  if (options.startDate)    params.start_date    = options.startDate;
  if (options.endDate)      params.end_date      = options.endDate;

  const { data } = await axios.get(`${API_URL}/instructor_performance/`, {
    params,
    headers: authHeader(),
  });
  return data;
};

// ─── Student Progress Report ───────────────────────────────────────────────────
/**
 * GET /api/report/student_progress/
 * @param {number|string} schoolId
 * @param {object} options  { status, minProgress }
 */
export const fetchStudentProgress = async (schoolId, options = {}) => {
  const params = { school_id: schoolId };
  if (options.status)      params.status      = options.status;
  if (options.minProgress) params.min_progress = options.minProgress;

  const { data } = await axios.get(`${API_URL}/student_progress/`, {
    params,
    headers: authHeader(),
  });
  return data;
};

// ─── Financial Summary Report ──────────────────────────────────────────────────
/**
 * GET /api/report/financial_summary/
 * @param {number|string} schoolId
 * @param {object} options  { startDate, endDate }
 */
export const fetchFinancialSummary = async (schoolId, options = {}) => {
  const params = { school_id: schoolId };
  if (options.startDate) params.start_date = options.startDate;
  if (options.endDate)   params.end_date   = options.endDate;

  const { data } = await axios.get(`${API_URL}/financial_summary/`, {
    params,
    headers: authHeader(),
  });
  return data;
};

// ─── Send Weekly Report via Email ─────────────────────────────────────────────
/**
 * POST /api/report/report-send-weekly/
 * @param {number|string} schoolId
 * @param {string|null}   date      YYYY-MM-DD (optional)
 */
export const sendWeeklyReportEmail = async (schoolId, date = null) => {
  const body = { school_id: schoolId };
  if (date) body.date = date;

  const { data } = await axios.post(`${API_URL}/report-send-weekly/`, body, {
    headers: authHeader(),
  });
  return data;
};

// ─── Export Report (CSV or JSON) ───────────────────────────────────────────────
/**
 * GET /api/report/export/
 * @param {number|string} schoolId
 * @param {'weekly'|'monthly'} reportType
 * @param {'csv'|'json'}       exportFormat
 *
 * For CSV: triggers a file download.
 * For JSON: returns parsed report data.
 */
export const exportReport = async (schoolId, reportType = 'weekly', exportFormat = 'csv') => {
  if (exportFormat === 'csv') {
    // Trigger browser download
    const token =
      localStorage.getItem('access') || sessionStorage.getItem('access');

    const url =
      `${API_URL}/export/?school_id=${schoolId}` +
      `&report_type=${reportType}&export_format=csv`;

    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || 'Export failed');
    }

    // Derive filename from Content-Disposition or build a default
    const disposition = response.headers.get('Content-Disposition') || '';
    const match = disposition.match(/filename="?([^"]+)"?/);
    const filename = match ? match[1] : `${reportType}_report.csv`;

    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(blobUrl);

    return { downloaded: true, filename };
  }

  // JSON export
  const { data } = await axios.get(`${API_URL}/export/`, {
    params: { school_id: schoolId, report_type: reportType, export_format: 'json' },
    headers: authHeader(),
  });
  return data;
};