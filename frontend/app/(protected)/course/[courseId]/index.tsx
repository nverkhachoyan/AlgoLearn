import { useLocalSearchParams, router } from "expo-router";
import {
  StyleSheet,
  View,
  ScrollView,
  Animated,
  Platform,
  useWindowDimensions,
} from "react-native";
import {
  Text,
  Menu,
  IconButton,
} from "react-native-paper";
import { useEffect, useState, useRef } from "react";
import { useTheme } from "react-native-paper";
import {
  useCourse,
  useStartCourse,
  useResetCourseProgress,
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
import { useAuth } from "@/src/features/auth/context/AuthContext";

export default function CourseDetails() {
  const { courseId, hasProgress } = useLocalSearchParams();
  const { colors }: { colors: Colors } = useTheme();
  const { user } = useUser();
  const [isCurrentModulePressed, setIsCurrentModulePressed] = useState(false);
  const { isAuthenticated } = useAuth();
  const [menuVisible, setMenuVisible] = useState(false);
  const rotationValue = useRef(new Animated.Value(0)).current;
  const { course, isLoading, error } = useCourse({
    courseId: parseInt(courseId as string),
    isAuthenticated: true,
    hasProgress: hasProgress === "true",
  });
  const { startCourse, isLoading: isStartCourseLoading } = useStartCourse(
    parseInt(courseId as string)
  );
  const { resetCourseProgress, isLoading: isResetCourseProgressLoading } =
    useResetCourseProgress(parseInt(courseId as string));
  const { width } = useWindowDimensions();
  const isLargeScreen = width >= 1024;
  const isMediumScreen = width >= 768 && width < 1024;

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
          router.dismissTo({
            pathname: "/(protected)/(tabs)",
          });
        }
      } catch (error) {
        console.log("Failed to start the course", error);
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
              const response = await resetCourseProgress();
              if (response?.success) {
                router.dismissTo({
                  pathname: "/(protected)/(tabs)",
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

  const startRotation = () => {
    Animated.timing(rotationValue, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const stopRotation = () => {
    Animated.timing(rotationValue, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  useEffect(() => {
    if (menuVisible) {
      startRotation();
    } else {
      stopRotation();
    }
  }, [menuVisible]);

  const spin = rotationValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "90deg"],
  });

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
          <IconButton icon="arrow-left" onPress={() => router.back()} />
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.headerContainer, isLargeScreen && styles.webHeader]}>
        <StickyHeader
          cpus={user?.cpus || 0}
          streak={user?.streak || 0}
          userAvatar={user?.avatar}
          onAvatarPress={() => user && router.push("/(protected)/(profile)")}
        />
      </View>
      <ScrollView
        contentContainerStyle={[
          styles.scrollView,
          { backgroundColor: colors.background },
          isLargeScreen && styles.webScrollView,
        ]}
        style={[
          styles.scrollViewContainer,
          isLargeScreen && styles.webScrollViewContainer,
        ]}
      >
        <View
          style={[
            styles.content,
            isLargeScreen && styles.webContent,
            isMediumScreen && styles.tabletContent,
          ]}
        >
          <CourseHeader course={course} />

          {!isLargeScreen && course.units && (
            <TableOfContents
              courseId={parseInt(courseId as string)}
              units={course.units}
            />
          )}

          <View style={isLargeScreen ? styles.webLayout : styles.mobileLayout}>
            <View
              style={
                isLargeScreen ? styles.webMainContent : styles.mobileMainContent
              }
            >
              {isAuthenticated && course.currentModule && (
                <CurrentModuleCard
                  course={course}
                  isPressed={isCurrentModulePressed}
                  onPressIn={() => setIsCurrentModulePressed(true)}
                  onPressOut={() => setIsCurrentModulePressed(false)}
                />
              )}

              <CourseInfo course={course} colors={colors} />
            </View>

            {isLargeScreen && (
              <View style={styles.webSidebar}>
                {course.units && (
                  <TableOfContents
                    courseId={parseInt(courseId as string)}
                    units={course.units}
                  />
                )}
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      <View
        style={[
          styles.footerContainer,
          { backgroundColor: colors.surface },
          isLargeScreen && styles.webFooter,
        ]}
      >
        {course.currentModule && (
          <View>
            <Menu
              visible={menuVisible}
              onDismiss={() => setMenuVisible(false)}
              elevation={5}
              anchor={
                <Animated.View style={{ transform: [{ rotate: spin }] }}>
                  <IconButton
                    icon="cog"
                    size={24}
                    onPress={() => setMenuVisible(!menuVisible)}
                    style={styles.settingsButton}
                    mode="contained"
                  />
                </Animated.View>
              }
              anchorPosition="top"
              contentStyle={[
                styles.menuContent,
                { backgroundColor: colors.surface },
              ]}
            >
              <Menu.Item
                onPress={() => {
                  setMenuVisible(false);
                  handleRestartCourse();
                }}
                title="Restart Course"
                leadingIcon="restart"
              />
            </Menu>
          </View>
        )}
        <View
          style={[styles.mainButton, isLargeScreen && styles.webMainButton]}
        >
          <FooterButtons
            colors={colors}
            rightButton={
              isAuthenticated && course.currentModule
                ? "Continue Course"
                : "Start Course"
            }
            onStartCourse={handleStartCourse}
            isLoading={isStartCourseLoading || isResetCourseProgressLoading}
          />
        </View>
      </View>
    </View>
  );
}

const HEADER_HEIGHT = 80;
const MAX_CONTENT_WIDTH = 1200;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
  },
  webHeader: {
    position: "fixed",
    backgroundColor: "rgba(255, 255, 255, 0.95)",
  },
  scrollViewContainer: {
    flex: 1,
    marginTop: HEADER_HEIGHT,
  },
  webScrollViewContainer: {
    marginTop: HEADER_HEIGHT + 20,
  },
  scrollView: {
    flexGrow: 1,
    paddingVertical: 15,
    paddingHorizontal: Platform.OS === "web" ? 0 : 15,
  },
  webScrollView: {
    alignItems: "center",
  },
  content: {
    flex: 1,
    gap: 20,
    width: "100%",
  },
  webContent: {
    maxWidth: MAX_CONTENT_WIDTH,
    paddingHorizontal: 40,
  },
  tabletContent: {
    maxWidth: "100%",
    paddingHorizontal: 24,
  },
  webLayout: {
    flexDirection: "row",
    gap: 40,
  },
  mobileLayout: {
    flexDirection: "column",
    gap: 20,
  },
  webMainContent: {
    flex: 2,
  },
  mobileMainContent: {
    width: "100%",
  },
  webSidebar: {
    flex: 1,
    minWidth: 300,
    maxWidth: 400,
  },
  mobileSidebar: {
    width: "100%",
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
  footerContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(0, 0, 0, 0.1)",
  },
  webFooter: {
    paddingHorizontal: 40,
    paddingVertical: 16,
  },
  settingsButton: {
    marginRight: 8,
  },
  mainButton: {
    flex: 1,
  },
  webMainButton: {
    maxWidth: 300,
    marginLeft: "auto",
  },
  menuContent: {
    borderRadius: 8,
    marginTop: -40,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});
