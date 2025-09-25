'use client';

import { useTheme } from '@/theme';

interface HierarchyFooterProps {}

export default function HierarchyFooter({}: HierarchyFooterProps) {
  const { theme } = useTheme();

  return (
    <div className="flex items-center justify-between text-sm">
      <div 
        className="flex items-center space-x-2"
        style={{ color: theme.colors.semantic.text.tertiary }}
      >
        <span>© 2025 Examino. All rights reserved</span>
        <span>•</span>
        <span>Privacy Policy</span>
        <span>•</span>
        <span>Terms of Service</span>
        <span>•</span>
        <span>Support</span>
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <div 
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: theme.colors.semantic.status.success }}
          />
          <span style={{ color: theme.colors.semantic.text.secondary }}>
            All systems operational
          </span>
        </div>
        <span 
          className="text-xs px-2 py-1 rounded"
          style={{
            color: theme.colors.semantic.text.tertiary,
            backgroundColor: theme.colors.semantic.surface.tertiary
          }}
        >
          v2.1.0
        </span>
      </div>
    </div>
  );
}