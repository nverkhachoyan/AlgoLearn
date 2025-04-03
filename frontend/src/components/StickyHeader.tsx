import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Platform,
  Pressable,
  Dimensions,
} from 'react-native';
import Conditional from '@/src/components/Conditional';
import { Spinning } from './Spinning';
import { Feather } from '@expo/vector-icons';
import { useAppTheme } from '@/src/context/ThemeContext';
import { router, usePathname } from 'expo-router';
import { useUser } from '@/src/features/user/hooks/useUser';
import { buildImgUrl } from '@/src/lib/utils/transform';
import { NIL_UUID } from '@/src/features/upload/utils';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useHeaderAnimation } from '../hooks/useHeaderAnimation';
import React, { useCallback } from 'react';
import { HeaderAndTabs } from '@/constants/Colors';

const HEADER_HEIGHT = Platform.select({
  web: 64,
  ios: 56,
  default: Math.min(50, Dimensions.get('window').height * 0.07),
});

const BLUR_INTENSITY = Platform.select({ web: 10, ios: 15, default: 0 });

interface StickyHeaderProps {
  cpus: number;
  streak: number;
  onAvatarPress: () => void;
  titleContent?: () => React.ReactNode;
  scrollY?: SharedValue<number>;
  collapsibleTitle?: boolean;
}

// Logo component extracted for better organization
const Logo = React.memo(({ dark }: { dark: boolean }) => (
  <Svg width="28" height="28" viewBox="0 0 403.47522 303.19128">
    <Path
      stroke={dark ? 'white' : '#333'}
      strokeWidth={2}
      fill={dark ? 'white' : '#333'}
      d="m 285.16519,268.87603 c -0.41441,-0.90444 -0.75429,-1.89488 -1.139,-2.91976 -1.49223,-3.97546 -3.06025,-8.72779 -4.70405,-14.25698 L 206.17687,-1.49964e-6 H 129.27489 L 39.113955,242.63901 C 27.917515,272.83996 14.879505,289.41369 1.4554122e-5,292.36012 v 10.82815 H 91.928815 v -10.82815 c -7.95536,-0.58929 -14.14288,-3.09376 -18.56255,-7.51342 -4.41964,-4.56697 -6.62948,-10.53351 -6.62948,-17.8996 0,-4.8616 0.58931,-10.38618 1.76786,-16.5737 1.17856,-6.33483 2.94645,-12.89065 5.3036,-19.66746 l 7.29242,-20.99335 94.359615,-2.9e-4 5.96651,21.65659 c 2.20984,7.95538 3.83039,14.95319 4.86163,20.99336 1.17857,6.04018 1.76787,11.63844 1.76787,16.79468 0,6.62949 -2.13617,11.93308 -6.40851,15.91076 -4.2723,3.97768 -10.23886,6.4085 -17.8996,7.29243 v 10.82815 l 131.46815,0.003 h 7.67308 96.16616 l 4.41965,-93.47897 h -22.31925 c -4.41966,20.92579 -8.76564,38.36416 -13.03798,47.50076 -4.12501,9.13662 -9.28128,15.32604 -15.46879,18.56807 -6.18752,3.24204 -15.76341,4.86117 -28.72776,4.86117 0,0 -20.85231,-5e-5 -21.03202,0 -5.21296,-0.1607 -13.92604,-3.47677 -17.72423,-11.76627 z M 147.61645,20.993419 h 40.43984 l 74.68369,259.645951 -40.44025,-10e-4 z m -14.36388,38.45099 35.7992,124.413251 H 89.498005 Z"
    />
  </Svg>
));

// StatusPill component for CPU and streak counters
const StatusPill = React.memo(
  ({
    icon,
    count,
    color,
    secondaryColor,
  }: {
    icon: 'cpu' | 'zap';
    count: number;
    color: string;
    secondaryColor: string;
  }) => {
    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => {
      return { transform: [{ scale: scale.value }] };
    });

    const handlePressIn = useCallback(() => {
      scale.value = withSpring(0.92);
    }, []);

    const handlePressOut = useCallback(() => {
      scale.value = withSpring(1);
    }, []);

    return (
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        accessibilityLabel={`${icon === 'cpu' ? 'CPU' : 'Streak'} count: ${count}`}
      >
        <Animated.View style={[styles.pillContainer, animatedStyle]}>
          <LinearGradient
            colors={[`${color}20`, `${color}40`]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.pillGradient}
          />
          <Feather name={icon} size={20} color={secondaryColor} />
          <Text style={[styles.pillText, { color }]}>{count}</Text>
        </Animated.View>
      </Pressable>
    );
  }
);

