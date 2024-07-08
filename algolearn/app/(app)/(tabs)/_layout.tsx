import React, { useEffect } from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Feather from '@expo/vector-icons/Feather';
import { Link, Tabs } from 'expo-router';
import { Pressable } from 'react-native';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useClientOnlyValue } from '@/components/useClientOnlyValue';
import { useAuthContext } from '@/context/auth';
import { router } from 'expo-router';

function TabBarIcon(props: {
  name: React.ComponentProps<typeof Feather>['name'];
  color: string;
}) {
  return <Feather size={28} {...props} />;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { user, loading } = useAuthContext();

  useEffect(() => {
    if (!loading && !user) {
      router.navigate('welcome');
    }
  }, [loading, user]);

  const getTabBarIcon =
    (name: React.ComponentProps<typeof Feather>['name']) =>
    ({ focused }: { focused: boolean }) =>
      (
        <TabBarIcon
          name={name}
          color={
            focused ? 'white' : Colors[colorScheme ?? 'light'].tabIconDefault
          }
        />
      );

  const tabBarActiveBackgroundColor = (screen: string) => {
    const screenKey =
      `tabIcon${screen}Selected` as keyof (typeof Colors)['light'];
    return Colors[colorScheme ?? 'light'][screenKey];
  };

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: useClientOnlyValue(false, true),
        tabBarShowLabel: false,
        tabBarStyle: {
          height: 40,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.53,
          shadowRadius: 2.5,
          borderRadius: 8,
        },
        tabBarItemStyle: {
          paddingTop: 5,
          paddingBottom: 5,
          height: 40,
        },
      }}
    >
      <Tabs.Screen
        name='index'
        options={{
          tabBarIcon: getTabBarIcon('home'),
          tabBarActiveBackgroundColor: tabBarActiveBackgroundColor('Home'),
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name='explore'
        options={{
          tabBarIcon: getTabBarIcon('compass'),
          tabBarActiveBackgroundColor: tabBarActiveBackgroundColor('Explore'),
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name='challenges'
        options={{
          tabBarIcon: getTabBarIcon('codesandbox'),
          tabBarActiveBackgroundColor:
            tabBarActiveBackgroundColor('Challenges'),
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name='inbox'
        options={{
          tabBarIcon: getTabBarIcon('inbox'),
          tabBarActiveBackgroundColor: tabBarActiveBackgroundColor('Inbox'),
          headerShown: false,
        }}
      />
    </Tabs>
  );
}
