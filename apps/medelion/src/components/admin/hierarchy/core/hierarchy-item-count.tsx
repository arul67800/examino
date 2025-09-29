'use client';

import { useTheme } from '@/theme';

interface HierarchyItemCountProps {
  item: any;
  hasChildren: boolean;
  getTypeByLevel: (level: number) => string;
}

export default function HierarchyItemCount({ 
  item, 
  hasChildren, 
  getTypeByLevel 
}: HierarchyItemCountProps) {
  const { theme } = useTheme();

  return (
    <>
      {/* Only show question count for leaf nodes (level 5) */}
      {item.level === 5 && (
        <span 
          className="text-sm font-medium px-2 py-1 rounded-lg border"
          style={{ 
            color: theme.colors.semantic.text.secondary,
            backgroundColor: `${theme.colors.semantic.surface.tertiary}80`,
            border: `1px solid ${theme.colors.semantic.border.secondary}30`
          }}
        >
          {item.questionCount || 0} {item.questionCount === 1 ? 'question' : 'questions'}
        </span>
      )}
    </>
  );
}