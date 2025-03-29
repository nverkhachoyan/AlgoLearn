import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { useRouter } from 'expo-router';
import Button from '@/src/components/common/Button';
import { Feather } from '@expo/vector-icons';
import { useTheme } from 'react-native-paper';
import useToast from '@/src/hooks/useToast';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/src/features/auth/AuthContext';
import Conditional from '@/src/components/Conditional';
import { isValidEmail, isPasswordValid } from '@/src/features/auth/utils';

export default function SignUp() {
  const router = useRouter();
  const { isLoading, signIn, signUp, checkEmail, isOnboarding } = useAuth();
  const { colors }: { colors: Colors } = useTheme();
  const [emailExists, setEmailExists] = useState<boolean | null>(null);
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [retryPassword, setRetryPassword] = useState<string>('');
  const { showToast } = useToast();
  const [isFocused, setIsFocused] = useState({
    email: false,
    password: false,
    retryPassword: false,
  });

  const signInWithGoogle = () => {
    showToast('Google sign in coming soon!');
  };

  const handleEmailCheck = async () => {
    if (!email.trim()) {
      showToast('Email is required');
      return;
    }
    if (!isValidEmail(email)) {
      showToast('Please enter a valid email address');
      return;
    }

    try {
      const response = await checkEmail(email);
      const exists = response.data.payload?.exists;
      if (exists === undefined) {
        throw new Error('Error checking email');
      }
      setEmailExists(exists);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Error checking email';
      showToast(errorMessage);
    }
  };

  const handleSignUp = async () => {
    const { msg, isValid } = isPasswordValid(password);
    if (!isValid) {
      showToast(msg);
      return;
    }

    if (password !== retryPassword) {
      showToast('Passwords do not match');
      return;
    }

    try {
      const username = email.split('@')[0];
      await signUp(username, email, password);
      router.push('/(auth)/onboarding');
      showToast('Account created successfully!');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to create account';
      showToast(errorMessage);
    }
  };

  const handleSignIn = async () => {
    if (!password.trim()) {
      showToast('Password is required');
      return;
    }
    await signIn(email, password);
    if (isOnboarding) {
      router.push('/(auth)/onboarding');
    }
  };

  const handleContinue = () => {
    if (!emailExists) {
      handleSignUp();
    } else {
      handleSignIn();
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          style={[styles.container, { backgroundColor: colors.background }]}
          keyboardShouldPersistTaps="handled"
        >
          <Pressable
            style={styles.goBackButton}
            onPress={() => router.back()}
            accessibilityLabel="Go back"
            accessibilityRole="button"
          >
            <Feather name="arrow-left" size={24} color={colors.onSurface} />
          </Pressable>

          <Text style={[styles.title, { color: colors.onSurface }]}>
            {emailExists ? 'Welcome back!' : 'Create an account'}
          </Text>

          <View style={styles.middleContent}>
            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: colors.onSurface }]}>Email</Text>
              <TextInput
                style={[
                  styles.textInput,
                  {
                    borderColor: colors.shadow,
                    color: colors.onSurface,
                    backgroundColor: colors.surface,
                    transform: isFocused.email ? [{ scaleX: 1.02 }] : [{ scaleX: 1 }],
                  },
                ]}
                placeholder="Enter your email"
                placeholderTextColor={colors.surfaceDisabled}
                value={email}
                onChangeText={text => {
                  setEmail(text);
                }}
                onFocus={() => setIsFocused(prev => ({ ...prev, email: true }))}
                onBlur={() => setIsFocused(prev => ({ ...prev, email: false }))}
                autoCapitalize="none"
                keyboardType="email-address"
                accessibilityLabel="Email input"
                accessibilityHint="Enter your email address"
              />
            </View>

            <Conditional
              condition={emailExists !== null}
              renderTrue={() => (
                <>
                  <View style={styles.inputContainer}>
                    <Text style={[styles.label, { color: colors.onSurface }]}>Password</Text>
                    <TextInput
                      style={[
                        styles.textInput,
                        {
                          borderColor: colors.shadow,
                          color: colors.onSurface,
                          backgroundColor: colors.surface,
                          transform: isFocused.password ? [{ scaleX: 1.02 }] : [{ scaleX: 1 }],
                        },
                      ]}
                      placeholder="Enter your password"
                      placeholderTextColor={colors.surfaceDisabled}
                      value={password}
                      onChangeText={text => {
                        setPassword(text);
                      }}
                      onFocus={() => setIsFocused(prev => ({ ...prev, password: true }))}
                      onBlur={() => setIsFocused(prev => ({ ...prev, password: false }))}
                      autoCapitalize="none"
                      secureTextEntry
                      accessibilityLabel="Password input"
                      accessibilityHint="Enter your password"
                    />
                    <Conditional
                      condition={!emailExists}
                      renderTrue={() => (
                        <>
                          <Text style={[styles.label, { color: colors.onSurface, marginTop: 16 }]}>
                            Confirm Password
                          </Text>
                          <TextInput
                            style={[
                              styles.textInput,
                              {
                                borderColor: colors.shadow,
                                color: colors.onSurface,
                                backgroundColor: colors.surface,
                                transform: isFocused.retryPassword
                                  ? [{ scaleX: 1.02 }]
                                  : [{ scaleX: 1 }],
                              },
                            ]}
                            placeholder="Retype password"
                            placeholderTextColor={colors.surfaceDisabled}
                            value={retryPassword}
                            onChangeText={text => {
                              setRetryPassword(text);
                            }}
                            onFocus={() => setIsFocused(prev => ({ ...prev, retryPassword: true }))}
                            onBlur={() => setIsFocused(prev => ({ ...prev, retryPassword: false }))}
                            autoCapitalize="none"
                            secureTextEntry
                            accessibilityLabel="Confirm password input"
                            accessibilityHint="Retype your password to confirm"
                          />
                        </>
                      )}
                      renderFalse={null}
                    />
                  </View>
                  <Button
                    title={'Continue'}
                    onPress={handleContinue}
                    icon={{ name: 'arrow-right', position: 'right' }}
                    textStyle={{ color: colors.inverseOnSurface }}
                    iconStyle={{
                      position: 'absolute',
                      right: 12,
                      color: colors.inverseOnSurface,
                    }}
                    style={{
                      backgroundColor: colors.onBackground,
                      opacity: 1,
                      marginTop: 24,
                    }}
                  />
                </>
              )}
              renderFalse={null}
            />

            <Conditional
              condition={emailExists === null}
              renderTrue={() => (
                <Button
                  title={'Continue'}
                  onPress={handleEmailCheck}
                  icon={{ name: 'arrow-right', position: 'right' }}
                  textStyle={{ color: colors.inverseOnSurface }}
                  iconStyle={{
                    position: 'absolute',
                    right: 12,
                    color: colors.inverseOnSurface,
                  }}
                  style={{
                    backgroundColor: colors.onBackground,
                    opacity: 1,
                    marginTop: 24,
                  }}
                />
              )}
              renderFalse={null}
            />
          </View>

          <View style={styles.dividerContainer}>
            <View style={[styles.line, { backgroundColor: colors.onSurface }]} />
            <Text style={[styles.orText, { color: colors.onSurface }]}>or</Text>
            <View style={[styles.line, { backgroundColor: colors.onSurface }]} />
          </View>

          <View style={styles.buttonContainer}>
            <Button
              title="Continue with Google"
              onPress={signInWithGoogle}
              icon={{
                name: 'google',
                position: 'left',
                type: 'png',
                src: require('@/assets/icons/google.png'),
              }}
              iconStyle={{ width: 20, height: 20 }}
              style={{
                backgroundColor: colors.surface,
                borderColor: colors.shadow,
                borderWidth: 1,
                opacity: 1,
              }}
              textStyle={{
                color: colors.onSurface,
              }}
            />
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 25,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  goBackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    top: 20,
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
  inputContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    textAlign: 'left',
    marginTop: 70,
    marginBottom: 30,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  textInput: {
    height: 45,
    padding: 12,
    borderWidth: 1,
    borderRadius: 10,
    fontSize: 16,
  },
  errorText: {
    fontSize: 14,
    marginTop: 4,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 24,
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
