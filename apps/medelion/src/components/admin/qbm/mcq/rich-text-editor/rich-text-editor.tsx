'use client';

import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { Highlight } from '@tiptap/extension-highlight';
import { TextAlign } from '@tiptap/extension-text-align';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { Link } from '@tiptap/extension-link';
import { Image } from '@tiptap/extension-image';
import { Underline } from '@tiptap/extension-underline';
import { CodeBlockLowlight } from '@tiptap/extension-code-block-lowlight';
import { Typography } from '@tiptap/extension-typography';
import { Placeholder } from '@tiptap/extension-placeholder';
import { CharacterCount } from '@tiptap/extension-character-count';
import { Focus } from '@tiptap/extension-focus';
import FloatingMenu from '@tiptap/extension-floating-menu';
import BubbleMenu from '@tiptap/extension-bubble-menu';
import { common, createLowlight } from 'lowlight';
import { useTheme } from '../../../../../theme/context';

// Import toolbar components
import { SimpleToolbar } from './toolbar/simple-toolbar';
// import { EditorToolbar } from './toolbar/editor-toolbar';
// import { FloatingMenuComponent } from './menus/floating-menu';
// import { BubbleMenuComponent } from './menus/bubble-menu';

interface RichTextEditorProps {
  content?: string;
  onChange?: (content: string) => void;
  placeholder?: string;
  className?: string;
  maxLength?: number;
  showWordCount?: boolean;
  editable?: boolean;
  minHeight?: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  content = '',
  onChange,
  placeholder = 'Start typing...',
  className = '',
  maxLength = 5000,
  showWordCount = true,
  editable = true,
  minHeight = '200px',
}) => {
  const { theme } = useTheme();

  // Create lowlight instance
  const lowlight = createLowlight(common);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        codeBlock: false, // We'll use CodeBlockLowlight instead
      }),
      Underline,
      TextStyle,
      Color,
      Highlight.configure({
        multicolor: true,
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'editor-link',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'editor-image',
        },
      }),
      CodeBlockLowlight.configure({
        lowlight,
      }),
      Typography,
      Placeholder.configure({
        placeholder,
      }),
      CharacterCount.configure({
        limit: maxLength,
      }),
      Focus.configure({
        className: 'has-focus',
        mode: 'all',
      }),
      FloatingMenu.configure({
        shouldShow: null,
      }),
      BubbleMenu.configure({
        shouldShow: null,
      }),
    ],
    content,
    editable,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange?.(html);
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose-base lg:prose-lg xl:prose-2xl mx-auto focus:outline-none',
      },
    },
  });

  if (!editor) {
    return null;
  }

  const wordCount = editor.storage.characterCount.words();
  const characterCount = editor.storage.characterCount.characters();

  return (
    <div 
      className={`rich-text-editor border rounded-lg overflow-hidden ${className}`}
      style={{
        borderColor: theme.colors.semantic.border.secondary,
        backgroundColor: theme.colors.semantic.surface.primary,
      }}
    >
      {editable && (
        <>
          <SimpleToolbar editor={editor} />
          {/* <EditorToolbar editor={editor} />
          <FloatingMenuComponent editor={editor} />
          <BubbleMenuComponent editor={editor} /> */}
        </>
      )}

      <div 
        className="editor-content p-4"
        style={{ 
          minHeight,
          color: theme.colors.semantic.text.primary 
        }}
      >
        <EditorContent editor={editor} />
      </div>

      {showWordCount && (
        <div 
          className="px-4 py-2 border-t text-xs flex justify-between items-center"
          style={{
            borderColor: theme.colors.semantic.border.secondary,
            color: theme.colors.semantic.text.secondary,
            backgroundColor: theme.colors.semantic.surface.secondary,
          }}
        >
          <span>
            {wordCount} {wordCount === 1 ? 'word' : 'words'} • {characterCount} characters
          </span>
          {maxLength && (
            <span className={characterCount > maxLength ? 'text-red-500' : ''}>
              {characterCount}/{maxLength}
            </span>
          )}
        </div>
      )}

      <style jsx global>{`
        .rich-text-editor .ProseMirror {
          outline: none;
          padding: 0;
        }

        .rich-text-editor .ProseMirror p {
          margin: 0.75em 0;
        }

        .rich-text-editor .ProseMirror p:first-child {
          margin-top: 0;
        }

        .rich-text-editor .ProseMirror p:last-child {
          margin-bottom: 0;
        }

        .rich-text-editor .ProseMirror h1,
        .rich-text-editor .ProseMirror h2,
        .rich-text-editor .ProseMirror h3 {
          margin: 1em 0 0.5em 0;
          font-weight: 600;
        }

        .rich-text-editor .ProseMirror h1:first-child,
        .rich-text-editor .ProseMirror h2:first-child,
        .rich-text-editor .ProseMirror h3:first-child {
          margin-top: 0;
        }

        .rich-text-editor .ProseMirror ul,
        .rich-text-editor .ProseMirror ol {
          margin: 0.75em 0;
          padding-left: 1.5em;
        }

        .rich-text-editor .ProseMirror blockquote {
          border-left: 3px solid ${theme.colors.semantic.border.secondary};
          margin: 1em 0;
          padding-left: 1em;
          font-style: italic;
        }

        .rich-text-editor .ProseMirror pre {
          background: ${theme.colors.semantic.surface.secondary};
          border: 1px solid ${theme.colors.semantic.border.secondary};
          border-radius: 4px;
          padding: 0.75em 1em;
          margin: 1em 0;
          overflow-x: auto;
        }

        .rich-text-editor .ProseMirror table {
          border-collapse: collapse;
          margin: 1em 0;
          overflow: hidden;
          table-layout: fixed;
          width: 100%;
        }

        .rich-text-editor .ProseMirror table td,
        .rich-text-editor .ProseMirror table th {
          border: 1px solid ${theme.colors.semantic.border.secondary};
          box-sizing: border-box;
          min-width: 1em;
          padding: 3px 5px;
          position: relative;
          vertical-align: top;
        }

        .rich-text-editor .ProseMirror table th {
          background-color: ${theme.colors.semantic.surface.secondary};
          font-weight: 600;
        }

        .rich-text-editor .editor-link {
          color: ${theme.colors.semantic.action.primary};
          text-decoration: underline;
        }

        .rich-text-editor .editor-image {
          max-width: 100%;
          height: auto;
          border-radius: 4px;
        }

        .rich-text-editor .has-focus {
          border-radius: 3px;
          box-shadow: 0 0 0 2px ${theme.colors.semantic.action.focus}40;
        }

        .rich-text-editor .ProseMirror p.is-editor-empty:first-child::before {
          color: ${theme.colors.semantic.text.tertiary};
          content: attr(data-placeholder);
          float: left;
          height: 0;
          pointer-events: none;
        }
      `}</style>
    </div>
  );
};