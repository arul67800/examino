'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@apollo/client/react';
import { GET_HIERARCHY_ITEM, GET_HIERARCHY_ITEMS } from '@/lib/graphql/hierarchy.graphql';
import { useTheme } from '@/theme';
import { CalendarIcon, AcademicCapIcon, BookOpenIcon, DocumentTextIcon } from '@/components/dashboard/sidebar/sidebar-icons';
import { useToast } from '@/components/ui/toast';
import QbSubjectNavigator from '@/components/question-bank/qb-subject-navigator';
import QbMcqRenderer from '@/components/question-bank/qb-mcq-renderer';
import { logApiHealth } from '@/utils/api-health-check';
import ApiDiagnostics from '@/components/debug/api-diagnostics';

// Simple Arrow Left Icon component
const ArrowLeftIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
  </svg>
);

interface HierarchyItem {
  id: string;
  name: string;
  level: number;
  type: string;
  questionCount: number;
  isPublished?: boolean;
  parent?: HierarchyItem;
  children?: HierarchyItem[];
}

export default function SubjectPage() {
  const { yearId, subjectId } = useParams();
  const router = useRouter();
  const { theme } = useTheme();
  const { showToast } = useToast();

  // Debug logging for parameters
  useEffect(() => {
    console.log('Page params:', { yearId, subjectId });
    // Check API health on component mount
    logApiHealth();
  }, [yearId, subjectId]);

  // Fetch the specific subject
  const { data, loading, error } = useQuery(GET_HIERARCHY_ITEM, {
    variables: { id: subjectId },
    skip: !subjectId
  });

  // Fetch all hierarchy items for navigation
  const { data: hierarchyData, loading: hierarchyLoading, error: hierarchyError } = useQuery(GET_HIERARCHY_ITEMS);

  const subject: HierarchyItem | null = (data as any)?.hierarchyItem || null;
  const allHierarchyItems: HierarchyItem[] = (hierarchyData as any)?.hierarchyItems || [];

  // Debug logging
  useEffect(() => {
    console.log('=== Subject Page Debug ===');
    console.log('Query states:', {
      loading,
      hierarchyLoading,
      error: error?.message,
      hierarchyError: hierarchyError?.message,
      hasSubjectData: !!data,
      hasHierarchyData: !!hierarchyData,
      subjectDataKeys: data ? Object.keys(data) : [],
      hierarchyItemsCount: allHierarchyItems.length
    });
    
    if (data) {
      console.log('Subject data fetched:', data);
      console.log('Subject object:', subject);
      console.log('Subject children:', subject?.children);
    }
    
    if (hierarchyData) {
      console.log('Hierarchy data fetched:', hierarchyData);
      console.log('All hierarchy items count:', allHierarchyItems.length);
      console.log('Hierarchy items structure:', allHierarchyItems);
    }
    console.log('========================');
  }, [data, subject, hierarchyData, allHierarchyItems, loading, hierarchyLoading, error, hierarchyError]);

  useEffect(() => {
    if (error || hierarchyError) {
      showToast('Error loading subject data', 'error');
      console.error('Subject page error:', error || hierarchyError);
    }
  }, [error, hierarchyError, showToast]);

  if (loading || hierarchyLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-96">
          <div
            className="animate-spin rounded-full h-12 w-12 border-b-2"
            style={{ borderColor: theme.colors.semantic.action.primary }}
          />
        </div>
      </div>
    );
  }

  if (error || hierarchyError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error Loading Subject</h1>
          <button
            onClick={() => router.back()}
            className="px-6 py-2 rounded-lg font-medium transition-all duration-200 hover:scale-105"
            style={{
              backgroundColor: theme.colors.semantic.action.primary,
              color: theme.colors.semantic.text.inverse,
            }}
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!subject) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-600 mb-4">Subject Not Found</h1>
          <button
            onClick={() => router.back()}
            className="px-6 py-2 rounded-lg font-medium transition-all duration-200 hover:scale-105"
            style={{
              backgroundColor: theme.colors.semantic.action.primary,
              color: theme.colors.semantic.text.inverse,
            }}
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: theme.colors.semantic.surface.tertiary }}>
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-8">
          {/* Breadcrumb */}
          {subject.parent && (
            <div className="flex items-center space-x-2 mb-4">
              <button
                onClick={() => router.push('/dashboard/question-bank')}
                className="text-sm hover:underline transition-all duration-200"
                style={{ color: theme.colors.semantic.text.secondary }}
              >
                Question Bank
              </button>
              <span style={{ color: theme.colors.semantic.text.tertiary }}>/</span>
              <button
                onClick={() => router.push(`/dashboard/question-bank/${yearId}`)}
                className="text-sm hover:underline transition-all duration-200"
                style={{ color: theme.colors.semantic.text.secondary }}
              >
                {subject.parent.name}
              </button>
              <span style={{ color: theme.colors.semantic.text.tertiary }}>/</span>
              <span
                className="text-sm font-medium"
                style={{ color: theme.colors.semantic.text.primary }}
              >
                {subject.name}
              </span>
            </div>
          )}

          {/* Subject Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1
                className="text-3xl font-bold mb-2"
                style={{ color: theme.colors.semantic.text.primary }}
              >
                {subject.name}
              </h1>
              <div className="flex items-center space-x-4">
                {subject.parent && (
                  <div className="flex items-center space-x-2">
                    <CalendarIcon />
                    <span
                      className="text-sm"
                      style={{ color: theme.colors.semantic.text.secondary }}
                    >
                      {subject.parent.name}
                    </span>
                  </div>
                )}
                <div className="flex items-center space-x-2">
                  <AcademicCapIcon />
                  <span
                    className="text-sm"
                    style={{ color: theme.colors.semantic.text.secondary }}
                  >
                    {subject.questionCount} Total Questions
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={() => router.back()}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:scale-105"
              style={{
                backgroundColor: theme.colors.semantic.surface.secondary,
                color: theme.colors.semantic.text.primary,
                border: `1px solid ${theme.colors.semantic.border.primary}30`,
              }}
            >
              <ArrowLeftIcon />
              <span>Back</span>
            </button>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Main Content - Left Side (3/4 width) */}
          <div className="lg:col-span-4">
            {/* Advanced MCQ Renderer */}
            <QbMcqRenderer
              showProgressBar={true}
              showTimer={true}
              allowNavigation={true}
            />
          </div>
        </div>

        {/* Subject Structure Tree - Fixed Position */}
        <div className="fixed top-4 right-4 w-80 z-40">
          {allHierarchyItems.length > 0 ? (
            <QbSubjectNavigator 
              key={`${yearId}-${subjectId}`} // Force remount when subject changes
              hierarchyItems={allHierarchyItems} 
              currentSubjectId={subjectId as string}
              currentYearId={yearId as string}
            />
          ) : (
            <div
              className="bg-white rounded-xl shadow-lg border p-4"
              style={{
                backgroundColor: theme.colors.semantic.surface.primary,
                border: `1px solid ${theme.colors.semantic.border.primary}30`,
              }}
            >
              <div className="text-center py-10">
                <div
                  className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto mb-4"
                  style={{ borderColor: theme.colors.semantic.action.primary }}
                />
                <p
                  className="text-sm"
                  style={{ color: theme.colors.semantic.text.secondary }}
                >
                  Loading navigation...
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Development Diagnostics */}
      <ApiDiagnostics />
    </div>
  );
}