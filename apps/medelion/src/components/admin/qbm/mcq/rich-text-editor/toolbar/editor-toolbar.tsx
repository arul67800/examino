'use client';

import React from 'react';
import { Editor } from '@tiptap/react';
import { useTheme } from '../../../../../../theme/context';
import { 
  Bold, 
  Italic, 
  Underline, 
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Quote,
  Code,
  Code2,
  Undo,
  Redo,
  Type,
  Palette,
  Highlighter,
  Table,
  Link,
  Image,
  Heading1,
  Heading2,
  Heading3
} from 'lucide-react';

import { FormatButton } from './format-button';
import { HeadingSelector } from './heading-selector';
import { ColorPicker } from './color-picker';
import { TableControls } from './table-controls';
import { LinkDialog } from './link-dialog';
import { ImageDialog } from './image-dialog';

interface EditorToolbarProps {
  editor: Editor;
}

export const EditorToolbar: React.FC<EditorToolbarProps> = ({ editor }) => {
  const { theme } = useTheme();
  const [showLinkDialog, setShowLinkDialog] = React.useState(false);
  const [showImageDialog, setShowImageDialog] = React.useState(false);
  const [showColorPicker, setShowColorPicker] = React.useState(false);
  const [showHighlightPicker, setShowHighlightPicker] = React.useState(false);

  if (!editor) {
    return null;
  }

  return (
    <>
      <div 
        className="flex flex-wrap items-center gap-1 p-2 border-b"
        style={{
          borderColor: theme.colors.semantic.border.secondary,
          backgroundColor: theme.colors.semantic.surface.secondary,
        }}
      >
        {/* Undo/Redo */}
        <div className="flex items-center gap-1 pr-2" style={{ 
          borderRight: `1px solid ${theme.colors.semantic.border.secondary}`
        }}>
          <FormatButton
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            title="Undo"
          >
            <Undo size={16} />
          </FormatButton>
          <FormatButton
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            title="Redo"
          >
            <Redo size={16} />
          </FormatButton>
        </div>

        {/* Headings */}
        <div className="flex items-center gap-1 pr-2 border-r" style={{ borderColor: theme.colors.semantic.border.secondary }}>
          <HeadingSelector editor={editor} />
        </div>

        {/* Text Formatting */}
        <div className="flex items-center gap-1 pr-2 border-r" style={{ borderColor: theme.colors.semantic.border.secondary }}>
          <FormatButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            isActive={editor.isActive('bold')}
            title="Bold"
          >
            <Bold size={16} />
          </FormatButton>
          <FormatButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            isActive={editor.isActive('italic')}
            title="Italic"
          >
            <Italic size={16} />
          </FormatButton>
          <FormatButton
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            isActive={editor.isActive('underline')}
            title="Underline"
          >
            <Underline size={16} />
          </FormatButton>
          <FormatButton
            onClick={() => editor.chain().focus().toggleStrike().run()}
            isActive={editor.isActive('strike')}
            title="Strikethrough"
          >
            <Strikethrough size={16} />
          </FormatButton>
          <FormatButton
            onClick={() => editor.chain().focus().toggleCode().run()}
            isActive={editor.isActive('code')}
            title="Inline Code"
          >
            <Code size={16} />
          </FormatButton>
        </div>

        {/* Colors */}
        <div className="flex items-center gap-1 pr-2 border-r" style={{ borderColor: theme.colors.semantic.border.secondary }}>
          <FormatButton
            onClick={() => setShowColorPicker(!showColorPicker)}
            title="Text Color"
          >
            <Type size={16} />
          </FormatButton>
          <FormatButton
            onClick={() => setShowHighlightPicker(!showHighlightPicker)}
            title="Highlight"
          >
            <Highlighter size={16} />
          </FormatButton>
        </div>

        {/* Text Alignment */}
        <div className="flex items-center gap-1 pr-2 border-r" style={{ borderColor: theme.colors.semantic.border.secondary }}>
          <FormatButton
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            isActive={editor.isActive({ textAlign: 'left' })}
            title="Align Left"
          >
            <AlignLeft size={16} />
          </FormatButton>
          <FormatButton
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            isActive={editor.isActive({ textAlign: 'center' })}
            title="Align Center"
          >
            <AlignCenter size={16} />
          </FormatButton>
          <FormatButton
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            isActive={editor.isActive({ textAlign: 'right' })}
            title="Align Right"
          >
            <AlignRight size={16} />
          </FormatButton>
          <FormatButton
            onClick={() => editor.chain().focus().setTextAlign('justify').run()}
            isActive={editor.isActive({ textAlign: 'justify' })}
            title="Justify"
          >
            <AlignJustify size={16} />
          </FormatButton>
        </div>

        {/* Lists */}
        <div className="flex items-center gap-1 pr-2 border-r" style={{ borderColor: theme.colors.semantic.border.secondary }}>
          <FormatButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            isActive={editor.isActive('bulletList')}
            title="Bullet List"
          >
            <List size={16} />
          </FormatButton>
          <FormatButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            isActive={editor.isActive('orderedList')}
            title="Numbered List"
          >
            <ListOrdered size={16} />
          </FormatButton>
        </div>

        {/* Block Elements */}
        <div className="flex items-center gap-1 pr-2 border-r" style={{ borderColor: theme.colors.semantic.border.secondary }}>
          <FormatButton
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            isActive={editor.isActive('blockquote')}
            title="Quote"
          >
            <Quote size={16} />
          </FormatButton>
          <FormatButton
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            isActive={editor.isActive('codeBlock')}
            title="Code Block"
          >
            <Code2 size={16} />
          </FormatButton>
        </div>

        {/* Advanced Elements */}
        <div className="flex items-center gap-1">
          <TableControls editor={editor} />
          <FormatButton
            onClick={() => setShowLinkDialog(true)}
            isActive={editor.isActive('link')}
            title="Insert Link"
          >
            <Link size={16} />
          </FormatButton>
          <FormatButton
            onClick={() => setShowImageDialog(true)}
            title="Insert Image"
          >
            <Image size={16} />
          </FormatButton>
        </div>
      </div>

      {/* Color Pickers */}
      {showColorPicker && (
        <ColorPicker
          editor={editor}
          type="color"
          onClose={() => setShowColorPicker(false)}
        />
      )}
      {showHighlightPicker && (
        <ColorPicker
          editor={editor}
          type="highlight"
          onClose={() => setShowHighlightPicker(false)}
        />
      )}

      {/* Dialogs */}
      <LinkDialog
        editor={editor}
        isOpen={showLinkDialog}
        onClose={() => setShowLinkDialog(false)}
      />
      <ImageDialog
        editor={editor}
        isOpen={showImageDialog}
        onClose={() => setShowImageDialog(false)}
      />
    </>
  );
};