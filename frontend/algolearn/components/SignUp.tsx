import { router } from 'expo-router';
import { Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useSession } from '@/contexts/ctx';
import { useState } from 'react';
import { ThemedText } from '@/components/ThemedText';
import Animated, {
  useSharedValue,
  withSpring,
  useAnimatedProps,
} from 'react-native-reanimated';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function SignUp({ switchView }: any) {
  const colorScheme = useColorScheme();
  const { signUp, signIn } = useSession();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignUp = async (
    username: string,
    email: string,
    password: string
  ) => {
    // Sign up
    const errSignUp = await signUp(username, email, password);
    if (errSignUp) {
      alert(errSignUp);
      return;
    }
    // Sign in after sign up
    const errSignIn = await signIn(email, password);
    if (errSignIn) {
      alert(errSignIn);
      return;
    }
    router.replace('/(tabs)');
  };

  return (
    <>
      <Text
        style={[
          styles.title,
          { color: colorScheme === 'dark' ? '#000' : '#FFF' },
        ]}
      >
        Register
      </Text>
      <TextInput
        style={styles.input}
        placeholder='Username'
        placeholderTextColor={'#7F8986'}
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        style={styles.input}
        placeholder='Email'
        placeholderTextColor={'#7F8986'}
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder='Password'
        placeholderTextColor={'#7F8986'}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TouchableOpacity
        style={styles.button}
        onPress={() => handleSignUp(username, email, password)}
      >
        <ThemedText style={styles.buttonText}>Register</ThemedText>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={() => switchView()}
      >
        <ThemedText style={styles.secondaryButtonText}>Go Back</ThemedText>
      </TouchableOpacity>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A1A',
  },
  scrollViewContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerContainer: {
    width: '80%',
    padding: 20,
    borderRadius: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 0.84,
    elevation: 5,
  },
  logoContainer: {
    position: 'relative',
    width: '100%',
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  logo: {
    position: 'absolute',
    width: 200,
    height: 280,
    borderRadius: 100,
    marginBottom: 20,
  },
  circleSvg: {
    position: 'absolute',
    width: 200,
    height: 200,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    marginBottom: 15,
    fontSize: 18,
    padding: 10,
    borderRadius: 5,
    borderColor: '#E0E0E0',
    borderWidth: 1,
    backgroundColor: '#FAFAFA',
    color: '#000',
  },
  button: {
    backgroundColor: '#25A879',
    paddingVertical: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: '#E0E0E0',
    paddingVertical: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  secondaryButtonText: {
    color: '#25A879',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
});
