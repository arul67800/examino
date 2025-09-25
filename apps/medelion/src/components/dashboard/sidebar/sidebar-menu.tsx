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