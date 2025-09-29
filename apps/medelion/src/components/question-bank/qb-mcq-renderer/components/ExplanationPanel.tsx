import React, { useState } from 'react';
import { useTheme } from '@/theme';
import { MCQQuestion, Reference } from '../types';

interface ExplanationPanelProps {
  question: MCQQuestion;
  isExpanded: boolean;
  onToggle: () => void;
  showAnimation?: boolean;
}

export const ExplanationPanel: React.FC<ExplanationPanelProps> = ({
  question,
  isExpanded,
  onToggle,
  showAnimation = true
}) => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<'explanation' | 'objectives' | 'references'>('explanation');

  const hasReferences = question.references && question.references.length > 0;
  const hasObjectives = question.learningObjectives && question.learningObjectives.length > 0;

  const tabs = [
    { id: 'explanation', label: 'Detailed Explanation', icon: '📖' },
    ...(hasObjectives ? [{ id: 'objectives' as const, label: 'Learning Goals', icon: '🎯' }] : []),
    ...(hasReferences ? [{ id: 'references' as const, label: 'References', icon: '📚' }] : [])
  ];

  const renderReference = (ref: Reference, index: number) => {
    const getTypeIcon = (type: string) => {
      switch (type) {
        case 'book': return '📚';
        case 'article': return '📄';
        case 'website': return '🌐';
        case 'paper': return '📋';
        default: return '📄';
      }
    };

    return (
      <div 
        key={index}
        className="p-4 rounded-lg border"
        style={{
          backgroundColor: theme.colors.semantic.surface.secondary,
          borderColor: `${theme.colors.semantic.border.primary}20`
        }}
      >
        <div className="flex items-start space-x-3">
          <span className="text-2xl">{getTypeIcon(ref.type)}</span>
          <div className="flex-1">
            <h4 
              className="font-medium mb-1"
              style={{ color: theme.colors.semantic.text.primary }}
            >
              {ref.title}
            </h4>
            {ref.author && (
              <p 
                className="text-sm mb-2"
                style={{ color: theme.colors.semantic.text.secondary }}
              >
                by {ref.author}
              </p>
            )}
            <div className="flex items-center space-x-4">
              <span 
                className="text-xs px-2 py-1 rounded-full font-medium"
                style={{
                  backgroundColor: `${theme.colors.semantic.action.secondary}20`,
                  color: theme.colors.semantic.text.secondary
                }}
              >
                {ref.type.charAt(0).toUpperCase() + ref.type.slice(1)}
              </span>
              {ref.page && (
                <span 
                  className="text-xs"
                  style={{ color: theme.colors.semantic.text.secondary }}
                >
                  Page {ref.page}
                </span>
              )}
              {ref.url && (
                <a
                  href={ref.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs hover:underline transition-colors"
                  style={{ color: theme.colors.semantic.action.primary }}
                >
                  View Source →
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="mb-6">
      {/* Toggle Button */}
      <button
        onClick={onToggle}
        className={`
          w-full flex items-center justify-between p-4 rounded-lg border-2 font-medium transition-all duration-300
          hover:shadow-lg hover:-translate-y-0.5
        `}
        style={{
          backgroundColor: isExpanded 
            ? `${theme.colors.semantic.action.primary}10`
            : theme.colors.semantic.surface.secondary,
          borderColor: isExpanded 
            ? theme.colors.semantic.action.primary 
            : `${theme.colors.semantic.border.primary}30`,
          color: theme.colors.semantic.text.primary
        }}
      >
        <div className="flex items-center space-x-3">
          <div 
            className="p-2 rounded-full"
            style={{
              backgroundColor: isExpanded 
                ? theme.colors.semantic.action.primary 
                : `${theme.colors.semantic.action.primary}20`,
              color: isExpanded 
                ? theme.colors.semantic.text.inverse 
                : theme.colors.semantic.action.primary
            }}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="text-left">
            <h3 className="text-lg">
              {isExpanded ? 'Hide Detailed Explanation' : 'Show Detailed Explanation'}
            </h3>
            <p 
              className="text-sm"
              style={{ color: theme.colors.semantic.text.secondary }}
            >
              {isExpanded 
                ? 'Collapse the explanation and references'
                : 'Learn more about this question and its concepts'
              }
            </p>
          </div>
        </div>
        
        <div 
          className={`transform transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
          style={{ color: theme.colors.semantic.action.primary }}
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </div>
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div 
          className={`
            mt-4 p-6 rounded-lg border
            ${showAnimation ? 'animate-slide-down' : ''}
          `}
          style={{
            backgroundColor: theme.colors.semantic.surface.primary,
            borderColor: `${theme.colors.semantic.border.primary}30`,
            boxShadow: '0 4px 16px rgba(0,0,0,0.1)'
          }}
        >
          {/* Tabs */}
          {tabs.length > 1 && (
            <div className="flex space-x-1 mb-6 p-1 rounded-lg" style={{ backgroundColor: theme.colors.semantic.surface.secondary }}>
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as 'explanation' | 'objectives' | 'references')}
                  className={`
                    flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded font-medium text-sm transition-all duration-200
                  `}
                  style={{
                    backgroundColor: activeTab === tab.id 
                      ? theme.colors.semantic.action.primary 
                      : 'transparent',
                    color: activeTab === tab.id 
                      ? theme.colors.semantic.text.inverse 
                      : theme.colors.semantic.text.primary
                  }}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          )}

          {/* Content */}
          <div className="space-y-6">
            {activeTab === 'explanation' && (
              <div>
                <div 
                  className="prose prose-lg max-w-none"
                  style={{ color: theme.colors.semantic.text.primary }}
                >
                  <p className="text-base leading-relaxed">
                    {question.detailedExplanation}
                  </p>
                </div>

                {/* Key Points */}
                <div 
                  className="mt-6 p-4 rounded-lg"
                  style={{
                    backgroundColor: `${theme.colors.semantic.status.info}08`,
                    border: `1px solid ${theme.colors.semantic.status.info}20`
                  }}
                >
                  <h4 
                    className="font-semibold mb-2 flex items-center space-x-2"
                    style={{ color: theme.colors.semantic.status.info }}
                  >
                    <span>💡</span>
                    <span>Key Takeaway</span>
                  </h4>
                  <p 
                    className="text-sm"
                    style={{ color: theme.colors.semantic.text.secondary }}
                  >
                    Understanding this concept is crucial for mastering {question.subject} topics related to {question.chapter}.
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'objectives' && hasObjectives && (
              <div>
                <h4 
                  className="font-semibold mb-4 flex items-center space-x-2"
                  style={{ color: theme.colors.semantic.text.primary }}
                >
                  <span>🎯</span>
                  <span>What You'll Learn</span>
                </h4>
                <div className="grid gap-3">
                  {question.learningObjectives.map((objective, index) => (
                    <div 
                      key={index}
                      className="flex items-start space-x-3 p-3 rounded-lg"
                      style={{
                        backgroundColor: theme.colors.semantic.surface.secondary,
                        border: `1px solid ${theme.colors.semantic.border.primary}10`
                      }}
                    >
                      <div 
                        className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5"
                        style={{
                          backgroundColor: theme.colors.semantic.action.primary,
                          color: theme.colors.semantic.text.inverse
                        }}
                      >
                        {index + 1}
                      </div>
                      <p 
                        className="text-sm"
                        style={{ color: theme.colors.semantic.text.primary }}
                      >
                        {objective}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'references' && hasReferences && (
              <div>
                <h4 
                  className="font-semibold mb-4 flex items-center space-x-2"
                  style={{ color: theme.colors.semantic.text.primary }}
                >
                  <span>📚</span>
                  <span>Additional Resources</span>
                </h4>
                <div className="grid gap-4">
                  {question.references!.map((ref, index) => renderReference(ref, index))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};