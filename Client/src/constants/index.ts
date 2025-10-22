export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4001';

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
  },
  LEAVE: {
    APPLY: '/leave/apply',
    PENDING: '/leave/pending',
    APPROVE: '/leave/approve',
    SUMMARY: '/leave/summary',
  },
} as const;

export const STORAGE_KEYS = {
  TOKEN: 'maxerp_token',
  USER: 'maxerp_user',
} as const;

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  LEAVE_FORM: '/leave/apply',
  MANAGER_DASHBOARD: '/manager/dashboard',
} as const;

export const LEAVE_TYPE_LABELS = {
  ANNUAL: 'Annual Leave',
  SICK: 'Sick Leave',
  PERSONAL: 'Personal Leave',
} as const;

export const LEAVE_STATUS_LABELS = {
  PENDING: 'Pending',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
} as const;

export const LEAVE_STATUS_COLORS = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  APPROVED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
} as const;

export const VALIDATION_RULES = {
  PASSWORD_MIN_LENGTH: 6,
  REASON_MAX_LENGTH: 500,
  MAX_LEAVE_DAYS: 30,
} as const;

export const DATE_FORMATS = {
  DISPLAY: 'MMM DD, YYYY',
  API: 'YYYY-MM-DD',
  INPUT: 'YYYY-MM-DD',
} as const;
