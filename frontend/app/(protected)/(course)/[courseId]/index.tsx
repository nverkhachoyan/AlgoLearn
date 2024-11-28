import { useLocalSearchParams, router } from "expo-router";
import { StyleSheet, View, ScrollView } from "react-native";
import { Text } from "react-native-paper";
import { useState } from "react";
import { useTheme } from "react-native-paper";
import { useCourse } from "@/src/hooks/useCourses";
import { StickyHeader } from "@/src/components/common/StickyHeader";
import CourseHeader from "@/src/features/course/components/CourseHeader";
import CurrentModuleCard from "@/src/features/course/components/CurrentModuleCard";
import TableOfContents from "@/src/features/course/components/TableOfContents";
import CourseInfo from "@/src/features/course/components/CourseInfo";
import FooterButtons from "@/src/features/course/components/FooterButtons";

export default function CourseDetails() {
  const { courseId, filter } = useLocalSearchParams();
  const { colors } = useTheme();
  const [isCurrentModulePressed, setIsCurrentModulePressed] = useState(false);

  const { course, isLoading } = useCourse({
    userId: 4,
    courseId: parseInt(courseId as string),
    type: "full",
    filter: filter as any,
  });

  if (isLoading) {
    return <Text>Loading...</Text>;
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
        cpus={0}
        strikeCount={0}
        userAvatar={null}
        onAvatarPress={() => router.push("/(protected)/(profile)")}
      />
      <ScrollView
        contentContainerStyle={[
          styles.scrollView,
          { backgroundColor: colors.background },
        ]}
      >
        <View style={styles.container}>
          <CourseHeader course={course} />

          {course.currentModule && (
            <CurrentModuleCard
              course={course}
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
