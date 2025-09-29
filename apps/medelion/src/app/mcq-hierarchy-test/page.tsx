'use client';

import { useState } from 'react';
import { MCQHierarchyBreadcrumb, HierarchyPath, PageMCQEditor, InlineMCQEditor, ModalMCQEditor } from '@/components/admin/question-bank-manager/mcq';
import { useTheme } from '@/theme';

export default function MCQHierarchyTestPage() {
  const { theme } = useTheme();
  const [selectedPath, setSelectedPath] = useState<HierarchyPath>({});
  const [showModalEditor, setShowModalEditor] = useState(false);

  const mockMCQData = {
    type: 'singleChoice' as const,
    question: 'Which of the following is a branch of the maxillary nerve?',
    explanation: 'The infraorbital nerve is a terminal branch of the maxillary nerve.',
    difficulty: 'medium' as const,
    points: 2,
    options: [
      { id: '1', text: 'Infraorbital nerve', isCorrect: true },
      { id: '2', text: 'Mental nerve', isCorrect: false },
      { id: '3', text: 'Lingual nerve', isCorrect: false },
      { id: '4', text: 'Inferior alveolar nerve', isCorrect: false }
    ]
  };

  const handleMCQSave = (data: any) => {
    console.log('MCQ saved:', data);
    console.log('With hierarchy path:', selectedPath);
  };

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: theme.colors.semantic.background.secondary }}>
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4" style={{ color: theme.colors.semantic.text.primary }}>
            MCQ Hierarchy Component Test
          </h1>
          <p className="text-lg" style={{ color: theme.colors.semantic.text.secondary }}>
            Testing the hierarchy breadcrumb component with all MCQ editor types
          </p>
        </div>

        {/* Standalone Hierarchy Breadcrumb */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold" style={{ color: theme.colors.semantic.text.primary }}>
            Standalone Hierarchy Selector
          </h2>
          <MCQHierarchyBreadcrumb
            hierarchyPath={selectedPath}
            onHierarchyChange={setSelectedPath}
            showEditButton={true}
          />
          
          {/* Display selected path info */}
          <div 
            className="p-4 rounded-lg"
            style={{ 
              backgroundColor: theme.colors.semantic.surface.primary,
              border: `1px solid ${theme.colors.semantic.border.secondary}40`
            }}
          >
            <h3 className="font-medium mb-2" style={{ color: theme.colors.semantic.text.primary }}>
              Selected Hierarchy Path:
            </h3>
            <pre 
              className="text-sm overflow-x-auto"
              style={{ color: theme.colors.semantic.text.secondary }}
            >
              {JSON.stringify(selectedPath, null, 2)}
            </pre>
          </div>
        </div>

        {/* Page MCQ Editor */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold" style={{ color: theme.colors.semantic.text.primary }}>
            Page MCQ Editor with Hierarchy
          </h2>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-1">
            <PageMCQEditor
              mcqData={mockMCQData}
              onSave={handleMCQSave}
              hierarchyContext={{
                subject: 'Anatomy',
                chapter: 'Head & Neck',
                topic: 'Cranial Nerves',
                subtopic: 'Maxillary Nerve'
              }}
            />
          </div>
        </div>

        {/* Inline MCQ Editor */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold" style={{ color: theme.colors.semantic.text.primary }}>
            Inline MCQ Editor with Hierarchy
          </h2>
          <InlineMCQEditor
            mcqData={mockMCQData}
            onSave={handleMCQSave}
            showExpandButton={true}
            hierarchyContext={{
              topic: 'Cranial Nerves',
              subtopic: 'Maxillary Nerve'
            }}
          />
        </div>

        {/* Modal MCQ Editor */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold" style={{ color: theme.colors.semantic.text.primary }}>
            Modal MCQ Editor with Hierarchy
          </h2>
          <button
            onClick={() => setShowModalEditor(true)}
            className="px-6 py-3 rounded-lg font-medium text-white"
            style={{ backgroundColor: theme.colors.semantic.action.primary }}
          >
            Open Modal MCQ Editor
          </button>

          <ModalMCQEditor
            isOpen={showModalEditor}
            onClose={() => setShowModalEditor(false)}
            mcqData={mockMCQData}
            onSave={handleMCQSave}
            title="Edit Maxillary Nerve MCQ"
            hierarchyContext={{
              subject: 'Anatomy',
              chapter: 'Head & Neck',
              topic: 'Cranial Nerves',
              subtopic: 'Maxillary Nerve'
            }}
          />
        </div>

        {/* Compact Hierarchy Tests */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold" style={{ color: theme.colors.semantic.text.primary }}>
            Compact Hierarchy Display
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium mb-2" style={{ color: theme.colors.semantic.text.primary }}>
                Normal Size
              </h3>
              <MCQHierarchyBreadcrumb
                hierarchyPath={{
                  year: {
                    id: 'first-year',
                    name: 'First Year',
                    level: 1,
                    type: 'Year',
                    color: '#8B5CF6',
                    order: 1,
                    questionCount: 0,
                    parentId: null,
                    children: [],
                    createdAt: '2024-01-01T00:00:00Z',
                    updatedAt: '2024-01-01T00:00:00Z'
                  },
                  subject: {
                    id: 'anatomy',
                    name: 'Anatomy',
                    level: 2,
                    type: 'Subject',
                    color: '#7C3AED',
                    order: 1,
                    questionCount: 0,
                    parentId: 'first-year',
                    children: [],
                    createdAt: '2024-01-01T00:00:00Z',
                    updatedAt: '2024-01-01T00:00:00Z'
                  },
                  chapter: {
                    id: 'maxillary-nerve',
                    name: 'Maxillary Nerve',
                    level: 5,
                    type: 'Chapter',
                    color: '#047857',
                    order: 2,
                    questionCount: 14,
                    parentId: 'cranial-nerves',
                    children: [],
                    createdAt: '2024-01-01T00:00:00Z',
                    updatedAt: '2024-01-01T00:00:00Z'
                  }
                }}
                onHierarchyChange={() => {}}
                showEditButton={false}
                compact={false}
              />
            </div>
            <div>
              <h3 className="font-medium mb-2" style={{ color: theme.colors.semantic.text.primary }}>
                Compact Size
              </h3>
              <MCQHierarchyBreadcrumb
                hierarchyPath={{
                  year: {
                    id: 'first-year',
                    name: 'First Year',
                    level: 1,
                    type: 'Year',
                    color: '#8B5CF6',
                    order: 1,
                    questionCount: 0,
                    parentId: null,
                    children: [],
                    createdAt: '2024-01-01T00:00:00Z',
                    updatedAt: '2024-01-01T00:00:00Z'
                  },
                  subject: {
                    id: 'anatomy',
                    name: 'Anatomy',
                    level: 2,
                    type: 'Subject',
                    color: '#7C3AED',
                    order: 1,
                    questionCount: 0,
                    parentId: 'first-year',
                    children: [],
                    createdAt: '2024-01-01T00:00:00Z',
                    updatedAt: '2024-01-01T00:00:00Z'
                  },
                  chapter: {
                    id: 'maxillary-nerve',
                    name: 'Maxillary Nerve',
                    level: 5,
                    type: 'Chapter',
                    color: '#047857',
                    order: 2,
                    questionCount: 14,
                    parentId: 'cranial-nerves',
                    children: [],
                    createdAt: '2024-01-01T00:00:00Z',
                    updatedAt: '2024-01-01T00:00:00Z'
                  }
                }}
                onHierarchyChange={() => {}}
                showEditButton={false}
                compact={true}
              />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}