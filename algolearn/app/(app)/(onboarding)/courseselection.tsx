import React from 'react';
import { View, Text, Button, SafeAreaView } from 'react-native';
import { router } from 'expo-router';

export default function CourseSelectionScreen() {
  return (
    <SafeAreaView>
      <Text>Course Selection</Text>
      <Button title='Get Started' onPress={() => router.navigate('(tabs)')} />
    </SafeAreaView>
  );
}
