'use client';

import { useState } from 'react';
import { useTheme } from '@/theme';
import { SettingsDrawer } from '../settings-drawer';

export function Topbar() {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { theme } = useTheme();

  return (
    <header 
      className="shadow-sm border-b"
      style={{
        backgroundColor: theme.colors.semantic.surface.secondary,
        borderColor: theme.colors.semantic.border.secondary
      }}
    >
      <div className="flex items-center justify-between px-6 py-4">
        {/* Left section - Empty */}
        <div className="flex items-center">
        </div>

        {/* Right section - Actions */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <button 
            className="relative p-2 rounded-full transition-colors hover:opacity-80"
            style={{
              color: theme.colors.semantic.text.secondary
            }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span 
              className="absolute top-0 right-0 h-2 w-2 rounded-full"
              style={{ backgroundColor: theme.colors.semantic.status.error }}
            ></span>
          </button>

          {/* Messages */}
          <button 
            className="p-2 rounded-full transition-colors hover:opacity-80"
            style={{
              color: theme.colors.semantic.text.secondary
            }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </button>

          {/* Settings */}
          <button 
            onClick={() => setIsSettingsOpen(true)}
            className="p-2 rounded-full transition-colors hover:opacity-80"
            style={{
              color: theme.colors.semantic.text.secondary
            }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center space-x-2 p-2 rounded-full transition-colors hover:opacity-80"
            >
              <div 
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ backgroundColor: theme.colors.semantic.surface.tertiary }}
              >
                👤
              </div>
              <span 
                className="hidden md:block text-sm font-medium"
                style={{ color: theme.colors.semantic.text.primary }}
              >
                John Doe
              </span>
              <span 
                className="text-xs"
                style={{ color: theme.colors.semantic.text.tertiary }}
              >
                ▼
              </span>
            </button>

            {/* Dropdown Menu */}
            {isUserMenuOpen && (
              <div 
                className="absolute right-0 mt-2 w-48 rounded-md shadow-lg ring-1 ring-opacity-5 z-50"
                style={{
                  backgroundColor: theme.colors.semantic.surface.elevated,
                  borderColor: theme.colors.semantic.border.primary
                }}
              >
                <div className="py-1">
                  <a
                    href="/dashboard/profile"
                    className="flex items-center px-4 py-2 text-sm transition-colors hover:opacity-80"
                    style={{
                      color: theme.colors.semantic.text.primary
                    }}
                  >
                    <span className="mr-3">👤</span>
                    Profile
                  </a>
                  <a
                    href="/dashboard/settings"
                    className="flex items-center px-4 py-2 text-sm transition-colors hover:opacity-80"
                    style={{
                      color: theme.colors.semantic.text.primary
                    }}
                  >
                    <span className="mr-3">⚙️</span>
                    Settings
                  </a>
                  <hr 
                    className="my-1" 
                    style={{ borderColor: theme.colors.semantic.border.secondary }}
                  />
                  <button
                    className="flex items-center w-full px-4 py-2 text-sm transition-colors hover:opacity-80"
                    style={{
                      color: theme.colors.semantic.text.primary
                    }}
                    onClick={() => {/* Handle logout */}}
                  >
                    <span className="mr-3">🚪</span>
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Settings Drawer */}
      <SettingsDrawer 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
      />
    </header>
  );
}