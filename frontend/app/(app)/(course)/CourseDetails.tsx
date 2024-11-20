import { useLocalSearchParams } from "expo-router";
import { View, ScrollView, Text } from "@/components/Themed";
import { Feather, MaterialIcons, AntDesign } from "@expo/vector-icons";
import { StyleSheet, Image, Animated } from "react-native";
import { useState, useRef, useMemo, useEffect } from "react";
import Button from "@/components/common/Button";
import { StickyHeader } from "@/components/common/StickyHeader";
import { useAuthContext } from "@/context/AuthProvider";
import { router } from "expo-router";
import TableOfContents from "./components/TableOfContents";
import { useCourses } from "@/hooks/useCourses";
import useTheme from "@/hooks/useTheme";
import { useUnits } from "@/hooks/useUnits";
import { Course } from "@/types/courses";
import { useProgress } from "@/hooks/useProgress";
import { Card, Divider, Text as PaperText } from "react-native-paper";

export default function CourseDetails() {
  const { user } = useAuthContext();
  const { courseID } = useLocalSearchParams();

  const { course, isCoursePending, courseError } = useProgress({
    user_id: 4,
    course_id: parseInt(courseID[0]),
    filter: "all",
    type: "summary",
  });

  //  const {units: {isPending: isUnitsPending, data: units, error: unitsError}} = useUnits()
  const { colors } = useTheme();
  const TOCAnimationRef = useRef(new Animated.Value(0)).current;
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isCurrentModulePressed, setIsCurrentModulePressed] = useState(false);

  console.log("COURSE OUTLINE", course);

  const animatedHeight = TOCAnimationRef.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 150],
  });

  const toggleCollapseTOC = () => {
    Animated.timing(TOCAnimationRef, {
      toValue: isCollapsed ? 0 : 1,
      duration: 300,
      useNativeDriver: false,
    }).start(() => setIsCollapsed(!isCollapsed));
  };

  if (isCoursePending) {
    return <Text>Loading...</Text>;
  }

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
        },
      ]}
    >
      <StickyHeader
        cpus={user.data.cpus}
        strikeCount={user.data.streaks?.length ?? 0}
        userAvatar={null}
        onAvatarPress={() => {
          router.push("/profile");
        }}
      />
      <ScrollView
        contentContainerStyle={[
          styles.scrollView,
          { backgroundColor: colors.viewBackground },
        ]}
      >
        <View style={styles.container}>
          {course ? (
            <>
              <View>
                <Image
                  source={{
                    uri: "https://cdn.iconscout.com/icon/free/png-256/javascript-2752148-2284965.png",
                  }}
                  style={styles.icon}
                />
                <Text style={styles.courseTitle}>{course.name}</Text>
                {course.authors.map((author) => (
                  <Text key={author.id} style={styles.courseAuthor}>
                    {author.name}
                  </Text>
                ))}
                <View style={styles.courseMetricsContainer}>
                  <Text>
                    <Feather name={"percent"} size={15} />{" "}
                    {" " + course?.difficulty_level}
                  </Text>
                  <Text>
                    <Feather name={"clock"} size={15} />
                    {" " + course.duration}
                  </Text>
                  <Text>
                    <Feather name={"star"} size={15} />
                    {" " + course.rating}
                  </Text>
                </View>

                <Card
                  onPress={() =>
                    router.navigate(
                      `CourseDetails/?courseID=${course.id}` as any
                    )
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
                    title={`Unit ${course.current_unit.unit_number} Module ${course.current_module?.module_number}`}
                    titleVariant="titleSmall"
                  />
                  <Card.Content>
                    <PaperText variant="titleLarge">
                      {course.current_module?.name}
                    </PaperText>
                    <PaperText variant="bodyMedium">
                      {course.current_module?.description}
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
                      onPress={() => {}}
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

                {/* TABLE OF CONTENTS */}
                <TableOfContents units={course.units} />

                <View style={styles.separator} />
                <View style={styles.courseDescriptionContainer}>
                  <View style={styles.courseInfoTitleContainer}>
                    <MaterialIcons
                      name="description"
                      size={24}
                      color={colors.icon}
                    />
                    <Text style={styles.courseInfoTitle}>Description</Text>
                  </View>
                  <Text style={styles.courseDescription}>
                    {course.description}
                  </Text>
                  <View style={styles.courseInfoTitleContainer}>
                    <AntDesign name="pushpin" size={24} color={colors.icon} />
                    <Text style={styles.courseInfoTitle}>
                      {course.requirements}
                    </Text>
                  </View>
                  <Text style={styles.courseDescription}>
                    {course.requirements}
                  </Text>
                  <View style={styles.courseInfoTitleContainer}>
                    <AntDesign
                      name="codesquare"
                      size={24}
                      color={colors.icon}
                    />
                    <Text style={styles.courseInfoTitle}>
                      What you will learn
                    </Text>
                  </View>
                  <Text style={styles.courseDescription}>
                    {course.what_you_learn}
                  </Text>
                </View>
              </View>
            </>
          ) : (
            <Text>Course not found.</Text>
          )}
        </View>
      </ScrollView>
      <View
        style={[
          styles.stickyFooter,
          { backgroundColor: colors.secondaryBackground },
        ]}
      >
        <Button
          icon={{
            name: "arrow-left",
            size: 22,
            color: colors.buttonText,
            position: "middle",
          }}
          style={{ backgroundColor: colors.buttonBackground }}
          textStyle={{ color: colors.buttonText }}
          onPress={() => router.back()}
        />
        <Button
          title="Start Course"
          style={{ backgroundColor: colors.buttonBackground, width: "70%" }}
          textStyle={{ color: colors.buttonText }}
          onPress={() => console.log("Start Course")}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flexGrow: 1,
    justifyContent: "flex-start",
    paddingVertical: 15,
  },
  container: {
    flex: 1,
    justifyContent: "flex-start",
  },
  courseDescriptionContainer: {
    justifyContent: "space-between",
    marginVertical: 10,
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
  separator: {
    marginVertical: 10,
    height: 1,
    backgroundColor: "#333",
    opacity: 0.2,
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
  courseDescription: {
    fontSize: 18,
    paddingVertical: 10,
  },
  courseMetricsContainer: {
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
  tocContainer: {
    width: "80%",
    marginVertical: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    alignSelf: "center",
    // overflow: "hidden",
  },
  unitsContainer: {},
  tocTitle: {
    padding: 15,
    backgroundColor: "#24272E",
    color: "#fff",
    fontWeight: "bold",
  },
  stickyFooter: {
    paddingTop: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    borderTopEndRadius: 8,
    borderTopStartRadius: 8,
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
  currentModule: {
    width: "80%",
    marginVertical: 10,
    alignSelf: "center",
  },
});
