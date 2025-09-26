'use client';

import React from 'react';
import { Editor } from '@tiptap/react';
import { 
  Bold, 
  Italic, 
  Underline, 
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  Heading1,
  Heading2
} from 'lucide-react';
import { useTheme } from '../../../../../../theme/context';

interface SimpleToolbarProps {
  editor: Editor;
}

export const SimpleToolbar: React.FC<SimpleToolbarProps> = ({ editor }) => {
  const { theme } = useTheme();

  if (!editor) {
    return null;
  }

  const ToolbarButton = ({ onClick, isActive, children, title, disabled = false }: {
    onClick: () => void;
    isActive?: boolean;
    children: React.ReactNode;
    title: string;
    disabled?: boolean;
  }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className="p-2 rounded hover:bg-opacity-50 transition-colors disabled:opacity-50"
      style={{
        backgroundColor: isActive 
          ? theme.colors.semantic.action.hover 
          : 'transparent',
        color: isActive 
          ? theme.colors.semantic.action.primary 
          : theme.colors.semantic.text.primary,
      }}
      onMouseEnter={(e) => {
        if (!disabled && !isActive) {
          e.currentTarget.style.backgroundColor = theme.colors.semantic.action.hover;
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled && !isActive) {
          e.currentTarget.style.backgroundColor = 'transparent';
        }
      }}
    >
      {children}
    </button>
  );

  return (
    <div 
      className="flex items-center gap-1 p-2 border-b"
      style={{
        borderColor: theme.colors.semantic.border.secondary,
        backgroundColor: theme.colors.semantic.surface.secondary,
      }}
    >
      {/* Undo/Redo */}
      <ToolbarButton
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        title="Undo"
      >
        <Undo size={16} />
      </ToolbarButton>
      
      <ToolbarButton
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        title="Redo"
      >
        <Redo size={16} />
      </ToolbarButton>

      <div className="w-px h-6 mx-1" style={{ backgroundColor: theme.colors.semantic.border.secondary }} />

      {/* Headings */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        isActive={editor.isActive('heading', { level: 1 })}
        title="Heading 1"
      >
        <Heading1 size={16} />
      </ToolbarButton>
      
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        isActive={editor.isActive('heading', { level: 2 })}
        title="Heading 2"
      >
        <Heading2 size={16} />
      </ToolbarButton>

      <div className="w-px h-6 mx-1" style={{ backgroundColor: theme.colors.semantic.border.secondary }} />

      {/* Text Formatting */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        isActive={editor.isActive('bold')}
        title="Bold"
      >
        <Bold size={16} />
      </ToolbarButton>
      
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        isActive={editor.isActive('italic')}
        title="Italic"
      >
        <Italic size={16} />
      </ToolbarButton>
      
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        isActive={editor.isActive('underline')}
        title="Underline"
      >
        <Underline size={16} />
      </ToolbarButton>

      <div className="w-px h-6 mx-1" style={{ backgroundColor: theme.colors.semantic.border.secondary }} />

      {/* Lists */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        isActive={editor.isActive('bulletList')}
        title="Bullet List"
      >
        <List size={16} />
      </ToolbarButton>
      
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        isActive={editor.isActive('orderedList')}
        title="Numbered List"
      >
        <ListOrdered size={16} />
      </ToolbarButton>

      <div className="w-px h-6 mx-1" style={{ backgroundColor: theme.colors.semantic.border.secondary }} />

      {/* Quote */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        isActive={editor.isActive('blockquote')}
        title="Quote"
      >
        <Quote size={16} />
      </ToolbarButton>
    </div>
  );
};