'use client';

import React, { useState, useEffect } from 'react';
import { Search, X, Eye, RotateCcw, Trash2, AlertTriangle } from 'lucide-react';
import { useTheme } from '@/theme';

interface RejectedQuestion {
  id: string;
  title: string;
  type: 'multiple-choice' | 'true-false' | 'essay';
  subject: string;
  difficulty: 'easy' | 'medium' | 'hard';
  submittedBy: string;
  rejectedBy: string;
  rejectedAt: string;
  reason: string;
  category: 'content' | 'quality' | 'duplicate' | 'inappropriate' | 'technical';
}

export default function RejectedQuestionsPage() {
  const { theme } = useTheme();
  const [questions, setQuestions] = useState<RejectedQuestion[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  useEffect(() => {
    const mockQuestions: RejectedQuestion[] = [
      {
        id: '1',
        title: 'What is the best programming language?',
        type: 'multiple-choice',
        subject: 'Computer Science',
        difficulty: 'medium',
        submittedBy: 'John Doe',
        rejectedBy: 'Admin User',
        rejectedAt: '2024-01-15T10:30:00Z',
        reason: 'Question is too subjective and lacks a definitive answer',
        category: 'content'
      },
      {
        id: '2',
        title: 'What is 2+2?',
        type: 'multiple-choice',
        subject: 'Mathematics',
        difficulty: 'easy',
        submittedBy: 'Jane Smith',
        rejectedBy: 'Admin User',
        rejectedAt: '2024-01-14T15:45:00Z',
        reason: 'Question is too basic for the target audience',
        category: 'quality'
      }
    ];
    setQuestions(mockQuestions);
  }, []);

  const filteredQuestions = questions.filter(question => {
    const matchesSearch = question.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || question.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const handleResubmit = (questionId: string) => {
    alert(`Question ${questionId} resubmitted for review`);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'content': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30';
      case 'quality': return 'text-purple-600 bg-purple-100 dark:bg-purple-900/30';
      case 'duplicate': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30';
      case 'inappropriate': return 'text-red-600 bg-red-100 dark:bg-red-900/30';
      case 'technical': return 'text-orange-600 bg-orange-100 dark:bg-orange-900/30';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-800';
    }
  };

  return (
    <div className="p-6 space-y-6 min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Content Approval - Rejected
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Manage rejected questions and review reasons ({filteredQuestions.length} questions)
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Rejected</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{questions.length}</p>
            </div>
            <X className="w-8 h-8 text-red-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Content Issues</p>
              <p className="text-2xl font-bold text-red-600">
                {questions.filter(q => q.category === 'content').length}
              </p>
            </div>
            <AlertTriangle className="w-8 h-8 text-orange-500" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Quality Issues</p>
              <p className="text-2xl font-bold text-yellow-600">
                {questions.filter(q => q.category === 'quality').length}
              </p>
            </div>
            <AlertTriangle className="w-8 h-8 text-yellow-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Duplicates</p>
              <p className="text-2xl font-bold text-purple-600">
                {questions.filter(q => q.category === 'duplicate').length}
              </p>
            </div>
            <AlertTriangle className="w-8 h-8 text-purple-500" />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg mb-6">
        <div className="flex gap-4 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search rejected questions..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <select
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="all">All Categories</option>
            <option value="content">Content Issues</option>
            <option value="quality">Quality Issues</option>
            <option value="duplicate">Duplicates</option>
            <option value="inappropriate">Inappropriate</option>
            <option value="technical">Technical Issues</option>
          </select>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Rejected Questions ({filteredQuestions.length})
          </h2>
        </div>
        
        <div className="p-6">
          <div className="space-y-4">
            {filteredQuestions.map(question => (
              <div key={question.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                        {question.title}
                      </h3>
                      <X className="w-5 h-5 text-red-500" />
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(question.category)}`}>
                        {question.category.toUpperCase()}
                      </span>
                    </div>
                    
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 mb-4">
                      <div className="flex items-start space-x-2">
                        <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-red-800 dark:text-red-300 mb-1">
                            Rejection Reason:
                          </p>
                          <p className="text-sm text-red-700 dark:text-red-400">
                            {question.reason}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
                      <div><strong>Type:</strong> {question.type}</div>
                      <div><strong>Subject:</strong> {question.subject}</div>
                      <div><strong>Difficulty:</strong> {question.difficulty}</div>
                      <div><strong>Submitted by:</strong> {question.submittedBy}</div>
                    </div>
                    
                    <div className="grid grid-cols-2 lg:grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400">
                      <div><strong>Rejected by:</strong> {question.rejectedBy}</div>
                      <div><strong>Rejected:</strong> {new Date(question.rejectedAt).toLocaleDateString()}</div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2 ml-4">
                    <button className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      View
                    </button>
                    <button 
                      onClick={() => handleResubmit(question.id)}
                      className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-1"
                    >
                      <RotateCcw className="w-4 h-4" />
                      Resubmit
                    </button>
                    <button className="px-3 py-1.5 text-sm bg-red-600 text-white rounded hover:bg-red-700 flex items-center gap-1">
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
            
            {filteredQuestions.length === 0 && (
              <div className="text-center py-12">
                <X className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">
                  No rejected questions found
                </h3>
                <p className="text-gray-500">Try adjusting your search or filters.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
