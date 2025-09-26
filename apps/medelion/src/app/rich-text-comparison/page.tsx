'use client';

import React, { useState } from 'react';
import { useTheme } from '@/theme';
import { RichTextEditor } from '@/components/admin/qbm/mcq/rich-text-editor/rich-text-editor';
import { EnhancedRichTextEditor } from '@/components/admin/qbm/mcq/rich-text-editor/enhanced-rich-text-editor';
import { SimpleEditor } from '@/lib/tiptap-exports';

export default function RichTextEditorComparison() {
  const { theme } = useTheme();
  const [content1, setContent1] = useState('');
  const [content2, setContent2] = useState('');
  const [activeEditor, setActiveEditor] = useState<'original' | 'enhanced' | 'simple'>('enhanced');

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
            📝 Rich Text Editor Comparison
          </h1>
          <p 
            className="text-lg"
            style={{ color: theme.colors.semantic.text.secondary }}
          >
            Compare our custom editors with the Tiptap Simple Editor
          </p>
        </div>

        {/* Editor Selection */}
        <div className="flex justify-center space-x-4">
          <button
            onClick={() => setActiveEditor('enhanced')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 hover:scale-105 ${
              activeEditor === 'enhanced' ? 'text-white' : 'text-gray-600 bg-gray-100'
            }`}
            style={{ 
              backgroundColor: activeEditor === 'enhanced' ? theme.colors.semantic.status.success : undefined
            }}
          >
            🚀 Enhanced Editor
          </button>
          
          <button
            onClick={() => setActiveEditor('original')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 hover:scale-105 ${
              activeEditor === 'original' ? 'text-white' : 'text-gray-600 bg-gray-100'
            }`}
            style={{ 
              backgroundColor: activeEditor === 'original' ? theme.colors.semantic.status.info : undefined
            }}
          >
            📋 Original Editor
          </button>
          
          <button
            onClick={() => setActiveEditor('simple')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 hover:scale-105 ${
              activeEditor === 'simple' ? 'text-white' : 'text-gray-600 bg-gray-100'
            }`}
            style={{ 
              backgroundColor: activeEditor === 'simple' ? theme.colors.semantic.status.warning : undefined
            }}
          >
            ✨ Tiptap Simple
          </button>
        </div>

        {/* Editor Display */}
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
              {activeEditor === 'enhanced' && '🚀 Enhanced Rich Text Editor'}
              {activeEditor === 'original' && '📋 Original Rich Text Editor'}
              {activeEditor === 'simple' && '✨ Tiptap Simple Editor'}
            </h2>
            <p 
              className="text-sm"
              style={{ color: theme.colors.semantic.text.secondary }}
            >
              {activeEditor === 'enhanced' && 'Custom editor with Tiptap UI components and advanced features'}
              {activeEditor === 'original' && 'Our original custom-built rich text editor'}
              {activeEditor === 'simple' && 'Professional Tiptap Simple Editor template with full features'}
            </p>
          </div>
          
          <div className="p-6">
            {activeEditor === 'enhanced' && (
              <EnhancedRichTextEditor
                content={content1}
                onChange={setContent1}
                placeholder="Try the enhanced editor with Tiptap UI components..."
                maxLength={2000}
                showWordCount={true}
              />
            )}
            
            {activeEditor === 'original' && (
              <RichTextEditor
                content={content2}
                onChange={setContent2}
                placeholder="Try our original rich text editor..."
              />
            )}
            
            {activeEditor === 'simple' && (
              <SimpleEditor />
            )}
          </div>
        </div>

        {/* Feature Comparison */}
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
            🔍 Feature Comparison
          </h2>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b" style={{ borderColor: theme.colors.semantic.border.secondary + '30' }}>
                  <th className="text-left py-2" style={{ color: theme.colors.semantic.text.primary }}>Feature</th>
                  <th className="text-center py-2" style={{ color: theme.colors.semantic.text.primary }}>Original</th>
                  <th className="text-center py-2" style={{ color: theme.colors.semantic.text.primary }}>Enhanced</th>
                  <th className="text-center py-2" style={{ color: theme.colors.semantic.text.primary }}>Simple</th>
                </tr>
              </thead>
              <tbody className="space-y-2">
                {[
                  { feature: 'Basic Formatting (Bold, Italic, etc.)', original: '✅', enhanced: '✅', simple: '✅' },
                  { feature: 'Headings (H1-H6)', original: '✅', enhanced: '✅', simple: '✅' },
                  { feature: 'Lists (Bullet, Numbered)', original: '✅', enhanced: '✅', simple: '✅' },
                  { feature: 'Task Lists', original: '❌', enhanced: '✅', simple: '✅' },
                  { feature: 'Code Blocks with Syntax Highlighting', original: '✅', enhanced: '✅', simple: '✅' },
                  { feature: 'Tables', original: '✅', enhanced: '❌', simple: '✅' },
                  { feature: 'Links', original: '✅', enhanced: '✅', simple: '✅' },
                  { feature: 'Images', original: '✅', enhanced: '✅', simple: '✅' },
                  { feature: 'Text Alignment', original: '❌', enhanced: '✅', simple: '✅' },
                  { feature: 'Color Highlighting', original: '❌', enhanced: '✅', simple: '✅' },
                  { feature: 'Subscript/Superscript', original: '❌', enhanced: '✅', simple: '✅' },
                  { feature: 'Word Count', original: '✅', enhanced: '✅', simple: '❌' },
                  { feature: 'Character Limit', original: '✅', enhanced: '✅', simple: '❌' },
                  { feature: 'Theme Integration', original: '✅', enhanced: '✅', simple: '❌' },
                  { feature: 'Tiptap UI Components', original: '❌', enhanced: '✅', simple: '✅' },
                ].map((row, index) => (
                  <tr key={index} className="border-b" style={{ borderColor: theme.colors.semantic.border.secondary + '20' }}>
                    <td className="py-2" style={{ color: theme.colors.semantic.text.secondary }}>{row.feature}</td>
                    <td className="text-center py-2">{row.original}</td>
                    <td className="text-center py-2">{row.enhanced}</td>
                    <td className="text-center py-2">{row.simple}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Usage Recommendations */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div 
            className="p-6 rounded-xl border-2"
            style={{
              backgroundColor: theme.colors.semantic.surface.primary,
              borderColor: theme.colors.semantic.border.secondary + '30'
            }}
          >
            <div 
              className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center"
              style={{ backgroundColor: theme.colors.semantic.status.info + '20' }}
            >
              <span className="text-2xl">📋</span>
            </div>
            <h3 
              className="font-semibold mb-2 text-center"
              style={{ color: theme.colors.semantic.text.primary }}
            >
              Original Editor
            </h3>
            <p 
              className="text-sm text-center mb-3"
              style={{ color: theme.colors.semantic.text.secondary }}
            >
              Best for MCQ questions that need tables and custom theme integration
            </p>
            <ul className="text-xs space-y-1" style={{ color: theme.colors.semantic.text.secondary }}>
              <li>• Full theme integration</li>
              <li>• Custom table support</li>
              <li>• Word/character counting</li>
              <li>• MCQ-specific features</li>
            </ul>
          </div>

          <div 
            className="p-6 rounded-xl border-2 ring-2"
            style={{
              backgroundColor: theme.colors.semantic.surface.primary,
              borderColor: theme.colors.semantic.status.success + '50',
              '--tw-ring-color': theme.colors.semantic.status.success + '30'
            } as React.CSSProperties}
          >
            <div 
              className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center"
              style={{ backgroundColor: theme.colors.semantic.status.success + '20' }}
            >
              <span className="text-2xl">🚀</span>
            </div>
            <h3 
              className="font-semibold mb-2 text-center"
              style={{ color: theme.colors.semantic.text.primary }}
            >
              Enhanced Editor
              <span 
                className="ml-2 px-2 py-1 rounded text-xs text-white"
                style={{ backgroundColor: theme.colors.semantic.status.success }}
              >
                RECOMMENDED
              </span>
            </h3>
            <p 
              className="text-sm text-center mb-3"
              style={{ color: theme.colors.semantic.text.secondary }}
            >
              Perfect balance of features and custom integration
            </p>
            <ul className="text-xs space-y-1" style={{ color: theme.colors.semantic.text.secondary }}>
              <li>• Tiptap UI components</li>
              <li>• Advanced formatting</li>
              <li>• Theme-aware design</li>
              <li>• Task lists & highlighting</li>
            </ul>
          </div>

          <div 
            className="p-6 rounded-xl border-2"
            style={{
              backgroundColor: theme.colors.semantic.surface.primary,
              borderColor: theme.colors.semantic.border.secondary + '30'
            }}
          >
            <div 
              className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center"
              style={{ backgroundColor: theme.colors.semantic.status.warning + '20' }}
            >
              <span className="text-2xl">✨</span>
            </div>
            <h3 
              className="font-semibold mb-2 text-center"
              style={{ color: theme.colors.semantic.text.primary }}
            >
              Simple Editor
            </h3>
            <p 
              className="text-sm text-center mb-3"
              style={{ color: theme.colors.semantic.text.secondary }}
            >
              Full-featured professional editor for general use
            </p>
            <ul className="text-xs space-y-1" style={{ color: theme.colors.semantic.text.secondary }}>
              <li>• Complete Tiptap features</li>
              <li>• Professional UI</li>
              <li>• Ready-to-use template</li>
              <li>• Extensive functionality</li>
            </ul>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-center space-x-4">
          <a
            href="/mcq-database-demo"
            className="px-6 py-3 rounded-lg font-semibold text-white transition-all duration-200 hover:scale-105 hover:shadow-lg"
            style={{ backgroundColor: theme.colors.semantic.status.success }}
          >
            🗄️ Test Database Demo
          </a>
          
          <a
            href="/tiptap-simple-demo"
            className="px-6 py-3 rounded-lg font-semibold text-white transition-all duration-200 hover:scale-105 hover:shadow-lg"
            style={{ backgroundColor: theme.colors.semantic.status.warning }}
          >
            ✨ Tiptap Simple Demo
          </a>
        </div>

      </div>
    </div>
  );
}