import { Stack } from 'expo-router';

export default function Layout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: '#f4511e',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen name='signup' options={{ headerShown: false }} />
      <Stack.Screen name='courseselection' options={{ headerShown: false }} />
      <Stack.Screen name='tooltips' options={{ headerShown: false }} />
      <Stack.Screen name='pushnotifications' options={{ headerShown: false }} />
    </Stack>
  );
}
