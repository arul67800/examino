'use client';

import React, { useState } from 'react';
import { useTheme } from '@/theme';

interface AnswerOptionReferencesProps {
  optionId: string;
  references?: string;
  onReferencesChange: (optionId: string, references: string) => void;
}

export default function AnswerOptionReferences({
  optionId,
  references = '',
  onReferencesChange
}: AnswerOptionReferencesProps) {
  const { theme } = useTheme();
  const [localReferences, setLocalReferences] = useState(references);

  const handleReferencesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newReferences = e.target.value;
    setLocalReferences(newReferences);
    onReferencesChange(optionId, newReferences);
  };

  const handleFormatting = (format: 'bold' | 'italic' | 'link') => {
    const textarea = document.querySelector(`#references-${optionId}`) as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = localReferences.substring(start, end);
    let formattedText = '';

    switch (format) {
      case 'bold':
        formattedText = `**${selectedText}**`;
        break;
      case 'italic':
        formattedText = `*${selectedText}*`;
        break;
      case 'link':
        formattedText = `[${selectedText || 'Link text'}](https://example.com)`;
        break;
    }

    const newText = localReferences.substring(0, start) + formattedText + localReferences.substring(end);
    setLocalReferences(newText);
    onReferencesChange(optionId, newText);

    // Reset cursor position
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + formattedText.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  return (
    <div className="mt-3">
      <div className="flex items-center justify-between mb-2">
        <label 
          className="text-sm font-medium"
          style={{ color: theme.colors.semantic.text.primary }}
        >
          References (Optional)
        </label>
        
        {/* Formatting Toolbar */}
        <div className="flex space-x-1">
          <button
            type="button"
            onClick={() => handleFormatting('bold')}
            className="px-2 py-1 text-xs rounded transition-all hover:bg-opacity-80"
            style={{
              backgroundColor: theme.colors.semantic.border.secondary + '20',
              color: theme.colors.semantic.text.secondary
            }}
            title="Bold"
          >
            <strong>B</strong>
          </button>
          <button
            type="button"
            onClick={() => handleFormatting('italic')}
            className="px-2 py-1 text-xs rounded transition-all hover:bg-opacity-80"
            style={{
              backgroundColor: theme.colors.semantic.border.secondary + '20',
              color: theme.colors.semantic.text.secondary
            }}
            title="Italic"
          >
            <em>I</em>
          </button>
          <button
            type="button"
            onClick={() => handleFormatting('link')}
            className="px-2 py-1 text-xs rounded transition-all hover:bg-opacity-80"
            style={{
              backgroundColor: theme.colors.semantic.border.secondary + '20',
              color: theme.colors.semantic.text.secondary
            }}
            title="Insert Link"
          >
            🔗
          </button>
        </div>
      </div>
      
      <textarea
        id={`references-${optionId}`}
        value={localReferences}
        onChange={handleReferencesChange}
        placeholder="Add references, citations, or sources (supports basic Markdown formatting)..."
        className="w-full p-2 text-sm rounded border resize-none focus:ring-2 focus:ring-offset-1 transition-all"
        rows={4}
        style={{
          backgroundColor: theme.colors.semantic.surface.primary,
          border: `1px solid ${theme.colors.semantic.border.secondary}`,
          color: theme.colors.semantic.text.primary
        }}
      />
      
      <div className="mt-2 text-xs" style={{ color: theme.colors.semantic.text.secondary }}>
        Add references, citations, or sources to support this answer option. You can use basic Markdown formatting.
      </div>
    </div>
  );
}