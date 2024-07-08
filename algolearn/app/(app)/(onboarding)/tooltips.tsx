import React from 'react';
import { View, Text, Button, SafeAreaView } from 'react-native';
import { useNavigation } from 'expo-router';

export default function TooltipsScreen() {
  const navigation = useNavigation();

  return (
    <SafeAreaView>
      <Text>Master programming with bite-sized content</Text>
      <Button
        title='Get Started'
        // onPress={() => navigation.navigate('signup')}
      />
    </SafeAreaView>
  );
}
