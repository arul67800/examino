// Main components
export { AdvancedImageUploader } from './components/AdvancedImageUploader';
export { ImageGallery } from './components/ImageGallery';
export { ImageModal } from './components/ImageModal';
export { ImagePreview } from './components/ImagePreview';

// Hooks
export { useImageUpload } from './hooks/useImageUpload';

// Utilities
export { ImageProcessor } from './utils/ImageProcessor';
export { UploadService } from './utils/UploadService';

// Types
export type {
  ImageFile,
  ImageUploadConfig,
  ImageEditOptions,
  ImageGalleryItem,
  UploadResponse,
  ImageInsertOptions,
  ImageUploadMode,
  ImageUploadCallbacks
} from './types';