import React, { forwardRef } from 'react';
import { useTheme } from '@/theme';
import { FormSectionError } from '../types';
import { ErrorDisplay } from './ErrorDisplay';

interface FormSectionWrapperProps {
  sectionId: string;
  title: string;
  children: React.ReactNode;
  errors?: FormSectionError[];
  isRequired?: boolean;
  className?: string;
  showTitle?: boolean;
}

export const FormSectionWrapper = forwardRef<HTMLDivElement, FormSectionWrapperProps>(
  ({ sectionId, title, children, errors = [], isRequired = false, className = '', showTitle = true }, ref) => {
    const { theme } = useTheme();
    const hasErrors = errors.some(err => err.severity === 'error');
    const hasWarnings = errors.some(err => err.severity === 'warning');

    return (
      <div
        ref={ref}
        data-section-id={sectionId}
        className={`relative transition-all duration-300 ${className}`}
      >
        {/* Section Container with Error Styling */}
        <div
          className={`rounded-xl p-6 border-2 transition-all duration-300 ${
            hasErrors 
              ? 'border-red-300 bg-red-50/30 shadow-red-100' 
              : hasWarnings
              ? 'border-yellow-300 bg-yellow-50/30 shadow-yellow-100'
              : 'border-gray-200 bg-white'
          }`}
          style={{
            borderColor: hasErrors 
              ? theme.colors.semantic.status.error + '60'
              : hasWarnings
              ? theme.colors.semantic.status.warning + '60'
              : theme.colors.semantic.border.secondary + '40',
            backgroundColor: hasErrors
              ? theme.colors.semantic.status.error + '05'
              : hasWarnings
              ? theme.colors.semantic.status.warning + '05'
              : theme.colors.semantic.surface.primary,
            boxShadow: hasErrors
              ? `0 4px 12px ${theme.colors.semantic.status.error}15`
              : hasWarnings
              ? `0 4px 12px ${theme.colors.semantic.status.warning}15`
              : `0 2px 8px ${theme.colors.semantic.surface.secondary}20`
          }}
        >
          {/* Section Title */}
          {showTitle && (
            <div className="flex items-center justify-between mb-4">
              <h3
                className="text-lg font-semibold flex items-center space-x-2"
                style={{ color: theme.colors.semantic.text.primary }}
              >
                <span>{title}</span>
                {isRequired && (
                  <span
                    className="text-sm"
                    style={{ color: theme.colors.semantic.status.error }}
                  >
                    *
                  </span>
                )}
              </h3>
              
              {/* Error/Warning Count Badge */}
              {errors.length > 0 && (
                <div
                  className="flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium"
                  style={{
                    backgroundColor: hasErrors 
                      ? theme.colors.semantic.status.error + '20'
                      : theme.colors.semantic.status.warning + '20',
                    color: hasErrors 
                      ? theme.colors.semantic.status.error
                      : theme.colors.semantic.status.warning
                  }}
                >
                  <span>{errors.length}</span>
                  <span>{errors.length === 1 ? 'issue' : 'issues'}</span>
                </div>
              )}
            </div>
          )}

          {/* Section Content */}
          <div className="space-y-4">
            {children}
          </div>

          {/* Error Display */}
          {errors.length > 0 && (
            <div className="mt-4 pt-4 border-t" style={{ borderColor: theme.colors.semantic.border.secondary + '30' }}>
              <ErrorDisplay errors={errors} />
            </div>
          )}
        </div>

        {/* Error Pulse Animation */}
        {hasErrors && (
          <div
            className="absolute inset-0 rounded-xl pointer-events-none animate-pulse"
            style={{
              border: `2px solid ${theme.colors.semantic.status.error}20`,
              animation: 'errorPulse 2s ease-in-out infinite'
            }}
          />
        )}

        <style jsx>{`
          @keyframes errorPulse {
            0%, 100% { 
              opacity: 0;
              transform: scale(1);
            }
            50% { 
              opacity: 1;
              transform: scale(1.02);
            }
          }
        `}</style>
      </div>
    );
  }
);