import React from 'react';

// Base icon component for consistent styling
const IconWrapper = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`w-5 h-5 ${className}`}>
    {children}
  </div>
);

// Dashboard & Analytics Icons
export const DashboardIcon = () => (
  <IconWrapper>
    <svg fill="currentColor" viewBox="0 0 24 24">
      <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/>
    </svg>
  </IconWrapper>
);

export const ChartBarIcon = () => (
  <IconWrapper>
    <svg fill="currentColor" viewBox="0 0 24 24">
      <path d="M7 17h2v-7H7v7zm4 0h2V7h-2v10zm4 0h2v-4h-2v4z"/>
    </svg>
  </IconWrapper>
);

export const TrendingUpIcon = () => (
  <IconWrapper>
    <svg fill="currentColor" viewBox="0 0 24 24">
      <path d="m16 6 2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z"/>
    </svg>
  </IconWrapper>
);

export const TrendingDownIcon = () => (
  <IconWrapper>
    <svg fill="currentColor" viewBox="0 0 24 24">
      <path d="m16 18 2.29-2.29-4.88-4.88-4 4L2 7.41 3.41 6l6 6 4-4 6.3 6.29L22 12v6z"/>
    </svg>
  </IconWrapper>
);

export const TargetIcon = () => (
  <IconWrapper>
    <svg fill="currentColor" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="2" fill="none"/>
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" fill="none"/>
      <path d="m12 1 0 6m0 10 0 6M1 12l6 0m10 0 6 0"/>
    </svg>
  </IconWrapper>
);

// Question Bank Icons
export const DocumentTextIcon = () => (
  <IconWrapper>
    <svg fill="currentColor" viewBox="0 0 24 24">
      <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
    </svg>
  </IconWrapper>
);

export const ClipboardListIcon = () => (
  <IconWrapper>
    <svg fill="currentColor" viewBox="0 0 24 24">
      <path d="M19,3H14.82C14.4,1.84 13.3,1 12,1C10.7,1 9.6,1.84 9.18,3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5A2,2 0 0,0 19,3M12,3A1,1 0 0,1 13,4A1,1 0 0,1 12,5A1,1 0 0,1 11,4A1,1 0 0,1 12,3M7,7H17V9H7V7M7,11H17V13H7V11M7,15H13V17H7V15Z"/>
    </svg>
  </IconWrapper>
);

export const TagIcon = () => (
  <IconWrapper>
    <svg fill="currentColor" viewBox="0 0 24 24">
      <path d="M5.5,7A1.5,1.5 0 0,1 4,5.5A1.5,1.5 0 0,1 5.5,4A1.5,1.5 0 0,1 7,5.5A1.5,1.5 0 0,1 5.5,7M21.41,11.58L12.41,2.58C12.05,2.22 11.55,2 11,2H4C2.89,2 2,2.89 2,4V11C2,11.55 2.22,12.05 2.59,12.41L11.58,21.41C11.95,21.78 12.45,22 13,22C13.55,22 14.05,21.78 14.41,21.41L21.41,14.41C21.78,14.05 22,13.55 22,13C22,12.45 21.78,11.95 21.41,11.58Z"/>
    </svg>
  </IconWrapper>
);

// Math & Science Icons
export const CalculatorIcon = () => (
  <IconWrapper>
    <svg fill="currentColor" viewBox="0 0 24 24">
      <path d="M7,2H17A2,2 0 0,1 19,4V20A2,2 0 0,1 17,22H7A2,2 0 0,1 5,20V4A2,2 0 0,1 7,2M7,4V8H17V4H7M7,10V12H9V10H7M11,10V12H13V10H11M15,10V12H17V10H15M7,14V16H9V14H7M11,14V16H13V14H11M15,14V16H17V14H15M7,18V20H9V18H7M11,18V20H13V18H11M15,18V20H17V18H15Z"/>
    </svg>
  </IconWrapper>
);

