/**
 * Article Management System - Create Module
 * 
 * A comprehensive, highly advanced, and modular article creation system
 * with full-featured components for content creation, collaboration, 
 * analytics, and publishing.
 */

// Main Article Creator Component
export { default as ArticleCreator } from './ArticleCreator';

// Core Types and Interfaces
export type * from '../types';

// Editor Components
export { RichTextEditor } from './editor/RichTextEditor';

// Metadata Components  
export { SEOOptimization } from './metadata/SEOOptimization';
export { SocialMediaOptimization } from './metadata/SocialMediaOptimization';
export { PublishingSettings } from './metadata/PublishingSettings';

// Media Management Components
export { MediaManager } from './media/MediaManager';
export { ImageGallery } from './media/ImageGallery';
export { FileManager } from './media/FileManager';

// Collaboration Components
export { AuthorManagement } from './collaboration/AuthorManagement';
export { CommentsSystem } from './collaboration/CommentsSystem';
export { RealtimeCollaboration } from './collaboration/RealtimeCollaboration';

// Analytics and Preview Components
export { ArticleAnalytics } from './analytics/ArticleAnalytics';
export { PreviewSystem } from './analytics/PreviewSystem';