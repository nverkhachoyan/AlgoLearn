import React from 'react';
import { View, Text, Button, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';

export default function SignUpScreen() {
  const router = useRouter();

  return (
    <SafeAreaView>
      <Text>SignUp</Text>
      <Button
        title='Get Started'
        onPress={() => router.navigate('(onboarding)/pushnotifications')}
      />
    </SafeAreaView>
  );
}
