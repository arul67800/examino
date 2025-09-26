'use client';

import React, { useState, useEffect } from 'react';
import { useTheme } from '@/theme';

interface Question {
  id: string;
  type: 'singleChoice' | 'multipleChoice' | 'trueFalse' | 'assertionReasoning';
  question: string;
  subject: string;
  chapter: string;
  topic: string;
  subtopic?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  status: 'draft' | 'pending' | 'approved' | 'rejected';
  points?: number;
  timeLimit?: number;
  views: number;
  usage: number;
}

interface QuestionStats {
  total: number;
  approved: number;
  pending: number;
  rejected: number;
  draft: number;
  byDifficulty: {
    easy: number;
    medium: number;
    hard: number;
  };
  byType: {
    singleChoice: number;
    multipleChoice: number;
    trueFalse: number;
    assertionReasoning: number;
  };
  bySubject: Record<string, number>;
  recentActivity: Question[];
}

const mockQuestionStats: QuestionStats = {
  total: 1247,
  approved: 896,
  pending: 143,
  rejected: 67,
  draft: 141,
  byDifficulty: {
    easy: 412,
    medium: 534,
    hard: 301
  },
  byType: {
    singleChoice: 523,
    multipleChoice: 398,
    trueFalse: 201,
    assertionReasoning: 125
  },
  bySubject: {
    'Mathematics': 345,
    'Physics': 298,
    'Chemistry': 234,
    'Biology': 189,
    'English': 181
  },
  recentActivity: [
    {
      id: '1',
      type: 'singleChoice',
      question: 'What is the derivative of x²?',
      subject: 'Mathematics',
      chapter: 'Calculus',
      topic: 'Derivatives',
      difficulty: 'medium',
      tags: ['calculus', 'derivatives'],
      createdBy: 'Dr. Smith',
      createdAt: '2025-09-24T10:30:00Z',
      updatedAt: '2025-09-24T10:30:00Z',
      status: 'approved',
      points: 2,
      timeLimit: 60,
      views: 45,
      usage: 12
    },
    {
      id: '2',
      type: 'multipleChoice',
      question: 'Which of the following are noble gases?',
      subject: 'Chemistry',
      chapter: 'Periodic Table',
      topic: 'Groups',
      difficulty: 'easy',
      tags: ['periodic-table', 'noble-gases'],
      createdBy: 'Prof. Johnson',
      createdAt: '2025-09-23T14:15:00Z',
      updatedAt: '2025-09-23T14:15:00Z',
      status: 'pending',
      points: 3,
      timeLimit: 90,
      views: 23,
      usage: 5
    },
    {
      id: '3',
      type: 'trueFalse',
      question: 'Photosynthesis occurs in the mitochondria.',
      subject: 'Biology',
      chapter: 'Cell Biology',
      topic: 'Organelles',
      difficulty: 'easy',
      tags: ['photosynthesis', 'organelles'],
      createdBy: 'Dr. Wilson',
      createdAt: '2025-09-22T09:45:00Z',
      updatedAt: '2025-09-22T09:45:00Z',
      status: 'approved',
      points: 1,
      timeLimit: 30,
      views: 67,
      usage: 18
    }
  ]
};

const mockQuestions: Question[] = [
  ...mockQuestionStats.recentActivity,
  {
    id: '4',
    type: 'assertionReasoning',
    question: 'Consider the assertion and reasoning about photosynthesis.',
    subject: 'Biology',
    chapter: 'Plant Physiology',
    topic: 'Photosynthesis',
    difficulty: 'hard',
    tags: ['photosynthesis', 'assertion-reasoning'],
    createdBy: 'Dr. Brown',
    createdAt: '2025-09-21T16:20:00Z',
    updatedAt: '2025-09-21T16:20:00Z',
    status: 'approved',
    points: 4,
    timeLimit: 120,
    views: 34,
    usage: 8
  },
  {
    id: '5',
    type: 'singleChoice',
    question: 'What is the capital of France?',
    subject: 'Geography',
    chapter: 'Europe',
    topic: 'Countries and Capitals',
    difficulty: 'easy',
    tags: ['geography', 'capitals', 'europe'],
    createdBy: 'Ms. Davis',
    createdAt: '2025-09-20T11:00:00Z',
    updatedAt: '2025-09-20T11:00:00Z',
    status: 'approved',
    points: 1,
    timeLimit: 30,
    views: 89,
    usage: 25
  }
];

