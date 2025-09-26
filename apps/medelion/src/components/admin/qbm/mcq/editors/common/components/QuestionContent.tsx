'use client';

import React from 'react';
import { useTheme } from '@/theme';
import { RichTextEditor } from '../../../rich-text-editor/rich-text-editor';
import { MCQType, FormValidationErrors } from '../types';

interface QuestionContentProps {
  questionType: MCQType;
  question: string;
  assertion?: string;
  reasoning?: string;
  errors: FormValidationErrors;
  onQuestionChange: (content: string) => void;
  onAssertionChange: (content: string) => void;
  onReasoningChange: (content: string) => void;
}

export default function QuestionContent({
  questionType,
  question,
  assertion,
  reasoning,
  errors,
  onQuestionChange,
  onAssertionChange,
  onReasoningChange
}: QuestionContentProps) {
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
        Question Content
      </h2>
      
      <div className="space-y-4">
        {/* Main Question */}
        <div>
          <label 
            className="block text-sm font-medium mb-2"
            style={{ color: theme.colors.semantic.text.primary }}
          >
            {questionType === 'assertionReasoning' ? 'Question Statement *' : 'Question *'}
          </label>
          <RichTextEditor
            content={question}
            onChange={onQuestionChange}
            placeholder={
              questionType === 'assertionReasoning' 
                ? "Enter the question statement that relates to both assertion and reasoning..."
                : "Enter your question here..."
            }
            minHeight="120px"
            maxLength={1000}
            showWordCount={true}
          />
          {errors.question && (
            <p className="mt-1 text-xs" style={{ color: theme.colors.semantic.status.error }}>
              {errors.question}
            </p>
          )}
        </div>

        {/* Assertion & Reasoning Fields (for assertion-reasoning questions only) */}
        {questionType === 'assertionReasoning' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Assertion */}
            <div>
              <label 
                className="block text-sm font-medium mb-2"
                style={{ color: theme.colors.semantic.text.primary }}
              >
                Assertion (A) *
              </label>
              <RichTextEditor
                content={assertion || ''}
                onChange={onAssertionChange}
                placeholder="Enter the assertion statement..."
                minHeight="100px"
                maxLength={500}
                showWordCount={true}
              />
              {errors.assertion && (
                <p className="mt-1 text-xs" style={{ color: theme.colors.semantic.status.error }}>
                  {errors.assertion}
                </p>
              )}
            </div>

            {/* Reasoning */}
            <div>
              <label 
                className="block text-sm font-medium mb-2"
                style={{ color: theme.colors.semantic.text.primary }}
              >
                Reasoning (R) *
              </label>
              <RichTextEditor
                content={reasoning || ''}
                onChange={onReasoningChange}
                placeholder="Enter the reasoning statement..."
                minHeight="100px"
                maxLength={500}
                showWordCount={true}
              />
              {errors.reasoning && (
                <p className="mt-1 text-xs" style={{ color: theme.colors.semantic.status.error }}>
                  {errors.reasoning}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}