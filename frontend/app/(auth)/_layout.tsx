import { View } from 'react-native';
import { useTheme } from 'react-native-paper';
import { Stack } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AuthLayout() {
  const { colors }: { colors: Colors } = useTheme();

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
