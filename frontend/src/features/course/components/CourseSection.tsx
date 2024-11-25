import React from "react";
import { StyleSheet, ActivityIndicator, View } from "react-native";
import { Text } from "react-native-paper";
import CourseCard from "@/src/features/course/components/CourseCard";
import Button from "@/src/components/common/Button";
import { Course } from "@/src/features/course/types";
import { useTheme } from "react-native-paper";

interface CourseSectionProps {
  title: string;
  courses: Course[];
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  onLoadMore: () => void;
  filter: "learning" | "explore";
}

export const CourseSection: React.FC<CourseSectionProps> = ({
  title,
  courses,
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
  filter,
}) => {
  const { colors } = useTheme();

  return (
    <View style={{ backgroundColor: colors.background }}>
      <View style={styles.separator} />
      <Text style={styles.title}>{title}</Text>
      <View style={styles.separator} />

      {courses.length === 0 ? (
        <Text style={styles.emptyMessage}>
          {filter === "learning"
            ? "No courses in progress"
            : "No courses to explore"}
        </Text>
      ) : (
        courses.map((course) => (
          <CourseCard
            key={`course-${course.id}`}
            courseID={course.id.toString()}
            courseTitle={course.name}
            backgroundColor={course.backgroundColor || colors.surface}
            iconUrl="https://cdn.iconscout.com/icon/free/png-256/javascript-2752148-2284965.png"
            description={course.description}
            authors={course.authors}
            difficultyLevel={course.difficultyLevel}
            duration={course.duration + ""}
            rating={course.rating}
            currentUnit={filter === "learning" ? course.currentUnit : null}
            currentModule={filter === "learning" ? course.currentModule : null}
            type="summary"
            filter={filter}
          />
        ))
      )}

      <View style={styles.loadMoreContainer}>
        {hasNextPage && (
          <Button
            title="Load more"
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
        )}

        {isFetchingNextPage && (
          <ActivityIndicator size="small" color="#25A879" />
        )}

        {!hasNextPage && courses.length > 0 && filter === "explore" && (
          <Text style={styles.endMessage}>No more courses to load</Text>
        )}
      </View>
    </View>
  );
};

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
