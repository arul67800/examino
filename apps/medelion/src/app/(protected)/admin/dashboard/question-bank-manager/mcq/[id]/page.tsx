'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useTheme } from '@/theme';
import { PageMCQEditor, MCQData } from '@/components/admin/question-bank-manager/mcq';
import { MCQViewIcons } from '@/components/admin/hierarchy';

interface MCQEditPageParams {
  id: string;
  [key: string]: string | string[] | undefined;
}

export default function MCQEditPage() {
  const { theme } = useTheme();
  const params = useParams<MCQEditPageParams>();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [existingData, setExistingData] = useState<Partial<MCQData>>({});

  // Mock hierarchy context - in real app, this would come from API
  const hierarchyContext = {
    subject: 'Physics',
    chapter: 'Thermodynamics',
    topic: 'Heat Transfer',
    subtopic: 'Conduction'
  };
  
  useEffect(() => {
    // Simulate loading existing MCQ data
    const timer = setTimeout(() => {
      const typeParam = searchParams.get('type') as MCQData['type'];
      const mcqId = params.id;
      
      // Mock existing data based on ID
      let mockData: Partial<MCQData> = {
        type: typeParam || 'singleChoice'
      };
      
      // If editing an existing question (ID doesn't start with temp/demo identifiers)
      if (!mcqId.startsWith('single_') && !mcqId.startsWith('multiple_') && 
          !mcqId.startsWith('tf_') && !mcqId.startsWith('ar_')) {
        mockData = {
          id: mcqId,
          type: typeParam || 'singleChoice',
          question: 'What is the primary mechanism of heat transfer through a solid material?',
          explanation: 'Conduction is the transfer of heat through direct contact between molecules in a material.',
          difficulty: 'medium',
          points: 2,
          timeLimit: 90,
          tags: ['heat transfer', 'conduction', 'physics'],
          options: [
            { id: '1', text: 'Conduction', isCorrect: true },
            { id: '2', text: 'Convection', isCorrect: false },
            { id: '3', text: 'Radiation', isCorrect: false },
            { id: '4', text: 'Evaporation', isCorrect: false }
          ]
        };
      }
      
      setExistingData(mockData);
      setIsLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, [params.id, searchParams]);

  const handleSave = async (mcqData: MCQData) => {
    setIsSaving(true);
    
    try {
      // Simulate API save
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      console.log('Saving MCQ:', mcqData);
      
      // In real app, make API call here
      // await saveMCQ(mcqData);
      
      alert('MCQ saved successfully!');
      
      // Navigate back or to a success page
      router.push('/admin/dashboard/question-bank-manager');
      
    } catch (error) {
      console.error('Error saving MCQ:', error);
      alert('Failed to save MCQ. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <PageMCQEditor
      mcqData={existingData}
      onSave={handleSave}
      onCancel={handleCancel}
      isLoading={isLoading || isSaving}
      hierarchyContext={hierarchyContext}
    />
  );
}