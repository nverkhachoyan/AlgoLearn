import { Slot } from 'expo-router';
import { AuthProvider } from '@/context/auth';
import { SafeAreaView } from 'react-native';
import { useColorScheme } from 'react-native';
import Colors from '@/constants/Colors';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: Colors[colorScheme ?? 'light'].background,
      }}
    >
      <AuthProvider>
        <Slot />
      </AuthProvider>
    </SafeAreaView>
  );
}
