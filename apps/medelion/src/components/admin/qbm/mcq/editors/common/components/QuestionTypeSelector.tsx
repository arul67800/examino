'use client';

import React from 'react';
import { useTheme } from '@/theme';
import { MCQViewIcons } from '../../../../hierarchy';
import { MCQType } from '../types';

interface QuestionTypeSelectorProps {
  selectedType: MCQType;
  onTypeChange: (type: MCQType) => void;
}

const questionTypes = [
  { key: 'singleChoice' as MCQType, label: 'Single Choice', icon: <MCQViewIcons.Question size={16} /> },
  { key: 'multipleChoice' as MCQType, label: 'Multiple Choice', icon: <MCQViewIcons.Checklist size={16} /> },
  { key: 'trueFalse' as MCQType, label: 'True/False', icon: <MCQViewIcons.Question size={16} /> },
  { key: 'assertionReasoning' as MCQType, label: 'Assertion-Reasoning', icon: <MCQViewIcons.Question size={16} /> }
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
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {questionTypes.map((type) => (
          <button
            key={type.key}
            onClick={() => onTypeChange(type.key)}
            className={`p-4 rounded-xl border-2 transition-all duration-200 hover:shadow-md ${
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
            <div className="flex flex-col items-center space-y-2">
              <div className="flex-shrink-0">
                {type.icon}
              </div>
              <span className="text-sm font-medium text-center">
                {type.label}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}