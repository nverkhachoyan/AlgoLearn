import React, { useCallback, useMemo, useState } from 'react';
import {
  StyleSheet,
  ActivityIndicator,
  View,
  useWindowDimensions,
  Platform,
  ViewStyle,
} from 'react-native';
import { Text } from 'react-native-paper';
import CourseCard from '@/src/features/course/components/CourseCard';
import Conditional from '@/src/components/Conditional';
import Button from '@/src/components/Button';
import { Course } from '@/src/features/course/types';
import { useTheme } from 'react-native-paper';
import { FlashList } from '@shopify/flash-list';
import { router } from 'expo-router';
import { buildImgUrl } from '@/src/lib/utils/transform';

type SortOption = 'name' | 'rating' | 'duration' | 'difficultyLevel';

interface CourseSectionProps {
  title: string;
  courses: Course[];
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  onLoadMore: () => void;
  hasProgress: boolean;
}

const MESSAGES = {
  NO_COURSES_LEARNING: "You don't have any courses yet",
  NO_COURSES_EXPLORE: 'No courses to explore',
  NO_MORE_COURSES: 'No more courses to load',
  LOAD_MORE: 'Load more',
  EXPLORE_COURSES: 'Explore Courses',
} as const;

const BREAKPOINTS = {
  TABLET: 768,
  DESKTOP: 1024,
};

export const CourseSection = ({
  title,
  courses,
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
  hasProgress,
}: CourseSectionProps) => {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const [sortBy, setSortBy] = useState<SortOption>('name');

  const sortedCourses = useMemo(() => {
    if (!courses.length) return courses;

    return [...courses].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'duration':
          return (a.duration || 0) - (b.duration || 0);
        case 'difficultyLevel':
          const difficultyOrder = {
            beginner: 0,
            intermediate: 1,
            advanced: 2,
          };
          return (
            (difficultyOrder[a.difficultyLevel as keyof typeof difficultyOrder] || 0) -
            (difficultyOrder[b.difficultyLevel as keyof typeof difficultyOrder] || 0)
          );
        default:
          return 0;
      }
    });
  }, [courses, sortBy]);

  const numColumns = useMemo(() => {
    if (Platform.OS !== 'web') return 1;
    if (width >= BREAKPOINTS.DESKTOP) return 3;
    if (width >= BREAKPOINTS.TABLET) return 2;
    return 1;
  }, [width]);

  // Calculate item width based on number of columns
  const getWebStyles = (): ViewStyle => {
    if (Platform.OS !== 'web') return {};
    const gap = 16; // Gap between items
    const calculatedWidth = 100 / numColumns - (gap * (numColumns - 1)) / numColumns;
    return {
      width: `${calculatedWidth}%` as unknown as number,
      marginHorizontal: 8,
      marginBottom: 16,
    };
  };

  const renderItem = useCallback(
    ({ item: course }: { item: Course | null }) => {
      if (!course) return null;
      const imgUrl = buildImgUrl('courses', course.folderObjectKey, course.imgKey, course.mediaExt);
      return (
        <View style={[styles.courseCardContainer, Platform.OS === 'web' && getWebStyles()]}>
          <CourseCard
            key={`course-${course.id}`}
            courseID={course.id.toString()}
            courseTitle={course.name}
            backgroundColor={course.backgroundColor || colors.surface}
            iconUrl={imgUrl}
            description={course.description}
            authors={course.authors}
            difficultyLevel={course.difficultyLevel}
            duration={`${course.duration}`}
            rating={course.rating}
            currentUnit={course.currentUnit}
            currentModule={course.currentModule}
            type="summary"
            hasProgress={hasProgress}
          />
        </View>
      );
    },
    [colors.surface, getWebStyles]
  );

  const keyExtractor = (item: Course | null) => {
    if (!item) return 'empty-course';
    return `course-${item.id}`;
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlashList
        key={`course-list-${numColumns}`}
        data={sortedCourses}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        estimatedItemSize={200}
        numColumns={numColumns}
        ListHeaderComponent={
          <>
            <View style={styles.headerContainer}>
              <Text style={styles.title}>{title}</Text>
            </View>
            <View style={styles.separator} />
          </>
        }
        ListEmptyComponent={
          <View style={styles.emptyStateContainer}>
            <Text style={styles.emptyMessage}>{MESSAGES.NO_COURSES_LEARNING}</Text>
            <Button
              title={MESSAGES.EXPLORE_COURSES}
              onPress={() => {
                router.push('/(protected)/(tabs)/explore');
              }}
              style={{
                backgroundColor: colors.primary,
                marginTop: 16,
              }}
              textStyle={{
                color: colors.onPrimary,
              }}
            />
          </View>
        }
        ListFooterComponent={
          <View style={styles.loadMoreContainer}>
            <Conditional
              condition={hasNextPage}
              renderTrue={() => (
                <Button
                  title={MESSAGES.LOAD_MORE}
                  icon={{
                    type: 'ionicons',
                    name: 'reload-outline',
                    position: 'right',
                    color: colors.onSecondaryContainer,
                  }}
                  onPress={onLoadMore}
                  style={{
                    backgroundColor: colors.inverseSurface,
                  }}
                  textStyle={{
                    fontSize: 14,
                    color: colors.inverseOnSurface,
                  }}
                />
              )}
              renderFalse={null}
            />
            {isFetchingNextPage && <ActivityIndicator size="small" color="#25A879" />}
          </View>
        }
        onEndReached={hasNextPage ? onLoadMore : undefined}
        onEndReachedThreshold={0.5}
        contentContainerStyle={styles.flashListContainer}
      />
    </View>
  );
};

CourseSection.displayName = 'CourseSection';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    marginHorizontal: 16,
    paddingVertical: 16,
    justifyContent: 'flex-start',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: 'OpenSauceOne-Regular',
  },
  separator: {
    marginVertical: 10,
    height: 1,
    width: '80%',
    alignSelf: 'center',
  },
  loadingContainer: {
    flex: 1,
    alignSelf: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  loadMoreContainer: {
    flex: 1,
    alignSelf: 'center',
    justifyContent: 'center',
    gap: 16,
    marginTop: 10,
  },
  endMessage: {
    textAlign: 'center',
    padding: 10,
    color: '#666',
  },
  emptyStateContainer: {
    height: 300,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  emptyMessage: {
    textAlign: 'center',
    padding: 16,
    color: '#666',
    fontStyle: 'italic',
    fontSize: 16,
  },
  flashListContainer: {
    paddingBottom: 20,
  },
  courseCardContainer: {
    flex: 1,
    marginHorizontal: 10,
  },
  headerContainer: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginVertical: 8,
    marginTop: 20,
  },
});
