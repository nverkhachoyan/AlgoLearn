import React, { useEffect, useRef } from 'react';
import {
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
import LottieView from 'lottie-react-native';
import { View } from '@/components/Themed';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';

export default function Welcome() {
  const colorScheme = useColorScheme();
  const animation = useRef(null);
  const router = useRouter();

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: Colors[colorScheme ?? 'light'].background },
      ]}
    >
      <View style={styles.middleContent}>
        <LottieView
          autoPlay={true}
          loop={false}
          ref={animation}
          style={styles.logo}
          source={require('@/assets/lotties/AlgoLearnLogo.json')}
        />
        <Text
          style={[styles.title, { color: Colors[colorScheme ?? 'light'].text }]}
        >
          Master programming with bite-sized content
        </Text>
        <Text
          style={[
            styles.subtitle,
            { color: Colors[colorScheme ?? 'light'].text },
          ]}
        >
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
          iconStyle={{
            position: 'absolute',
            right: 12,
            color: Colors[colorScheme ?? 'light'].buttonText,
          }}
          style={{
            backgroundColor: Colors[colorScheme ?? 'light'].buttonBackground,
          }}
          textStyle={{ color: Colors[colorScheme ?? 'light'].buttonText }}
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
