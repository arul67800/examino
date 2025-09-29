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
  Clock,
  CheckCircle,
  AlertCircle,
  Loader,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  RotateCcw,
  Trash2,
  X,
  Share2,
  Search,
  Tag,
  Calendar,
  User
} from 'lucide-react';

// Import types (we'll use the existing ones)
import type { 
  ArticleForm, 
  Author, 
  SaveState, 
  ValidationError,
  EditorState,
  CollaborationData,
  SEOData,
  SocialData,
  ArticleSettings,
  ArticleAnalytics,
  MediaItem
} from '../types';

interface Tab {
  id: string;
  label: string;
  icon: React.ReactNode;
  shortcut?: string;
}

interface ArticleCreatorAdvancedProps {
  initialArticle?: Partial<ArticleForm>;
  isTemplate?: boolean;
  templateId?: string;
  onSave?: (article: ArticleForm) => Promise<void>;
  onPublish?: (article: ArticleForm) => Promise<void>;
  onPreview?: (article: ArticleForm) => void;
  onClose?: () => void;
}

const ArticleCreatorAdvanced: React.FC<ArticleCreatorAdvancedProps> = ({
  initialArticle,
  isTemplate = false,
  templateId,
  onSave,
  onPublish,
  onPreview,
  onClose
}) => {
  // Core state management with stable initialization
  const [article, setArticle] = useState<ArticleForm>(() => ({
    // Basic Information
    id: initialArticle?.id || '',
    title: initialArticle?.title || '',
    subtitle: initialArticle?.subtitle || '',
    excerpt: initialArticle?.excerpt || '',
    content: initialArticle?.content || '',
    
    // Categorization
    category: initialArticle?.category || '',
    subcategory: initialArticle?.subcategory || '',
    tags: initialArticle?.tags || [],
    
    // Publishing
    status: initialArticle?.status || 'draft',
    publishDate: initialArticle?.publishDate || new Date().toISOString(),
    lastModified: new Date().toISOString(),
    
    // Media
    featuredImage: initialArticle?.featuredImage || '',
    gallery: initialArticle?.gallery || [],
    
    // Metadata
    readTime: initialArticle?.readTime || 5,
    difficulty: initialArticle?.difficulty || 'beginner',
    language: initialArticle?.language || 'en',
    contentType: initialArticle?.contentType || 'article',
    priority: initialArticle?.priority || 'medium',
    
    // Author Information
    author: initialArticle?.author || {
      id: '1',
      name: 'Current User',
      email: 'user@example.com',
      avatar: '',
      bio: '',
      isVerified: false
    },
    coAuthors: initialArticle?.coAuthors || [],
    
    // SEO & Social
    seo: initialArticle?.seo || {
      title: '',
      description: '',
      keywords: [],
      canonicalUrl: '',
      metaTags: {},
      slug: '',
      alt: ''
    },
    social: initialArticle?.social || {
      title: '',
      description: '',
      image: '',
      twitter: {
        card: 'summary_large_image',
        site: '',
        creator: '',
        title: '',
        description: '',
        image: ''
      },
      facebook: {
        type: 'article',
        locale: 'en_US',
        title: '',
        description: '',
        image: ''
      }
    },
    
    // Settings
    settings: initialArticle?.settings || {
      isPublic: true,
      allowComments: true,
      enableAnalytics: true,
      tableOfContents: true,
      enableSharing: true,
      requireAuth: false,
      ageRestriction: undefined,
      contentWarning: undefined
    },
    
    // Analytics
    analytics: initialArticle?.analytics || {
      wordCount: 0,
      characterCount: 0,
      estimatedViews: 0,
      readabilityScore: 0,
      keywordDensity: {},
      lastAnalyzed: new Date().toISOString()
    },
    
    // Educational Content
    educational: initialArticle?.educational || {
      targetAudience: [],
      prerequisites: [],
      learningOutcomes: [],
      skillLevel: 'beginner',
      estimatedCompletionTime: 0,
      certificationEligible: false
    },
    
    // Resources & References
    resources: initialArticle?.resources || [],
    attachments: initialArticle?.attachments || []
  }));

  // UI State
  const [activeTab, setActiveTab] = useState('editor');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);

  // Save State
  const [saveState, setSaveState] = useState<SaveState>({
    isSaving: false,
    isAutoSaving: false,
    lastSaved: '',
    hasUnsavedChanges: false,
    saveError: undefined
  });

  // Editor State
  const [editorState, setEditorState] = useState<EditorState>({
    mode: 'write',
    device: 'desktop',
    fullscreen: false,
    wordWrap: true,
    showLineNumbers: false,
    theme: 'light'
  });

  // Collaboration State
  const [collaborationData, setCollaborationData] = useState<CollaborationData>({
    isCollaborative: false,
    activeUsers: [],
    comments: [],
    suggestions: [],
    permissions: {}
  });

  // Refs for stable references
  const currentArticleRef = useRef<ArticleForm>(article);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Update article ref when article changes
  useEffect(() => {
    currentArticleRef.current = article;
  }, [article]);

  // Auto-save handler with stable reference
  const handleAutoSave = useCallback(async () => {
    if (!onSave) return;
    
    setSaveState(prev => ({ ...prev, isAutoSaving: true }));
    
    try {
      await onSave(currentArticleRef.current);
      setSaveState(prev => ({
        ...prev,
        isAutoSaving: false,
        hasUnsavedChanges: false,
        lastSaved: new Date().toISOString(),
        saveError: undefined
      }));
    } catch (error) {
      setSaveState(prev => ({
        ...prev,
        isAutoSaving: false,
        saveError: 'Auto-save failed'
      }));
    }
  }, [onSave]);

  // Auto-save effect with proper cleanup
  useEffect(() => {
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }
    
    if (saveState.hasUnsavedChanges && !saveState.isSaving && !saveState.isAutoSaving && onSave) {
      autoSaveTimeoutRef.current = setTimeout(() => {
        handleAutoSave();
      }, 3000);
    }
    
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [saveState.hasUnsavedChanges, saveState.isSaving, saveState.isAutoSaving, onSave, handleAutoSave]);

  // Update article function
  const updateArticle = useCallback((updates: Partial<ArticleForm>) => {
    setArticle(prev => {
      const updated = { ...prev, ...updates, lastModified: new Date().toISOString() };
      
      // Update analytics if content changed
      if (updates.content) {
        updated.analytics = {
          ...updated.analytics,
          wordCount: updates.content.split(/\s+/).filter(word => word.length > 0).length,
          characterCount: updates.content.length,
          lastAnalyzed: new Date().toISOString()
        };
      }
      
      return updated;
    });
    
    setSaveState(prev => ({ ...prev, hasUnsavedChanges: true }));
  }, []);

  // Save handler
  const handleSave = useCallback(async () => {
    if (!onSave || saveState.isSaving) return;
    
    setSaveState(prev => ({ ...prev, isSaving: true }));
    
    try {
      await onSave(currentArticleRef.current);
      setSaveState(prev => ({
        ...prev,
        isSaving: false,
        hasUnsavedChanges: false,
        lastSaved: new Date().toISOString(),
        saveError: undefined
      }));
    } catch (error) {
      setSaveState(prev => ({
        ...prev,
        isSaving: false,
        saveError: 'Save failed'
      }));
    }
  }, [onSave]);

  // Publish handler
  const handlePublish = useCallback(async () => {
    if (!onPublish) return;
    
    const publishedArticle = {
      ...currentArticleRef.current,
      status: 'published' as const,
      publishDate: new Date().toISOString()
    };
    
    // Save first if there are changes
    if (saveState.hasUnsavedChanges && onSave) {
      setSaveState(prev => ({ ...prev, isSaving: true }));
      try {
        await onSave(currentArticleRef.current);
        setSaveState(prev => ({
          ...prev,
          isSaving: false,
          hasUnsavedChanges: false,
          lastSaved: new Date().toISOString(),
          saveError: undefined
        }));
      } catch (error) {
        setSaveState(prev => ({
          ...prev,
          isSaving: false,
          saveError: 'Save failed'
        }));
        return;
      }
    }
    
    await onPublish(publishedArticle);
    setArticle(publishedArticle);
  }, [onPublish, onSave, saveState.hasUnsavedChanges]);

  // Preview handler
  const handlePreview = useCallback(() => {
    if (onPreview) {
      onPreview(currentArticleRef.current);
    }
  }, [onPreview]);

  // Define tabs with enhanced features
  const tabs: Tab[] = [
    { id: 'editor', label: 'Editor', icon: <FileText size={16} />, shortcut: 'Cmd+1' },
    { id: 'seo', label: 'SEO', icon: <Globe size={16} />, shortcut: 'Cmd+2' },
    { id: 'social', label: 'Social', icon: <Share2 size={16} />, shortcut: 'Cmd+3' },
    { id: 'publishing', label: 'Publishing', icon: <Settings size={16} />, shortcut: 'Cmd+4' },
    { id: 'media', label: 'Media', icon: <Image size={16} />, shortcut: 'Cmd+5' },
    { id: 'collaboration', label: 'Collaboration', icon: <Users size={16} />, shortcut: 'Cmd+6' },
    { id: 'analytics', label: 'Analytics', icon: <BarChart3 size={16} />, shortcut: 'Cmd+7' },
    { id: 'preview', label: 'Preview', icon: <Eye size={16} />, shortcut: 'Cmd+8' }
  ];

  // Advanced Rich Text Editor Component
  const RichTextEditorComponent = () => (
    <div className="space-y-4">
      <div className="border border-gray-300 rounded-lg">
        <div className="flex items-center space-x-2 p-3 border-b border-gray-200 bg-gray-50">
          <button className="p-2 hover:bg-gray-200 rounded" title="Bold">
            <strong>B</strong>
          </button>
          <button className="p-2 hover:bg-gray-200 rounded" title="Italic">
            <em>I</em>
          </button>
          <button className="p-2 hover:bg-gray-200 rounded" title="Underline">
            <u>U</u>
          </button>
          <div className="w-px h-6 bg-gray-300"></div>
          <button className="p-2 hover:bg-gray-200 rounded" title="Link">
            🔗
          </button>
          <button className="p-2 hover:bg-gray-200 rounded" title="Image">
            🖼️
          </button>
          <button className="p-2 hover:bg-gray-200 rounded" title="Code">
            &lt;&gt;
          </button>
        </div>
        <textarea
          value={article.content}
          onChange={(e) => updateArticle({ content: e.target.value })}
          className="w-full h-96 p-4 border-0 resize-none focus:outline-none font-mono text-sm"
          placeholder="Start writing your article..."
        />
      </div>
      <div className="flex justify-between text-xs text-gray-500">
        <span>{article.analytics.wordCount} words • {article.analytics.characterCount} characters</span>
        <span>Est. reading time: {Math.ceil(article.analytics.wordCount / 200)} min</span>
      </div>
    </div>
  );

  // SEO Component
  const SEOComponent = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">SEO Title</label>
          <input
            type="text"
            value={article.seo.title}
            onChange={(e) => updateArticle({ 
              seo: { ...article.seo, title: e.target.value } 
            })}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter SEO title..."
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Meta Description</label>
          <textarea
            value={article.seo.description}
            onChange={(e) => updateArticle({ 
              seo: { ...article.seo, description: e.target.value } 
            })}
            rows={3}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter meta description..."
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Keywords</label>
          <input
            type="text"
            value={article.seo.keywords.join(', ')}
            onChange={(e) => updateArticle({ 
              seo: { 
                ...article.seo, 
                keywords: e.target.value.split(',').map(k => k.trim()).filter(Boolean)
              } 
            })}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="keyword1, keyword2, keyword3..."
          />
        </div>
      </div>
    </div>
  );

  // Analytics Component
  const AnalyticsComponent = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 border border-gray-200 rounded-lg">
          <h3 className="font-semibold text-gray-900">Word Count</h3>
          <p className="text-2xl font-bold text-blue-600">{article.analytics.wordCount}</p>
        </div>
        <div className="p-4 border border-gray-200 rounded-lg">
          <h3 className="font-semibold text-gray-900">Reading Time</h3>
          <p className="text-2xl font-bold text-green-600">{Math.ceil(article.analytics.wordCount / 200)} min</p>
        </div>
        <div className="p-4 border border-gray-200 rounded-lg">
          <h3 className="font-semibold text-gray-900">Characters</h3>
          <p className="text-2xl font-bold text-purple-600">{article.analytics.characterCount}</p>
        </div>
        <div className="p-4 border border-gray-200 rounded-lg">
          <h3 className="font-semibold text-gray-900">Readability</h3>
          <p className="text-2xl font-bold text-orange-600">Good</p>
        </div>
      </div>
      
      <div className="p-4 border border-gray-200 rounded-lg">
        <h3 className="font-semibold text-gray-900 mb-3">Content Analysis</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Paragraphs:</span>
            <span>{article.content.split('\n\n').filter(Boolean).length}</span>
          </div>
          <div className="flex justify-between">
            <span>Sentences:</span>
            <span>{article.content.split(/[.!?]+/).filter(Boolean).length}</span>
          </div>
          <div className="flex justify-between">
            <span>Average words per sentence:</span>
            <span>{Math.round(article.analytics.wordCount / Math.max(1, article.content.split(/[.!?]+/).filter(Boolean).length))}</span>
          </div>
        </div>
      </div>
    </div>
  );

  // Render tab content based on active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case 'editor':
        return (
          <div className="p-6">
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-4">
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
                  <label className="block text-sm font-medium mb-2">Excerpt</label>
                  <textarea
                    value={article.excerpt}
                    onChange={(e) => updateArticle({ excerpt: e.target.value })}
                    rows={3}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Brief summary of the article..."
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Content</label>
                <RichTextEditorComponent />
              </div>
            </div>
          </div>
        );
        
      case 'seo':
        return (
          <div className="p-6">
            <SEOComponent />
          </div>
        );
        
      case 'analytics':
        return (
          <div className="p-6">
            <AnalyticsComponent />
          </div>
        );
        
      case 'preview':
        return (
          <div className="p-6">
            <div className="max-w-4xl mx-auto">
              <div className="prose prose-lg">
                <h1>{article.title}</h1>
                {article.subtitle && <h2 className="text-gray-600">{article.subtitle}</h2>}
                {article.excerpt && (
                  <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-blue-500">
                    <p className="text-gray-700 italic">{article.excerpt}</p>
                  </div>
                )}
                <div className="whitespace-pre-wrap">{article.content}</div>
              </div>
            </div>
          </div>
        );
        
      default:
        return (
          <div className="p-6 flex items-center justify-center h-64">
            <div className="text-center text-gray-500">
              <div className="text-4xl mb-2">🚧</div>
              <p>This feature is under development</p>
              <p className="text-sm">Tab: {activeTab}</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className={`h-screen flex flex-col bg-white ${fullscreen ? 'fixed inset-0 z-50' : ''}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-semibold">
            {isTemplate ? 'Edit Template' : 'Create Article'}
          </h1>
          
          {/* Status indicators */}
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <span className={`px-2 py-1 rounded text-xs font-medium ${
              article.status === 'published' ? 'bg-green-100 text-green-800' :
              article.status === 'draft' ? 'bg-gray-100 text-gray-800' :
              'bg-yellow-100 text-yellow-800'
            }`}>
              {article.status}
            </span>
            
            {saveState.isAutoSaving && (
              <div className="flex items-center space-x-1">
                <Loader size={14} className="animate-spin" />
                <span>Auto-saving...</span>
              </div>
            )}
            
            {saveState.hasUnsavedChanges && !saveState.isAutoSaving && (
              <div className="flex items-center space-x-1">
                <AlertCircle size={14} className="text-orange-500" />
                <span>Unsaved changes</span>
              </div>
            )}
            
            {saveState.lastSaved && (
              <span>
                Saved {new Date(saveState.lastSaved).toLocaleTimeString()}
              </span>
            )}
          </div>
        </div>
        
        {/* Action buttons */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handleSave}
            disabled={saveState.isSaving}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {saveState.isSaving ? <Loader size={16} className="animate-spin" /> : <Save size={16} />}
            <span>{saveState.isSaving ? 'Saving...' : 'Save'}</span>
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
          
          <button
            onClick={() => setFullscreen(!fullscreen)}
            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            {fullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
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
        <div className={`${sidebarCollapsed ? 'w-16' : 'w-64'} transition-all duration-200 border-r border-gray-200 bg-gray-50`}>
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              {!sidebarCollapsed && <span className="font-medium text-gray-900">Navigation</span>}
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="p-1 hover:bg-gray-200 rounded"
              >
                {sidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
              </button>
            </div>
            
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
                  title={sidebarCollapsed ? tab.label : undefined}
                >
                  {tab.icon}
                  {!sidebarCollapsed && (
                    <>
                      <span className="font-medium">{tab.label}</span>
                      {tab.shortcut && (
                        <span className="text-xs text-gray-400 ml-auto">{tab.shortcut}</span>
                      )}
                    </>
                  )}
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

export default ArticleCreatorAdvanced;