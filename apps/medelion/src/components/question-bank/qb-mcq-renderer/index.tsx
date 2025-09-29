import React, { useEffect, useState } from 'react';
import { useTheme } from '@/theme';
import { MCQQuestion, UserAnswer } from './types';
import { useRenderer, useQuestionState, useKeyboardNavigation } from './hooks';
import { QuestionHeader } from './components/QuestionHeader';
import { QuestionContent } from './components/QuestionContent';
import { QuestionMedia } from './components/QuestionMedia';
import { AnswerGrid } from './components/AnswerGrid';
import { AnswerFeedback } from './components/AnswerFeedback';
import { ExplanationPanel } from './components/ExplanationPanel';
import { ProgressIndicator } from './components/ProgressIndicator';
import { QuestionStats } from './components/QuestionStats';
import { QuestionNavigation } from './components/QuestionNavigation';

// Mock data for demonstration
const mockQuestions: MCQQuestion[] = [
  {
    id: '1',
    questionText: 'What is the primary function of mitochondria in eukaryotic cells?',
    options: [
      {
        id: 'a',
        text: 'Protein synthesis and storage',
        isCorrect: false,
        explanation: 'Protein synthesis primarily occurs in ribosomes, not mitochondria.'
      },
      {
        id: 'b',
        text: 'ATP production through cellular respiration',
        isCorrect: true,
        explanation: 'Correct! Mitochondria are the powerhouses of the cell, producing ATP through cellular respiration.'
      },
      {
        id: 'c',
        text: 'DNA replication and cell division',
        isCorrect: false,
        explanation: 'DNA replication occurs in the nucleus, not in mitochondria.'
      },
      {
        id: 'd',
        text: 'Waste elimination and detoxification',
        isCorrect: false,
        explanation: 'Waste elimination is primarily handled by lysosomes and the endoplasmic reticulum.'
      }
    ],
    difficulty: 'medium',
    subject: 'Biology',
    chapter: 'Cell Biology',
    section: 'Organelles',
    tags: ['mitochondria', 'cellular-respiration', 'atp'],
    estimatedTime: 90,
    detailedExplanation: 'Mitochondria are double-membrane organelles found in most eukaryotic cells. They are often called the "powerhouses" of the cell because their primary function is to produce adenosine triphosphate (ATP) through the process of cellular respiration. This involves breaking down glucose and other organic molecules in the presence of oxygen to release energy that is then stored in ATP molecules. The inner membrane of mitochondria contains the enzymes necessary for the electron transport chain, which is crucial for ATP synthesis.',
    learningObjectives: [
      'Understand the structure and function of mitochondria',
      'Explain the process of cellular respiration',
      'Identify the role of ATP in cellular energy metabolism'
    ],
    references: [
      {
        title: 'Campbell Biology',
        author: 'Campbell & Reece',
        type: 'book',
        page: 109
      }
    ],
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-20')
  },
  {
    id: '2',
    questionText: 'Which of the following best describes the process of photosynthesis?',
    options: [
      {
        id: 'a',
        text: 'Conversion of light energy into chemical energy',
        isCorrect: true,
        explanation: 'Correct! Photosynthesis converts light energy from the sun into chemical energy stored in glucose.'
      },
      {
        id: 'b',
        text: 'Breakdown of glucose to release energy',
        isCorrect: false,
        explanation: 'This describes cellular respiration, not photosynthesis.'
      },
      {
        id: 'c',
        text: 'Transport of nutrients across cell membranes',
        isCorrect: false,
        explanation: 'This describes membrane transport, not photosynthesis.'
      },
      {
        id: 'd',
        text: 'Synthesis of proteins from amino acids',
        isCorrect: false,
        explanation: 'This describes protein synthesis, not photosynthesis.'
      }
    ],
    difficulty: 'easy',
    subject: 'Biology',
    chapter: 'Plant Biology',
    section: 'Photosynthesis',
    tags: ['photosynthesis', 'light-energy', 'glucose'],
    estimatedTime: 60,
    detailedExplanation: 'Photosynthesis is the process by which plants, algae, and some bacteria convert light energy, usually from the sun, into chemical energy stored in glucose molecules. This process occurs in two main stages: the light-dependent reactions (which occur in the thylakoids) and the light-independent reactions or Calvin cycle (which occur in the stroma of chloroplasts). The overall equation for photosynthesis is: 6CO₂ + 6H₂O + light energy → C₆H₁₂O₆ + 6O₂.',
    learningObjectives: [
      'Define photosynthesis and its importance',
      'Explain the light-dependent and light-independent reactions',
      'Understand the role of chloroplasts in photosynthesis'
    ],
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-15')
  }
];

interface QbMcqRendererProps {
  questions?: MCQQuestion[];
  className?: string;
  showProgressBar?: boolean;
  showTimer?: boolean;
  allowNavigation?: boolean;
}

