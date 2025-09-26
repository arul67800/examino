'use client';

import React, { useState, useEffect } from 'react';
import { Search, Clock, Eye, Check, X, AlertCircle, Filter } from 'lucide-react';
import { useTheme } from '@/theme';

interface PendingQuestion {
  id: string;
  title: string;
  type: 'multiple-choice' | 'true-false' | 'essay';
  subject: string;
  difficulty: 'easy' | 'medium' | 'hard';
  submittedBy: string;
  submittedAt: string;
  priority: 'low' | 'medium' | 'high';
}

export default function PendingApprovalPage() {
  const { theme } = useTheme();
  const [questions, setQuestions] = useState<PendingQuestion[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);

  useEffect(() => {
    const mockQuestions: PendingQuestion[] = [
      {
        id: '1',
        title: 'What is the capital of France?',
        type: 'multiple-choice',
        subject: 'Geography',
        difficulty: 'easy',
        submittedBy: 'John Smith',
        submittedAt: '2024-01-15T10:30:00Z',
        priority: 'medium'
      },
      {
        id: '2',
        title: 'Explain the theory of relativity',
        type: 'essay',
        subject: 'Physics',
        difficulty: 'hard',
        submittedBy: 'Sarah Wilson',
        submittedAt: '2024-01-14T15:45:00Z',
        priority: 'high'
      },
      {
        id: '3',
        title: 'True or False: Photosynthesis occurs in chloroplasts',
        type: 'true-false',
        subject: 'Biology',
        difficulty: 'medium',
        submittedBy: 'Mike Johnson',
        submittedAt: '2024-01-13T09:20:00Z',
        priority: 'low'
      }
    ];
    setQuestions(mockQuestions);
  }, []);

  const filteredQuestions = questions.filter(question => {
    const matchesSearch = question.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority = filterPriority === 'all' || question.priority === filterPriority;
    return matchesSearch && matchesPriority;
  });

  const handleBulkApprove = () => {
    alert(`Approving ${selectedQuestions.length} questions`);
    setSelectedQuestions([]);
  };

  const handleApprove = (questionId: string) => {
    alert(`Approved question ${questionId}`);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';  
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

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
            onClick={handleBulkApprove}
            disabled={selectedQuestions.length === 0}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
          >
            <Check className="w-4 h-4" />
            Approve Selected
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Questions ({filteredQuestions.length})
          </h2>
        </div>
        
        <div className="p-6">
          <div className="space-y-4">
            {filteredQuestions.map(question => (
              <div key={question.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                        {question.title}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(question.priority)}`}>
                        {question.priority}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
                      <span><strong>Type:</strong> {question.type}</span>
                      <span><strong>Subject:</strong> {question.subject}</span>
                      <span><strong>Difficulty:</strong> {question.difficulty}</span>
                      <span><strong>By:</strong> {question.submittedBy}</span>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2 ml-4">
                    <button className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      Preview
                    </button>
                    <button 
                      onClick={() => handleApprove(question.id)}
                      className="px-3 py-1.5 text-sm bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-1"
                    >
                      <Check className="w-4 h-4" />
                      Approve
                    </button>
                    <button className="px-3 py-1.5 text-sm bg-red-600 text-white rounded hover:bg-red-700 flex items-center gap-1">
                      <X className="w-4 h-4" />
                      Reject
                    </button>
                  </div>
                </div>
              </div>
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
    </div>
  );
}
