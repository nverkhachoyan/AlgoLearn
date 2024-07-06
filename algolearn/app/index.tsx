import React, { useEffect, useRef } from 'react';
import { View, Text, SafeAreaView, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import LottieView from 'lottie-react-native';
import Button from '@/components/common/Button';

export default function Index() {
  const animation = useRef(null);

  // Checking if the user has seen the onboarding screens before
  useEffect(() => {
    async function checkOnboardingStatus() {
      const status = await AsyncStorage.getItem('hasSeenOnboarding');
      if (status) {
        router.navigate('(tabs)');
      }
    }
    checkOnboardingStatus();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.middleContent}>
        <LottieView
          autoPlay={true}
          loop={false}
          ref={animation}
          style={styles.logo}
          source={require('../assets/lotties/AlgoLearnLogo.json')}
        />
        <Text style={styles.title}>
          Master programming with bite-sized content
        </Text>
        <Text style={styles.subtitle}>
          Learn programming at your own pace with lessons that are{' '}
          <Text style={styles.italic}>fun</Text> and{' '}
          <Text style={styles.italic}>rewarding</Text>.
        </Text>
      </View>
      <View style={styles.buttonContainer}>
        <Button
          title='Get Started'
          onPress={() => router.navigate('(onboarding)/signup')}
          icon={{ name: 'arrow-right', position: 'right' }}
          iconStyle={{ position: 'absolute', right: 12 }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingLeft: 25,
    paddingRight: 25,
    backgroundColor: '#fff',
  },
  middleContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 200,
    height: 200,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 16,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
  },
  italic: {
    fontStyle: 'italic',
  },
  buttonContainer: {
    width: '100%',
    justifyContent: 'center',
  },
});
