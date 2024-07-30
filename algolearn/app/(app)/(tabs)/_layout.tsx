import React from 'react';
import { Tabs, useSegments } from 'expo-router';
import Feather from '@expo/vector-icons/Feather';
import { Theme } from '@/constants/Colors';
import { useClientOnlyValue } from '@/components/useClientOnlyValue';
import useTheme from '@/hooks/useTheme';

function TabBarIcon(props: {
  name: React.ComponentProps<typeof Feather>['name'];
  color: string;
}) {
  return <Feather size={28} {...props} />;
}

export default function TabLayout() {
  const { colors } = useTheme();
  const segments = useSegments() as string[];

  const getTabBarIcon =
    (name: React.ComponentProps<typeof Feather>['name']) =>
    ({ focused }: { focused: boolean }) =>
      (
        <TabBarIcon
          name={name}
          color={focused ? 'white' : colors.tabIconDefault}
        />
      );

  // const tabBarActiveBackgroundColor = (screen: string) => {
  //   const screenKey =
  //     `tabIcon${screen}Selected` as keyof (Theme);
  //   return colors.screenKey;
  // };

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.tint,
        headerShown: useClientOnlyValue(false, true),
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: colors.tabBarBackground,
          height: 50,
          paddingVertical: 10,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.53,
          shadowRadius: 2.5,
          borderRadius: 8,
          display: segments.includes('ModuleSession') ? 'none' : 'flex',
        },
        tabBarItemStyle: {
          paddingTop: 5,
          paddingBottom: 5,
          height: 40,
          borderRadius: 8,
          marginHorizontal: 20,
        },
      }}
    >
      <Tabs.Screen
        name='index'
        options={{
          tabBarIcon: getTabBarIcon('home'),
          tabBarActiveBackgroundColor: colors.tabBarBackground,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name='explore'
        options={{
          tabBarIcon: getTabBarIcon('compass'),
          tabBarActiveBackgroundColor: colors.tabBarBackground,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name='challenges'
        options={{
          tabBarIcon: getTabBarIcon('codesandbox'),
          tabBarActiveBackgroundColor: colors.tabBarBackground,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name='feed'
        options={{
          tabBarIcon: getTabBarIcon('inbox'),
          tabBarActiveBackgroundColor: colors.tabBarBackground,
          headerShown: false,
        }}
      />
      {/* Hidden tabs */}
      <Tabs.Screen
        name='(course)'
        options={{
          headerShown: false,
          href: null,
        }}
      />
    </Tabs>
  );
}
