import React, { useCallback, useRef } from 'react';
import { Tabs } from 'expo-router';
import Feather from '@expo/vector-icons/Feather';
import { useClientOnlyValue } from '@/src/components/useClientOnlyValue';
import {
  TouchableOpacity,
  View,
  StyleSheet,
  Platform,
  AccessibilityInfo,
  Animated,
  AccessibilityState,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { MaterialIcons } from '@expo/vector-icons';
import { useAppTheme } from '@/src/context/ThemeContext';
import { AppTheme, HeaderAndTabs } from '@/constants/Colors';

const ICON_SIZE = 28;

interface TabBarIconProps {
  name: React.ComponentProps<typeof Feather>['name'];
  color: string;
  size?: number;
}

interface HapticTabButtonProps {
  onPress: () => void;
  children: React.ReactNode;
  accessibilityState?: AccessibilityState;
  tabName: string;
  accessibilityLabel: string;
}

function TabBarIcon({ name, color, size = ICON_SIZE }: TabBarIconProps) {
  return <Feather size={size} name={name} color={color} />;
}

function HapticTabButton({
  style,
  isActive,
  to,
  onPress,
  children,
  accessibilityState,
  tabName,
  accessibilityLabel,
}: HapticTabButtonProps | any) {
  const { theme } = useAppTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const handlePress = useCallback(() => {
    if (Platform.OS !== 'web') {
      Haptics.selectionAsync().catch(() => {
        // silently handle haptics errors
      });
    }
    onPress();

    // announce screen change for accessibility
    AccessibilityInfo.announceForAccessibility(
      `${accessibilityLabel} ${accessibilityState?.selected ? 'selected' : ''}`
    );
  }, [onPress, accessibilityLabel, accessibilityState?.selected]);

  const isSelected = accessibilityState?.selected;
  const getTabColor = (tab: string) => '#333';

  return (
    <TouchableOpacity
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={styles.tabButton}
      accessibilityRole="tab"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={accessibilityState}
    >
      <Animated.View
        style={[
          styles.tabButtonContent,
          {
            backgroundColor: isSelected ? getTabColor(tabName) : 'transparent',
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {children}
      </Animated.View>
    </TouchableOpacity>
  );
}

export default function TabLayout() {
  const { theme } = useAppTheme();
  const { colors } = theme;
  const dark = theme.dark;

  const bgColor = HeaderAndTabs[dark ? 'dark' : 'light'];

  const getTabBarIcon = useCallback(
    (name: React.ComponentProps<typeof Feather>['name']) =>
      ({ focused }: { focused: boolean }) => (
        <TabBarIcon name={name} color={focused ? 'white' : colors.secondary} />
      ),
    [colors]
  );

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      <Tabs
        screenOptions={{
          headerShown: useClientOnlyValue(false, true),
          headerStyle: {
            backgroundColor: colors.surfaceVariant,
          },
          headerShadowVisible: false,
          tabBarShowLabel: false,
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.onSurfaceVariant,
          tabBarStyle: {
            marginBottom: 5,
            backgroundColor: bgColor,
            borderTopStartRadius: Platform.OS === 'web' ? 0 : 16,
            borderTopEndRadius: Platform.OS === 'web' ? 0 : 16,
            shadowColor: colors.shadow,
            shadowOffset: Platform.select({
              ios: {
                width: 0,
                height: -4,
              },
              android: {
                width: 0,
                height: 2,
              },
              web: {
                width: 0,
                height: -2,
              },
            }),
            shadowOpacity: 0.5,
            shadowRadius: 8,
            elevation: Platform.OS === 'android' ? 10 : 0,
            borderTopWidth: 0,
          },

          freezeOnBlur: true,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            tabBarIcon: getTabBarIcon('home'),
            headerShown: false,
            tabBarButton: props => (
              <HapticTabButton
                tabName="index"
                accessibilityLabel="Home tab"
                accessibilityState={props.accessibilityState}
                {...props}
              >
                {props.children}
              </HapticTabButton>
            ),
          }}
        />
        <Tabs.Screen
          name="explore"
          options={{
            tabBarIcon: getTabBarIcon('compass'),
            headerShown: false,
            tabBarButton: props => (
              <HapticTabButton
                tabName="explore"
                accessibilityLabel="Explore tab"
                accessibilityState={props.accessibilityState}
                {...props}
              >
                {props.children}
              </HapticTabButton>
            ),
          }}
        />
        <Tabs.Screen
          name="challenges"
          options={{
            tabBarIcon: getTabBarIcon('codesandbox'),
            headerShown: false,
            tabBarButton: props => (
              <HapticTabButton
                tabName="challenges"
                accessibilityLabel="Challenges tab"
                accessibilityState={props.accessibilityState}
                {...props}
              >
                {props.children}
              </HapticTabButton>
            ),
          }}
        />
        <Tabs.Screen
          name="leaderboard"
          options={{
            tabBarIcon: ({ focused }) => (
              <MaterialIcons
                name="leaderboard"
                size={ICON_SIZE}
                color={focused ? 'white' : colors.secondary}
              />
            ),
            headerShown: false,
            tabBarButton: props => (
              <HapticTabButton
                tabName="leaderboard"
                accessibilityLabel="Leaderboard tab"
                accessibilityState={props.accessibilityState}
                {...props}
              >
                {props.children}
              </HapticTabButton>
            ),
          }}
        />
        <Tabs.Screen
          name="feed"
          options={{
            tabBarIcon: getTabBarIcon('inbox'),
            headerShown: false,
            tabBarButton: props => (
              <HapticTabButton
                tabName="feed"
                accessibilityLabel="Feed tab"
                accessibilityState={props.accessibilityState}
                {...props}
              >
                {props.children}
              </HapticTabButton>
            ),
          }}
        />
      </Tabs>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabButton: {
    flex: 1,
    marginTop: Platform.OS === 'web' ? 0 : 10,
    borderRadius: 8,
  },
  tabButtonContent: {
    flex: 1,
    borderRadius: 8,
    padding: 4,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
