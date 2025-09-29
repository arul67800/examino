'use client';

import React from 'react';
import { useTheme } from '@/theme';
import { useRouter } from 'next/navigation';
import { 
  FileText, 
  Plus, 
  Eye, 
  Edit,
  Trash2,
  Clock 
} from 'lucide-react';

interface Article {
  id: string;
  title: string;
  excerpt: string;
  status: 'draft' | 'published' | 'archived';
  author: string;
  createdAt: string;
  updatedAt: string;
  readTime: number;
  category: string;
}

const mockArticles: Article[] = [
  {
    id: '1',
    title: 'Understanding Quadratic Equations',
    excerpt: 'A comprehensive guide to solving quadratic equations with multiple methods and real-world applications.',
    status: 'published',
    author: 'Dr. Sarah Johnson',
    createdAt: '2024-01-15',
    updatedAt: '2024-01-20',
    readTime: 8,
    category: 'Mathematics'
  },
  {
    id: '2',
    title: 'Introduction to Cellular Biology',
    excerpt: 'Explore the fundamental concepts of cellular structure and function in this detailed article.',
    status: 'draft',
    author: 'Prof. Michael Chen',
    createdAt: '2024-01-10',
    updatedAt: '2024-01-25',
    readTime: 12,
    category: 'Biology'
  },
  {
    id: '3',
    title: 'The Industrial Revolution Timeline',
    excerpt: 'A chronological overview of key events and innovations during the Industrial Revolution.',
    status: 'published',
    author: 'Dr. Emily Davis',
    createdAt: '2024-01-08',
    updatedAt: '2024-01-22',
    readTime: 6,
    category: 'History'
  }
];

