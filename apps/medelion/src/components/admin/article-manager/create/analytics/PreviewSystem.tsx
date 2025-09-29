'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '@/theme';
import {
  Monitor,
  Tablet,
  Smartphone,
  Eye,
  EyeOff,
  Settings,
  Share2,
  ExternalLink,
  Maximize2,
  Minimize2,
  RotateCcw,
  Printer,
  Download,
  Globe,
  Sun,
  Moon,
  Contrast,
  Type,
  Accessibility,
  Search,
  Facebook,
  Twitter,
  Linkedin,
  Mail
} from 'lucide-react';
import { ArticleForm, MediaItem } from '../../types';

interface PreviewSystemProps {
  article: ArticleForm;
  onArticleChange: (article: ArticleForm) => void;
}

interface DeviceConfig {
  id: string;
  name: string;
  icon: React.ReactNode;
  width: number;
  height: number;
  userAgent: string;
}

interface PreviewMode {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
}

const devices: DeviceConfig[] = [
  {
    id: 'desktop',
    name: 'Desktop',
    icon: <Monitor className="w-4 h-4" />,
    width: 1920,
    height: 1080,
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  },
  {
    id: 'tablet',
    name: 'Tablet',
    icon: <Tablet className="w-4 h-4" />,
    width: 768,
    height: 1024,
    userAgent: 'Mozilla/5.0 (iPad; CPU OS 14_0 like Mac OS X) AppleWebKit/605.1.15'
  },
  {
    id: 'mobile',
    name: 'Mobile',
    icon: <Smartphone className="w-4 h-4" />,
    width: 375,
    height: 812,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15'
  }
];

const previewModes: PreviewMode[] = [
  {
    id: 'published',
    name: 'Published View',
    icon: <Eye className="w-4 h-4" />,
    description: 'How readers will see the published article'
  },
  {
    id: 'seo',
    name: 'SEO Preview',
    icon: <Search className="w-4 h-4" />,
    description: 'How the article appears in search results'
  },
  {
    id: 'social-facebook',
    name: 'Facebook',
    icon: <Facebook className="w-4 h-4" />,
    description: 'Facebook sharing preview'
  },
  {
    id: 'social-twitter',
    name: 'Twitter',
    icon: <Twitter className="w-4 h-4" />,
    description: 'Twitter card preview'
  },
  {
    id: 'social-linkedin',
    name: 'LinkedIn',
    icon: <Linkedin className="w-4 h-4" />,
    description: 'LinkedIn sharing preview'
  },
  {
    id: 'email',
    name: 'Email',
    icon: <Mail className="w-4 h-4" />,
    description: 'Email newsletter preview'
  },
  {
    id: 'print',
    name: 'Print',
    icon: <Printer className="w-4 h-4" />,
    description: 'Print-friendly version'
  },
  {
    id: 'accessibility',
    name: 'Accessibility',
    icon: <Accessibility className="w-4 h-4" />,
    description: 'Screen reader and accessibility preview'
  }
];

