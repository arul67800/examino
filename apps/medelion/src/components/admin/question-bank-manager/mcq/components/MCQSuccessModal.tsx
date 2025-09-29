'use client';

import React from 'react';
import { useTheme } from '@/theme';

interface DebugInfo {
  questionType?: string;
  questionLength?: number;
  optionsCount?: number;
  difficulty?: string;
  points?: number;
  timeLimit?: number;
  tags?: string[];
  hierarchyItemId?: string;
  humanId?: string;
  createdAt?: string;
  apiResponse?: any;
  conversionSteps?: string[];
  graphqlVariables?: any;
  validationResults?: string[];
}

export type { DebugInfo };

interface MCQSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message: string;
  questionId?: string;
  humanId?: string;
  debugInfo?: DebugInfo;
  showDebugDetails?: boolean;
}

export default function MCQSuccessModal({
  isOpen,
  onClose,
  title = "MCQ Operation Successful",
  message,
  questionId,
  humanId,
  debugInfo,
  showDebugDetails = true
}: MCQSuccessModalProps) {
  const { theme } = useTheme();
  const [showFullDebug, setShowFullDebug] = React.useState(false);

  if (!isOpen) return null;

  const formatDebugValue = (value: any): string => {
    if (value === null || value === undefined) return 'null';
    if (typeof value === 'object') return JSON.stringify(value, null, 2);
    return String(value);
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}
    >
      <div className="flex items-center justify-center min-h-screen p-4">
        <div
          className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-xl shadow-2xl"
          style={{
            backgroundColor: theme.colors.semantic.surface.primary,
            border: `2px solid ${theme.colors.semantic.status.success}30`
          }}
        >
          {/* Header */}
          <div
            className="px-6 py-4 border-b"
            style={{
              borderBottomColor: theme.colors.semantic.border.secondary + '30',
              backgroundColor: theme.colors.semantic.status.success + '10'
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: theme.colors.semantic.status.success }}
                >
                  <svg 
                    className="w-5 h-5 text-white" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M5 13l4 4L19 7" 
                    />
                  </svg>
                </div>
                <h2
                  className="text-xl font-semibold"
                  style={{ color: theme.colors.semantic.text.primary }}
                >
                  {title}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                style={{ color: theme.colors.semantic.text.secondary }}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
            <div className="p-6 space-y-6">
              {/* Success Message */}
              <div className="text-center">
                <p
                  className="text-lg mb-2"
                  style={{ color: theme.colors.semantic.text.primary }}
                >
                  {message}
                </p>
                
                {humanId && (
                  <div
                    className="inline-block px-4 py-2 rounded-lg text-sm font-mono"
                    style={{
                      backgroundColor: theme.colors.semantic.status.success + '20',
                      color: theme.colors.semantic.status.success
                    }}
                  >
                    Question ID: {humanId}
                  </div>
                )}
              </div>

              {/* Quick Stats */}
              {debugInfo && (
                <div
                  className="rounded-lg p-4"
                  style={{
                    backgroundColor: theme.colors.semantic.surface.secondary,
                    border: `1px solid ${theme.colors.semantic.border.secondary}30`
                  }}
                >
                  <h3
                    className="text-sm font-semibold mb-3"
                    style={{ color: theme.colors.semantic.text.primary }}
                  >
                    Question Summary
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {debugInfo.questionType && (
                      <div>
                        <span className="font-medium" style={{ color: theme.colors.semantic.text.secondary }}>
                          Type:
                        </span>
                        <span className="ml-2" style={{ color: theme.colors.semantic.text.primary }}>
                          {debugInfo.questionType}
                        </span>
                      </div>
                    )}
                    {debugInfo.difficulty && (
                      <div>
                        <span className="font-medium" style={{ color: theme.colors.semantic.text.secondary }}>
                          Difficulty:
                        </span>
                        <span className="ml-2" style={{ color: theme.colors.semantic.text.primary }}>
                          {debugInfo.difficulty}
                        </span>
                      </div>
                    )}
                    {debugInfo.optionsCount !== undefined && (
                      <div>
                        <span className="font-medium" style={{ color: theme.colors.semantic.text.secondary }}>
                          Options:
                        </span>
                        <span className="ml-2" style={{ color: theme.colors.semantic.text.primary }}>
                          {debugInfo.optionsCount}
                        </span>
                      </div>
                    )}
                    {debugInfo.points && (
                      <div>
                        <span className="font-medium" style={{ color: theme.colors.semantic.text.secondary }}>
                          Points:
                        </span>
                        <span className="ml-2" style={{ color: theme.colors.semantic.text.primary }}>
                          {debugInfo.points}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Debug Information Toggle */}
              {showDebugDetails && debugInfo && (
                <div>
                  <button
                    onClick={() => setShowFullDebug(!showFullDebug)}
                    className="flex items-center space-x-2 text-sm font-medium transition-colors"
                    style={{ 
                      color: showFullDebug 
                        ? theme.colors.semantic.status.info 
                        : theme.colors.semantic.text.secondary 
                    }}
                  >
                    <svg 
                      className={`w-4 h-4 transition-transform ${showFullDebug ? 'rotate-90' : ''}`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    <span>{showFullDebug ? 'Hide' : 'Show'} Debug Details</span>
                  </button>

                  {showFullDebug && (
                    <div
                      className="mt-3 p-4 rounded-lg border"
                      style={{
                        backgroundColor: theme.colors.semantic.surface.primary,
                        borderColor: theme.colors.semantic.border.secondary + '30'
                      }}
                    >
                      <div className="space-y-4 text-xs">
                        {/* Validation Results */}
                        {debugInfo.validationResults && debugInfo.validationResults.length > 0 && (
                          <div>
                            <h4 className="font-semibold mb-2" style={{ color: theme.colors.semantic.text.primary }}>
                              Validation Results:
                            </h4>
                            <ul className="list-disc pl-4 space-y-1">
                              {debugInfo.validationResults.map((result, idx) => (
                                <li key={idx} style={{ color: theme.colors.semantic.text.secondary }}>
                                  {result}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Conversion Steps */}
                        {debugInfo.conversionSteps && debugInfo.conversionSteps.length > 0 && (
                          <div>
                            <h4 className="font-semibold mb-2" style={{ color: theme.colors.semantic.text.primary }}>
                              Data Conversion Steps:
                            </h4>
                            <ol className="list-decimal pl-4 space-y-1">
                              {debugInfo.conversionSteps.map((step, idx) => (
                                <li key={idx} style={{ color: theme.colors.semantic.text.secondary }}>
                                  {step}
                                </li>
                              ))}
                            </ol>
                          </div>
                        )}

                        {/* API Variables */}
                        {debugInfo.graphqlVariables && (
                          <div>
                            <h4 className="font-semibold mb-2" style={{ color: theme.colors.semantic.text.primary }}>
                              GraphQL Variables:
                            </h4>
                            <pre
                              className="p-3 rounded text-xs overflow-x-auto"
                              style={{
                                backgroundColor: theme.colors.semantic.surface.secondary,
                                color: theme.colors.semantic.text.secondary
                              }}
                            >
                              {formatDebugValue(debugInfo.graphqlVariables)}
                            </pre>
                          </div>
                        )}

                        {/* API Response */}
                        {debugInfo.apiResponse && (
                          <div>
                            <h4 className="font-semibold mb-2" style={{ color: theme.colors.semantic.text.primary }}>
                              API Response:
                            </h4>
                            <pre
                              className="p-3 rounded text-xs overflow-x-auto"
                              style={{
                                backgroundColor: theme.colors.semantic.surface.secondary,
                                color: theme.colors.semantic.text.secondary
                              }}
                            >
                              {formatDebugValue(debugInfo.apiResponse)}
                            </pre>
                          </div>
                        )}

                        {/* Technical Details */}
                        <div>
                          <h4 className="font-semibold mb-2" style={{ color: theme.colors.semantic.text.primary }}>
                            Technical Details:
                          </h4>
                          <div className="grid grid-cols-1 gap-2">
                            {Object.entries(debugInfo)
                              .filter(([key]) => !['conversionSteps', 'graphqlVariables', 'apiResponse', 'validationResults'].includes(key))
                              .map(([key, value]) => (
                              <div key={key} className="flex">
                                <span className="font-medium w-32" style={{ color: theme.colors.semantic.text.secondary }}>
                                  {key}:
                                </span>
                                <span className="flex-1 font-mono" style={{ color: theme.colors.semantic.text.primary }}>
                                  {formatDebugValue(value)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div
            className="px-6 py-4 border-t flex justify-end"
            style={{ borderTopColor: theme.colors.semantic.border.secondary + '30' }}
          >
            <button
              onClick={onClose}
              className="px-6 py-2 rounded-lg font-medium transition-colors"
              style={{
                backgroundColor: theme.colors.semantic.status.success,
                color: 'white'
              }}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Hook for using the MCQ Success Modal
export function useMCQSuccessModal() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [modalData, setModalData] = React.useState<{
    title?: string;
    message: string;
    questionId?: string;
    humanId?: string;
    debugInfo?: DebugInfo;
  } | null>(null);

  const showSuccess = (data: {
    title?: string;
    message: string;
    questionId?: string;
    humanId?: string;
    debugInfo?: DebugInfo;
  }) => {
    setModalData(data);
    setIsOpen(true);
  };

  const close = () => {
    setIsOpen(false);
    setModalData(null);
  };

  return {
    isOpen,
    modalData,
    showSuccess,
    close
  };
}