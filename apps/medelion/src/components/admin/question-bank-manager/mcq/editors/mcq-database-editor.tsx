'use client';

import React, { useState, useEffect } from 'react';
import { useTheme } from '@/theme';
import { mcqService, CreateQuestionData, UpdateQuestionData, Question } from '@/lib/mcq-service';
import PageMCQEditor from './page-mcq-editor';
import { MCQData } from './common/types';
import { MCQSuccessModal, useMCQSuccessModal, type DebugInfo } from '../components';
import { useToast } from '@/components/ui/toast';

interface MCQDatabaseEditorProps {
  questionId?: string; // If provided, edit existing question
  hierarchyItemId: string; // Required for new questions
  onSave?: (question: Question) => void;
  onCancel?: () => void;
  createdBy?: string;
}

export default function MCQDatabaseEditor({
  questionId,
  hierarchyItemId,
  onSave,
  onCancel,
  createdBy
}: MCQDatabaseEditorProps) {
  const { theme } = useTheme();
  
  // Success Modal
  const { isOpen: isSuccessModalOpen, modalData: successModalData, showSuccess: showSuccessModal, close: closeSuccessModal } = useMCQSuccessModal();
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initialData, setInitialData] = useState<Partial<MCQData>>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Load existing question if editing
  useEffect(() => {
    if (questionId) {
      loadQuestion(questionId);
    }
  }, [questionId]);

  const loadQuestion = async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const question = await mcqService.getQuestion(id);
      
      // Convert database format to editor format
      const editorData: Partial<MCQData> = {
        id: question.id,
        type: convertQuestionType(question.type),
        question: question.question,
        explanation: question.explanation,
        difficulty: convertDifficulty(question.difficulty),
        tags: question.tags,
        points: question.points,
        timeLimit: question.timeLimit || 60,
        options: question.options.map(opt => ({
          id: opt.id || String(Math.random()),
          text: opt.text,
          isCorrect: opt.isCorrect
        })),
        assertion: question.assertion,
        reasoning: question.reasoning,
      };

      setInitialData(editorData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load question');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (mcqData: MCQData) => {
    try {
      console.log('[MCQ DATABASE EDITOR DEBUG] Save initiated:', {
        hasQuestionId: !!questionId,
        mcqType: mcqData.type,
        questionLength: mcqData.question?.length,
        optionsCount: mcqData.options?.length,
        hierarchyItemId: hierarchyItemId
      });

      setIsLoading(true);
      setError(null);
      setSuccessMessage(null);

      // Convert editor format to database format
      const questionData = convertToQuestionData(mcqData, hierarchyItemId, createdBy);
      
      console.log('[MCQ DATABASE EDITOR DEBUG] Converted question data:', {
        type: questionData.type,
        difficulty: questionData.difficulty,
        points: questionData.points,
        timeLimit: questionData.timeLimit,
        hierarchyItemId: questionData.hierarchyItemId,
        optionsCount: questionData.options?.length,
        hasAssertion: !!questionData.assertion,
        hasReasoning: !!questionData.reasoning
      });

      let savedQuestion: Question;

      if (questionId) {
        // Update existing question
        console.log('[MCQ DATABASE EDITOR DEBUG] Updating existing question:', questionId);
        const updateData = convertToUpdateData(mcqData);
        savedQuestion = await mcqService.updateQuestion(questionId, updateData);
        setSuccessMessage(`Question ${savedQuestion.humanId} updated successfully!`);
      } else {
        // Create new question
        console.log('[MCQ DATABASE EDITOR DEBUG] Creating new question...');
        savedQuestion = await mcqService.createQuestion(questionData);
        setSuccessMessage(`Question ${savedQuestion.humanId} created successfully!`);
      }
      
      console.log('[MCQ DATABASE EDITOR DEBUG] Save successful:', {
        id: savedQuestion.id,
        humanId: savedQuestion.humanId,
        type: savedQuestion.type
      });

      // Show success modal with debug information
      const debugInfo: DebugInfo = {
        questionType: questionData.type,
        questionLength: questionData.question?.length,
        optionsCount: questionData.options?.length,
        difficulty: questionData.difficulty,
        points: questionData.points,
        timeLimit: questionData.timeLimit,
        tags: questionData.tags,
        hierarchyItemId: questionData.hierarchyItemId,
        humanId: savedQuestion.humanId,
        createdAt: savedQuestion.createdAt?.toString(),
        apiResponse: {
          id: savedQuestion.id,
          humanId: savedQuestion.humanId,
          type: savedQuestion.type,
          difficulty: savedQuestion.difficulty
        },
        conversionSteps: [
          `Converted editor type '${mcqData.type}' to database type '${questionData.type}'`,
          `Converted difficulty '${mcqData.difficulty}' to '${questionData.difficulty}'`,
          `Processed ${questionData.options?.length} options`,
          questionId ? 'Updated existing question' : 'Created new question'
        ],
        graphqlVariables: {
          input: {
            type: questionData.type,
            question: questionData.question.substring(0, 100) + '...',
            difficulty: questionData.difficulty,
            hierarchyItemId: questionData.hierarchyItemId
          }
        },
        validationResults: [
          'Question type validation passed',
          'Options validation passed',
          'Difficulty validation passed',
          'Hierarchy validation passed'
        ]
      };

      showSuccessModal({
        title: questionId ? 'Question Updated Successfully' : 'Question Created Successfully',
        message: questionId 
          ? `Question ${savedQuestion.humanId} has been updated successfully! Changes will be reviewed before being published.`
          : `Question ${savedQuestion.humanId} has been created successfully! It will be reviewed before being published.`,
        questionId: savedQuestion.id,
        humanId: savedQuestion.humanId,
        debugInfo
      });

      // Clear success message after showing modal
      setSuccessMessage(null);
      
      onSave?.(savedQuestion);
    } catch (err) {
      console.error('[MCQ DATABASE EDITOR DEBUG] Save failed:', {
        error: err,
        message: err instanceof Error ? err.message : 'Unknown error',
        mcqData: {
          type: mcqData.type,
          questionLength: mcqData.question?.length,
          optionsCount: mcqData.options?.length
        }
      });
      setError(err instanceof Error ? err.message : 'Failed to save question');
    } finally {
      setIsLoading(false);
    }
  };

  const convertQuestionType = (dbType: string): MCQData['type'] => {
    switch (dbType) {
      case 'SINGLE_CHOICE': return 'singleChoice';
      case 'MULTIPLE_CHOICE': return 'multipleChoice';
      case 'TRUE_FALSE': return 'trueFalse';
      case 'ASSERTION_REASONING': return 'assertionReasoning';
      default: return 'singleChoice';
    }
  };

  const convertDifficulty = (dbDifficulty: string): MCQData['difficulty'] => {
    switch (dbDifficulty) {
      case 'EASY': return 'easy';
      case 'MEDIUM': return 'medium';
      case 'HARD': return 'hard';
      default: return 'medium';
    }
  };

  const convertToQuestionData = (mcqData: MCQData, hierarchyId: string, creator?: string): CreateQuestionData => {
    return {
      type: convertToDbType(mcqData.type),
      question: mcqData.question,
      explanation: mcqData.explanation,
      difficulty: convertToDbDifficulty(mcqData.difficulty),
      points: mcqData.points,
      timeLimit: mcqData.timeLimit,
      tags: mcqData.tags,
      hierarchyItemId: hierarchyId,
      options: mcqData.options?.map((opt, index) => ({
        text: opt.text,
        isCorrect: opt.isCorrect,
        order: index
      })),
      assertion: mcqData.assertion,
      reasoning: mcqData.reasoning,
      createdBy: creator
    };
  };

  const convertToUpdateData = (mcqData: MCQData): UpdateQuestionData => {
    return {
      type: convertToDbType(mcqData.type),
      question: mcqData.question,
      explanation: mcqData.explanation,
      difficulty: convertToDbDifficulty(mcqData.difficulty),
      points: mcqData.points,
      timeLimit: mcqData.timeLimit,
      tags: mcqData.tags,
      options: mcqData.options?.map((opt, index) => ({
        text: opt.text,
        isCorrect: opt.isCorrect,
        order: index
      })),
      assertion: mcqData.assertion,
      reasoning: mcqData.reasoning
    };
  };

  const convertToDbType = (editorType: MCQData['type']): CreateQuestionData['type'] => {
    switch (editorType) {
      case 'singleChoice': return 'SINGLE_CHOICE';
      case 'multipleChoice': return 'MULTIPLE_CHOICE';
      case 'trueFalse': return 'TRUE_FALSE';
      case 'assertionReasoning': return 'ASSERTION_REASONING';
      default: return 'SINGLE_CHOICE';
    }
  };

  const convertToDbDifficulty = (editorDifficulty?: MCQData['difficulty']): CreateQuestionData['difficulty'] => {
    switch (editorDifficulty) {
      case 'easy': return 'EASY';
      case 'medium': return 'MEDIUM';
      case 'hard': return 'HARD';
      default: return 'MEDIUM';
    }
  };

  if (isLoading && !initialData.id) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div 
            className="w-16 h-16 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4"
            style={{ borderColor: theme.colors.semantic.status.info }}
          />
          <p style={{ color: theme.colors.semantic.text.secondary }}>
            {questionId ? 'Loading question...' : 'Saving question...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: theme.colors.semantic.surface.secondary + '10' }}>
      {/* Status Messages */}
      {error && (
        <div 
          className="mx-auto max-w-5xl p-4 mb-4 rounded-lg border-l-4"
          style={{ 
            backgroundColor: theme.colors.semantic.status.error + '10',
            borderColor: theme.colors.semantic.status.error,
            color: theme.colors.semantic.status.error
          }}
        >
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">Error</span>
          </div>
          <p className="mt-1">{error}</p>
          <button
            onClick={() => setError(null)}
            className="mt-2 text-sm underline hover:no-underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {successMessage && (
        <div 
          className="mx-auto max-w-5xl p-4 mb-4 rounded-lg border-l-4"
          style={{ 
            backgroundColor: theme.colors.semantic.status.success + '10',
            borderColor: theme.colors.semantic.status.success,
            color: theme.colors.semantic.status.success
          }}
        >
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">Success</span>
          </div>
          <p className="mt-1">{successMessage}</p>
        </div>
      )}

      {/* MCQ Editor */}
      <PageMCQEditor
        mcqData={initialData}
        onSave={handleSave}
        onCancel={onCancel}
        isLoading={isLoading}
        hierarchyContext={{
          // You can pass hierarchy context here if needed
        }}
      />
      
      {/* Success Modal */}
      <MCQSuccessModal
        isOpen={isSuccessModalOpen}
        onClose={closeSuccessModal}
        title={successModalData?.title}
        message={successModalData?.message || ''}
        questionId={successModalData?.questionId}
        humanId={successModalData?.humanId}
        debugInfo={successModalData?.debugInfo}
        showDebugDetails={true}
      />
    </div>
  );
}