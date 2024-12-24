import { Platform, StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import { MaterialIcons, AntDesign } from "@expo/vector-icons";
import { Course } from "@/src/features/course/types";
import { Colors } from "@/constants/Colors";
export default function CourseInfo({
  course,
  colors,
}: {
  course: Course;
  colors: Colors;
}) {
  return (
    <View style={styles.courseDescriptionContainer}>
      <InfoSection
        icon={
          <MaterialIcons
            name="description"
            size={24}
            color={colors.onSurface}
          />
        }
        title="Description"
        content={course.description}
      />
      <InfoSection
        icon={<AntDesign name="pushpin" size={24} color={colors.onSurface} />}
        title="Requirements"
        content={course.requirements}
      />
      <InfoSection
        icon={
          <AntDesign name="codesquare" size={24} color={colors.onSurface} />
        }
        title="What you will learn"
        content={course.whatYouLearn}
      />
    </View>
  );
}

function InfoSection({ icon, title, content }: any) {
  return (
    <>
      <View style={styles.courseInfoTitleContainer}>
        {icon}
        <Text style={styles.courseInfoTitle}>{title}</Text>
      </View>
      <Text style={styles.courseDescription}>{content}</Text>
    </>
  );
}

const styles = StyleSheet.create({
  courseDescriptionContainer: {
    justifyContent: "space-between",
    marginHorizontal: 20,
    marginVertical: Platform.OS === "web" ? 20 : 0,
  },
  courseInfoTitleContainer: {
    flexDirection: "row",
    gap: 10,
    marginVertical: 10,
  },
  courseInfoTitle: {
    fontWeight: "bold",
    fontSize: 18,
  },
  courseDescription: {
    fontSize: 18,
    paddingVertical: 10,
  },
});
