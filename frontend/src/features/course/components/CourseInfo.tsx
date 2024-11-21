import { View, Text } from "@/src/components/Themed";
import { StyleSheet } from "react-native";
import { MaterialIcons, AntDesign } from "@expo/vector-icons";

export default function CourseInfo({ course, colors }: any) {
  return (
    <View style={styles.courseDescriptionContainer}>
      <InfoSection
        icon={
          <MaterialIcons name="description" size={24} color={colors.icon} />
        }
        title="Description"
        content={course.description}
      />
      <InfoSection
        icon={<AntDesign name="pushpin" size={24} color={colors.icon} />}
        title="Requirements"
        content={course.requirements}
      />
      <InfoSection
        icon={<AntDesign name="codesquare" size={24} color={colors.icon} />}
        title="What you will learn"
        content={course.what_you_learn}
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
