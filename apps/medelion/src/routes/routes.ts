/**
 * Application Routes Configuration
 * Centralized route definitions for the Examino application
 */

export interface Route {
  path: string;
  name: string;
  title: string;
  description?: string;
  requiresAuth?: boolean;
  roles?: string[];
  icon?: string;
  category?: string;
}

export interface RouteCategory {
  id: string;
  name: string;
  description: string;
  routes: Route[];
}

// Main dashboard routes
export const DASHBOARD_ROUTES = {
  ROOT: '/dashboard',
  OVERVIEW: '/dashboard/overview',
} as const;

// Question Bank routes
export const QUESTION_BANK_ROUTES = {
  ROOT: '/dashboard/question-bank',
  OVERVIEW: '/dashboard/question-bank',
  CATEGORIES: {
    ROOT: '/dashboard/qb/categories',
    MATHEMATICS: '/dashboard/qb/categories/math',
    SCIENCE: '/dashboard/qb/categories/science',
    ENGLISH: '/dashboard/qb/categories/english',
    HISTORY: '/dashboard/qb/categories/history',
    CREATE: '/dashboard/qb/categories/create',
  },
  DIFFICULTY: {
    ROOT: '/dashboard/qb/difficulty',
    EASY: '/dashboard/qb/difficulty/easy',
    MEDIUM: '/dashboard/qb/difficulty/medium',
    HARD: '/dashboard/qb/difficulty/hard',
  },
  IMPORT_EXPORT: '/dashboard/qb/import',
  CREATE: '/dashboard/qb/create',
  EDIT: (id: string) => `/dashboard/qb/edit/${id}`,
  DELETE: (id: string) => `/dashboard/qb/delete/${id}`,
} as const;

// Examination routes
export const EXAMINATION_ROUTES = {
  ROOT: '/dashboard/exams',
  CREATE: '/dashboard/exams/create',
  EDIT: (id: string) => `/dashboard/exams/edit/${id}`,
  VIEW: (id: string) => `/dashboard/exams/view/${id}`,
  TEMPLATES: {
    ROOT: '/dashboard/exams/templates',
    MULTIPLE_CHOICE: '/dashboard/exams/templates/mcq',
    ESSAY: '/dashboard/exams/templates/essay',
    MIXED: '/dashboard/exams/templates/mixed',
    CREATE: '/dashboard/exams/templates/create',
  },
  SCHEDULE: {
    ROOT: '/dashboard/exams/schedule',
    CREATE: '/dashboard/exams/schedule/create',
    EDIT: (id: string) => `/dashboard/exams/schedule/edit/${id}`,
    CALENDAR: '/dashboard/exams/schedule/calendar',
  },
  RESULTS: {
    ROOT: '/dashboard/exams/results',
    OVERVIEW: '/dashboard/exams/results/overview',
    ANALYTICS: '/dashboard/exams/results/analytics',
    EXPORT: '/dashboard/exams/results/export',
    DETAILED: (examId: string) => `/dashboard/exams/results/${examId}`,
    STUDENT: (examId: string, studentId: string) => `/dashboard/exams/results/${examId}/student/${studentId}`,
  },
} as const;

// Student management routes
export const STUDENT_ROUTES = {
  ROOT: '/dashboard/students',
  PROFILE: (id: string) => `/dashboard/students/profile/${id}`,
  CREATE: '/dashboard/students/create',
  EDIT: (id: string) => `/dashboard/students/edit/${id}`,
  IMPORT: '/dashboard/students/import',
  GROUPS: {
    ROOT: '/dashboard/students/groups',
    CLASSES: '/dashboard/students/groups/classes',
    CUSTOM: '/dashboard/students/groups/custom',
    CREATE: '/dashboard/students/groups/create',
    EDIT: (id: string) => `/dashboard/students/groups/edit/${id}`,
  },
  PERFORMANCE: {
    ROOT: '/dashboard/students/performance',
    INDIVIDUAL: (id: string) => `/dashboard/students/performance/${id}`,
    COMPARISON: '/dashboard/students/performance/comparison',
    ANALYTICS: '/dashboard/students/performance/analytics',
  },
} as const;

