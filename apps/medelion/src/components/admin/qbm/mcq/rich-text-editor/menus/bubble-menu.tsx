'use client';

import React from 'react';
import { BubbleMenu } from '@tiptap/react';
import { Editor } from '@tiptap/react';
import { Bold, Italic, Underline, Strikethrough, Code, Link, Highlighter, Type } from 'lucide-react';
import { useTheme } from '../../../../../../theme/context';

interface BubbleMenuComponentProps {
  editor: Editor;
}

export const BubbleMenuComponent: React.FC<BubbleMenuComponentProps> = ({ editor }) => {
  const { theme } = useTheme();

  if (!editor) {
    return null;
  }

  return (
    <BubbleMenu 
      editor={editor} 
      tippyOptions={{ duration: 100 }}
      shouldShow={({ state, from, to }: { state: any; from: number; to: number }) => {
        // Only show if text is selected
        return from !== to;
      }}
    >
      <div 
        className="flex items-center gap-1 p-2 rounded-lg shadow-lg border z-50"
        style={{
          backgroundColor: theme.colors.semantic.surface.elevated,
          borderColor: theme.colors.semantic.border.secondary,
        }}
      >
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className="p-1 rounded hover:bg-opacity-50 transition-colors"
          style={{
            color: editor.isActive('bold') 
              ? theme.colors.semantic.action.primary 
              : theme.colors.semantic.text.primary,
            backgroundColor: editor.isActive('bold') 
              ? theme.colors.semantic.action.hover 
              : 'transparent',
          }}
          title="Bold"
          onMouseEnter={(e) => {
            if (!editor.isActive('bold')) {
              e.currentTarget.style.backgroundColor = theme.colors.semantic.action.hover;
            }
          }}
          onMouseLeave={(e) => {
            if (!editor.isActive('bold')) {
              e.currentTarget.style.backgroundColor = 'transparent';
            }
          }}
        >
          <Bold size={16} />
        </button>
        
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className="p-1 rounded hover:bg-opacity-50 transition-colors"
          style={{
            color: editor.isActive('italic') 
              ? theme.colors.semantic.action.primary 
              : theme.colors.semantic.text.primary,
            backgroundColor: editor.isActive('italic') 
              ? theme.colors.semantic.action.hover 
              : 'transparent',
          }}
          title="Italic"
          onMouseEnter={(e) => {
            if (!editor.isActive('italic')) {
              e.currentTarget.style.backgroundColor = theme.colors.semantic.action.hover;
            }
          }}
          onMouseLeave={(e) => {
            if (!editor.isActive('italic')) {
              e.currentTarget.style.backgroundColor = 'transparent';
            }
          }}
        >
          <Italic size={16} />
        </button>
        
        <button
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className="p-1 rounded hover:bg-opacity-50 transition-colors"
          style={{
            color: editor.isActive('underline') 
              ? theme.colors.semantic.action.primary 
              : theme.colors.semantic.text.primary,
            backgroundColor: editor.isActive('underline') 
              ? theme.colors.semantic.action.hover 
              : 'transparent',
          }}
          title="Underline"
          onMouseEnter={(e) => {
            if (!editor.isActive('underline')) {
              e.currentTarget.style.backgroundColor = theme.colors.semantic.action.hover;
            }
          }}
          onMouseLeave={(e) => {
            if (!editor.isActive('underline')) {
              e.currentTarget.style.backgroundColor = 'transparent';
            }
          }}
        >
          <Underline size={16} />
        </button>
        
        <button
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className="p-1 rounded hover:bg-opacity-50 transition-colors"
          style={{
            color: editor.isActive('strike') 
              ? theme.colors.semantic.action.primary 
              : theme.colors.semantic.text.primary,
            backgroundColor: editor.isActive('strike') 
              ? theme.colors.semantic.action.hover 
              : 'transparent',
          }}
          title="Strikethrough"
          onMouseEnter={(e) => {
            if (!editor.isActive('strike')) {
              e.currentTarget.style.backgroundColor = theme.colors.semantic.action.hover;
            }
          }}
          onMouseLeave={(e) => {
            if (!editor.isActive('strike')) {
              e.currentTarget.style.backgroundColor = 'transparent';
            }
          }}
        >
          <Strikethrough size={16} />
        </button>
        
        <button
          onClick={() => editor.chain().focus().toggleCode().run()}
          className="p-1 rounded hover:bg-opacity-50 transition-colors"
          style={{
            color: editor.isActive('code') 
              ? theme.colors.semantic.action.primary 
              : theme.colors.semantic.text.primary,
            backgroundColor: editor.isActive('code') 
              ? theme.colors.semantic.action.hover 
              : 'transparent',
          }}
          title="Inline Code"
          onMouseEnter={(e) => {
            if (!editor.isActive('code')) {
              e.currentTarget.style.backgroundColor = theme.colors.semantic.action.hover;
            }
          }}
          onMouseLeave={(e) => {
            if (!editor.isActive('code')) {
              e.currentTarget.style.backgroundColor = 'transparent';
            }
          }}
        >
          <Code size={16} />
        </button>
        
        <div 
          className="w-px h-6 mx-1"
          style={{ backgroundColor: theme.colors.semantic.border.secondary }}
        />
        
        <button
          onClick={() => {
            const previousUrl = editor.getAttributes('link').href;
            const url = window.prompt('URL', previousUrl);
            
            if (url === null) {
              return;
            }
            
            if (url === '') {
              editor.chain().focus().extendMarkRange('link').unsetLink().run();
              return;
            }
            
            editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
          }}
          className="p-1 rounded hover:bg-opacity-50 transition-colors"
          style={{
            color: editor.isActive('link') 
              ? theme.colors.semantic.action.primary 
              : theme.colors.semantic.text.primary,
            backgroundColor: editor.isActive('link') 
              ? theme.colors.semantic.action.hover 
              : 'transparent',
          }}
          title="Link"
          onMouseEnter={(e) => {
            if (!editor.isActive('link')) {
              e.currentTarget.style.backgroundColor = theme.colors.semantic.action.hover;
            }
          }}
          onMouseLeave={(e) => {
            if (!editor.isActive('link')) {
              e.currentTarget.style.backgroundColor = 'transparent';
            }
          }}
        >
          <Link size={16} />
        </button>
        
        <button
          onClick={() => {
            const color = window.prompt('Text color (hex)', '#000000');
            if (color) {
              editor.chain().focus().setColor(color).run();
            }
          }}
          className="p-1 rounded hover:bg-opacity-50 transition-colors"
          style={{
            color: theme.colors.semantic.text.primary
          }}
          title="Text Color"
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = theme.colors.semantic.action.hover;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <Type size={16} />
        </button>
        
        <button
          onClick={() => {
            const color = window.prompt('Highlight color (hex)', '#ffff00');
            if (color) {
              editor.chain().focus().setHighlight({ color }).run();
            }
          }}
          className="p-1 rounded hover:bg-opacity-50 transition-colors"
          style={{
            color: editor.isActive('highlight') 
              ? theme.colors.semantic.action.primary 
              : theme.colors.semantic.text.primary,
            backgroundColor: editor.isActive('highlight') 
              ? theme.colors.semantic.action.hover 
              : 'transparent',
          }}
          title="Highlight"
          onMouseEnter={(e) => {
            if (!editor.isActive('highlight')) {
              e.currentTarget.style.backgroundColor = theme.colors.semantic.action.hover;
            }
          }}
          onMouseLeave={(e) => {
            if (!editor.isActive('highlight')) {
              e.currentTarget.style.backgroundColor = 'transparent';
            }
          }}
        >
          <Highlighter size={16} />
        </button>
      </div>
    </BubbleMenu>
  );
};