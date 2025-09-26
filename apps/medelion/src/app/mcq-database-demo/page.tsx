'use client';

import React, { useState, useEffect } from 'react';
import { useTheme } from '@/theme';
import { mcqService, Question } from '@/lib/mcq-service';
import MCQDatabaseEditor from '@/components/admin/qbm/mcq/editors/mcq-database-editor';
import { useRouter, useSearchParams } from 'next/navigation';

export default function MCQDatabaseDemoPage() {
  const { theme } = useTheme();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [savedQuestions, setSavedQuestions] = useState<Question[]>([]);
  const [showEditor, setShowEditor] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);

  // Sample hierarchy item ID - using a real hierarchy item from seed data
  // In a real app, you would get this from props, context, or API call
  const sampleHierarchyItemId = 'shoulder-anatomy'; // This should match seeded data

  useEffect(() => {
    // Auto-show editor if URL parameters are set
    if (searchParams.get('create') === 'true') {
      setShowEditor(true);
    }
  }, [searchParams]);

  const handleSaveQuestion = (question: Question) => {
    if (editingQuestionId) {
      // Update existing question in the list
      setSavedQuestions(prev => 
        prev.map(q => q.id === question.id ? question : q)
      );
    } else {
      // Add new question to the list
      setSavedQuestions(prev => [...prev, question]);
    }
    
    setShowEditor(false);
    setEditingQuestionId(null);
  };

  const handleCancelEditor = () => {
    setShowEditor(false);
    setEditingQuestionId(null);
    router.push('/mcq-database-demo');
  };

  const handleEditQuestion = (questionId: string) => {
    setEditingQuestionId(questionId);
    setShowEditor(true);
  };

  const handleDeleteQuestion = async (questionId: string) => {
    if (window.confirm('Are you sure you want to delete this question?')) {
      try {
        await mcqService.deleteQuestion(questionId);
        setSavedQuestions(prev => prev.filter(q => q.id !== questionId));
      } catch (error) {
        alert('Failed to delete question: ' + (error instanceof Error ? error.message : 'Unknown error'));
      }
    }
  };

  if (showEditor) {
    return (
      <MCQDatabaseEditor
        questionId={editingQuestionId || undefined}
        hierarchyItemId={sampleHierarchyItemId}
        onSave={handleSaveQuestion}
        onCancel={handleCancelEditor}
        createdBy="demo-user"
      />
    );
  }

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: theme.colors.semantic.surface.secondary + '10' }}>
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div 
          className="rounded-xl p-6 border-2 text-center"
          style={{
            backgroundColor: theme.colors.semantic.surface.primary,
            borderColor: theme.colors.semantic.border.secondary + '30'
          }}
        >
          <div 
            className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
            style={{ backgroundColor: theme.colors.semantic.status.success + '20' }}
          >
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20" style={{ color: theme.colors.semantic.status.success }}>
              <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
            </svg>
          </div>
          <h1 
            className="text-3xl font-bold mb-2"
            style={{ color: theme.colors.semantic.text.primary }}
          >
            🚀 MCQ Database Demo
          </h1>
          <p 
            className="text-lg"
            style={{ color: theme.colors.semantic.text.secondary }}
          >
            Create and manage MCQ questions with database persistence and human-readable IDs
          </p>
        </div>

        {/* Create New Question Button */}
        <div className="text-center">
          <button
            onClick={() => setShowEditor(true)}
            className="px-8 py-4 rounded-xl font-semibold text-white transition-all duration-200 hover:scale-105 hover:shadow-lg"
            style={{ backgroundColor: theme.colors.semantic.status.success }}
          >
            <div className="flex items-center space-x-2">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              <span>Create New Question</span>
            </div>
          </button>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div 
            className="p-6 rounded-xl border-2 text-center"
            style={{
              backgroundColor: theme.colors.semantic.surface.primary,
              borderColor: theme.colors.semantic.border.secondary + '30'
            }}
          >
            <div 
              className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center"
              style={{ backgroundColor: theme.colors.semantic.status.info + '20' }}
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" style={{ color: theme.colors.semantic.status.info }}>
                <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
              </svg>
            </div>
            <h3 
              className="font-semibold mb-2"
              style={{ color: theme.colors.semantic.text.primary }}
            >
              Human-Readable IDs
            </h3>
            <p 
              className="text-sm"
              style={{ color: theme.colors.semantic.text.secondary }}
            >
              Questions get IDs like ANAT-UL-SR-BSA-Q001 based on hierarchy
            </p>
          </div>

          <div 
            className="p-6 rounded-xl border-2 text-center"
            style={{
              backgroundColor: theme.colors.semantic.surface.primary,
              borderColor: theme.colors.semantic.border.secondary + '30'
            }}
          >
            <div 
              className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center"
              style={{ backgroundColor: theme.colors.semantic.status.warning + '20' }}
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" style={{ color: theme.colors.semantic.status.warning }}>
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 
              className="font-semibold mb-2"
              style={{ color: theme.colors.semantic.text.primary }}
            >
              Database Persistence
            </h3>
            <p 
              className="text-sm"
              style={{ color: theme.colors.semantic.text.secondary }}
            >
              All questions saved to database with full CRUD operations
            </p>
          </div>

          <div 
            className="p-6 rounded-xl border-2 text-center"
            style={{
              backgroundColor: theme.colors.semantic.surface.primary,
              borderColor: theme.colors.semantic.border.secondary + '30'
            }}
          >
            <div 
              className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center"
              style={{ backgroundColor: theme.colors.semantic.status.error + '20' }}
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" style={{ color: theme.colors.semantic.status.error }}>
                <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            </div>
            <h3 
              className="font-semibold mb-2"
              style={{ color: theme.colors.semantic.text.primary }}
            >
              Rich Text Editor
            </h3>
            <p 
              className="text-sm"
              style={{ color: theme.colors.semantic.text.secondary }}
            >
              Advanced Tiptap editor with formatting, tables, and more
            </p>
          </div>
        </div>

        {/* Saved Questions */}
        {savedQuestions.length > 0 && (
          <div 
            className="rounded-xl p-6 border-2"
            style={{
              backgroundColor: theme.colors.semantic.surface.primary,
              borderColor: theme.colors.semantic.border.secondary + '30'
            }}
          >
            <h2 
              className="text-xl font-bold mb-4"
              style={{ color: theme.colors.semantic.text.primary }}
            >
              📝 Saved Questions ({savedQuestions.length})
            </h2>
            
            <div className="space-y-4">
              {savedQuestions.map((question) => (
                <div
                  key={question.id}
                  className="p-4 rounded-lg border flex items-start justify-between"
                  style={{
                    backgroundColor: theme.colors.semantic.surface.secondary + '30',
                    borderColor: theme.colors.semantic.border.secondary + '40'
                  }}
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span
                        className="px-3 py-1 rounded-full text-xs font-bold text-white"
                        style={{ backgroundColor: theme.colors.semantic.status.info }}
                      >
                        {question.humanId}
                      </span>
                      <span
                        className="px-2 py-1 rounded text-xs font-medium"
                        style={{ 
                          backgroundColor: theme.colors.semantic.status.success + '20',
                          color: theme.colors.semantic.status.success
                        }}
                      >
                        {question.type.replace('_', ' ')}
                      </span>
                      <span
                        className="px-2 py-1 rounded text-xs font-medium"
                        style={{ 
                          backgroundColor: theme.colors.semantic.status.warning + '20',
                          color: theme.colors.semantic.status.warning
                        }}
                      >
                        {question.difficulty}
                      </span>
                    </div>
                    <p
                      className="font-medium mb-1"
                      style={{ color: theme.colors.semantic.text.primary }}
                    >
                      {question.question}
                    </p>
                    <p
                      className="text-sm"
                      style={{ color: theme.colors.semantic.text.secondary }}
                    >
                      {question.options.length} options • {question.points} point(s)
                      {question.timeLimit && ` • ${question.timeLimit}s`}
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => handleEditQuestion(question.id)}
                      className="p-2 rounded-lg hover:scale-110 transition-all"
                      style={{ backgroundColor: theme.colors.semantic.status.info + '20' }}
                      title="Edit Question"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" style={{ color: theme.colors.semantic.status.info }}>
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                    </button>
                    
                    <button
                      onClick={() => handleDeleteQuestion(question.id)}
                      className="p-2 rounded-lg hover:scale-110 transition-all"
                      style={{ backgroundColor: theme.colors.semantic.status.error + '20' }}
                      title="Delete Question"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" style={{ color: theme.colors.semantic.status.error }}>
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Instructions */}
        <div 
          className="rounded-xl p-6 border-2"
          style={{
            backgroundColor: theme.colors.semantic.surface.primary,
            borderColor: theme.colors.semantic.border.secondary + '30'
          }}
        >
          <h2 
            className="text-xl font-bold mb-4"
            style={{ color: theme.colors.semantic.text.primary }}
          >
            🔧 How to Test
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div>
              <h3 
                className="font-semibold mb-2"
                style={{ color: theme.colors.semantic.text.primary }}
              >
                Create Questions
              </h3>
              <ol className="list-decimal list-inside space-y-1" style={{ color: theme.colors.semantic.text.secondary }}>
                <li>Click "Create New Question"</li>
                <li>Fill in question details</li>
                <li>Use the rich text editor for explanations</li>
                <li>Save to get human-readable ID</li>
              </ol>
            </div>
            
            <div>
              <h3 
                className="font-semibold mb-2"
                style={{ color: theme.colors.semantic.text.primary }}
              >
                Database Features
              </h3>
              <ul className="list-disc list-inside space-y-1" style={{ color: theme.colors.semantic.text.secondary }}>
                <li>Questions saved with unique IDs</li>
                <li>Edit and update existing questions</li>
                <li>Soft delete with confirmation</li>
                <li>Validation and error handling</li>
              </ul>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}