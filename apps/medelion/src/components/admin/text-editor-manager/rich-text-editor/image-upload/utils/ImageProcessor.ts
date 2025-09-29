import { ImageFile, ImageEditOptions } from '../types';

export class ImageProcessor {
  /**
   * Convert file to base64 data URL
   */
  static async fileToDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  }

  /**
   * Get image dimensions
   */
  static async getImageDimensions(file: File): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        resolve({ width: img.naturalWidth, height: img.naturalHeight });
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * Resize image to specified dimensions
   */
  static async resizeImage(
    file: File, 
    maxWidth: number, 
    maxHeight: number, 
    quality: number = 0.9
  ): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas context not available'));
        return;
      }

      const img = new Image();
      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img;
        const aspectRatio = width / height;

        if (width > maxWidth) {
          width = maxWidth;
          height = width / aspectRatio;
        }
        if (height > maxHeight) {
          height = maxHeight;
          width = height * aspectRatio;
        }

        canvas.width = width;
        canvas.height = height;

        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (blob) resolve(blob);
            else reject(new Error('Failed to create blob'));
          },
          file.type,
          quality
        );
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * Generate thumbnail
   */
  static async generateThumbnail(file: File, size: number = 150): Promise<string> {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas context not available');

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const minDim = Math.min(img.naturalWidth, img.naturalHeight);
        const scale = size / minDim;
        
        canvas.width = size;
        canvas.height = size;

        // Center crop
        const sourceSize = minDim;
        const sourceX = (img.naturalWidth - sourceSize) / 2;
        const sourceY = (img.naturalHeight - sourceSize) / 2;

        ctx.drawImage(
          img,
          sourceX, sourceY, sourceSize, sourceSize,
          0, 0, size, size
        );

        resolve(canvas.toDataURL('image/jpeg', 0.8));
      };
      img.onerror = () => reject(new Error('Failed to generate thumbnail'));
      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * Apply image filters and effects
   */
  static async applyImageEffects(
    imageDataUrl: string,
    effects: ImageEditOptions
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas context not available'));
        return;
      }

      const img = new Image();
      img.onload = () => {
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;

        // Apply rotation
        if (effects.rotation !== 0) {
          ctx.save();
          ctx.translate(canvas.width / 2, canvas.height / 2);
          ctx.rotate((effects.rotation * Math.PI) / 180);
          ctx.translate(-canvas.width / 2, -canvas.height / 2);
        }

        // Apply flips
        if (effects.flipHorizontal || effects.flipVertical) {
          ctx.save();
          ctx.scale(
            effects.flipHorizontal ? -1 : 1,
            effects.flipVertical ? -1 : 1
          );
          ctx.translate(
            effects.flipHorizontal ? -canvas.width : 0,
            effects.flipVertical ? -canvas.height : 0
          );
        }

        // Draw image
        ctx.drawImage(img, 0, 0);

        // Apply filters
        const filters: string[] = [];
        
        if (effects.brightness !== 100) {
          filters.push(`brightness(${effects.brightness}%)`);
        }
        if (effects.contrast !== 100) {
          filters.push(`contrast(${effects.contrast}%)`);
        }
        if (effects.saturation !== 100) {
          filters.push(`saturate(${effects.saturation}%)`);
        }
        if (effects.filters.grayscale) {
          filters.push('grayscale(100%)');
        }
        if (effects.filters.sepia) {
          filters.push('sepia(100%)');
        }
        if (effects.filters.blur > 0) {
          filters.push(`blur(${effects.filters.blur}px)`);
        }

        if (filters.length > 0) {
          ctx.filter = filters.join(' ');
          ctx.drawImage(canvas, 0, 0);
        }

        ctx.restore();
        resolve(canvas.toDataURL('image/png'));
      };
      img.onerror = () => reject(new Error('Failed to process image'));
      img.src = imageDataUrl;
    });
  }

  /**
   * Compress image
   */
  static async compressImage(file: File, quality: number = 0.8): Promise<Blob> {
    if (file.type === 'image/png' || file.type === 'image/gif') {
      return file; // Don't compress PNG/GIF as they might lose transparency
    }

    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas context not available'));
        return;
      }

      const img = new Image();
      img.onload = () => {
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        ctx.drawImage(img, 0, 0);

        canvas.toBlob(
          (blob) => {
            if (blob) resolve(blob);
            else reject(new Error('Failed to compress image'));
          },
          'image/jpeg',
          quality
        );
      };
      img.onerror = () => reject(new Error('Failed to load image for compression'));
      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * Validate image file
   */
  static validateImageFile(
    file: File,
    maxSize: number,
    acceptedTypes: string[]
  ): { valid: boolean; error?: string } {
    if (!acceptedTypes.includes(file.type)) {
      return {
        valid: false,
        error: `File type ${file.type} is not supported. Accepted types: ${acceptedTypes.join(', ')}`
      };
    }

    if (file.size > maxSize) {
      const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(1);
      const fileSizeMB = (file.size / (1024 * 1024)).toFixed(1);
      return {
        valid: false,
        error: `File size ${fileSizeMB}MB exceeds maximum allowed size of ${maxSizeMB}MB`
      };
    }

    return { valid: true };
  }

  /**
   * Extract EXIF data
   */
  static async extractExifData(file: File): Promise<any> {
    // This is a simplified EXIF extraction
    // In a real implementation, you might use a library like 'exifr'
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        resolve({
          width: img.naturalWidth,
          height: img.naturalHeight,
          aspectRatio: img.naturalWidth / img.naturalHeight,
          fileSize: file.size,
          fileType: file.type,
          fileName: file.name,
          lastModified: new Date(file.lastModified)
        });
      };
      img.onerror = () => resolve({});
      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * Create image from URL
   */
  static async createImageFromUrl(url: string): Promise<ImageFile> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        // Convert image to blob
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context not available'));
          return;
        }

        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        ctx.drawImage(img, 0, 0);

        canvas.toBlob((blob) => {
          if (!blob) {
            reject(new Error('Failed to create blob from image'));
            return;
          }

          const fileName = url.split('/').pop() || 'image.jpg';
          const file = new File([blob], fileName, { type: blob.type });

          const imageFile: ImageFile = {
            id: `url-${Date.now()}`,
            file,
            name: fileName,
            size: blob.size,
            type: blob.type,
            url,
            uploadProgress: 100,
            status: 'success',
            dimensions: {
              width: img.naturalWidth,
              height: img.naturalHeight
            }
          };

          resolve(imageFile);
        });
      };
      img.onerror = () => reject(new Error('Failed to load image from URL'));
      img.src = url;
    });
  }
}