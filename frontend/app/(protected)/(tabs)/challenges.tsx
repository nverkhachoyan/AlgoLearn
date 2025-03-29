import { StyleSheet, View, ScrollView } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import LottieView from 'lottie-react-native';

export default function Challenges() {
  const { colors, dark } = useTheme();
  const animationSource = require('@/assets/lotties/coming.lottie');

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
        },
      ]}
    >
      <Text style={styles.title}>Challenges?</Text>

      <View style={[styles.animationContainer, { backgroundColor: 'transparent' }]}>
        <LottieView
          source={animationSource}
          style={styles.lottieView}
          loop
          speed={1}
          colorFilters={[
            {
              keypath: '**.*',
              color: dark ? '#25A879' : 'black',
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  animationContainer: {
    width: '100%',
    height: 300,
    alignItems: 'center',
  },
  lottieView: {
    width: '50%',
    height: '100%',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: 'OpenSauceOne-Regular',
  },
});
