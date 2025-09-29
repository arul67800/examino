'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
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
  Trash2
} from 'lucide-react';
import { useTheme } from '@/theme';

// Import all modular components
import { RichTextEditor } from './editor/RichTextEditor';
import { SEOOptimization } from './metadata/SEOOptimization';
import { SocialMediaOptimization } from './metadata/SocialMediaOptimization';
import { PublishingSettings } from './metadata/PublishingSettings';
import { MediaManager } from './media/MediaManager';
import { ImageGallery } from './media/ImageGallery';
import { FileManager } from './media/FileManager';
import { AuthorManagement } from './collaboration/AuthorManagement';
import { CommentsSystem } from './collaboration/CommentsSystem';
import { RealtimeCollaboration } from './collaboration/RealtimeCollaboration';
import { ArticleAnalytics } from './analytics/ArticleAnalytics';
import { PreviewSystem } from './analytics/PreviewSystem';

// Import types
import type { 
  ArticleForm, 
  Author, 
  SaveState, 
  ValidationError,
  EditorState,
  CollaborationData 
} from '../types';

interface Tab {
  id: string;
  label: string;
  icon: React.ReactNode;
  component: React.ComponentType<any>;
  shortcut?: string;
}

interface ArticleCreatorProps {
  initialArticle?: Partial<ArticleForm>;
  isTemplate?: boolean;
  templateId?: string;
  onSave?: (article: ArticleForm) => Promise<void>;
  onPublish?: (article: ArticleForm) => Promise<void>;
  onPreview?: (article: ArticleForm) => void;
  onClose?: () => void;
}

