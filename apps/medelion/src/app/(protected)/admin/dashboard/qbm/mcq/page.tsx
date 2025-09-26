'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/theme';
import { PageMCQEditor, MCQData } from '@/components/admin/qbm/mcq';

export default function MCQEditorPage() {
  const { theme } = useTheme();
  const router = useRouter();
  
  const [isSaving, setIsSaving] = useState(false);

  // Mock hierarchy context - in real app, this would come from API or context
  const hierarchyContext = {
    subject: 'Physics',
    chapter: 'Thermodynamics',
    topic: 'Heat Transfer',
    subtopic: 'Conduction'
  };

  const handleSave = async (mcqData: MCQData) => {
    setIsSaving(true);
    
    try {
      // Simulate API save
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      console.log('Saving MCQ:', mcqData);
      
      // In real app, make API call here
      // await saveMCQ(mcqData);
      
      alert('MCQ saved successfully!');
      
      // Optionally navigate to another page or show success state
      // router.push('/admin/dashboard/qbm');
      
    } catch (error) {
      console.error('Error saving MCQ:', error);
      alert('Failed to save MCQ. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    // Navigate back to QBM dashboard or previous page
    router.push('/admin/dashboard/qbm');
  };

  return (
    <PageMCQEditor
      onSave={handleSave}
      onCancel={handleCancel}
      isLoading={isSaving}
      hierarchyContext={hierarchyContext}
    />
  );
}