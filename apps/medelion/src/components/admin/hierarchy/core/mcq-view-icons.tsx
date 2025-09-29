'use client';

import React from 'react';

interface MCQViewIconProps {
  className?: string;
  size?: number;
  color?: string;
}

export const InlineViewIcon: React.FC<MCQViewIconProps> = ({ 
  className = "", 
  size = 20, 
  color = "currentColor" 
}) => (
  <svg 
    className={className}
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    {/* Document with lines representing inline editing */}
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14,2 14,8 20,8"/>
    {/* Horizontal lines representing text/questions */}
    <line x1="8" y1="13" x2="16" y2="13"/>
    <line x1="8" y1="16" x2="14" y2="16"/>
    <line x1="8" y1="19" x2="12" y2="19"/>
    {/* Edit indicator - small pen icon */}
    <circle cx="18" cy="18" r="2"/>
    <path d="m16 20 2-2"/>
  </svg>
);

export const ModalViewIcon: React.FC<MCQViewIconProps> = ({ 
  className = "", 
  size = 20, 
  color = "currentColor" 
}) => (
  <svg 
    className={className}
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    {/* Outer frame representing screen/background */}
    <rect x="2" y="2" width="20" height="20" rx="2" ry="2" opacity="0.3"/>
    {/* Modal window */}
    <rect x="6" y="6" width="12" height="12" rx="1" ry="1" fill="none"/>
    {/* Content lines inside modal */}
    <line x1="8" y1="9" x2="16" y2="9"/>
    <line x1="8" y1="12" x2="14" y2="12"/>
    <line x1="8" y1="15" x2="12" y2="15"/>
    {/* Close button */}
    <line x1="15" y1="7" x2="17" y2="9"/>
    <line x1="17" y1="7" x2="15" y2="9"/>
  </svg>
);

export const PageViewIcon: React.FC<MCQViewIconProps> = ({ 
  className = "", 
  size = 20, 
  color = "currentColor" 
}) => (
  <svg 
    className={className}
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    {/* Browser/page window */}
    <rect x="3" y="4" width="18" height="16" rx="2" ry="2"/>
    {/* Browser header bar */}
    <line x1="3" y1="8" x2="21" y2="8"/>
    {/* Navigation dots */}
    <circle cx="6" cy="6" r="0.5" fill={color}/>
    <circle cx="8" cy="6" r="0.5" fill={color}/>
    <circle cx="10" cy="6" r="0.5" fill={color}/>
    {/* Page content lines */}
    <line x1="6" y1="12" x2="18" y2="12"/>
    <line x1="6" y1="15" x2="16" y2="15"/>
    <line x1="6" y1="18" x2="14" y2="18"/>
    {/* External link indicator */}
    <path d="M15 3h6v6M21 3l-7 7" strokeWidth="1.5"/>
  </svg>
);

export const EditIcon: React.FC<MCQViewIconProps> = ({ 
  className = "", 
  size = 16, 
  color = "currentColor" 
}) => (
  <svg 
    className={className}
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="m18.5 2.5 a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4Z"/>
  </svg>
);

export const QuestionIcon: React.FC<MCQViewIconProps> = ({ 
  className = "", 
  size = 20, 
  color = "currentColor" 
}) => (
  <svg 
    className={className}
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    {/* Question mark in circle */}
    <circle cx="12" cy="12" r="10"/>
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
    <circle cx="12" cy="17" r="1" fill={color}/>
  </svg>
);

export const ChecklistIcon: React.FC<MCQViewIconProps> = ({ 
  className = "", 
  size = 20, 
  color = "currentColor" 
}) => (
  <svg 
    className={className}
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    {/* Clipboard/checklist */}
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
    <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
    {/* Checkboxes */}
    <path d="M9 12l2 2 4-4"/>
    <path d="M9 17h6"/>
  </svg>
);

// Export all icons as a convenient object
export const MCQViewIcons = {
  Inline: InlineViewIcon,
  Modal: ModalViewIcon,
  Page: PageViewIcon,
  Edit: EditIcon,
  Question: QuestionIcon,
  Checklist: ChecklistIcon
};