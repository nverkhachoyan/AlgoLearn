import { View, Text, StyleSheet, TouchableOpacity, Image, Platform } from 'react-native';
import LottieView from 'lottie-react-native';
import Conditional from '@/src/components/Conditional';
import { Spinning } from './Spinning';
import { useRef, memo } from 'react';
import { Feather } from '@expo/vector-icons';
import { useTheme } from 'react-native-paper';
import { router, usePathname } from 'expo-router';
import { useUser } from '@/src/features/user/hooks/useUser';
import { buildImgUrl } from '@/src/lib/utils/transform';
import { NIL_UUID } from '@/src/features/upload/utils';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  interpolate,
  useAnimatedReaction,
  Extrapolation,
} from 'react-native-reanimated';

const HEADER_HEIGHT = Platform.select({ web: 64, default: 50 });
const TITLE_CONTENT_HEIGHT = 80;
const SCROLL_THRESHOLD = 80;

interface StickyHeaderProps {
  cpus: number;
  streak: number;
  onAvatarPress: () => void;
  transparent?: boolean;
  gradientColors?: readonly [string, string, string];
  titleContent?: () => React.ReactNode;
  scrollY?: Animated.SharedValue<number>;
  collapsibleTitle?: boolean;
}

export const StickyHeader = memo(function StickyHeader({
  cpus,
  streak,
  onAvatarPress,
  transparent = false,
  gradientColors,
  titleContent,
  scrollY,
  collapsibleTitle = false,
}: StickyHeaderProps) {
  const { colors, dark } = useTheme();
  const animation = useRef(null);
  const pathname = usePathname();
  const { user } = useUser();

  // Calculate header opacity based on scroll position
  const headerOpacity = useSharedValue(transparent ? 0 : 1);
  // Track the smoothed scroll position
  const smoothScrollY = useSharedValue(0);
  // Track previous scroll value to detect direction
  const previousScrollY = useSharedValue(0);

  // Use animated reaction at the top level of the component with direction-aware smoothing
  if (scrollY && transparent) {
    useAnimatedReaction(
      // Read the scroll value
      () => scrollY.value,
      currentValue => {
        // Only process valid, positive scrollY values
        if (currentValue >= 0) {
          // Detect scroll direction (up or down)
          const isScrollingUp = currentValue < previousScrollY.value;
          previousScrollY.value = currentValue;

          // Asymmetric smoothing - more responsive when scrolling up
          if (isScrollingUp) {
            // When scrolling up, respond quickly (less smoothing)
            // 40% previous value, 60% new value - more weight to new value
            smoothScrollY.value = 0.4 * smoothScrollY.value + 0.6 * currentValue;

            // Make header appear even faster when approaching top
            if (currentValue < SCROLL_THRESHOLD / 2) {
              // Even more weight to new value when near top
              smoothScrollY.value = 0.2 * smoothScrollY.value + 0.8 * currentValue;
            }
          } else {
            // When scrolling down, apply more smoothing to prevent jitter
            // 70% previous value, 30% new value
            smoothScrollY.value = 0.7 * smoothScrollY.value + 0.3 * currentValue;
          }

          // Calculate opacity with the smoothed value
          const newOpacity = Math.min(1, smoothScrollY.value / 80);
          headerOpacity.value = withTiming(newOpacity, {
            duration: isScrollingUp ? 100 : 150, // Faster animation when scrolling up
          });
        }
      }
    );
  }

  // Create animated style for titleContent with improved direction-aware transition
  const titleContentStyle = useAnimatedStyle(() => {
    if (!scrollY || !collapsibleTitle) {
      return {
        opacity: 1,
        height: TITLE_CONTENT_HEIGHT,
      };
    }

    // Use the smoothed scroll value to prevent jitter
    const currentScrollY = Math.max(0, smoothScrollY.value);

    // Detect if we're near the top for faster expansion when scrolling up
    const isNearTop = currentScrollY < SCROLL_THRESHOLD / 2;

    // More responsive interpolation, especially when near top
    const titleOpacity = interpolate(
      currentScrollY,
      [0, isNearTop ? SCROLL_THRESHOLD / 2 : SCROLL_THRESHOLD],
      [1, 0],
      Extrapolation.CLAMP
    );

    // Use the same threshold for height to ensure synchronized animation
    const height = interpolate(
      currentScrollY,
      [0, SCROLL_THRESHOLD],
      [TITLE_CONTENT_HEIGHT, 0],
      Extrapolation.CLAMP
    );

    // Use padding as secondary animation to help with smooth collapse
    const paddingVertical = interpolate(
      currentScrollY,
      [0, SCROLL_THRESHOLD],
      [10, 0],
      Extrapolation.CLAMP
    );

    return {
      opacity: titleOpacity,
      height,
      paddingVertical,
      overflow: 'hidden',
    };
  });

  if (!user) {
    return <Spinning />;
  }

  const defaultGradientColors = dark
    ? (['#4F6CF7', '#3D4FA3', '#2A3550'] as const)
    : (['#4F6CF7', '#6A78ED', '#8A84E2'] as const);

  const activeGradientColors = gradientColors || defaultGradientColors;

  return (
    <View
      style={[
        styles.container,
        transparent ? { backgroundColor: 'transparent' } : { backgroundColor: colors.surface },
        Platform.OS === 'web' && styles.webContainer,
      ]}
    >
      {/* Background that fades in on scroll */}
      <LinearGradient
        colors={activeGradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.content}>
        <TouchableOpacity
          onPress={() => {
            if (pathname !== '/') {
              router.back();
            }
          }}
          style={[styles.headerItem, styles.logoContainer]}
        >
          <LottieView
            autoPlay={true}
            loop={false}
            ref={animation}
            style={styles.logo}
            source={require('@/assets/lotties/AlgoLearnLogo.json')}
            resizeMode="contain"
          />
        </TouchableOpacity>

        <View style={styles.headerItem}>
          <Feather name="cpu" size={24} color="#1CC0CB" />
          <Text style={{ color: transparent ? '#FFFFFF' : colors.onSurface }}>{cpus}</Text>
        </View>
        <View style={styles.headerItem}>
          <Feather name="zap" size={24} color="#1CC0CB" />
          <Text style={{ color: transparent ? '#FFFFFF' : colors.onBackground }}>{streak}</Text>
        </View>

        <TouchableOpacity onPress={onAvatarPress} style={styles.headerItem}>
          <Conditional
            condition={user.imgKey !== NIL_UUID && user.imgKey !== ''}
            renderTrue={() => (
              <Image
                source={{
                  uri: buildImgUrl('users', user.folderObjectKey, user.imgKey, user.mediaExt),
                }}
                style={[
                  styles.avatar,
                  { borderColor: transparent ? '#FFFFFF' : colors.surface, borderWidth: 2 },
                ]}
              />
            )}
            renderFalse={() => (
              <View style={styles.avatarPlaceholder}>
                <Feather name="user" size={20} color={transparent ? '#FFFFFF' : colors.onSurface} />
              </View>
            )}
          />
        </TouchableOpacity>
      </View>
      <Conditional
        condition={titleContent !== undefined}
        renderTrue={() => (
          <Animated.View style={[styles.headerContent, titleContentStyle]}>
            {titleContent && titleContent()}
          </Animated.View>
        )}
        renderFalse={null}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 'auto',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 7 },
    shadowOpacity: 0.05,
    shadowRadius: 3.84,
    borderBottomEndRadius: 8,
    borderBottomStartRadius: 8,
    zIndex: 10,
    overflow: 'hidden', // Needed for the rounded corners with the gradient
  },
  webContainer: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    borderBottomEndRadius: 0,
    borderBottomStartRadius: 0,
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  content: {
    height: HEADER_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Platform.OS === 'web' ? 20 : 12,
    marginHorizontal: Platform.OS === 'web' ? 10 : undefined,
    ...(Platform.OS === 'web'
      ? { justifyContent: 'space-between' }
      : { justifyContent: 'space-between' }),
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Platform.OS === 'web' ? 20 : 8,
  },
  headerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Platform.OS === 'web' ? 8 : 6,
  },
  logoContainer: {
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 36,
    height: 36,
  },
  avatar: {
    width: Platform.OS === 'web' ? 33 : 30,
    height: Platform.OS === 'web' ? 33 : 30,
    borderRadius: 100,
  },
  avatarPlaceholder: {
    width: Platform.OS === 'web' ? 33 : 30,
    height: Platform.OS === 'web' ? 33 : 30,
    borderRadius: 100,
    backgroundColor: 'rgba(0,0,0,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  headerContent: {
    alignItems: 'center',
    // marginVertical: 10,
  },
});