// Analytics and reporting routes
export const ANALYTICS_ROUTES = {
  ROOT: '/dashboard/analytics',
  OVERVIEW: '/dashboard/analytics/overview',
  REPORTS: {
    ROOT: '/dashboard/analytics/reports',
    PERFORMANCE: '/dashboard/analytics/reports/performance',
    USAGE: '/dashboard/analytics/reports/usage',
    TRENDS: '/dashboard/analytics/reports/trends',
    CUSTOM: '/dashboard/analytics/reports/custom',
    EXPORT: '/dashboard/analytics/reports/export',
  },
  INSIGHTS: {
    ROOT: '/dashboard/analytics/insights',
    STUDENT_PROGRESS: '/dashboard/analytics/insights/student-progress',
    QUESTION_DIFFICULTY: '/dashboard/analytics/insights/question-difficulty',
    EXAM_EFFECTIVENESS: '/dashboard/analytics/insights/exam-effectiveness',
  },
} as const;

// Settings routes
export const SETTINGS_ROUTES = {
  ROOT: '/dashboard/settings',
  GENERAL: '/dashboard/settings/general',
  ACCOUNT: {
    ROOT: '/dashboard/settings/account',
    PROFILE: '/dashboard/settings/account/profile',
    PREFERENCES: '/dashboard/settings/account/preferences',
    SUBSCRIPTION: '/dashboard/settings/account/subscription',
  },
  NOTIFICATIONS: {
    ROOT: '/dashboard/settings/notifications',
    EMAIL: '/dashboard/settings/notifications/email',
    PUSH: '/dashboard/settings/notifications/push',
    SMS: '/dashboard/settings/notifications/sms',
  },
  SECURITY: {
    ROOT: '/dashboard/settings/security',
    PASSWORD: '/dashboard/settings/security/password',
    TWO_FACTOR: '/dashboard/settings/security/2fa',
    SESSIONS: '/dashboard/settings/security/sessions',
    API_KEYS: '/dashboard/settings/security/api-keys',
    AUDIT_LOG: '/dashboard/settings/security/audit-log',
  },
  ORGANIZATION: {
    ROOT: '/dashboard/settings/organization',
    USERS: '/dashboard/settings/organization/users',
    ROLES: '/dashboard/settings/organization/roles',
    PERMISSIONS: '/dashboard/settings/organization/permissions',
    BILLING: '/dashboard/settings/organization/billing',
  },
} as const;

// Admin routes
export const ADMIN_ROUTES = {
  ROOT: '/admin',
  DASHBOARD: '/admin/dashboard',
  USERS: {
    ROOT: '/admin/dashboard/users',
    LIST: '/admin/dashboard/users',
    CREATE: '/admin/dashboard/users/create',
    EDIT: (id: string) => `/admin/dashboard/users/edit/${id}`,
    VIEW: (id: string) => `/admin/dashboard/users/view/${id}`,
    ROLES: '/admin/dashboard/users/roles',
    GROUPS: '/admin/dashboard/users/groups',
  },
  QBM: {
    ROOT: '/admin/dashboard/question-bank-manager',
    OVERVIEW: '/admin/dashboard/question-bank-manager',
    HIERARCHY: '/admin/dashboard/question-bank-manager/hierarchy',
    CATEGORIES: {
      ROOT: '/admin/dashboard/question-bank-manager/categories',
      LIST: '/admin/dashboard/question-bank-manager/categories',
      CREATE: '/admin/dashboard/question-bank-manager/categories/create',
      EDIT: (id: string) => `/admin/dashboard/question-bank-manager/categories/edit/${id}`,
      MANAGE: '/admin/dashboard/question-bank-manager/categories/manage',
    },
    APPROVAL: {
      ROOT: '/admin/dashboard/question-bank-manager/approval',
      PENDING: '/admin/dashboard/question-bank-manager/approval/pending',
      APPROVED: '/admin/dashboard/question-bank-manager/approval/approved',
      REJECTED: '/admin/dashboard/question-bank-manager/approval/rejected',
      REVIEW: (id: string) => `/admin/dashboard/question-bank-manager/approval/review/${id}`,
    },
    BULK: {
      ROOT: '/admin/dashboard/question-bank-manager/bulk',
      IMPORT: '/admin/dashboard/question-bank-manager/bulk/import',
      EXPORT: '/admin/dashboard/question-bank-manager/bulk/export',
      DELETE: '/admin/dashboard/question-bank-manager/bulk/delete',
      UPDATE: '/admin/dashboard/question-bank-manager/bulk/update',
    },
    QUALITY: {
      ROOT: '/admin/dashboard/question-bank-manager/quality',
      VALIDATION: '/admin/dashboard/question-bank-manager/quality/validation',
      DUPLICATES: '/admin/dashboard/question-bank-manager/quality/duplicates',
      REPORTS: '/admin/dashboard/question-bank-manager/quality/reports',
      METRICS: '/admin/dashboard/question-bank-manager/quality/metrics',
    },
  },
  ANALYTICS: {
    ROOT: '/admin/dashboard/analytics',
    SYSTEM: '/admin/dashboard/analytics/system',
    USAGE: '/admin/dashboard/analytics/usage',
    PERFORMANCE: '/admin/dashboard/analytics/performance',
  },
  MODERATION: {
    ROOT: '/admin/dashboard/moderation',
    PENDING: '/admin/dashboard/moderation/pending',
    FLAGGED: '/admin/dashboard/moderation/flagged',
    SETTINGS: '/admin/dashboard/moderation/settings',
  },
  REPORTS: {
    ROOT: '/admin/dashboard/reports',
    SYSTEM: '/admin/dashboard/reports/system',
    USERS: '/admin/dashboard/reports/users',
    CUSTOM: '/admin/dashboard/reports/custom',
  },
  SETTINGS: {
    ROOT: '/admin/dashboard/settings',
    GENERAL: '/admin/dashboard/settings/general',
    SECURITY: '/admin/dashboard/settings/security',
    NOTIFICATIONS: '/admin/dashboard/settings/notifications',
    BACKUP: '/admin/dashboard/settings/backup',
  },
  LOGS: {
    ROOT: '/admin/dashboard/logs',
    SYSTEM: '/admin/dashboard/logs/system',
    ERRORS: '/admin/dashboard/logs/errors',
    AUDIT: '/admin/dashboard/logs/audit',
  },
  MONITORING: '/admin/dashboard/monitoring',
} as const;

