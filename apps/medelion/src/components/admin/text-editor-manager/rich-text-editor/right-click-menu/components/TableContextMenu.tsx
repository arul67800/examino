import React, { useState, useRef, useEffect } from 'react';
import { ArrowRight, Divide } from 'lucide-react';
import { TableContextMenuProps, ContextMenuItem } from '../types';
import { createAdvancedTableOperations } from '../utils/advancedTableOperations';
import { createAdvancedContextMenuItems } from '../utils/advancedMenuItems';

export const TableContextMenu: React.FC<TableContextMenuProps> = ({
  isVisible,
  position,
  onClose,
  selectedCell
}) => {
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Create table operations instance
  const operations = createAdvancedTableOperations(selectedCell || null);

  // Get menu items
  const contextMenuItems = createAdvancedContextMenuItems(operations);

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
          className={`
            w-full px-3 py-2 text-left flex items-center justify-between
            hover:bg-gray-100 dark:hover:bg-gray-700
            ${item.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            ${level > 0 ? 'pl-6' : ''}
            transition-colors duration-150
          `}
          onClick={() => {
            if (item.disabled) return;
            
            if (hasSubmenu) {
              setActiveSubmenu(isActive ? null : item.id);
            } else if (item.action) {
              item.action();
              if (!item.color) {
                onClose();
              }
            }
          }}
          onMouseEnter={() => {
            if (hasSubmenu) {
              setActiveSubmenu(item.id);
            }
          }}
        >
          <div className="flex items-center space-x-2">
            <item.icon size={16} className="text-gray-600 dark:text-gray-400 flex-shrink-0" />
            <span className="text-sm text-gray-800 dark:text-gray-200 whitespace-nowrap">
              {item.label}
            </span>
          </div>
          {hasSubmenu && (
            <ArrowRight size={14} className="text-gray-500 flex-shrink-0" />
          )}
        </button>

        {hasSubmenu && isActive && (
          <div 
            className="absolute left-full top-0 ml-1 min-w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto"
            style={{
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
            }}
          >
            {item.submenu!.map(subItem => renderMenuItem(subItem, level + 1))}
          </div>
        )}
      </div>
    );
  };

  // Close menu on outside click
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

  // Close menu on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isVisible) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <>
      <div
        ref={menuRef}
        className="fixed bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl min-w-56 max-w-72 z-50 max-h-96 overflow-y-auto"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        }}
      >
        <div className="py-1">
          {contextMenuItems.map(item => renderMenuItem(item))}
        </div>
      </div>
    </>
  );
};