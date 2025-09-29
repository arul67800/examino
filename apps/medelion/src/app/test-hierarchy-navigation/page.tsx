'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/theme';

export default function TestHierarchyNavigation() {
  const router = useRouter();
  const { theme } = useTheme();

  const testNavigateToMCQ = () => {
    // Simulate clicking an MCQ button from hierarchy with proper hierarchy chain
    const hierarchyChain = [
      { id: 'first-year', name: 'First Year', level: 1, type: 'Year' },
      { id: 'anatomy', name: 'Anatomy', level: 2, type: 'Subject' },
      { id: 'head-neck', name: 'Head & Neck', level: 3, type: 'Part' },
      { id: 'shoulder-region', name: 'Shoulder Region', level: 4, type: 'Section' }
    ];

    const params = new URLSearchParams({
      mode: 'new',
      hierarchyItemId: 'shoulder-region',
      hierarchyLevel: '4',
      hierarchyName: 'Shoulder Region',
      hierarchyType: 'Section',
      hierarchyChain: JSON.stringify(hierarchyChain)
    });

    const url = `/admin/dashboard/question-bank-manager/mcq?${params.toString()}`;
    console.log('Navigating to MCQ editor with hierarchy:', url);
    
    router.push(url);
  };

  const testNavigateToChapterMCQ = () => {
    // Test with chapter level
    const hierarchyChain = [
      { id: 'first-year', name: 'First Year', level: 1, type: 'Year' },
      { id: 'anatomy', name: 'Anatomy', level: 2, type: 'Subject' },
      { id: 'head-neck', name: 'Head & Neck', level: 3, type: 'Part' },
      { id: 'cranial-nerves', name: 'Cranial Nerves', level: 4, type: 'Section' },
      { id: 'trigeminal', name: 'Trigeminal Nerve', level: 5, type: 'Chapter' }
    ];

    const params = new URLSearchParams({
      mode: 'new',
      hierarchyItemId: 'trigeminal',
      hierarchyLevel: '5',
      hierarchyName: 'Trigeminal Nerve',
      hierarchyType: 'Chapter',
      hierarchyChain: JSON.stringify(hierarchyChain)
    });

    const url = `/admin/dashboard/question-bank-manager/mcq?${params.toString()}`;
    console.log('Navigating to MCQ editor with chapter hierarchy:', url);
    
    router.push(url);
  };

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: theme.colors.semantic.background.secondary }}>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4" style={{ color: theme.colors.semantic.text.primary }}>
            Test Hierarchy Navigation
          </h1>
          <p className="text-lg" style={{ color: theme.colors.semantic.text.secondary }}>
            Test the MCQ hierarchy integration by simulating navigation from hierarchy
          </p>
        </div>

        <div className="space-y-4">
          <div 
            className="p-4 rounded-lg border"
            style={{ 
              backgroundColor: theme.colors.semantic.surface.primary,
              borderColor: theme.colors.semantic.border.secondary
            }}
          >
            <h3 className="font-semibold mb-2" style={{ color: theme.colors.semantic.text.primary }}>
              Test Case 1: Section Level MCQ
            </h3>
            <p className="text-sm mb-3" style={{ color: theme.colors.semantic.text.secondary }}>
              Navigate to MCQ editor from Section level (Shoulder Region)
            </p>
            <button
              onClick={testNavigateToMCQ}
              className="px-4 py-2 rounded-lg text-white font-medium hover:opacity-90 transition-opacity"
              style={{ backgroundColor: '#3B82F6' }}
            >
              Test Section → MCQ Navigation
            </button>
          </div>

          <div 
            className="p-4 rounded-lg border"
            style={{ 
              backgroundColor: theme.colors.semantic.surface.primary,
              borderColor: theme.colors.semantic.border.secondary
            }}
          >
            <h3 className="font-semibold mb-2" style={{ color: theme.colors.semantic.text.primary }}>
              Test Case 2: Chapter Level MCQ
            </h3>
            <p className="text-sm mb-3" style={{ color: theme.colors.semantic.text.secondary }}>
              Navigate to MCQ editor from Chapter level (Trigeminal Nerve)
            </p>
            <button
              onClick={testNavigateToChapterMCQ}
              className="px-4 py-2 rounded-lg text-white font-medium hover:opacity-90 transition-opacity"
              style={{ backgroundColor: '#3B82F6' }}
            >
              Test Chapter → MCQ Navigation
            </button>
          </div>
        </div>

        <div 
          className="p-4 rounded-lg border-2 border-dashed"
          style={{ 
            backgroundColor: theme.colors.semantic.status.info + '10',
            borderColor: theme.colors.semantic.status.info + '40'
          }}
        >
          <h4 className="font-medium mb-2" style={{ color: theme.colors.semantic.text.primary }}>
            Expected Results:
          </h4>
          <ul className="text-sm space-y-1" style={{ color: theme.colors.semantic.text.secondary }}>
            <li>• MCQ editor page should load with hierarchy breadcrumb populated</li>
            <li>• Breadcrumb should show the complete hierarchy path</li>
            <li>• URL should contain the hierarchy parameters</li>
            <li>• Console should show hierarchy context loading messages</li>
          </ul>
        </div>
      </div>
    </div>
  );
}