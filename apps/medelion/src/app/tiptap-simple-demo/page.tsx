'use client';

import React, { useState } from 'react';
import { useTheme } from '@/theme';
import { SimpleEditor } from '@/lib/tiptap-exports';

export default function TiptapSimpleEditorDemo() {
  const { theme } = useTheme();
  const [editorContent, setEditorContent] = useState('');

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: theme.colors.semantic.surface.secondary + '10' }}>
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div 
          className="rounded-xl p-6 border-2 text-center"
          style={{
            backgroundColor: theme.colors.semantic.surface.primary,
            borderColor: theme.colors.semantic.border.secondary + '30'
          }}
        >
          <div 
            className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
            style={{ backgroundColor: theme.colors.semantic.status.success + '20' }}
          >
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20" style={{ color: theme.colors.semantic.status.success }}>
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
          </div>
          <h1 
            className="text-3xl font-bold mb-2"
            style={{ color: theme.colors.semantic.text.primary }}
          >
            🚀 Tiptap Simple Editor
          </h1>
          <p 
            className="text-lg"
            style={{ color: theme.colors.semantic.text.secondary }}
          >
            Professional rich text editor with advanced formatting, powered by Tiptap
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div 
            className="p-6 rounded-xl border-2 text-center"
            style={{
              backgroundColor: theme.colors.semantic.surface.primary,
              borderColor: theme.colors.semantic.border.secondary + '30'
            }}
          >
            <div 
              className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center"
              style={{ backgroundColor: theme.colors.semantic.status.info + '20' }}
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" style={{ color: theme.colors.semantic.status.info }}>
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 
              className="font-semibold mb-2"
              style={{ color: theme.colors.semantic.text.primary }}
            >
              Rich Formatting
            </h3>
            <p 
              className="text-sm"
              style={{ color: theme.colors.semantic.text.secondary }}
            >
              Bold, italic, headings, lists, and more
            </p>
          </div>

          <div 
            className="p-6 rounded-xl border-2 text-center"
            style={{
              backgroundColor: theme.colors.semantic.surface.primary,
              borderColor: theme.colors.semantic.border.secondary + '30'
            }}
          >
            <div 
              className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center"
              style={{ backgroundColor: theme.colors.semantic.status.warning + '20' }}
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" style={{ color: theme.colors.semantic.status.warning }}>
                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 
              className="font-semibold mb-2"
              style={{ color: theme.colors.semantic.text.primary }}
            >
              Media Support
            </h3>
            <p 
              className="text-sm"
              style={{ color: theme.colors.semantic.text.secondary }}
            >
              Images, links, and media integration
            </p>
          </div>

          <div 
            className="p-6 rounded-xl border-2 text-center"
            style={{
              backgroundColor: theme.colors.semantic.surface.primary,
              borderColor: theme.colors.semantic.border.secondary + '30'
            }}
          >
            <div 
              className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center"
              style={{ backgroundColor: theme.colors.semantic.status.success + '20' }}
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" style={{ color: theme.colors.semantic.status.success }}>
                <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 
              className="font-semibold mb-2"
              style={{ color: theme.colors.semantic.text.primary }}
            >
              Developer Ready
            </h3>
            <p 
              className="text-sm"
              style={{ color: theme.colors.semantic.text.secondary }}
            >
              TypeScript, extensible, customizable
            </p>
          </div>
        </div>

        {/* Editor Demo */}
        <div 
          className="rounded-xl border-2"
          style={{
            backgroundColor: theme.colors.semantic.surface.primary,
            borderColor: theme.colors.semantic.border.secondary + '30'
          }}
        >
          <div className="p-6 border-b" style={{ borderColor: theme.colors.semantic.border.secondary + '30' }}>
            <h2 
              className="text-xl font-bold mb-2"
              style={{ color: theme.colors.semantic.text.primary }}
            >
              ✏️ Try the Editor
            </h2>
            <p 
              className="text-sm"
              style={{ color: theme.colors.semantic.text.secondary }}
            >
              Test all the features of the Tiptap Simple Editor below
            </p>
          </div>
          
          <div className="p-6">
            <SimpleEditor />
          </div>
        </div>

        {/* Features List */}
        <div 
          className="rounded-xl p-6 border-2"
          style={{
            backgroundColor: theme.colors.semantic.surface.primary,
            borderColor: theme.colors.semantic.border.secondary + '30'
          }}
        >
          <h2 
            className="text-xl font-bold mb-4"
            style={{ color: theme.colors.semantic.text.primary }}
          >
            🎯 Available Features
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div>
              <h3 
                className="font-semibold mb-2"
                style={{ color: theme.colors.semantic.text.primary }}
              >
                Text Formatting
              </h3>
              <ul className="space-y-1" style={{ color: theme.colors.semantic.text.secondary }}>
                <li>• Bold, Italic, Underline, Strike</li>
                <li>• Headings (H1 - H6)</li>
                <li>• Superscript & Subscript</li>
                <li>• Text alignment options</li>
                <li>• Code formatting</li>
              </ul>
            </div>
            
            <div>
              <h3 
                className="font-semibold mb-2"
                style={{ color: theme.colors.semantic.text.primary }}
              >
                Content Structure
              </h3>
              <ul className="space-y-1" style={{ color: theme.colors.semantic.text.secondary }}>
                <li>• Bullet & Numbered Lists</li>
                <li>• Task Lists with checkboxes</li>
                <li>• Blockquotes</li>
                <li>• Code blocks</li>
                <li>• Horizontal rules</li>
              </ul>
            </div>
            
            <div>
              <h3 
                className="font-semibold mb-2"
                style={{ color: theme.colors.semantic.text.primary }}
              >
                Media & Links
              </h3>
              <ul className="space-y-1" style={{ color: theme.colors.semantic.text.secondary }}>
                <li>• Image upload and insertion</li>
                <li>• Link creation and editing</li>
                <li>• Image resizing and positioning</li>
                <li>• URL validation</li>
              </ul>
            </div>
            
            <div>
              <h3 
                className="font-semibold mb-2"
                style={{ color: theme.colors.semantic.text.primary }}
              >
                Editor Features
              </h3>
              <ul className="space-y-1" style={{ color: theme.colors.semantic.text.secondary }}>
                <li>• Undo/Redo functionality</li>
                <li>• Keyboard shortcuts</li>
                <li>• Color highlighting</li>
                <li>• Typography improvements</li>
                <li>• Theme support</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Integration Options */}
        <div 
          className="rounded-xl p-6 border-2"
          style={{
            backgroundColor: theme.colors.semantic.surface.primary,
            borderColor: theme.colors.semantic.border.secondary + '30'
          }}
        >
          <h2 
            className="text-xl font-bold mb-4"
            style={{ color: theme.colors.semantic.text.primary }}
          >
            🔧 How to Use
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 
                className="font-semibold mb-2"
                style={{ color: theme.colors.semantic.text.primary }}
              >
                Basic Usage
              </h3>
              <div 
                className="p-4 rounded-lg font-mono text-sm"
                style={{ 
                  backgroundColor: theme.colors.semantic.surface.secondary + '30',
                  color: theme.colors.semantic.text.secondary
                }}
              >
                {`import { SimpleEditor } from '@/lib/tiptap-exports';

function MyComponent() {
  return <SimpleEditor />;
}`}
              </div>
            </div>
            
            <div>
              <h3 
                className="font-semibold mb-2"
                style={{ color: theme.colors.semantic.text.primary }}
              >
                Available Components
              </h3>
              <ul className="text-sm space-y-1" style={{ color: theme.colors.semantic.text.secondary }}>
                <li>• SimpleEditor - Complete editor</li>
                <li>• Individual UI components</li>
                <li>• Toolbar components</li>
                <li>• Custom hooks</li>
                <li>• Utility functions</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-center space-x-4">
          <a
            href="/mcq-database-demo"
            className="px-6 py-3 rounded-lg font-semibold text-white transition-all duration-200 hover:scale-105 hover:shadow-lg"
            style={{ backgroundColor: theme.colors.semantic.status.info }}
          >
            🔗 Try MCQ Database Demo
          </a>
          
          <a
            href="/mcq-editor-demo"
            className="px-6 py-3 rounded-lg font-semibold text-white transition-all duration-200 hover:scale-105 hover:shadow-lg"
            style={{ backgroundColor: theme.colors.semantic.status.warning }}
          >
            📝 Try MCQ Editor Demo
          </a>
          
          <a
            href="/simple"
            className="px-6 py-3 rounded-lg font-semibold text-white transition-all duration-200 hover:scale-105 hover:shadow-lg"
            style={{ backgroundColor: theme.colors.semantic.status.success }}
          >
            ✨ Basic Simple Editor
          </a>
        </div>

      </div>
    </div>
  );
}