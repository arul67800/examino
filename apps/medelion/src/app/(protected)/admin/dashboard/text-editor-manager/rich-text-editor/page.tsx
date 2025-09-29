'use client';

import React, { useState } from 'react';
import { WordLikeLayout } from '@/components/admin/text-editor-manager/rich-text-editor/ui';

export default function AdvancedTextEditorPage() {
  const [documentTitle, setDocumentTitle] = useState('Advanced Rich Text Document');
  const [content, setContent] = useState(`<h1>Welcome to the Advanced Rich Text Editor</h1>

<p>This is a powerful, feature-rich text editor designed with a Microsoft Word-like interface for creating sophisticated educational content, articles, and documentation.</p>

<h2>🚀 Advanced Features</h2>

<ul>
<li><strong>Ribbon Interface</strong>: Familiar tabbed toolbar with Home, Insert, Design, Layout, and Review tabs</li>
<li><strong>Advanced Typography</strong>: Comprehensive font controls and formatting options</li>
<li><strong>Smart Formatting</strong>: Professional-grade text formatting with live preview</li>
<li><strong>Interactive Tables</strong>: Advanced table creation and editing capabilities</li>
<li><strong>Media Integration</strong>: Seamless image, video, and media handling</li>
</ul>

<p>Experience professional document editing with our Microsoft Word-inspired interface! 🎉</p>`);

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
  };

  const handleTitleChange = (newTitle: string) => {
    setDocumentTitle(newTitle);
  };

  return (
    <div className="h-full">
      <WordLikeLayout
        initialContent={content}
        onContentChange={handleContentChange}
        documentTitle={documentTitle}
        onDocumentTitleChange={handleTitleChange}
      />
    </div>
  );
}