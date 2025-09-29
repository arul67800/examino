'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { 
  Save, 
  Eye, 
  Settings, 
  Users, 
  BarChart3, 
  Image, 
  FileText, 
  Globe, 
  X
} from 'lucide-react';

interface ArticleForm {
  id: string;
  title: string;
  subtitle: string;
  excerpt: string;
  content: string;
  category: string;
  subcategory: string;
  tags: string[];
  status: 'draft' | 'published' | 'scheduled' | 'archived';
  publishDate: string;
  lastModified: string;
}

interface Tab {
  id: string;
  label: string;
  icon: React.ReactNode;
}

interface ArticleCreatorProps {
  initialArticle?: Partial<ArticleForm>;
  onSave?: (article: ArticleForm) => Promise<void>;
  onPublish?: (article: ArticleForm) => Promise<void>;
  onPreview?: (article: ArticleForm) => void;
  onClose?: () => void;
}

const ArticleCreatorClean: React.FC<ArticleCreatorProps> = ({
  initialArticle,
  onSave,
  onPublish,
  onPreview,
  onClose
}) => {
  // Initialize article state
  const [article, setArticle] = useState<ArticleForm>(() => ({
    id: initialArticle?.id || '',
    title: initialArticle?.title || '',
    subtitle: initialArticle?.subtitle || '',
    excerpt: initialArticle?.excerpt || '',
    content: initialArticle?.content || '',
    category: initialArticle?.category || '',
    subcategory: initialArticle?.subcategory || '',
    tags: initialArticle?.tags || [],
    status: initialArticle?.status || 'draft',
    publishDate: initialArticle?.publishDate || new Date().toISOString(),
    lastModified: new Date().toISOString(),
  }));

  const [activeTab, setActiveTab] = useState('editor');
  const [isSaving, setIsSaving] = useState(false);

  // Stable reference for article
  const articleRef = useRef(article);
  articleRef.current = article;

  // Define tabs
  const tabs: Tab[] = [
    { id: 'editor', label: 'Editor', icon: <FileText size={16} /> },
    { id: 'seo', label: 'SEO', icon: <Globe size={16} /> },
    { id: 'social', label: 'Social', icon: <Users size={16} /> },
    { id: 'publishing', label: 'Publishing', icon: <Settings size={16} /> },
    { id: 'media', label: 'Media', icon: <Image size={16} /> },
    { id: 'analytics', label: 'Analytics', icon: <BarChart3 size={16} /> },
  ];

  // Update article function
  const updateArticle = useCallback((updates: Partial<ArticleForm>) => {
    setArticle(prev => ({
      ...prev,
      ...updates,
      lastModified: new Date().toISOString()
    }));
  }, []);

  // Save handler
  const handleSave = useCallback(async () => {
    if (!onSave || isSaving) return;
    
    setIsSaving(true);
    try {
      await onSave(articleRef.current);
    } catch (error) {
      console.error('Save failed:', error);
    } finally {
      setIsSaving(false);
    }
  }, [onSave, isSaving]);

  // Publish handler
  const handlePublish = useCallback(async () => {
    if (!onPublish) return;
    
    const publishedArticle = {
      ...articleRef.current,
      status: 'published' as const,
      publishDate: new Date().toISOString()
    };
    
    try {
      await onPublish(publishedArticle);
      setArticle(publishedArticle);
    } catch (error) {
      console.error('Publish failed:', error);
    }
  }, [onPublish]);

  // Preview handler
  const handlePreview = useCallback(() => {
    if (onPreview) {
      onPreview(articleRef.current);
    }
  }, [onPreview]);

  // Render tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'editor':
        return (
          <div className="p-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Title</label>
                <input
                  type="text"
                  value={article.title}
                  onChange={(e) => updateArticle({ title: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter article title..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Subtitle</label>
                <input
                  type="text"
                  value={article.subtitle}
                  onChange={(e) => updateArticle({ subtitle: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter subtitle..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Content</label>
                <textarea
                  value={article.content}
                  onChange={(e) => updateArticle({ content: e.target.value })}
                  rows={20}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  placeholder="Write your article content..."
                />
              </div>
            </div>
          </div>
        );
      
      default:
        return (
          <div className="p-6 flex items-center justify-center h-64">
            <div className="text-center text-gray-500">
              <div className="text-4xl mb-2">🚧</div>
              <p>This tab is under development</p>
              <p className="text-sm">Tab: {activeTab}</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-semibold">Create Article</h1>
          <span className="text-sm text-gray-500">
            {article.status} • Last modified: {new Date(article.lastModified).toLocaleTimeString()}
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <Save size={16} />
            <span>{isSaving ? 'Saving...' : 'Save'}</span>
          </button>
          
          <button
            onClick={handlePreview}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Eye size={16} />
            <span>Preview</span>
          </button>
          
          <button
            onClick={handlePublish}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <span>Publish</span>
          </button>
          
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar with tabs */}
        <div className="w-64 border-r border-gray-200 bg-gray-50">
          <div className="p-4">
            <nav className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-100 text-blue-700 border border-blue-200'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {tab.icon}
                  <span className="font-medium">{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 overflow-auto">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default ArticleCreatorClean;