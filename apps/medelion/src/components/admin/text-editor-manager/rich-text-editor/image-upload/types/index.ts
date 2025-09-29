export interface ImageFile {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  url: string;
  uploadProgress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
  dimensions?: {
    width: number;
    height: number;
  };
  thumbnail?: string;
  uploadedAt?: Date;
  description?: string;
  altText?: string;
  tags?: string[];
}

export interface ImageUploadConfig {
  maxFileSize: number; // in bytes
  acceptedTypes: string[];
  maxFiles: number;
  quality: number; // 0-1 for compression
  enableResize: boolean;
  maxWidth?: number;
  maxHeight?: number;
  generateThumbnails: boolean;
  thumbnailSize: number;
  enableWatermark: boolean;
  watermarkText?: string;
  watermarkOpacity?: number;
}

export interface ImageEditOptions {
  brightness: number;
  contrast: number;
  saturation: number;
  rotation: number;
  flipHorizontal: boolean;
  flipVertical: boolean;
  crop?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  filters: {
    grayscale: boolean;
    sepia: boolean;
    blur: number;
    sharpen: number;
  };
}

export interface ImageGalleryItem extends ImageFile {
  selected: boolean;
  category?: string;
  createdBy?: string;
  isPublic?: boolean;
}

export interface UploadResponse {
  success: boolean;
  url?: string;
  error?: string;
  imageId?: string;
}

export interface ImageInsertOptions {
  alignment: 'left' | 'center' | 'right' | 'inline';
  size: 'small' | 'medium' | 'large' | 'custom';
  customWidth?: number;
  customHeight?: number;
  caption?: string;
  altText: string;
  link?: string;
  borderRadius: number;
  shadow: boolean;
  margin: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
}

export type ImageUploadMode = 'single' | 'multiple' | 'gallery' | 'url' | 'camera';

export interface ImageUploadCallbacks {
  onUploadStart?: (files: ImageFile[]) => void;
  onUploadProgress?: (file: ImageFile, progress: number) => void;
  onUploadComplete?: (file: ImageFile, response: UploadResponse) => void;
  onUploadError?: (file: ImageFile, error: string) => void;
  onAllUploadsComplete?: (results: { successful: ImageFile[]; failed: ImageFile[] }) => void;
  onImageSelect?: (image: ImageFile) => void;
  onImageInsert?: (image: ImageFile, options: ImageInsertOptions) => void;
  onImageEdit?: (image: ImageFile, editOptions: ImageEditOptions) => void;
  onImageDelete?: (imageId: string) => void;
}