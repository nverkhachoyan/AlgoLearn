import React, { memo, useCallback } from "react";
import { StyleSheet, ActivityIndicator, View } from "react-native";
import { Text } from "react-native-paper";
import CourseCard from "@/src/features/course/components/CourseCard";
import Button from "@/src/components/common/Button";
import { Course } from "@/src/features/course/types";
import { useTheme } from "react-native-paper";
import { FlashList } from "@shopify/flash-list";

interface CourseSectionProps {
  title: string;
  courses: Course[];
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  onLoadMore: () => void;
  filter: "learning" | "explore";
}

const MESSAGES = {
  NO_COURSES_LEARNING: "No courses in progress",
  NO_COURSES_EXPLORE: "No courses to explore",
  NO_MORE_COURSES: "No more courses to load",
  LOAD_MORE: "Load more",
} as const;

export const CourseSection = memo<CourseSectionProps>(
  ({ title, courses, hasNextPage, isFetchingNextPage, onLoadMore, filter }) => {
    const { colors } = useTheme();

    const renderEmptyState = () => (
      <Text style={styles.emptyMessage}>
        {filter === "learning"
          ? MESSAGES.NO_COURSES_LEARNING
          : MESSAGES.NO_COURSES_EXPLORE}
      </Text>
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
      ({ item: course }: { item: Course }) => (
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
          currentUnit={filter === "learning" ? course.currentUnit : null}
          currentModule={filter === "learning" ? course.currentModule : null}
          type="summary"
          filter={filter}
        />
      ),
      [colors.surface, filter]
    );

    const keyExtractor = useCallback((item: Course) => `course-${item.id}`, []);

    const ListHeaderComponent = useCallback(
      () => (
        <>
          <View style={styles.separator} />
          <Text style={styles.title}>{title}</Text>
          <View style={styles.separator} />
        </>
      ),
      [title]
    );

    const ListEmptyComponent = useCallback(() => renderEmptyState(), [filter]);

    const ListFooterComponent = useCallback(
      () => (
        <View style={styles.loadMoreContainer}>
          {hasNextPage && renderLoadMoreButton()}
          {isFetchingNextPage && (
            <ActivityIndicator size="small" color="#25A879" />
          )}
          {!hasNextPage && courses.length > 0 && filter === "explore" && (
            <Text style={styles.endMessage}>{MESSAGES.NO_MORE_COURSES}</Text>
          )}
        </View>
      ),
      [hasNextPage, isFetchingNextPage, courses.length, filter]
    );

    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <FlashList
          data={courses}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          estimatedItemSize={200}
          ListHeaderComponent={ListHeaderComponent}
          ListEmptyComponent={ListEmptyComponent}
          ListFooterComponent={ListFooterComponent}
          onEndReached={hasNextPage ? onLoadMore : undefined}
          onEndReachedThreshold={0.5}
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
  emptyMessage: {
    textAlign: "center",
    padding: 16,
    color: "#666",
    fontStyle: "italic",
  },
});
