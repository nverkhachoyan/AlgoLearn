import React, { useEffect } from "react";
import { Tabs, useSegments, router } from "expo-router";
import Feather from "@expo/vector-icons/Feather";
import { Theme } from "@/constants/Colors";
import { useClientOnlyValue } from "@/components/useClientOnlyValue";
import useTheme from "@/hooks/useTheme";
import { TouchableOpacity, View } from "react-native";
import * as Haptics from "expo-haptics";
import { useAuthContext } from "@/context/AuthProvider";
import { MaterialIcons } from "@expo/vector-icons";

function TabBarIcon(props: {
  name: React.ComponentProps<typeof Feather>["name"];
  color: string;
}) {
  return <Feather size={28} {...props} />;
}

function HapticTabButton({
  onPress,
  children,
  accessibilityState,
  backgroundColor,
}: any) {
  const handlePress = () => {
    Haptics.selectionAsync();
    onPress();
  };

  const isSelected = accessibilityState.selected;

  return (
    <TouchableOpacity
      onPress={handlePress}
      style={{
        flex: 1,
        paddingTop: 5,
        paddingBottom: 5,
        borderRadius: 8,
        marginHorizontal: 20,
      }}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: isSelected ? backgroundColor : "transparent",
          borderRadius: 8,
        }}
      >
        {children}
      </View>
    </TouchableOpacity>
  );
}

export default function TabLayout() {
  const { colors } = useTheme();
  const segments = useSegments() as string[];

  const { isAuthed, checkAuthState } = useAuthContext(); // Use your AuthContext

  const getTabBarIcon =
    (name: React.ComponentProps<typeof Feather>["name"]) =>
    ({ focused }: { focused: boolean }) => (
      <TabBarIcon
        name={name}
        color={focused ? "white" : colors.tabIconDefault}
      />
    );

  const tabBarActiveBackgroundColor = (screen: string) => {
    const screenKey = `tabIcon${screen}Selected` as keyof typeof colors;
    return colors[screenKey];
  };

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.tint,
        headerShown: useClientOnlyValue(false, true),
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: colors.tabBarBackground,
          marginBottom: -30,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -7 },
          shadowOpacity: 0.05,
          shadowRadius: 3.84,
          borderTopStartRadius: 8,
          borderTopEndRadius: 8,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: getTabBarIcon("home"),
          headerShown: false,
          tabBarButton: (props) => (
            <HapticTabButton
              {...props}
              backgroundColor={tabBarActiveBackgroundColor("Home")}
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
              {...props}
              backgroundColor={tabBarActiveBackgroundColor("Explore")}
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
              {...props}
              backgroundColor={tabBarActiveBackgroundColor("Challenges")}
            >
              {props.children}
            </HapticTabButton>
          ),
        }}
      />
      <Tabs.Screen
        name="leaderboard"
        options={{
          tabBarIcon: () => (
            <MaterialIcons
              name="leaderboard"
              size={28}
              color={colors.tabIconDefault}
            />
          ),
          headerShown: false,
          tabBarButton: (props) => (
            <HapticTabButton
              {...props}
              backgroundColor={tabBarActiveBackgroundColor("Challenges")}
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
              {...props}
              backgroundColor={tabBarActiveBackgroundColor("Feed")}
            >
              {props.children}
            </HapticTabButton>
          ),
        }}
      />
    </Tabs>
  );
}