const PreviewFrame: React.FC<{
  article: ArticleForm;
  device: DeviceConfig;
  mode: PreviewMode;
  theme: 'light' | 'dark';
  fontSize: number;
  contrast: 'normal' | 'high';
}> = ({ article, device, mode, theme, fontSize, contrast }) => {
  const { theme: appTheme } = useTheme();
  
  const getPreviewContent = () => {
    switch (mode.id) {
      case 'published':
        return (
          <div 
            className={`p-6 font-serif ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'} ${contrast === 'high' ? 'contrast-125' : ''}`}
            style={{ fontSize: `${fontSize}px`, lineHeight: 1.6 }}
          >
            {/* Article Header */}
            <header className="mb-8">
              <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
                {article.title || 'Untitled Article'}
              </h1>
              
              {article.subtitle && (
                <p className="text-lg md:text-xl text-gray-600 mb-4 leading-relaxed">
                  {article.subtitle}
                </p>
              )}

              <div className="flex items-center space-x-4 text-sm text-gray-500 mb-6">
                <span>By {article.author?.name || 'Author'}</span>
                <span>•</span>
                <span>{new Date().toLocaleDateString()}</span>
                <span>•</span>
                <span>{Math.ceil((article.content?.length || 0) / 200)} min read</span>
              </div>

              {article.featuredImage && (
                <img 
                  src={article.featuredImage} 
                  alt={article.seo?.alt || article.title}
                  className="w-full h-64 md:h-96 object-cover rounded-lg mb-6"
                />
              )}
            </header>

            {/* Article Content */}
            <div className="prose prose-lg max-w-none">
              {article.content ? (
                <div dangerouslySetInnerHTML={{ __html: article.content }} />
              ) : (
                <p className="text-gray-500 italic">No content available</p>
              )}
            </div>

            {/* Article Footer */}
            <footer className="mt-12 pt-8 border-t">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {article.tags && article.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {article.tags.map((tag, index) => (
                        <span 
                          key={index}
                          className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="flex items-center space-x-2">
                  <button className="p-2 hover:bg-gray-100 rounded-full">
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </footer>
          </div>
        );

      case 'seo':
        return (
          <div className="p-4 bg-white">
            <div className="max-w-2xl">
              <h3 className="text-xl text-blue-600 mb-2 hover:underline cursor-pointer">
                {article.seo?.title || article.title || 'Untitled Article'}
              </h3>
              <p className="text-green-700 text-sm mb-2">
                https://example.com/articles/{article.seo?.slug || 'article-slug'}
              </p>
              <p className="text-gray-600 text-sm leading-relaxed">
                {article.seo?.description || article.subtitle || 'No meta description available'}
              </p>
              
              {article.featuredImage && (
                <div className="mt-3 flex">
                  <img 
                    src={article.featuredImage}
                    alt={article.seo?.alt || ''}
                    className="w-24 h-16 object-cover rounded mr-3"
                  />
                </div>
              )}
            </div>
          </div>
        );

      case 'social-facebook':
        return (
          <div className="p-4 bg-gray-100">
            <div className="bg-white rounded-lg shadow-sm border max-w-md">
              {article.social?.facebook?.image || article.featuredImage ? (
                <img 
                  src={article.social?.facebook?.image || article.featuredImage}
                  alt=""
                  className="w-full h-48 object-cover rounded-t-lg"
                />
              ) : null}
              
              <div className="p-4">
                <p className="text-gray-500 text-xs uppercase mb-1">example.com</p>
                <h4 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                  {article.social?.facebook?.title || article.title || 'Untitled Article'}
                </h4>
                <p className="text-gray-600 text-sm line-clamp-3">
                  {article.social?.facebook?.description || article.subtitle || 'No description available'}
                </p>
              </div>
            </div>
          </div>
        );

      case 'social-twitter':
        return (
          <div className="p-4 bg-white">
            <div className="border rounded-2xl max-w-md overflow-hidden">
              {article.social?.twitter?.image || article.featuredImage ? (
                <img 
                  src={article.social?.twitter?.image || article.featuredImage}
                  alt=""
                  className="w-full h-48 object-cover"
                />
              ) : null}
              
              <div className="p-4">
                <h4 className="font-semibold text-gray-900 mb-1 line-clamp-2">
                  {article.social?.twitter?.title || article.title || 'Untitled Article'}
                </h4>
                <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                  {article.social?.twitter?.description || article.subtitle || 'No description available'}
                </p>
                <p className="text-gray-500 text-sm">
                  🔗 example.com
                </p>
              </div>
            </div>
          </div>
        );

      case 'email':
        return (
          <div className="p-4 bg-gray-100">
            <div className="bg-white max-w-2xl mx-auto" style={{ fontFamily: 'Georgia, serif' }}>
              {/* Email Header */}
              <div className="p-6 border-b">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Weekly Newsletter</h2>
                <p className="text-gray-600">Your weekly dose of insights</p>
              </div>

              {/* Article Preview */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {article.title || 'Untitled Article'}
                </h3>
                
                {article.featuredImage && (
                  <img 
                    src={article.featuredImage}
                    alt=""
                    className="w-full h-48 object-cover rounded mb-4"
                  />
                )}
                
                <p className="text-gray-700 mb-4 leading-relaxed">
                  {article.subtitle || 'Preview of the article content...'}
                </p>
                
                <a 
                  href="#" 
                  className="inline-block bg-blue-600 text-white px-6 py-3 rounded font-medium hover:bg-blue-700"
                >
                  Read Full Article
                </a>
              </div>

              {/* Email Footer */}
              <div className="p-6 bg-gray-50 border-t text-center">
                <p className="text-gray-600 text-sm">
                  You received this because you're subscribed to our newsletter.
                </p>
              </div>
            </div>
          </div>
        );

      case 'print':
        return (
          <div className="p-8 bg-white text-black font-serif" style={{ fontSize: '12pt', lineHeight: 1.5 }}>
            <header className="mb-8 text-center">
              <h1 className="text-2xl font-bold mb-2">
                {article.title || 'Untitled Article'}
              </h1>
              <p className="text-lg mb-4">
                {article.subtitle}
              </p>
              <div className="text-sm text-gray-600">
                By {article.author?.name || 'Author'} | {new Date().toLocaleDateString()}
              </div>
            </header>

            <div className="prose prose-print max-w-none">
              {article.content ? (
                <div dangerouslySetInnerHTML={{ __html: article.content }} />
              ) : (
                <p>No content available</p>
              )}
            </div>

            <footer className="mt-8 pt-4 border-t text-center text-sm text-gray-600">
              <p>Originally published at example.com</p>
            </footer>
          </div>
        );

      case 'accessibility':
        return (
          <div className="p-6 bg-black text-green-400 font-mono text-sm">
            <div className="mb-4">
              <strong>[SCREEN READER OUTPUT]</strong>
            </div>
            
            <div className="space-y-2">
              <p>&gt; Article: {article.title || 'Untitled Article'}</p>
              <p>&gt; Heading level 1: {article.title || 'Untitled Article'}</p>
              {article.subtitle && (
                <p>&gt; Subtitle: {article.subtitle}</p>
              )}
              <p>&gt; Author: {article.author?.name || 'Author'}</p>
              <p>&gt; Publication date: {new Date().toLocaleDateString()}</p>
              
              {article.featuredImage && (
                <p>&gt; Image: {article.seo?.alt || 'Featured image'}</p>
              )}
              
              <p>&gt; Main content begins...</p>
              
              {article.content && (
                <p>&gt; Content length: {Math.ceil(article.content.length / 200)} minutes reading time</p>
              )}
              
              {article.tags && article.tags.length > 0 && (
                <p>&gt; Tags: {article.tags.join(', ')}</p>
              )}
              
              <p>&gt; End of article</p>
            </div>
            
            <div className="mt-6 pt-4 border-t border-green-700">
              <p className="text-green-600">
                <strong>Accessibility Score:</strong> {85}/100 - Good
              </p>
              <p className="text-yellow-400">
                ⚠ Missing: Alt text for some images
              </p>
            </div>
          </div>
        );

      default:
        return <div>Preview not available for this mode</div>;
    }
  };

  return (
    <div 
      className="w-full h-full overflow-auto border rounded-lg"
      style={{ 
        width: device.width > 0 ? `${device.width}px` : '100%',
        height: device.height > 0 ? `${device.height}px` : '100%',
        maxWidth: '100%',
        maxHeight: '100%'
      }}
    >
      {getPreviewContent()}
    </div>
  );
};

export const PreviewSystem: React.FC<PreviewSystemProps> = ({
  article,
  onArticleChange
}) => {
  const { theme } = useTheme();
  const [selectedDevice, setSelectedDevice] = useState<DeviceConfig>(devices[0]);
  const [selectedMode, setSelectedMode] = useState<PreviewMode>(previewModes[0]);
  const [previewTheme, setPreviewTheme] = useState<'light' | 'dark'>('light');
  const [fontSize, setFontSize] = useState(16);
  const [contrast, setContrast] = useState<'normal' | 'high'>('normal');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const previewContainerRef = useRef<HTMLDivElement>(null);

  const handleFullscreen = () => {
    if (!isFullscreen && previewContainerRef.current) {
      previewContainerRef.current.requestFullscreen?.();
      setIsFullscreen(true);
    } else if (document.fullscreenElement) {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const generatePreviewUrl = () => {
    // In a real application, this would generate a shareable preview URL
    const baseUrl = 'https://preview.example.com';
    const params = new URLSearchParams({
      article: article.id || Date.now().toString(),
      device: selectedDevice.id,
      mode: selectedMode.id,
      theme: previewTheme,
      fontSize: fontSize.toString(),
      contrast
    });
    return `${baseUrl}?${params.toString()}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 
            className="text-lg font-semibold"
            style={{ color: theme.colors.semantic.text.primary }}
          >
            Article Preview
          </h3>
          <p 
            className="text-sm"
            style={{ color: theme.colors.semantic.text.secondary }}
          >
            See how your article appears across different platforms and devices
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 rounded-lg border transition-colors duration-200"
            style={{
              backgroundColor: showSettings ? theme.colors.semantic.action.primary : theme.colors.semantic.surface.secondary,
              borderColor: theme.colors.semantic.border.primary,
              color: showSettings ? theme.colors.semantic.text.inverse : theme.colors.semantic.text.primary
            }}
          >
            <Settings className="w-4 h-4" />
          </button>

          <button
            onClick={handleFullscreen}
            className="p-2 rounded-lg border transition-colors duration-200"
            style={{
              backgroundColor: theme.colors.semantic.surface.secondary,
              borderColor: theme.colors.semantic.border.primary,
              color: theme.colors.semantic.text.primary
            }}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          <button
            onClick={() => window.open(generatePreviewUrl(), '_blank')}
            className="p-2 rounded-lg border transition-colors duration-200"
            style={{
              backgroundColor: theme.colors.semantic.surface.secondary,
              borderColor: theme.colors.semantic.border.primary,
              color: theme.colors.semantic.text.primary
            }}
          >
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="space-y-4">
        {/* Device Selection */}
        <div>
          <label 
            className="block text-sm font-medium mb-2"
            style={{ color: theme.colors.semantic.text.primary }}
          >
            Device
          </label>
          <div className="flex space-x-2">
            {devices.map((device) => (
              <button
                key={device.id}
                onClick={() => setSelectedDevice(device)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg border transition-colors duration-200 ${
                  selectedDevice.id === device.id ? 'ring-2' : ''
                }`}
                style={{
                  backgroundColor: selectedDevice.id === device.id ? theme.colors.semantic.action.primary : theme.colors.semantic.surface.secondary,
                  borderColor: theme.colors.semantic.border.primary,
                  color: selectedDevice.id === device.id ? theme.colors.semantic.text.inverse : theme.colors.semantic.text.primary
                }}
              >
                {device.icon}
                <span className="text-sm">{device.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Preview Mode Selection */}
        <div>
          <label 
            className="block text-sm font-medium mb-2"
            style={{ color: theme.colors.semantic.text.primary }}
          >
            Preview Mode
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {previewModes.map((mode) => (
              <button
                key={mode.id}
                onClick={() => setSelectedMode(mode)}
                className={`flex items-center space-x-2 p-3 rounded-lg border transition-colors duration-200 text-left ${
                  selectedMode.id === mode.id ? 'ring-2' : ''
                }`}
                style={{
                  backgroundColor: selectedMode.id === mode.id ? theme.colors.semantic.action.primary : theme.colors.semantic.surface.secondary,
                  borderColor: theme.colors.semantic.border.primary,
                  color: selectedMode.id === mode.id ? theme.colors.semantic.text.inverse : theme.colors.semantic.text.primary
                }}
                title={mode.description}
              >
                {mode.icon}
                <div>
                  <div className="text-sm font-medium">{mode.name}</div>
                  <div 
                    className="text-xs opacity-75"
                    style={{ 
                      color: selectedMode.id === mode.id ? theme.colors.semantic.text.inverse : theme.colors.semantic.text.secondary 
                    }}
                  >
                    {mode.description}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div 
            className="p-4 rounded-lg border"
            style={{ 
              backgroundColor: theme.colors.semantic.surface.secondary,
              borderColor: theme.colors.semantic.border.primary 
            }}
          >
            <h4 
              className="font-medium mb-4"
              style={{ color: theme.colors.semantic.text.primary }}
            >
              Preview Settings
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Theme Toggle */}
              <div>
                <label 
                  className="block text-sm font-medium mb-2"
                  style={{ color: theme.colors.semantic.text.primary }}
                >
                  Theme
                </label>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setPreviewTheme('light')}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg border flex-1 ${
                      previewTheme === 'light' ? 'ring-2' : ''
                    }`}
                    style={{
                      backgroundColor: previewTheme === 'light' ? theme.colors.semantic.action.primary : theme.colors.semantic.surface.primary,
                      borderColor: theme.colors.semantic.border.primary,
                      color: previewTheme === 'light' ? theme.colors.semantic.text.inverse : theme.colors.semantic.text.primary
                    }}
                  >
                    <Sun className="w-4 h-4" />
                    <span className="text-sm">Light</span>
                  </button>
                  <button
                    onClick={() => setPreviewTheme('dark')}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg border flex-1 ${
                      previewTheme === 'dark' ? 'ring-2' : ''
                    }`}
                    style={{
                      backgroundColor: previewTheme === 'dark' ? theme.colors.semantic.action.primary : theme.colors.semantic.surface.primary,
                      borderColor: theme.colors.semantic.border.primary,
                      color: previewTheme === 'dark' ? theme.colors.semantic.text.inverse : theme.colors.semantic.text.primary
                    }}
                  >
                    <Moon className="w-4 h-4" />
                    <span className="text-sm">Dark</span>
                  </button>
                </div>
              </div>

              {/* Font Size */}
              <div>
                <label 
                  className="block text-sm font-medium mb-2"
                  style={{ color: theme.colors.semantic.text.primary }}
                >
                  Font Size
                </label>
                <div className="flex items-center space-x-2">
                  <Type className="w-4 h-4" style={{ color: theme.colors.semantic.text.secondary }} />
                  <input
                    type="range"
                    min="12"
                    max="24"
                    value={fontSize}
                    onChange={(e) => setFontSize(parseInt(e.target.value))}
                    className="flex-1"
                  />
                  <span 
                    className="text-sm w-8"
                    style={{ color: theme.colors.semantic.text.secondary }}
                  >
                    {fontSize}px
                  </span>
                </div>
              </div>

              {/* Contrast */}
              <div>
                <label 
                  className="block text-sm font-medium mb-2"
                  style={{ color: theme.colors.semantic.text.primary }}
                >
                  Contrast
                </label>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setContrast('normal')}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg border flex-1 ${
                      contrast === 'normal' ? 'ring-2' : ''
                    }`}
                    style={{
                      backgroundColor: contrast === 'normal' ? theme.colors.semantic.action.primary : theme.colors.semantic.surface.primary,
                      borderColor: theme.colors.semantic.border.primary,
                      color: contrast === 'normal' ? theme.colors.semantic.text.inverse : theme.colors.semantic.text.primary
                    }}
                  >
                    <span className="text-sm">Normal</span>
                  </button>
                  <button
                    onClick={() => setContrast('high')}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg border flex-1 ${
                      contrast === 'high' ? 'ring-2' : ''
                    }`}
                    style={{
                      backgroundColor: contrast === 'high' ? theme.colors.semantic.action.primary : theme.colors.semantic.surface.primary,
                      borderColor: theme.colors.semantic.border.primary,
                      color: contrast === 'high' ? theme.colors.semantic.text.inverse : theme.colors.semantic.text.primary
                    }}
                  >
                    <Contrast className="w-4 h-4" />
                    <span className="text-sm">High</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Preview Container */}
      <div 
        ref={previewContainerRef}
        className={`relative border rounded-lg overflow-hidden ${isFullscreen ? 'fixed inset-0 z-50 bg-white' : ''}`}
        style={{ 
          backgroundColor: theme.colors.semantic.surface.primary,
          borderColor: theme.colors.semantic.border.primary,
          minHeight: isFullscreen ? '100vh' : '600px'
        }}
      >
        {/* Preview Frame */}
        <div className="w-full h-full flex items-center justify-center p-4">
          <div 
            className="transition-all duration-300"
            style={{
              transform: selectedDevice.id !== 'desktop' && !isFullscreen ? 'scale(0.8)' : 'scale(1)',
              transformOrigin: 'center center'
            }}
          >
            <PreviewFrame
              article={article}
              device={selectedDevice}
              mode={selectedMode}
              theme={previewTheme}
              fontSize={fontSize}
              contrast={contrast}
            />
          </div>
        </div>

        {/* Preview Info Overlay */}
        <div 
          className="absolute top-4 left-4 px-3 py-2 rounded-lg text-sm"
          style={{ 
            backgroundColor: theme.colors.semantic.surface.secondary,
            border: `1px solid ${theme.colors.semantic.border.primary}`,
            color: theme.colors.semantic.text.primary
          }}
        >
          <div className="flex items-center space-x-2">
            {selectedDevice.icon}
            <span>{selectedDevice.name}</span>
            <span>•</span>
            <span>{selectedMode.name}</span>
            {selectedDevice.width > 0 && (
              <>
                <span>•</span>
                <span>{selectedDevice.width}×{selectedDevice.height}</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};