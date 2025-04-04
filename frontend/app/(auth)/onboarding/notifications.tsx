import React from 'react';
import { StyleSheet, Pressable, TouchableOpacity, ScrollView } from 'react-native';
import { Text } from '@/src/components/ui';
import { useAppTheme } from '@/src/context/ThemeContext';
import Button from '@/src/components/Button';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '@/src/features/auth/AuthContext';

export default function PushNotifications() {
  const { setIsOnboarding } = useAuth();
  const { theme } = useAppTheme();
  const { colors } = theme;

  const handleNotNow = async () => {
    await setIsOnboarding(false);
    router.navigate('/(protected)/(tabs)');
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <Pressable style={styles.goBackButton} onPress={() => router.back()}>
        <Feather name="arrow-left" size={24} color={colors.onSurface} />
      </Pressable>
      <Text variant="headline" style={[styles.title, { color: colors.onSurface }]}>
        Turn on notifications
      </Text>

      <Text style={[styles.description, { color: colors.onSurface }]}>
        Get daily reminders to learn programming with our lessons.
      </Text>
      <Button
        title="Turn on notifications"
        onPress={() => {
          console.log('turn on notifications');
        }}
        style={{
          backgroundColor: colors.background,
        }}
        textStyle={{ color: colors.onSurface }}
      />
      <TouchableOpacity onPress={handleNotNow}>
        <Text style={[styles.dismissButton, { color: colors.secondary }]}>Not now</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingLeft: 25,
    paddingRight: 25,
  },
  goBackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    top: 20,
    left: 0,
    zIndex: 1,
  },
  titleContainer: {
    marginTop: 100,
    marginBottom: 30,
  },
  buttonContainer: {
    marginTop: 30,
    marginBottom: 30,
  },
  middleContent: {
    flex: 1,
    justifyContent: 'center',
    marginTop: 30,
    marginBottom: 30,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    textAlign: 'left',
    marginTop: 70,
    marginBottom: 30,
  },
  textInput: {
    height: 45,
    padding: 10,
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 16,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  line: {
    height: 1,
    flex: 1,
  },
  orText: {
    marginHorizontal: 10,
    fontSize: 16,
  },
  description: {
    marginBottom: 20,
    fontSize: 16,
  },
  dismissButton: {
    alignSelf: 'center',
    marginVertical: 20,
    fontSize: 14,
  },
});
