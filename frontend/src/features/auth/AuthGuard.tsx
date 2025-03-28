import { useEffect } from 'react';
import { useSegments, useRouter, useRootNavigation } from 'expo-router';
import { useAuth } from './AuthContext';
import { Platform } from 'react-native';

const PROTECTED_ROUTE = '/(protected)/(tabs)' as const;
const AUTH_ROUTE = '/(auth)' as const;

export function AuthGuard() {
  const segments = useSegments();
  const { isAuthenticated, isLoading } = useAuth();
  const rootNavigation = useRootNavigation();
  const router = useRouter();

  useEffect(() => {
    if (!rootNavigation?.isReady || isLoading) return;

    const currentGroup = segments[0];
    const inAuthGroup = currentGroup === '(auth)';
    const inPublicGroup = currentGroup === '(public)';
    const inProtectedGroup = currentGroup === '(protected)';

    const navigateToPath = (path: typeof PROTECTED_ROUTE | typeof AUTH_ROUTE) => {
      if (Platform.OS === 'web') {
        // Use setTimeout to ensure navigation happens after the current render cycle
        setTimeout(() => {
          router.replace(path);
          // Don't use window.location.href as it causes issues with the development server
        }, 0);
      } else {
        router.replace(path);
      }
    };

    if (isAuthenticated) {
      // Redirect to protected area if user is in auth/public pages
      if (inAuthGroup || inPublicGroup) {
        navigateToPath(PROTECTED_ROUTE);
      }
    } else {
      // Redirect to auth if user tries to access protected pages
      if (inProtectedGroup) {
        navigateToPath(AUTH_ROUTE);
      }
    }
  }, [isLoading, isAuthenticated, segments, rootNavigation?.isReady]);

  return null;
}
