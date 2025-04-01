import { useEffect } from 'react';
import { useSegments, useRouter, useNavigationContainerRef } from 'expo-router';
import { useAuth } from './AuthContext';
import { Platform } from 'react-native';

const PROTECTED_ROUTE = '/(protected)/(tabs)' as const;
const AUTH_ROUTE = '/(auth)' as const;

export function AuthGuard() {
  const segments = useSegments();
  const { isAuthed, isLoading, isOnboarding } = useAuth();
  const rootNavigation = useNavigationContainerRef();
  const router = useRouter();

  useEffect(() => {
    if (!rootNavigation?.isReady() || isLoading) return;

    const currentGroup = segments[0];
    const inAuthGroup = currentGroup === '(auth)';
    const inPublicGroup = currentGroup === '(public)';

    const navigateToPath = (path: typeof PROTECTED_ROUTE | typeof AUTH_ROUTE) => {
      if (Platform.OS === 'web') {
        // Use setTimeout to ensure navigation happens after the current render cycle
        setTimeout(() => {
          router.replace(path);
        }, 0);
      } else {
        router.replace(path);
      }
    };

    if (!isAuthed) {
      navigateToPath(AUTH_ROUTE);
    } else if (!isOnboarding) {
      if (inAuthGroup || inPublicGroup) {
        navigateToPath(PROTECTED_ROUTE);
      }
    }
  }, [isLoading, isAuthed, segments, rootNavigation?.isReady]);

  return null;
}
