import { useLocalSearchParams, router } from "expo-router";
import { View, ScrollView, Text } from "@/components/Themed";
import { StyleSheet } from "react-native";
import { useState } from "react";
import { useAuthContext } from "@/context/AuthProvider";
import useTheme from "@/hooks/useTheme";
import { useProgress } from "@/hooks/useProgress";
import { StickyHeader } from "@/components/common/StickyHeader";
import CourseHeader from "./components/CourseHeader";
import CurrentModuleCard from "./components/CurrentModuleCard";
import TableOfContents from "./components/TableOfContents";
import CourseInfo from "./components/CourseInfo";
import FooterButtons from "./components/FooterButtons";

export default function CourseDetails() {
  const { user } = useAuthContext();
  const { courseID } = useLocalSearchParams();
  const { colors } = useTheme();
  const [isCurrentModulePressed, setIsCurrentModulePressed] = useState(false);

  const { course, isCoursePending, courseError } = useProgress({
    user_id: 4,
    course_id: parseInt(courseID[0]),
    filter: "all",
    type: "summary",
  });

  if (isCoursePending) {
    return <Text>Loading...</Text>;
  }

  if (!course) {
    return <Text>Course not found.</Text>;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StickyHeader
        cpus={user.data.cpus}
        strikeCount={user.data.streaks?.length ?? 0}
        userAvatar={null}
        onAvatarPress={() => router.push("/profile")}
      />
      <ScrollView
        contentContainerStyle={[
          styles.scrollView,
          { backgroundColor: colors.viewBackground },
        ]}
      >
        <View style={styles.container}>
          <CourseHeader course={course} />

          <CurrentModuleCard
            course={course}
            isPressed={isCurrentModulePressed}
            onPressIn={() => setIsCurrentModulePressed(true)}
            onPressOut={() => setIsCurrentModulePressed(false)}
          />

          <TableOfContents units={course.units} />

          <View style={styles.separator} />

          <CourseInfo course={course} colors={colors} />
        </View>
      </ScrollView>

      <FooterButtons colors={colors} />
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
});
