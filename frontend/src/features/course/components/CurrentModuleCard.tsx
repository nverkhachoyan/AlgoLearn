import { StyleSheet } from "react-native";
import { Card, Divider, Text as PaperText } from "react-native-paper";
import Button from "@/src/components/common/Button";
import { router } from "expo-router";
import { Course } from "../types/types";

export default function CurrentModuleCard({
  course,
  isPressed,
  onPressIn,
  onPressOut,
}: {
  course: Course;
  isPressed: boolean;
  onPressIn: () => void;
  onPressOut: () => void;
}) {
  return (
    <Card
      onPress={() =>
        router.replace({
          pathname: "/(protected)/course/[courseId]/module/[moduleId]",
          params: {
            courseId: course.id,
            unitId: course.currentUnit?.id,
            moduleId: course.currentModule?.id as number,
          },
        })
      }
      style={[
        styles.currentModule,
        {
          backgroundColor: "#1d855f",
          transform: [{ scale: isPressed ? 1.02 : 1 }],
          elevation: isPressed ? 8 : 2,
        },
      ]}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      elevation={4}
    >
      <Card.Title
        title={`Unit ${course.currentUnit.unitNumber} Module ${course.currentModule?.moduleNumber}`}
        titleVariant="titleSmall"
        titleStyle={{ color: "#E8E8E8" }}
      />
      <Card.Content style={{ gap: 10 }}>
        <PaperText variant="titleLarge" style={{ color: "#E8E8E8" }}>
          {course.currentModule?.name}
        </PaperText>
        <PaperText variant="bodyMedium" style={{ color: "#E8E8E8" }}>
          {course.currentModule?.description}
        </PaperText>
      </Card.Content>
      <Divider style={styles.cardDivider} />
      <Card.Actions style={styles.cardActions}>
        <Button
          title="Jump back in"
          onPress={() => {
            router.push({
              pathname: "/(protected)/course/[courseId]/module/[moduleId]",
              params: {
                courseId: course.id,
                unitId: course.currentUnit?.id,
                moduleId: course.currentModule?.id as number,
                hasProgress: "true",
              },
            });
          }}
          style={styles.jumpButton}
          textStyle={styles.jumpButtonText}
          iconStyle={{ color: "#24272E" }}
          icon={{
            type: "feather",
            name: "arrow-right",
            position: "right",
          }}
        />
      </Card.Actions>
    </Card>
  );
}

const styles = StyleSheet.create({
  currentModule: {
    width: "90%",
    marginVertical: 10,
    alignSelf: "center",
    marginBottom: 30,
  },
  cardDivider: {
    backgroundColor: "#E8E8E8",
    borderWidth: 0.1,
    width: "80%",
    alignSelf: "center",
    marginTop: 15,
    marginBottom: 5,
  },
  cardActions: {
    flex: 1,
    flexDirection: "column",
  },
  jumpButton: {
    marginVertical: 5,
    backgroundColor: "white",
  },
  jumpButtonText: {
    fontSize: 14,
    color: "#24272E",
  },
});
