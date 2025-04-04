import { useState, useRef } from 'react';
import { StyleSheet, View, Animated, Platform, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { StickyHeader } from '@/src/components/StickyHeader';
import { useAppTheme } from '@/src/context/ThemeContext';
import { Searchbar } from '@/src/components/ui';
import { useCourses, useSearchCourses } from '@/src/features/course/hooks/useCourses';
import { useUser } from '@/src/features/user/hooks/useUser';
import { CourseSection } from '@/src/features/course/components/CourseList';
import { ContentBackground, HeaderAndTabs } from '@/constants/Colors';
import { BlurView } from 'expo-blur';
import { useDebounce } from '@/src/hooks/useDebounce';

export default function Explore() {
  const { user } = useUser();
  const { theme } = useAppTheme();
  const { colors } = theme;
  const dark = theme.dark;
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const scrollY = useRef(new Animated.Value(0)).current;
  const headerGradientColors = HeaderAndTabs[dark ? 'dark' : 'light'];

  const {
    courses: searchResults,
    hasNextPage: hasNextSearchPage,
    fetchNextPage: fetchNextSearchPage,
    isFetchingNextPage: isFetchingNextSearchPage,
    isLoading: isSearching,
  } = useSearchCourses({
    query: debouncedSearchQuery,
    pageSize: 5,
    useFullText: false,
  });

  const { courses, hasNextPage, fetchNextPage, isFetchingNextPage } = useCourses({
    pageSize: 5,
    isAuthed: false,
  });

  const searchBarTranslateY = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, -60],
    extrapolate: 'clamp',
  });

  const searchBarOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const renderContent = () => {
    if (searchQuery && isSearching) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      );
    }

    const displayCourses = searchQuery ? searchResults : courses;

    return (
      <CourseSection
        title="Explore"
        courses={displayCourses}
        hasNextPage={searchQuery ? hasNextSearchPage : hasNextPage}
        isFetchingNextPage={searchQuery ? isFetchingNextSearchPage : isFetchingNextPage}
        onLoadMore={() => (searchQuery ? fetchNextSearchPage() : fetchNextPage())}
        hasProgress={false}
      />
    );
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: ContentBackground[dark ? 'dark' : 'light'],
        },
      ]}
    >
      <View style={styles.headerContainer}>
        <StickyHeader
          cpus={user?.cpus ?? 0}
          streak={user?.streak || 0}
          onAvatarPress={() => router.push('/(protected)/(profile)')}
        />
        <Animated.View
          style={[
            styles.searchContainer,
            {
              transform: [{ translateY: searchBarTranslateY }],
              opacity: searchBarOpacity,
            },
          ]}
        >
          {Platform.OS === 'ios' ? (
            <BlurView intensity={30} tint="light" style={styles.searchBarWrapper}>
              <Searchbar
                placeholder="Explore"
                onChangeText={setSearchQuery}
                value={searchQuery}
                style={{ backgroundColor: 'transparent' }}
                inputStyle={styles.searchBar}
              />
            </BlurView>
          ) : (
            <Searchbar
              placeholder="Explore"
              onChangeText={setSearchQuery}
              value={searchQuery}
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.8)' }}
              inputStyle={styles.searchBar}
            />
          )}
        </Animated.View>
      </View>

      <Animated.ScrollView
        contentContainerStyle={[styles.scrollContent]}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
          useNativeDriver: true,
        })}
        scrollEventThrottle={16}
      >
        {renderContent()}
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  headerContainer: {
    backgroundColor: 'transparent',
    paddingBottom: 8,
    zIndex: 1,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    position: 'absolute',
    top: 130,
    left: 0,
    right: 0,
    zIndex: -1,
  },
  searchBarWrapper: {
    borderRadius: 5,
    overflow: 'hidden',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    alignSelf: 'center',
  },
  separator: {
    marginVertical: 10,
    height: 1,
    width: '80%',
    alignSelf: 'center',
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: 80,
    paddingBottom: 16,
    paddingHorizontal: 16,
    justifyContent: 'flex-start',
  },
  searchBar: {
    borderRadius: 5,
    elevation: Platform.OS === 'android' ? 2 : 0,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200,
  },
});