const ArticleCreator: React.FC<ArticleCreatorProps> = ({
  initialArticle,
  isTemplate = false,
  templateId,
  onSave,
  onPublish,
  onPreview,
  onClose
}) => {
  const { theme, mode } = useTheme();
  
  // Core state management
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
    readTime: 0,
    difficulty: initialArticle?.difficulty || 'beginner',
    language: initialArticle?.language || 'en',
    contentType: initialArticle?.contentType || 'article',
    priority: initialArticle?.priority || 'medium',
    
    // Author Information
    author: initialArticle?.author || {
      id: 'current-user',
      name: 'Current User',
      email: 'user@example.com',
      avatar: '',
      bio: ''
    },
    coAuthors: initialArticle?.coAuthors || [],
    
    // SEO & Social
    seo: initialArticle?.seo || {
      title: '',
      description: '',
      keywords: [],
      canonicalUrl: '',
      metaTags: {}
    },
    social: initialArticle?.social || {
      title: '',
      description: '',
      image: '',
      twitter: { card: 'summary_large_image' },
      facebook: { type: 'article', locale: 'en_US' }
    },
    
    // Settings
    settings: initialArticle?.settings || {
      isPublic: true,
      allowComments: true,
      enableAnalytics: true,
      tableOfContents: true,
      enableSharing: true,
      requireAuth: false
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
  const [saveState, setSaveState] = useState<SaveState>({
    isSaving: false,
    isAutoSaving: false,
    lastSaved: '',
    hasUnsavedChanges: false
  });

  // Editor state
  const [editorState, setEditorState] = useState<EditorState>({
    mode: 'write',
    device: 'desktop',
    fullscreen: false,
    wordWrap: true,
    showLineNumbers: false,
    theme: 'auto'
  });

  // Collaboration state
  const [collaborationData, setCollaborationData] = useState<CollaborationData>({
    isCollaborative: false,
    activeUsers: [],
    comments: [],
    suggestions: [],
    permissions: {}
  });

  // Store current article in ref for auto-save
  const currentArticleRef = useRef<ArticleForm>(article);
  
  // Update ref when article changes
  useEffect(() => {
    currentArticleRef.current = article;
  }, [article]);

  // Auto-save handler
  const handleAutoSave = useCallback(async () => {
    if (!onSave) return;
    
    setSaveState(prev => ({ ...prev, isAutoSaving: true }));
    
    try {
      await onSave(currentArticleRef.current);
      setSaveState(prev => ({
        ...prev,
        isAutoSaving: false,
        hasUnsavedChanges: false,
        lastSaved: new Date().toISOString()
      }));
    } catch (error) {
      setSaveState(prev => ({
        ...prev,
        isAutoSaving: false,
        saveError: 'Failed to auto-save'
      }));
    }
  }, [onSave]);

  // Update article data
  const updateArticle = useCallback((updates: Partial<ArticleForm>) => {
    setArticle(prev => {
      const updated = { ...prev, ...updates, lastModified: new Date().toISOString() };
      
      // Update analytics
      if (updates.content) {
        updated.analytics = {
          ...updated.analytics,
          wordCount: updates.content.split(' ').length,
          characterCount: updates.content.length,
          lastAnalyzed: new Date().toISOString()
        };
      }
      
      return updated;
    });
    
    setSaveState(prev => ({ ...prev, hasUnsavedChanges: true }));
  }, []);

  // Auto-save functionality
  const autoSaveInterval = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    // Clear existing timeout
    if (autoSaveInterval.current) {
      clearTimeout(autoSaveInterval.current);
    }
    
    // Only set new timeout if there are unsaved changes and not currently saving
    if (saveState.hasUnsavedChanges && !saveState.isSaving && !saveState.isAutoSaving && onSave) {
      autoSaveInterval.current = setTimeout(() => {
        handleAutoSave();
      }, 3000); // Auto-save after 3 seconds of inactivity
    }
    
    return () => {
      if (autoSaveInterval.current) {
        clearTimeout(autoSaveInterval.current);
      }
    };
  }, [saveState.hasUnsavedChanges, saveState.isSaving, saveState.isAutoSaving, onSave, handleAutoSave]);

  // Manual save handler
  const handleSave = useCallback(async () => {
    setSaveState(prev => {
      if (!onSave || prev.isSaving) return prev;
      return { ...prev, isSaving: true };
    });
    
    if (!onSave) return;
    
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
        saveError: 'Failed to save article'
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
    
    // First save the current state
    setSaveState(prev => {
      if (!onSave || prev.isSaving) return prev;
      return { ...prev, isSaving: true };
    });
    
    if (onSave) {
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
          saveError: 'Failed to save article'
        }));
        return; // Don't publish if save failed
      }
    }
    
    await onPublish(publishedArticle);
    setArticle(publishedArticle);
  }, [onPublish, onSave]);

  // Validation
  const validateArticle = useCallback(() => {
    const errors: ValidationError[] = [];
    
    if (!article.title.trim()) {
      errors.push({ field: 'title', message: 'Title is required', type: 'error' });
    }
    
    if (!article.content.trim()) {
      errors.push({ field: 'content', message: 'Content is required', type: 'error' });
    }
    
    if (article.title.length > 60) {
      errors.push({ field: 'title', message: 'Title should be under 60 characters for better SEO', type: 'warning' });
    }
    
    if (!article.seo.description && article.status === 'published') {
      errors.push({ field: 'seo', message: 'SEO description recommended for published articles', type: 'warning' });
    }
    
    setValidationErrors(errors);
    return errors.filter(e => e.type === 'error').length === 0;
  }, [article]);

  // Keyboard shortcuts with stable references
  const articleRef = useRef(article);
  const handleSaveRef = useRef(handleSave);
  const handlePublishRef = useRef(handlePublish);
  const onPreviewRef = useRef(onPreview);
  
  // Update refs when values change
  useEffect(() => {
    articleRef.current = article;
  }, [article]);
  
  useEffect(() => {
    handleSaveRef.current = handleSave;
  }, [handleSave]);
  
  useEffect(() => {
    handlePublishRef.current = handlePublish;
  }, [handlePublish]);
  
  useEffect(() => {
    onPreviewRef.current = onPreview;
  }, [onPreview]);

  useEffect(() => {
    const handleKeyboard = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey)) {
        switch (e.key) {
          case 's':
            e.preventDefault();
            handleSaveRef.current();
            break;
          case 'p':
            e.preventDefault();
            onPreviewRef.current?.(articleRef.current);
            break;
          case 'Enter':
            if (e.shiftKey) {
              e.preventDefault();
              handlePublishRef.current();
            }
            break;
        }
      }
      
      if (e.key === 'Escape' && fullscreen) {
        setFullscreen(false);
      }
    };
    
    window.addEventListener('keydown', handleKeyboard);
    return () => window.removeEventListener('keydown', handleKeyboard);
  }, [fullscreen]);

  // Tab configuration
  const tabs: Tab[] = [
    {
      id: 'editor',
      label: 'Editor',
      icon: <FileText className="w-4 h-4" />,
      component: RichTextEditor,
      shortcut: '⌘1'
    },
    {
      id: 'media',
      label: 'Media',
      icon: <Image className="w-4 h-4" />,
      component: MediaManager,
      shortcut: '⌘2'
    },
    {
      id: 'seo',
      label: 'SEO',
      icon: <Globe className="w-4 h-4" />,
      component: SEOOptimization,
      shortcut: '⌘3'
    },
    {
      id: 'social',
      label: 'Social',
      icon: <Users className="w-4 h-4" />,
      component: SocialMediaOptimization,
      shortcut: '⌘4'
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <Settings className="w-4 h-4" />,
      component: PublishingSettings,
      shortcut: '⌘5'
    },
    {
      id: 'collaboration',
      label: 'Collaborate',
      icon: <Users className="w-4 h-4" />,
      component: RealtimeCollaboration,
      shortcut: '⌘6'
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: <BarChart3 className="w-4 h-4" />,
      component: ArticleAnalytics,
      shortcut: '⌘7'
    },
    {
      id: 'preview',
      label: 'Preview',
      icon: <Eye className="w-4 h-4" />,
      component: PreviewSystem,
      shortcut: '⌘8'
    }
  ];

  const renderActiveComponent = () => {
    switch (activeTab) {
      case 'editor':
        return (
          <RichTextEditor
            content={article.content}
            onChange={(content) => updateArticle({ content })}
            placeholder="Start writing your article..."
            showWordCount={true}
            enableCollaboration={collaborationData.isCollaborative}
            onSave={handleSave}
          />
        );
      case 'media':
        return (
          <MediaManager
            media={article.gallery}
            onMediaChange={(media) => updateArticle({ gallery: media })}
            gallery={article.gallery}
            onGalleryChange={(gallery) => updateArticle({ gallery })}
            featuredImage={article.featuredImage}
            onFeaturedImageChange={(featuredImage) => updateArticle({ featuredImage })}
            allowedTypes={['image', 'video', 'audio', 'document']}
            maxFileSize={10}
          />
        );
      case 'seo':
        return (
          <SEOOptimization
            seoData={article.seo}
            onChange={(seo) => updateArticle({ seo })}
            title={article.title}
            excerpt={article.excerpt}
            content={article.content}
          />
        );
      case 'social':
        return (
          <SocialMediaOptimization
            socialData={article.social}
            onChange={(social) => updateArticle({ social })}
            title={article.title}
            excerpt={article.excerpt}
            featuredImage={article.featuredImage}
          />
        );
      case 'settings':
        return (
          <PublishingSettings
            settings={article.settings}
            onChange={(settings) => updateArticle({ settings })}
            status={article.status}
            onStatusChange={(status) => updateArticle({ status })}
            publishDate={article.publishDate}
            onPublishDateChange={(publishDate) => updateArticle({ publishDate })}
            author={article.author}
            coAuthors={article.coAuthors}
            onCoAuthorsChange={(coAuthors) => updateArticle({ coAuthors })}
          />
        );
      case 'collaboration':
        return (
          <RealtimeCollaboration
            session={{
              id: 'session-1',
              articleId: article.id || 'new',
              isActive: true,
              participants: collaborationData.activeUsers.map(user => ({
                user,
                status: 'active' as const,
                lastSeen: new Date(),
                isTyping: false,
                cursor: null,
                selection: null,
                permissions: {
                  canEdit: true,
                  canComment: true,
                  canView: true
                },
                connectionQuality: 'good' as const
              })),
              lastActivity: new Date()
            }}
            currentUser={article.author}
            onSessionUpdate={() => {}}
            documentChanges={[]}
            onDocumentChanges={() => {}}
          />
        );
      case 'analytics':
        return (
          <ArticleAnalytics
            articleId={article.id || 'new'}
            data={{
              views: { 
                total: 0, 
                unique: 0,
                trend: 0, 
                dailyViews: []
              },
              engagement: { 
                avgTimeOnPage: article.readTime || 0,
                bounceRate: 0,
                shares: 0,
                likes: 0, 
                comments: 0,
                bookmarks: 0
              },
              traffic: {
                sources: {
                  direct: 0,
                  search: 0,
                  social: 0,
                  referral: 0,
                  email: 0
                },
                topReferrers: [],
                countries: []
              },
              performance: {
                loadTime: 0,
                coreWebVitals: { lcp: 0, fid: 0, cls: 0 },
                seoScore: article.analytics.readabilityScore,
                accessibilityScore: 0
              },
              conversions: {
                emailSignups: 0,
                downloads: 0,
                socialFollows: 0,
                customGoals: []
              }
            }}
            onDataRefresh={() => {}}
            dateRange={{ start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), end: new Date() }}
            onDateRangeChange={() => {}}
          />
        );
      case 'preview':
        return (
          <PreviewSystem
            article={article}
            onArticleChange={updateArticle}
          />
        );
      default:
        return (
          <RichTextEditor
            content={article.content}
            onChange={(content) => updateArticle({ content })}
            placeholder="Start writing your article..."
            showWordCount={true}
            enableCollaboration={collaborationData.isCollaborative}
            onSave={handleSave}
          />
        );
    }
  };

  return (
    <div className={`h-screen flex flex-col ${fullscreen ? 'fixed inset-0 z-50' : ''} ${mode !== 'light' ? 'bg-gray-900' : 'bg-white'}`}>
      {/* Header Bar */}
      <div className={`flex items-center justify-between px-6 py-3 border-b ${mode !== 'light' ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'}`}>
        <div className="flex items-center space-x-4">
          {onClose && (
            <button
              onClick={onClose}
              className={`p-2 rounded-lg hover:bg-opacity-80 transition-colors ${mode !== 'light' ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}
              title="Close Editor"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
          
          <div>
            <h1 className={`text-lg font-semibold ${mode !== 'light' ? 'text-white' : 'text-gray-900'}`}>
              {article.title || 'Untitled Article'}
            </h1>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <span className={`px-2 py-1 rounded text-xs ${
                article.status === 'published' ? 'bg-green-100 text-green-800' :
                article.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {article.status.charAt(0).toUpperCase() + article.status.slice(1)}
              </span>
              
              {saveState.hasUnsavedChanges && (
                <span className="flex items-center space-x-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>Unsaved changes</span>
                </span>
              )}
              
              {saveState.isAutoSaving && (
                <span className="flex items-center space-x-1">
                  <Loader className="w-3 h-3 animate-spin" />
                  <span>Auto-saving...</span>
                </span>
              )}
              
              {saveState.lastSaved && (
                <span>Saved {new Date(saveState.lastSaved).toLocaleTimeString()}</span>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Validation Errors Indicator */}
          {validationErrors.length > 0 && (
            <div className="flex items-center space-x-1 text-sm text-red-600">
              <AlertCircle className="w-4 h-4" />
              <span>{validationErrors.length} issue{validationErrors.length !== 1 ? 's' : ''}</span>
            </div>
          )}
          
          {/* Action Buttons */}
          <button
            onClick={() => onPreview?.(article)}
            className={`px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors ${mode !== 'light' ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
            title="Preview Article (⌘P)"
          >
            <Eye className="w-4 h-4 mr-1 inline" />
            Preview
          </button>
          
          <button
            onClick={handleSave}
            disabled={saveState.isSaving || !saveState.hasUnsavedChanges}
            className={`px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors ${
              saveState.isSaving || !saveState.hasUnsavedChanges 
                ? 'opacity-50 cursor-not-allowed' 
                : mode !== 'light' 
                  ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
            title="Save Draft (⌘S)"
          >
            {saveState.isSaving ? (
              <Loader className="w-4 h-4 mr-1 inline animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-1 inline" />
            )}
            Save
          </button>
          
          <button
            onClick={handlePublish}
            disabled={!validateArticle() || saveState.isSaving}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              !validateArticle() || saveState.isSaving
                ? 'opacity-50 cursor-not-allowed bg-gray-300 text-gray-500'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
            title="Publish Article (⌘⇧Enter)"
          >
            <CheckCircle className="w-4 h-4 mr-1 inline" />
            Publish
          </button>
          
          <button
            onClick={() => setFullscreen(!fullscreen)}
            className={`p-2 rounded-lg transition-colors ${mode !== 'light' ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'}`}
            title={fullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          >
            {fullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>
      
      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Navigation */}
        <div className={`${sidebarCollapsed ? 'w-16' : 'w-64'} transition-all duration-200 border-r ${mode !== 'light' ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'} flex flex-col`}>
          <div className="p-4 flex items-center justify-between">
            {!sidebarCollapsed && (
              <h2 className={`font-semibold ${mode !== 'light' ? 'text-white' : 'text-gray-900'}`}>
                Article Tools
              </h2>
            )}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className={`p-1.5 rounded-lg transition-colors ${mode !== 'light' ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}
            >
              {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>
          
          <nav className="flex-1 px-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 mb-1 rounded-lg text-left transition-colors ${
                  activeTab === tab.id
                    ? mode !== 'light'
                      ? 'bg-blue-600 text-white'
                      : 'bg-blue-100 text-blue-900'
                    : mode !== 'light'
                      ? 'text-gray-300 hover:bg-gray-700'
                      : 'text-gray-700 hover:bg-gray-100'
                }`}
                title={sidebarCollapsed ? `${tab.label} ${tab.shortcut || ''}` : undefined}
              >
                {tab.icon}
                {!sidebarCollapsed && (
                  <>
                    <span className="flex-1">{tab.label}</span>
                    {tab.shortcut && (
                      <span className="text-xs opacity-70">{tab.shortcut}</span>
                    )}
                  </>
                )}
              </button>
            ))}
          </nav>
        </div>
        
        {/* Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-auto">
            {renderActiveComponent()}
          </div>
        </div>
      </div>
      
      {/* Validation Errors Panel */}
      {validationErrors.length > 0 && (
        <div className={`border-t p-4 ${mode !== 'light' ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-yellow-50'}`}>
          <h3 className={`font-medium mb-2 ${mode !== 'light' ? 'text-white' : 'text-gray-900'}`}>
            Issues that need attention:
          </h3>
          <div className="space-y-1">
            {validationErrors.map((error, index) => (
              <div 
                key={index} 
                className={`flex items-center space-x-2 text-sm ${
                  error.type === 'error' ? 'text-red-600' : 'text-yellow-600'
                }`}
              >
                <AlertCircle className="w-4 h-4" />
                <span>{error.message}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ArticleCreator;