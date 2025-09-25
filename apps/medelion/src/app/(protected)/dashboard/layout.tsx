'use client';

import { Sidebar } from '@/components/dashboard/sidebar';
import { Topbar } from '@/components/dashboard/topbar';
import { Footer } from '@/components/dashboard/footer';
import { useTheme } from '@/theme';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { theme } = useTheme();

  // Create subtle color variations for different areas
  const sidebarBg = theme.colors.semantic.surface.primary;
  const mainContentBg = theme.mode === 'black' 
    ? 'rgba(0, 0, 0, 0.6)' // Slightly lighter than pure black
    : theme.mode === 'dark'
    ? 'rgba(31, 41, 55, 0.8)' // Slightly lighter dark gray
    : 'rgba(249, 250, 251, 1)'; // Light gray for light mode

  return (
    <div 
      className="h-screen flex overflow-hidden"
      style={{ backgroundColor: theme.colors.semantic.background.primary }}
    >
      {/* Sidebar */}
      <div className="flex-shrink-0 relative z-20">
        <Sidebar />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <div 
          className="relative z-10"
          style={{ 
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
          }}
        >
          <Topbar />
        </div>

        {/* Content Area */}
        <main 
          className="flex-1 overflow-y-auto"
          style={{ 
            backgroundColor: mainContentBg,
            color: theme.colors.semantic.text.primary
          }}
        >
          <div 
            className="px-6 py-8 min-h-full"
            style={{ 
              backgroundColor: 'transparent',
              color: theme.colors.semantic.text.primary
            }}
          >
            {children}
          </div>
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
}
