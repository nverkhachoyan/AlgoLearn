import React, { useRef, useEffect, useState } from 'react';
import {
  Text,
  StyleSheet,
  View,
  ActivityIndicator,
  Platform,
  useWindowDimensions,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { router } from 'expo-router';
import Button from '@/src/components/Button';
import LottieView from 'lottie-react-native';
import { useAppTheme } from '@/src/context/ThemeContext';
import { Colors } from '@/constants/Colors';

// Breakpoints for responsive design
const BREAKPOINTS = {
  TABLET: 768,
  DESKTOP: 1024,
};

export default function Welcome() {
  const { theme } = useAppTheme();
  const { colors }: { colors: Colors } = theme;
  const [isMounted, setIsMounted] = useState(false);
  const animation = useRef(null);
  const { width } = useWindowDimensions();

  // Calculate responsive sizes based on screen width
  const isTablet = width >= BREAKPOINTS.TABLET;
  const isDesktop = width >= BREAKPOINTS.DESKTOP;

  const getResponsivePadding = (): number => {
    if (Platform.OS !== 'web') return 25;
    if (isDesktop) return width * 0.2;
    if (isTablet) return width * 0.15;
    return width * 0.05;
  };

  const responsiveStyles = {
    container: {
      paddingHorizontal: getResponsivePadding(),
      ...(Platform.OS === 'web'
        ? {
            maxWidth: 1200,
            marginHorizontal: 'auto',
          }
        : {}),
    } as ViewStyle,
    logoContainer: {
      width: isDesktop ? 300 : isTablet ? 250 : 200,
      height: isDesktop ? 300 : isTablet ? 250 : 200,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: isDesktop ? 48 : isTablet ? 32 : 24,
    } as ViewStyle,
    logo: {
      width: '100%',
      height: '100%',
      aspectRatio: 1,
    } as ViewStyle,
    title: {
      fontSize: isDesktop ? 48 : isTablet ? 36 : 30,
      maxWidth: isDesktop ? 800 : isTablet ? 600 : undefined,
      marginBottom: isDesktop ? 32 : isTablet ? 24 : 16,
    } as TextStyle,
    subtitle: {
      fontSize: isDesktop ? 24 : isTablet ? 20 : 16,
      maxWidth: isDesktop ? 700 : isTablet ? 500 : undefined,
      lineHeight: isDesktop ? 36 : isTablet ? 30 : 24,
    } as TextStyle,
    button: {
      maxWidth: isDesktop ? 400 : isTablet ? 300 : undefined,
      marginBottom: Platform.OS === 'web' ? 40 : 20,
    } as ViewStyle,
  };

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  if (!isMounted) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={[styles.backgroundContainer, { backgroundColor: colors.background }]}>
      <View style={[styles.container, responsiveStyles.container]}>
        <View style={styles.middleContent}>
          <View style={responsiveStyles.logoContainer}>
            <LottieView
              autoPlay={true}
              loop={false}
              ref={animation}
              style={[styles.logo, responsiveStyles.logo]}
              source={require('@/assets/lotties/AlgoLearnLogo.json')}
              resizeMode="contain"
            />
          </View>
          <View style={styles.textContainer}>
            <Text style={[styles.title, { color: colors.onSurface }, responsiveStyles.title]}>
              Master programming with bite-sized content
            </Text>
            <Text style={[styles.subtitle, { color: colors.onSurface }, responsiveStyles.subtitle]}>
              Learn programming at your own pace with lessons that are{' '}
              <Text style={styles.italic}>fun</Text> and{' '}
              <Text style={styles.italic}>rewarding</Text>.
            </Text>
          </View>
        </View>
        <View style={[styles.buttonContainer, responsiveStyles.button]}>
          <Button
            title="Get Started"
            onPress={() => {
              if (isMounted) {
                router.push('/(auth)');
              }
            }}
            icon={{ name: 'arrow-right', position: 'right' }}
            iconStyle={{
              position: 'absolute',
              right: 12,
              color: colors.inverseOnSurface,
            }}
            style={{
              backgroundColor: colors.onBackground,
            }}
            textStyle={{ color: colors.inverseOnSurface }}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  backgroundContainer: {
    flex: 1,
    width: '100%',
    ...(Platform.OS === 'web' ? { minHeight: '100vh' } : { height: '100%' }),
  } as ViewStyle,
  container: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
  } as ViewStyle,
  middleContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  } as ViewStyle,
  textContainer: {
    alignItems: 'center',
    width: '100%',
  } as ViewStyle,
  logo: {
    alignSelf: 'center',
  } as ViewStyle,
  title: {
    fontWeight: 'bold',
    textAlign: 'center',
  } as TextStyle,
  subtitle: {
    textAlign: 'center',
    lineHeight: Platform.OS === 'web' ? 1.5 : undefined,
  } as TextStyle,
  italic: {
    fontStyle: 'italic',
  } as TextStyle,
  buttonContainer: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  } as ViewStyle,
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  } as ViewStyle,
});