const QbMcqRenderer: React.FC<QbMcqRendererProps> = ({
  questions = mockQuestions,
  className = '',
  showProgressBar = true,
  showTimer = true,
  allowNavigation = true
}) => {
  const { theme } = useTheme();
  
  const {
    currentQuestion,
    currentQuestionIndex,
    userAnswers,
    progress,
    sessionStartTime,
    settings,
    addAnswer,
    nextQuestion,
    prevQuestion,
    goToQuestion,
    updateSettings
  } = useRenderer(questions);

  const questionState = useQuestionState(currentQuestion);
  const [answeredQuestions, setAnsweredQuestions] = useState<Set<number>>(new Set());
  const [sessionDuration, setSessionDuration] = useState(0);

  // Update session duration
  useEffect(() => {
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - sessionStartTime.getTime()) / 1000);
      setSessionDuration(elapsed);
    }, 1000);

    return () => clearInterval(interval);
  }, [sessionStartTime]);

  // Track answered questions
  useEffect(() => {
    if (questionState.isAnswered) {
      setAnsweredQuestions(prev => new Set([...prev, currentQuestionIndex]));
      
      // Add answer to user answers
      if (currentQuestion && questionState.selectedOption) {
        const answer: UserAnswer = {
          questionId: currentQuestion.id,
          selectedOptionId: questionState.selectedOption,
          isCorrect: questionState.isCorrect || false,
          timeSpent: questionState.timeSpent,
          attempts: questionState.attempts,
          answeredAt: new Date()
        };
        addAnswer(answer);
      }
    }
  }, [questionState.isAnswered, currentQuestionIndex, currentQuestion, questionState, addAnswer]);

  // Keyboard navigation
  useKeyboardNavigation(
    settings.enableKeyboardNavigation && allowNavigation,
    nextQuestion,
    prevQuestion,
    (optionIndex) => {
      if (currentQuestion && !questionState.isAnswered) {
        const option = currentQuestion.options[optionIndex];
        if (option) {
          questionState.selectOption(option.id);
        }
      }
    },
    currentQuestion?.options.length || 0
  );

  const estimatedTotalTime = questions.reduce((total, q) => total + q.estimatedTime, 0);

  if (!currentQuestion) {
    return (
      <div 
        className="text-center py-20"
        style={{ color: theme.colors.semantic.text.secondary }}
      >
        <p>No questions available</p>
      </div>
    );
  }

  return (
    <div className={`max-w-6xl mx-auto ${className}`}>
      <div className="grid lg:grid-cols-4 gap-6">
        {/* Main Question Area */}
        <div className="lg:col-span-3 space-y-6">
          {/* Progress Indicator */}
          {showProgressBar && (
            <ProgressIndicator
              progress={progress}
              currentQuestionIndex={currentQuestionIndex}
              compact={true}
            />
          )}

          {/* Question Header */}
          <QuestionHeader
            question={currentQuestion}
            questionNumber={currentQuestionIndex + 1}
            totalQuestions={questions.length}
            timeSpent={questionState.timeSpent}
            showTimer={showTimer && settings.showTimer}
            showDifficulty={settings.showDifficultyIndicator}
          />

          {/* Question Content */}
          <QuestionContent question={currentQuestion} />

          {/* Question Media */}
          {currentQuestion.media && (
            <QuestionMedia media={currentQuestion.media} />
          )}

          {/* Answer Grid */}
          <AnswerGrid
            options={currentQuestion.options}
            selectedOption={questionState.selectedOption}
            isCorrect={questionState.isCorrect}
            isAnswered={questionState.isAnswered}
            showFeedback={questionState.showFeedback && settings.showInstantFeedback}
            onSelectOption={questionState.selectOption}
            animationsEnabled={settings.animationsEnabled}
          />

          {/* Answer Feedback */}
          {questionState.showFeedback && questionState.selectedOption && settings.showInstantFeedback && (
            <AnswerFeedback
              isCorrect={questionState.isCorrect || false}
              question={currentQuestion}
              selectedOption={questionState.selectedOption}
              timeSpent={questionState.timeSpent}
              attempts={questionState.attempts}
              showAnimation={settings.animationsEnabled}
            />
          )}

          {/* Detailed Explanation */}
          <ExplanationPanel
            question={currentQuestion}
            isExpanded={questionState.showExplanation}
            onToggle={questionState.toggleExplanation}
            showAnimation={settings.animationsEnabled}
          />

          {/* Navigation */}
          {allowNavigation && (
            <QuestionNavigation
              currentIndex={currentQuestionIndex}
              totalQuestions={questions.length}
              onPrevious={prevQuestion}
              onNext={nextQuestion}
              onGoTo={goToQuestion}
              answeredQuestions={answeredQuestions}
            />
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Detailed Progress */}
          <ProgressIndicator
            progress={progress}
            currentQuestionIndex={currentQuestionIndex}
            showDetailedStats={true}
          />

          {/* Session Statistics */}
          <QuestionStats
            progress={progress}
            sessionDuration={sessionDuration}
            estimatedTotalTime={estimatedTotalTime}
          />
        </div>
      </div>
    </div>
  );
};

export default QbMcqRenderer;