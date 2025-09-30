import React, { useRef, useEffect, useState } from 'react';
import { ArrowRight, Divide } from 'lucide-react';
import { Position, ContextMenuItem } from '../types';
import { createEditorOperations } from '../utils/editorOperations';
import { createEditorContextMenuItems } from '../utils/editorMenuItems';

export interface EditorContextMenuProps {
  isVisible: boolean;
  position: Position;
  onClose: () => void;
  editorRef: React.RefObject<HTMLDivElement | null>;
}

export const EditorContextMenu: React.FC<EditorContextMenuProps> = ({
  isVisible,
  position,
  onClose,
  editorRef
}) => {
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Create editor operations instance
  const operations = createEditorOperations(editorRef);

  // Get menu items
  const contextMenuItems = createEditorContextMenuItems(operations);

  const renderMenuItem = (item: ContextMenuItem, level = 0) => {
    if (item.separator) {
      return (
        <div 
          key={item.id}
          className="border-b border-gray-200 dark:border-gray-700 my-1"
        />
      );
    }

    const hasSubmenu = item.submenu && item.submenu.length > 0;
    const isActive = activeSubmenu === item.id;

    return (
      <div key={item.id} className="relative">
        <button
          onClick={() => {
            if (hasSubmenu) {
              setActiveSubmenu(isActive ? null : item.id);
            } else {
              item.action?.();
              onClose();
            }
          }}
          onMouseEnter={() => {
            if (hasSubmenu) {
              setActiveSubmenu(item.id);
            }
          }}
          disabled={item.disabled}
          className={`
            w-full px-3 py-2 text-left flex items-center gap-2 text-sm
            hover:bg-gray-100 dark:hover:bg-gray-700
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-colors duration-150
            ${level > 0 ? 'pl-6' : ''}
          `}
        >
          {React.createElement(item.icon, { 
            size: 16, 
            className: "text-gray-600 dark:text-gray-400" 
          })}
          <span className="flex-1 text-gray-800 dark:text-gray-200">
            {item.label}
          </span>
          {hasSubmenu && (
            <ArrowRight size={14} className="text-gray-400" />
          )}
        </button>

        {/* Submenu */}
        {hasSubmenu && isActive && (
          <div className="absolute left-full top-0 ml-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg min-w-48 z-50">
            <div className="py-1">
              {item.submenu!.map(subItem => renderMenuItem(subItem, level + 1))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isVisible) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isVisible, onClose]);

  // Reset submenu when menu becomes visible
  useEffect(() => {
    if (isVisible) {
      setActiveSubmenu(null);
    }
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <>
      <div
        ref={menuRef}
        className="fixed bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg min-w-56 z-40"
        style={{
          left: position.x,
          top: position.y,
          maxHeight: '80vh',
          overflowY: 'auto'
        }}
      >
        <div className="py-1">
          {contextMenuItems.map(item => renderMenuItem(item))}
        </div>
      </div>
    </>
  );
};