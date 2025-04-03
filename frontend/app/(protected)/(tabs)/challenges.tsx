import { StyleSheet, View, ScrollView } from 'react-native';
import { Text } from '@/src/components/ui';
import { useAppTheme } from '@/src/context/ThemeContext';
import LottieView from 'lottie-react-native';
import { ContentBackground } from '@/constants/Colors';
import { StickyHeader } from '@/src/components/StickyHeader';
import { useUser } from '@/src/features/user/hooks/useUser';
import { router } from 'expo-router';

export default function Challenges() {
  const { theme } = useAppTheme();
  const { dark } = theme;
  const { user } = useUser();
  const animationSource = require('@/assets/lotties/coming.lottie');

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: ContentBackground[dark ? 'dark' : 'light'],
        },
      ]}
    >
      <StickyHeader
        cpus={user?.cpus || 0}
        streak={user?.streak || 0}
        onAvatarPress={() => router.replace('/')}
      />

      <View style={styles.animationContainer}>
        <Text variant="headline" style={styles.title}>
          Challenges?
        </Text>
        <LottieView
          source={animationSource}
          style={styles.lottieView}
          loop
          speed={1}
          colorFilters={[
            {
              keypath: '**.*',
              color: '#25A879',
            },
          ]}
          renderMode="AUTOMATIC"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  animationContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'column',
  },
  lottieView: {
    width: '100%',
    height: '100%',
    aspectRatio: 0.5,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: 'OpenSauceOne-Regular',
    marginTop: 40,
  },
});
