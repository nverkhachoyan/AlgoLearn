import {
  StyleSheet,
  View,
  Animated as RNAnimated,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import React, { useEffect, useRef, useState, useMemo } from 'react';
import { router } from 'expo-router';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { StickyHeader } from '@/src/components/StickyHeader';
import { useUser } from '@/src/features/user/hooks/useUser';
import { Colors, ContentBackground, HeaderAndTabs } from '@/constants/Colors';
import { humanReadableDate } from '@/src/lib/utils/date';
import { Spinning } from '@/src/components/Spinning';
import { LinearGradient } from 'expo-linear-gradient';
import Conditional from '@/src/components/Conditional';
import Animated, { useAnimatedScrollHandler, useSharedValue } from 'react-native-reanimated';
import { Text } from '@/src/components/ui';
import { useAppTheme } from '@/src/context/ThemeContext';

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
  const { theme } = useAppTheme();
  const { colors, dark } = theme;
  const fadeAnim = useRef(new RNAnimated.Value(0)).current;
  const [refreshing, setRefreshing] = useState(false);
  const scrollY = useSharedValue(0);
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
    {
      id: 6,
      type: 'poll',
      title: 'Best Backend Framework?',
      description: 'Vote for your preferred backend framework and see community preferences.',
      date: '2024-07-18',
    },
    {
      id: 7,
      type: 'poll',
      title: 'Best Backend Framework?',
      description: 'Vote for your preferred backend framework and see community preferences.',
      date: '2024-07-18',
    },
    {
      id: 8,
      type: 'poll',
      title: 'Best Backend Framework?',
      description: 'Vote for your preferred backend framework and see community preferences.',
      date: '2024-07-18',
    },
    {
      id: 9,
      type: 'poll',
      title: 'Best Backend Framework?',
      description: 'Vote for your preferred backend framework and see community preferences.',
      date: '2024-07-18',
    },
  ]);

  useEffect(() => {
    RNAnimated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  }, []);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: event => {
      if (event && event.contentOffset && typeof event.contentOffset.y === 'number') {
        scrollY.value = event.contentOffset.y;
      }
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

  // const headerGradientColors = dark
  //   ? (['#4F6CF7', '#3D4FA3', '#2A3550'] as readonly [string, string, string])
  //   : (['#4F6CF7', '#6A78ED', '#8A84E2'] as readonly [string, string, string]);

  const headerGradientColors = HeaderAndTabs[dark ? 'dark' : 'light'];

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
    <View style={{ flex: 1 }}>
      <StickyHeader
        cpus={user.cpus}
        streak={user?.streak || 0}
        onAvatarPress={() => router.push('/(protected)/(profile)')}
        scrollY={scrollY}
        collapsibleTitle={true}
        titleContent={() => (
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Your Feed</Text>
            <Text style={styles.headerSubtitle}>Stay updated with the latest content</Text>
          </View>
        )}
      />

      <Animated.ScrollView
        style={{ flex: 1, zIndex: 1, backgroundColor: ContentBackground[dark ? 'dark' : 'light'] }}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        contentContainerStyle={styles.scrollContentContainer}
        showsVerticalScrollIndicator={false}
        bounces={true}
        overScrollMode="never"
        decelerationRate="normal"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
            progressViewOffset={100}
          />
        }
      >
        <RNAnimated.View style={{ opacity: fadeAnim }}>
          <View style={styles.feedContainer}>{renderedFeedItems}</View>
        </RNAnimated.View>
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContentContainer: {
    paddingTop: 10,
    paddingBottom: 30,
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
