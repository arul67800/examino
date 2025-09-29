import React from 'react';
import { MCQOption } from '../types';
import { AnswerOption } from './AnswerOption';

interface AnswerGridProps {
  options: MCQOption[];
  selectedOption: string | null;
  isCorrect: boolean | null;
  isAnswered: boolean;
  showFeedback: boolean;
  onSelectOption: (optionId: string) => void;
  animationsEnabled?: boolean;
  layout?: 'vertical' | 'grid' | 'compact';
}

export const AnswerGrid: React.FC<AnswerGridProps> = ({
  options,
  selectedOption,
  isCorrect,
  isAnswered,
  showFeedback,
  onSelectOption,
  animationsEnabled = true,
  layout = 'vertical'
}) => {
  const getGridClasses = () => {
    switch (layout) {
      case 'grid':
        return 'grid grid-cols-1 md:grid-cols-2 gap-4';
      case 'compact':
        return 'space-y-2';
      default:
        return 'space-y-4';
    }
  };

  const getStaggerDelay = (index: number) => {
    if (!animationsEnabled) return {};
    return {
      animationDelay: `${index * 100}ms`
    };
  };

  return (
    <div className={`${getGridClasses()} mb-6`}>
      {options.map((option, index) => (
        <div
          key={option.id}
          className={animationsEnabled ? 'animate-slide-up' : ''}
          style={getStaggerDelay(index)}
        >
          <AnswerOption
            option={option}
            index={index}
            isSelected={selectedOption === option.id}
            isCorrect={selectedOption === option.id ? isCorrect : null}
            isAnswered={isAnswered}
            showFeedback={showFeedback}
            onSelect={onSelectOption}
            animationsEnabled={animationsEnabled}
          />
        </div>
      ))}
    </div>
  );
};