'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/theme';
import { PageMCQEditor, MCQData } from '@/components/admin/question-bank-manager/mcq';
import { HierarchyPath } from '@/components/admin/question-bank-manager/mcq/breadcrumb/mcq-hierarchy-breadcrumb';
import { ROUTES } from '@/routes/routes';
import { useMCQHierarchy } from '@/components/admin/question-bank-manager/mcq/hooks/useMCQHierarchy';
import { handleMCQSave } from '@/components/admin/question-bank-manager/mcq/utils/hierarchy-navigation';
import { MCQSuccessModal, useMCQSuccessModal } from '@/components/admin/question-bank-manager/mcq/components';

export default function MCQEditorPage() {
  const { theme } = useTheme();
  const router = useRouter();
  const { 
    hierarchyContext, 
    isLoading, 
    isRebuildingChain, 
    hasValidHierarchy, 
    updateHierarchy,
    setHierarchy 
  } = useMCQHierarchy();
  
  const [isSaving, setIsSaving] = useState(false);
  
  // Success Modal
  const { isOpen: isSuccessModalOpen, modalData: successModalData, showSuccess: showSuccessModal, close: closeSuccessModal } = useMCQSuccessModal();

  // Debug log the hierarchy context
  console.log('MCQEditorPage - hierarchyContext:', hierarchyContext);
  console.log('MCQEditorPage - hasValidHierarchy:', hasValidHierarchy);
  console.log('MCQEditorPage - isLoading:', isLoading);
  console.log('MCQEditorPage - isRebuildingChain:', isRebuildingChain);

  const handleSave = async (mcqData: MCQData) => {
    setIsSaving(true);
    
    const success = await handleMCQSave(
      mcqData, 
      hierarchyContext,
      isLoading, // Pass loading state to prevent validation during hierarchy rebuild
      () => {
        // Success callback - show modal and then navigate
        showSuccessModal({
          title: 'MCQ Created Successfully',
          message: `Your MCQ has been created successfully and submitted for review. It will be published once approved.`,
          debugInfo: {
            questionType: mcqData.type,
            questionLength: mcqData.question?.length,
            optionsCount: mcqData.options?.length,
            difficulty: mcqData.difficulty,
            points: mcqData.points,
            timeLimit: mcqData.timeLimit,
            tags: mcqData.tags,
            hierarchyItemId: hierarchyContext?.hierarchyItemId,
            conversionSteps: [
              'MCQ data validated successfully',
              'Converted to database format',
              'Submitted to API endpoint',
              'Question created and queued for review'
            ],
            validationResults: [
              'Question content validation passed',
              'Options validation passed',
              'Hierarchy context validation passed',
              'User permissions verified'
            ]
          }
        });
        // Navigate after a short delay to let user see the modal
        setTimeout(() => {
          router.push(ROUTES.ADMIN.QBM.APPROVAL.PENDING);
        }, 2000);
      },
      (error) => {
        // Error callback - already handled in utility
        console.error('Save error:', error);
      }
    );

    setIsSaving(false);
  };

  const handleCancel = () => {
    // Navigate back to QBM dashboard or previous page
    router.push('/admin/dashboard/question-bank-manager');
  };

  // Handle hierarchy changes from breadcrumb selection
  const handleHierarchyChange = (hierarchyPath: HierarchyPath) => {
    console.log('MCQEditorPage - hierarchy changed from breadcrumb:', hierarchyPath);
    
    // Convert HierarchyPath to MCQHierarchyContext format
    // Find the lowest level selected item to use as the target hierarchy item
    const selectedItem = hierarchyPath.mcq || hierarchyPath.chapter || hierarchyPath.section || hierarchyPath.part || hierarchyPath.subject || hierarchyPath.year;
    
    if (selectedItem && hierarchyPath.hierarchyType) {
      // Build hierarchy chain from the path
      const chain: any[] = [];
      if (hierarchyPath.year) chain.push(hierarchyPath.year);
      if (hierarchyPath.subject) chain.push(hierarchyPath.subject);
      if (hierarchyPath.part) chain.push(hierarchyPath.part);
      if (hierarchyPath.section) chain.push(hierarchyPath.section);
      if (hierarchyPath.chapter) chain.push(hierarchyPath.chapter);
      if (hierarchyPath.mcq) chain.push(hierarchyPath.mcq);

      // Use the hierarchy type from the breadcrumb path, not the selected item's type
      // selectedItem.type contains the specific type like 'Exam', 'Year', etc.
      // hierarchyPath.hierarchyType contains 'question-bank' or 'previous-papers'
      const newHierarchyContext = {
        hierarchyItemId: selectedItem.id,
        hierarchyLevel: selectedItem.level,
        hierarchyName: selectedItem.name,
        hierarchyType: hierarchyPath.hierarchyType, // Use the hierarchy mode instead of item type
        hierarchyChain: chain,
        mode: 'new' as const,
        mcqId: undefined
      };

      console.log('MCQEditorPage - updating hierarchy context:', {
        selectedItem: { id: selectedItem.id, name: selectedItem.name, type: selectedItem.type, level: selectedItem.level },
        hierarchyPathType: hierarchyPath.hierarchyType,
        newContext: newHierarchyContext
      });
      setHierarchy(newHierarchyContext);
    }
  };

  // Show loading state while hierarchy is being processed
  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">
              {isRebuildingChain ? 'Loading hierarchy data...' : 'Loading MCQ Editor...'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // For direct access without hierarchy context, show MCQ editor with empty hierarchy
  // Users can select hierarchy within the editor

  return (
    <>
      <PageMCQEditor
        onSave={handleSave}
        onCancel={handleCancel}
        isLoading={isSaving}
        hierarchyContext={hierarchyContext}
        onHierarchyChange={handleHierarchyChange}
        mcqData={hierarchyContext?.mode === 'edit' ? undefined : undefined} // TODO: Load existing MCQ data for edit mode
      />
      
      {/* Success Modal */}
      <MCQSuccessModal
        isOpen={isSuccessModalOpen}
        onClose={closeSuccessModal}
        title={successModalData?.title}
        message={successModalData?.message || ''}
        questionId={successModalData?.questionId}
        humanId={successModalData?.humanId}
        debugInfo={successModalData?.debugInfo}
        showDebugDetails={true}
      />
    </>
  );
}