export const BeakerIcon = () => (
  <IconWrapper>
    <svg fill="currentColor" viewBox="0 0 24 24">
      <path d="M9,2V7.38L4.25,16.38C3.82,17.14 4.37,18 5.23,18H18.77C19.63,18 20.18,17.14 19.75,16.38L15,7.38V2H13V7H11V2H9M12.5,11A0.5,0.5 0 0,1 13,11.5A0.5,0.5 0 0,1 12.5,12A0.5,0.5 0 0,1 12,11.5A0.5,0.5 0 0,1 12.5,11M8.5,13A0.5,0.5 0 0,1 9,13.5A0.5,0.5 0 0,1 8.5,14A0.5,0.5 0 0,1 8,13.5A0.5,0.5 0 0,1 8.5,13Z"/>
    </svg>
  </IconWrapper>
);

export const BookOpenIcon = () => (
  <IconWrapper>
    <svg fill="currentColor" viewBox="0 0 24 24">
      <path d="M19,2L14,6.5V17.5L19,13V2M6.5,5C4.55,5 2.45,5.4 1,6.5V21.16C1,21.41 1.25,21.66 1.5,21.66C1.6,21.66 1.65,21.59 1.75,21.59C3.1,20.94 5.05,20.68 6.5,20.68C8.45,20.68 10.55,21.1 12,22C13.35,21.15 15.8,20.68 17.5,20.68C19.15,20.68 20.85,20.94 22.25,21.59C22.35,21.64 22.4,21.66 22.5,21.66C22.75,21.66 23,21.41 23,21.16V6.5C22.4,6.05 21.75,5.75 21,5.5V19C19.9,18.65 18.7,18.5 17.5,18.5C15.8,18.5 13.35,18.9 12,19.5V8C10.55,7.1 8.45,6.5 6.5,6.5H6.5Z"/>
    </svg>
  </IconWrapper>
);

export const BuildingIcon = () => (
  <IconWrapper>
    <svg fill="currentColor" viewBox="0 0 24 24">
      <path d="M6,2V21H18V2H6M8,4H16V19H14V17H10V19H8V4M10,6V8H14V6H10M10,10V12H14V10H10M10,14V16H14V14H10Z"/>
    </svg>
  </IconWrapper>
);

// Difficulty Level Icons
export const CircleIcon = ({ color = "currentColor" }: { color?: string }) => (
  <IconWrapper>
    <svg fill={color} viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="8"/>
    </svg>
  </IconWrapper>
);

// Import/Export Icons
export const ArrowUpTrayIcon = () => (
  <IconWrapper>
    <svg fill="currentColor" viewBox="0 0 24 24">
      <path d="M9,10V16H15V10H19L12,3L5,10H9M12,18A2,2 0 0,1 10,20A2,2 0 0,1 8,18A2,2 0 0,1 10,16A2,2 0 0,1 12,18Z"/>
    </svg>
  </IconWrapper>
);

// Examination Icons
export const PlusIcon = () => (
  <IconWrapper>
    <svg fill="currentColor" viewBox="0 0 24 24">
      <path d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z"/>
    </svg>
  </IconWrapper>
);

export const DocumentDuplicateIcon = () => (
  <IconWrapper>
    <svg fill="currentColor" viewBox="0 0 24 24">
      <path d="M19,21H8V7H19M19,5H8A2,2 0 0,0 6,7V21A2,2 0 0,0 8,23H19A2,2 0 0,0 21,21V7A2,2 0 0,0 19,5M16,1H4A2,2 0 0,0 2,3V17H4V3H16V1Z"/>
    </svg>
  </IconWrapper>
);

export const CheckSquareIcon = () => (
  <IconWrapper>
    <svg fill="currentColor" viewBox="0 0 24 24">
      <path d="M10,17L5,12L6.41,10.58L10,14.17L17.59,6.58L19,8M19,3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.89 20.1,3 19,3Z"/>
    </svg>
  </IconWrapper>
);

export const ShuffleIcon = () => (
  <IconWrapper>
    <svg fill="currentColor" viewBox="0 0 24 24">
      <path d="M14.83,13.41L13.42,14.82L16.55,17.95L14.5,20H20V14.5L17.96,16.54L14.83,13.41M14.5,4L16.54,6.04L4,18.59L5.41,20L17.96,7.46L20,9.5V4M10.59,9.17L5.41,4L4,5.41L9.17,10.58L10.59,9.17Z"/>
    </svg>
  </IconWrapper>
);

export const CalendarIcon = () => (
  <IconWrapper>
    <svg fill="currentColor" viewBox="0 0 24 24">
      <path d="M19,19H5V8H19M16,1V3H8V1H6V3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.89 20.1,5 19,5H18V3M17,12H12V17H17V12Z"/>
    </svg>
  </IconWrapper>
);

