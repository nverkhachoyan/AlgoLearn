import { Slot } from 'expo-router';
import { AuthProvider } from '@/context/AuthProvider';
import { ThemeProvider } from '@react-navigation/native';
import { DarkTheme, DefaultTheme, Theme } from '@/constants/Colors';
import { useColorScheme } from 'react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        value={
          colorScheme === 'dark'
            ? (DarkTheme as Theme)
            : (DefaultTheme as Theme)
        }
      >
        <AuthProvider>
          <Slot />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
