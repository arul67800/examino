'use client';

import React, { useState } from 'react';
import { useTheme } from '@/theme';
import {
  Search,
  Globe,
  Eye,
  Tag,
  Link,
  FileText,
  AlertCircle,
  CheckCircle,
  TrendingUp,
  Target,
  Hash,
  ExternalLink
} from 'lucide-react';
import { SEOData } from '../../types';

interface SEOOptimizationProps {
  seoData: SEOData;
  onChange: (seoData: SEOData) => void;
  title: string;
  excerpt: string;
  content: string;
}

interface SEOScore {
  overall: number;
  factors: {
    title: { score: number; message: string; status: 'good' | 'warning' | 'error' };
    description: { score: number; message: string; status: 'good' | 'warning' | 'error' };
    keywords: { score: number; message: string; status: 'good' | 'warning' | 'error' };
    readability: { score: number; message: string; status: 'good' | 'warning' | 'error' };
    structure: { score: number; message: string; status: 'good' | 'warning' | 'error' };
  };
}

export const SEOOptimization: React.FC<SEOOptimizationProps> = ({
  seoData,
  onChange,
  title,
  excerpt,
  content
}) => {
  const { theme } = useTheme();
  const [newKeyword, setNewKeyword] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Calculate SEO score
  const calculateSEOScore = (): SEOScore => {
    const factors = {
      title: {
        score: seoData.title.length >= 30 && seoData.title.length <= 60 ? 100 : 
               seoData.title.length > 0 ? 70 : 0,
        message: seoData.title.length === 0 ? 'Title is required' :
                seoData.title.length < 30 ? 'Title is too short (aim for 30-60 characters)' :
                seoData.title.length > 60 ? 'Title is too long (aim for 30-60 characters)' :
                'Title length is optimal',
        status: (seoData.title.length >= 30 && seoData.title.length <= 60 ? 'good' :
                seoData.title.length > 0 ? 'warning' : 'error') as 'good' | 'warning' | 'error'
      },
      description: {
        score: seoData.description.length >= 120 && seoData.description.length <= 160 ? 100 :
               seoData.description.length > 0 ? 70 : 0,
        message: seoData.description.length === 0 ? 'Meta description is required' :
                seoData.description.length < 120 ? 'Description is too short (aim for 120-160 characters)' :
                seoData.description.length > 160 ? 'Description is too long (aim for 120-160 characters)' :
                'Description length is optimal',
        status: (seoData.description.length >= 120 && seoData.description.length <= 160 ? 'good' :
                seoData.description.length > 0 ? 'warning' : 'error') as 'good' | 'warning' | 'error'
      },
      keywords: {
        score: seoData.keywords.length >= 3 && seoData.keywords.length <= 10 ? 100 :
               seoData.keywords.length > 0 ? 70 : 0,
        message: seoData.keywords.length === 0 ? 'Add at least 3 keywords' :
                seoData.keywords.length < 3 ? 'Add more keywords (aim for 3-10)' :
                seoData.keywords.length > 10 ? 'Too many keywords (aim for 3-10)' :
                'Keyword count is optimal',
        status: (seoData.keywords.length >= 3 && seoData.keywords.length <= 10 ? 'good' :
                seoData.keywords.length > 0 ? 'warning' : 'error') as 'good' | 'warning' | 'error'
      },
      readability: {
        score: content.length > 300 ? 100 : content.length > 100 ? 70 : 30,
        message: content.length < 100 ? 'Content is too short' :
                content.length < 300 ? 'Content could be longer for better SEO' :
                'Content length is good for SEO',
        status: (content.length > 300 ? 'good' : content.length > 100 ? 'warning' : 'error') as 'good' | 'warning' | 'error'
      },
      structure: {
        score: content.includes('#') ? 100 : 70,
        message: content.includes('#') ? 'Good use of headings' : 'Consider adding headings for better structure',
        status: (content.includes('#') ? 'good' : 'warning') as 'good' | 'warning' | 'error'
      }
    };

    const overall = Math.round(
      Object.values(factors).reduce((sum, factor) => sum + factor.score, 0) / Object.keys(factors).length
    );

    return { overall, factors };
  };

  const seoScore = calculateSEOScore();

  const handleInputChange = (field: keyof SEOData, value: any) => {
    onChange({
      ...seoData,
      [field]: value
    });
  };

  const addKeyword = () => {
    if (newKeyword.trim() && !seoData.keywords.includes(newKeyword.trim())) {
      handleInputChange('keywords', [...seoData.keywords, newKeyword.trim()]);
      setNewKeyword('');
    }
  };

  const removeKeyword = (keyword: string) => {
    handleInputChange('keywords', seoData.keywords.filter(k => k !== keyword));
  };

  const getStatusIcon = (status: 'good' | 'warning' | 'error') => {
    switch (status) {
      case 'good':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#10b981'; // green
    if (score >= 60) return '#f59e0b'; // yellow
    return '#ef4444'; // red
  };

  return (
    <div className="space-y-6">
      {/* SEO Score Overview */}
      <div 
        className="p-6 rounded-xl"
        style={{ backgroundColor: theme.colors.semantic.surface.primary }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 
            className="text-lg font-semibold flex items-center space-x-2"
            style={{ color: theme.colors.semantic.text.primary }}
          >
            <Search className="w-5 h-5" />
            <span>SEO Score</span>
          </h3>
          <div className="flex items-center space-x-2">
            <div 
              className="text-2xl font-bold"
              style={{ color: getScoreColor(seoScore.overall) }}
            >
              {seoScore.overall}%
            </div>
            <div 
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{ 
                backgroundColor: getScoreColor(seoScore.overall) + '20',
                color: getScoreColor(seoScore.overall)
              }}
            >
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Score Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(seoScore.factors).map(([key, factor]) => (
            <div 
              key={key}
              className="flex items-center justify-between p-3 rounded-lg"
              style={{ backgroundColor: theme.colors.semantic.surface.secondary }}
            >
              <div className="flex items-center space-x-2">
                {getStatusIcon(factor.status)}
                <div>
                  <div 
                    className="font-medium capitalize"
                    style={{ color: theme.colors.semantic.text.primary }}
                  >
                    {key}
                  </div>
                  <div 
                    className="text-sm"
                    style={{ color: theme.colors.semantic.text.secondary }}
                  >
                    {factor.message}
                  </div>
                </div>
              </div>
              <div 
                className="font-bold"
                style={{ color: getScoreColor(factor.score) }}
              >
                {factor.score}%
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Basic SEO Settings */}
      <div 
        className="p-6 rounded-xl"
        style={{ backgroundColor: theme.colors.semantic.surface.primary }}
      >
        <h3 
          className="text-lg font-semibold mb-4 flex items-center space-x-2"
          style={{ color: theme.colors.semantic.text.primary }}
        >
          <Globe className="w-5 h-5" />
          <span>Basic SEO Settings</span>
        </h3>

        <div className="space-y-4">
          <div>
            <label 
              className="block text-sm font-medium mb-2"
              style={{ color: theme.colors.semantic.text.primary }}
            >
              SEO Title
            </label>
            <input
              type="text"
              value={seoData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder={title || 'Enter SEO title...'}
              className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 transition-colors duration-200"
              style={{
                backgroundColor: theme.colors.semantic.surface.secondary,
                borderColor: theme.colors.semantic.border.primary,
                color: theme.colors.semantic.text.primary
              }}
            />
            <div 
              className="text-sm mt-1 flex items-center justify-between"
              style={{ color: theme.colors.semantic.text.secondary }}
            >
              <span>Optimal length: 30-60 characters</span>
              <span className={seoData.title.length > 60 ? 'text-red-500' : ''}>{seoData.title.length}/60</span>
            </div>
          </div>

          <div>
            <label 
              className="block text-sm font-medium mb-2"
              style={{ color: theme.colors.semantic.text.primary }}
            >
              Meta Description
            </label>
            <textarea
              value={seoData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder={excerpt || 'Enter meta description...'}
              rows={3}
              className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 transition-colors duration-200 resize-none"
              style={{
                backgroundColor: theme.colors.semantic.surface.secondary,
                borderColor: theme.colors.semantic.border.primary,
                color: theme.colors.semantic.text.primary
              }}
            />
            <div 
              className="text-sm mt-1 flex items-center justify-between"
              style={{ color: theme.colors.semantic.text.secondary }}
            >
              <span>Optimal length: 120-160 characters</span>
              <span className={seoData.description.length > 160 ? 'text-red-500' : ''}>{seoData.description.length}/160</span>
            </div>
          </div>

          <div>
            <label 
              className="block text-sm font-medium mb-2"
              style={{ color: theme.colors.semantic.text.primary }}
            >
              Focus Keywords
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {seoData.keywords.map(keyword => (
                <span
                  key={keyword}
                  className="px-3 py-1 rounded-full text-sm flex items-center space-x-2"
                  style={{
                    backgroundColor: theme.colors.semantic.action.primary + '20',
                    color: theme.colors.semantic.action.primary
                  }}
                >
                  <Hash className="w-3 h-3" />
                  <span>{keyword}</span>
                  <button
                    onClick={() => removeKeyword(keyword)}
                    className="hover:opacity-70"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="flex space-x-2">
              <input
                type="text"
                value={newKeyword}
                onChange={(e) => setNewKeyword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addKeyword()}
                placeholder="Add a keyword..."
                className="flex-1 px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 transition-colors duration-200"
                style={{
                  backgroundColor: theme.colors.semantic.surface.secondary,
                  borderColor: theme.colors.semantic.border.primary,
                  color: theme.colors.semantic.text.primary
                }}
              />
              <button
                onClick={addKeyword}
                className="px-4 py-2 rounded-lg transition-colors duration-200"
                style={{
                  backgroundColor: theme.colors.semantic.action.primary,
                  color: theme.colors.semantic.text.inverse
                }}
              >
                Add
              </button>
            </div>
            <div 
              className="text-sm mt-1"
              style={{ color: theme.colors.semantic.text.secondary }}
            >
              Recommended: 3-10 keywords
            </div>
          </div>
        </div>
      </div>

      {/* Advanced SEO Settings */}
      <div 
        className="p-6 rounded-xl"
        style={{ backgroundColor: theme.colors.semantic.surface.primary }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 
            className="text-lg font-semibold flex items-center space-x-2"
            style={{ color: theme.colors.semantic.text.primary }}
          >
            <Target className="w-5 h-5" />
            <span>Advanced Settings</span>
          </h3>
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-sm px-3 py-1 rounded-lg transition-colors duration-200"
            style={{
              backgroundColor: theme.colors.semantic.surface.secondary,
              color: theme.colors.semantic.text.primary
            }}
          >
            {showAdvanced ? 'Hide' : 'Show'} Advanced
          </button>
        </div>

        {showAdvanced && (
          <div className="space-y-4">
            <div>
              <label 
                className="block text-sm font-medium mb-2"
                style={{ color: theme.colors.semantic.text.primary }}
              >
                Canonical URL
              </label>
              <div className="relative">
                <input
                  type="url"
                  value={seoData.canonicalUrl}
                  onChange={(e) => handleInputChange('canonicalUrl', e.target.value)}
                  placeholder="https://example.com/article-url"
                  className="w-full px-4 py-3 pl-10 rounded-lg border focus:outline-none focus:ring-2 transition-colors duration-200"
                  style={{
                    backgroundColor: theme.colors.semantic.surface.secondary,
                    borderColor: theme.colors.semantic.border.primary,
                    color: theme.colors.semantic.text.primary
                  }}
                />
                <Link className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2" style={{ color: theme.colors.semantic.text.secondary }} />
              </div>
              <div 
                className="text-sm mt-1"
                style={{ color: theme.colors.semantic.text.secondary }}
              >
                Specify the canonical URL to avoid duplicate content issues
              </div>
            </div>

            <div>
              <label 
                className="block text-sm font-medium mb-2"
                style={{ color: theme.colors.semantic.text.primary }}
              >
                Custom Meta Tags
              </label>
              <div className="space-y-2">
                {Object.entries(seoData.metaTags || {}).map(([key, value]) => (
                  <div key={key} className="flex space-x-2">
                    <input
                      type="text"
                      value={key}
                      placeholder="Property name"
                      className="flex-1 px-3 py-2 rounded-lg border focus:outline-none"
                      style={{
                        backgroundColor: theme.colors.semantic.surface.secondary,
                        borderColor: theme.colors.semantic.border.primary,
                        color: theme.colors.semantic.text.primary
                      }}
                    />
                    <input
                      type="text"
                      value={value}
                      placeholder="Content"
                      className="flex-1 px-3 py-2 rounded-lg border focus:outline-none"
                      style={{
                        backgroundColor: theme.colors.semantic.surface.secondary,
                        borderColor: theme.colors.semantic.border.primary,
                        color: theme.colors.semantic.text.primary
                      }}
                    />
                    <button
                      className="px-3 py-2 rounded-lg text-red-500 hover:bg-red-50"
                      onClick={() => {
                        const newTags = { ...seoData.metaTags };
                        delete newTags[key];
                        handleInputChange('metaTags', newTags);
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}
                <button
                  className="w-full px-3 py-2 border-2 border-dashed rounded-lg text-sm transition-colors duration-200"
                  style={{
                    borderColor: theme.colors.semantic.border.primary,
                    color: theme.colors.semantic.text.secondary
                  }}
                  onClick={() => {
                    const newTags = { ...seoData.metaTags, '': '' };
                    handleInputChange('metaTags', newTags);
                  }}
                >
                  Add Meta Tag
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* SEO Preview */}
      <div 
        className="p-6 rounded-xl"
        style={{ backgroundColor: theme.colors.semantic.surface.primary }}
      >
        <h3 
          className="text-lg font-semibold mb-4 flex items-center space-x-2"
          style={{ color: theme.colors.semantic.text.primary }}
        >
          <Eye className="w-5 h-5" />
          <span>Search Engine Preview</span>
        </h3>

        <div 
          className="p-4 rounded-lg border-2"
          style={{ 
            backgroundColor: theme.colors.semantic.background.secondary,
            borderColor: theme.colors.semantic.border.primary
          }}
        >
          <div className="space-y-1">
            <div className="text-lg text-blue-600 hover:underline cursor-pointer line-clamp-1">
              {seoData.title || title || 'Article Title'}
            </div>
            <div className="text-sm text-green-700">
              {seoData.canonicalUrl || 'https://example.com/article-url'}
            </div>
            <div className="text-sm text-gray-600 line-clamp-2">
              {seoData.description || excerpt || 'Article description will appear here...'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};