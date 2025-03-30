import {
  StyleSheet,
  View,
  ScrollView,
  Animated as RNAnimated,
  TouchableOpacity,
  RefreshControl,
  NativeScrollEvent,
  Platform,
} from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { Seperator } from '@/src/components/common/Seperator';
import React, { useEffect, useRef, useState, useMemo } from 'react';
import { router } from 'expo-router';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { StickyHeader } from '@/src/components/common/StickyHeader';
import { useUser } from '@/src/features/user/hooks/useUser';
import { Colors } from '@/constants/Colors';
import { humanReadableDate } from '@/src/lib/utils/date';
import { Spinning } from '@/src/components/common/Spinning';
import { LinearGradient } from 'expo-linear-gradient';
import Conditional from '@/src/components/Conditional';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
  useAnimatedStyle,
  interpolate,
  Extrapolation,
  runOnJS,
  useDerivedValue,
  withTiming,
  cancelAnimation,
} from 'react-native-reanimated';

type FeedItemType = 'course' | 'poll' | 'achievement';

interface FeedItem {
  id: number;
  type: FeedItemType;
  title: string;
  description: string;
  date: string;
  isNew?: boolean;
}

export default function Feed() {
  const { user } = useUser();
  const { colors, dark }: { colors: Colors; dark: boolean } = useTheme();
  const fadeAnim = useRef(new RNAnimated.Value(0)).current;
  const [refreshing, setRefreshing] = useState(false);
  const scrollY = useSharedValue(0);
  const lastScrollDirection = useSharedValue<'up' | 'down' | null>(null);
  const [feedItems, setFeedItems] = useState<FeedItem[]>([
    {
      id: 1,
      type: 'course',
      title: 'New Course: Advanced JavaScript',
      description: 'Dive deep into advanced JavaScript topics and master the language.',
      date: '2024-07-25',
      isNew: true,
    },
    {
      id: 2,
      type: 'poll',
      title: 'Poll: Your Favorite Programming Language',
      description: 'Vote for your favorite programming language and see what others prefer!',
      date: '2024-07-24',
    },
    {
      id: 3,
      type: 'achievement',
      title: 'Achievement: Completed JavaScript Basics',
      description:
        'Congratulations on completing the JavaScript Basics course! Keep up the good work.',
      date: '2024-07-23',
    },
    // Add a few more items to ensure scrolling
    {
      id: 4,
      type: 'course',
      title: 'Data Structures 101',
      description: 'Learn the fundamental data structures used in programming.',
      date: '2024-07-20',
    },
    {
      id: 5,
      type: 'poll',
      title: 'Best Backend Framework?',
      description: 'Vote for your preferred backend framework and see community preferences.',
      date: '2024-07-18',
    },
  ]);

  // Initial fade in animation for the whole feed
  useEffect(() => {
    RNAnimated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Simulate fetching new data
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  }, []);

  // Direction-aware scroll handler with improved event handling
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: event => {
      // Check if event is properly formed before using
      if (event && event.contentOffset && typeof event.contentOffset.y === 'number') {
        // Get current scroll position
        const currentY = event.contentOffset.y;

        // Detect direction by comparing with previous value
        if (scrollY.value < currentY) {
          lastScrollDirection.value = 'down';
        } else if (scrollY.value > currentY) {
          lastScrollDirection.value = 'up';
        }

        // Pass the raw value to the header component which will handle smoothing
        scrollY.value = currentY;
      }
    },
    // Reset scroll tracking at the beginning of a new scroll gesture
    onBeginDrag: () => {
      // Reset the last scroll direction when starting a new drag
      lastScrollDirection.value = null;
    },
  });

  const getGradientColors = (type: FeedItemType): readonly [string, string] => {
    switch (type) {
      case 'course':
        return dark ? (['#4F6CF7', '#3D4FA3'] as const) : (['#4F6CF7', '#6A78ED'] as const);
      case 'poll':
        return dark ? (['#8A2BE2', '#612094'] as const) : (['#8A2BE2', '#AE67DD'] as const);
      case 'achievement':
        return dark ? (['#e6b800', '#A38308'] as const) : (['#e6b800', '#F0CA40'] as const);
      default:
        return dark ? (['#4F6CF7', '#3D4FA3'] as const) : (['#4F6CF7', '#6A78ED'] as const);
    }
  };

  const getIconStyle = (type: FeedItemType) => {
    switch (type) {
      case 'course':
        return styles.courseIcon;
      case 'poll':
        return styles.pollIcon;
      case 'achievement':
        return styles.achievementIcon;
      default:
        return {};
    }
  };

  const renderFeedItemIcon = (type: FeedItemType) => {
    const iconStyle = [styles.iconBackground, getIconStyle(type)];

    switch (type) {
      case 'course':
        return (
          <View style={iconStyle}>
            <Feather name="book" size={24} color="#FFFFFF" />
          </View>
        );
      case 'poll':
        return (
          <View style={iconStyle}>
            <MaterialIcons name="poll" size={24} color="#FFFFFF" />
          </View>
        );
      case 'achievement':
        return (
          <View style={iconStyle}>
            <Feather name="award" size={24} color="#FFFFFF" />
          </View>
        );
      default:
        return null;
    }
  };

  const headerGradientColors = dark
    ? (['#4F6CF7', '#3D4FA3', '#2A3550'] as readonly [string, string, string])
    : (['#4F6CF7', '#6A78ED', '#8A84E2'] as readonly [string, string, string]);

  if (!user) {
    return <Spinning />;
  }

  // Pre-render feed items to avoid re-renders during scrolling
  const renderedFeedItems = useMemo(() => {
    return feedItems.map((item, index) => {
      return (
        <View
          key={item.id}
          style={[
            styles.feedItem,
            {
              backgroundColor: dark ? colors.surface : '#FFFFFF',
              shadowColor: dark ? '#000000' : '#000000',
            },
          ]}
        >
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => console.log(`Pressed item: ${item.id}`)}
            style={{ width: '100%' }}
          >
            <View style={styles.feedItemHeader}>
              {renderFeedItemIcon(item.type)}
              <View style={styles.feedItemTitleContainer}>
                <Text style={[styles.feedItemTitle, { color: colors.onSurface }]}>
                  {item.title}
                </Text>
                <Text style={[styles.feedItemDate, { color: colors.onSurfaceVariant }]}>
                  {humanReadableDate(item.date)}
                </Text>
              </View>
              <Conditional
                condition={!!item.isNew}
                renderTrue={() => (
                  <View style={styles.newBadge}>
                    <Text style={styles.newBadgeText}>NEW</Text>
                  </View>
                )}
                renderFalse={null}
              />
            </View>

            <View style={styles.feedItemContent}>
              <Text style={[styles.feedItemDescription, { color: colors.onSurfaceVariant }]}>
                {item.description}
              </Text>
            </View>

            <LinearGradient
              colors={getGradientColors(item.type)}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.feedItemFooter}
            >
              <Text style={styles.feedItemFooterText}>
                {item.type === 'course'
                  ? 'View Course'
                  : item.type === 'poll'
                    ? 'Take Poll'
                    : 'View Achievement'}
              </Text>
              <Feather name="chevron-right" size={18} color="#FFFFFF" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      );
    });
  }, [feedItems, dark, colors]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Main background gradient that spans the entire top section */}
      <LinearGradient
        colors={headerGradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.backgroundGradient}
      />

      {/* SafeAreaView should be outside and wrap everything */}
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <StickyHeader
          cpus={user.cpus}
          streak={user?.streak || 0}
          onAvatarPress={() => router.push('/(protected)/(profile)')}
          gradientColors={headerGradientColors}
          scrollY={scrollY}
          collapsibleTitle={true}
          transparent={true}
          titleContent={() => (
            <View style={styles.headerContent}>
              <Text style={styles.headerTitle}>Your Feed</Text>
              <Text style={styles.headerSubtitle}>Stay updated with the latest content</Text>
            </View>
          )}
        />

        <Animated.ScrollView
          style={[styles.scrollContainer, { backgroundColor: colors.background }]}
          onScroll={scrollHandler}
          scrollEventThrottle={8} // More frequent updates for smoother detection
          contentContainerStyle={styles.scrollContentContainer}
          showsVerticalScrollIndicator={false} // Hide scrollbar for cleaner look
          bounces={true} // Allow iOS bounce effect
          overScrollMode="never" // Prevent Android overscroll glow
          decelerationRate={Platform.OS === 'ios' ? 'fast' : 'normal'} // Faster deceleration on iOS
          snapToOffsets={[0]} // Help snap back to the top position
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
              progressViewOffset={20} // Add offset to avoid conflict with header
            />
          }
        >
          <RNAnimated.View style={{ opacity: fadeAnim }}>
            <View style={styles.feedContainer}>{renderedFeedItems}</View>
          </RNAnimated.View>
        </Animated.ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 160, // Increase height to cover enough space for the header + title content
    zIndex: 0,
  },
  scrollContainer: {
    flex: 1,
    zIndex: 1,
  },
  scrollContentContainer: {
    paddingTop: 10, // Add some padding at the top
    paddingBottom: 30, // Increase padding at bottom to avoid being right at the boundary
  },
  headerContent: {
    alignItems: 'center',
    paddingBottom: 5,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  feedContainer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  feedItem: {
    borderRadius: 16,
    marginBottom: 20,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  feedItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  feedItemTitleContainer: {
    flex: 1,
    marginLeft: 12,
  },
  feedItemTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  feedItemDate: {
    fontSize: 13,
    marginTop: 2,
  },
  feedItemContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  feedItemDescription: {
    fontSize: 15,
    lineHeight: 22,
  },
  feedItemFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    paddingHorizontal: 16,
  },
  feedItemFooterText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  iconBackground: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
  },
  courseIcon: {
    backgroundColor: '#4F6CF7',
  },
  pollIcon: {
    backgroundColor: '#8A2BE2',
  },
  achievementIcon: {
    backgroundColor: '#e6b800',
  },
  newBadge: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  newBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
});
