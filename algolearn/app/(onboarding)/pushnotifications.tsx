import React from 'react';
import { View, Text, Button, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';

export default function Welcome() {
  const router = useRouter();

  return (
    <SafeAreaView>
      <Text>Push Notifications</Text>
      <Button
        title='Get Started'
        onPress={() => router.navigate('(onboarding)/courseselection')}
      />
    </SafeAreaView>
  );
}