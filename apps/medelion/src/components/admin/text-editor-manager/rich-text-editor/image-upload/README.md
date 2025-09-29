# Advanced Image Upload System for Rich Text Editor

This is a comprehensive image upload and management system integrated into the rich text editor with Microsoft Word-like interface.

## 🚀 Features

### Upload Capabilities
- **Multiple Upload Modes**: Single, Multiple, URL, Gallery, Camera
- **Drag & Drop**: Intuitive file dropping interface
- **File Validation**: Type, size, and format validation
- **Real-time Progress**: Upload progress tracking with visual feedback
- **Auto-resize**: Automatic image resizing with quality control
- **Thumbnail Generation**: Automatic thumbnail creation
- **Batch Upload**: Upload multiple images simultaneously

### Image Processing
- **Format Support**: JPEG, PNG, GIF, WebP
- **Compression**: Smart compression to reduce file sizes
- **Resize & Crop**: Automatic resizing with aspect ratio preservation
- **EXIF Data**: Extract image metadata and dimensions
- **Quality Control**: Configurable compression quality

### Gallery Management
- **Grid/List Views**: Multiple viewing modes for browsing images
- **Search & Filter**: Search by name, description, tags, or category
- **Sorting**: Sort by name, date, or file size
- **Pagination**: Efficient loading of large image collections
- **Categories**: Organize images by category (photos, graphics, icons)
- **Metadata**: Rich metadata including alt text, descriptions, and tags

### Editor Integration
- **Advanced Insert Options**: Alignment, sizing, captions, styling
- **Custom Dimensions**: Set specific width and height
- **Caption Support**: Add captions with proper figure markup
- **Style Options**: Border radius, shadows, margins
- **Responsive**: Automatic responsive image insertion
- **SEO Friendly**: Proper alt text and semantic HTML

## 🏗️ Architecture

### Components Structure
```
image-upload/
├── components/
│   ├── AdvancedImageUploader.tsx    # Main upload interface
│   ├── ImageGallery.tsx             # Gallery browser
│   └── ImageModal.tsx               # Combined modal interface
├── hooks/
│   └── useImageUpload.ts            # Upload state management
├── utils/
│   ├── ImageProcessor.ts            # Image processing utilities
│   └── UploadService.ts             # Upload service with API integration
├── types/
│   └── index.ts                     # TypeScript interfaces
└── index.ts                         # Main exports
```

### Key Components

#### AdvancedImageUploader
- Multi-mode upload interface (upload, URL, gallery)
- Real-time progress tracking
- File validation and error handling
- Thumbnail generation and preview
- Batch operations (upload all, clear all)

#### ImageGallery
- Browseable gallery of uploaded images
- Search and filter capabilities
- Grid and list view modes
- Image selection and insertion
- Metadata display and management

#### ImageModal
- Combined interface for upload and gallery
- Advanced insert options sidebar
- Real-time preview of insert settings
- Responsive modal design

### Hooks

#### useImageUpload
Manages the entire image upload workflow:
- File processing and validation
- Upload progress tracking
- State management
- Error handling
- Batch operations

### Utilities

#### ImageProcessor
- File validation
- Image resizing and compression
- Thumbnail generation
- Format conversion
- EXIF data extraction
- Filter and effect application

#### UploadService
- API integration for uploads
- Gallery data fetching
- Image deletion
- Metadata updates
- Mock data for development

## 🔧 Configuration

### Upload Configuration
```typescript
const config: ImageUploadConfig = {
  maxFileSize: 10 * 1024 * 1024, // 10MB
  acceptedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  maxFiles: 10,
  quality: 0.9,
  enableResize: true,
  maxWidth: 1920,
  maxHeight: 1080,
  generateThumbnails: true,
  thumbnailSize: 150,
  enableWatermark: false
};
```

### Insert Options
```typescript
const insertOptions: ImageInsertOptions = {
  alignment: 'center',
  size: 'medium',
  altText: 'Image description',
  caption: 'Image caption',
  borderRadius: 0,
  shadow: false,
  margin: { top: 10, right: 10, bottom: 10, left: 10 }
};
```

## 🎯 Usage

### Basic Integration
```tsx
import { ImageModal } from '@/components/admin/text-editor-manager/rich-text-editor/image-upload';

function MyEditor() {
  const [showImageModal, setShowImageModal] = useState(false);
  
  const handleImageInsert = (image: ImageFile, options: ImageInsertOptions) => {
    // Insert image into editor
    const imageHtml = generateImageHtml(image, options);
    insertIntoEditor(imageHtml);
  };

  return (
    <>
      <button onClick={() => setShowImageModal(true)}>
        Insert Image
      </button>
      
      <ImageModal
        isOpen={showImageModal}
        onClose={() => setShowImageModal(false)}
        onImageInsert={handleImageInsert}
      />
    </>
  );
}
```

### Advanced Upload Component
```tsx
import { AdvancedImageUploader } from '@/components/admin/text-editor-manager/rich-text-editor/image-upload';

function MyUploader() {
  return (
    <AdvancedImageUploader
      mode="multiple"
      maxFiles={5}
      maxFileSize={5 * 1024 * 1024} // 5MB
      onImageInsert={handleImageInsert}
    />
  );
}
```

## 🔄 API Integration

### Upload Endpoint
```typescript
// POST /api/upload
const formData = new FormData();
formData.append('image', file);
formData.append('altText', altText);
formData.append('description', description);

const response = await fetch('/api/upload', {
  method: 'POST',
  body: formData
});
```

### Gallery Endpoint
```typescript
// GET /api/upload?page=1&limit=20&search=term&category=photos
const response = await fetch(`/api/upload?${params}`);
const { images, total, hasMore } = await response.json();
```

## 🎨 Styling & Theming

The system is fully integrated with the application's theme system:
- Consistent color schemes
- Responsive design
- Dark/light mode support
- Accessible components
- Smooth animations and transitions

## 📱 Responsive Design

- Mobile-first approach
- Touch-friendly interface
- Responsive grid layouts
- Adaptive modal sizing
- Optimized for all screen sizes

## ♿ Accessibility

- ARIA labels and roles
- Keyboard navigation
- Screen reader support
- High contrast support
- Focus management

## 🚦 Error Handling

- File validation errors
- Upload failure recovery
- Network error handling
- User-friendly error messages
- Retry mechanisms

## 🔄 Future Enhancements

- **Cloud Storage Integration**: AWS S3, Cloudinary, etc.
- **Image Editing**: Built-in crop, rotate, filter tools
- **Advanced Metadata**: EXIF data preservation
- **Bulk Operations**: Mass upload, delete, organize
- **CDN Integration**: Automatic CDN distribution
- **Progressive Loading**: Lazy loading for large galleries
- **Real-time Collaboration**: Multi-user image sharing
- **Version Control**: Image versioning and history

## 📊 Performance

- Optimized file processing
- Lazy loading of gallery images
- Efficient thumbnail generation
- Memory management for large files
- Progressive enhancement
- Service worker caching (future)

This advanced image upload system provides a comprehensive solution for image management within the rich text editor, offering professional-grade features with an intuitive user interface.