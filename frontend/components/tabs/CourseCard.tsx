import {Image, StyleSheet} from "react-native";
import {View, Text} from "../Themed";
import {router, Href} from "expo-router";
import {Feather} from "@expo/vector-icons";
import Button from "../common/Button";
import {AppRoutes} from "@/types/routes";
import {Author} from "@/types/courses";
import useTheme from "@/hooks/useTheme";

export default function CourseCard(props: {
  courseID: string;
  courseTitle: string;
  buttonTitle?: string;
  backgroundColor?: string;
  iconUrl: string;
  description: string;
  authors?: Author[];
  difficultyLevel?: string;
  duration?: string;
  rating?: number;
}) {
  const {colors} = useTheme();
  return (
    <View
      style={[styles.container, {backgroundColor: colors.cardBackground}]}
    >
      <Image source={{uri: props.iconUrl}} style={styles.icon}/>
      <Text style={styles.title}>{props.courseTitle}</Text>
      {props.authors?.map(author => <Text key={author.id} style={styles.author}>{author.name}</Text>)}
      <View style={styles.info}>
        <Text>
          <Feather name={"percent"} size={15}/> {" " + props.difficultyLevel}
        </Text>
        <Text>
          <Feather name={"clock"} size={15}/>
          {" " + props.duration}
        </Text>
        <Text>
          <Feather name={"star"} size={15}/>
          {" " + props.rating}
        </Text>
      </View>

      <View style={styles.separator}/>
      <Text style={styles.description}>{props.description}</Text>
      <View style={styles.buttonContainer}>
        <Button
          title="Details"
          onPress={() =>
            router.navigate(
              `CourseDetails/?courseID=${props.courseID}` as Href<AppRoutes>,
            )
          }
          style={{
            backgroundColor: colors.buttonBackground,
          }}
          textStyle={{
            fontSize: 14,
            color: colors.buttonText,
          }}
        />
        <Button
          title={props.buttonTitle || "Continue"}
          onPress={() =>
            router.navigate(
              `ModuleSession/?courseId=${props.courseID}&unitId=1&moduleId=41` as Href<AppRoutes>,
            )}
          style={{
            backgroundColor: colors.buttonBackground,
          }}
          textStyle={{
            fontSize: 14,
            color: colors.buttonText,
          }}
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
    backgroundColor: "transparent",
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
    backgroundColor: "transparent",
  },
  icon: {
    width: 60,
    height: 60,
    alignSelf: "center",
    marginVertical: 10,
  },
});
