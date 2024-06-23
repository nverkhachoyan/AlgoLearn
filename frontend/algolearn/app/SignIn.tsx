import { router, Redirect } from 'expo-router';
import { Text, View, TextInput, TouchableOpacity, ActivityIndicator, StyleSheet, Image, KeyboardAvoidingView, ScrollView, Platform } from 'react-native';
import { useSession } from '@/contexts/ctx';
import { useEffect, useState } from 'react';
import { ThemedText } from '@/components/ThemedText';
import { ThemedInputText } from '@/components/ThemedInputText';
import { useColorScheme } from '@/hooks/useColorScheme';
import Logo from '../assets/images/logo.png'
import Svg, { Circle } from 'react-native-svg';
import Animated, {
  useSharedValue,
  withTiming,
  useAnimatedStyle,
  Easing,
  withSpring,
  useAnimatedProps
} from 'react-native-reanimated';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export default function SignIn() {
  const { isLoading } = useSession();
  const { signIn } = useSession();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [hasAccount, setHasAccount] = useState(true);
  const colorScheme = useColorScheme();
  const circleSize = useSharedValue<number>(70);
  const animatedProps = useAnimatedProps(() => ({
    r: withSpring(circleSize.value, {
      duration: 3000,
      dampingRatio: 0.4,
      stiffness: 118,
      overshootClamping: false,
      restDisplacementThreshold: 0.01,
      restSpeedThreshold: 0.01,
    }),
  }));

  const handleSignIn = async (email: string, password: string) => {
    const err = await signIn(email, password);
    if (err) {
      alert(err);
      return;
    } 
    router.replace('/(tabs)');
  };

  const handleSignUp = async (username: string, email: string, password: string) => {
    const err = await signIn(username, email, password);
    if (err) {
      alert(err);
      return;
    } 
    router.replace('/(tabs)');
  };

  useEffect(() => {
    circleSize.value += 20;
  }, []);


  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollViewContainer} >
        <View style={styles.innerContainer}>
          <View style={styles.logoContainer}>
            <Svg width={200} height={200} style={styles.circleSvg}>
              <AnimatedCircle
                cx="50%"
                cy="50%"
                fill="#25A879"
                animatedProps={animatedProps}
              />
            </Svg>
            <Image source={Logo} style={styles.logo} />
          </View>
          {hasAccount ? (
            <View >
            <Text style={[styles.title, { color: colorScheme === 'dark' ? '#FFF' : '#000' }]}>
              Log in
            </Text>
            <TextInput 
              style={styles.input}
              placeholder="Email" 
              placeholderTextColor={'#7F8986'}
              value={email} 
              onChangeText={setEmail} 
            />
            <TextInput 
              style={styles.input}
              placeholder="Password" 
              placeholderTextColor={'#7F8986'}
              value={password} 
              onChangeText={setPassword} 
              secureTextEntry 
            />
            <TouchableOpacity style={styles.button} onPress={() => handleSignIn(email, password)}>
              <ThemedText style={styles.buttonText}>Log in</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryButton} onPress={() => setHasAccount(false)}>
              <ThemedText style={styles.secondaryButtonText}>Create Account</ThemedText>
            </TouchableOpacity>
          </View>
          ) : (
            <View>
              <Text style={[styles.title, { color: colorScheme === 'dark' ? '#FFF' : '#000' }]}>
                Create Account
              </Text>
              <TextInput 
                style={styles.input}
                placeholder="Username" 
                placeholderTextColor={'#7F8986'}
                value={username} 
                onChangeText={setUsername} 
              />
              <TextInput 
                style={styles.input}
                placeholder="Email" 
                placeholderTextColor={'#7F8986'}
                value={email} 
                onChangeText={setEmail} 
              />
              <TextInput 
                style={styles.input}
                placeholder="Password" 
                placeholderTextColor={'#7F8986'}
                value={password} 
                onChangeText={setPassword} 
                secureTextEntry 
              />
              <TouchableOpacity style={styles.button} onPress={() => handleSignUp(username,email, password)}>
                <ThemedText style={styles.buttonText}>Create Account</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity style={styles.secondaryButton} onPress={() => setHasAccount(true)}>
                <ThemedText style={styles.secondaryButtonText}>Go Back</ThemedText>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
    shadowRadius: .84,
    elevation: 5,
  },
  logoContainer: { 
    position: 'relative',
    width: '100%', 
    height: 200, 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginBottom: 15 },
  logo: { 
    position: 'absolute', 
    width: 200, 
    height: 280, 
    borderRadius: 100, 
    marginBottom: 20 },
  circleSvg: { 
    position: 'absolute', 
    width: 200, 
    height: 200
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: "#000",
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
    color: "#000",
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
