import React from "react";
import {
  StyleSheet,
  ScrollView,
  View,
  ActivityIndicator,
  Text,
} from "react-native";
import { CourseSection } from "@/src/features/course/components/CourseList";
import { useUser } from "@/src/features/user/hooks/useUser";
import useToast from "@/src/hooks/useToast";
import { useCourses } from "@/src/features/course/hooks/useCourses";
import { StickyHeader } from "@/src/components/common/StickyHeader";
import { router } from "expo-router";
import { useTheme } from "react-native-paper";
import { useAuth } from "@/src/features/auth/context/AuthContext";
import ErrorBoundary from "@/src/components/ErrorBoundary";

export default function HomeWrapper() {
  return (
    <ErrorBoundary>
      <Home />
    </ErrorBoundary>
  );
}

function Home() {
  console.debug("[Home] Rendering started");

  const { user, error: userError } = useUser();
  console.debug("[Home] User data:", user);
  console.debug("[Home] User error:", userError);

  const { isAuthenticated, token } = useAuth();
  console.debug("[Home] Auth state:", { isAuthenticated, hasToken: !!token });

  const { colors } = useTheme();
  const { showToast } = useToast();

  const { courses, fetchNextPage, hasNextPage, isFetchingNextPage, error } =
    useCourses({
      pageSize: 5,
      isAuthenticated: isAuthenticated,
    });

  console.debug("[Home] Courses data:", {
    coursesLength: courses?.length,
    hasNextPage,
    isFetchingNextPage,
    error,
  });

  React.useEffect(() => {
    if (error) {
      console.error("[Home] Course fetch error:", error);
      showToast("Failed to fetch courses" + error?.message);
    }
  }, [error]);

  if (!isAuthenticated || !token) {
    console.debug("[Home] Not authenticated, showing error");
    return (
      <View style={[styles.container, { backgroundColor: "#00FF00" }]}>
        <Text style={{ color: "#000000", fontSize: 20 }}>
          Not authenticated. Please sign in.
        </Text>
        <Text style={{ color: "#000000", fontSize: 16 }}>
          Debug:{" "}
          {JSON.stringify({ isAuthenticated, hasToken: !!token }, null, 2)}
        </Text>
      </View>
    );
  }

  if (!user) {
    console.debug("[Home] No user data, showing loading");
    return (
      <View style={[styles.container, { backgroundColor: "#0000FF" }]}>
        <ActivityIndicator size="large" color="#FFFFFF" />
        <Text style={{ color: "#FFFFFF", marginTop: 16, fontSize: 20 }}>
          Loading user data...
        </Text>
      </View>
    );
  }

  if (userError) {
    console.debug("[Home] User error, showing error message");
    return (
      <View style={[styles.container, { backgroundColor: "#FF00FF" }]}>
        <Text style={{ color: "#FFFFFF", fontSize: 20 }}>
          Error loading user data: {userError.message}
        </Text>
        <Text style={{ color: "#FFFFFF", fontSize: 16 }}>
          Debug: {JSON.stringify(userError, null, 2)}
        </Text>
      </View>
    );
  }

  try {
    console.debug("[Home] Rendering main content");
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <StickyHeader
          cpus={user?.cpus ?? 0}
          streak={user?.streak || 0}
          userAvatar={user?.profilePictureURL ?? ""}
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
    );
  } catch (error) {
    console.error("[Home] Render error:", error);
    return (
      <View style={[styles.container]}>
        <Text style={{ color: "#FFFFFF", fontSize: 20 }}>
          Error rendering content:{" "}
          {error instanceof Error ? error.message : String(error)}
        </Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    height: "100%",
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
