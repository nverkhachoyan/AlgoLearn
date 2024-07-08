import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import Button from '@/components/common/Button';
import { Feather } from '@expo/vector-icons';
import { useAuthContext } from '@/context/auth';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';

export default function SignUp() {
  const router = useRouter();
  const { isAuthed } = useAuthContext();
  const { signInWithGoogle } = useAuthContext();
  const colorScheme = useColorScheme();

  useEffect(() => {
    if (isAuthed) {
      router.navigate('pushnotifications');
    }
  }, [isAuthed]);

  return (
    <ScrollView
      style={[
        styles.container,
        { backgroundColor: Colors[colorScheme ?? 'light'].background },
      ]}
    >
      <Pressable style={styles.goBackButton} onPress={() => router.back()}>
        <Feather
          name='arrow-left'
          size={24}
          color={Colors[colorScheme ?? 'light'].text}
        />
      </Pressable>
      <Text
        style={[styles.title, { color: Colors[colorScheme ?? 'light'].text }]}
      >
        Log in or sign up to AlgoLearn
      </Text>
      <View style={styles.middleContent}>
        <TextInput
          style={[
            styles.textInput,
            {
              borderColor: Colors[colorScheme ?? 'light'].border,
              color: Colors[colorScheme ?? 'light'].text,
            },
          ]}
          placeholder='Email'
          placeholderTextColor={Colors[colorScheme ?? 'light'].placeholderText}
        />
        <Button
          title='Continue'
          onPress={() => router.navigate('(onboarding)/signup')}
          icon={{ name: 'arrow-right', position: 'right' }}
          textStyle={{ color: Colors[colorScheme ?? 'light'].buttonText }}
          iconStyle={{
            position: 'absolute',
            right: 12,
            color: Colors[colorScheme ?? 'light'].buttonText,
          }}
          style={{
            backgroundColor: Colors[colorScheme ?? 'light'].buttonBackground,
          }}
        />
      </View>
      <View style={styles.dividerContainer}>
        <View
          style={[
            styles.line,
            { backgroundColor: Colors[colorScheme ?? 'light'].text },
          ]}
        />
        <Text
          style={[
            styles.orText,
            { color: Colors[colorScheme ?? 'light'].text },
          ]}
        >
          or
        </Text>
        <View
          style={[
            styles.line,
            { backgroundColor: Colors[colorScheme ?? 'light'].text },
          ]}
        />
      </View>
      <View style={styles.buttonContainer}>
        <Button
          title='Continue with Google'
          onPress={signInWithGoogle}
          icon={{
            name: 'google',
            position: 'left',
            type: 'png',
            src: require('@/assets/icons/google.png'),
          }}
          iconStyle={{ width: 20, height: 20 }}
          style={{
            backgroundColor:
              colorScheme ?? 'light' === 'light' ? 'white' : 'black',
            borderColor: Colors[colorScheme ?? 'light'].border,
            borderWidth: 1,
          }}
          textStyle={{
            color: '#666',
          }}
        />
      </View>
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
    fontFamily: 'OpenSauceOne-SemiBold',
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
});
