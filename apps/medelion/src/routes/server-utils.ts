/**
 * Server-side Route Utilities
 * Route utilities that can be used on the server side
 */

import { ROUTES, RouteUtils, routeDefinitions, type Route } from './routes';

/**
 * Route validation utilities (server-safe)
 */
export const RouteValidator = {
  /**
   * Validate if a route path exists
   */
  isValidRoute: (path: string): boolean => {
    return routeDefinitions.some(route => route.path === path);
  },

  /**
   * Validate if a route requires authentication
   */
  requiresAuthentication: (path: string): boolean => {
    return RouteUtils.requiresAuth(path);
  },

  /**
   * Check if user has permission to access route
   */
  hasPermission: (path: string, userRoles: string[] = []): boolean => {
    return RouteUtils.hasAccess(path, userRoles);
  },

  /**
   * Get route constraints
   */
  getRouteConstraints: (path: string): {
    requiresAuth: boolean;
    allowedRoles: string[];
    category: string | undefined;
  } => {
    const route = routeDefinitions.find(r => r.path === path);
    return {
      requiresAuth: route?.requiresAuth ?? false,
      allowedRoles: route?.roles ?? [],
      category: route?.category,
    };
  },
};

/**
 * Route builder utilities for dynamic routes (server-safe)
 */
export const RouteBuilder = {
  /**
   * Build student profile route
   */
  studentProfile: (studentId: string) => ROUTES.STUDENTS.PROFILE(studentId),

  /**
   * Build exam edit route
   */
  examEdit: (examId: string) => ROUTES.EXAMINATIONS.EDIT(examId),

  /**
   * Build exam results route
   */
  examResults: (examId: string) => ROUTES.EXAMINATIONS.RESULTS.DETAILED(examId),

  /**
   * Build student exam result route
   */
  studentExamResult: (examId: string, studentId: string) => 
    ROUTES.EXAMINATIONS.RESULTS.STUDENT(examId, studentId),

  /**
   * Build question bank edit route
   */
  questionEdit: (questionId: string) => ROUTES.QUESTION_BANK.EDIT(questionId),

  /**
   * Build group edit route
   */
  groupEdit: (groupId: string) => ROUTES.STUDENTS.GROUPS.EDIT(groupId),

  /**
   * Build student performance route
   */
  studentPerformance: (studentId: string) => 
    ROUTES.STUDENTS.PERFORMANCE.INDIVIDUAL(studentId),
};

/**
 * Route metadata utilities (server-safe)
 */
export const RouteMetadata = {
  /**
   * Get route title for page head
   */
  getTitle: (path: string): string => {
    const route = routeDefinitions.find(r => r.path === path);
    return route?.title ?? 'Examino';
  },

  /**
   * Get route description for meta tags
   */
  getDescription: (path: string): string => {
    const route = routeDefinitions.find(r => r.path === path);
    return route?.description ?? 'Educational examination platform';
  },

  /**
   * Get route category
   */
  getCategory: (path: string): string | undefined => {
    const route = routeDefinitions.find(r => r.path === path);
    return route?.category;
  },

  /**
   * Generate page metadata for Next.js
   */
  generateMetadata: (path: string) => ({
    title: RouteMetadata.getTitle(path),
    description: RouteMetadata.getDescription(path),
  }),
};

/**
 * Sidebar navigation utilities (server-safe)
 */
export const SidebarUtils = {
  /**
   * Get active menu item based on current path
   */
  getActiveMenuItem: (currentPath: string, menuItems: any[]): string | null => {
    // Exact match first
    for (const item of menuItems) {
      if (item.href === currentPath) {
        return item.id;
      }
      
      // Check children recursively
      if (item.children) {
        const activeChild = SidebarUtils.getActiveMenuItem(currentPath, item.children);
        if (activeChild) {
          return activeChild;
        }
      }
    }
    
    // Partial match for parent routes
    for (const item of menuItems) {
      if (item.href && currentPath.startsWith(item.href) && item.href !== '/dashboard') {
        return item.id;
      }
    }
    
    return null;
  },

  /**
   * Get expanded menu items based on current path
   */
  getExpandedItems: (currentPath: string, menuItems: any[]): Set<string> => {
    const expanded = new Set<string>();
    
    const findAndExpand = (items: any[], path: string[]): boolean => {
      for (const item of items) {
        const newPath = [...path, item.id];
        
        if (item.href === currentPath) {
          // Expand all parent items
          path.forEach(id => expanded.add(id));
          return true;
        }
        
        if (item.children) {
          if (findAndExpand(item.children, newPath)) {
            expanded.add(item.id);
            return true;
          }
        }
        
        // Partial match for parent routes
        if (item.href && currentPath.startsWith(item.href) && item.href !== '/dashboard') {
          path.forEach(id => expanded.add(id));
          expanded.add(item.id);
          return true;
        }
      }
      
      return false;
    };
    
    findAndExpand(menuItems, []);
    return expanded;
  },
};

/**
 * Route constants for commonly used paths (server-safe)
 */
export const COMMON_ROUTES = {
  HOME: ROUTES.DASHBOARD.ROOT,
  LOGIN: ROUTES.AUTH.LOGIN,
  PROFILE: ROUTES.SETTINGS.ACCOUNT.ROOT,
  HELP: ROUTES.PUBLIC.HELP,
} as const;

/**
 * Route groups for easier management (server-safe)
 */
export const ROUTE_GROUPS = {
  AUTHENTICATION: [
    ROUTES.AUTH.LOGIN,
    ROUTES.AUTH.REGISTER,
    ROUTES.AUTH.FORGOT_PASSWORD,
    ROUTES.AUTH.RESET_PASSWORD,
    ROUTES.AUTH.VERIFY_EMAIL,
  ],
  
  PUBLIC: [
    ROUTES.PUBLIC.HOME,
    ROUTES.PUBLIC.ABOUT,
    ROUTES.PUBLIC.PRICING,
    ROUTES.PUBLIC.CONTACT,
    ROUTES.PUBLIC.PRIVACY,
    ROUTES.PUBLIC.TERMS,
    ROUTES.PUBLIC.HELP,
  ],
  
  DASHBOARD: [
    ROUTES.DASHBOARD.ROOT,
    ROUTES.QUESTION_BANK.ROOT,
    ROUTES.EXAMINATIONS.ROOT,
    ROUTES.STUDENTS.ROOT,
    ROUTES.ANALYTICS.ROOT,
    ROUTES.SETTINGS.ROOT,
  ],
  
  SETTINGS: [
    ROUTES.SETTINGS.ROOT,
    ROUTES.SETTINGS.GENERAL,
    ROUTES.SETTINGS.ACCOUNT.ROOT,
    ROUTES.SETTINGS.NOTIFICATIONS.ROOT,
    ROUTES.SETTINGS.SECURITY.ROOT,
  ],
} as const;

export {
  ROUTES,
  RouteUtils,
  routeDefinitions,
  type Route,
};