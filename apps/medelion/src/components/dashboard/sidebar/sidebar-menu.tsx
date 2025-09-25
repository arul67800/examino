import React from 'react';
import { MenuItem, UserProfile, AnimationConfig, SidebarTheme } from './sidebar-types';
import { ROUTES } from '../../../routes/routes';
import {
  DashboardIcon,
  DocumentTextIcon,
  ClipboardListIcon,
  TagIcon,
  CalculatorIcon,
  BeakerIcon,
  BookOpenIcon,
  BuildingIcon,
  CircleIcon,
  ArrowUpTrayIcon,
  PlusIcon,
  DocumentDuplicateIcon,
  CheckSquareIcon,
  ShuffleIcon,
  CalendarIcon,
  ChartBarIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  TargetIcon,
  UsersIcon,
  UserGroupIcon,
  AcademicCapIcon,
  WrenchIcon,
  CogIcon,
  UserIcon,
  BellIcon,
  LockIcon,
  KeyIcon,
  DevicePhoneMobileIcon,
  ComputerDesktopIcon
} from './sidebar-icons';

// Admin Navigation Menu
export const getAdminNavigationMenu = (): MenuItem[] => [
  {
    id: 'admin-dashboard',
    name: 'Admin Dashboard',
    icon: <DashboardIcon />,
    href: '/admin/dashboard',
    level: 1,
    isActive: true,
    description: 'Admin dashboard overview'
  },
  {
    id: 'user-management',
    name: 'User Management',
    icon: <UsersIcon />,
    level: 1,
    description: 'Manage platform users',
    children: [
      {
        id: 'all-users',
        name: 'All Users',
        icon: <ClipboardListIcon />,
        href: '/admin/dashboard/users',
        level: 2,
        parentId: 'user-management',
        description: 'View and manage all users'
      },
      {
        id: 'user-roles',
        name: 'Roles & Permissions',
        icon: <LockIcon />,
        href: '/admin/dashboard/users/roles',
        level: 2,
        parentId: 'user-management',
        description: 'Manage user roles and permissions'
      },
      {
        id: 'user-groups',
        name: 'User Groups',
        icon: <UserGroupIcon />,
        href: '/admin/dashboard/users/groups',
        level: 2,
        parentId: 'user-management',
        description: 'Organize users into groups'
      }
    ]
  },
  {
    id: 'question-bank-manager',
    name: 'Question Bank Manager',
    icon: <DocumentTextIcon />,
    level: 1,
    badge: 'QBM',
    description: 'Advanced question bank management',
    children: [
      {
        id: 'qbm-overview',
        name: 'Overview',
        icon: <ClipboardListIcon />,
        href: '/admin/dashboard/qbm',
        level: 2,
        parentId: 'question-bank-manager',
        description: 'Question bank overview and statistics'
      },
      {
        id: 'qbm-hierarchy',
        name: 'Hierarchy Management',
        icon: <TagIcon />,
        href: '/admin/dashboard/qbm/hierarchy',
        level: 2,
        parentId: 'question-bank-manager',
        description: 'Manage question categories and hierarchy'
      },
      {
        id: 'qbm-approval',
        name: 'Content Approval',
        icon: <CheckSquareIcon />,
        level: 2,
        parentId: 'question-bank-manager',
        badge: 15,
        description: 'Review and approve questions',
        children: [
          {
            id: 'qbm-approval-pending',
            name: 'Pending Review',
            icon: '⏳',
            href: '/admin/dashboard/qbm/approval/pending',
            level: 3,
            parentId: 'question-bank-manager',
            subParentId: 'qbm-approval',
            badge: 12
          },
          {
            id: 'qbm-approval-approved',
            name: 'Approved Content',
            icon: '✅',
            href: '/admin/dashboard/qbm/approval/approved',
            level: 3,
            parentId: 'question-bank-manager',
            subParentId: 'qbm-approval'
          },
          {
            id: 'qbm-approval-rejected',
            name: 'Rejected Content',
            icon: '❌',
            href: '/admin/dashboard/qbm/approval/rejected',
            level: 3,
            parentId: 'question-bank-manager',
            subParentId: 'qbm-approval'
          }
        ]
      },
      {
        id: 'qbm-bulk-operations',
        name: 'Bulk Operations',
        icon: <ArrowUpTrayIcon />,
        level: 2,
        parentId: 'question-bank-manager',
        description: 'Bulk import/export operations',
        children: [
          {
            id: 'qbm-bulk-import',
            name: 'Bulk Import',
            icon: '📥',
            href: '/admin/dashboard/qbm/bulk/import',
            level: 3,
            parentId: 'question-bank-manager',
            subParentId: 'qbm-bulk-operations'
          },
          {
            id: 'qbm-bulk-export',
            name: 'Bulk Export',
            icon: '📤',
            href: '/admin/dashboard/qbm/bulk/export',
            level: 3,
            parentId: 'question-bank-manager',
            subParentId: 'qbm-bulk-operations'
          },
          {
            id: 'qbm-bulk-update',
            name: 'Bulk Update',
            icon: '🔄',
            href: '/admin/dashboard/qbm/bulk/update',
            level: 3,
            parentId: 'question-bank-manager',
            subParentId: 'qbm-bulk-operations'
          },
          {
            id: 'qbm-bulk-delete',
            name: 'Bulk Delete',
            icon: '🗑️',
            href: '/admin/dashboard/qbm/bulk/delete',
            level: 3,
            parentId: 'question-bank-manager',
            subParentId: 'qbm-bulk-operations'
          }
        ]
      },
      {
        id: 'qbm-quality-control',
        name: 'Quality Control',
        icon: <TargetIcon />,
        level: 2,
        parentId: 'question-bank-manager',
        description: 'Quality assurance and validation',
        children: [
          {
            id: 'qbm-quality-validation',
            name: 'Content Validation',
            icon: '🔍',
            href: '/admin/dashboard/qbm/quality/validation',
            level: 3,
            parentId: 'question-bank-manager',
            subParentId: 'qbm-quality-control'
          },
          {
            id: 'qbm-quality-duplicates',
            name: 'Duplicate Detection',
            icon: '👯',
            href: '/admin/dashboard/qbm/quality/duplicates',
            level: 3,
            parentId: 'question-bank-manager',
            subParentId: 'qbm-quality-control'
          },
          {
            id: 'qbm-quality-reports',
            name: 'Quality Reports',
            icon: '📋',
            href: '/admin/dashboard/qbm/quality/reports',
            level: 3,
            parentId: 'question-bank-manager',
            subParentId: 'qbm-quality-control'
          },
          {
            id: 'qbm-quality-metrics',
            name: 'Quality Metrics',
            icon: <ChartBarIcon />,
            href: '/admin/dashboard/qbm/quality/metrics',
            level: 3,
            parentId: 'question-bank-manager',
            subParentId: 'qbm-quality-control'
          }
        ]
      }
    ]
  },
  {
    id: 'system-analytics',
    name: 'System Analytics',
    icon: <ChartBarIcon />,
    level: 1,
    description: 'System-wide analytics and insights',
    children: [
      {
        id: 'system-overview',
        name: 'System Overview',
        icon: <TrendingUpIcon />,
        href: '/admin/dashboard/analytics',
        level: 2,
        parentId: 'system-analytics',
        description: 'Overall system metrics'
      },
      {
        id: 'usage-statistics',
        name: 'Usage Statistics',
        icon: <ChartBarIcon />,
        href: '/admin/dashboard/analytics/usage',
        level: 2,
        parentId: 'system-analytics',
        description: 'Platform usage statistics'
      },
      {
        id: 'performance-metrics',
        name: 'Performance Metrics',
        icon: <TargetIcon />,
        href: '/admin/dashboard/analytics/performance',
        level: 2,
        parentId: 'system-analytics',
        description: 'System performance monitoring'
      }
    ]
  },
  {
    id: 'content-moderation',
    name: 'Content Moderation',
    icon: '🛡️',
    level: 1,
    badge: 8,
    description: 'Moderate and review platform content',
    children: [
      {
        id: 'pending-reviews',
        name: 'Pending Reviews',
        icon: <ClipboardListIcon />,
        href: '/admin/dashboard/moderation',
        level: 2,
        parentId: 'content-moderation',
        badge: 8,
        description: 'Content awaiting review'
      },
      {
        id: 'flagged-content',
        name: 'Flagged Content',
        icon: '🚩',
        href: '/admin/dashboard/moderation/flagged',
        level: 2,
        parentId: 'content-moderation',
        description: 'User-reported content'
      },
      {
        id: 'moderation-settings',
        name: 'Moderation Settings',
        icon: <CogIcon />,
        href: '/admin/dashboard/moderation/settings',
        level: 2,
        parentId: 'content-moderation',
        description: 'Configure moderation rules'
      }
    ]
  },
  {
    id: 'reports',
    name: 'Reports',
    icon: '📋',
    level: 1,
    description: 'Generate and manage reports',
    children: [
      {
        id: 'system-reports',
        name: 'System Reports',
        icon: <ClipboardListIcon />,
        href: '/admin/dashboard/reports',
        level: 2,
        parentId: 'reports',
        description: 'System-wide reports'
      },
      {
        id: 'user-reports',
        name: 'User Reports',
        icon: <UsersIcon />,
        href: '/admin/dashboard/reports/users',
        level: 2,
        parentId: 'reports',
        description: 'User activity reports'
      },
      {
        id: 'custom-reports',
        name: 'Custom Reports',
        icon: <WrenchIcon />,
        href: '/admin/dashboard/reports/custom',
        level: 2,
        parentId: 'reports',
        description: 'Create custom reports'
      }
    ]
  },
  {
    id: 'system-settings',
    name: 'System Settings',
    icon: <CogIcon />,
    level: 1,
    description: 'System configuration and preferences',
    children: [
      {
        id: 'general-settings',
        name: 'General Settings',
        icon: <WrenchIcon />,
        href: '/admin/dashboard/settings',
        level: 2,
        parentId: 'system-settings',
        description: 'General system settings'
      },
      {
        id: 'security-settings',
        name: 'Security Settings',
        icon: <LockIcon />,
        href: '/admin/dashboard/settings/security',
        level: 2,
        parentId: 'system-settings',
        description: 'System security configuration'
      },
      {
        id: 'notification-settings',
        name: 'Notifications',
        icon: <BellIcon />,
        href: '/admin/dashboard/settings/notifications',
        level: 2,
        parentId: 'system-settings',
        description: 'System notification settings'
      },
      {
        id: 'backup-settings',
        name: 'Backup & Recovery',
        icon: '💾',
        href: '/admin/dashboard/settings/backup',
        level: 2,
        parentId: 'system-settings',
        description: 'Data backup and recovery'
      }
    ]
  },
  {
    id: 'logs-monitoring',
    name: 'Logs & Monitoring',
    icon: '📄',
    level: 1,
    description: 'System logs and monitoring',
    children: [
      {
        id: 'system-logs',
        name: 'System Logs',
        icon: <ClipboardListIcon />,
        href: '/admin/dashboard/logs',
        level: 2,
        parentId: 'logs-monitoring',
        description: 'View system logs'
      },
      {
        id: 'error-logs',
        name: 'Error Logs',
        icon: '⚠️',
        href: '/admin/dashboard/logs/errors',
        level: 2,
        parentId: 'logs-monitoring',
        badge: 3,
        description: 'System error logs'
      },
      {
        id: 'audit-logs',
        name: 'Audit Logs',
        icon: '🔍',
        href: '/admin/dashboard/logs/audit',
        level: 2,
        parentId: 'logs-monitoring',
        description: 'User activity audit logs'
      },
      {
        id: 'monitoring-dashboard',
        name: 'Monitoring Dashboard',
        icon: <ChartBarIcon />,
        href: '/admin/dashboard/monitoring',
        level: 2,
        parentId: 'logs-monitoring',
        description: 'Real-time system monitoring'
      }
    ]
  }
];

