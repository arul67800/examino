'use client';

import React, { useState, useEffect } from 'react';
import { Editor } from '@tiptap/react';
import { Link2, ExternalLink, Unlink } from 'lucide-react';
import { useTheme } from '../../../../../../theme/context';

interface LinkDialogProps {
  editor: Editor;
  isOpen: boolean;
  onClose: () => void;
}

export const LinkDialog: React.FC<LinkDialogProps> = ({ editor, isOpen, onClose }) => {
  const { theme } = useTheme();
  const [url, setUrl] = useState('');
  const [text, setText] = useState('');
  const [openInNewTab, setOpenInNewTab] = useState(true);

  useEffect(() => {
    if (isOpen) {
      const { from, to } = editor.state.selection;
      const selectedText = editor.state.doc.textBetween(from, to);
      
      if (selectedText) {
        setText(selectedText);
      }

      // If cursor is on a link, populate the URL
      const linkMark = editor.getAttributes('link');
      if (linkMark.href) {
        setUrl(linkMark.href);
        setOpenInNewTab(linkMark.target === '_blank');
      } else {
        setUrl('');
        setOpenInNewTab(true);
      }
    }
  }, [isOpen, editor]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url) return;

    const linkAttributes = {
      href: url,
      target: openInNewTab ? '_blank' : '_self',
      rel: openInNewTab ? 'noopener noreferrer' : null,
    };

    if (text && !editor.state.selection.empty) {
      // Replace selected text with link
      editor.chain().focus()
        .extendMarkRange('link')
        .setLink(linkAttributes)
        .run();
    } else if (text) {
      // Insert new text with link
      editor.chain().focus()
        .insertContent(`<a href="${url}" target="${linkAttributes.target}" ${linkAttributes.rel ? `rel="${linkAttributes.rel}"` : ''}>${text}</a>`)
        .run();
    } else {
      // Just apply link to selection
      editor.chain().focus()
        .extendMarkRange('link')
        .setLink(linkAttributes)
        .run();
    }

    onClose();
  };

  const handleRemoveLink = () => {
    editor.chain().focus().unsetLink().run();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div 
        className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 rounded-lg shadow-xl border z-50"
        style={{
          backgroundColor: theme.colors.semantic.surface.elevated,
          borderColor: theme.colors.semantic.border.secondary,
        }}
      >
        <div className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Link2 size={20} style={{ color: theme.colors.semantic.text.primary }} />
            <h3 
              className="text-lg font-semibold"
              style={{ color: theme.colors.semantic.text.primary }}
            >
              {editor.isActive('link') ? 'Edit Link' : 'Insert Link'}
            </h3>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label 
                className="block text-sm font-medium mb-1"
                style={{ color: theme.colors.semantic.text.primary }}
              >
                URL
              </label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com"
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2"
                style={{
                  backgroundColor: theme.colors.semantic.surface.primary,
                  borderColor: theme.colors.semantic.border.secondary,
                  color: theme.colors.semantic.text.primary,
                }}
                required
                autoFocus
              />
            </div>

            <div>
              <label 
                className="block text-sm font-medium mb-1"
                style={{ color: theme.colors.semantic.text.primary }}
              >
                Link Text (optional)
              </label>
              <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Link text"
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2"
                style={{
                  backgroundColor: theme.colors.semantic.surface.primary,
                  borderColor: theme.colors.semantic.border.secondary,
                  color: theme.colors.semantic.text.primary,
                }}
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="newTab"
                checked={openInNewTab}
                onChange={(e) => setOpenInNewTab(e.target.checked)}
                className="rounded focus:ring-2"
                style={{
                  accentColor: theme.colors.semantic.action.primary,
                }}
              />
              <label 
                htmlFor="newTab"
                className="text-sm cursor-pointer"
                style={{ color: theme.colors.semantic.text.primary }}
              >
                <ExternalLink size={14} className="inline mr-1" />
                Open in new tab
              </label>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="submit"
                className="flex-1 px-4 py-2 rounded-md transition-colors"
                style={{
                  backgroundColor: theme.colors.semantic.action.primary,
                  color: theme.colors.semantic.text.inverse,
                }}
              >
                {editor.isActive('link') ? 'Update Link' : 'Insert Link'}
              </button>
              
              {editor.isActive('link') && (
                <button
                  type="button"
                  onClick={handleRemoveLink}
                  className="px-4 py-2 rounded-md transition-colors border"
                  style={{
                    borderColor: theme.colors.semantic.border.secondary,
                    color: theme.colors.semantic.status.error,
                  }}
                >
                  <Unlink size={16} />
                </button>
              )}
              
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-md transition-colors border"
                style={{
                  borderColor: theme.colors.semantic.border.secondary,
                  color: theme.colors.semantic.text.secondary,
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};