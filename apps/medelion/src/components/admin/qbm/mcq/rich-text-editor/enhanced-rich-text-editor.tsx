'use client';

import React, { useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import { StarterKit } from '@tiptap/starter-kit';
import { Image } from '@tiptap/extension-image';
import { Link } from '@tiptap/extension-link';
import { TextAlign } from '@tiptap/extension-text-align';
import { Highlight } from '@tiptap/extension-highlight';
import { Subscript } from '@tiptap/extension-subscript';
import { Superscript } from '@tiptap/extension-superscript';
import { TaskList, TaskItem } from '@tiptap/extension-list';
import { CodeBlockLowlight } from '@tiptap/extension-code-block-lowlight';
import { all, createLowlight } from 'lowlight';
import { useTheme } from '@/theme';

// Import some Tiptap UI primitives for styling
import { Button, Toolbar, ToolbarGroup, ToolbarSeparator, Separator } from '@/lib/tiptap-exports';

const lowlight = createLowlight(all);

interface EnhancedRichTextEditorProps {
  content?: string;
  onChange?: (content: string) => void;
  placeholder?: string;
  className?: string;
  maxLength?: number;
  showWordCount?: boolean;
  editable?: boolean;
}

export function EnhancedRichTextEditor({
  content = '',
  onChange,
  placeholder = 'Start writing...',
  className = '',
  maxLength,
  showWordCount = true,
  editable = true,
}: EnhancedRichTextEditorProps) {
  const { theme } = useTheme();
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false, // We'll use CodeBlockLowlight instead
      }),
      Image.configure({
        inline: false,
        HTMLAttributes: {
          class: 'rounded-lg max-w-full h-auto',
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-500 hover:text-blue-600 underline',
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Highlight.configure({
        multicolor: true,
      }),
      Subscript,
      Superscript,
      TaskList.configure({
        HTMLAttributes: {
          class: 'task-list',
        },
      }),
      TaskItem.configure({
        nested: true,
        HTMLAttributes: {
          class: 'task-item',
        },
      }),
      CodeBlockLowlight.configure({
        lowlight,
        HTMLAttributes: {
          class: 'code-block rounded-lg p-4 bg-gray-100 dark:bg-gray-800',
        },
      }),
    ],
    content,
    editable,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      const text = editor.getText();
      
      setWordCount(text.split(/\s+/).filter(word => word.length > 0).length);
      setCharCount(text.length);
      
      if (onChange) {
        onChange(html);
      }
    },
    editorProps: {
      attributes: {
        class: `prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[200px] p-4`,
        style: `color: ${theme.colors.semantic.text.primary}; background-color: ${theme.colors.semantic.surface.primary};`,
      },
    },
  });

  // Handle character limit
  const isOverLimit = maxLength && charCount > maxLength;

  if (!editor) {
    return (
      <div className="flex items-center justify-center h-48">
        <div 
          className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin"
          style={{ borderColor: theme.colors.semantic.status.info }}
        />
      </div>
    );
  }

  // Custom toolbar buttons using Tiptap UI Button component
  const ToolbarButton = ({ 
    onClick, 
    isActive = false, 
    disabled = false, 
    children,
    title 
  }: { 
    onClick: () => void; 
    isActive?: boolean; 
    disabled?: boolean; 
    children: React.ReactNode;
    title?: string;
  }) => (
    <Button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`h-8 w-8 p-0 text-xs ${isActive ? 'bg-blue-100 text-blue-700 border-blue-300' : 'hover:bg-gray-100'}`}
    >
      {children}
    </Button>
  );

  return (
    <div 
      className={`rounded-xl border-2 overflow-hidden ${className}`}
      style={{
        backgroundColor: theme.colors.semantic.surface.primary,
        borderColor: theme.colors.semantic.border.secondary + '30'
      }}
    >
      {/* Enhanced Toolbar */}
      <Toolbar className="p-4 border-b" style={{ borderColor: theme.colors.semantic.border.secondary + '30' }}>
        <ToolbarGroup>
          <ToolbarButton
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            title="Undo"
          >
            ↶
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            title="Redo"
          >
            ↷
          </ToolbarButton>
        </ToolbarGroup>

        <ToolbarSeparator />

        <ToolbarGroup>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            isActive={editor.isActive('bold')}
            title="Bold"
          >
            <strong>B</strong>
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            isActive={editor.isActive('italic')}
            title="Italic"
          >
            <em>I</em>
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleStrike().run()}
            isActive={editor.isActive('strike')}
            title="Strikethrough"
          >
            <s>S</s>
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleCode().run()}
            isActive={editor.isActive('code')}
            title="Code"
          >
            &lt;/&gt;
          </ToolbarButton>
        </ToolbarGroup>

        <ToolbarSeparator />

        <ToolbarGroup>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            isActive={editor.isActive('heading', { level: 1 })}
            title="Heading 1"
          >
            H1
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            isActive={editor.isActive('heading', { level: 2 })}
            title="Heading 2"
          >
            H2
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            isActive={editor.isActive('heading', { level: 3 })}
            title="Heading 3"
          >
            H3
          </ToolbarButton>
        </ToolbarGroup>

        <ToolbarSeparator />

        <ToolbarGroup>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            isActive={editor.isActive('bulletList')}
            title="Bullet List"
          >
            •
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            isActive={editor.isActive('orderedList')}
            title="Numbered List"
          >
            1.
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleTaskList().run()}
            isActive={editor.isActive('taskList')}
            title="Task List"
          >
            ☐
          </ToolbarButton>
        </ToolbarGroup>

        <ToolbarSeparator />

        <ToolbarGroup>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            isActive={editor.isActive('blockquote')}
            title="Blockquote"
          >
            "
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            isActive={editor.isActive('codeBlock')}
            title="Code Block"
          >
            {'{}'}
          </ToolbarButton>
        </ToolbarGroup>
      </Toolbar>

      {/* Editor Content */}
      <div className="relative">
        <EditorContent 
          editor={editor}
          className={`min-h-[200px] ${isOverLimit ? 'border-red-500' : ''}`}
        />
        
        {placeholder && !editor.getText() && (
          <div 
            className="absolute top-4 left-4 pointer-events-none text-sm"
            style={{ color: theme.colors.semantic.text.secondary + '60' }}
          >
            {placeholder}
          </div>
        )}
      </div>

      {/* Footer with stats */}
      {(showWordCount || maxLength) && (
        <div 
          className="px-4 py-2 border-t flex justify-between items-center text-xs"
          style={{ 
            borderColor: theme.colors.semantic.border.secondary + '30',
            backgroundColor: theme.colors.semantic.surface.secondary + '20'
          }}
        >
          <div style={{ color: theme.colors.semantic.text.secondary }}>
            {showWordCount && (
              <span>
                {wordCount} word{wordCount !== 1 ? 's' : ''} • {charCount} character{charCount !== 1 ? 's' : ''}
              </span>
            )}
          </div>
          
          {maxLength && (
            <div 
              className={`font-medium ${isOverLimit ? 'text-red-500' : ''}`}
              style={{ color: isOverLimit ? theme.colors.semantic.status.error : theme.colors.semantic.text.secondary }}
            >
              {charCount}/{maxLength}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default EnhancedRichTextEditor;