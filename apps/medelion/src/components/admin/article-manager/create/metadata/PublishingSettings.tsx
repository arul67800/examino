'use client';

import React, { useState } from 'react';
import { useTheme } from '@/theme';
import {
  Settings,
  Globe,
  Lock,
  Eye,
  EyeOff,
  MessageSquare,
  BarChart3,
  Share2,
  Calendar,
  Clock,
  Users,
  Shield,
  AlertTriangle,
  Info,
  CheckCircle,
  User,
  UserPlus,
  Hash
} from 'lucide-react';
import { ArticleSettings, Author } from '../../types';

interface PublishingSettingsProps {
  settings: ArticleSettings;
  onChange: (settings: ArticleSettings) => void;
  status: 'draft' | 'published' | 'scheduled' | 'archived';
  onStatusChange: (status: 'draft' | 'published' | 'scheduled' | 'archived') => void;
  publishDate: string;
  onPublishDateChange: (date: string) => void;
  author: Author;
  coAuthors: Author[];
  onCoAuthorsChange: (coAuthors: Author[]) => void;
}

export const PublishingSettings: React.FC<PublishingSettingsProps> = ({
  settings,
  onChange,
  status,
  onStatusChange,
  publishDate,
  onPublishDateChange,
  author,
  coAuthors,
  onCoAuthorsChange
}) => {
  const { theme } = useTheme();
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [newCoAuthorEmail, setNewCoAuthorEmail] = useState('');

  const handleSettingChange = (field: keyof ArticleSettings, value: any) => {
    onChange({
      ...settings,
      [field]: value
    });
  };

  const addCoAuthor = () => {
    if (newCoAuthorEmail.trim()) {
      // In a real app, you'd fetch user data from the email
      const newCoAuthor: Author = {
        id: Date.now().toString(),
        name: newCoAuthorEmail.split('@')[0],
        email: newCoAuthorEmail.trim(),
        avatar: '',
        bio: '',
        role: 'contributor'
      };
      onCoAuthorsChange([...coAuthors, newCoAuthor]);
      setNewCoAuthorEmail('');
    }
  };

  const removeCoAuthor = (authorId: string) => {
    onCoAuthorsChange(coAuthors.filter(a => a.id !== authorId));
  };

  const getStatusColor = (currentStatus: string) => {
    switch (currentStatus) {
      case 'published':
        return '#10b981'; // green
      case 'scheduled':
        return '#3b82f6'; // blue
      case 'draft':
        return '#f59e0b'; // yellow
      case 'archived':
        return '#6b7280'; // gray
      default:
        return theme.colors.semantic.text.secondary;
    }
  };

  const getStatusIcon = (currentStatus: string) => {
    switch (currentStatus) {
      case 'published':
        return <Globe className="w-4 h-4" />;
      case 'scheduled':
        return <Calendar className="w-4 h-4" />;
      case 'draft':
        return <Eye className="w-4 h-4" />;
      case 'archived':
        return <Lock className="w-4 h-4" />;
      default:
        return <Eye className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Publishing Status */}
      <div 
        className="p-6 rounded-xl"
        style={{ backgroundColor: theme.colors.semantic.surface.primary }}
      >
        <h3 
          className="text-lg font-semibold mb-4 flex items-center space-x-2"
          style={{ color: theme.colors.semantic.text.primary }}
        >
          <Settings className="w-5 h-5" />
          <span>Publishing Status</span>
        </h3>

        <div className="space-y-4">
          {/* Status Selection */}
          <div>
            <label 
              className="block text-sm font-medium mb-3"
              style={{ color: theme.colors.semantic.text.primary }}
            >
              Publication Status
            </label>
            <div className="grid grid-cols-2 gap-3">
              {['draft', 'published', 'scheduled', 'archived'].map((statusOption) => (
                <button
                  key={statusOption}
                  onClick={() => onStatusChange(statusOption as any)}
                  className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                    status === statusOption ? 'ring-2' : ''
                  }`}
                  style={{
                    borderColor: status === statusOption ? getStatusColor(statusOption) : theme.colors.semantic.border.primary,
                    backgroundColor: status === statusOption ? getStatusColor(statusOption) + '10' : theme.colors.semantic.surface.secondary,
                    color: status === statusOption ? getStatusColor(statusOption) : theme.colors.semantic.text.primary
                  }}
                >
                  <div className="flex items-center space-x-2 mb-2">
                    {getStatusIcon(statusOption)}
                    <span className="font-medium capitalize">{statusOption}</span>
                  </div>
                  <div className="text-xs opacity-75">
                    {statusOption === 'draft' && 'Save as draft for later'}
                    {statusOption === 'published' && 'Publish immediately'}
                    {statusOption === 'scheduled' && 'Schedule for later'}
                    {statusOption === 'archived' && 'Archive this article'}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Scheduled Publishing */}
          {status === 'scheduled' && (
            <div 
              className="p-4 rounded-lg"
              style={{ backgroundColor: theme.colors.semantic.surface.secondary }}
            >
              <label 
                className="block text-sm font-medium mb-2"
                style={{ color: theme.colors.semantic.text.primary }}
              >
                Publish Date & Time
              </label>
              <input
                type="datetime-local"
                value={publishDate}
                onChange={(e) => onPublishDateChange(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 transition-colors duration-200"
                style={{
                  backgroundColor: theme.colors.semantic.surface.primary,
                  borderColor: theme.colors.semantic.border.primary,
                  color: theme.colors.semantic.text.primary
                }}
              />
              <div 
                className="text-sm mt-2 flex items-center space-x-1"
                style={{ color: theme.colors.semantic.text.secondary }}
              >
                <Clock className="w-4 h-4" />
                <span>Article will be automatically published at the specified time</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Authors & Contributors */}
      <div 
        className="p-6 rounded-xl"
        style={{ backgroundColor: theme.colors.semantic.surface.primary }}
      >
        <h3 
          className="text-lg font-semibold mb-4 flex items-center space-x-2"
          style={{ color: theme.colors.semantic.text.primary }}
        >
          <Users className="w-5 h-5" />
          <span>Authors & Contributors</span>
        </h3>

        <div className="space-y-4">
          {/* Primary Author */}
          <div 
            className="p-4 rounded-lg"
            style={{ backgroundColor: theme.colors.semantic.surface.secondary }}
          >
            <div className="flex items-center space-x-3">
              {author.avatar ? (
                <img 
                  src={author.avatar} 
                  alt={author.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: theme.colors.semantic.action.primary + '20' }}
                >
                  <User className="w-5 h-5" style={{ color: theme.colors.semantic.action.primary }} />
                </div>
              )}
              <div className="flex-1">
                <div 
                  className="font-medium"
                  style={{ color: theme.colors.semantic.text.primary }}
                >
                  {author.name}
                </div>
                <div 
                  className="text-sm"
                  style={{ color: theme.colors.semantic.text.secondary }}
                >
                  {author.email} • Primary Author
                </div>
              </div>
              <div 
                className="px-2 py-1 rounded text-xs font-medium"
                style={{
                  backgroundColor: theme.colors.semantic.action.primary + '20',
                  color: theme.colors.semantic.action.primary
                }}
              >
                {author.role}
              </div>
            </div>
          </div>

          {/* Co-Authors */}
          <div>
            <label 
              className="block text-sm font-medium mb-2"
              style={{ color: theme.colors.semantic.text.primary }}
            >
              Co-Authors
            </label>
            
            {coAuthors.length > 0 && (
              <div className="space-y-2 mb-3">
                {coAuthors.map((coAuthor) => (
                  <div 
                    key={coAuthor.id}
                    className="flex items-center justify-between p-3 rounded-lg"
                    style={{ backgroundColor: theme.colors.semantic.surface.secondary }}
                  >
                    <div className="flex items-center space-x-3">
                      {coAuthor.avatar ? (
                        <img 
                          src={coAuthor.avatar} 
                          alt={coAuthor.name}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <div 
                          className="w-8 h-8 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: theme.colors.semantic.action.secondary + '20' }}
                        >
                          <User className="w-4 h-4" style={{ color: theme.colors.semantic.action.secondary }} />
                        </div>
                      )}
                      <div>
                        <div 
                          className="font-medium text-sm"
                          style={{ color: theme.colors.semantic.text.primary }}
                        >
                          {coAuthor.name}
                        </div>
                        <div 
                          className="text-xs"
                          style={{ color: theme.colors.semantic.text.secondary }}
                        >
                          {coAuthor.email}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div 
                        className="px-2 py-1 rounded text-xs"
                        style={{
                          backgroundColor: theme.colors.semantic.action.secondary + '20',
                          color: theme.colors.semantic.action.secondary
                        }}
                      >
                        {coAuthor.role}
                      </div>
                      <button
                        onClick={() => removeCoAuthor(coAuthor.id)}
                        className="text-red-500 hover:opacity-70 p-1"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex space-x-2">
              <input
                type="email"
                value={newCoAuthorEmail}
                onChange={(e) => setNewCoAuthorEmail(e.target.value)}
                placeholder="Enter co-author email..."
                className="flex-1 px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 transition-colors duration-200"
                style={{
                  backgroundColor: theme.colors.semantic.surface.secondary,
                  borderColor: theme.colors.semantic.border.primary,
                  color: theme.colors.semantic.text.primary
                }}
                onKeyPress={(e) => e.key === 'Enter' && addCoAuthor()}
              />
              <button
                onClick={addCoAuthor}
                className="px-4 py-2 rounded-lg transition-colors duration-200 flex items-center space-x-1"
                style={{
                  backgroundColor: theme.colors.semantic.action.primary,
                  color: theme.colors.semantic.text.inverse
                }}
              >
                <UserPlus className="w-4 h-4" />
                <span>Add</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Visibility & Permissions */}
      <div 
        className="p-6 rounded-xl"
        style={{ backgroundColor: theme.colors.semantic.surface.primary }}
      >
        <h3 
          className="text-lg font-semibold mb-4 flex items-center space-x-2"
          style={{ color: theme.colors.semantic.text.primary }}
        >
          <Shield className="w-5 h-5" />
          <span>Visibility & Permissions</span>
        </h3>

        <div className="space-y-4">
          {/* Public/Private Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {settings.isPublic ? <Globe className="w-5 h-5 text-green-500" /> : <Lock className="w-5 h-5 text-gray-500" />}
              <div>
                <div 
                  className="font-medium"
                  style={{ color: theme.colors.semantic.text.primary }}
                >
                  {settings.isPublic ? 'Public Article' : 'Private Article'}
                </div>
                <div 
                  className="text-sm"
                  style={{ color: theme.colors.semantic.text.secondary }}
                >
                  {settings.isPublic ? 'Visible to everyone' : 'Only visible to authorized users'}
                </div>
              </div>
            </div>
            <button
              onClick={() => handleSettingChange('isPublic', !settings.isPublic)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.isPublic ? 'bg-green-500' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.isPublic ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Authentication Required */}
          {settings.isPublic && (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <User className="w-5 h-5" style={{ color: theme.colors.semantic.text.secondary }} />
                <div>
                  <div 
                    className="font-medium"
                    style={{ color: theme.colors.semantic.text.primary }}
                  >
                    Require Authentication
                  </div>
                  <div 
                    className="text-sm"
                    style={{ color: theme.colors.semantic.text.secondary }}
                  >
                    Users must be logged in to view
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleSettingChange('requireAuth', !settings.requireAuth)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.requireAuth ? 'bg-blue-500' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.requireAuth ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          )}

          {/* Age Restriction */}
          <div>
            <label 
              className="block text-sm font-medium mb-2"
              style={{ color: theme.colors.semantic.text.primary }}
            >
              Age Restriction
            </label>
            <select
              value={settings.ageRestriction || 0}
              onChange={(e) => handleSettingChange('ageRestriction', Number(e.target.value) || undefined)}
              className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 transition-colors duration-200"
              style={{
                backgroundColor: theme.colors.semantic.surface.secondary,
                borderColor: theme.colors.semantic.border.primary,
                color: theme.colors.semantic.text.primary
              }}
            >
              <option value={0}>No restriction</option>
              <option value={13}>13+ (Teen)</option>
              <option value={16}>16+ (Young Adult)</option>
              <option value={18}>18+ (Adult)</option>
              <option value={21}>21+ (Mature)</option>
            </select>
          </div>

          {/* Content Warning */}
          <div>
            <label 
              className="block text-sm font-medium mb-2"
              style={{ color: theme.colors.semantic.text.primary }}
            >
              Content Warning
            </label>
            <input
              type="text"
              value={settings.contentWarning || ''}
              onChange={(e) => handleSettingChange('contentWarning', e.target.value || undefined)}
              placeholder="Optional content warning..."
              className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 transition-colors duration-200"
              style={{
                backgroundColor: theme.colors.semantic.surface.secondary,
                borderColor: theme.colors.semantic.border.primary,
                color: theme.colors.semantic.text.primary
              }}
            />
          </div>
        </div>
      </div>

      {/* Engagement Settings */}
      <div 
        className="p-6 rounded-xl"
        style={{ backgroundColor: theme.colors.semantic.surface.primary }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 
            className="text-lg font-semibold flex items-center space-x-2"
            style={{ color: theme.colors.semantic.text.primary }}
          >
            <MessageSquare className="w-5 h-5" />
            <span>Engagement Settings</span>
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

        <div className="space-y-4">
          {/* Basic Engagement Settings */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <MessageSquare className="w-5 h-5" style={{ color: theme.colors.semantic.text.secondary }} />
                <div>
                  <div 
                    className="font-medium"
                    style={{ color: theme.colors.semantic.text.primary }}
                  >
                    Allow Comments
                  </div>
                  <div 
                    className="text-sm"
                    style={{ color: theme.colors.semantic.text.secondary }}
                  >
                    Readers can leave comments
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleSettingChange('allowComments', !settings.allowComments)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.allowComments ? 'bg-blue-500' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.allowComments ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Share2 className="w-5 h-5" style={{ color: theme.colors.semantic.text.secondary }} />
                <div>
                  <div 
                    className="font-medium"
                    style={{ color: theme.colors.semantic.text.primary }}
                  >
                    Enable Sharing
                  </div>
                  <div 
                    className="text-sm"
                    style={{ color: theme.colors.semantic.text.secondary }}
                  >
                    Show social sharing buttons
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleSettingChange('enableSharing', !settings.enableSharing)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.enableSharing ? 'bg-blue-500' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.enableSharing ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <BarChart3 className="w-5 h-5" style={{ color: theme.colors.semantic.text.secondary }} />
                <div>
                  <div 
                    className="font-medium"
                    style={{ color: theme.colors.semantic.text.primary }}
                  >
                    Enable Analytics
                  </div>
                  <div 
                    className="text-sm"
                    style={{ color: theme.colors.semantic.text.secondary }}
                  >
                    Track views and engagement
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleSettingChange('enableAnalytics', !settings.enableAnalytics)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.enableAnalytics ? 'bg-green-500' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.enableAnalytics ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Advanced Settings */}
          {showAdvanced && (
            <div 
              className="pt-4 border-t space-y-3"
              style={{ borderColor: theme.colors.semantic.border.secondary }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Hash className="w-5 h-5" style={{ color: theme.colors.semantic.text.secondary }} />
                  <div>
                    <div 
                      className="font-medium"
                      style={{ color: theme.colors.semantic.text.primary }}
                    >
                      Table of Contents
                    </div>
                    <div 
                      className="text-sm"
                      style={{ color: theme.colors.semantic.text.secondary }}
                    >
                      Auto-generate from headings
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleSettingChange('tableOfContents', !settings.tableOfContents)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.tableOfContents ? 'bg-purple-500' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.tableOfContents ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};