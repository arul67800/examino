# Image Overlay - Modular Architecture

A comprehensive, modular React component system for handling image interactions in a rich text editor with Google Docs-like functionality.

## 📁 Structure Overview

```
image-overlay/
├── index.ts                 # Main exports
├── ImageOverlay.tsx         # Main React component
├── types.ts                 # TypeScript definitions
├── utils.ts                 # Browser compatibility utilities
├── insertion-detection.ts   # Line detection algorithms
├── text-wrap.ts            # Text wrapping logic
├── positioning.ts          # Position calculations
├── drag-handler.ts         # Drag & drop functionality
├── hooks.ts                # Custom React hooks
├── ui-components.tsx       # UI component library
└── README.md               # This documentation
```

## 🧩 Module Breakdown

### Core Types (`types.ts`)
- **TextWrapMode**: `'inline' | 'square' | 'topBottom' | 'behindText' | 'inFrontOfText' | 'break'`
- **TextAlignment**: `'left' | 'center' | 'right'`
- **TextWrapSettings**: Complete configuration interface
- **DragState**: Drag operation state management

### Browser Utilities (`utils.ts`)
- **Cross-browser compatibility** for `caretRangeFromPoint` (WebKit) and `caretPositionFromPoint` (Firefox)
- **Position-aware alignment detection** based on drop coordinates
- **25%/75% threshold system** for left/right/center alignment

### Insertion Detection (`insertion-detection.ts`)
- **Google Docs-like line detection** for precise image placement
- **Text node enumeration** and range-based positioning
- **High-precision insertion points** between individual text lines
- **Fallback mechanisms** for various editor structures

### Text Wrapping (`text-wrap.ts`)
- **CSS-based text flow control** with float and margin properties
- **Wrap mode implementations**:
  - `inline`: Flows with text naturally
  - `square`: Text wraps around image (float-based)
  - `topBottom`: Text above and below only
  - `break`: Forces line break (used during dragging)
  - `behindText` & `inFrontOfText`: Layering modes
- **Dynamic alignment application** with position-aware adjustments

### Position Management (`positioning.ts`)
- **Coordinate system transformations** between image, editor, and overlay
- **Scroll and resize event handling** for position updates
- **Performance-optimized** with `requestAnimationFrame`
- **Multi-level scroll container support**

### Drag & Drop (`drag-handler.ts`)
- **Visual feedback system** with animated placeholders
- **Precision indicators** (high vs standard precision)
- **Smooth drag experience** with temporary absolute positioning
- **Drop zone detection** and intelligent insertion
- **Position-aware alignment** application on drop

### Custom Hooks (`hooks.ts`)
- **`useDragHandler`**: Complete drag & drop state management
- **`useImageSelection`**: Selection state and click handling
- **`usePositionMonitor`**: Real-time alignment monitoring
- **`useResizeHandler`**: Image resizing functionality

### UI Components (`ui-components.tsx`)
- **`ResizeHandle`**: 8-direction resize controls
- **`ImageToolbar`**: Rotate, move, and settings controls
- **`DragPlaceholder`**: Animated drop indicators
- **`LoadingSpinner`** & **`ErrorMessage`**: Status components

### Main Component (`ImageOverlay.tsx`)
- **Orchestrates all modules** into a cohesive experience
- **State management** for settings, loading, errors, and interactions
- **Responsive controls** that show/hide based on state
- **Development debug info** for easier troubleshooting

## 🎯 Key Features

### ✅ Google Docs-Like Experience
- Precise line-by-line insertion detection
- Smooth visual feedback during dragging
- Position-aware alignment system

### ✅ Cross-Browser Compatibility
- WebKit (`caretRangeFromPoint`) support
- Firefox (`caretPositionFromPoint`) support
- Graceful fallbacks for unsupported browsers

### ✅ Advanced Text Wrapping
- Multiple wrap modes with CSS float implementation
- Dynamic alignment based on drop position
- Real-time wrap settings application

### ✅ Professional UI/UX
- 8-directional resize handles
- Contextual toolbar with rotation and settings
- Loading states and error handling
- Smooth animations and transitions

### ✅ Performance Optimized
- `requestAnimationFrame` for smooth interactions
- Event delegation and cleanup
- Modular loading to minimize bundle size

## 🚀 Usage Examples

### Basic Implementation
```tsx
import { ImageOverlay } from './image-overlay';

const MyEditor = () => {
  const [selectedImage, setSelectedImage] = useState<HTMLImageElement | null>(null);
  const editorRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={editorRef} className="editor">
      {/* Your editor content */}
      
      {selectedImage && (
        <ImageOverlay
          imageElement={selectedImage}
          editorElement={editorRef.current}
          onRemove={() => setSelectedImage(null)}
          initialSettings={{ mode: 'square', alignment: 'left' }}
        />
      )}
    </div>
  );
};
```

### Advanced Configuration
```tsx
<ImageOverlay
  imageElement={imageElement}
  editorElement={editorElement}
  showControls={true}
  isReadOnly={false}
  initialSettings={{
    mode: 'square',
    alignment: 'center',
    distanceFromText: 20
  }}
  onRemove={() => handleImageRemoval()}
/>
```

### Custom Hook Usage
```tsx
import { useDragHandler, useImageSelection } from './image-overlay';

const CustomImageComponent = () => {
  const imageRef = useRef<HTMLImageElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  
  const { dragState, startDrag } = useDragHandler({
    imageRef,
    editorElement: editorRef.current,
    onSettingsUpdate: (settings) => console.log('New settings:', settings)
  });
  
  const { isSelected, handleImageClick } = useImageSelection({
    imageRef,
    onSelectionChange: (selected) => console.log('Selected:', selected)
  });
  
  // ... component implementation
};
```

## 🛠 Development & Debugging

The modular structure makes it easy to:
- **Test individual modules** in isolation
- **Debug specific functionality** without touching other parts
- **Extend capabilities** by adding new modules
- **Customize behavior** by swapping module implementations

Enable development mode to see debug information:
```tsx
// Automatically shows debug overlay in development
<ImageOverlay {...props} />
```

## 🔄 Migration from Monolithic Component

The original monolithic `ImageOverlay.tsx` has been preserved and broken down into this modular structure while maintaining **100% feature parity**. All functionality including:

- Cross-browser drag & drop ✅
- Google Docs-like line detection ✅
- Position-aware alignment ✅
- Text wrapping modes ✅
- Visual feedback systems ✅

## 📈 Benefits of Modular Architecture

1. **Maintainability**: Each module has a single responsibility
2. **Testability**: Individual functions can be unit tested
3. **Reusability**: Modules can be used in other components
4. **Scalability**: Easy to add new features without affecting existing code
5. **Performance**: Tree-shaking eliminates unused code
6. **Developer Experience**: Clear separation of concerns