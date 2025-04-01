import { useState, useEffect } from 'react';
import { Stack } from 'expo-router';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from 'react-native-paper';
import { useSegments } from 'expo-router';
import { AppTheme, TabGradients, TabName } from '@/constants/Colors';
import { LinearGradient } from 'expo-linear-gradient';
import Conditional from '@/src/components/Conditional';

export default function ProtectedLayout() {
  const theme = useTheme<AppTheme>();
  const segments = useSegments();
  const [activeTab, setActiveTab] = useState<TabName>('index');

  const tabMapping: Record<string, TabName> = {
    '(tabs)': 'index',
    explore: 'explore',
    challenges: 'challenges',
    leaderboard: 'leaderboard',
    feed: 'feed',
  };

  useEffect(() => {
    if (segments.length > 0) {
      const lastSegment = segments[segments.length - 1];
      if (lastSegment in tabMapping) {
        setActiveTab(tabMapping[lastSegment as keyof typeof tabMapping]);
      }
    }
  }, [segments]);

  const getCurrentGradientColors = () => {
    return theme.dark ? TabGradients[activeTab].dark : TabGradients[activeTab].light;
  };

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView edges={['left', 'right']} style={{ flex: 1 }}>
        <View style={{ flex: 1, backgroundColor: '#333333' }}>
          <Stack screenOptions={{ headerShown: false }} />
        </View>
      </SafeAreaView>

      <Conditional
        condition={segments[segments.length - 1] in tabMapping}
        renderTrue={() => (
          <LinearGradient
            colors={getCurrentGradientColors()}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <SafeAreaView
              edges={['bottom']}
              style={{
                flex: 0,
              }}
            />
          </LinearGradient>
        )}
        renderFalse={null}
      />
    </View>
  );
}
