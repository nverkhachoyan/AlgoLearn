import FontAwesome from '@expo/vector-icons/FontAwesome';
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { SafeAreaView, StyleSheet } from 'react-native';

import { useColorScheme } from '@/components/useColorScheme';
import globalStyles from '@/app/styles'; // Import global styles

export { ErrorBoundary } from 'expo-router';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
    'OpenSauceOne-Italic': require('../assets/fonts/OpenSauceOne-Italic.ttf'),
    'OpenSauceOne-Regular': require('../assets/fonts/OpenSauceOne-Regular.ttf'),
    'OpenSauceOne-Bold': require('../assets/fonts/OpenSauceOne-Bold.ttf'),
    'OpenSauceOne-Black': require('../assets/fonts/OpenSauceOne-Black.ttf'),
    'OpenSauceOne-Light': require('../assets/fonts/OpenSauceOne-Light.ttf'),
    'OpenSauceOne-Medium': require('../assets/fonts/OpenSauceOne-Medium.ttf'),
    'OpenSauceOne-SemiBold': require('../assets/fonts/OpenSauceOne-SemiBold.ttf'),
    'OpenSauceOne-LightItalic': require('../assets/fonts/OpenSauceOne-LightItalic.ttf'),
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
        <Stack
          initialRouteName={'index'}
          screenOptions={{ headerShown: false }}
        >
          <Stack.Screen name='modal' options={{ presentation: 'modal' }} />
        </Stack>
      </ThemeProvider>
    </SafeAreaView>
  );
}
