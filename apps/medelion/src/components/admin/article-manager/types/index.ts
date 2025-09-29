/**
 * Core types and interfaces for the Article Management System
 */

export interface ArticleForm {
  // Basic Information
  id?: string;
  title: string;
  subtitle: string;
  excerpt: string;
  content: string;
  
  // Categorization
  category: string;
  subcategory: string;
  tags: string[];
  
  // Publishing
  status: 'draft' | 'published' | 'scheduled' | 'archived';
  publishDate: string;
  lastModified: string;
  
  // Media
  featuredImage: string;
  gallery: MediaItem[];
  
  // Metadata
  readTime: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  language: string;
  contentType: 'article' | 'tutorial' | 'guide' | 'news' | 'opinion' | 'research';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  
  // Author Information
  author: Author;
  coAuthors: Author[];
  
  // SEO & Social
  seo: SEOData;
  social: SocialData;
  
  // Settings
  settings: ArticleSettings;
  
  // Analytics
  analytics: ArticleAnalytics;
  
  // Educational Content
  educational: EducationalContent;
  
  // Resources & References
  resources: Resource[];
  attachments: Attachment[];
}

export interface Author {
  id: string;
  name: string;
  email: string;
  avatar: string;
  bio: string;
  role?: string;
  isVerified?: boolean;
}

export interface CollaboratorPermission {
  canEdit: boolean;
  canComment: boolean;
  canPublish: boolean;
  canManageMedia: boolean;
  canInviteOthers: boolean;
}

export interface CollaboratorPermissions {
  [userId: string]: CollaboratorPermission;
}

export interface MediaItem {
  id: string;
  url: string;
  type: 'image' | 'video' | 'audio' | 'document';
  name: string;
  size: number;
  caption?: string;
  alt?: string;
  thumbnail?: string;
}

export interface SEOData {
  title: string;
  description: string;
  keywords: string[];
  canonicalUrl: string;
  metaTags: Record<string, string>;
  structuredData?: any;
  slug?: string;
  alt?: string;
}

export interface SocialData {
  title: string;
  description: string;
  image: string;
  twitter: {
    card: 'summary' | 'summary_large_image';
    site?: string;
    creator?: string;
    title?: string;
    description?: string;
    image?: string;
  };
  facebook: {
    type: 'article' | 'website';
    locale: string;
    title?: string;
    description?: string;
    image?: string;
  };
}

export interface ArticleSettings {
  isPublic: boolean;
  allowComments: boolean;
  enableAnalytics: boolean;
  tableOfContents: boolean;
  enableSharing: boolean;
  requireAuth: boolean;
  ageRestriction?: number;
  contentWarning?: string;
}

export interface ArticleAnalytics {
  wordCount: number;
  characterCount: number;
  estimatedViews: number;
  readabilityScore: number;
  keywordDensity: Record<string, number>;
  lastAnalyzed: string;
}

export interface EducationalContent {
  targetAudience: string[];
  prerequisites: string[];
  learningOutcomes: string[];
  skillLevel: string;
  estimatedCompletionTime: number;
  certificationEligible: boolean;
}

export interface Resource {
  id: string;
  name: string;
  url: string;
  type: 'link' | 'document' | 'video' | 'book' | 'course';
  description?: string;
  isRequired: boolean;
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
  size: string;
  type: string;
  uploadDate: string;
}

export interface Category {
  name: string;
  subcategories: string[];
  icon?: string;
  description?: string;
}

export interface EditorState {
  mode: 'write' | 'preview' | 'split';
  device: 'desktop' | 'tablet' | 'mobile';
  fullscreen: boolean;
  wordWrap: boolean;
  showLineNumbers: boolean;
  theme: 'light' | 'dark' | 'auto';
}

export interface EditorHistory {
  content: string;
  timestamp: string;
  author: string;
}

export interface ValidationError {
  field: string;
  message: string;
  type: 'error' | 'warning' | 'info';
}

export interface SaveState {
  isSaving: boolean;
  isAutoSaving: boolean;
  lastSaved: string;
  hasUnsavedChanges: boolean;
  saveError?: string;
}

export interface PreviewSettings {
  showSEO: boolean;
  showSocial: boolean;
  showAnalytics: boolean;
  device: 'desktop' | 'tablet' | 'mobile';
}

export interface CollaborationData {
  isCollaborative: boolean;
  activeUsers: Author[];
  comments: Comment[];
  suggestions: Suggestion[];
  permissions: Record<string, Permission>;
}

export interface Comment {
  id: string;
  author: Author;
  content: string;
  position: number;
  timestamp: string;
  resolved: boolean;
  replies?: Comment[];
}

export interface Suggestion {
  id: string;
  author: Author;
  type: 'add' | 'delete' | 'modify';
  content: string;
  position: number;
  timestamp: string;
  status: 'pending' | 'accepted' | 'rejected';
}

export interface Permission {
  read: boolean;
  write: boolean;
  comment: boolean;
  suggest: boolean;
  admin: boolean;
}

export interface ArticleTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  structure: TemplateSection[];
  isDefault: boolean;
}

export interface TemplateSection {
  id: string;
  title: string;
  content: string;
  type: 'text' | 'image' | 'code' | 'quote' | 'list';
  required: boolean;
  placeholder?: string;
}