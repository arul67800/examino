// Remaining Components (simplified implementations)
'use client';
import React from 'react';
import { useTheme } from '@/theme';
import { QuestionBankStats } from '../../types';

export const HierarchyBreakdown: React.FC<{ stats: QuestionBankStats }> = ({ stats }) => {
  const { theme } = useTheme();
  return (
    <div className="rounded-xl p-6" style={{ backgroundColor: theme.colors.semantic.surface.secondary }}>
      <h3 className="text-lg font-semibold" style={{ color: theme.colors.semantic.text.primary }}>Hierarchy Breakdown</h3>
      <p style={{ color: theme.colors.semantic.text.secondary }}>Coming soon...</p>
    </div>
  );
};

interface TagUsage {
  tag: string;
  count: number;
  category: 'tags' | 'sourceTags' | 'examTags';
}

export const TagAnalytics: React.FC<{ tags: TagUsage[] }> = ({ tags }) => {
  const { theme } = useTheme();
  return (
    <div className="rounded-xl p-6" style={{ backgroundColor: theme.colors.semantic.surface.secondary }}>
      <h3 className="text-lg font-semibold" style={{ color: theme.colors.semantic.text.primary }}>Tag Analytics</h3>
      <div className="flex flex-wrap gap-2 mt-4">
        {tags.slice(0, 5).map((tagUsage, i) => (
          <span key={i} className="px-2 py-1 rounded text-sm" style={{ backgroundColor: theme.colors.semantic.action.primary + '20', color: theme.colors.semantic.action.primary }}>
            {tagUsage.tag} ({tagUsage.count})
          </span>
        ))}
      </div>
    </div>
  );
};

export const RecentActivity: React.FC = () => {
  const { theme } = useTheme();
  return (
    <div className="rounded-xl p-6" style={{ backgroundColor: theme.colors.semantic.surface.secondary }}>
      <h3 className="text-lg font-semibold" style={{ color: theme.colors.semantic.text.primary }}>Recent Activity</h3>
      <p style={{ color: theme.colors.semantic.text.secondary }}>Activity feed coming soon...</p>
    </div>
  );
};