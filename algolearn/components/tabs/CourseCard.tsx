import { View, Text, Image, StyleSheet } from "react-native";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import Button from "../common/Button";

export default function CourseCard(props: {
  courseID: string;
  courseTitle: string;
  unitInfo: string;
  buttonTitle?: string;
  backgroundColor?: string;
  iconUrl: string;
  description: string;
  author?: string;
  difficultyLevel?: string;
  duration?: string;
  rating?: number;
}) {
  return (
    <View
      style={[styles.container, { backgroundColor: props.backgroundColor }]}
    >
      <Image source={{ uri: props.iconUrl }} style={styles.icon} />
      <Text style={styles.title}>{props.courseTitle}</Text>
      <Text style={styles.author}>{props.author}</Text>
      <View style={styles.info}>
        <Text>
          <Feather name={"percent"} size={15} /> {" " + props.difficultyLevel}
        </Text>
        <Text>
          <Feather name={"clock"} size={15} />
          {" " + props.duration}
        </Text>
        <Text>
          <Feather name={"star"} size={15} />
          {" " + props.rating}
        </Text>
      </View>
      {/* <Text style={styles.description}>{props.description}</Text> */}

      <View style={styles.separator} />
      <Text style={styles.unitInfo}>{props.unitInfo}</Text>
      <View style={styles.buttonContainer}>
        <Button
          title="Details"
          onPress={() =>
            router.replace(`course_details/?courseID=${props.courseID}`)
          }
          textStyle={{ fontSize: 14 }}
        />
        <Button
          title={props.buttonTitle || "Continue"}
          onPress={() => router.replace("module_session")}
          textStyle={{ fontSize: 14 }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 0.2,
    borderRadius: 8,
    marginVertical: 10,
    paddingVertical: 20,
    paddingHorizontal: 15,
  },
  separator: {
    marginVertical: 10,
    height: 1,
    backgroundColor: "#333",
    opacity: 0.2,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
    marginVertical: 18,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 5,
  },
  author: {
    fontSize: 16,
    fontStyle: "italic",
    textAlign: "center",
    marginVertical: 5,
  },
  description: {
    fontSize: 16,
    textAlign: "center",
    marginVertical: 10,
  },
  info: {
    fontSize: 20,
    textAlign: "center",
    marginVertical: 5,
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
  },
  unitInfo: {
    fontSize: 18,
    textAlign: "center",
  },
  icon: {
    width: 60,
    height: 60,
    alignSelf: "center",
    marginVertical: 10,
  },
});
