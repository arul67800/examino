'use client';

import React, { useState } from 'react';
import { Editor } from '@tiptap/react';
import { ChevronDown, Heading1, Heading2, Heading3, Type } from 'lucide-react';
import { useTheme } from '../../../../../../theme/context';
import { FormatButton } from './format-button';

interface HeadingSelectorProps {
  editor: Editor;
}

export const HeadingSelector: React.FC<HeadingSelectorProps> = ({ editor }) => {
  const { theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const headingOptions = [
    { level: 0, label: 'Normal', icon: <Type size={14} />, command: () => editor.chain().focus().setParagraph().run() },
    { level: 1, label: 'Heading 1', icon: <Heading1 size={14} />, command: () => editor.chain().focus().toggleHeading({ level: 1 }).run() },
    { level: 2, label: 'Heading 2', icon: <Heading2 size={14} />, command: () => editor.chain().focus().toggleHeading({ level: 2 }).run() },
    { level: 3, label: 'Heading 3', icon: <Heading3 size={14} />, command: () => editor.chain().focus().toggleHeading({ level: 3 }).run() },
  ];

  const currentHeading = headingOptions.find(option => 
    option.level === 0 ? !editor.isActive('heading') : editor.isActive('heading', { level: option.level })
  ) || headingOptions[0];

  return (
    <div className="relative">
      <FormatButton
        onClick={() => setIsOpen(!isOpen)}
        title="Text Style"
        className="flex items-center gap-1"
      >
        {currentHeading.icon}
        <ChevronDown size={12} />
      </FormatButton>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div 
            className="absolute top-full left-0 mt-1 min-w-[120px] rounded-md shadow-lg border z-20"
            style={{
              backgroundColor: theme.colors.semantic.surface.elevated,
              borderColor: theme.colors.semantic.border.secondary,
            }}
          >
            {headingOptions.map((option) => (
              <button
                key={option.level}
                onClick={() => {
                  option.command();
                  setIsOpen(false);
                }}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-opacity-50 first:rounded-t-md last:rounded-b-md"
                style={{
                  color: theme.colors.semantic.text.primary,
                  backgroundColor: option === currentHeading ? theme.colors.semantic.action.hover : 'transparent',
                }}
                onMouseEnter={(e) => {
                  if (option !== currentHeading) {
                    e.currentTarget.style.backgroundColor = theme.colors.semantic.action.hover;
                  }
                }}
                onMouseLeave={(e) => {
                  if (option !== currentHeading) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                {option.icon}
                <span>{option.label}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};