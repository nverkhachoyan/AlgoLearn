import React from 'react';
import { View, Text, Button, SafeAreaView } from 'react-native';
import { useNavigation } from 'expo-router';

export default function CourseSelectionScreen() {
  const navigation = useNavigation();

  return (
    <SafeAreaView>
      <Text>Course Selection</Text>
      <Button
        title='Get Started'
        // onPress={() => navigation.navigate('signup')}
      />
    </SafeAreaView>
  );
}
