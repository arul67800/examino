'use client';

import React from 'react';
import { FloatingMenu } from '@tiptap/react';
import { Editor } from '@tiptap/react';
import { Heading1, Heading2, Heading3, List, ListOrdered, Quote, Code2 } from 'lucide-react';
import { useTheme } from '../../../../../../theme/context';

interface FloatingMenuComponentProps {
  editor: Editor;
}

export const FloatingMenuComponent: React.FC<FloatingMenuComponentProps> = ({ editor }) => {
  const { theme } = useTheme();

  if (!editor) {
    return null;
  }

  return (
    <FloatingMenu 
      editor={editor} 
      tippyOptions={{ duration: 100 }}
      shouldShow={({ state }: { state: any }) => {
        const { $anchor } = state.selection;
        const node = $anchor.node();
        
        if (node.content.size > 0) {
          return false;
        }

        return true;
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
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className="p-1 rounded hover:bg-opacity-50 transition-colors"
          style={{
            color: editor.isActive('heading', { level: 1 }) 
              ? theme.colors.semantic.action.primary 
              : theme.colors.semantic.text.primary
          }}
          title="Heading 1"
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = theme.colors.semantic.action.hover;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <Heading1 size={18} />
        </button>
        
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className="p-1 rounded hover:bg-opacity-50 transition-colors"
          style={{
            color: editor.isActive('heading', { level: 2 }) 
              ? theme.colors.semantic.action.primary 
              : theme.colors.semantic.text.primary
          }}
          title="Heading 2"
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = theme.colors.semantic.action.hover;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <Heading2 size={18} />
        </button>
        
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className="p-1 rounded hover:bg-opacity-50 transition-colors"
          style={{
            color: editor.isActive('heading', { level: 3 }) 
              ? theme.colors.semantic.action.primary 
              : theme.colors.semantic.text.primary
          }}
          title="Heading 3"
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = theme.colors.semantic.action.hover;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <Heading3 size={18} />
        </button>
        
        <div 
          className="w-px h-6 mx-1"
          style={{ backgroundColor: theme.colors.semantic.border.secondary }}
        />
        
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className="p-1 rounded hover:bg-opacity-50 transition-colors"
          style={{
            color: editor.isActive('bulletList') 
              ? theme.colors.semantic.action.primary 
              : theme.colors.semantic.text.primary
          }}
          title="Bullet List"
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = theme.colors.semantic.action.hover;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <List size={18} />
        </button>
        
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className="p-1 rounded hover:bg-opacity-50 transition-colors"
          style={{
            color: editor.isActive('orderedList') 
              ? theme.colors.semantic.action.primary 
              : theme.colors.semantic.text.primary
          }}
          title="Numbered List"
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = theme.colors.semantic.action.hover;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <ListOrdered size={18} />
        </button>
        
        <button
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className="p-1 rounded hover:bg-opacity-50 transition-colors"
          style={{
            color: editor.isActive('blockquote') 
              ? theme.colors.semantic.action.primary 
              : theme.colors.semantic.text.primary
          }}
          title="Quote"
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = theme.colors.semantic.action.hover;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <Quote size={18} />
        </button>
        
        <button
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className="p-1 rounded hover:bg-opacity-50 transition-colors"
          style={{
            color: editor.isActive('codeBlock') 
              ? theme.colors.semantic.action.primary 
              : theme.colors.semantic.text.primary
          }}
          title="Code Block"
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = theme.colors.semantic.action.hover;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <Code2 size={18} />
        </button>
      </div>
    </FloatingMenu>
  );
};