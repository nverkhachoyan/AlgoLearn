import { Stack } from 'expo-router';
import { AuthProvider } from '@/context/auth';

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
      initialRouteName='welcome'
    >
      <Stack.Screen name='welcome' options={{ headerShown: false }} />
      <Stack.Screen name='signup' options={{ headerShown: false }} />
      <Stack.Screen name='courseselection' options={{ headerShown: false }} />
      <Stack.Screen name='tooltips' options={{ headerShown: false }} />
      <Stack.Screen name='pushnotifications' options={{ headerShown: false }} />
    </Stack>
  );
}