// Authentication routes
export const AUTH_ROUTES = {
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  FORGOT_PASSWORD: '/auth/forgot-password',
  RESET_PASSWORD: '/auth/reset-password',
  VERIFY_EMAIL: '/auth/verify-email',
  LOGOUT: '/auth/logout',
} as const;

// Public routes
export const PUBLIC_ROUTES = {
  HOME: '/',
  ABOUT: '/about',
  PRICING: '/pricing',
  CONTACT: '/contact',
  PRIVACY: '/privacy',
  TERMS: '/terms',
  HELP: '/help',
} as const;

// Complete routes map for easy access
export const ROUTES = {
  PUBLIC: PUBLIC_ROUTES,
  AUTH: AUTH_ROUTES,
  DASHBOARD: DASHBOARD_ROUTES,
  QUESTION_BANK: QUESTION_BANK_ROUTES,
  EXAMINATIONS: EXAMINATION_ROUTES,
  STUDENTS: STUDENT_ROUTES,
  ANALYTICS: ANALYTICS_ROUTES,
  SETTINGS: SETTINGS_ROUTES,
  ADMIN: ADMIN_ROUTES,
} as const;

// Route definitions with metadata for navigation
export const routeDefinitions: Route[] = [
  // Dashboard
  {
    path: DASHBOARD_ROUTES.ROOT,
    name: 'dashboard',
    title: 'Dashboard',
    description: 'Main dashboard overview',
    requiresAuth: true,
    category: 'main',
  },

  // Question Bank
  {
    path: QUESTION_BANK_ROUTES.ROOT,
    name: 'question-bank',
    title: 'Question Bank',
    description: 'Manage your question collections',
    requiresAuth: true,
    category: 'content',
  },
  {
    path: QUESTION_BANK_ROUTES.CATEGORIES.MATHEMATICS,
    name: 'qb-mathematics',
    title: 'Mathematics Questions',
    description: 'Mathematics question collection',
    requiresAuth: true,
    category: 'content',
  },
  {
    path: QUESTION_BANK_ROUTES.CATEGORIES.SCIENCE,
    name: 'qb-science',
    title: 'Science Questions',
    description: 'Science question collection',
    requiresAuth: true,
    category: 'content',
  },
  {
    path: QUESTION_BANK_ROUTES.CATEGORIES.ENGLISH,
    name: 'qb-english',
    title: 'English Questions',
    description: 'English question collection',
    requiresAuth: true,
    category: 'content',
  },
  {
    path: QUESTION_BANK_ROUTES.CATEGORIES.HISTORY,
    name: 'qb-history',
    title: 'History Questions',
    description: 'History question collection',
    requiresAuth: true,
    category: 'content',
  },
  {
    path: QUESTION_BANK_ROUTES.DIFFICULTY.EASY,
    name: 'qb-easy',
    title: 'Easy Questions',
    description: 'Easy difficulty questions',
    requiresAuth: true,
    category: 'content',
  },
  {
    path: QUESTION_BANK_ROUTES.DIFFICULTY.MEDIUM,
    name: 'qb-medium',
    title: 'Medium Questions',
    description: 'Medium difficulty questions',
    requiresAuth: true,
    category: 'content',
  },
  {
    path: QUESTION_BANK_ROUTES.DIFFICULTY.HARD,
    name: 'qb-hard',
    title: 'Hard Questions',
    description: 'Hard difficulty questions',
    requiresAuth: true,
    category: 'content',
  },
  {
    path: QUESTION_BANK_ROUTES.IMPORT_EXPORT,
    name: 'qb-import',
    title: 'Import/Export',
    description: 'Import or export questions',
    requiresAuth: true,
    category: 'content',
  },

  // Examinations
  {
    path: EXAMINATION_ROUTES.CREATE,
    name: 'exam-create',
    title: 'Create Exam',
    description: 'Create a new examination',
    requiresAuth: true,
    category: 'exams',
  },
  {
    path: EXAMINATION_ROUTES.TEMPLATES.MULTIPLE_CHOICE,
    name: 'exam-template-mcq',
    title: 'Multiple Choice Template',
    description: 'Multiple choice exam template',
    requiresAuth: true,
    category: 'exams',
  },
  {
    path: EXAMINATION_ROUTES.TEMPLATES.ESSAY,
    name: 'exam-template-essay',
    title: 'Essay Template',
    description: 'Essay type exam template',
    requiresAuth: true,
    category: 'exams',
  },
  {
    path: EXAMINATION_ROUTES.TEMPLATES.MIXED,
    name: 'exam-template-mixed',
    title: 'Mixed Format Template',
    description: 'Mixed format exam template',
    requiresAuth: true,
    category: 'exams',
  },
  {
    path: EXAMINATION_ROUTES.SCHEDULE.ROOT,
    name: 'exam-schedule',
    title: 'Schedule Exams',
    description: 'Schedule examinations',
    requiresAuth: true,
    category: 'exams',
  },
  {
    path: EXAMINATION_ROUTES.RESULTS.ROOT,
    name: 'exam-results',
    title: 'Exam Results',
    description: 'View and analyze exam results',
    requiresAuth: true,
    category: 'exams',
  },
  {
    path: EXAMINATION_ROUTES.RESULTS.OVERVIEW,
    name: 'exam-results-overview',
    title: 'Results Overview',
    description: 'Exam results overview',
    requiresAuth: true,
    category: 'exams',
  },
  {
    path: EXAMINATION_ROUTES.RESULTS.ANALYTICS,
    name: 'exam-results-analytics',
    title: 'Results Analytics',
    description: 'Detailed exam results analytics',
    requiresAuth: true,
    category: 'exams',
  },
  {
    path: EXAMINATION_ROUTES.RESULTS.EXPORT,
    name: 'exam-results-export',
    title: 'Export Results',
    description: 'Export exam results data',
    requiresAuth: true,
    category: 'exams',
  },

  // Students
  {
    path: STUDENT_ROUTES.ROOT,
    name: 'students',
    title: 'All Students',
    description: 'View all students',
    requiresAuth: true,
    category: 'users',
  },
  {
    path: STUDENT_ROUTES.GROUPS.CLASSES,
    name: 'student-groups-classes',
    title: 'Class Groups',
    description: 'Organize students by class',
    requiresAuth: true,
    category: 'users',
  },
  {
    path: STUDENT_ROUTES.GROUPS.CUSTOM,
    name: 'student-groups-custom',
    title: 'Custom Groups',
    description: 'Create custom student groups',
    requiresAuth: true,
    category: 'users',
  },
  {
    path: STUDENT_ROUTES.PERFORMANCE.ROOT,
    name: 'student-performance',
    title: 'Student Performance',
    description: 'Track student performance',
    requiresAuth: true,
    category: 'users',
  },

  // Analytics
  {
    path: ANALYTICS_ROUTES.ROOT,
    name: 'analytics',
    title: 'Analytics Overview',
    description: 'Analytics overview and insights',
    requiresAuth: true,
    category: 'analytics',
  },
  {
    path: ANALYTICS_ROUTES.REPORTS.PERFORMANCE,
    name: 'analytics-performance',
    title: 'Performance Reports',
    description: 'Detailed performance analytics',
    requiresAuth: true,
    category: 'analytics',
  },
  {
    path: ANALYTICS_ROUTES.REPORTS.USAGE,
    name: 'analytics-usage',
    title: 'Usage Statistics',
    description: 'Platform usage statistics',
    requiresAuth: true,
    category: 'analytics',
  },
  {
    path: ANALYTICS_ROUTES.REPORTS.TRENDS,
    name: 'analytics-trends',
    title: 'Trend Analysis',
    description: 'Trend analysis and insights',
    requiresAuth: true,
    category: 'analytics',
  },

  // Settings
  {
    path: SETTINGS_ROUTES.ROOT,
    name: 'settings',
    title: 'General Settings',
    description: 'General application settings',
    requiresAuth: true,
    category: 'settings',
  },
  {
    path: SETTINGS_ROUTES.ACCOUNT.ROOT,
    name: 'settings-account',
    title: 'Account Settings',
    description: 'Account settings and profile',
    requiresAuth: true,
    category: 'settings',
  },
  {
    path: SETTINGS_ROUTES.NOTIFICATIONS.ROOT,
    name: 'settings-notifications',
    title: 'Notification Settings',
    description: 'Notification preferences',
    requiresAuth: true,
    category: 'settings',
  },
  {
    path: SETTINGS_ROUTES.SECURITY.PASSWORD,
    name: 'settings-security-password',
    title: 'Change Password',
    description: 'Change account password',
    requiresAuth: true,
    category: 'settings',
  },
  {
    path: SETTINGS_ROUTES.SECURITY.TWO_FACTOR,
    name: 'settings-security-2fa',
    title: 'Two-Factor Authentication',
    description: 'Two-factor authentication settings',
    requiresAuth: true,
    category: 'settings',
  },
  {
    path: SETTINGS_ROUTES.SECURITY.SESSIONS,
    name: 'settings-security-sessions',
    title: 'Active Sessions',
    description: 'Manage active sessions',
    requiresAuth: true,
    category: 'settings',
  },
];

