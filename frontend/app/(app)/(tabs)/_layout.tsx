import React from "react";
import { Tabs, useSegments } from "expo-router";
import Feather from "@expo/vector-icons/Feather";
import { useClientOnlyValue } from "@/src/components/useClientOnlyValue";
import useTheme from "@/src/hooks/useTheme";
import { TouchableOpacity, View, StyleSheet } from "react-native";
import * as Haptics from "expo-haptics";
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
    <TouchableOpacity onPress={handlePress} style={styles.tabButton}>
      <View
        style={[
          styles.tabButtonContent,
          { backgroundColor: isSelected ? backgroundColor : "transparent" },
        ]}
      >
        {children}
      </View>
    </TouchableOpacity>
  );
}

export default function TabLayout() {
  const { colors } = useTheme();

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
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: colors.tint,
          headerShown: useClientOnlyValue(false, true),
          tabBarShowLabel: false,
          tabBarStyle: {
            backgroundColor: colors.tabBarBackground,
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 50,
            paddingBottom: 2,
            borderTopStartRadius: 8,
            borderTopEndRadius: 8,
            shadowColor: "#000",
            shadowOffset: {
              width: 0,
              height: -4,
            },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 10,
            borderTopWidth: 0, // Remove default border
          },
          tabBarBackground: () => (
            <View
              style={[
                styles.tabBarBackground,
                { backgroundColor: colors.tabBarBackground },
              ]}
            />
          ),
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabButton: {
    flex: 1,
    marginTop: 10,
    borderRadius: 8,
  },
  tabButtonContent: {
    flex: 1,
    borderRadius: 8,
    padding: 4,
    alignSelf: "center",
  },
  tabBarBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
});
