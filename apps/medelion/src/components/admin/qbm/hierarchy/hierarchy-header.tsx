'use client';

import { useState } from 'react';
import { useTheme } from '@/theme';

interface HierarchyHeaderProps {
  onExpandAll: () => void;
  onCollapseAll: () => void;
  onSettings: () => void;
}

export default function HierarchyHeader({ onExpandAll, onCollapseAll, onSettings }: HierarchyHeaderProps) {
  const { theme } = useTheme();
  const [isExpanded, setIsExpanded] = useState(false);

  const handleToggleExpandCollapse = () => {
    if (isExpanded) {
      onCollapseAll();
      setIsExpanded(false);
    } else {
      onExpandAll();
      setIsExpanded(true);
    }
  };

  return (
    <>
      {/* Main Header */}
      <div className="flex items-center space-x-3 mb-8">
        <div 
          className="w-8 h-8 rounded-full flex items-center justify-center"
          style={{ backgroundColor: theme.colors.semantic.status.success }}
        >
          🌳
        </div>
        <div>
          <h1 
            className="text-3xl font-bold"
            style={{ color: theme.colors.semantic.text.primary }}
          >
            Academic Hierarchy
          </h1>
          <p 
            className="text-lg mt-1"
            style={{ color: theme.colors.semantic.text.secondary }}
          >
            Build your question bank structure
          </p>
        </div>
      </div>

      {/* Tree Section Header */}
      <div 
        className="p-8 rounded-2xl shadow-xl backdrop-blur-sm"
        style={{ 
          backgroundColor: `${theme.colors.semantic.surface.secondary}f0`,
          border: `1px solid ${theme.colors.semantic.border.secondary}50`,
          boxShadow: `0 4px 20px ${theme.colors.semantic.border.secondary}30`
        }}
      >
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <div className="flex space-x-2">
              <div 
                className="w-3 h-3 rounded-full shadow-sm"
                style={{ backgroundColor: '#FF5F56', border: '1px solid #FF5F5680' }}
              />
              <div 
                className="w-3 h-3 rounded-full shadow-sm"
                style={{ backgroundColor: '#FFBD2E', border: '1px solid #FFBD2E80' }}
              />
              <div 
                className="w-3 h-3 rounded-full shadow-sm"
                style={{ backgroundColor: '#27CA3F', border: '1px solid #27CA3F80' }}
              />
            </div>
            <h3 
              className="text-xl font-bold"
              style={{ color: theme.colors.semantic.text.primary }}
            >
              Hierarchy Tree
            </h3>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={onSettings}
              className="p-3 rounded-xl text-sm font-semibold transition-all duration-200 hover:scale-105 hover:shadow-lg border backdrop-blur-sm"
              style={{
                backgroundColor: `${theme.colors.semantic.action.secondary}f0`,
                color: theme.colors.semantic.text.primary,
                border: `1px solid ${theme.colors.semantic.border.secondary}60`,
                boxShadow: `0 2px 8px ${theme.colors.semantic.border.secondary}20`
              }}
              title="Hierarchy Settings"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
            <button
              onClick={handleToggleExpandCollapse}
              className="p-3 rounded-xl text-sm font-semibold transition-all duration-200 hover:scale-105 hover:shadow-lg border backdrop-blur-sm"
              style={{
                backgroundColor: `${theme.colors.semantic.action.secondary}f0`,
                color: theme.colors.semantic.text.primary,
                border: `1px solid ${theme.colors.semantic.border.secondary}60`,
                boxShadow: `0 2px 8px ${theme.colors.semantic.border.secondary}20`
              }}
              title={isExpanded ? "Collapse All Items" : "Expand All Items"}
            >
              <svg 
                className="w-5 h-5 transition-transform duration-200" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                style={{ 
                  transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' 
                }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}