// Utility functions for route management
export const RouteUtils = {
  /**
   * Get route by name
   */
  getRouteByName: (name: string): Route | undefined => {
    return routeDefinitions.find(route => route.name === name);
  },

  /**
   * Get routes by category
   */
  getRoutesByCategory: (category: string): Route[] => {
    return routeDefinitions.filter(route => route.category === category);
  },

  /**
   * Check if route requires authentication
   */
  requiresAuth: (path: string): boolean => {
    const route = routeDefinitions.find(r => r.path === path);
    return route?.requiresAuth ?? false;
  },

  /**
   * Check if user has access to route
   */
  hasAccess: (path: string, userRoles: string[] = []): boolean => {
    const route = routeDefinitions.find(r => r.path === path);
    if (!route?.roles) return true;
    return route.roles.some(role => userRoles.includes(role));
  },

  /**
   * Get breadcrumb trail for a path
   */
  getBreadcrumbs: (path: string): Route[] => {
    const breadcrumbs: Route[] = [];
    const pathSegments = path.split('/').filter(Boolean);
    let currentPath = '';

    for (const segment of pathSegments) {
      currentPath += `/${segment}`;
      const route = routeDefinitions.find(r => r.path === currentPath);
      if (route) {
        breadcrumbs.push(route);
      }
    }

    return breadcrumbs;
  },

  /**
   * Generate navigation items for sidebar
   */
  getNavigationRoutes: (): Route[] => {
    return routeDefinitions.filter(route => 
      route.category && ['main', 'content', 'exams', 'users', 'analytics', 'settings'].includes(route.category)
    );
  },
};

export default ROUTES;