export default function QuestionBankDashboard() {
  const { theme } = useTheme();
  const [stats, setStats] = useState<QuestionStats>(mockQuestionStats);
  const [questions, setQuestions] = useState<Question[]>(mockQuestions);
  const [selectedView, setSelectedView] = useState<'overview' | 'browse' | 'search'>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSubject, setFilterSubject] = useState<string>('all');
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return theme.colors.semantic.status.success;
      case 'pending': return theme.colors.semantic.status.warning;
      case 'rejected': return theme.colors.semantic.status.error;
      case 'draft': return theme.colors.semantic.text.secondary;
      default: return theme.colors.semantic.text.secondary;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return theme.colors.semantic.status.success;
      case 'medium': return theme.colors.semantic.status.warning;
      case 'hard': return theme.colors.semantic.status.error;
      default: return theme.colors.semantic.text.secondary;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'singleChoice': return '⚪';
      case 'multipleChoice': return '☑️';
      case 'trueFalse': return '✅';
      case 'assertionReasoning': return '🔗';
      default: return '❓';
    }
  };

  const filteredQuestions = questions.filter(question => {
    const matchesSearch = searchQuery === '' || 
      question.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      question.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      question.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesSubject = filterSubject === 'all' || question.subject === filterSubject;
    const matchesDifficulty = filterDifficulty === 'all' || question.difficulty === filterDifficulty;
    const matchesStatus = filterStatus === 'all' || question.status === filterStatus;
    
    return matchesSearch && matchesSubject && matchesDifficulty && matchesStatus;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: theme.colors.semantic.surface.secondary + '20' }}>
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: theme.colors.semantic.text.primary }}>
              Question Bank
            </h1>
            <p className="text-sm mt-1" style={{ color: theme.colors.semantic.text.secondary }}>
              Browse and manage your question collection
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* View Toggle */}
            <div className="flex rounded-lg overflow-hidden" style={{ backgroundColor: theme.colors.semantic.surface.secondary + '30' }}>
              {[
                { key: 'overview', label: 'Overview', icon: '📊' },
                { key: 'browse', label: 'Browse', icon: '🔍' },
                { key: 'search', label: 'Search', icon: '🔎' }
              ].map((view) => (
                <button
                  key={view.key}
                  onClick={() => setSelectedView(view.key as any)}
                  className={`px-4 py-2 text-sm font-medium transition-all ${
                    selectedView === view.key ? 'shadow-sm' : ''
                  }`}
                  style={{
                    backgroundColor: selectedView === view.key 
                      ? theme.colors.semantic.status.info + '20'
                      : 'transparent',
                    color: selectedView === view.key 
                      ? theme.colors.semantic.status.info 
                      : theme.colors.semantic.text.secondary,
                    borderRight: view.key !== 'search' ? `1px solid ${theme.colors.semantic.border.secondary}30` : 'none'
                  }}
                >
                  <span className="mr-2">{view.icon}</span>
                  {view.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Statistics Overview */}
        {selectedView === 'overview' && (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: 'Total Questions', value: stats.total, color: theme.colors.semantic.status.info, icon: '📚' },
                { label: 'Approved', value: stats.approved, color: theme.colors.semantic.status.success, icon: '✅' },
                { label: 'Pending Review', value: stats.pending, color: theme.colors.semantic.status.warning, icon: '⏳' },
                { label: 'Rejected', value: stats.rejected, color: theme.colors.semantic.status.error, icon: '❌' }
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-xl p-6 border-2"
                  style={{
                    backgroundColor: theme.colors.semantic.surface.primary,
                    borderColor: theme.colors.semantic.border.secondary + '30'
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium" style={{ color: theme.colors.semantic.text.secondary }}>
                        {stat.label}
                      </p>
                      <p className="text-3xl font-bold mt-2" style={{ color: theme.colors.semantic.text.primary }}>
                        {stat.value.toLocaleString()}
                      </p>
                    </div>
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                      style={{ backgroundColor: stat.color + '20' }}
                    >
                      {stat.icon}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Difficulty Distribution */}
              <div
                className="rounded-xl p-6 border-2"
                style={{
                  backgroundColor: theme.colors.semantic.surface.primary,
                  borderColor: theme.colors.semantic.border.secondary + '30'
                }}
              >
                <h3 className="text-lg font-semibold mb-4" style={{ color: theme.colors.semantic.text.primary }}>
                  Questions by Difficulty
                </h3>
                <div className="space-y-4">
                  {Object.entries(stats.byDifficulty).map(([difficulty, count]) => (
                    <div key={difficulty} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: getDifficultyColor(difficulty) }}
                        />
                        <span className="font-medium capitalize" style={{ color: theme.colors.semantic.text.primary }}>
                          {difficulty}
                        </span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div 
                          className="h-2 rounded-full"
                          style={{ 
                            backgroundColor: theme.colors.semantic.surface.secondary + '30',
                            width: '100px'
                          }}
                        >
                          <div 
                            className="h-full rounded-full transition-all"
                            style={{ 
                              backgroundColor: getDifficultyColor(difficulty),
                              width: `${(count / stats.total) * 100}%`
                            }}
                          />
                        </div>
                        <span className="font-semibold w-12 text-right" style={{ color: theme.colors.semantic.text.primary }}>
                          {count}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Subject Distribution */}
              <div
                className="rounded-xl p-6 border-2"
                style={{
                  backgroundColor: theme.colors.semantic.surface.primary,
                  borderColor: theme.colors.semantic.border.secondary + '30'
                }}
              >
                <h3 className="text-lg font-semibold mb-4" style={{ color: theme.colors.semantic.text.primary }}>
                  Questions by Subject
                </h3>
                <div className="space-y-4">
                  {Object.entries(stats.bySubject).map(([subject, count]) => (
                    <div key={subject} className="flex items-center justify-between">
                      <span className="font-medium" style={{ color: theme.colors.semantic.text.primary }}>
                        {subject}
                      </span>
                      <div className="flex items-center space-x-3">
                        <div 
                          className="h-2 rounded-full"
                          style={{ 
                            backgroundColor: theme.colors.semantic.surface.secondary + '30',
                            width: '80px'
                          }}
                        >
                          <div 
                            className="h-full rounded-full transition-all"
                            style={{ 
                              backgroundColor: theme.colors.semantic.status.info,
                              width: `${(count / Math.max(...Object.values(stats.bySubject))) * 100}%`
                            }}
                          />
                        </div>
                        <span className="font-semibold w-8 text-right" style={{ color: theme.colors.semantic.text.primary }}>
                          {count}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div
              className="rounded-xl p-6 border-2"
              style={{
                backgroundColor: theme.colors.semantic.surface.primary,
                borderColor: theme.colors.semantic.border.secondary + '30'
              }}
            >
              <h3 className="text-lg font-semibold mb-4" style={{ color: theme.colors.semantic.text.primary }}>
                Recent Activity
              </h3>
              <div className="space-y-4">
                {stats.recentActivity.map((question) => (
                  <div 
                    key={question.id}
                    className="flex items-center justify-between p-4 rounded-lg"
                    style={{ backgroundColor: theme.colors.semantic.surface.secondary + '20' }}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="text-lg">
                        {getTypeIcon(question.type)}
                      </div>
                      <div>
                        <p className="font-medium" style={{ color: theme.colors.semantic.text.primary }}>
                          {question.question.substring(0, 60)}...
                        </p>
                        <p className="text-sm" style={{ color: theme.colors.semantic.text.secondary }}>
                          {question.subject} • {question.chapter} • By {question.createdBy}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4 text-sm">
                      <span 
                        className="px-2 py-1 rounded-full font-medium"
                        style={{ 
                          backgroundColor: getStatusColor(question.status) + '20',
                          color: getStatusColor(question.status)
                        }}
                      >
                        {question.status}
                      </span>
                      <span style={{ color: theme.colors.semantic.text.secondary }}>
                        {formatDate(question.createdAt)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Browse/Search View */}
        {(selectedView === 'browse' || selectedView === 'search') && (
          <>
            {/* Filters */}
            <div
              className="rounded-xl p-6 border-2"
              style={{
                backgroundColor: theme.colors.semantic.surface.primary,
                borderColor: theme.colors.semantic.border.secondary + '30'
              }}
            >
              <div className="flex flex-wrap items-center gap-4">
                {/* Search */}
                <div className="flex-1 min-w-64">
                  <input
                    type="text"
                    placeholder="Search questions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full p-3 rounded-lg border-2 focus:ring-2 focus:ring-offset-1 transition-all"
                    style={{
                      backgroundColor: theme.colors.semantic.surface.secondary + '20',
                      borderColor: theme.colors.semantic.border.secondary + '40',
                      color: theme.colors.semantic.text.primary
                    }}
                  />
                </div>

                {/* Subject Filter */}
                <div>
                  <select
                    value={filterSubject}
                    onChange={(e) => setFilterSubject(e.target.value)}
                    className="p-3 rounded-lg border-2 focus:ring-2 focus:ring-offset-1 transition-all"
                    style={{
                      backgroundColor: theme.colors.semantic.surface.secondary + '20',
                      borderColor: theme.colors.semantic.border.secondary + '40',
                      color: theme.colors.semantic.text.primary
                    }}
                  >
                    <option value="all">All Subjects</option>
                    {Object.keys(stats.bySubject).map(subject => (
                      <option key={subject} value={subject}>{subject}</option>
                    ))}
                  </select>
                </div>

                {/* Difficulty Filter */}
                <div>
                  <select
                    value={filterDifficulty}
                    onChange={(e) => setFilterDifficulty(e.target.value)}
                    className="p-3 rounded-lg border-2 focus:ring-2 focus:ring-offset-1 transition-all"
                    style={{
                      backgroundColor: theme.colors.semantic.surface.secondary + '20',
                      borderColor: theme.colors.semantic.border.secondary + '40',
                      color: theme.colors.semantic.text.primary
                    }}
                  >
                    <option value="all">All Difficulties</option>
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>

                {/* Status Filter */}
                <div>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="p-3 rounded-lg border-2 focus:ring-2 focus:ring-offset-1 transition-all"
                    style={{
                      backgroundColor: theme.colors.semantic.surface.secondary + '20',
                      borderColor: theme.colors.semantic.border.secondary + '40',
                      color: theme.colors.semantic.text.primary
                    }}
                  >
                    <option value="all">All Status</option>
                    <option value="approved">Approved</option>
                    <option value="pending">Pending</option>
                    <option value="rejected">Rejected</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <span className="text-sm" style={{ color: theme.colors.semantic.text.secondary }}>
                  Showing {filteredQuestions.length} of {questions.length} questions
                </span>
                
                {/* Clear Filters */}
                {(searchQuery || filterSubject !== 'all' || filterDifficulty !== 'all' || filterStatus !== 'all') && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setFilterSubject('all');
                      setFilterDifficulty('all');
                      setFilterStatus('all');
                    }}
                    className="px-4 py-2 rounded-lg text-sm font-medium transition-all hover:shadow-sm"
                    style={{
                      backgroundColor: theme.colors.semantic.status.warning + '15',
                      border: `1px solid ${theme.colors.semantic.status.warning}40`,
                      color: theme.colors.semantic.status.warning
                    }}
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            </div>

            {/* Questions List */}
            <div
              className="rounded-xl border-2 overflow-hidden"
              style={{
                backgroundColor: theme.colors.semantic.surface.primary,
                borderColor: theme.colors.semantic.border.secondary + '30'
              }}
            >
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-4" style={{ color: theme.colors.semantic.text.primary }}>
                  Questions ({filteredQuestions.length})
                </h3>
              </div>

              <div className="divide-y" style={{ borderColor: theme.colors.semantic.border.secondary + '20' }}>
                {filteredQuestions.map((question) => (
                  <div key={question.id} className="p-6 hover:bg-gray-50 transition-all">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <span className="text-lg">{getTypeIcon(question.type)}</span>
                          <span 
                            className="px-2 py-1 rounded text-xs font-medium"
                            style={{ 
                              backgroundColor: getDifficultyColor(question.difficulty) + '20',
                              color: getDifficultyColor(question.difficulty)
                            }}
                          >
                            {question.difficulty}
                          </span>
                          <span 
                            className="px-2 py-1 rounded text-xs font-medium"
                            style={{ 
                              backgroundColor: getStatusColor(question.status) + '20',
                              color: getStatusColor(question.status)
                            }}
                          >
                            {question.status}
                          </span>
                        </div>
                        
                        <h4 className="text-lg font-medium mb-2" style={{ color: theme.colors.semantic.text.primary }}>
                          {question.question}
                        </h4>
                        
                        <div className="flex items-center space-x-4 text-sm" style={{ color: theme.colors.semantic.text.secondary }}>
                          <span>{question.subject}</span>
                          <span>•</span>
                          <span>{question.chapter}</span>
                          <span>•</span>
                          <span>{question.topic}</span>
                          <span>•</span>
                          <span>By {question.createdBy}</span>
                        </div>
                        
                        <div className="flex items-center space-x-4 mt-2 text-sm" style={{ color: theme.colors.semantic.text.secondary }}>
                          <span>👁️ {question.views} views</span>
                          <span>📊 {question.usage} times used</span>
                          <span>📅 {formatDate(question.createdAt)}</span>
                        </div>

                        {question.tags.length > 0 && (
                          <div className="flex items-center space-x-2 mt-3">
                            {question.tags.map((tag) => (
                              <span 
                                key={tag}
                                className="px-2 py-1 rounded-full text-xs"
                                style={{ 
                                  backgroundColor: theme.colors.semantic.status.info + '15',
                                  color: theme.colors.semantic.status.info
                                }}
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2 ml-4">
                        <button
                          className="p-2 rounded-lg transition-all hover:shadow-sm"
                          style={{
                            backgroundColor: theme.colors.semantic.status.info + '15',
                            border: `1px solid ${theme.colors.semantic.status.info}40`,
                            color: theme.colors.semantic.status.info
                          }}
                          title="View Question"
                        >
                          👁️
                        </button>
                        <button
                          className="p-2 rounded-lg transition-all hover:shadow-sm"
                          style={{
                            backgroundColor: theme.colors.semantic.status.success + '15',
                            border: `1px solid ${theme.colors.semantic.status.success}40`,
                            color: theme.colors.semantic.status.success
                          }}
                          title="Edit Question"
                        >
                          ✏️
                        </button>
                        <button
                          className="p-2 rounded-lg transition-all hover:shadow-sm"
                          style={{
                            backgroundColor: theme.colors.semantic.status.error + '15',
                            border: `1px solid ${theme.colors.semantic.status.error}40`,
                            color: theme.colors.semantic.status.error
                          }}
                          title="Delete Question"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {filteredQuestions.length === 0 && (
                <div className="p-12 text-center">
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="text-xl font-semibold mb-2" style={{ color: theme.colors.semantic.text.primary }}>
                    No questions found
                  </h3>
                  <p style={{ color: theme.colors.semantic.text.secondary }}>
                    Try adjusting your search criteria or filters
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}