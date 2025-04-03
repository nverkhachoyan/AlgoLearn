import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppTheme } from '@/src/context/ThemeContext';
import { Stack } from 'expo-router';

export default function PublicLayout() {
  const { theme } = useAppTheme();
  const { colors } = theme;

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
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
        </Stack>
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
