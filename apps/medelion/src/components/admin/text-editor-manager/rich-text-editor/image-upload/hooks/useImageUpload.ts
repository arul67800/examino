import { useState, useCallback, useRef } from 'react';
import { ImageFile, ImageUploadConfig, ImageUploadCallbacks, UploadResponse } from '../types';
import { ImageProcessor } from '../utils/ImageProcessor';
import { UploadService } from '../utils/UploadService';

const defaultConfig: ImageUploadConfig = {
  maxFileSize: 10 * 1024 * 1024, // 10MB
  acceptedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  maxFiles: 10,
  quality: 0.9,
  enableResize: true,
  maxWidth: 1920,
  maxHeight: 1080,
  generateThumbnails: true,
  thumbnailSize: 150,
  enableWatermark: false,
  watermarkOpacity: 0.3
};

export function useImageUpload(
  config: Partial<ImageUploadConfig> = {},
  callbacks: ImageUploadCallbacks = {}
) {
  const finalConfig = { ...defaultConfig, ...config };
  const uploadService = useRef(new UploadService(finalConfig));
  
  const [images, setImages] = useState<ImageFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const generateImageId = useCallback(() => {
    return `img-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  const processFile = useCallback(async (file: File): Promise<ImageFile> => {
    const id = generateImageId();
    
    // Validate file
    const validation = ImageProcessor.validateImageFile(
      file,
      finalConfig.maxFileSize,
      finalConfig.acceptedTypes
    );

    if (!validation.valid) {
      throw new Error(validation.error);
    }

    // Get dimensions
    const dimensions = await ImageProcessor.getImageDimensions(file);
    
    // Generate thumbnail
    let thumbnail: string | undefined;
    if (finalConfig.generateThumbnails) {
      thumbnail = await ImageProcessor.generateThumbnail(file, finalConfig.thumbnailSize);
    }

    // Create object URL for preview
    const url = URL.createObjectURL(file);
    
    console.log('📸 Created image file:', {
      id,
      name: file.name,
      size: file.size,
      hasUrl: !!url,
      hasThumbnail: !!thumbnail,
      url: url.substring(0, 50) + '...',
      thumbnailLength: thumbnail?.length
    });

    const imageFile: ImageFile = {
      id,
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      url,
      uploadProgress: 0,
      status: 'pending',
      dimensions,
      thumbnail,
      uploadedAt: new Date()
    };

    return imageFile;
  }, [finalConfig, generateImageId]);

  const addFiles = useCallback(async (files: FileList | File[]) => {
    try {
      setIsUploading(true);
      const fileArray = Array.from(files);
      
      // Check max files limit
      if (images.length + fileArray.length > finalConfig.maxFiles) {
        throw new Error(`Cannot upload more than ${finalConfig.maxFiles} files`);
      }

      const processedFiles: ImageFile[] = [];
      
      for (const file of fileArray) {
        try {
          let processedFile = file;
          
          // Resize if enabled
          if (finalConfig.enableResize && finalConfig.maxWidth && finalConfig.maxHeight) {
            const dimensions = await ImageProcessor.getImageDimensions(file);
            if (dimensions.width > finalConfig.maxWidth || dimensions.height > finalConfig.maxHeight) {
              const resizedBlob = await ImageProcessor.resizeImage(
                file,
                finalConfig.maxWidth,
                finalConfig.maxHeight,
                finalConfig.quality
              );
              processedFile = new File([resizedBlob], file.name, { type: file.type });
            }
          }

          const imageFile = await processFile(processedFile);
          processedFiles.push(imageFile);
        } catch (error) {
          console.error(`Failed to process file ${file.name}:`, error);
          // Continue with other files
        }
      }

      setImages(prev => [...prev, ...processedFiles]);
      callbacks.onUploadStart?.(processedFiles);

      return processedFiles;
    } catch (error) {
      console.error('Failed to add files:', error);
      throw error;
    } finally {
      setIsUploading(false);
    }
  }, [images.length, finalConfig, processFile, callbacks]);

  const uploadImage = useCallback(async (imageFile: ImageFile): Promise<UploadResponse> => {
    setImages(prev => 
      prev.map(img => 
        img.id === imageFile.id 
          ? { ...img, status: 'uploading' as const }
          : img
      )
    );

    try {
      const response = await uploadService.current.uploadImage(imageFile);
      
      setImages(prev =>
        prev.map(img =>
          img.id === imageFile.id
            ? {
                ...img,
                status: response.success ? 'success' as const : 'error' as const,
                uploadProgress: 100,
                url: response.url || img.url,
                error: response.error
              }
            : img
        )
      );

      if (response.success) {
        callbacks.onUploadComplete?.(imageFile, response);
      } else {
        callbacks.onUploadError?.(imageFile, response.error || 'Upload failed');
      }

      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      
      setImages(prev =>
        prev.map(img =>
          img.id === imageFile.id
            ? { ...img, status: 'error' as const, error: errorMessage }
            : img
        )
      );

      callbacks.onUploadError?.(imageFile, errorMessage);
      
      return {
        success: false,
        error: errorMessage
      };
    }
  }, [callbacks]);

  const uploadAll = useCallback(async () => {
    const pendingImages = images.filter(img => img.status === 'pending');
    if (pendingImages.length === 0) return;

    setIsUploading(true);

    try {
      const results = await Promise.allSettled(
        pendingImages.map(img => uploadImage(img))
      );

      const successful = results
        .filter((result, index) => result.status === 'fulfilled' && result.value.success)
        .map((_, index) => pendingImages[index]);

      const failed = results
        .filter((result, index) => result.status === 'rejected' || !result.value.success)
        .map((_, index) => pendingImages[index]);

      callbacks.onAllUploadsComplete?.({ successful, failed });
    } finally {
      setIsUploading(false);
    }
  }, [images, uploadImage, callbacks]);

  const removeImage = useCallback((imageId: string) => {
    setImages(prev => {
      const imageToRemove = prev.find(img => img.id === imageId);
      if (imageToRemove?.url.startsWith('blob:')) {
        URL.revokeObjectURL(imageToRemove.url);
      }
      return prev.filter(img => img.id !== imageId);
    });
    
    callbacks.onImageDelete?.(imageId);
  }, [callbacks]);

  const clearAll = useCallback(() => {
    // Revoke object URLs to free memory
    images.forEach(img => {
      if (img.url.startsWith('blob:')) {
        URL.revokeObjectURL(img.url);
      }
    });
    
    setImages([]);
    setUploadProgress({});
  }, [images]);

  const retryUpload = useCallback((imageId: string) => {
    const imageFile = images.find(img => img.id === imageId);
    if (imageFile && imageFile.status === 'error') {
      setImages(prev =>
        prev.map(img =>
          img.id === imageId
            ? { ...img, status: 'pending' as const, error: undefined }
            : img
        )
      );
    }
  }, [images]);

  const openFileDialog = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      addFiles(files);
    }
    // Reset input value to allow selecting the same file again
    event.target.value = '';
  }, [addFiles]);

  // Progress tracking
  const totalProgress = images.length > 0 
    ? Math.round(images.reduce((sum, img) => sum + img.uploadProgress, 0) / images.length)
    : 0;

  const stats = {
    total: images.length,
    pending: images.filter(img => img.status === 'pending').length,
    uploading: images.filter(img => img.status === 'uploading').length,
    success: images.filter(img => img.status === 'success').length,
    error: images.filter(img => img.status === 'error').length
  };

  return {
    // State
    images,
    isUploading,
    uploadProgress,
    totalProgress,
    stats,
    
    // Actions
    addFiles,
    uploadImage,
    uploadAll,
    removeImage,
    clearAll,
    retryUpload,
    openFileDialog,
    
    // Refs and handlers
    fileInputRef,
    handleFileInputChange,
    
    // Configuration
    config: finalConfig
  };
}