// Student Icons
export const UsersIcon = () => (
  <IconWrapper>
    <svg fill="currentColor" viewBox="0 0 24 24">
      <path d="M16 4C18.2 4 20 5.8 20 8S18.2 12 16 12C15.7 12 15.4 12 15.1 11.9L17.2 14H14.7L13.2 12.5C12.5 11.9 12 11 12 10C12 7.8 13.8 6 16 6S20 7.8 20 10C20 11.1 19.6 12.1 18.9 12.8L20 14H17.5L16 12.5V4M8 4C10.2 4 12 5.8 12 8S10.2 12 8 12 4 10.2 4 8 5.8 4 8 4M8 14C10.7 14 13 15.3 13 17V20H3V17C3 15.3 5.3 14 8 14Z"/>
    </svg>
  </IconWrapper>
);

export const UserGroupIcon = () => (
  <IconWrapper>
    <svg fill="currentColor" viewBox="0 0 24 24">
      <path d="M12,5.5A3,3 0 0,1 15,2.5A3,3 0 0,1 18,5.5A3,3 0 0,1 15,8.5A3,3 0 0,1 12,5.5M5,8C5.56,8 6.08,8.15 6.53,8.42C6.38,9.85 6.8,11.27 7.66,12.38C7.16,13.34 6.16,14 5,14A3,3 0 0,1 2,11A3,3 0 0,1 5,8M19,8A3,3 0 0,1 22,11A3,3 0 0,1 19,14C17.84,14 16.84,13.34 16.34,12.38C17.2,11.27 17.62,9.85 17.47,8.42C17.92,8.15 18.44,8 19,8M5.5,18.25C5.5,16.18 8.41,14.5 12,14.5C15.59,14.5 18.5,16.18 18.5,18.25V20H5.5V18.25M0,20V18.5C0,17.11 1.89,15.94 4.45,15.6C3.86,16.28 3.5,17.22 3.5,18.25V20H0M24,20H20.5V18.25C20.5,17.22 20.14,16.28 19.55,15.6C22.11,15.94 24,17.11 24,18.5V20Z"/>
    </svg>
  </IconWrapper>
);

export const AcademicCapIcon = () => (
  <IconWrapper>
    <svg fill="currentColor" viewBox="0 0 24 24">
      <path d="M12,3L1,9L12,15L21,10.09V17H23V9M5,13.18V17.18L12,21L19,17.18V13.18L12,17L5,13.18Z"/>
    </svg>
  </IconWrapper>
);

export const WrenchIcon = () => (
  <IconWrapper>
    <svg fill="currentColor" viewBox="0 0 24 24">
      <path d="M22.7 19L13.6 9.9C14.5 7.6 14 4.9 12.1 3C10.1 1 7.1 0.6 4.7 1.7L9 6L6 9L1.6 4.7C0.4 7.1 0.9 10.1 2.9 12.1C4.8 14 7.5 14.5 9.8 13.6L18.9 22.7C19.3 23.1 19.9 23.1 20.3 22.7L22.6 20.4C23.1 20 23.1 19.3 22.7 19Z"/>
    </svg>
  </IconWrapper>
);

// Settings Icons
export const CogIcon = () => (
  <IconWrapper>
    <svg fill="currentColor" viewBox="0 0 24 24">
      <path d="M12,15.5A3.5,3.5 0 0,1 8.5,12A3.5,3.5 0 0,1 12,8.5A3.5,3.5 0 0,1 15.5,12A3.5,3.5 0 0,1 12,15.5M19.43,12.97C19.47,12.65 19.5,12.33 19.5,12C19.5,11.67 19.47,11.34 19.43,11L21.54,9.37C21.73,9.22 21.78,8.95 21.66,8.73L19.66,5.27C19.54,5.05 19.27,4.96 19.05,5.05L16.56,6.05C16.04,5.66 15.5,5.32 14.87,5.07L14.5,2.42C14.46,2.18 14.25,2 14,2H10C9.75,2 9.54,2.18 9.5,2.42L9.13,5.07C8.5,5.32 7.96,5.66 7.44,6.05L4.95,5.05C4.73,4.96 4.46,5.05 4.34,5.27L2.34,8.73C2.22,8.95 2.27,9.22 2.46,9.37L4.57,11C4.53,11.34 4.5,11.67 4.5,12C4.5,12.33 4.53,12.65 4.57,12.97L2.46,14.63C2.27,14.78 2.22,15.05 2.34,15.27L4.34,18.73C4.46,18.95 4.73,19.03 4.95,18.95L7.44,17.94C7.96,18.34 8.5,18.68 9.13,18.93L9.5,21.58C9.54,21.82 9.75,22 10,22H14C14.25,22 14.46,21.82 14.5,21.58L14.87,18.93C15.5,18.68 16.04,18.34 16.56,17.94L19.05,18.95C19.27,19.03 19.54,18.95 19.66,18.73L21.66,15.27C21.78,15.05 21.73,14.78 21.54,14.63L19.43,12.97Z"/>
    </svg>
  </IconWrapper>
);

