import { router, Redirect } from 'expo-router';
import {
  View,
  ActivityIndicator,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from 'react-native';
import { useSession } from '@/contexts/ctx';
import { useEffect, useState } from 'react';
// @ts-ignore
import Logo from '@/assets/images/logo.png';
import Svg, { Circle } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  useAnimatedProps,
  runOnJS,
} from 'react-native-reanimated';
import SignIn from '@/components/SignIn';
import SignUp from '@/components/SignUp';
import { useColorScheme } from 'react-native';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export default function Onboarding() {
  const { isLoading, signIn, signUp } = useSession();
  const [hasAccount, setHasAccount] = useState(true);
  const circleSize = useSharedValue<number>(70);
  const circleAnimatedProps = useAnimatedProps(() => ({
    r: withSpring(circleSize.value, {
      duration: 3000,
      dampingRatio: 0.4,
      stiffness: 118,
      overshootClamping: false,
      restDisplacementThreshold: 0.01,
      restSpeedThreshold: 0.01,
    }),
  }));
  const viewOpacity = useSharedValue(1);
  const colorScheme = useColorScheme();
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: viewOpacity.value,
  }));

  // Switch between sign in and sign up
  const switchView = () => {
    viewOpacity.value = withSpring(
      0,
      {
        mass: 1,
        damping: 6,
        stiffness: 60,
        overshootClamping: false,
        restDisplacementThreshold: 0.01,
        restSpeedThreshold: 122,
      },
      () => {
        runOnJS(setHasAccount)(!hasAccount);
        viewOpacity.value = withSpring(1, {
          mass: 1,
          damping: 6,
          stiffness: 60,
          overshootClamping: false,
          restDisplacementThreshold: 0.01,
          restSpeedThreshold: 122,
        });
      }
    );
  };

  // Handle sign in and sign up
  const handleSignIn = async (email: string, password: string) => {
    const err = await signIn(email, password);
    if (err) {
      alert(err);
    } else {
      router.replace('/(tabs)');
    }
  };

  const handleSignUp = async (
    username: string,
    email: string,
    password: string
  ) => {
    const err = await signUp(username, email, password);
    if (err) {
      alert(err);
    } else {
      handleSignIn(email, password);
    }
  };

  // Animate the circle size when the component mounts
  useEffect(() => {
    circleSize.value += 20;
  }, []);

  // Loading screen
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size='large' color='#4CAF50' />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[
        styles.container,
        { backgroundColor: colorScheme === 'dark' ? '#000' : '#FEFEFE' },
      ]}
    >
      <ScrollView contentContainerStyle={styles.scrollViewContainer}>
        <View style={styles.innerContainer}>
          <View style={styles.logoContainer}>
            <Svg width={200} height={200} style={styles.circleSvg}>
              <AnimatedCircle
                cx='50%'
                cy='50%'
                fill='#25A879'
                animatedProps={circleAnimatedProps}
              />
            </Svg>
            <Image source={Logo} style={styles.logo} />
          </View>
          <Animated.View style={[styles.formContainer, animatedStyle]}>
            {hasAccount ? (
              <SignIn
                handleSignIn={handleSignIn}
                switchView={() => switchView()}
              />
            ) : (
              <SignUp
                handleSignUp={handleSignUp}
                switchView={() => switchView()}
              />
            )}
          </Animated.View>
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
  formContainer: {
    width: '100%',
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
});
