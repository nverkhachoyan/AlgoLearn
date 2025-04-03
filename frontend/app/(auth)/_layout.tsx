import { View } from 'react-native';
import { Stack } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppTheme } from '@/src/context/ThemeContext';

export default function AuthLayout() {
  const { theme } = useAppTheme();
  const { colors }: { colors: Colors } = theme;

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView
        edges={['top']}
        style={{
          flex: 0,
          backgroundColor: colors.background,
        }}
      />
      <SafeAreaView edges={['left', 'right']} style={{ flex: 1 }}>
        <Stack screenOptions={{ headerShown: false }} />
      </SafeAreaView>
      <SafeAreaView
        edges={['bottom']}
        style={{
          flex: 0,
          backgroundColor: colors.background,
        }}
      />
    </View>
  );
}