// Regular User Navigation Menu
export const getNavigationMenu = (): MenuItem[] => [
  {
    id: 'dashboard',
    name: 'Dashboard',
    icon: <DashboardIcon />,
    href: ROUTES.DASHBOARD.ROOT,
    level: 1,
    isActive: true,
    description: 'Main dashboard overview'
  },
  {
    id: 'question-bank',
    name: 'Question Bank',
    icon: <DocumentTextIcon />,
    level: 1,
    badge: 'New',
    description: 'Manage your question collections',
    children: [
      {
        id: 'qb-overview',
        name: 'Overview',
        icon: <ClipboardListIcon />,
        href: ROUTES.QUESTION_BANK.ROOT,
        level: 2,
        parentId: 'question-bank',
        description: 'Question bank overview'
      },
      {
        id: 'qb-categories',
        name: 'Categories',
        icon: <TagIcon />,
        level: 2,
        parentId: 'question-bank',
        description: 'Organize questions by categories',
        children: [
          {
            id: 'qb-cat-math',
            name: 'Mathematics',
            icon: <CalculatorIcon />,
            href: ROUTES.QUESTION_BANK.CATEGORIES.MATHEMATICS,
            level: 3,
            parentId: 'question-bank',
            subParentId: 'qb-categories',
            badge: 45
          },
          {
            id: 'qb-cat-science',
            name: 'Science',
            icon: <BeakerIcon />,
            href: ROUTES.QUESTION_BANK.CATEGORIES.SCIENCE,
            level: 3,
            parentId: 'question-bank',
            subParentId: 'qb-categories',
            badge: 32
          },
          {
            id: 'qb-cat-english',
            name: 'English',
            icon: <BookOpenIcon />,
            href: ROUTES.QUESTION_BANK.CATEGORIES.ENGLISH,
            level: 3,
            parentId: 'question-bank',
            subParentId: 'qb-categories',
            badge: 28
          },
          {
            id: 'qb-cat-history',
            name: 'History',
            icon: <BuildingIcon />,
            href: ROUTES.QUESTION_BANK.CATEGORIES.HISTORY,
            level: 3,
            parentId: 'question-bank',
            subParentId: 'qb-categories',
            badge: 15
          }
        ]
      },
      {
        id: 'qb-difficulty',
        name: 'Difficulty Levels',
        icon: <ChartBarIcon />,
        level: 2,
        parentId: 'question-bank',
        description: 'Questions sorted by difficulty',
        children: [
          {
            id: 'qb-easy',
            name: 'Easy',
            icon: <CircleIcon color="#10B981" />,
            href: ROUTES.QUESTION_BANK.DIFFICULTY.EASY,
            level: 3,
            parentId: 'question-bank',
            subParentId: 'qb-difficulty'
          },
          {
            id: 'qb-medium',
            name: 'Medium',
            icon: <CircleIcon color="#F59E0B" />,
            href: ROUTES.QUESTION_BANK.DIFFICULTY.MEDIUM,
            level: 3,
            parentId: 'question-bank',
            subParentId: 'qb-difficulty'
          },
          {
            id: 'qb-hard',
            name: 'Hard',
            icon: <CircleIcon color="#EF4444" />,
            href: ROUTES.QUESTION_BANK.DIFFICULTY.HARD,
            level: 3,
            parentId: 'question-bank',
            subParentId: 'qb-difficulty'
          }
        ]
      },
      {
        id: 'qb-import',
        name: 'Import/Export',
        icon: <ArrowUpTrayIcon />,
        href: ROUTES.QUESTION_BANK.IMPORT_EXPORT,
        level: 2,
        parentId: 'question-bank',
        description: 'Import or export questions'
      }
    ]
  },
  {
    id: 'examinations',
    name: 'Examinations',
    icon: <ClipboardListIcon />,
    level: 1,
    badge: 12,
    description: 'Create and manage exams',
    children: [
      {
        id: 'exam-create',
        name: 'Create Exam',
        icon: <PlusIcon />,
        href: ROUTES.EXAMINATIONS.CREATE,
        level: 2,
        parentId: 'examinations',
        description: 'Create a new examination'
      },
      {
        id: 'exam-templates',
        name: 'Templates',
        icon: <DocumentDuplicateIcon />,
        level: 2,
        parentId: 'examinations',
        description: 'Exam templates and formats',
        children: [
          {
            id: 'template-multiple-choice',
            name: 'Multiple Choice',
            icon: <CheckSquareIcon />,
            href: ROUTES.EXAMINATIONS.TEMPLATES.MULTIPLE_CHOICE,
            level: 3,
            parentId: 'examinations',
            subParentId: 'exam-templates'
          },
          {
            id: 'template-essay',
            name: 'Essay Type',
            icon: <DocumentTextIcon />,
            href: ROUTES.EXAMINATIONS.TEMPLATES.ESSAY,
            level: 3,
            parentId: 'examinations',
            subParentId: 'exam-templates'
          },
          {
            id: 'template-mixed',
            name: 'Mixed Format',
            icon: <ShuffleIcon />,
            href: ROUTES.EXAMINATIONS.TEMPLATES.MIXED,
            level: 3,
            parentId: 'examinations',
            subParentId: 'exam-templates'
          }
        ]
      },
      {
        id: 'exam-schedule',
        name: 'Schedule',
        icon: <CalendarIcon />,
        href: ROUTES.EXAMINATIONS.SCHEDULE.ROOT,
        level: 2,
        parentId: 'examinations',
        description: 'Schedule examinations'
      },
      {
        id: 'exam-results',
        name: 'Results',
        icon: <ChartBarIcon />,
        level: 2,
        parentId: 'examinations',
        description: 'View and analyze exam results',
        children: [
          {
            id: 'results-overview',
            name: 'Overview',
            icon: <TrendingUpIcon />,
            href: ROUTES.EXAMINATIONS.RESULTS.OVERVIEW,
            level: 3,
            parentId: 'examinations',
            subParentId: 'exam-results'
          },
          {
            id: 'results-analytics',
            name: 'Analytics',
            icon: <ChartBarIcon />,
            href: ROUTES.EXAMINATIONS.RESULTS.ANALYTICS,
            level: 3,
            parentId: 'examinations',
            subParentId: 'exam-results'
          },
          {
            id: 'results-export',
            name: 'Export Data',
            icon: <ArrowUpTrayIcon />,
            href: ROUTES.EXAMINATIONS.RESULTS.EXPORT,
            level: 3,
            parentId: 'examinations',
            subParentId: 'exam-results'
          }
        ]
      }
    ]
  },
  {
    id: 'students',
    name: 'Students',
    icon: <UsersIcon />,
    level: 1,
    description: 'Manage student information',
    children: [
      {
        id: 'student-list',
        name: 'All Students',
        icon: <ClipboardListIcon />,
        href: ROUTES.STUDENTS.ROOT,
        level: 2,
        parentId: 'students',
        description: 'View all students'
      },
      {
        id: 'student-groups',
        name: 'Groups & Classes',
        icon: <UserGroupIcon />,
        level: 2,
        parentId: 'students',
        description: 'Organize students into groups',
        children: [
          {
            id: 'groups-classes',
            name: 'Class Groups',
            icon: <AcademicCapIcon />,
            href: ROUTES.STUDENTS.GROUPS.CLASSES,
            level: 3,
            parentId: 'students',
            subParentId: 'student-groups'
          },
          {
            id: 'groups-custom',
            name: 'Custom Groups',
            icon: <WrenchIcon />,
            href: ROUTES.STUDENTS.GROUPS.CUSTOM,
            level: 3,
            parentId: 'students',
            subParentId: 'student-groups'
          }
        ]
      },
      {
        id: 'student-performance',
        name: 'Performance',
        icon: <TrendingUpIcon />,
        href: ROUTES.STUDENTS.PERFORMANCE.ROOT,
        level: 2,
        parentId: 'students',
        description: 'Track student performance'
      }
    ]
  },
  {
    id: 'analytics',
    name: 'Analytics',
    icon: <ChartBarIcon />,
    level: 1,
    description: 'Detailed analytics and reports',
    children: [
      {
        id: 'analytics-overview',
        name: 'Overview',
        icon: <TargetIcon />,
        href: ROUTES.ANALYTICS.ROOT,
        level: 2,
        parentId: 'analytics',
        description: 'Analytics overview'
      },
      {
        id: 'analytics-reports',
        name: 'Reports',
        icon: <ClipboardListIcon />,
        level: 2,
        parentId: 'analytics',
        description: 'Generate detailed reports',
        children: [
          {
            id: 'reports-performance',
            name: 'Performance Reports',
            icon: <ChartBarIcon />,
            href: ROUTES.ANALYTICS.REPORTS.PERFORMANCE,
            level: 3,
            parentId: 'analytics',
            subParentId: 'analytics-reports'
          },
          {
            id: 'reports-usage',
            name: 'Usage Statistics',
            icon: <TrendingUpIcon />,
            href: ROUTES.ANALYTICS.REPORTS.USAGE,
            level: 3,
            parentId: 'analytics',
            subParentId: 'analytics-reports'
          },
          {
            id: 'reports-trends',
            name: 'Trend Analysis',
            icon: <TrendingDownIcon />,
            href: ROUTES.ANALYTICS.REPORTS.TRENDS,
            level: 3,
            parentId: 'analytics',
            subParentId: 'analytics-reports'
          }
        ]
      }
    ]
  },
  {
    id: 'settings',
    name: 'Settings',
    icon: <CogIcon />,
    level: 1,
    description: 'Application settings and preferences',
    children: [
      {
        id: 'settings-general',
        name: 'General',
        icon: <WrenchIcon />,
        href: ROUTES.SETTINGS.ROOT,
        level: 2,
        parentId: 'settings',
        description: 'General application settings'
      },
      {
        id: 'settings-account',
        name: 'Account',
        icon: <UserIcon />,
        href: ROUTES.SETTINGS.ACCOUNT.ROOT,
        level: 2,
        parentId: 'settings',
        description: 'Account settings and profile'
      },
      {
        id: 'settings-notifications',
        name: 'Notifications',
        icon: <BellIcon />,
        href: ROUTES.SETTINGS.NOTIFICATIONS.ROOT,
        level: 2,
        parentId: 'settings',
        description: 'Notification preferences'
      },
      {
        id: 'settings-security',
        name: 'Security',
        icon: <LockIcon />,
        level: 2,
        parentId: 'settings',
        description: 'Security settings and permissions',
        children: [
          {
            id: 'security-password',
            name: 'Change Password',
            icon: <KeyIcon />,
            href: ROUTES.SETTINGS.SECURITY.PASSWORD,
            level: 3,
            parentId: 'settings',
            subParentId: 'settings-security'
          },
          {
            id: 'security-2fa',
            name: 'Two-Factor Auth',
            icon: <DevicePhoneMobileIcon />,
            href: ROUTES.SETTINGS.SECURITY.TWO_FACTOR,
            level: 3,
            parentId: 'settings',
            subParentId: 'settings-security'
          },
          {
            id: 'security-sessions',
            name: 'Active Sessions',
            icon: <ComputerDesktopIcon />,
            href: ROUTES.SETTINGS.SECURITY.SESSIONS,
            level: 3,
            parentId: 'settings',
            subParentId: 'settings-security'
          }
        ]
      }
    ]
  }
];

// Convenience export for backward compatibility
export const navigationMenu = getNavigationMenu();

export const defaultUserProfile: UserProfile = {
  name: 'John Doe',
  email: 'john@example.com',
  role: 'Administrator',
  status: 'online'
};

export const animationConfig: AnimationConfig = {
  duration: 300,
  easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
  stagger: 50
};

export const darkTheme: SidebarTheme = {
  background: 'bg-gray-900',
  backgroundHover: 'hover:bg-gray-800',
  backgroundActive: 'bg-blue-600',
  text: 'text-gray-300',
  textHover: 'hover:text-white',
  textActive: 'text-white',
  border: 'border-gray-700',
  accent: 'bg-blue-600',
  shadow: 'shadow-lg'
};

export const lightTheme: SidebarTheme = {
  background: 'bg-white',
  backgroundHover: 'hover:bg-gray-50',
  backgroundActive: 'bg-blue-500',
  text: 'text-gray-700',
  textHover: 'hover:text-gray-900',
  textActive: 'text-white',
  border: 'border-gray-200',
  accent: 'bg-blue-500',
  shadow: 'shadow-lg'
};