'use client';

import React, { useState } from 'react';
import { useTheme } from '@/theme';
import { MCQType, MCQOption, FormValidationErrors } from '../types';
import AnswerOptionExplanation from './AnswerOptionExplanation';

interface AnswerOptionsProps {
  questionType: MCQType;
  options?: MCQOption[];
  assertionReasoningOptions?: MCQOption[];
  errors: FormValidationErrors;
  onOptionsChange: (options: MCQOption[]) => void;
  onAssertionReasoningOptionsChange: (options: MCQOption[]) => void;
  onAddOption: () => void;
  onRemoveOption: (optionId: string) => void;
}

export default function AnswerOptions({
  questionType,
  options = [],
  assertionReasoningOptions = [],
  errors,
  onOptionsChange,
  onAssertionReasoningOptionsChange,
  onAddOption,
  onRemoveOption
}: AnswerOptionsProps) {
  const { theme } = useTheme();
  const [activeExplanationId, setActiveExplanationId] = useState<string | null>(null);

  const handleOptionTextChange = (optionId: string, text: string) => {
    const updatedOptions = options.map(opt => 
      opt.id === optionId ? { ...opt, text } : opt
    );
    onOptionsChange(updatedOptions);
  };

  const handleExplanationChange = (optionId: string, explanation: string) => {
    const updatedOptions = options.map(opt => 
      opt.id === optionId ? { ...opt, explanation } : opt
    );
    onOptionsChange(updatedOptions);
  };

  const handleReferencesChange = (optionId: string, references: string) => {
    const updatedOptions = options.map(opt => 
      opt.id === optionId ? { ...opt, references } : opt
    );
    onOptionsChange(updatedOptions);
  };

  const handleCorrectAnswerChange = (optionId: string) => {
    if (questionType === 'singleChoice' || questionType === 'trueFalse') {
      // Single selection
      const updatedOptions = options.map(opt => ({
        ...opt,
        isCorrect: opt.id === optionId
      }));
      onOptionsChange(updatedOptions);
    } else if (questionType === 'multipleChoice') {
      // Multiple selection
      const updatedOptions = options.map(opt => 
        opt.id === optionId ? { ...opt, isCorrect: !opt.isCorrect } : opt
      );
      onOptionsChange(updatedOptions);
    }
  };

  const handleAssertionReasoningSelection = (optionId: string) => {
    const updatedOptions = assertionReasoningOptions.map(opt => ({
      ...opt,
      isCorrect: opt.id === optionId
    }));
    onAssertionReasoningOptionsChange(updatedOptions);
  };

  if (questionType === 'assertionReasoning') {
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
          Select Correct Answer *
        </h2>
        
        <div className="space-y-3">
          {assertionReasoningOptions.map((option) => (
            <div
              key={option.id}
              className={`p-3 rounded-lg transition-all cursor-pointer ${
                option.isCorrect ? 'shadow-md' : 'hover:shadow-sm'
              }`}
              style={{
                backgroundColor: option.isCorrect
                  ? theme.colors.semantic.status.success + '20'
                  : theme.colors.semantic.surface.secondary + '30',
                border: option.isCorrect
                  ? `1px solid ${theme.colors.semantic.status.success}40`
                  : `1px solid ${theme.colors.semantic.border.secondary}30`
              }}
              onClick={() => handleAssertionReasoningSelection(option.id)}
            >
              <div className="flex items-center space-x-3">
                <div
                  className="w-5 h-5 rounded flex items-center justify-center"
                  style={{
                    border: option.isCorrect 
                      ? `2px solid ${theme.colors.semantic.status.success}`
                      : `2px solid ${theme.colors.semantic.border.secondary}`,
                    backgroundColor: option.isCorrect 
                      ? theme.colors.semantic.status.success 
                      : 'transparent'
                  }}
                >
                  {option.isCorrect && (
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <span 
                  className="font-medium"
                  style={{ color: theme.colors.semantic.text.primary }}
                >
                  {option.text}
                </span>
              </div>
            </div>
          ))}
        </div>

        {(errors.options || errors.correctAnswer) && (
          <div className="mt-2 space-y-1">
            {errors.options && (
              <p className="text-xs" style={{ color: theme.colors.semantic.status.error }}>
                {errors.options}
              </p>
            )}
            {errors.correctAnswer && (
              <p className="text-xs" style={{ color: theme.colors.semantic.status.error }}>
                {errors.correctAnswer}
              </p>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div 
      className="rounded-xl p-6 border-2"
      style={{
        backgroundColor: theme.colors.semantic.surface.primary,
        borderColor: theme.colors.semantic.border.secondary + '30'
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <h2 
          className="text-lg font-semibold"
          style={{ color: theme.colors.semantic.text.primary }}
        >
          Answer Options *
        </h2>
        
        {questionType !== 'trueFalse' && options.length < 6 && (
          <button
            onClick={onAddOption}
            className="px-3 py-1 rounded-lg text-sm font-medium transition-all duration-200 hover:shadow-sm flex items-center space-x-1"
            style={{
              backgroundColor: theme.colors.semantic.status.info + '15',
              border: `1px solid ${theme.colors.semantic.status.info}40`,
              color: theme.colors.semantic.status.info
            }}
          >
            <span>+</span>
            <span>Add Option</span>
          </button>
        )}
      </div>
      
      {/* True/False Options */}
      {questionType === 'trueFalse' ? (
        <div className="space-y-4">
          <p className="text-sm" style={{ color: theme.colors.semantic.text.secondary }}>
            Select the correct answer:
          </p>
          <div className="space-y-4">
            {[
              { id: '1', label: 'True', value: 'True' },
              { id: '2', label: 'False', value: 'False' }
            ].map((staticOption) => {
              const optionData = options.find(opt => opt.id === staticOption.id);
              const isSelected = optionData?.isCorrect || false;
              return (
                <div key={staticOption.id} className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => handleCorrectAnswerChange(staticOption.id)}
                      className={`flex-1 px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-200 ${
                        isSelected ? 'shadow-lg' : 'hover:shadow-md'
                      }`}
                      style={{
                        backgroundColor: isSelected
                          ? theme.colors.semantic.status.success + '20'
                          : theme.colors.semantic.surface.secondary + '30',
                        border: `2px solid ${isSelected 
                          ? theme.colors.semantic.status.success 
                          : theme.colors.semantic.border.secondary + '40'
                        }`,
                        color: isSelected
                          ? theme.colors.semantic.status.success
                          : theme.colors.semantic.text.primary
                      }}
                    >
                      <div className="flex items-center space-x-3 justify-center">
                        <div 
                          className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                          style={{
                            backgroundColor: isSelected 
                              ? theme.colors.semantic.status.success
                              : theme.colors.semantic.surface.tertiary,
                            color: isSelected 
                              ? theme.colors.semantic.surface.primary
                              : theme.colors.semantic.text.secondary
                          }}
                        >
                          {staticOption.label[0]}
                        </div>
                        <span>{staticOption.label}</span>
                      </div>
                    </button>
                    
                    {/* Add Explanation Button for True/False */}
                    <button
                      onClick={() => setActiveExplanationId(activeExplanationId === staticOption.id ? null : staticOption.id)}
                      className="flex-shrink-0 p-2 rounded transition-all"
                      style={{ 
                        color: (optionData?.explanation || optionData?.references) ? theme.colors.semantic.status.success : theme.colors.semantic.status.info,
                        backgroundColor: (optionData?.explanation || optionData?.references) ? theme.colors.semantic.status.success + '10' : 'transparent'
                      }}
                      title={(optionData?.explanation || optionData?.references) ? "Edit explanation/references" : "Add explanation/references"}
                    >
                      <span className="text-sm font-semibold">E</span>
                    </button>
                  </div>
                  
                  {/* Option Explanation Component for True/False */}
                  {activeExplanationId === staticOption.id && (
                    <AnswerOptionExplanation
                      optionId={staticOption.id}
                      explanation={optionData?.explanation}
                      references={optionData?.references}
                      onExplanationChange={handleExplanationChange}
                      onReferencesChange={handleReferencesChange}
                      onClose={() => setActiveExplanationId(null)}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Regular Options */
        <div className="space-y-3">
          {options.map((option, index) => (
            <div key={option.id}>
              <div
                className="flex items-center space-x-3 p-3 rounded-lg"
                style={{
                  backgroundColor: theme.colors.semantic.surface.secondary + '30',
                  border: `1px solid ${theme.colors.semantic.border.secondary}30`
                }}
              >
                {/* Correct Answer Checkbox */}
                <div className="flex-shrink-0">
                  <input
                    type={questionType === 'singleChoice' ? 'radio' : 'checkbox'}
                    name="correctAnswer"
                    checked={option.isCorrect}
                    onChange={() => handleCorrectAnswerChange(option.id)}
                    className="h-4 w-4 rounded transition-all"
                    style={{
                      accentColor: theme.colors.semantic.status.success
                    }}
                  />
                </div>
                
                {/* Option Label */}
                <div 
                  className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold"
                  style={{
                    backgroundColor: theme.colors.semantic.status.info + '20',
                    color: theme.colors.semantic.status.info
                  }}
                >
                  {String.fromCharCode(65 + index)}
                </div>
                
                {/* Option Text Input */}
                <input
                  type="text"
                  value={option.text}
                  onChange={(e) => handleOptionTextChange(option.id, e.target.value)}
                  placeholder={`Option ${String.fromCharCode(65 + index)}`}
                  className="flex-1 p-2 rounded focus:ring-2 focus:ring-offset-1 transition-all"
                  style={{
                    backgroundColor: theme.colors.semantic.surface.primary,
                    border: `1px solid ${theme.colors.semantic.border.secondary}40`,
                    color: theme.colors.semantic.text.primary
                  }}
                />
                
                {/* Add Explanation Button */}
                <button
                  onClick={() => setActiveExplanationId(activeExplanationId === option.id ? null : option.id)}
                  className="flex-shrink-0 p-1 rounded transition-all"
                  style={{ 
                    color: (option.explanation || option.references) ? theme.colors.semantic.status.success : theme.colors.semantic.status.info,
                    backgroundColor: (option.explanation || option.references) ? theme.colors.semantic.status.success + '10' : 'transparent'
                  }}
                  title={(option.explanation || option.references) ? "Edit explanation/references" : "Add explanation/references"}
                >
                  <span className="text-sm font-semibold">E</span>
                </button>
                
                {/* Add Option Button */}
                {options.length < 6 && (
                  <button
                    onClick={() => {
                      const newOption = {
                        id: String(Date.now()),
                        text: '',
                        isCorrect: false
                      };
                      const newOptions = [...options];
                      newOptions.splice(index + 1, 0, newOption);
                      onOptionsChange(newOptions);
                    }}
                    className="flex-shrink-0 p-1 rounded hover:bg-green-100 transition-all"
                    style={{ color: theme.colors.semantic.status.success }}
                    title="Add option after this one"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                )}
                
                {/* Remove Option Button */}
                {options.length > 2 && (
                  <button
                    onClick={() => onRemoveOption(option.id)}
                    className="flex-shrink-0 p-1 rounded hover:bg-red-100 transition-all"
                    style={{ color: theme.colors.semantic.status.error }}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
              </div>
              
              {/* Option Explanation Component */}
              {activeExplanationId === option.id && (
                <AnswerOptionExplanation
                  optionId={option.id}
                  explanation={option.explanation}
                  references={option.references}
                  onExplanationChange={handleExplanationChange}
                  onReferencesChange={handleReferencesChange}
                  onClose={() => setActiveExplanationId(null)}
                />
              )}
            </div>
          ))}
        </div>
      )}
      
      {(errors.options || errors.correctAnswer) && (
        <div className="mt-2 space-y-1">
          {errors.options && (
            <p className="text-xs" style={{ color: theme.colors.semantic.status.error }}>
              {errors.options}
            </p>
          )}
          {errors.correctAnswer && (
            <p className="text-xs" style={{ color: theme.colors.semantic.status.error }}>
              {errors.correctAnswer}
            </p>
          )}
        </div>
      )}
    </div>
  );
}