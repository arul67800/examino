export interface MenuItemBase {
  id: string;
  name: string;
  icon: string | React.ReactNode;
  badge?: string | number;
  isActive?: boolean;
  isDisabled?: boolean;
  description?: string;
}

export interface MenuItem extends MenuItemBase {
  href?: string;
  children?: SubMenuItem[];
  isExpanded?: boolean;
  level: 1;
}

export interface SubMenuItem extends MenuItemBase {
  href?: string;
  children?: GrandChildMenuItem[];
  isExpanded?: boolean;
  level: 2;
  parentId: string;
}

export interface GrandChildMenuItem extends MenuItemBase {
  href: string;
  level: 3;
  parentId: string;
  subParentId: string;
}

export type NavigationItem = MenuItem | SubMenuItem | GrandChildMenuItem;

export interface SidebarState {
  isCollapsed: boolean;
  expandedItems: Set<string>;
  activeItem: string | null;
  hoveredItem: string | null;
}

export interface SidebarProps {
  className?: string;
  defaultCollapsed?: boolean;
  onItemClick?: (item: NavigationItem) => void;
  onToggleCollapse?: (collapsed: boolean) => void;
}

export interface MenuItemProps {
  item: NavigationItem;
  isCollapsed: boolean;
  isExpanded: boolean;
  isActive: boolean;
  isHovered: boolean;
  depth: number;
  onToggle: (itemId: string) => void;
  onHover: (itemId: string | null) => void;
  onClick: (item: NavigationItem) => void;
}

export interface AnimationConfig {
  duration: number;
  easing: string;
  stagger: number;
}

export interface UserProfile {
  name: string;
  email: string;
  avatar?: string;
  role?: string;
  status?: 'online' | 'offline' | 'away' | 'busy';
}

export interface SidebarTheme {
  background: string;
  backgroundHover: string;
  backgroundActive: string;
  text: string;
  textHover: string;
  textActive: string;
  border: string;
  accent: string;
  shadow: string;
}