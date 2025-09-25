'use client';

import { useEffect } from 'react';
import { useTheme } from '@/theme';
import { Sidebar } from '../sidebar/sidebar';
import { Topbar } from '../topbar';

interface DashboardLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function DashboardLayout({ children, className = '' }: DashboardLayoutProps) {
  const { theme, mode, colorName, direction } = useTheme();

  // Apply theme attributes to document elements
  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;

    // Set data attributes for CSS selectors
    root.setAttribute('data-theme-mode', mode);
    root.setAttribute('data-theme-color', colorName);
    root.setAttribute('dir', direction);

    // Apply theme colors to body
    body.style.backgroundColor = theme.colors.semantic.background.primary;
    body.style.color = theme.colors.semantic.text.primary;

    // Cleanup function to remove attributes on unmount
    return () => {
      root.removeAttribute('data-theme-mode');
      root.removeAttribute('data-theme-color');
      root.removeAttribute('dir');
    };
  }, [theme, mode, colorName, direction]);

  return (
    <div 
      className={`flex h-screen overflow-hidden theme-transition ${className}`}
      style={{
        backgroundColor: theme.colors.semantic.background.primary,
        color: theme.colors.semantic.text.primary,
        direction: direction
      }}
    >
      {/* Sidebar */}
      <div className="flex-shrink-0">
        <Sidebar />
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <div className="flex-shrink-0">
          <Topbar />
        </div>

        {/* Page content */}
        <main 
          className="flex-1 overflow-auto theme-transition"
          style={{
            backgroundColor: theme.colors.semantic.background.secondary,
          }}
        >
          <div 
            className="h-full p-6"
            style={{
              backgroundColor: theme.colors.semantic.background.primary,
              borderRadius: theme.borderRadius.lg
            }}
          >
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;