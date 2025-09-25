/**
 * Routes Module Index
 * Central exports for all routing functionality
 */

// Core route definitions
export {
  ROUTES,
  RouteUtils,
  routeDefinitions,
  type Route,
  type RouteCategory,
  DASHBOARD_ROUTES,
  QUESTION_BANK_ROUTES,
  EXAMINATION_ROUTES,
  STUDENT_ROUTES,
  ANALYTICS_ROUTES,
  SETTINGS_ROUTES,
  AUTH_ROUTES,
  PUBLIC_ROUTES,
} from './routes';

// Server-side utilities
export {
  RouteValidator,
  RouteBuilder,
  RouteMetadata,
  SidebarUtils,
  COMMON_ROUTES,
  ROUTE_GROUPS,
} from './server-utils';

// Client-side navigation utilities and hooks
export {
  useNavigation,
  useCurrentPath,
} from './navigation';

// Default export
export { default } from './routes';