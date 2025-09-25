'use client';

import React, { useState, useEffect } from 'react';
import AddItemForm from './add-item-form';
import { useTheme } from '@/theme';

interface AdvancedEmptyStateProps {
  onCreateFirst: () => void;
  isCreating: boolean;
  showAddForm: boolean;
  newItemName: string;
  onNameChange: (value: string) => void;
  onSaveNewItem: () => void;
  onCancelAdd: () => void;
}

export default function AdvancedEmptyState({ 
  onCreateFirst, 
  isCreating, 
  showAddForm, 
  newItemName, 
  onNameChange, 
  onSaveNewItem, 
  onCancelAdd 
}: AdvancedEmptyStateProps) {
  const { theme } = useTheme();
  const [currentStep, setCurrentStep] = useState(0);
  const [showAnimation, setShowAnimation] = useState(false);

  useEffect(() => {
    setShowAnimation(true);
  }, []);

  const steps = [
    {
      icon: "📚",
      title: "Academic Years",
      description: "Start with organizing by years (2024, 2025, etc.)"
    },
    {
      icon: "📖",
      title: "Subjects",
      description: "Add subjects under each year (Math, Science, etc.)"
    },
    {
      icon: "📝",
      title: "Topics & Content",
      description: "Create chapters, sections, and questions"
    }
  ];

  return (
    <div className={`relative overflow-hidden transition-all duration-1000 ${showAnimation ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div 
          className="absolute top-10 left-10 w-32 h-32 border-2 rounded-full"
          style={{ borderColor: theme.colors.semantic.status.info + '30' }}
        ></div>
        <div 
          className="absolute top-32 right-20 w-20 h-20 border-2 rounded-full"
          style={{ borderColor: theme.colors.semantic.status.success + '30' }}
        ></div>
        <div 
          className="absolute bottom-20 left-32 w-24 h-24 border-2 rounded-full"
          style={{ borderColor: theme.colors.semantic.status.success + '30' }}
        ></div>
        <div 
          className="absolute bottom-32 right-10 w-16 h-16 border-2 rounded-full"
          style={{ borderColor: theme.colors.semantic.status.warning + '30' }}
        ></div>
      </div>

      <div 
        className="relative rounded-2xl border p-12 text-center"
        style={{ 
          background: `linear-gradient(135deg, ${theme.colors.semantic.surface.primary}, ${theme.colors.semantic.surface.secondary})`,
          borderColor: theme.colors.semantic.border.secondary
        }}
      >
        {/* Floating Icons */}
        <div className="absolute top-6 left-6 opacity-20">
          <div className="text-2xl">📚</div>
        </div>
        <div className="absolute top-6 right-6 opacity-20">
          <div className="text-2xl">✨</div>
        </div>
        <div className="absolute bottom-6 left-6 opacity-20">
          <div className="text-2xl">🎯</div>
        </div>
        <div className="absolute bottom-6 right-6 opacity-20">
          <div className="text-2xl">🚀</div>
        </div>

        {/* Main Icon */}
        <div className="relative mb-8">
          <div 
            className="relative w-24 h-24 rounded-full flex items-center justify-center mx-auto shadow-xl"
            style={{ 
              background: `linear-gradient(135deg, ${theme.colors.semantic.status.info}, ${theme.colors.semantic.status.success})`
            }}
          >
            <svg
              className="w-12 h-12"
              style={{ color: theme.colors.semantic.text.inverse }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
          </div>
        </div>

        {/* Main Heading with Gradient Text */}
        <h1 
          className="text-4xl font-bold mb-4"
          style={{ 
            background: `linear-gradient(90deg, ${theme.colors.semantic.status.info}, ${theme.colors.semantic.status.success}, ${theme.colors.semantic.status.info})`,
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            color: 'transparent'
          }}
        >
          Welcome to Question Bank Manager
        </h1>

        <p 
          className="text-xl mb-8 max-w-2xl mx-auto leading-relaxed"
          style={{ color: theme.colors.semantic.text.secondary }}
        >
          Create and organize your educational content in a structured hierarchy. 
          Start building your question bank from the ground up.
        </p>

        {/* Interactive Steps Visualization */}
        <div className="mb-10">
          <div className="flex justify-center items-center space-x-8 mb-6">
            {steps.map((step, index) => (
              <div
                key={index}
                className={`relative transition-all duration-500 cursor-pointer group ${
                  currentStep === index ? 'scale-110' : 'scale-100 hover:scale-105'
                }`}
                onMouseEnter={() => setCurrentStep(index)}
              >
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center text-2xl transition-all duration-300 shadow-xl"
                  style={{
                    background: currentStep === index 
                      ? `linear-gradient(135deg, ${theme.colors.semantic.status.info}, ${theme.colors.semantic.status.success})`
                      : theme.colors.semantic.surface.tertiary,
                    transform: currentStep === index ? 'rotate(12deg)' : 'rotate(0deg)'
                  }}
                >
                  {currentStep === index ? (
                    <div 
                      className="text-3xl"
                      style={{ color: theme.colors.semantic.text.inverse }}
                    >
                      {step.icon}
                    </div>
                  ) : (
                    <div 
                      className="group-hover:opacity-80"
                      style={{ color: theme.colors.semantic.text.secondary }}
                    >
                      {step.icon}
                    </div>
                  )}
                </div>
                
                {/* Connection Lines */}
                {index < steps.length - 1 && (
                  <div 
                    className="absolute top-8 left-16 w-8 h-0.5 transition-all duration-500"
                    style={{
                      background: currentStep >= index 
                        ? `linear-gradient(90deg, ${theme.colors.semantic.status.info}, ${theme.colors.semantic.status.success})`
                        : theme.colors.semantic.border.secondary
                    }}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Step Description */}
          <div 
            className="rounded-lg p-6 shadow-sm border max-w-md mx-auto"
            style={{ 
              backgroundColor: theme.colors.semantic.surface.primary,
              borderColor: theme.colors.semantic.border.secondary
            }}
          >
            <h3 
              className="font-semibold text-lg mb-2"
              style={{ color: theme.colors.semantic.text.primary }}
            >
              {steps[currentStep].title}
            </h3>
            <p style={{ color: theme.colors.semantic.text.secondary }}>
              {steps[currentStep].description}
            </p>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div 
            className="backdrop-blur-sm rounded-xl p-6 border border-opacity-20 hover:shadow-lg transition-all duration-300 hover:-translate-y-1" 
            style={{ 
              backgroundColor: `${theme.colors.semantic.surface.primary}cc`,
              borderColor: theme.colors.semantic.border.secondary 
            }}
          >
            <div 
              className="w-12 h-12 rounded-lg flex items-center justify-center mb-4 mx-auto" 
              style={{ backgroundColor: `${theme.colors.semantic.status.info}1a` }}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: theme.colors.semantic.status.info }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
              </svg>
            </div>
            <h4 className="font-semibold mb-2" style={{ color: theme.colors.semantic.text.primary }}>Drag & Drop</h4>
            <p className="text-sm" style={{ color: theme.colors.semantic.text.secondary }}>Easily reorganize your hierarchy with intuitive drag and drop</p>
          </div>

          <div 
            className="backdrop-blur-sm rounded-xl p-6 border border-opacity-20 hover:shadow-lg transition-all duration-300 hover:-translate-y-1" 
            style={{ 
              backgroundColor: `${theme.colors.semantic.surface.primary}cc`,
              borderColor: theme.colors.semantic.border.secondary 
            }}
          >
            <div 
              className="w-12 h-12 rounded-lg flex items-center justify-center mb-4 mx-auto" 
              style={{ backgroundColor: `${theme.colors.semantic.status.success}1a` }}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: theme.colors.semantic.status.success }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
              </svg>
            </div>
            <h4 className="font-semibold mb-2" style={{ color: theme.colors.semantic.text.primary }}>Smart Organization</h4>
            <p className="text-sm" style={{ color: theme.colors.semantic.text.secondary }}>Automatic categorization and intelligent content structure</p>
          </div>

          <div 
            className="backdrop-blur-sm rounded-xl p-6 border border-opacity-20 hover:shadow-lg transition-all duration-300 hover:-translate-y-1" 
            style={{ 
              backgroundColor: `${theme.colors.semantic.surface.primary}cc`,
              borderColor: theme.colors.semantic.border.secondary 
            }}
          >
            <div 
              className="w-12 h-12 rounded-lg flex items-center justify-center mb-4 mx-auto" 
              style={{ backgroundColor: `${theme.colors.semantic.status.warning}1a` }}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: theme.colors.semantic.status.warning }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h4 className="font-semibold mb-2" style={{ color: theme.colors.semantic.text.primary }}>Fast Performance</h4>
            <p className="text-sm" style={{ color: theme.colors.semantic.text.secondary }}>Lightning-fast operations with real-time updates</p>
          </div>
        </div>

        {/* CTA Button or Add Form */}
        <div className="space-y-4">
          {showAddForm ? (
            <div className="max-w-lg mx-auto">
              <AddItemForm
                itemName={newItemName}
                itemType="Academic Year"
                onNameChange={onNameChange}
                onSave={onSaveNewItem}
                onCancel={onCancelAdd}
                depth={0}
              />
              <p className="text-sm mt-3 text-center" style={{ color: theme.colors.semantic.text.tertiary }}>
                💡 Tip: Enter a meaningful name like "2024-2025" or "First Year"
              </p>
            </div>
          ) : (
            <>
              <button
                onClick={onCreateFirst}
                disabled={isCreating}
                className={`group relative px-8 py-4 text-white font-semibold rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none`}
                style={{
                  background: `linear-gradient(135deg, ${theme.colors.semantic.status.info}, ${theme.colors.semantic.status.warning}, ${theme.colors.semantic.status.info})`
                }}
              >
                {/* Button Background Animation */}
                <div 
                  className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-20 transition-opacity duration-300"
                  style={{
                    background: `linear-gradient(135deg, ${theme.colors.semantic.status.info}80, ${theme.colors.semantic.status.success}80)`
                  }}
                ></div>
                
                <div className="relative flex items-center space-x-3">
                  {isCreating ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      <span>Creating Your First Year...</span>
                    </>
                  ) : (
                    <>
                      <span>🚀 Create Your First Academic Year</span>
                      <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </>
                  )}
                </div>
              </button>

              <p className="text-sm" style={{ color: theme.colors.semantic.text.tertiary }}>
                💡 Tip: You can always reorganize and modify your structure later
              </p>
            </>
          )}
        </div>

        {/* Bottom Decoration */}
        <div className="mt-10 pt-8 border-t" style={{ borderColor: theme.colors.semantic.border.secondary }}>
          <div className="flex justify-center space-x-6" style={{ color: theme.colors.semantic.text.tertiary }}>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: theme.colors.semantic.status.info }}></div>
              <span className="text-sm">Hierarchical Structure</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: theme.colors.semantic.status.success }}></div>
              <span className="text-sm">Real-time Updates</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: theme.colors.semantic.status.warning }}></div>
              <span className="text-sm">Smart Organization</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}