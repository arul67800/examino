'use client';

import { useTheme } from '@/theme';

export function Footer() {
  const { theme } = useTheme();

  return (
    <footer 
      className="border-t px-6 py-4"
      style={{
        backgroundColor: theme.colors.semantic.surface.primary,
        borderColor: theme.colors.semantic.border.secondary
      }}
    >
      <div className="flex flex-col md:flex-row items-center justify-between">
        {/* Left section - Copyright */}
        <div 
          className="text-sm mb-2 md:mb-0"
          style={{ color: theme.colors.semantic.text.tertiary }}
        >
          © {new Date().getFullYear()} Examino. All rights reserved.
        </div>

        {/* Center section - Links */}
        <div className="flex items-center space-x-6 mb-2 md:mb-0">
          <a 
            href="/privacy" 
            className="text-sm transition-colors hover:opacity-80"
            style={{ color: theme.colors.semantic.text.secondary }}
          >
            Privacy Policy
          </a>
          <a 
            href="/terms" 
            className="text-sm transition-colors hover:opacity-80"
            style={{ color: theme.colors.semantic.text.secondary }}
          >
            Terms of Service
          </a>
          <a 
            href="/support" 
            className="text-sm transition-colors hover:opacity-80"
            style={{ color: theme.colors.semantic.text.secondary }}
          >
            Support
          </a>
        </div>

        {/* Right section - Version/Status */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-sm">
            <span 
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
            v1.0.0
          </span>
        </div>
      </div>
    </footer>
  );
}