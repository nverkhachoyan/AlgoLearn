import { StyleSheet, Image, View } from "react-native";
import { Text } from "react-native-paper";
import { Feather } from "@expo/vector-icons";

export default function CourseHeader({ course }: any) {
  return (
    <View>
      <Image
        source={{
          uri: "https://cdn.iconscout.com/icon/free/png-256/javascript-2752148-2284965.png",
        }}
        style={styles.icon}
      />
      <Text style={styles.courseTitle}>{course.name}</Text>
      {course.authors.map((author: any) => (
        <Text key={author.id} style={styles.courseAuthor}>
          {author.name}
        </Text>
      ))}
      <View style={styles.courseMetricsContainer}>
        <Text>
          <Feather name="percent" size={15} /> {course?.difficulty_level}
        </Text>
        <Text>
          <Feather name="clock" size={15} /> {course.duration}
        </Text>
        <Text>
          <Feather name="star" size={15} /> {course.rating}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  icon: {
    width: 60,
    height: 60,
    alignSelf: "center",
    marginVertical: 10,
  },
  courseTitle: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 5,
  },
  courseAuthor: {
    fontSize: 16,
    fontStyle: "italic",
    textAlign: "center",
    marginVertical: 5,
  },
  courseMetricsContainer: {
    fontSize: 20,
    textAlign: "center",
    marginVertical: 5,
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
  },
});
