import FontAwesome from '@expo/vector-icons/FontAwesome';
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useState, useEffect } from 'react';
import 'react-native-reanimated';
import { SafeAreaView, StyleSheet } from 'react-native';

import { useColorScheme } from '@/components/useColorScheme';
import globalStyles from '@/app/(app)/styles'; // Import global styles
import { useAuthContext } from '@/context/auth';

import React, { useRef } from 'react';
import { View, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, Redirect, Slot } from 'expo-router';
import LottieView from 'lottie-react-native';
import Button from '@/components/common/Button';

export { ErrorBoundary } from 'expo-router';

SplashScreen.preventAutoHideAsync();

export default function Layout() {
  const colorScheme = useColorScheme();
  const [loaded, error] = useFonts({
    SpaceMono: require('@/assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
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
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <SafeAreaView style={globalStyles.container}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name='(tabs)' />
          <Stack.Screen name='modal' options={{ presentation: 'modal' }} />
        </Stack>
      </ThemeProvider>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingLeft: 25,
    paddingRight: 25,
    backgroundColor: '#fff',
  },
  middleContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 200,
    height: 200,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 16,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
  },
  italic: {
    fontStyle: 'italic',
  },
  buttonContainer: {
    width: '100%',
    justifyContent: 'center',
  },
});
