import React from "react";
import { StyleSheet, ScrollView, View } from "react-native";
import { CourseSection } from "@/src/features/course/components/CourseList";
import { useUser } from "@/src/features/user/hooks/useUser";
import useToast from "@/src/hooks/useToast";
import { useCourses } from "@/src/features/course/hooks/useCourses";
import { StickyHeader } from "@/src/components/common/StickyHeader";
import { router } from "expo-router";
import { useTheme } from "react-native-paper";
import { User } from "@/src/features/user/types";
import CustomErrorBoundary from "@/src/components/ErrorBoundary";

export default function Home() {
  const { user }: { user: User } = useUser();
  const { colors } = useTheme();
  const { showToast } = useToast();

  const {
    courses: learningCourses,
    fetchNextPage: fetchNextLearning,
    hasNextPage: hasNextLearning,
    isFetchingNextPage: isFetchingNextLearning,
    error: learningError,
  } = useCourses({
    userId: user?.id,
    currentPage: 1,
    pageSize: 1,
    type: "summary",
    filter: "learning",
  });

  const {
    courses: exploreCourses,
    fetchNextPage: fetchNextExplore,
    hasNextPage: hasNextExplore,
    isFetchingNextPage: isFetchingNextExplore,
    error: exploreError,
  } = useCourses({
    userId: 4,
    currentPage: 1,
    pageSize: 5,
    type: "summary",
    filter: "explore",
  });

  React.useEffect(() => {
    if (learningError || exploreError) {
      showToast(
        "Failed to fetch courses" +
          (learningError?.message || exploreError?.message)
      );
    }
  }, [learningError, exploreError]);

  return (
    <CustomErrorBoundary>
      <View
        style={[
          styles.container,
          {
            backgroundColor: colors.background,
          },
        ]}
      >
        <StickyHeader
          cpus={user?.cpus ?? 0}
          strikeCount={user?.streaks?.length ?? 0}
          userAvatar={user?.profilePictureUrl ?? ""}
          onAvatarPress={() => router.push("/(protected)/(profile)")}
        />

        <ScrollView contentContainerStyle={[styles.scrollContent]}>
          <CourseSection
            title="Your Courses"
            courses={learningCourses}
            hasNextPage={hasNextLearning}
            isFetchingNextPage={isFetchingNextLearning}
            onLoadMore={() => {
              if (hasNextLearning && !isFetchingNextLearning) {
                fetchNextLearning();
              }
            }}
            filter="learning"
          />
        </ScrollView>
      </View>
    </CustomErrorBoundary>
  );
}

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
