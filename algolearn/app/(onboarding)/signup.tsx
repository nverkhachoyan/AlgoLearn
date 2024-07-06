import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
} from 'react-native';
import { router } from 'expo-router';
import Button from '@/components/common/Button';
import { Feather } from '@expo/vector-icons';

export default function SignUp() {
  return (
    <ScrollView style={styles.container}>
      <Pressable style={styles.goBackButton} onPress={() => router.back()}>
        <Feather name='arrow-left' size={24} color='black' />
      </Pressable>

      <Text style={styles.title}>Log in or sign up to AlgoLearn</Text>

      <View style={styles.middleContent}>
        <TextInput style={styles.textInput} placeholder='Email' />
        <Button
          title='Get Started'
          onPress={() => router.navigate('(onboarding)/signup')}
          icon={{ name: 'arrow-right', position: 'right' }}
        />
      </View>
      <View style={styles.dividerContainer}>
        <View style={styles.line} />
        <Text style={styles.orText}>or</Text>
        <View style={styles.line} />
      </View>
      <View style={styles.buttonContainer}>
        <Button
          title='Continue with Google'
          onPress={() => console.log('Continue with Google')}
          icon={{
            name: 'google',
            position: 'left',
            size: 20,
            color: 'blue',
            type: 'fontawesome',
          }}
          style={{
            backgroundColor: '#fff',
            borderColor: '#555',
            borderWidth: 1,
          }}
          textStyle={{ color: 'black' }}
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
    backgroundColor: '#fff',
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
    borderColor: '#333',
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
    backgroundColor: '#333',
  },
  orText: {
    marginHorizontal: 10,
    fontSize: 16,
    color: '#333',
  },
});
