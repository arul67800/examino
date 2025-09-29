'use client';

import React, { useState, useEffect } from 'react';
import { Search, Clock, Eye, Check, X, AlertCircle, Filter } from 'lucide-react';
import { useTheme } from '@/theme';
import { mcqService, Question } from '@/lib/mcq-service';
import { MCQCard, MCQPreviewModal } from '@/components/admin/question-bank-manager/approval';

interface PendingQuestion extends Question {
  priority: 'low' | 'medium' | 'high';
  submittedBy: string;
  submittedAt: string;
}

export default function PendingApprovalPage() {
  const { theme } = useTheme();
  const [questions, setQuestions] = useState<PendingQuestion[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  const [previewQuestion, setPreviewQuestion] = useState<Question | null>(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);

  useEffect(() => {
    const loadQuestions = async () => {
      try {
        const result = await mcqService.getAllQuestions();
        const mappedQuestions: PendingQuestion[] = result.questions.map((mcq: Question) => ({
          ...mcq,
          submittedBy: mcq.createdBy || 'System',
          submittedAt: mcq.createdAt || new Date().toISOString(),
          priority: 'medium' as const // Default priority
        }));
        setQuestions(mappedQuestions);
      } catch (error) {
        console.error('Error loading questions:', error);
        // Fallback to empty array on error
        setQuestions([]);
      }
    };
    
    loadQuestions();
  }, []);

  const filteredQuestions = questions.filter(question => {
    const matchesSearch = question.question.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority = filterPriority === 'all' || question.priority === filterPriority;
    return matchesSearch && matchesPriority;
  });

  const handleSelectionChange = (questionId: string, selected: boolean) => {
    if (selected) {
      setSelectedQuestions(prev => [...prev, questionId]);
    } else {
      setSelectedQuestions(prev => prev.filter(id => id !== questionId));
    }
  };

  const handleApproveSelected = () => {
    if (selectedQuestions.length === 0) return;
    
    // Here you would call the actual approve logic for selected questions
    alert(`Approving ${selectedQuestions.length} selected questions`);
    setSelectedQuestions([]);
  };

  const handleApprove = (questionId: string) => {
    alert(`Approved question ${questionId}`);
  };

  const handleReject = (questionId: string) => {
    alert(`Rejected question ${questionId}`);
  };

  const handlePreview = (questionId: string) => {
    const question = questions.find(q => q.id === questionId);
    if (question) {
      setPreviewQuestion(question);
      setIsPreviewModalOpen(true);
    }
  };

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedQuestions(filteredQuestions.map(q => q.id));
    } else {
      setSelectedQuestions([]);
    }
  };

  const isAllSelected = filteredQuestions.length > 0 && selectedQuestions.length === filteredQuestions.length;
  const isSomeSelected = selectedQuestions.length > 0 && selectedQuestions.length < filteredQuestions.length;

  return (
    <div className="p-6 space-y-6 min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Content Approval - Pending
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Review and approve submitted questions ({filteredQuestions.length} pending)
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Pending</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{questions.length}</p>
            </div>
            <Clock className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">High Priority</p>
              <p className="text-2xl font-bold text-red-600">
                {questions.filter(q => q.priority === 'high').length}
              </p>
            </div>
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Selected</p>
              <p className="text-2xl font-bold text-purple-600">{selectedQuestions.length}</p>
            </div>
            <Check className="w-8 h-8 text-purple-500" />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg mb-6">
        <div className="flex gap-4 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search questions..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <select
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
          >
            <option value="all">All Priorities</option>
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
          </select>

          <button 
            onClick={handleApproveSelected}
            disabled={selectedQuestions.length === 0}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
          >
            <Check className="w-4 h-4" />
            Approve Selected ({selectedQuestions.length})
          </button>

          <button
            onClick={() => {
              alert(`Approving all ${filteredQuestions.length} questions`);
              // Here you would call the actual approve logic for all filteredQuestions
            }}
            disabled={filteredQuestions.length === 0}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            <Check className="w-4 h-4" />
            Approve All
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={isAllSelected}
                ref={(el) => {
                  if (el) el.indeterminate = isSomeSelected;
                }}
                onChange={(e) => handleSelectAll(e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Questions ({filteredQuestions.length})
              </h2>
            </div>
            {selectedQuestions.length > 0 && (
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {selectedQuestions.length} selected
              </span>
            )}
          </div>
        </div>
        
        <div className="p-6">
          <div className="space-y-6">
            {filteredQuestions.map(question => (
              <MCQCard
                key={question.id}
                question={question}
                priority={question.priority}
                onApprove={handleApprove}
                onReject={handleReject}
                onPreview={handlePreview}
                isSelected={selectedQuestions.includes(question.id)}
                onSelectionChange={handleSelectionChange}
              />
            ))}
            
            {filteredQuestions.length === 0 && (
              <div className="text-center py-12">
                <Clock className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">
                  No questions found
                </h3>
                <p className="text-gray-500">Try adjusting your filters.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      <MCQPreviewModal
        question={previewQuestion}
        isOpen={isPreviewModalOpen}
        onClose={() => {
          setIsPreviewModalOpen(false);
          setPreviewQuestion(null);
        }}
      />
    </div>
  );
}
