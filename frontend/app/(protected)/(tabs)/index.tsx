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
import { useAuth } from "@/src/features/auth/context/AuthContext";

export default function Home() {
  const { user }: { user: User } = useUser();
  const { isAuthenticated } = useAuth();
  const { colors } = useTheme();
  const { showToast } = useToast();

  const { courses, fetchNextPage, hasNextPage, isFetchingNextPage, error } =
    useCourses({
      pageSize: 5,
      isAuthenticated: isAuthenticated,
    });

  React.useEffect(() => {
    if (error) {
      showToast("Failed to fetch courses" + error?.message);
    }
  }, [error]);

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
            courses={courses}
            hasNextPage={hasNextPage}
            isFetchingNextPage={isFetchingNextPage}
            onLoadMore={() => {
              if (hasNextPage && !isFetchingNextPage) {
                fetchNextPage();
              }
            }}
            hasProgress={true}
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