export const StickyHeader: React.FC<StickyHeaderProps> = ({
  cpus,
  streak,
  onAvatarPress,
  titleContent,
  scrollY,
  collapsibleTitle = false,
}) => {
  const { theme } = useAppTheme();
  const { colors } = theme;
  const dark = theme.dark;
  const pathname = usePathname();
  const { user } = useUser();
  const { titleContentStyle } = useHeaderAnimation(scrollY, collapsibleTitle);
  const bgColor = HeaderAndTabs[dark ? 'dark' : 'light'];
  const canGoBack = router.canGoBack && router.canGoBack();

  const avatarScale = useSharedValue(1);

  const avatarAnimatedStyle = useAnimatedStyle(() => {
    return { transform: [{ scale: avatarScale.value }] };
  });

  const handleAvatarPressIn = useCallback(() => {
    avatarScale.value = withSpring(0.9);
  }, []);

  const handleAvatarPressOut = useCallback(() => {
    avatarScale.value = withSpring(1);
  }, []);

  if (!user) {
    return <Spinning />;
  }

  return (
    <View style={[styles.headerWrapper, { backgroundColor: bgColor }]}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <Animated.View
          style={[
            styles.outerContainer,
            {
              borderBottomColor: dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
            },
          ]}
        >
          <View>
            <View style={styles.content}>
              <TouchableOpacity
                onPress={() => {
                  if (pathname !== '/' && canGoBack) {
                    router.back();
                  }
                }}
                style={styles.headerItem}
                accessibilityLabel="Go back"
                accessibilityRole="button"
              >
                <Logo dark={dark} />
              </TouchableOpacity>

              <View
                style={[
                  styles.divider,
                  {
                    backgroundColor: dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)',
                  },
                ]}
              />

              <View style={styles.statusGroup}>
                <StatusPill
                  icon="cpu"
                  count={cpus}
                  color={colors.tertiary}
                  secondaryColor={dark ? '#4F6CF7' : '#1CC0CB'}
                />
                <StatusPill
                  icon="zap"
                  count={streak}
                  color={(colors as any).warning}
                  secondaryColor={dark ? '#FFC107' : '#FF9500'}
                />
              </View>

              <Pressable
                onPress={onAvatarPress}
                onPressIn={handleAvatarPressIn}
                onPressOut={handleAvatarPressOut}
                accessibilityLabel="View profile"
                accessibilityRole="button"
              >
                <Animated.View style={[styles.avatarContainer, avatarAnimatedStyle]}>
                  <Conditional
                    condition={user.imgKey !== NIL_UUID && user.imgKey !== ''}
                    renderTrue={() => (
                      <Image
                        source={{
                          uri: buildImgUrl(
                            'users',
                            user.folderObjectKey,
                            user.imgKey,
                            user.mediaExt
                          ),
                        }}
                        style={[
                          styles.avatar,
                          {
                            borderColor: dark ? 'rgba(36,39,46,0.8)' : 'rgba(255,255,255,0.8)',
                          },
                        ]}
                      />
                    )}
                    renderFalse={() => (
                      <View
                        style={[
                          styles.avatarPlaceholder,
                          {
                            backgroundColor: dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                            borderColor: dark ? 'rgba(36,39,46,0.8)' : 'rgba(255,255,255,0.8)',
                          },
                        ]}
                      >
                        <Feather name="user" size={20} color={colors.onSurface} />
                      </View>
                    )}
                  />
                </Animated.View>
              </Pressable>
            </View>
            <Conditional
              condition={titleContent !== undefined}
              renderTrue={() => (
                <Animated.View style={[styles.titleContainer, titleContentStyle]}>
                  {titleContent && titleContent()}
                </Animated.View>
              )}
              renderFalse={null}
            />
          </View>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  headerWrapper: {
    position: 'relative',
    zIndex: 100,
  },
  headerGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.85, // Glassmorphism effect
    zIndex: 0,
  },
  safeArea: {
    backgroundColor: 'transparent',
  },
  outerContainer: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
    ...(Platform.OS === 'ios'
      ? {
          // Glassmorphism for iOS
          backdropFilter: `blur(${BLUR_INTENSITY}px)`,
        }
      : {}),
    // For web
    ...(Platform.OS === 'web'
      ? {
          backdropFilter: `blur(${BLUR_INTENSITY}px)`,
        }
      : {}),
  },
  content: {
    height: HEADER_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Platform.OS === 'web' ? 24 : 16,
    marginHorizontal: Platform.OS === 'web' ? 12 : 0,
    justifyContent: 'space-between',
  },
  headerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  statusGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    gap: 16,
  },
  pillContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    gap: 6,
    overflow: 'hidden',
  },
  pillGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 20,
  },
  pillText: {
    fontWeight: '600',
    fontSize: 14,
    letterSpacing: 0.5,
  },
  avatarContainer: {
    borderRadius: 100,
    padding: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  avatar: {
    width: Platform.OS === 'web' ? 38 : 34,
    height: Platform.OS === 'web' ? 38 : 34,
    borderRadius: 100,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.8)',
  },
  avatarPlaceholder: {
    width: Platform.OS === 'web' ? 38 : 34,
    height: Platform.OS === 'web' ? 38 : 34,
    borderRadius: 100,
    backgroundColor: 'rgba(0,0,0,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.8)',
  },
  divider: {
    width: 1,
    height: '30%',
    backgroundColor: 'rgba(0,0,0,0.06)',
    marginHorizontal: 8,
  },
  titleContainer: {
    paddingHorizontal: Platform.OS === 'web' ? 24 : 16,
    paddingBottom: 12,
  },
});