export default function ArticleBankOverviewPage() {
  const { theme } = useTheme();
  const router = useRouter();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return theme.colors.semantic.status.success;
      case 'draft':
        return theme.colors.semantic.status.warning;
      case 'archived':
        return theme.colors.semantic.text.secondary;
      default:
        return theme.colors.semantic.text.secondary;
    }
  };

  const stats = {
    total: mockArticles.length,
    published: mockArticles.filter(a => a.status === 'published').length,
    draft: mockArticles.filter(a => a.status === 'draft').length,
    archived: mockArticles.filter(a => a.status === 'archived').length
  };

  return (
    <div 
      className="min-h-screen p-6"
      style={{ backgroundColor: theme.colors.semantic.background.secondary }}
    >
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 
              className="text-3xl font-bold"
              style={{ color: theme.colors.semantic.text.primary }}
            >
              Article Bank Manager
            </h1>
            <p 
              className="text-lg mt-2"
              style={{ color: theme.colors.semantic.text.secondary }}
            >
              Manage your educational articles and content
            </p>
          </div>
          <button
            onClick={() => router.push('/admin/dashboard/abm/create')}
            className="flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:opacity-90 shadow-lg"
            style={{
              backgroundColor: theme.colors.semantic.action.primary,
              color: theme.colors.semantic.text.inverse
            }}
          >
            <Plus className="w-5 h-5" />
            <span>Create Article</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div 
            className="p-6 rounded-xl shadow-sm"
            style={{ backgroundColor: theme.colors.semantic.surface.primary }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p 
                  className="text-sm font-medium"
                  style={{ color: theme.colors.semantic.text.secondary }}
                >
                  Total Articles
                </p>
                <p 
                  className="text-2xl font-bold mt-1"
                  style={{ color: theme.colors.semantic.text.primary }}
                >
                  {stats.total}
                </p>
              </div>
              <FileText 
                className="w-8 h-8"
                style={{ color: theme.colors.semantic.action.primary }}
              />
            </div>
          </div>

          <div 
            className="p-6 rounded-xl shadow-sm"
            style={{ backgroundColor: theme.colors.semantic.surface.primary }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p 
                  className="text-sm font-medium"
                  style={{ color: theme.colors.semantic.text.secondary }}
                >
                  Published
                </p>
                <p 
                  className="text-2xl font-bold mt-1"
                  style={{ color: theme.colors.semantic.status.success }}
                >
                  {stats.published}
                </p>
              </div>
              <Eye 
                className="w-8 h-8"
                style={{ color: theme.colors.semantic.status.success }}
              />
            </div>
          </div>

          <div 
            className="p-6 rounded-xl shadow-sm"
            style={{ backgroundColor: theme.colors.semantic.surface.primary }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p 
                  className="text-sm font-medium"
                  style={{ color: theme.colors.semantic.text.secondary }}
                >
                  Drafts
                </p>
                <p 
                  className="text-2xl font-bold mt-1"
                  style={{ color: theme.colors.semantic.status.warning }}
                >
                  {stats.draft}
                </p>
              </div>
              <Edit 
                className="w-8 h-8"
                style={{ color: theme.colors.semantic.status.warning }}
              />
            </div>
          </div>

          <div 
            className="p-6 rounded-xl shadow-sm"
            style={{ backgroundColor: theme.colors.semantic.surface.primary }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p 
                  className="text-sm font-medium"
                  style={{ color: theme.colors.semantic.text.secondary }}
                >
                  Archived
                </p>
                <p 
                  className="text-2xl font-bold mt-1"
                  style={{ color: theme.colors.semantic.text.secondary }}
                >
                  {stats.archived}
                </p>
              </div>
              <Trash2 
                className="w-8 h-8"
                style={{ color: theme.colors.semantic.text.secondary }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Articles List */}
      <div 
        className="rounded-xl shadow-sm"
        style={{ backgroundColor: theme.colors.semantic.surface.primary }}
      >
        <div className="p-6 border-b" style={{ borderColor: theme.colors.semantic.border.secondary }}>
          <h2 
            className="text-xl font-semibold"
            style={{ color: theme.colors.semantic.text.primary }}
          >
            Recent Articles
          </h2>
        </div>

        <div className="divide-y" style={{ borderColor: theme.colors.semantic.border.secondary }}>
          {mockArticles.map((article) => (
            <div key={article.id} className="p-6 hover:bg-opacity-50 transition-colors duration-200">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 
                      className="text-lg font-semibold"
                      style={{ color: theme.colors.semantic.text.primary }}
                    >
                      {article.title}
                    </h3>
                    <span 
                      className="px-3 py-1 rounded-full text-xs font-medium"
                      style={{ 
                        backgroundColor: getStatusColor(article.status) + '20',
                        color: getStatusColor(article.status)
                      }}
                    >
                      {article.status.charAt(0).toUpperCase() + article.status.slice(1)}
                    </span>
                  </div>
                  
                  <p 
                    className="text-sm mb-3"
                    style={{ color: theme.colors.semantic.text.secondary }}
                  >
                    {article.excerpt}
                  </p>
                  
                  <div className="flex items-center space-x-4 text-xs">
                    <span style={{ color: theme.colors.semantic.text.secondary }}>
                      By {article.author}
                    </span>
                    <span 
                      className="px-2 py-1 rounded"
                      style={{ 
                        backgroundColor: theme.colors.semantic.action.primary + '15',
                        color: theme.colors.semantic.action.primary
                      }}
                    >
                      {article.category}
                    </span>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>{article.readTime} min read</span>
                    </div>
                    <span>Updated {article.updatedAt}</span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 ml-4">
                  <button 
                    className="p-2 rounded-lg transition-colors duration-200"
                    style={{ 
                      backgroundColor: theme.colors.semantic.surface.secondary,
                      color: theme.colors.semantic.text.primary
                    }}
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button 
                    className="p-2 rounded-lg transition-colors duration-200"
                    style={{ 
                      backgroundColor: theme.colors.semantic.surface.secondary,
                      color: theme.colors.semantic.text.primary
                    }}
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button 
                    className="p-2 rounded-lg transition-colors duration-200"
                    style={{ 
                      backgroundColor: theme.colors.semantic.surface.secondary,
                      color: theme.colors.semantic.text.primary
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}