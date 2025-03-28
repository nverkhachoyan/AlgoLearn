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
import type { ApiResponse, EmailCheckResponse } from '@/src/features/auth/authService';

export default function SignUp() {
  const router = useRouter();
  const { isLoading, signIn, signUp, checkEmail } = useAuth();
  const { colors }: { colors: Colors } = useTheme();
  const [hasCheckedEmail, setHasCheckedEmail] = useState<boolean>(false);
  const [emailExists, setEmailExists] = useState<boolean>(false);
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [retryPassword, setRetryPassword] = useState<string>('');
  const [emailError, setEmailError] = useState<string>('');
  const [passwordError, setPasswordError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const { showToast } = useToast();

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string) => {
    if (password.length < 8) {
      return 'Password must be at least 8 characters long';
    }
    if (!/[A-Z]/.test(password)) {
      return 'Password must contain at least one uppercase letter';
    }
    if (!/[a-z]/.test(password)) {
      return 'Password must contain at least one lowercase letter';
    }
    if (!/[0-9]/.test(password)) {
      return 'Password must contain at least one number';
    }
    return '';
  };

  const signInWithGoogle = () => {
    showToast('Google sign in coming soon!');
  };

  const handleEmailCheck = async () => {
    setEmailError('');
    if (!email.trim()) {
      setEmailError('Email is required');
      return;
    }
    if (!isValidEmail(email)) {
      setEmailError('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await checkEmail(email);
      const exists = response.data.payload?.exists;
      if (exists === undefined) {
        throw new Error('Error checking email');
      }
      setHasCheckedEmail(true);
      setEmailExists(exists);
      showToast(
        exists
          ? 'Welcome back! Please enter your password.'
          : 'Create a new account to get started!'
      );
    } catch (error: any) {
      console.error('[Auth] Email check error:', error);
      const errorMessage = error.response?.data?.message || 'Error checking email';
      setEmailError(errorMessage);
      showToast(errorMessage);
      setHasCheckedEmail(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignUp = async () => {
    setPasswordError('');
    const passwordValidation = validatePassword(password);
    if (passwordValidation) {
      setPasswordError(passwordValidation);
      return;
    }
    if (password !== retryPassword) {
      setPasswordError('Passwords do not match');
      return;
    }

    setIsSubmitting(true);
    try {
      const username = email.split('@')[0];
      await signUp(username, email, password);
      showToast('Account created successfully!');
    } catch (error: any) {
      console.error('[Auth] Sign up error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to create account';
      setPasswordError(errorMessage);
      showToast(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignIn = async () => {
    setPasswordError('');
    if (!password.trim()) {
      setPasswordError('Password is required');
      return;
    }

    setIsSubmitting(true);
    try {
      await signIn(email, password);
      showToast('Welcome back!');
    } catch (error: any) {
      console.error('[Auth] Sign in error:', error);
      const errorMessage = error.response?.data?.message || 'Invalid email or password';
      setPasswordError(errorMessage);
      showToast(errorMessage);
    } finally {
      setIsSubmitting(false);
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
                    borderColor: emailError ? colors.error : colors.shadow,
                    color: colors.onSurface,
                    backgroundColor: colors.surface,
                  },
                ]}
                placeholder="Enter your email"
                placeholderTextColor={colors.surfaceDisabled}
                value={email}
                onChangeText={text => {
                  setEmail(text);
                  setEmailError('');
                }}
                autoCapitalize="none"
                keyboardType="email-address"
                editable={!isSubmitting}
                accessibilityLabel="Email input"
                accessibilityHint="Enter your email address"
              />
              {emailError ? (
                <Text style={[styles.errorText, { color: colors.error }]}>{emailError}</Text>
              ) : null}
            </View>

            {hasCheckedEmail && (
              <>
                <View style={styles.inputContainer}>
                  <Text style={[styles.label, { color: colors.onSurface }]}>Password</Text>
                  <TextInput
                    style={[
                      styles.textInput,
                      {
                        borderColor: passwordError ? colors.error : colors.shadow,
                        color: colors.onSurface,
                        backgroundColor: colors.surface,
                      },
                    ]}
                    placeholder="Enter your password"
                    placeholderTextColor={colors.surfaceDisabled}
                    value={password}
                    onChangeText={text => {
                      setPassword(text);
                      setPasswordError('');
                    }}
                    autoCapitalize="none"
                    secureTextEntry
                    editable={!isSubmitting}
                    accessibilityLabel="Password input"
                    accessibilityHint="Enter your password"
                  />
                  {!emailExists && (
                    <>
                      <Text style={[styles.label, { color: colors.onSurface, marginTop: 16 }]}>
                        Confirm Password
                      </Text>
                      <TextInput
                        style={[
                          styles.textInput,
                          {
                            borderColor: passwordError ? colors.error : colors.shadow,
                            color: colors.onSurface,
                            backgroundColor: colors.surface,
                          },
                        ]}
                        placeholder="Retype password"
                        placeholderTextColor={colors.surfaceDisabled}
                        value={retryPassword}
                        onChangeText={text => {
                          setRetryPassword(text);
                          setPasswordError('');
                        }}
                        autoCapitalize="none"
                        secureTextEntry
                        editable={!isSubmitting}
                        accessibilityLabel="Confirm password input"
                        accessibilityHint="Retype your password to confirm"
                      />
                    </>
                  )}
                  {passwordError ? (
                    <Text style={[styles.errorText, { color: colors.error }]}>{passwordError}</Text>
                  ) : null}
                </View>
                <Button
                  title={isSubmitting ? 'Please wait...' : 'Continue'}
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
                    opacity: isSubmitting ? 0.7 : 1,
                    marginTop: 24,
                  }}
                  disabled={isSubmitting}
                />
              </>
            )}

            {!hasCheckedEmail && (
              <Button
                title={isSubmitting ? 'Checking...' : 'Continue'}
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
                  opacity: isSubmitting ? 0.7 : 1,
                  marginTop: 24,
                }}
                disabled={isSubmitting}
              />
            )}
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
                opacity: isSubmitting ? 0.7 : 1,
              }}
              textStyle={{
                color: colors.onSurface,
              }}
              disabled={isSubmitting}
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
    left: 25,
    zIndex: 1,
    padding: 8,
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
