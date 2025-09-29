'use client';

import React, { useState } from 'react';
import { useTheme } from '@/theme';
import {
  Share2,
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  Image,
  Eye,
  Copy,
  ExternalLink,
  Monitor,
  Tablet,
  Smartphone
} from 'lucide-react';
import { SocialData } from '../../types';

interface SocialMediaOptimizationProps {
  socialData: SocialData;
  onChange: (socialData: SocialData) => void;
  title: string;
  excerpt: string;
  featuredImage: string;
}

export const SocialMediaOptimization: React.FC<SocialMediaOptimizationProps> = ({
  socialData,
  onChange,
  title,
  excerpt,
  featuredImage
}) => {
  const { theme } = useTheme();
  const [previewPlatform, setPreviewPlatform] = useState<'facebook' | 'twitter' | 'linkedin'>('facebook');
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');

  const handleInputChange = (field: keyof SocialData, value: any) => {
    onChange({
      ...socialData,
      [field]: value
    });
  };

  const handleNestedChange = (parent: keyof SocialData, field: string, value: any) => {
    onChange({
      ...socialData,
      [parent]: {
        ...(socialData[parent] as any),
        [field]: value
      }
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  const getPlatformPreview = () => {
    const displayTitle = socialData.title || title || 'Article Title';
    const displayDescription = socialData.description || excerpt || 'Article description...';
    const displayImage = socialData.image || featuredImage || 'https://via.placeholder.com/600x315';

    switch (previewPlatform) {
      case 'facebook':
        return (
          <div 
            className="border rounded-lg overflow-hidden"
            style={{ 
              backgroundColor: theme.colors.semantic.surface.primary,
              borderColor: theme.colors.semantic.border.primary,
              maxWidth: previewDevice === 'mobile' ? '375px' : '500px'
            }}
          >
            <img 
              src={displayImage} 
              alt="Preview" 
              className="w-full h-48 object-cover"
              style={{ backgroundColor: theme.colors.semantic.surface.secondary }}
            />
            <div className="p-4">
              <div className="text-xs text-gray-500 uppercase mb-1">example.com</div>
              <div 
                className="font-semibold text-lg leading-tight mb-1 line-clamp-2"
                style={{ color: theme.colors.semantic.text.primary }}
              >
                {displayTitle}
              </div>
              <div 
                className="text-sm line-clamp-2"
                style={{ color: theme.colors.semantic.text.secondary }}
              >
                {displayDescription}
              </div>
            </div>
          </div>
        );

      case 'twitter':
        return (
          <div 
            className="border rounded-xl overflow-hidden"
            style={{ 
              backgroundColor: theme.colors.semantic.surface.primary,
              borderColor: theme.colors.semantic.border.primary,
              maxWidth: previewDevice === 'mobile' ? '375px' : '500px'
            }}
          >
            {socialData.twitter.card === 'summary_large_image' ? (
              <>
                <img 
                  src={displayImage} 
                  alt="Preview" 
                  className="w-full h-48 object-cover"
                  style={{ backgroundColor: theme.colors.semantic.surface.secondary }}
                />
                <div className="p-4">
                  <div className="text-sm text-gray-500 mb-1">example.com</div>
                  <div 
                    className="font-semibold leading-tight mb-1 line-clamp-2"
                    style={{ color: theme.colors.semantic.text.primary }}
                  >
                    {displayTitle}
                  </div>
                  <div 
                    className="text-sm line-clamp-2"
                    style={{ color: theme.colors.semantic.text.secondary }}
                  >
                    {displayDescription}
                  </div>
                </div>
              </>
            ) : (
              <div className="p-4 flex space-x-3">
                <img 
                  src={displayImage} 
                  alt="Preview" 
                  className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
                  style={{ backgroundColor: theme.colors.semantic.surface.secondary }}
                />
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-gray-500 mb-1">example.com</div>
                  <div 
                    className="font-semibold leading-tight mb-1 line-clamp-2"
                    style={{ color: theme.colors.semantic.text.primary }}
                  >
                    {displayTitle}
                  </div>
                  <div 
                    className="text-sm line-clamp-2"
                    style={{ color: theme.colors.semantic.text.secondary }}
                  >
                    {displayDescription}
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case 'linkedin':
        return (
          <div 
            className="border rounded-lg overflow-hidden"
            style={{ 
              backgroundColor: theme.colors.semantic.surface.primary,
              borderColor: theme.colors.semantic.border.primary,
              maxWidth: previewDevice === 'mobile' ? '375px' : '500px'
            }}
          >
            <img 
              src={displayImage} 
              alt="Preview" 
              className="w-full h-48 object-cover"
              style={{ backgroundColor: theme.colors.semantic.surface.secondary }}
            />
            <div className="p-4">
              <div 
                className="font-semibold text-lg leading-tight mb-2 line-clamp-2"
                style={{ color: theme.colors.semantic.text.primary }}
              >
                {displayTitle}
              </div>
              <div 
                className="text-sm mb-2 line-clamp-2"
                style={{ color: theme.colors.semantic.text.secondary }}
              >
                {displayDescription}
              </div>
              <div className="text-xs text-gray-500">example.com</div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Social Media Settings */}
      <div 
        className="p-6 rounded-xl"
        style={{ backgroundColor: theme.colors.semantic.surface.primary }}
      >
        <h3 
          className="text-lg font-semibold mb-4 flex items-center space-x-2"
          style={{ color: theme.colors.semantic.text.primary }}
        >
          <Share2 className="w-5 h-5" />
          <span>Social Media Settings</span>
        </h3>

        <div className="space-y-6">
          {/* General Social Settings */}
          <div className="space-y-4">
            <h4 
              className="font-medium"
              style={{ color: theme.colors.semantic.text.primary }}
            >
              General Settings
            </h4>

            <div>
              <label 
                className="block text-sm font-medium mb-2"
                style={{ color: theme.colors.semantic.text.primary }}
              >
                Social Title
              </label>
              <input
                type="text"
                value={socialData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder={title || 'Enter social media title...'}
                className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 transition-colors duration-200"
                style={{
                  backgroundColor: theme.colors.semantic.surface.secondary,
                  borderColor: theme.colors.semantic.border.primary,
                  color: theme.colors.semantic.text.primary
                }}
              />
              <div 
                className="text-sm mt-1"
                style={{ color: theme.colors.semantic.text.secondary }}
              >
                Optimized for social media sharing
              </div>
            </div>

            <div>
              <label 
                className="block text-sm font-medium mb-2"
                style={{ color: theme.colors.semantic.text.primary }}
              >
                Social Description
              </label>
              <textarea
                value={socialData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder={excerpt || 'Enter social media description...'}
                rows={3}
                className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 transition-colors duration-200 resize-none"
                style={{
                  backgroundColor: theme.colors.semantic.surface.secondary,
                  borderColor: theme.colors.semantic.border.primary,
                  color: theme.colors.semantic.text.primary
                }}
              />
              <div 
                className="text-sm mt-1"
                style={{ color: theme.colors.semantic.text.secondary }}
              >
                Engaging description for social platforms
              </div>
            </div>

            <div>
              <label 
                className="block text-sm font-medium mb-2"
                style={{ color: theme.colors.semantic.text.primary }}
              >
                Social Image URL
              </label>
              <div className="flex space-x-2">
                <input
                  type="url"
                  value={socialData.image}
                  onChange={(e) => handleInputChange('image', e.target.value)}
                  placeholder={featuredImage || 'Enter image URL...'}
                  className="flex-1 px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 transition-colors duration-200"
                  style={{
                    backgroundColor: theme.colors.semantic.surface.secondary,
                    borderColor: theme.colors.semantic.border.primary,
                    color: theme.colors.semantic.text.primary
                  }}
                />
                <button
                  className="px-4 py-3 rounded-lg border transition-colors duration-200"
                  style={{
                    backgroundColor: theme.colors.semantic.surface.secondary,
                    borderColor: theme.colors.semantic.border.primary,
                    color: theme.colors.semantic.text.primary
                  }}
                >
                  <Image className="w-4 h-4" />
                </button>
              </div>
              <div 
                className="text-sm mt-1"
                style={{ color: theme.colors.semantic.text.secondary }}
              >
                Recommended size: 1200x630px for optimal display across platforms
              </div>
            </div>
          </div>

          {/* Platform-Specific Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Twitter Settings */}
            <div 
              className="p-4 rounded-lg"
              style={{ backgroundColor: theme.colors.semantic.surface.secondary }}
            >
              <h4 
                className="font-medium mb-3 flex items-center space-x-2"
                style={{ color: theme.colors.semantic.text.primary }}
              >
                <Twitter className="w-4 h-4 text-blue-400" />
                <span>Twitter Settings</span>
              </h4>

              <div className="space-y-3">
                <div>
                  <label 
                    className="block text-sm font-medium mb-1"
                    style={{ color: theme.colors.semantic.text.primary }}
                  >
                    Card Type
                  </label>
                  <select
                    value={socialData.twitter.card}
                    onChange={(e) => handleNestedChange('twitter', 'card', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border focus:outline-none"
                    style={{
                      backgroundColor: theme.colors.semantic.surface.primary,
                      borderColor: theme.colors.semantic.border.primary,
                      color: theme.colors.semantic.text.primary
                    }}
                  >
                    <option value="summary">Summary</option>
                    <option value="summary_large_image">Summary Large Image</option>
                  </select>
                </div>

                <div>
                  <label 
                    className="block text-sm font-medium mb-1"
                    style={{ color: theme.colors.semantic.text.primary }}
                  >
                    Site Handle
                  </label>
                  <input
                    type="text"
                    value={socialData.twitter.site || ''}
                    onChange={(e) => handleNestedChange('twitter', 'site', e.target.value)}
                    placeholder="@yourbrand"
                    className="w-full px-3 py-2 rounded-lg border focus:outline-none"
                    style={{
                      backgroundColor: theme.colors.semantic.surface.primary,
                      borderColor: theme.colors.semantic.border.primary,
                      color: theme.colors.semantic.text.primary
                    }}
                  />
                </div>

                <div>
                  <label 
                    className="block text-sm font-medium mb-1"
                    style={{ color: theme.colors.semantic.text.primary }}
                  >
                    Creator Handle
                  </label>
                  <input
                    type="text"
                    value={socialData.twitter.creator || ''}
                    onChange={(e) => handleNestedChange('twitter', 'creator', e.target.value)}
                    placeholder="@author"
                    className="w-full px-3 py-2 rounded-lg border focus:outline-none"
                    style={{
                      backgroundColor: theme.colors.semantic.surface.primary,
                      borderColor: theme.colors.semantic.border.primary,
                      color: theme.colors.semantic.text.primary
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Facebook Settings */}
            <div 
              className="p-4 rounded-lg"
              style={{ backgroundColor: theme.colors.semantic.surface.secondary }}
            >
              <h4 
                className="font-medium mb-3 flex items-center space-x-2"
                style={{ color: theme.colors.semantic.text.primary }}
              >
                <Facebook className="w-4 h-4 text-blue-600" />
                <span>Facebook Settings</span>
              </h4>

              <div className="space-y-3">
                <div>
                  <label 
                    className="block text-sm font-medium mb-1"
                    style={{ color: theme.colors.semantic.text.primary }}
                  >
                    Content Type
                  </label>
                  <select
                    value={socialData.facebook.type}
                    onChange={(e) => handleNestedChange('facebook', 'type', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border focus:outline-none"
                    style={{
                      backgroundColor: theme.colors.semantic.surface.primary,
                      borderColor: theme.colors.semantic.border.primary,
                      color: theme.colors.semantic.text.primary
                    }}
                  >
                    <option value="article">Article</option>
                    <option value="website">Website</option>
                  </select>
                </div>

                <div>
                  <label 
                    className="block text-sm font-medium mb-1"
                    style={{ color: theme.colors.semantic.text.primary }}
                  >
                    Locale
                  </label>
                  <input
                    type="text"
                    value={socialData.facebook.locale}
                    onChange={(e) => handleNestedChange('facebook', 'locale', e.target.value)}
                    placeholder="en_US"
                    className="w-full px-3 py-2 rounded-lg border focus:outline-none"
                    style={{
                      backgroundColor: theme.colors.semantic.surface.primary,
                      borderColor: theme.colors.semantic.border.primary,
                      color: theme.colors.semantic.text.primary
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Social Media Preview */}
      <div 
        className="p-6 rounded-xl"
        style={{ backgroundColor: theme.colors.semantic.surface.primary }}
      >
        <h3 
          className="text-lg font-semibold mb-4 flex items-center space-x-2"
          style={{ color: theme.colors.semantic.text.primary }}
        >
          <Eye className="w-5 h-5" />
          <span>Social Media Preview</span>
        </h3>

        {/* Preview Controls */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setPreviewPlatform('facebook')}
              className={`px-3 py-2 rounded-lg flex items-center space-x-2 transition-colors ${
                previewPlatform === 'facebook' ? 'font-medium' : ''
              }`}
              style={{
                backgroundColor: previewPlatform === 'facebook' ? theme.colors.semantic.action.primary : 'transparent',
                color: previewPlatform === 'facebook' ? theme.colors.semantic.text.inverse : theme.colors.semantic.text.primary
              }}
            >
              <Facebook className="w-4 h-4" />
              <span>Facebook</span>
            </button>
            <button
              onClick={() => setPreviewPlatform('twitter')}
              className={`px-3 py-2 rounded-lg flex items-center space-x-2 transition-colors ${
                previewPlatform === 'twitter' ? 'font-medium' : ''
              }`}
              style={{
                backgroundColor: previewPlatform === 'twitter' ? theme.colors.semantic.action.primary : 'transparent',
                color: previewPlatform === 'twitter' ? theme.colors.semantic.text.inverse : theme.colors.semantic.text.primary
              }}
            >
              <Twitter className="w-4 h-4" />
              <span>Twitter</span>
            </button>
            <button
              onClick={() => setPreviewPlatform('linkedin')}
              className={`px-3 py-2 rounded-lg flex items-center space-x-2 transition-colors ${
                previewPlatform === 'linkedin' ? 'font-medium' : ''
              }`}
              style={{
                backgroundColor: previewPlatform === 'linkedin' ? theme.colors.semantic.action.primary : 'transparent',
                color: previewPlatform === 'linkedin' ? theme.colors.semantic.text.inverse : theme.colors.semantic.text.primary
              }}
            >
              <Linkedin className="w-4 h-4" />
              <span>LinkedIn</span>
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setPreviewDevice('desktop')}
              className={`p-2 rounded-lg transition-colors ${
                previewDevice === 'desktop' ? 'font-medium' : ''
              }`}
              style={{
                backgroundColor: previewDevice === 'desktop' ? theme.colors.semantic.action.primary + '20' : 'transparent',
                color: theme.colors.semantic.text.primary
              }}
            >
              <Monitor className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPreviewDevice('mobile')}
              className={`p-2 rounded-lg transition-colors ${
                previewDevice === 'mobile' ? 'font-medium' : ''
              }`}
              style={{
                backgroundColor: previewDevice === 'mobile' ? theme.colors.semantic.action.primary + '20' : 'transparent',
                color: theme.colors.semantic.text.primary
              }}
            >
              <Smartphone className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Preview Display */}
        <div className="flex justify-center">
          {getPlatformPreview()}
        </div>

        {/* Quick Actions */}
        <div className="mt-6 flex items-center justify-center space-x-3">
          <button
            onClick={() => copyToClipboard(socialData.title || title)}
            className="px-3 py-2 rounded-lg flex items-center space-x-2 text-sm transition-colors"
            style={{
              backgroundColor: theme.colors.semantic.surface.secondary,
              color: theme.colors.semantic.text.primary
            }}
          >
            <Copy className="w-4 h-4" />
            <span>Copy Title</span>
          </button>
          <button
            onClick={() => copyToClipboard(socialData.description || excerpt)}
            className="px-3 py-2 rounded-lg flex items-center space-x-2 text-sm transition-colors"
            style={{
              backgroundColor: theme.colors.semantic.surface.secondary,
              color: theme.colors.semantic.text.primary
            }}
          >
            <Copy className="w-4 h-4" />
            <span>Copy Description</span>
          </button>
          <button
            className="px-3 py-2 rounded-lg flex items-center space-x-2 text-sm transition-colors"
            style={{
              backgroundColor: theme.colors.semantic.surface.secondary,
              color: theme.colors.semantic.text.primary
            }}
          >
            <ExternalLink className="w-4 h-4" />
            <span>Test Share</span>
          </button>
        </div>
      </div>
    </div>
  );
};