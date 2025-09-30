import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useTheme } from '@/theme';
import {
  Copy, Scissors, Clipboard, ClipboardCheck,
  Bold, Italic, Underline, Strikethrough, Type, Palette,
  Link, Unlink, Image, Table, List, ListOrdered,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Indent, Outdent, Quote, Code, Hash,
  Search, Replace, Shell, Languages,
  MoreHorizontal, ChevronRight, Check,
  FileText, Download, Share2, Printer,
  Undo, Redo, Trash2, Edit3,
  Plus, Minus, RotateCw, Settings,
  Bookmark, Flag, MessageSquare, User,
  Calendar, Clock, MapPin, Phone,
  Mail, Globe, Shield, Lock
} from 'lucide-react';

export interface ContextMenuItem {
  id: string;
  label: string;
  icon?: React.ComponentType<any>;
  shortcut?: string;
  action?: () => void;
  disabled?: boolean;
  divider?: boolean;
  submenu?: ContextMenuItem[];
  type?: 'normal' | 'checkbox' | 'radio';
  checked?: boolean;
  destructive?: boolean;
}

interface AdvancedContextMenuProps {
  isVisible: boolean;
  position: { x: number; y: number };
  onClose: () => void;
  items: ContextMenuItem[];
  context?: 'text' | 'table' | 'image' | 'link' | 'selection';
}

