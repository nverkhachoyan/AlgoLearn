import { Image, StyleSheet } from "react-native";
import { View, Text } from "@/src/components/Themed";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import Button from "@/src/components/common/Button";
import { Author, Unit } from "@/src/features/course/types";
import useTheme from "@/src/hooks/useTheme";
import { Card, Divider, Text as PaperText } from "react-native-paper";
import { useState } from "react";
import { Module } from "@/src/features/module/types/types";

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
  currentUnit?: Unit;
  currentModule?: Module;
  filter?: string;
}) {
  const { colors } = useTheme();
  const [isCoursePressed, setIsCoursePressed] = useState(false);
  const [isCurrentModulePressed, setIsCurrentModulePressed] = useState(false);

  return (
    <Card
      style={[
        styles.container,
        {
          backgroundColor: isCoursePressed
            ? colors.cardBackground
            : colors.cardBackground,
          transform: [{ scale: isCoursePressed ? 1.02 : 1 }],
          elevation: isCoursePressed ? 8 : 2,
        },
      ]}
      onPress={() =>
        router.push({
          pathname: "/course/[courseId]/details",
          params: {
            courseId: props.courseID,
          },
        })
      }
      onPressIn={() => setIsCoursePressed(true)}
      onPressOut={() => setIsCoursePressed(false)}
      mode="elevated"
      theme={{
        animation: {
          scale: 0.98,
        },
      }}
    >
      <Image source={{ uri: props.iconUrl }} style={styles.icon} />
      <Text style={styles.title}>{props.courseTitle}</Text>
      {props.authors?.map((author) => (
        <Text key={author.id} style={styles.author}>
          {author.name}
        </Text>
      ))}
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

      <View style={styles.separator} />
      <Text style={styles.description}>{props.description}</Text>

      <Divider style={{ marginVertical: 5 }} />
      {props.currentUnit && (
        <>
          <Card
            onPress={() =>
              router.push({
                pathname: "/course/[courseId]/module/[moduleId]/module-session",
                params: {
                  courseId: props.courseID, // Make sure this is passed as a prop
                  moduleId: props.currentModule?.id as number,
                  unitId: props.currentUnit?.id,
                  userId: 4,
                  type: "full",
                  include: "progress",
                },
              })
            }
            style={[
              styles.currentModule,
              {
                backgroundColor: "#1d855f",
                transform: [{ scale: isCurrentModulePressed ? 1.02 : 1 }],
                elevation: isCurrentModulePressed ? 8 : 2,
              },
            ]}
            onPressIn={() => setIsCurrentModulePressed(true)}
            onPressOut={() => setIsCurrentModulePressed(false)}
            elevation={4}
          >
            <Card.Title
              title={`Unit ${props.currentUnit.unitNumber} Module ${props.currentModule?.moduleNumber}`}
              titleVariant="titleSmall"
            />
            <Card.Content>
              <PaperText variant="titleLarge">
                {props.currentModule?.name}
              </PaperText>
              <PaperText variant="bodyMedium">
                {props.currentModule?.description}
              </PaperText>
            </Card.Content>
            <Divider
              style={{
                backgroundColor: "#E8E8E8",
                borderWidth: 0.1,
                width: "80%",
                alignSelf: "center",
                marginTop: 15,
                marginBottom: 5,
              }}
            />
            <Card.Actions
              style={{
                flex: 1,
                flexDirection: "column",
              }}
            >
              <Button
                title="Jump back in"
                onPress={() =>
                  router.push({
                    pathname:
                      "/(app)/course/[courseId]/module/[moduleId]/module-session",
                    params: {
                      courseId: props.courseID,
                      moduleId: props.currentModule?.id as number,
                      unitId: props.currentUnit?.id,
                      userId: 4,
                      type: "full",
                      include: "progress",
                    },
                  })
                }
                style={{
                  marginVertical: 5,
                  backgroundColor: "white",
                }}
                textStyle={{
                  fontSize: 14,
                  color: "#24272E",
                }}
                iconStyle={{
                  color: "#24272E",
                }}
                icon={{
                  type: "feather",
                  name: "arrow-right",
                  position: "right",
                }}
              />
            </Card.Actions>
          </Card>
        </>
      )}

      {props.filter === "explore" && (
        <View style={styles.buttonContainer}>
          <Button
            title="Details"
            onPress={() =>
              router.navigate(
                `CourseDetails/?courseID=${props.courseID}` as any
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
            title={props.buttonTitle || "Enroll"}
            onPress={() =>
              router.navigate(
                `ModuleSession/?courseId=${props.courseID}&unitId=1&moduleId=41` as any
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
        </View>
      )}
    </Card>
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
  currentModule: {
    marginVertical: 10,
  },
});
