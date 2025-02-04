import React, { memo, useCallback, useMemo, useState } from "react";
import {
  StyleSheet,
  ActivityIndicator,
  View,
  useWindowDimensions,
  Platform,
  ViewStyle,
} from "react-native";
import { Text, Menu } from "react-native-paper";
import CourseCard from "@/src/features/course/components/CourseCard";
import Button from "@/src/components/common/Button";
import { Course } from "@/src/features/course/types";
import { useTheme } from "react-native-paper";
import { FlashList } from "@shopify/flash-list";
import { router } from "expo-router";

type SortOption = "name" | "rating" | "duration" | "difficultyLevel";

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
  NO_COURSES_EXPLORE: "No courses to explore",
  NO_MORE_COURSES: "No more courses to load",
  LOAD_MORE: "Load more",
  EXPLORE_COURSES: "Explore Courses",
} as const;

// Breakpoints for responsive design
const BREAKPOINTS = {
  TABLET: 768,
  DESKTOP: 1024,
};

export const CourseSection = memo<CourseSectionProps>(
  ({
    title,
    courses,
    hasNextPage,
    isFetchingNextPage,
    onLoadMore,
    hasProgress,
  }) => {
    const { colors } = useTheme();
    const { width } = useWindowDimensions();
    const [sortBy, setSortBy] = useState<SortOption>("name");
    const [menuVisible, setMenuVisible] = useState(false);

    const sortedCourses = useMemo(() => {
      if (!courses.length) return courses;

      return [...courses].sort((a, b) => {
        switch (sortBy) {
          case "name":
            return a.name.localeCompare(b.name);
          case "rating":
            return (b.rating || 0) - (a.rating || 0);
          case "duration":
            return (a.duration || 0) - (b.duration || 0);
          case "difficultyLevel":
            const difficultyOrder = {
              beginner: 0,
              intermediate: 1,
              advanced: 2,
            };
            return (
              (difficultyOrder[
                a.difficultyLevel as keyof typeof difficultyOrder
              ] || 0) -
              (difficultyOrder[
                b.difficultyLevel as keyof typeof difficultyOrder
              ] || 0)
            );
          default:
            return 0;
        }
      });
    }, [courses, sortBy]);

    // Calculate number of columns based on screen width
    const numColumns = useMemo(() => {
      if (Platform.OS !== "web") return 1;
      if (width >= BREAKPOINTS.DESKTOP) return 3;
      if (width >= BREAKPOINTS.TABLET) return 2;
      return 1;
    }, [width]);

    // Calculate item width based on number of columns
    const getWebStyles = useMemo((): ViewStyle => {
      if (Platform.OS !== "web") return {};
      const gap = 16; // Gap between items
      const calculatedWidth =
        100 / numColumns - (gap * (numColumns - 1)) / numColumns;
      return {
        width: `${calculatedWidth}%` as unknown as number,
        marginHorizontal: 8,
        marginBottom: 16,
      };
    }, [numColumns]);

    const renderEmptyState = () => (
      <View style={styles.emptyStateContainer}>
        <Text style={styles.emptyMessage}>{MESSAGES.NO_COURSES_LEARNING}</Text>
        <Button
          title={MESSAGES.EXPLORE_COURSES}
          onPress={() => {
            router.push("/(protected)/(tabs)/explore");
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
    );

    const renderLoadMoreButton = () => (
      <Button
        title={MESSAGES.LOAD_MORE}
        icon={{
          type: "ionicons",
          name: "reload-outline",
          position: "right",
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
    );

    const renderItem = useCallback(
      ({ item: course }: { item: Course | null }) => {
        if (!course) return null;
        return (
          <View
            style={[
              styles.courseCardContainer,
              Platform.OS === "web" && getWebStyles,
            ]}
          >
            <CourseCard
              key={`course-${course.id}`}
              courseID={course.id.toString()}
              courseTitle={course.name}
              backgroundColor={course.backgroundColor || colors.surface}
              iconUrl="https://cdn.iconscout.com/icon/free/png-256/javascript-2752148-2284965.png"
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

    const keyExtractor = useCallback((item: Course | null) => {
      if (!item) return "empty-course";
      return `course-${item.id}`;
    }, []);

    const ListHeaderComponent = useCallback(
      () => (
        <>
          <View style={styles.headerContainer}>
            <Text style={styles.title}>{title}</Text>
            <Menu
              visible={menuVisible}
              onDismiss={() => setMenuVisible(false)}
              anchor={
                <Button
                  title="Sort by"
                  onPress={() => setMenuVisible(true)}
                  style={{
                    backgroundColor: colors.secondaryContainer,
                    paddingHorizontal: 16,
                  }}
                  textStyle={{
                    color: colors.onSecondaryContainer,
                    fontSize: 14,
                  }}
                  icon={{
                    type: "ionicons",
                    name: "filter-outline",
                    position: "left",
                    color: colors.onSecondaryContainer,
                  }}
                />
              }
            >
              <Menu.Item
                onPress={() => {
                  setSortBy("name");
                  setMenuVisible(false);
                }}
                title="Name"
                leadingIcon={sortBy === "name" ? "check" : undefined}
              />
              <Menu.Item
                onPress={() => {
                  setSortBy("rating");
                  setMenuVisible(false);
                }}
                title="Rating"
                leadingIcon={sortBy === "rating" ? "check" : undefined}
              />
              <Menu.Item
                onPress={() => {
                  setSortBy("duration");
                  setMenuVisible(false);
                }}
                title="Duration"
                leadingIcon={sortBy === "duration" ? "check" : undefined}
              />
              <Menu.Item
                onPress={() => {
                  setSortBy("difficultyLevel");
                  setMenuVisible(false);
                }}
                title="Difficulty"
                leadingIcon={sortBy === "difficultyLevel" ? "check" : undefined}
              />
            </Menu>
          </View>
          <View style={styles.separator} />
        </>
      ),
      [title, menuVisible, sortBy, colors]
    );

    const ListEmptyComponent = useCallback(() => renderEmptyState(), []);

    const ListFooterComponent = useCallback(
      () => (
        <View style={styles.loadMoreContainer}>
          {hasNextPage && renderLoadMoreButton()}
          {isFetchingNextPage && (
            <ActivityIndicator size="small" color="#25A879" />
          )}
          {!hasNextPage && courses.length > 0 && (
            <Text style={styles.endMessage}>{MESSAGES.NO_MORE_COURSES}</Text>
          )}
        </View>
      ),
      [hasNextPage, isFetchingNextPage, courses.length]
    );

    const getWebContainerStyles = useMemo(() => {
      if (Platform.OS !== "web") return styles.flashListContainer;
      return {
        ...styles.flashListContainer,
        maxWidth: 1200,
        marginHorizontal: "auto",
        paddingHorizontal: 16,
      };
    }, []);

    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <FlashList
          key={`course-list-${numColumns}`}
          data={sortedCourses}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          estimatedItemSize={200}
          numColumns={numColumns}
          ListHeaderComponent={ListHeaderComponent}
          ListEmptyComponent={ListEmptyComponent}
          ListFooterComponent={ListFooterComponent}
          onEndReached={hasNextPage ? onLoadMore : undefined}
          onEndReachedThreshold={0.5}
          contentContainerStyle={getWebContainerStyles}
        />
      </View>
    );
  }
);

CourseSection.displayName = "CourseSection";

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    marginHorizontal: 16,
    paddingVertical: 16,
    justifyContent: "flex-start",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    fontFamily: "OpenSauceOne-Regular",
    alignSelf: "center",
  },
  separator: {
    marginVertical: 10,
    height: 1,
    width: "80%",
    alignSelf: "center",
  },
  loadingContainer: {
    flex: 1,
    alignSelf: "center",
    justifyContent: "center",
    gap: 16,
  },
  loadMoreContainer: {
    flex: 1,
    alignSelf: "center",
    justifyContent: "center",
    gap: 16,
    marginTop: 10,
  },
  endMessage: {
    textAlign: "center",
    padding: 10,
    color: "#666",
  },
  emptyStateContainer: {
    height: 300,
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  emptyMessage: {
    textAlign: "center",
    padding: 16,
    color: "#666",
    fontStyle: "italic",
    fontSize: 16,
  },
  flashListContainer: {
    paddingBottom: 20,
  },
  courseCardContainer: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 8,
  },
});