export const AdvancedContextMenu: React.FC<AdvancedContextMenuProps> = ({
  isVisible,
  position,
  onClose,
  items,
  context = 'text'
}) => {
  const { theme } = useTheme();
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);
  const [submenuPosition, setSubmenuPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isMouseInSubmenu, setIsMouseInSubmenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const submenuRef = useRef<HTMLDivElement>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isHoveringSubmenuRef = useRef(false);
  const isHoveringMainMenuRef = useRef(false);

  // Close menu on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveSubmenu(null);
        onClose();
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      const isInsideMenu = menuRef.current && menuRef.current.contains(target);
      const isInsideSubmenu = submenuRef.current && submenuRef.current.contains(target);
      
      if (!isInsideMenu && !isInsideSubmenu) {
        // Clear any pending timeouts before closing
        if (hoverTimeoutRef.current) {
          clearTimeout(hoverTimeoutRef.current);
          hoverTimeoutRef.current = null;
        }
        if (closeTimeoutRef.current) {
          clearTimeout(closeTimeoutRef.current);
          closeTimeoutRef.current = null;
        }
        onClose();
      }
    };

    if (isVisible) {
      document.addEventListener('keydown', handleEscape);
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', handleClickOutside);
      
      // Clear any pending timeouts
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
    };
  }, [isVisible, onClose]);

  // Reset mouse state when submenu closes but don't auto-close
  useEffect(() => {
    if (!activeSubmenu) {
      setIsMouseInSubmenu(false);
    }
  }, [activeSubmenu]);

  // Position menu within viewport
  const getMenuPosition = useCallback(() => {
    if (!isVisible) return position;

    const menuWidth = 240;
    const menuHeight = items.length * 28 + 8; // Compact height calculation
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let x = position.x;
    let y = position.y;

    // Adjust horizontal position
    if (x + menuWidth > viewportWidth) {
      x = viewportWidth - menuWidth - 10;
    }

    // Adjust vertical position
    if (y + menuHeight > viewportHeight) {
      y = viewportHeight - menuHeight - 10;
    }

    return { x: Math.max(10, x), y: Math.max(10, y) };
  }, [isVisible, position, items]);

  const handleSubmenuHover = useCallback((itemId: string, itemElement: HTMLElement) => {
    // Clear any pending close timeout
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    
    // Clear any pending hover timeout
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    
    // Set a small delay before opening submenu
    hoverTimeoutRef.current = setTimeout(() => {
      if (activeSubmenu !== itemId) {
        setActiveSubmenu(itemId);
        
        const rect = itemElement.getBoundingClientRect();
        const submenuX = rect.right + 5;
        const submenuY = rect.top;
        
        setSubmenuPosition({ x: submenuX, y: submenuY });
      }
    }, 150); // 150ms delay
  }, [activeSubmenu]);
  
  const handleSubmenuLeave = useCallback(() => {
    // Simply clear timeouts - don't trigger any closures
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
  }, []);
  
  const handleSubmenuEnter = useCallback(() => {
    // Clear any pending close timeout when mouse enters submenu
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setIsMouseInSubmenu(true);
  }, []);

  const handleItemClick = useCallback((item: ContextMenuItem) => {
    if (item.submenu) {
      return; // Don't close menu for submenu items
    }
    
    // Clear any pending timeouts before closing
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    
    if (item.action) {
      item.action();
    }
    
    onClose();
  }, [onClose]);

  const renderMenuItem = (item: ContextMenuItem, level = 0) => {
    if (item.divider) {
      return (
        <div
          key={item.id}
          style={{
            height: '1px',
            backgroundColor: theme.colors.semantic.border.primary,
            margin: '4px 0',
            opacity: 0.4
          }}
        />
      );
    }

    const IconComponent = item.icon;
    const hasSubmenu = item.submenu && item.submenu.length > 0;

    return (
      <div
        key={item.id}
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '6px 12px',
          cursor: item.disabled ? 'not-allowed' : 'pointer',
          fontSize: '13px',
          fontWeight: '400',
          color: item.disabled 
            ? theme.colors.semantic.text.disabled
            : item.destructive
            ? theme.colors.semantic.status.error
            : theme.colors.semantic.text.primary,
          transition: 'background-color 0.1s ease',
          userSelect: 'none',
          borderRadius: '2px',
          margin: '0 2px',
          opacity: item.disabled ? 0.5 : 1
        }}
        onMouseEnter={(e) => {
          if (!item.disabled) {
            e.currentTarget.style.backgroundColor = theme.colors.semantic.action.hover;
            if (hasSubmenu) {
              handleSubmenuHover(item.id, e.currentTarget);
            }
            // Don't call handleSubmenuLeave for submenu items - let them stay open
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
          // Don't close submenu from menu item hover - let submenu handle its own closing
        }}
        onClick={() => !item.disabled && handleItemClick(item)}
      >
        {/* Icon */}
        <div style={{
          width: '16px',
          height: '16px',
          marginRight: '8px',
          flexShrink: 0,
          opacity: 0.85,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {item.type === 'checkbox' && item.checked ? (
            <Check size={14} />
          ) : IconComponent ? (
            <IconComponent size={14} />
          ) : null}
        </div>

        {/* Label */}
        <span style={{
          flex: 1,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          lineHeight: '1.2'
        }}>
          {item.label}
        </span>

        {/* Shortcut or submenu indicator */}
        <div style={{
          marginLeft: '16px',
          fontSize: '11px',
          color: theme.colors.semantic.text.secondary,
          fontWeight: '400',
          letterSpacing: '0.3px',
          opacity: 0.8,
          display: 'flex',
          alignItems: 'center'
        }}>
          {hasSubmenu ? (
            <ChevronRight size={12} style={{ opacity: 0.7 }} />
          ) : item.shortcut ? (
            <span style={{ fontFamily: 'monospace' }}>{item.shortcut}</span>
          ) : null}
        </div>
      </div>
    );
  };

  const renderSubmenu = (items: ContextMenuItem[], parentId: string) => {
    return (
      <div
        key={`submenu-${parentId}`}
        ref={submenuRef}
        style={{
          position: 'fixed',
          top: submenuPosition.y,
          left: submenuPosition.x,
          backgroundColor: theme.colors.semantic.surface.elevated,
          border: `1px solid ${theme.colors.semantic.border.primary}`,
          borderRadius: '6px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.05)',
          minWidth: '180px',
          maxWidth: '220px',
          padding: '4px 0',
          zIndex: 1001,
          fontFamily: theme.typography.fontFamily.sans,
          fontSize: '13px',
          backdropFilter: 'blur(8px)',
          userSelect: 'none',
          overflow: 'hidden',
          pointerEvents: 'auto'
        }}
        onMouseEnter={() => {
          // Set stable ref state
          isHoveringSubmenuRef.current = true;
          setIsMouseInSubmenu(true);
          
          // Clear any pending close timeouts
          if (closeTimeoutRef.current) {
            clearTimeout(closeTimeoutRef.current);
            closeTimeoutRef.current = null;
          }
          if (hoverTimeoutRef.current) {
            clearTimeout(hoverTimeoutRef.current);
            hoverTimeoutRef.current = null;
          }
        }}
        onMouseLeave={() => {
          // Reset stable ref state
          isHoveringSubmenuRef.current = false;
          setIsMouseInSubmenu(false);
          
          // Start close timer with delay
          setTimeout(() => {
            // Close only if not hovering either main menu or submenu
            if (!isHoveringMainMenuRef.current && !isHoveringSubmenuRef.current) {
              setActiveSubmenu(null);
            }
          }, 200);
        }}
      >
        {items.map(item => renderMenuItem(item, 1))}
      </div>
    );
  };

  if (!isVisible) return null;

  const menuPosition = getMenuPosition();

  const adjustedPosition = getMenuPosition();

  return (
    <div
      style={{ position: 'fixed', pointerEvents: 'none', zIndex: 999 }}
    >
      {/* Main Context Menu */}
      <div
        ref={menuRef}
        style={{
          position: 'fixed',
          top: adjustedPosition.y,
          left: adjustedPosition.x,
          backgroundColor: theme.colors.semantic.surface.elevated,
          border: `1px solid ${theme.colors.semantic.border.primary}`,
          borderRadius: '6px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.05)',
          minWidth: '200px',
          maxWidth: '240px',
          padding: '4px 0',
          zIndex: 1000,
          fontFamily: theme.typography.fontFamily.sans,
          fontSize: '13px',
          backdropFilter: 'blur(8px)',
          userSelect: 'none',
          overflow: 'hidden',
          pointerEvents: 'auto'
        }}
        onMouseEnter={() => {
          isHoveringMainMenuRef.current = true;
        }}
        onMouseLeave={(e) => {
          isHoveringMainMenuRef.current = false;
          
          // Only start close timer if we have an active submenu and not hovering submenu
          if (activeSubmenu) {
            setTimeout(() => {
              // Close only if not hovering either main menu or submenu
              if (!isHoveringMainMenuRef.current && !isHoveringSubmenuRef.current) {
                setActiveSubmenu(null);
              }
            }, 300);
          }
        }}
      >
        {items.map(item => renderMenuItem(item))}
      </div>

      {/* Submenu */}
      {activeSubmenu && (
        <>
          {/* Invisible bridge area to help with mouse navigation */}
          <div
            key="submenu-bridge"
            style={{
              position: 'fixed',
              top: submenuPosition.y - 10, // Start slightly above submenu
              left: adjustedPosition.x + 190, // Start just before right edge of main menu
              width: 20, // Wider bridge area
              height: Math.max(140, submenuPosition.y - adjustedPosition.y + 60), // Dynamic height
              zIndex: 1000,
              pointerEvents: 'auto',
              backgroundColor: 'transparent'
            }}
            onMouseEnter={() => {
              // Treat bridge as submenu area
              isHoveringSubmenuRef.current = true;
              setIsMouseInSubmenu(true);
              
              // Cancel any pending close when entering bridge
              if (closeTimeoutRef.current) {
                clearTimeout(closeTimeoutRef.current);
                closeTimeoutRef.current = null;
              }
            }}
            onMouseLeave={() => {
              // Don't immediately trigger closure from bridge
              // Let submenu or main menu handle the closure
            }}
          />
          
          {items.map(item => {
            if (item.id === activeSubmenu && item.submenu) {
              return renderSubmenu(item.submenu, item.id);
            }
            return null;
          })}
        </>
      )}
    </div>
  );
};