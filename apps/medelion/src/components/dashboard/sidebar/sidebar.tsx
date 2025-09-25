'use client';

import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useTheme } from '@/theme';
import { 
  MenuItem, 
  SubMenuItem, 
  GrandChildMenuItem, 
  SidebarState, 
  SidebarProps, 
  NavigationItem,
  MenuItemProps 
} from './sidebar-types';
import { getNavigationMenu, getAdminNavigationMenu, defaultUserProfile, animationConfig } from './sidebar-menu';
import { SidebarUtils } from '../../../routes/server-utils';

// Individual Menu Item Component with animations
const MenuItemComponent = ({ 
  item, 
  isCollapsed, 
  isExpanded, 
  isActive, 
  isHovered,
  depth, 
  onToggle, 
  onHover, 
  onClick 
}: MenuItemProps) => {
  const { theme } = useTheme();
  const hasChildren = 'children' in item && item.children && item.children.length > 0;
  const indentLevel = depth * 16;
  
  return (
    <div className="relative">
      <div
        className={`
          flex items-center px-3 py-2.5 text-sm font-medium rounded-lg cursor-pointer
          transition-all duration-300 ease-in-out group relative overflow-hidden
          ${isCollapsed ? 'justify-center' : ''}
          ${depth > 0 ? 'ml-2' : ''}
        `}
        style={{ 
          paddingLeft: isCollapsed ? undefined : `${12 + indentLevel}px`,
          transform: isHovered ? 'translateX(4px)' : 'translateX(0px)',
          backgroundColor: isActive ? theme.colors.semantic.surface.tertiary : 'transparent',
          color: isActive ? theme.colors.semantic.text.primary : theme.colors.semantic.text.secondary
        }}
        onClick={(e) => {
          // If item has href, navigate but don't toggle parent expansion
          if ('href' in item && item.href) {
            onClick(item);
            // Don't prevent default or stop propagation for navigation items
            return;
          }
          
          // If item has children but no href, toggle expansion
          if (hasChildren) {
            e.preventDefault(); // Prevent navigation for parent items
            onToggle(item.id);
            return;
          }
          
          // Handle other clicks
          onClick(item);
        }}
        onMouseEnter={() => onHover(item.id)}
        onMouseLeave={() => onHover(null)}
        title={isCollapsed ? item.name : undefined}
      >
        {/* Animated background on hover */}
        <div className={`
          absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg
        `} 
        style={{ 
          background: `linear-gradient(90deg, ${theme.colors.semantic.action.hover}20, ${theme.colors.semantic.action.secondary}20)` 
        }}
        />
        
        {/* Icon with animation */}
        <div className={`
          flex items-center justify-center transition-all duration-300 ease-in-out relative z-10
          ${isHovered ? 'scale-110' : 'scale-100'}
          ${isActive ? 'drop-shadow-sm' : ''}
        `}>
          {typeof item.icon === 'string' ? (
            <span className="text-lg">{item.icon}</span>
          ) : (
            <div className="w-5 h-5">{item.icon}</div>
          )}
        </div>
        
        {/* Text content */}
        {!isCollapsed && (
          <div className="flex items-center justify-between w-full ml-3 relative z-10">
            <div className="flex flex-col">
              <span className={`
                transition-all duration-300 ease-in-out
                ${isActive ? 'font-semibold' : 'font-medium'}
              `}>
                {item.name}
              </span>
              {item.description && depth === 0 && (
                <span 
                  className={`text-xs transition-opacity duration-300 ${isHovered ? 'opacity-90' : 'opacity-70'}`}
                  style={{ color: theme.colors.semantic.text.tertiary }}
                >
                  {item.description}
                </span>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              {/* Badge */}
              {item.badge && (
                <span 
                  className={`
                    inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium
                    transition-all duration-300 ease-in-out
                    ${isHovered ? 'scale-105' : 'scale-100'}
                  `}
                  style={{
                    backgroundColor: theme.colors.semantic.action.secondary,
                    color: theme.colors.semantic.text.primary
                  }}
                >
                  {item.badge}
                </span>
              )}
              
              {/* Expand/Collapse arrow */}
              {hasChildren && (
                <div 
                  className={`
                    transition-transform duration-300 ease-in-out
                    ${isExpanded ? 'rotate-90' : 'rotate-0'}
                  `}
                  style={{
                    color: isHovered ? theme.colors.semantic.text.primary : theme.colors.semantic.text.tertiary
                  }}
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Active indicator */}
        {isActive && (
          <div 
            className="absolute right-0 top-0 bottom-0 w-1 rounded-l-full opacity-80" 
            style={{ backgroundColor: theme.colors.semantic.action.primary }}
          />
        )}
      </div>
    </div>
  );
};

// Recursive Menu Renderer
const MenuRenderer = ({ 
  items, 
  isCollapsed, 
  expandedItems, 
  activeItem, 
  hoveredItem,
  onToggle, 
  onHover, 
  onClick,
  depth = 0 
}: {
  items: NavigationItem[];
  isCollapsed: boolean;
  expandedItems: Set<string>;
  activeItem: string | null;
  hoveredItem: string | null;
  onToggle: (itemId: string) => void;
  onHover: (itemId: string | null) => void;
  onClick: (item: NavigationItem) => void;
  depth?: number;
}) => {
  return (
    <div className="space-y-1">
      {items.map((item, index) => {
        const hasChildren = 'children' in item && item.children && item.children.length > 0;
        const isExpanded = expandedItems.has(item.id);
        const isActive = activeItem === item.id;
        const isHovered = hoveredItem === item.id;

        return (
          <div
            key={item.id}
            className={`
              transition-all duration-300 ease-in-out
              ${depth === 0 
                ? 'translate-x-0 opacity-100' 
                : isExpanded 
                  ? 'translate-x-0 opacity-100' 
                  : '-translate-x-2 opacity-80'
              }
            `}
            style={{
              transitionDelay: `${index * animationConfig.stagger}ms`
            }}
          >
            <MenuItemComponent
              item={item}
              isCollapsed={isCollapsed}
              isExpanded={isExpanded}
              isActive={isActive}
              isHovered={isHovered}
              depth={depth}
              onToggle={onToggle}
              onHover={onHover}
              onClick={onClick}
            />
            
            {/* Render children recursively */}
            {hasChildren && !isCollapsed && isExpanded && 'children' in item && (
              <div className="mt-1">
                <MenuRenderer
                  items={item.children || []}
                  isCollapsed={isCollapsed}
                  expandedItems={expandedItems}
                  activeItem={activeItem}
                  hoveredItem={hoveredItem}
                  onToggle={onToggle}
                  onHover={onHover}
                  onClick={onClick}
                  depth={depth + 1}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

// Main Sidebar Component
export function Sidebar({
  className = '',
  defaultCollapsed = false,
  isAdmin = false,
  onItemClick,
  onToggleCollapse
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme } = useTheme();
  
  // Memoize navigationMenu to prevent recreating it on every render
  const navigationMenu = useMemo(() => 
    isAdmin ? getAdminNavigationMenu() : getNavigationMenu(), 
    [isAdmin]
  );
  
  // Initialize state based on current route (without localStorage to avoid hydration mismatch)
  const [state, setState] = useState<SidebarState>(() => {
    const activeItem = SidebarUtils.getActiveMenuItem(pathname, navigationMenu);
    const expandedItems = SidebarUtils.getExpandedItems(pathname, navigationMenu);
    
    return {
      isCollapsed: defaultCollapsed,
      expandedItems,
      activeItem,
      hoveredItem: null
    };
  });

  const sidebarRef = useRef<HTMLElement>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  // Restore expanded items from localStorage after mount to avoid hydration mismatch
  useEffect(() => {
    try {
      const savedExpandedItems = localStorage.getItem('sidebar-expanded-items');
      if (savedExpandedItems) {
        const parsedItems = JSON.parse(savedExpandedItems);
        setState(prevState => {
          const newExpandedItems = new Set(prevState.expandedItems);
          parsedItems.forEach((item: string) => newExpandedItems.add(item));
          return {
            ...prevState,
            expandedItems: newExpandedItems
          };
        });
      }
    } catch (error) {
      console.warn('Failed to restore sidebar state:', error);
    }
  }, []);

  // Update active item when pathname changes
  useEffect(() => {
    const activeItem = SidebarUtils.getActiveMenuItem(pathname, navigationMenu);
    const routeExpandedItems = SidebarUtils.getExpandedItems(pathname, navigationMenu);
    
    // Only update if there are actual changes
    setState(prev => {
      const hasActiveItemChanged = prev.activeItem !== activeItem;
      
      if (hasActiveItemChanged) {
        // Merge route-based expanded items with manually expanded items
        const newExpandedItems = new Set([...prev.expandedItems, ...routeExpandedItems]);
        
        return {
          ...prev,
          activeItem,
          expandedItems: newExpandedItems
        };
      }
      
      return prev; // No changes, return previous state
    });
  }, [pathname, navigationMenu]);

  // Handle item toggle (expand/collapse)
  const handleToggle = useCallback((itemId: string) => {
    setState(prev => {
      const newExpandedItems = new Set(prev.expandedItems);
      if (newExpandedItems.has(itemId)) {
        newExpandedItems.delete(itemId);
      } else {
        newExpandedItems.add(itemId);
      }
      
      // Persist expanded items to localStorage
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('sidebar-expanded-items', JSON.stringify([...newExpandedItems]));
        } catch (error) {
          console.warn('Failed to save sidebar state:', error);
        }
      }
      
      return {
        ...prev,
        expandedItems: newExpandedItems
      };
    });
  }, []);

  // Handle item hover
  const handleHover = useCallback((itemId: string | null) => {
    setState(prev => ({
      ...prev,
      hoveredItem: itemId
    }));
  }, []);

  // Handle item click
  const handleItemClick = useCallback((item: NavigationItem) => {
    setState(prev => ({
      ...prev,
      activeItem: item.id
    }));
    
    if (onItemClick) {
      onItemClick(item);
    }

    // Navigate to href if available using Next.js router
    if ('href' in item && item.href) {
      router.push(item.href);
    }
  }, [onItemClick, router]);

  // Handle sidebar collapse toggle
  const handleCollapseToggle = useCallback(() => {
    setIsAnimating(true);
    setState(prev => {
      const newCollapsed = !prev.isCollapsed;
      if (onToggleCollapse) {
        onToggleCollapse(newCollapsed);
      }
      return {
        ...prev,
        isCollapsed: newCollapsed
      };
    });
    
    setTimeout(() => setIsAnimating(false), animationConfig.duration);
  }, [onToggleCollapse]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !state.isCollapsed) {
        handleCollapseToggle();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [state.isCollapsed, handleCollapseToggle]);

  return (
    <aside 
      ref={sidebarRef}
      className={`
        flex flex-col h-full transition-all duration-300 ease-in-out relative
        ${state.isCollapsed ? 'w-20' : 'w-80'}
        ${className}
      `}
      style={{
        backgroundColor: theme.colors.semantic.surface.primary,
        color: theme.colors.semantic.text.primary,
        boxShadow: theme.shadows.lg,
        borderColor: theme.colors.semantic.border.primary
      }}
    >
      {/* Header with logo and toggle */}
      <div 
        className="flex items-center justify-between p-4 border-b transition-all duration-300 ease-in-out"
        style={{ borderColor: theme.colors.semantic.border.secondary }}
      >
        <div className={`
          flex items-center space-x-3 transition-all duration-300 ease-in-out
          ${state.isCollapsed ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}
        `}>
          <div 
            className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg transition-all duration-300 ease-in-out shadow-lg hover:shadow-xl transform hover:scale-105"
            style={{ backgroundColor: theme.colors.semantic.action.primary }}
          >
            E
          </div>
          {!state.isCollapsed && (
                      <div className="flex flex-col">
            <span 
              className="text-xl font-bold"
              style={{ color: theme.colors.semantic.text.primary }}
            >
              {isAdmin ? 'Examino Admin' : 'Examino'}
            </span>
            <span 
              className="text-xs"
              style={{ color: theme.colors.semantic.text.tertiary }}
            >
              {isAdmin ? 'Administrator Panel' : 'Education Platform'}
            </span>
          </div>
          )}
        </div>
        
        <button
          onClick={handleCollapseToggle}
          className={`
            p-2 rounded-lg transition-all duration-300 ease-in-out hover:scale-110 active:scale-95 group hover:opacity-80
            ${state.isCollapsed ? 'shadow-md' : ''}
          `}
          style={{ 
            backgroundColor: state.isCollapsed 
              ? theme.colors.semantic.surface.primary
              : 'transparent',
            border: state.isCollapsed 
              ? `1px solid ${theme.colors.semantic.border.primary}`
              : 'none'
          }}
          disabled={isAnimating}
        >
          <div className={`
            transition-transform duration-300 ease-in-out
            ${state.isCollapsed ? 'rotate-180' : 'rotate-0'}
          `}>
            <svg 
              className="w-5 h-5 group-hover:opacity-80" 
              fill="currentColor" 
              viewBox="0 0 20 20"
              style={{ color: theme.colors.semantic.text.secondary }}
            >
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        </button>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-4 py-6 overflow-y-auto overflow-x-hidden custom-scrollbar">
        <MenuRenderer
          items={navigationMenu}
          isCollapsed={state.isCollapsed}
          expandedItems={state.expandedItems}
          activeItem={state.activeItem}
          hoveredItem={state.hoveredItem}
          onToggle={handleToggle}
          onHover={handleHover}
          onClick={handleItemClick}
        />
      </nav>

      {/* User Profile Section */}
      <div 
        className="p-4 border-t transition-all duration-300 ease-in-out"
        style={{ borderColor: theme.colors.semantic.border.secondary }}
      >
        <div className={`
          flex items-center transition-all duration-300 ease-in-out
          ${state.isCollapsed ? 'justify-center' : 'space-x-3'}
          group cursor-pointer p-2 rounded-lg hover:opacity-80
        `}>
          <div className="relative">
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center font-medium text-sm transition-all duration-300 ease-in-out group-hover:scale-110 shadow-lg"
              style={{
                backgroundColor: theme.colors.semantic.action.primary
              }}
            >
              {defaultUserProfile.avatar ? (
                <img 
                  src={defaultUserProfile.avatar} 
                  alt={defaultUserProfile.name}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <span style={{ color: theme.colors.semantic.text.inverse }}>
                  {defaultUserProfile.name.split(' ').map(n => n[0]).join('')}
                </span>
              )}
            </div>
            
            {/* Online status indicator */}
            <div className={`
              absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 transition-all duration-300 ease-in-out
              ${defaultUserProfile.status === 'online' ? '' : 
                defaultUserProfile.status === 'away' ? '' : 
                defaultUserProfile.status === 'busy' ? '' : ''}
            `} 
            style={{ 
              borderColor: theme.colors.semantic.surface.primary,
              backgroundColor: 
                defaultUserProfile.status === 'online' ? theme.colors.semantic.status.success :
                defaultUserProfile.status === 'away' ? theme.colors.semantic.status.warning :
                defaultUserProfile.status === 'busy' ? theme.colors.semantic.status.error :
                theme.colors.semantic.text.disabled
            }}
            />
          </div>
          
          {!state.isCollapsed && (
            <div className={`
              flex-1 min-w-0 transition-all duration-300 ease-in-out
              ${state.isCollapsed ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}
            `}>
              <p 
                className="text-sm font-medium truncate transition-colors"
                style={{ color: theme.colors.semantic.text.primary }}
              >
                {isAdmin ? 'System Administrator' : defaultUserProfile.name}
              </p>
              <div className="flex items-center space-x-2">
                <p 
                  className="text-xs truncate transition-colors"
                  style={{ color: theme.colors.semantic.text.tertiary }}
                >
                  {isAdmin ? 'admin@examino.com' : defaultUserProfile.email}
                </p>
                {(isAdmin || defaultUserProfile.role) && (
                  <span 
                    className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium"
                    style={{ 
                      backgroundColor: isAdmin 
                        ? theme.colors.semantic.status.error 
                        : theme.colors.semantic.action.secondary,
                      color: theme.colors.semantic.text.primary
                    }}
                  >
                    {isAdmin ? 'Admin' : defaultUserProfile.role}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Custom Scrollbar Styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.1);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }
      `}</style>
    </aside>
  );
}