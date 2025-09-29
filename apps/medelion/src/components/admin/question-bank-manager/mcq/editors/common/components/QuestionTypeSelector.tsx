'use client';

import React from 'react';
import { useTheme } from '@/theme';
import { MCQType } from '../types';

interface QuestionTypeSelectorProps {
  selectedType: MCQType;
  onTypeChange: (type: MCQType) => void;
}

const questionTypes = [
  { 
    key: 'singleChoice' as MCQType, 
    label: 'Single Choice', 
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10"/>
        <circle cx="12" cy="12" r="3" fill="currentColor"/>
      </svg>
    )
  },
  { 
    key: 'multipleChoice' as MCQType, 
    label: 'Multiple Choice', 
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
        <path d="M9 12l2 2 4-4" strokeWidth="3"/>
      </svg>
    )
  },
  { 
    key: 'trueFalse' as MCQType, 
    label: 'True/False', 
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path d="M20 6L9 17l-5-5" strokeWidth="3"/>
      </svg>
    )
  },
  { 
    key: 'assertionReasoning' as MCQType, 
    label: 'Assertion-Reasoning', 
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path d="M8 12h8"/>
        <path d="M12 8v8"/>
        <rect x="3" y="3" width="7" height="7" rx="1"/>
        <rect x="14" y="3" width="7" height="7" rx="1"/>
        <rect x="3" y="14" width="7" height="7" rx="1"/>
        <rect x="14" y="14" width="7" height="7" rx="1"/>
      </svg>
    )
  }
];

export default function QuestionTypeSelector({ selectedType, onTypeChange }: QuestionTypeSelectorProps) {
  const { theme } = useTheme();

  return (
    <div 
      className="rounded-xl p-6 border-2"
      style={{
        backgroundColor: theme.colors.semantic.surface.primary,
        borderColor: theme.colors.semantic.border.secondary + '30'
      }}
    >
      <h2 
        className="text-lg font-semibold mb-4"
        style={{ color: theme.colors.semantic.text.primary }}
      >
        Question Type
      </h2>
      
      <div className="flex flex-wrap gap-3">
        {questionTypes.map((type) => (
          <button
            key={type.key}
            onClick={() => onTypeChange(type.key)}
            className={`px-4 py-3 rounded-lg border-2 transition-all duration-200 hover:shadow-md flex items-center space-x-3 ${
              selectedType === type.key ? 'shadow-lg scale-105' : 'hover:scale-102'
            }`}
            style={{
              backgroundColor: selectedType === type.key 
                ? theme.colors.semantic.status.info + '15'
                : theme.colors.semantic.surface.secondary + '30',
              borderColor: selectedType === type.key
                ? theme.colors.semantic.status.info
                : theme.colors.semantic.border.secondary + '40',
              color: selectedType === type.key
                ? theme.colors.semantic.status.info
                : theme.colors.semantic.text.primary
            }}
          >
            <div className="flex-shrink-0">
              {type.icon}
            </div>
            <span className="text-sm font-medium whitespace-nowrap">
              {type.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}