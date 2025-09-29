'use client';

import React, { useState, useCallback } from 'react';
import { useTheme } from '@/theme';

interface ArticleCreatorMinimalProps {
  onSave?: (article: any) => Promise<void>;
  onPublish?: (article: any) => Promise<void>;
  onPreview?: (article: any) => void;
  onClose?: () => void;
}

const ArticleCreatorMinimal: React.FC<ArticleCreatorMinimalProps> = ({
  onSave,
  onPublish,
  onPreview,
  onClose
}) => {
  const { theme } = useTheme();
  
  const [article] = useState({
    id: '',
    title: 'Test Article',
    content: 'Test content'
  });

  const handleSave = useCallback(async () => {
    if (onSave) {
      await onSave(article);
    }
  }, [onSave, article]);

  const handlePublish = useCallback(async () => {
    if (onPublish) {
      await onPublish(article);
    }
  }, [onPublish, article]);

  const handlePreview = useCallback(() => {
    if (onPreview) {
      onPreview(article);
    }
  }, [onPreview, article]);

  return (
    <div style={{ 
      padding: '20px',
      backgroundColor: '#fff',
      color: '#000'
    }}>
      <h1>Minimal Article Creator</h1>
      <p>Title: {article.title}</p>
      <p>Content: {article.content}</p>
      
      <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
        <button onClick={handleSave}>Save</button>
        <button onClick={handlePublish}>Publish</button>
        <button onClick={handlePreview}>Preview</button>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default ArticleCreatorMinimal;