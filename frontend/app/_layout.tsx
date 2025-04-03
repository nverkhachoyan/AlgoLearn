import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { Platform, AppState, StyleSheet, View } from 'react-native';
import { QueryClientProvider, focusManager } from '@tanstack/react-query';
import { RootSiblingParent } from 'react-native-root-siblings';
import { useFonts } from 'expo-font';
import { FontAwesome6 } from '@expo/vector-icons';
import { SplashScreen } from 'expo-router';
import { ThemeProvider, useAppTheme } from '@/src/context/ThemeContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { AuthGuard } from '@/src/features/auth/AuthGuard';
import { AuthProvider } from '@/src/features/auth/AuthContext';
import { queryClient } from '@/src/lib/react-query/queryClient';
import { PostHogProvider } from 'posthog-react-native';

const isBrowser = Platform.OS === 'web';
const isNative = Platform.OS !== 'web';

// Only use PostHog in browser or native environments
const canUsePostHog = isBrowser || isNative;

focusManager.setEventListener(handleFocus => {
  const subscription = AppState.addEventListener('change', state => {
    handleFocus(state === 'active');
  });
  return () => subscription.remove();
});

function SafePostHogProvider({ children }: { children: React.ReactNode }) {
  if (canUsePostHog) {
    return (
      <PostHogProvider
        apiKey={process.env.EXPO_PUBLIC_POSTHOG_API_KEY}
        options={{
          host: process.env.EXPO_PUBLIC_POSTHOG_HOST,
        }}
      >
        {children}
      </PostHogProvider>
    );
  }

  return <>{children}</>;
}

function AppContent() {
  const { theme } = useAppTheme();

  const [fontsLoaded, error] = useFonts({
    SpaceMono: require('@/assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome6.font,
    'OpenSauceOne-Italic': require('@/assets/fonts/OpenSauceOne-Italic.ttf'),
    'OpenSauceOne-Regular': require('@/assets/fonts/OpenSauceOne-Regular.ttf'),
    'OpenSauceOne-Bold': require('@/assets/fonts/OpenSauceOne-Bold.ttf'),
    'OpenSauceOne-Black': require('@/assets/fonts/OpenSauceOne-Black.ttf'),
    'OpenSauceOne-Light': require('@/assets/fonts/OpenSauceOne-Light.ttf'),
    'OpenSauceOne-Medium': require('@/assets/fonts/OpenSauceOne-Medium.ttf'),
    'OpenSauceOne-SemiBold': require('@/assets/fonts/OpenSauceOne-SemiBold.ttf'),
    'OpenSauceOne-LightItalic': require('@/assets/fonts/OpenSauceOne-LightItalic.ttf'),
  });

  useEffect(() => {
    if (error) console.error('Error loading fonts:', error);
  }, [error]);

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <StatusBar style={theme.dark ? 'light' : 'dark'} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <RootSiblingParent>
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
          <StatusBar style={theme.dark ? 'light' : 'dark'} />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(public)" />
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(protected)" />
          </Stack>
        </View>
      </RootSiblingParent>
    </SafeAreaProvider>
  );
}

export default function RootLayout() {
  return (
    <SafePostHogProvider>
      <ThemeProvider>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <AuthGuard />
            <AppContent />
          </AuthProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </SafePostHogProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
