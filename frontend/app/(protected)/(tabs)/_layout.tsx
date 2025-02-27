import React, { useCallback, useRef } from "react";
import { Tabs } from "expo-router";
import Feather from "@expo/vector-icons/Feather";
import { useClientOnlyValue } from "@/src/components/useClientOnlyValue";
import {
  TouchableOpacity,
  View,
  StyleSheet,
  Platform,
  useWindowDimensions,
  AccessibilityInfo,
  Animated,
  AccessibilityState,
} from "react-native";
import * as Haptics from "expo-haptics";
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "react-native-paper";
import { AppTheme } from "@/constants/Colors";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const TAB_BAR_HEIGHT = Platform.select({ web: 60, default: 20 });
const ICON_SIZE = 28;

interface TabBarIconProps {
  name: React.ComponentProps<typeof Feather>["name"];
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
  onPress,
  children,
  accessibilityState,
  tabName,
  accessibilityLabel,
}: HapticTabButtonProps | any) {
  const theme = useTheme<AppTheme>();
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
    if (Platform.OS !== "web") {
      Haptics.selectionAsync().catch(() => {
        // silently handle haptics errors
      });
    }
    onPress();

    // announce screen change for accessibility
    AccessibilityInfo.announceForAccessibility(
      `${accessibilityLabel} ${accessibilityState?.selected ? "selected" : ""}`
    );
  }, [onPress, accessibilityLabel, accessibilityState?.selected]);

  const isSelected = accessibilityState?.selected;
  const getTabColor = (tab: string) => {
    return (
      theme.colors.tabs[tab as keyof typeof theme.colors.tabs] ||
      theme.colors.tabs.default
    );
  };

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
            backgroundColor: isSelected ? getTabColor(tabName) : "transparent",
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
  const theme = useTheme<AppTheme>();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  const getTabBarIcon = useCallback(
    (name: React.ComponentProps<typeof Feather>["name"]) =>
      ({ focused }: { focused: boolean }) => (
        <TabBarIcon
          name={name}
          color={focused ? "white" : theme.colors.secondary}
        />
      ),
    [theme]
  );

  const dynamicStyles = {
    tabBar: Platform.select({
      web: {
        height: TAB_BAR_HEIGHT,
        position: "fixed" as const,
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
      },
      default: {
        paddingBottom: Math.max(insets.bottom, 2),
        height: TAB_BAR_HEIGHT + insets.bottom,
      },
    }),
  };

  const containerStyle = Platform.select({
    web: {
      ...styles.container,
      backgroundColor: theme.colors.background,
      paddingBottom: TAB_BAR_HEIGHT,
    },
    default: {
      ...styles.container,
      backgroundColor: theme.colors.background,
    },
  });

  return (
    <View style={containerStyle}>
      <Tabs
        screenOptions={{
          headerShown: useClientOnlyValue(false, true),
          headerStyle: {
            backgroundColor: theme.colors.surfaceVariant,
          },
          headerShadowVisible: false,
          tabBarShowLabel: false,
          tabBarActiveTintColor: theme.colors.primary,
          tabBarInactiveTintColor: theme.colors.onSurfaceVariant,
          tabBarStyle: {
            backgroundColor: theme.colors.surfaceVariant,
            ...dynamicStyles.tabBar,
            borderTopStartRadius: Platform.OS === "web" ? 0 : 16,
            borderTopEndRadius: Platform.OS === "web" ? 0 : 16,
            shadowColor: theme.colors.shadow,
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
            elevation: Platform.OS === "android" ? 10 : 0,
            borderTopWidth: 0,
          },
          tabBarBackground: () => (
            <View
              style={[
                styles.tabBarBackground,
                {
                  backgroundColor: theme.colors.surfaceVariant,
                  borderTopLeftRadius: Platform.OS === "web" ? 0 : 16,
                  borderTopRightRadius: Platform.OS === "web" ? 0 : 16,
                },
              ]}
            />
          ),
          freezeOnBlur: true,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            tabBarIcon: getTabBarIcon("home"),
            headerShown: false,
            tabBarButton: (props) => (
              <HapticTabButton
                tabName="home"
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
            tabBarIcon: getTabBarIcon("compass"),
            headerShown: false,
            tabBarButton: (props) => (
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
            tabBarIcon: getTabBarIcon("codesandbox"),
            headerShown: false,
            tabBarButton: (props) => (
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
                color={focused ? "white" : theme.colors.secondary}
              />
            ),
            headerShown: false,
            tabBarButton: (props) => (
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
            tabBarIcon: getTabBarIcon("inbox"),
            headerShown: false,
            tabBarButton: (props) => (
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
    marginTop: Platform.OS === "web" ? 0 : 10,
    borderRadius: 8,
    minWidth: 44,
    minHeight: 44,
  },
  tabButtonContent: {
    flex: 1,
    borderRadius: 8,
    padding: 4,
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
  },
  tabBarBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});
