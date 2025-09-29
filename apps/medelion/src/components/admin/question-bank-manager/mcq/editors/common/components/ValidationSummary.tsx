import React from 'react';
import { useTheme } from '@/theme';
import { FormSectionError } from '../types';

interface ValidationSummaryProps {
  sections: Array<{
    id: string;
    name: string;
    isValid: boolean;
    errors: FormSectionError[];
    isRequired: boolean;
  }>;
  onSectionClick?: (sectionId: string) => void;
  className?: string;
}

export function ValidationSummary({ sections, onSectionClick, className = '' }: ValidationSummaryProps) {
  const { theme } = useTheme();
  
  const errorSections = sections.filter(section => 
    section.errors.some(err => err.severity === 'error')
  );
  const warningSections = sections.filter(section => 
    section.errors.some(err => err.severity === 'warning') && 
    !section.errors.some(err => err.severity === 'error')
  );
  
  const totalErrors = errorSections.reduce((count, section) => 
    count + section.errors.filter(err => err.severity === 'error').length, 0
  );
  const totalWarnings = warningSections.reduce((count, section) => 
    count + section.errors.filter(err => err.severity === 'warning').length, 0
  );

  if (errorSections.length === 0 && warningSections.length === 0) {
    return (
      <div
        className={`p-4 rounded-lg border ${className}`}
        style={{
          backgroundColor: theme.colors.semantic.status.success + '10',
          borderColor: theme.colors.semantic.status.success + '30'
        }}
      >
        <div className="flex items-center space-x-2">
          <svg
            className="w-5 h-5"
            style={{ color: theme.colors.semantic.status.success }}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          <span
            className="font-medium"
            style={{ color: theme.colors.semantic.status.success }}
          >
            All sections are valid
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Summary Header */}
      <div
        className="p-4 rounded-lg border"
        style={{
          backgroundColor: errorSections.length > 0 
            ? theme.colors.semantic.status.error + '10'
            : theme.colors.semantic.status.warning + '10',
          borderColor: errorSections.length > 0
            ? theme.colors.semantic.status.error + '30'
            : theme.colors.semantic.status.warning + '30'
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <svg
              className="w-5 h-5"
              style={{
                color: errorSections.length > 0 
                  ? theme.colors.semantic.status.error
                  : theme.colors.semantic.status.warning
              }}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <span
              className="font-semibold"
              style={{
                color: errorSections.length > 0 
                  ? theme.colors.semantic.status.error
                  : theme.colors.semantic.status.warning
              }}
            >
              Form Validation Issues
            </span>
          </div>
          
          <div className="flex items-center space-x-4 text-sm">
            {totalErrors > 0 && (
              <span style={{ color: theme.colors.semantic.status.error }}>
                {totalErrors} error{totalErrors !== 1 ? 's' : ''}
              </span>
            )}
            {totalWarnings > 0 && (
              <span style={{ color: theme.colors.semantic.status.warning }}>
                {totalWarnings} warning{totalWarnings !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Error Sections */}
      {errorSections.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-semibold" style={{ color: theme.colors.semantic.status.error }}>
            Sections with Errors:
          </h4>
          {errorSections.map((section) => (
            <div
              key={section.id}
              className={`p-3 rounded-lg border cursor-pointer hover:bg-opacity-80 transition-colors ${
                onSectionClick ? 'hover:shadow-md' : ''
              }`}
              style={{
                backgroundColor: theme.colors.semantic.status.error + '10',
                borderColor: theme.colors.semantic.status.error + '30'
              }}
              onClick={() => onSectionClick?.(section.id)}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium" style={{ color: theme.colors.semantic.text.primary }}>
                  {section.name}
                </span>
                <span className="text-xs" style={{ color: theme.colors.semantic.status.error }}>
                  {section.errors.filter(err => err.severity === 'error').length} error{section.errors.filter(err => err.severity === 'error').length !== 1 ? 's' : ''}
                </span>
              </div>
              <div className="mt-1 space-y-1">
                {section.errors
                  .filter(err => err.severity === 'error')
                  .map((error) => (
                    <p
                      key={error.id}
                      className="text-xs"
                      style={{ color: theme.colors.semantic.text.secondary }}
                    >
                      • {error.message}
                    </p>
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Warning Sections */}
      {warningSections.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-semibold" style={{ color: theme.colors.semantic.status.warning }}>
            Sections with Warnings:
          </h4>
          {warningSections.map((section) => (
            <div
              key={section.id}
              className={`p-3 rounded-lg border cursor-pointer hover:bg-opacity-80 transition-colors ${
                onSectionClick ? 'hover:shadow-md' : ''
              }`}
              style={{
                backgroundColor: theme.colors.semantic.status.warning + '10',
                borderColor: theme.colors.semantic.status.warning + '30'
              }}
              onClick={() => onSectionClick?.(section.id)}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium" style={{ color: theme.colors.semantic.text.primary }}>
                  {section.name}
                </span>
                <span className="text-xs" style={{ color: theme.colors.semantic.status.warning }}>
                  {section.errors.filter(err => err.severity === 'warning').length} warning{section.errors.filter(err => err.severity === 'warning').length !== 1 ? 's' : ''}
                </span>
              </div>
              <div className="mt-1 space-y-1">
                {section.errors
                  .filter(err => err.severity === 'warning')
                  .map((error) => (
                    <p
                      key={error.id}
                      className="text-xs"
                      style={{ color: theme.colors.semantic.text.secondary }}
                    >
                      • {error.message}
                    </p>
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}