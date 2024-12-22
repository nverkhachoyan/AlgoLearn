import { useLocalSearchParams, router } from "expo-router";
import { StyleSheet, View, ScrollView } from "react-native";
import { Text, ActivityIndicator } from "react-native-paper";
import { useEffect, useState } from "react";
import { useTheme } from "react-native-paper";
import {
  useCourse,
  useStartCourse,
  useRestartCourse,
} from "@/src/features/course/hooks/useCourses";
import { StickyHeader } from "@/src/components/common/StickyHeader";
import CourseHeader from "@/src/features/course/components/CourseHeader";
import CurrentModuleCard from "@/src/features/course/components/CurrentModuleCard";
import TableOfContents from "@/src/features/course/components/TableOfContents";
import CourseInfo from "@/src/features/course/components/CourseInfo";
import FooterButtons from "@/src/features/course/components/FooterButtons";
import { useUser } from "@/src/features/user/hooks/useUser";
import { Colors } from "@/constants/Colors";
import Loading from "@/src/components/common/Loading";
import { Alert } from "react-native";

export default function CourseDetails() {
  const { courseId, hasProgress } = useLocalSearchParams();
  const { colors }: { colors: Colors } = useTheme();
  const { user } = useUser();
  const [isCurrentModulePressed, setIsCurrentModulePressed] = useState(false);

  const shouldFetchProgress = hasProgress === "true" && !!user;

  const { course, isLoading, error } = useCourse({
    courseId: parseInt(courseId as string),
    isAuthenticated: shouldFetchProgress,
  });

  const { startCourse, isLoading: isStartCourseLoading } = useStartCourse(
    parseInt(courseId as string)
  );
  const { restartCourse, isLoading: isRestartLoading } = useRestartCourse(
    parseInt(courseId as string)
  );

  const goToModule = ({
    courseId,
    unitId,
    moduleId,
  }: {
    courseId: number;
    unitId: number;
    moduleId: number;
  }) => {
    if (!user) {
      Alert.alert(
        "Authentication Required",
        "Please sign in to access course content.",
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Sign In",
            onPress: () => router.push("/(auth)"),
          },
        ]
      );
      return;
    }

    router.push({
      pathname: "/(protected)/course/[courseId]/module/[moduleId]",
      params: {
        courseId,
        unitId,
        moduleId,
      },
    });
  };

  const handleStartCourse = async () => {
    if (!user) {
      Alert.alert(
        "Authentication Required",
        "Please sign in to start the course.",
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Sign In",
            onPress: () => router.push("/(auth)"),
          },
        ]
      );
      return;
    }

    if (course?.currentModule) {
      goToModule({
        courseId: parseInt(courseId as string),
        unitId: course.currentUnit.id,
        moduleId: course.currentModule.id,
      });
    } else {
      try {
        const response = await startCourse();
        if (response?.moduleId && response?.unitId) {
          goToModule({
            courseId: parseInt(courseId as string),
            unitId: response.unitId,
            moduleId: response.moduleId,
          });
        } else {
          Alert.alert("Error", "Could not start the course. Please try again.");
        }
      } catch (error) {
        Alert.alert("Error", "Failed to start the course. Please try again.");
      }
    }
  };

  const handleRestartCourse = async () => {
    Alert.alert(
      "Restart Course",
      "Are you sure you want to restart this course? All progress will be lost.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Restart",
          style: "destructive",
          onPress: async () => {
            try {
              const response = await restartCourse();
              if (response?.success) {
                // Refresh the page with progress after restart
                router.replace({
                  pathname: "/(protected)/course/[courseId]",
                  params: {
                    courseId: parseInt(courseId as string),
                    hasProgress: "true",
                  },
                });
              }
            } catch (error) {
              Alert.alert(
                "Error",
                "Failed to restart course. Please try again."
              );
            }
          },
        },
      ]
    );
  };

  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: colors.background,
        }}
      >
        <Text style={{ fontSize: 20, fontWeight: "bold", textAlign: "center" }}>
          {error.message || "Failed to load course."}
        </Text>
      </View>
    );
  }

  if (!course) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: colors.background,
        }}
      >
        <Text style={{ fontSize: 20, fontWeight: "bold" }}>
          Course not found.
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StickyHeader
        cpus={user?.cpus || 0}
        strikeCount={user?.strikeCount || 0}
        userAvatar={user?.avatar}
        onAvatarPress={() => user && router.push("/(protected)/(profile)")}
      />
      <ScrollView
        contentContainerStyle={[
          styles.scrollView,
          { backgroundColor: colors.background },
        ]}
      >
        <View style={styles.container}>
          <CourseHeader course={course} />

          {shouldFetchProgress && course.currentModule && (
            <CurrentModuleCard
              course={course}
              userId={user.id}
              isPressed={isCurrentModulePressed}
              onPressIn={() => setIsCurrentModulePressed(true)}
              onPressOut={() => setIsCurrentModulePressed(false)}
            />
          )}

          {course.units && <TableOfContents units={course.units} />}

          <View style={styles.separator} />

          <CourseInfo course={course} colors={colors} />
        </View>
      </ScrollView>

      <FooterButtons
        colors={colors}
        rightButton={
          shouldFetchProgress && course.currentModule
            ? "Continue Course"
            : "Start Course"
        }
        onStartCourse={handleStartCourse}
        leftButton={
          shouldFetchProgress && course.currentModule
            ? "Restart Course"
            : undefined
        }
        onLeftButtonPress={
          shouldFetchProgress && course.currentModule
            ? handleRestartCourse
            : undefined
        }
        isLoading={isStartCourseLoading || isRestartLoading}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start",
    gap: 10,
  },
  scrollView: {
    flexGrow: 1,
    justifyContent: "flex-start",
    paddingVertical: 15,
  },
  separator: {
    marginVertical: 10,
    height: 1,
    backgroundColor: "#333",
    opacity: 0.2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
