'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/theme';
import { usePublishedItems } from '@/context/published-items-context';
import { CalendarIcon, AcademicCapIcon } from '@/components/dashboard/sidebar/sidebar-icons';

export default function QuestionBankPage() {
  const router = useRouter();
  const { theme } = useTheme();
  const { sidebarMenuItems, loading } = usePublishedItems();

  const handleSubjectClick = (yearId: string, subjectId: string) => {
    router.push(`/dashboard/question-bank/${yearId}/${subjectId}`);
  };

  if (loading) {
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

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div
        className="bg-gradient-to-r p-8 rounded-xl shadow-lg mb-8"
        style={{
          backgroundImage: `linear-gradient(135deg, ${theme.colors.semantic.action.primary}15, ${theme.colors.semantic.action.secondary}25)`,
          border: `1px solid ${theme.colors.semantic.border.primary}30`,
        }}
      >
        <h1
          className="text-3xl font-bold mb-2"
          style={{ color: theme.colors.semantic.text.primary }}
        >
          Question Bank
        </h1>
        <p
          style={{ color: theme.colors.semantic.text.secondary }}
        >
          Browse and access published subjects and their question collections
        </p>
      </div>

      {/* Published Subjects */}
      <div
        className="bg-white rounded-xl shadow-sm p-6"
        style={{
          backgroundColor: theme.colors.semantic.surface.primary,
          border: `1px solid ${theme.colors.semantic.border.primary}20`,
        }}
      >
        <h2
          className="text-xl font-bold mb-6"
          style={{ color: theme.colors.semantic.text.primary }}
        >
          Available Subjects
        </h2>

        {sidebarMenuItems.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {sidebarMenuItems.map(year => (
              <div key={year.id} className="space-y-2">
                {/* Year Header */}
                <div
                  className="flex items-center space-x-2 p-3 rounded-lg"
                  style={{
                    backgroundColor: theme.colors.semantic.surface.secondary,
                    border: `1px solid ${theme.colors.semantic.border.primary}20`,
                  }}
                >
                  <CalendarIcon />
                  <span
                    className="font-semibold"
                    style={{ color: theme.colors.semantic.text.primary }}
                  >
                    {year.name}
                  </span>
                </div>

                {/* Subjects under this year */}
                {year.children && year.children.map(subject => {
                  // Extract yearId and subjectId from the href
                  const hrefParts = subject.href?.split('/') || [];
                  const yearId = hrefParts[2];
                  const subjectId = hrefParts[3];

                  return (
                    <button
                      key={subject.id}
                      onClick={() => handleSubjectClick(yearId, subjectId)}
                      className="w-full text-left p-4 rounded-lg transition-all duration-200 hover:scale-[1.02] hover:shadow-md group"
                      style={{
                        backgroundColor: theme.colors.semantic.surface.tertiary,
                        border: `1px solid ${theme.colors.semantic.border.primary}10`,
                      }}
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className="p-2 rounded-lg transition-all duration-200 group-hover:scale-110"
                          style={{
                            backgroundColor: theme.colors.semantic.action.secondary,
                            color: theme.colors.semantic.text.primary,
                          }}
                        >
                          <AcademicCapIcon />
                        </div>
                        <div>
                          <h3
                            className="font-medium transition-colors"
                            style={{ color: theme.colors.semantic.text.primary }}
                          >
                            {subject.name}
                          </h3>
                          <p
                            className="text-sm"
                            style={{ color: theme.colors.semantic.text.secondary }}
                          >
                            Click to explore questions and topics
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div
              className="text-4xl mb-4"
              style={{ color: theme.colors.semantic.text.tertiary }}
            >
              📚
            </div>
            <h3
              className="text-lg font-medium mb-2"
              style={{ color: theme.colors.semantic.text.primary }}
            >
              No Published Subjects
            </h3>
            <p
              style={{ color: theme.colors.semantic.text.secondary }}
            >
              No subjects have been published yet. Check back later or contact an administrator.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}