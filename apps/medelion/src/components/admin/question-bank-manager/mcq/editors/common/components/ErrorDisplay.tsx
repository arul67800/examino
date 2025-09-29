import React from 'react';
import { useTheme } from '@/theme';
import { FormSectionError } from '../types';

interface ErrorDisplayProps {
  errors: FormSectionError[];
  className?: string;
}

export function ErrorDisplay({ errors, className = '' }: ErrorDisplayProps) {
  const { theme } = useTheme();

  if (!errors || errors.length === 0) {
    return null;
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {errors.map((error) => (
        <div
          key={error.id}
          className={`flex items-start space-x-2 p-3 rounded-lg border ${
            error.severity === 'error' 
              ? 'border-red-200 bg-red-50' 
              : 'border-yellow-200 bg-yellow-50'
          }`}
          style={{
            borderColor: error.severity === 'error' 
              ? theme.colors.semantic.status.error + '40'
              : theme.colors.semantic.status.warning + '40',
            backgroundColor: error.severity === 'error'
              ? theme.colors.semantic.status.error + '10'
              : theme.colors.semantic.status.warning + '10'
          }}
        >
          {/* Error Icon */}
          <div className="flex-shrink-0 mt-0.5">
            {error.severity === 'error' ? (
              <svg
                className="w-4 h-4"
                style={{ color: theme.colors.semantic.status.error }}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg
                className="w-4 h-4"
                style={{ color: theme.colors.semantic.status.warning }}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </div>

          {/* Error Message */}
          <div className="flex-1">
            <p
              className="text-sm font-medium"
              style={{
                color: error.severity === 'error' 
                  ? theme.colors.semantic.status.error
                  : theme.colors.semantic.status.warning
              }}
            >
              {error.message}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}