// Export the Tiptap Simple Editor components for easy access
export { SimpleEditor } from '../components/tiptap-templates/simple/simple-editor';

// Export useful UI primitives
export { Button } from '../components/tiptap-ui-primitive/button';
export { Toolbar, ToolbarGroup, ToolbarSeparator } from '../components/tiptap-ui-primitive/toolbar';
export { Tooltip } from '../components/tiptap-ui-primitive/tooltip';
export { Badge } from '../components/tiptap-ui-primitive/badge';
export { Card } from '../components/tiptap-ui-primitive/card';
export { Input } from '../components/tiptap-ui-primitive/input';
export { Popover } from '../components/tiptap-ui-primitive/popover';
export { DropdownMenu } from '../components/tiptap-ui-primitive/dropdown-menu';
export { Separator } from '../components/tiptap-ui-primitive/separator';
export { Spacer } from '../components/tiptap-ui-primitive/spacer';

// Export useful UI components
export { HeadingDropdownMenu } from '../components/tiptap-ui/heading-dropdown-menu';
export { ImageUploadButton } from '../components/tiptap-ui/image-upload-button';
export { ListDropdownMenu } from '../components/tiptap-ui/list-dropdown-menu';
export { BlockquoteButton } from '../components/tiptap-ui/blockquote-button';
export { CodeBlockButton } from '../components/tiptap-ui/code-block-button';
export { ColorHighlightPopover } from '../components/tiptap-ui/color-highlight-popover';
export { LinkPopover } from '../components/tiptap-ui/link-popover';
export { MarkButton } from '../components/tiptap-ui/mark-button';
export { TextAlignButton } from '../components/tiptap-ui/text-align-button';
export { UndoRedoButton } from '../components/tiptap-ui/undo-redo-button';
export { HeadingButton } from '../components/tiptap-ui/heading-button';
export { ListButton } from '../components/tiptap-ui/list-button';
export { ColorHighlightButton } from '../components/tiptap-ui/color-highlight-button';

// Export useful hooks
export { useTiptapEditor } from '../hooks/use-tiptap-editor';
export { useIsMobile } from '../hooks/use-mobile';
export { useWindowSize } from '../hooks/use-window-size';
export { useCursorVisibility } from '../hooks/use-cursor-visibility';
export { useScrolling } from '../hooks/use-scrolling';
export { useMenuNavigation } from '../hooks/use-menu-navigation';
export { useComposedRef } from '../hooks/use-composed-ref';
export { useThrottledCallback } from '../hooks/use-throttled-callback';
export { useUnmount } from '../hooks/use-unmount';
export { useElementRect } from '../hooks/use-element-rect';

// Export utilities
export * from './tiptap-utils';