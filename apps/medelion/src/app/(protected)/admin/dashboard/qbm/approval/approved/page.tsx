'use client';

import React, { useState, useEffect } from 'react';
import { Search, Check, Eye, Archive, TrendingUp } from 'lucide-react';
import { useTheme } from '@/theme';

interface ApprovedQuestion {
  id: string;
  title: string;
  type: 'multiple-choice' | 'true-false' | 'essay';
  subject: string;
  difficulty: 'easy' | 'medium' | 'hard';
  submittedBy: string;
  approvedBy: string;
  approvedAt: string;
  usage: number;
  performance: number;
}

export default function ApprovedQuestionsPage() {
  const { theme } = useTheme();
  const [questions, setQuestions] = useState<ApprovedQuestion[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<string>('newest');

  useEffect(() => {
    const mockQuestions: ApprovedQuestion[] = [
      {
        id: '1',
        title: 'What is the capital of France?',
        type: 'multiple-choice',
        subject: 'Geography',
        difficulty: 'easy',
        submittedBy: 'John Smith',
        approvedBy: 'Admin User',
        approvedAt: '2024-01-15T10:30:00Z',
        usage: 145,
        performance: 92
      },
      {
        id: '2',
        title: 'What is the chemical formula for water?',
        type: 'multiple-choice',
        subject: 'Chemistry',
        difficulty: 'easy',
        submittedBy: 'Emily Davis',
        approvedBy: 'Admin User',
        approvedAt: '2024-01-14T15:45:00Z',
        usage: 89,
        performance: 88
      }
    ];
    setQuestions(mockQuestions);
  }, []);

  const filteredQuestions = questions
    .filter(question => 
      question.title.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'usage': return b.usage - a.usage;
        case 'performance': return b.performance - a.performance;
        default: return new Date(b.approvedAt).getTime() - new Date(a.approvedAt).getTime();
      }
    });

  const getPerformanceColor = (performance: number) => {
    if (performance >= 90) return 'text-green-600';
    if (performance >= 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="p-6 space-y-6 min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Content Approval - Approved
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Manage approved questions ({filteredQuestions.length} questions)
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Approved</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{questions.length}</p>
            </div>
            <Check className="w-8 h-8 text-green-500" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Usage</p>
              <p className="text-2xl font-bold text-blue-600">
                {questions.reduce((sum, q) => sum + q.usage, 0).toLocaleString()}
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Avg Performance</p>
              <p className="text-2xl font-bold text-purple-600">
                {questions.length > 0 ? Math.round(questions.reduce((sum, q) => sum + q.performance, 0) / questions.length) : 0}%
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-purple-500" />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg mb-6">
        <div className="flex gap-4 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search approved questions..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <select
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="newest">Newest First</option>
            <option value="usage">Most Used</option>
            <option value="performance">Best Performance</option>
          </select>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Approved Questions ({filteredQuestions.length})
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
                      <Check className="w-5 h-5 text-green-500" />
                    </div>
                    
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
                      <div><strong>Type:</strong> {question.type}</div>
                      <div><strong>Subject:</strong> {question.subject}</div>
                      <div><strong>Difficulty:</strong> {question.difficulty}</div>
                      <div><strong>Usage:</strong> {question.usage.toLocaleString()} times</div>
                    </div>
                    
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600 dark:text-gray-400">
                      <div><strong>Submitted by:</strong> {question.submittedBy}</div>
                      <div><strong>Approved by:</strong> {question.approvedBy}</div>
                      <div><strong>Approved:</strong> {new Date(question.approvedAt).toLocaleDateString()}</div>
                      <div>
                        <strong>Performance:</strong> 
                        <span className={`ml-1 font-semibold ${getPerformanceColor(question.performance)}`}>
                          {question.performance}%
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2 ml-4">
                    <button className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      View
                    </button>
                    <button className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-1">
                      <Archive className="w-4 h-4" />
                      Archive
                    </button>
                  </div>
                </div>
              </div>
            ))}
            
            {filteredQuestions.length === 0 && (
              <div className="text-center py-12">
                <Check className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">
                  No approved questions found
                </h3>
                <p className="text-gray-500">Try adjusting your search.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
