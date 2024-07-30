import { View, Text } from './Themed';
import { StyleSheet, Pressable } from 'react-native';
import LottieView from 'lottie-react-native';
import { useRef } from 'react';
import { Feather } from '@expo/vector-icons';
import useAppTheme from '@/hooks/useTheme';
// import useThemeColors from '@/hooks/useThemeColors';

export default function Header(props: {
  cpus: number;
  strikeCount: number;
  userAvatar: string | null;
  onAvatarPress: () => void;
}) {
  const { colors } = useAppTheme();
  const animation = useRef(null);
  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.stickyHeaderBackground,
        },
      ]}
    >
      <LottieView
        autoPlay={true}
        loop={false}
        ref={animation}
        style={styles.logo}
        source={require('@/assets/lotties/AlgoLearnLogo.json')}
      />
      <View style={styles.headerItem}>
        <Feather name='cpu' size={24} color='#1CC0CB' />
        <Text>{props.cpus}</Text>
      </View>
      <View style={styles.headerItem}>
        <Feather name='zap' size={24} color='#1CC0CB' />
        <Text>{props.strikeCount}</Text>
      </View>

      <Pressable onPress={props.onAvatarPress}>
        {props.userAvatar ? (
          <Text>Avatar</Text>
        ) : (
          <Feather name='user' size={24} color={colors.icon} />
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
    height: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    marginBottom: 30,
    borderBottomEndRadius: 8,
    borderBottomStartRadius: 8,
  },
  headerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logo: {
    width: 36,
    height: 36,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
});