export const UserIcon = () => (
  <IconWrapper>
    <svg fill="currentColor" viewBox="0 0 24 24">
      <path d="M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z"/>
    </svg>
  </IconWrapper>
);

export const BellIcon = () => (
  <IconWrapper>
    <svg fill="currentColor" viewBox="0 0 24 24">
      <path d="M21,19V20H3V19L5,17V11C5,7.9 7.03,5.17 10,4.29C10,4.19 10,4.1 10,4A2,2 0 0,1 12,2A2,2 0 0,1 14,4C14,4.1 14,4.19 14,4.29C16.97,5.17 19,7.9 19,11V17L21,19M14,21A2,2 0 0,1 12,23A2,2 0 0,1 10,21"/>
    </svg>
  </IconWrapper>
);

export const LockIcon = () => (
  <IconWrapper>
    <svg fill="currentColor" viewBox="0 0 24 24">
      <path d="M12,17A2,2 0 0,0 14,15C14,13.89 13.1,13 12,13A2,2 0 0,0 10,15A2,2 0 0,0 12,17M18,8A2,2 0 0,1 20,10V20A2,2 0 0,1 18,22H6A2,2 0 0,1 4,20V10C4,8.89 4.9,8 6,8H7V6A5,5 0 0,1 12,1A5,5 0 0,1 17,6V8H18M12,3A3,3 0 0,0 9,6V8H15V6A3,3 0 0,0 12,3Z"/>
    </svg>
  </IconWrapper>
);

export const KeyIcon = () => (
  <IconWrapper>
    <svg fill="currentColor" viewBox="0 0 24 24">
      <path d="M7,14A3,3 0 0,1 10,11A3,3 0 0,1 13,14A3,3 0 0,1 10,17A3,3 0 0,1 7,14M10,12A2,2 0 0,0 8,14A2,2 0 0,0 10,16A2,2 0 0,0 12,14A2,2 0 0,0 10,12M21,9V7H15L13.5,7.5C13.09,4.04 10.18,1.5 6.5,1.5A5,5 0 0,0 1.5,6.5A5,5 0 0,0 6.5,11.5C8.28,11.5 9.91,10.81 11.09,9.6L12,9V11H14V9H16V11H18V9H21M6.5,9.5A3,3 0 0,1 3.5,6.5A3,3 0 0,1 6.5,3.5A3,3 0 0,1 9.5,6.5A3,3 0 0,1 6.5,9.5Z"/>
    </svg>
  </IconWrapper>
);

export const DevicePhoneMobileIcon = () => (
  <IconWrapper>
    <svg fill="currentColor" viewBox="0 0 24 24">
      <path d="M17,19H7V5H17M17,1H7C5.89,1 5,1.89 5,3V21A2,2 0 0,0 7,23H17A2,2 0 0,0 19,21V3C19,1.89 18.1,1 17,1Z"/>
    </svg>
  </IconWrapper>
);

export const ComputerDesktopIcon = () => (
  <IconWrapper>
    <svg fill="currentColor" viewBox="0 0 24 24">
      <path d="M21,16H3V4H21M21,2H3C1.89,2 1,2.89 1,4V16A2,2 0 0,0 3,18H10V20H8V22H16V20H14V18H21A2,2 0 0,0 23,16V4C23,2.89 22.1,2 21,2Z"/>
    </svg>
  </IconWrapper>
);