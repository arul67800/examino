# MCQ View Integration Examples

This directory contains components for MCQ hierarchy management and settings configuration.

## Components Overview

### 1. `HierarchySettings`
The enhanced settings modal with live preview of MCQ view modes.

```tsx
import { HierarchySettings, HierarchySettingsType } from '@/components/admin/hierarchy';

export default function MyComponent() {
  const [settings, setSettings] = useState<HierarchySettingsType>({
    mcqEditView: 'page',
    showDeleteButton: true
  });
  const [showSettings, setShowSettings] = useState(false);

  return (
    <>
      <button onClick={() => setShowSettings(true)}>
        Open Settings
      </button>
      
      <HierarchySettings
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        settings={settings}
        onSettingsChange={setSettings}
      />
    </>
  );
}
```

### 2. MCQ Editors
The system includes three MCQ editor types in `/components/admin/question-bank-manager/mcq/editors/`:

```tsx
import { PageMCQEditor, InlineMCQEditor, ModalMCQEditor } from '@/components/admin/question-bank-manager/mcq/editors';

// For dedicated page editing
<PageMCQEditor 
  mcq={question}
  onSave={handleSave}
/>

// For inline editing within hierarchy
<InlineMCQEditor 
  mcq={question}
  onSave={handleSave}
  isExpanded={true}
  onToggle={setExpanded}
/>

// For modal editing
<ModalMCQEditor 
  mcq={question}
  onSave={handleSave}
  isOpen={isModalOpen}
  onClose={() => setModalOpen(false)}
/>
```

## View Modes Explained

### Inline View (`'inline'`)
- **Behavior**: MCQ editors appear directly within the hierarchy list
- **Use Case**: Quick editing without losing context of the hierarchy
- **Visual**: Expands below the hierarchy item with a dashed border
- **Icon**: 📝 MCQ

### Modal View (`'modal'`)
- **Behavior**: MCQ editors open in a popup overlay
- **Use Case**: Focused editing with enhanced tools
- **Visual**: Full-screen modal with backdrop blur
- **Icon**: 🖼️ MCQ

### Page View (`'page'`)
- **Behavior**: MCQ editors navigate to a dedicated page
- **Use Case**: Comprehensive editing with full features and navigation
- **Visual**: Complete page with navigation controls
- **Icon**: 📄 MCQ

## Integration with Existing Hierarchy

To integrate MCQ views into your existing hierarchy:

1. **Pass settings to HierarchyItemActions**:
```tsx
<HierarchyItemActions
  item={item}
  // ... other props
  mcqEditView={settings.mcqEditView}
  onMCQClick={(e, viewMode) => handleMCQClick(e, viewMode, item.id)}
/>
```

2. **Handle MCQ interactions**:
```tsx
const handleMCQClick = (e: React.MouseEvent, viewMode: 'inline' | 'modal' | 'page', itemId: string) => {
  switch (viewMode) {
    case 'inline':
      // Use InlineMCQEditor
      break;
    case 'modal':
      // Use ModalMCQEditor
      break;
    case 'page':
      // Navigate to page with PageMCQEditor
      router.push(`/admin/dashboard/question-bank-manager/mcq/${itemId}`);
      break;
  }
};
```

3. **Render appropriate MCQ components**:
```tsx
// For inline
{isInlineExpanded && (
  <InlineMCQEditor
    mcq={question}
    onSave={handleSave}
    isExpanded={true}
    onToggle={setExpanded}
  />
)}

// For modal
<ModalMCQEditor
  mcq={question}
  onSave={handleSave}
  isOpen={isModalOpen}
  onClose={handleModalClose}
/>

// For page (in separate route/page)
<PageMCQEditor
  mcq={question}
  onSave={handleSave}
/>
```

## Styling and Theming

All components use the theme system and provide consistent styling:
- Dynamic colors based on view mode
- Hover effects and animations
- Responsive design
- Accessible keyboard navigation
- Semantic color usage for different states

## Features

- ✅ Professional MCQ editing system with three editor types
- ✅ Live preview of settings changes in HierarchySettings
- ✅ Full TypeScript support with proper interfaces
- ✅ Theme integration with semantic colors
- ✅ Form validation and unsaved changes detection
- ✅ Responsive design for all screen sizes
- ✅ Accessibility features and keyboard navigation
- ✅ Professional UI with animations and transitions