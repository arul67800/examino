'use client';

/**
 * Client-side Navigation Utilities
 * React hooks and client-side navigation helpers
 */

import { useRouter, usePathname } from 'next/navigation';
import { useCallback, useMemo } from 'react';
import { RouteUtils, type Route } from './routes';

/**
 * Custom hook for enhanced navigation (client-side only)
 */
export const useNavigation = () => {
  const router = useRouter();
  const pathname = usePathname();

  const navigateTo = useCallback((path: string) => {
    router.push(path);
  }, [router]);

  const navigateBack = useCallback(() => {
    router.back();
  }, [router]);

  const navigateForward = useCallback(() => {
    router.forward();
  }, [router]);

  const isCurrentRoute = useCallback((path: string) => {
    return pathname === path;
  }, [pathname]);

  const isRouteActive = useCallback((path: string, exact = true) => {
    if (exact) {
      return pathname === path;
    }
    return pathname.startsWith(path);
  }, [pathname]);

  const getCurrentRoute = useMemo((): Route | undefined => {
    return RouteUtils.getRouteByName(pathname);
  }, [pathname]);

  const getBreadcrumbs = useMemo(() => {
    return RouteUtils.getBreadcrumbs(pathname);
  }, [pathname]);

  return {
    navigateTo,
    navigateBack,
    navigateForward,
    isCurrentRoute,
    isRouteActive,
    getCurrentRoute,
    getBreadcrumbs,
    currentPath: pathname,
    router,
  };
};

/**
 * Hook for getting current pathname (client-side only)
 */
export const useCurrentPath = () => {
  return usePathname();
};