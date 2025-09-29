'use client';

import React, { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import ArticleCreator from '@/components/admin/article-manager/create/ArticleCreatorAdvanced';

export default function CreateArticlePage() {
  const router = useRouter();

  const handleSave = useCallback(async (article: any) => {
    try {
      console.log('Saving article:', article);
      // Here you would typically make an API call to save the article
      // For now, we'll just log it
    } catch (error) {
      console.error('Failed to save article:', error);
      throw error;
    }
  }, []);

  const handlePublish = useCallback(async (article: any) => {
    try {
      console.log('Publishing article:', article);
      // Here you would typically make an API call to publish the article
      // For now, we'll just redirect back to the overview
      router.push('/admin/dashboard/abm');
    } catch (error) {
      console.error('Failed to publish article:', error);
      throw error;
    }
  }, [router]);

  const handlePreview = useCallback((article: any) => {
    console.log('Previewing article:', article);
    // You could open a preview in a new window/tab
    // window.open(`/preview/${article.id}`, '_blank');
  }, []);

  const handleClose = useCallback(() => {
    router.push('/admin/dashboard/abm');
  }, [router]);

  return (
    <ArticleCreator
      onSave={handleSave}
      onPublish={handlePublish}
      onPreview={handlePreview}
      onClose={handleClose}
    />
  );
}