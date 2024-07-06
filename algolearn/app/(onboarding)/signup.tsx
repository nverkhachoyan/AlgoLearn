import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  Button as NativeButton,
} from 'react-native';
import { router } from 'expo-router';
import Button from '@/components/common/Button';
import { Feather } from '@expo/vector-icons';
import { makeRedirectUri, useAuthRequest } from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';

WebBrowser.maybeCompleteAuthSession();
const discovery = {
  authorizationEndpoint: 'https://accounts.google.com/o/oauth2/auth',
  tokenEndpoint: 'https://accounts.google.com/o/oauth2/token',
};

export default function SignUp() {
  const [request, response, promptAsync] = useAuthRequest(
    {
      clientId:
        '1034845450379-vo4m62lpqpftk16lepikv1met279g061.apps.googleusercontent.com',
      // There are no scopes so just pass an empty array
      scopes: ['email'],
      redirectUri: makeRedirectUri({
        scheme: 'http://localhost:8080/callback/google',
      }),
    },
    discovery
  );

  React.useEffect(() => {
    if (response?.type === 'success') {
      const { code } = response.params;
    }
  }, [response]);

  return (
    <ScrollView style={styles.container}>
      <Pressable style={styles.goBackButton} onPress={() => router.back()}>
        <Feather name='arrow-left' size={24} color='black' />
      </Pressable>
      <Text style={styles.title}>Log in or sign up to AlgoLearn</Text>
      <View style={styles.middleContent}>
        <TextInput style={styles.textInput} placeholder='Email' />
        <Button
          title='Continue'
          onPress={() => router.navigate('(onboarding)/signup')}
          icon={{ name: 'arrow-right', position: 'right' }}
          iconStyle={{ position: 'absolute', right: 12 }}
        />
      </View>
      <NativeButton
        disabled={!request}
        title='Login'
        onPress={() => {
          promptAsync();
        }}
      />
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
            type: 'png',
            src: require('@/assets/icons/google.png'),
          }}
          iconStyle={{ width: 20, height: 20 }}
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
