# MCQ Hierarchy Breadcrumb Components

## Overview
A sophisticated breadcrumb system for navigating MCQ hierarchies with individual and combined selectors.

## Components

### 1. **MCQHierarchyBreadcrumb** (Main Component)
The main breadcrumb component that displays the hierarchy path with smart empty state handling.

### 2. **IndividualBreadcrumbSelector**
Individual dropdown selector for each hierarchy level.

### 3. **CombinedBreadcrumbSelector**
Combined modal selector for setting the complete hierarchy path.

## Key Features

### ✨ Enhanced Empty State Handling
- Shows "Select Year", "Select Subject", "Select Chapter" etc. for empty levels
- Displays all levels up to the next available selection + 1
- Smart logic to show progression path even when levels are empty

### 🎨 Elegant Design
- Modern pill-style buttons with gradients
- Smooth hover animations and transitions
- Theme-compliant styling throughout
- Professional shadows and visual hierarchy

### 🔧 Individual Level Selectors
- Each breadcrumb item has its own dropdown
- Clear selection options with icons
- Visual feedback for current selection
- Optimized for both compact and full modes

### 🚀 Combined Selector Modal
- Spacious layout with better visual hierarchy
- Cascading dropdowns that update based on selections
- Apply/Cancel functionality for bulk changes
- Color-coded headers and proper spacing

## Usage Example

```tsx
import { MCQHierarchyBreadcrumb } from '@/components/admin/qbm/mcq/breadcrumb';

function MCQEditor() {
  const [hierarchyPath, setHierarchyPath] = useState({
    year: undefined,      // Shows "Select Year"
    subject: undefined,   // Shows "Select Subject" after year is selected
    // ... etc
  });

  return (
    <MCQHierarchyBreadcrumb
      hierarchyPath={hierarchyPath}
      onHierarchyChange={setHierarchyPath}
      compact={false}
    />
  );
}
```

## Smart Display Logic

The breadcrumb now intelligently shows:
1. **All selected levels** - with actual names and styling
2. **Next available level** - with "Select [Level]" placeholder
3. **Progressive disclosure** - only showing levels that make sense in context

### Example Scenarios:

1. **Empty state**: Shows "Select Year"
2. **Year selected**: Shows "First Year" > "Select Subject"  
3. **Year + Subject**: Shows "First Year" > "Anatomy" > "Select Part"
4. **Complete path**: Shows all levels with full styling

## Theme Integration

All components use semantic theme colors:
- `theme.colors.semantic.action.primary` - Primary actions and highlights
- `theme.colors.semantic.text.secondary` - Secondary text and labels  
- `theme.colors.semantic.surface.secondary` - Background surfaces
- `theme.colors.semantic.border.primary` - Borders and separators

## Interactive States

- **Hover**: Scale and shadow effects
- **Active**: Gradient backgrounds and enhanced shadows
- **Focus**: Ring indicators and color changes
- **Empty**: Dashed borders and muted styling