import { StyleSheet } from "react-native";
import { View, ScrollView, Text } from "@/components/Themed";
import { useAuthContext } from "@/context/AuthProvider";
import CourseCard from "@/components/tabs/CourseCard";
import Button from "@/components/common/Button";
import { ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { useEffect, useRef } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useUser } from "@/hooks/useUser";
import { useCourses } from "./hooks/useCourses";
import useTheme from "@/hooks/useTheme";
import { StickyHeader } from "@/components/common/StickyHeader";

export default function Home() {
  const { isAuthed, loading } = useAuthContext();
  const {
    user: { data: user },
  } = useUser();
  const { allCourses, isCoursesPending, coursesFetchError } = useCourses();
  const { colors } = useTheme();
  const animation = useRef(null);

  if (loading) {
    return <Text>Loading...</Text>;
  }

  useEffect(() => {
    if (!loading && !isAuthed && !user) {
      router.navigate("/welcome");
    }
  }, [loading, isAuthed]);

  if (!isAuthed || !user) {
    return (
      <Text>
        Not logged in
        <Button
          title="Clear local storage"
          onPress={() => AsyncStorage.clear()}
        />
      </Text>
    );
  }

  if (isCoursesPending) {
    return (
      <View
        style={{
          flex: 1,
          alignSelf: "center",
          justifyContent: "center",
          gap: 16,
        }}
      >
        <ActivityIndicator size="large" color="#25A879" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StickyHeader
        cpus={user.cpus}
        strikeCount={user.streaks?.length ?? 0}
        userAvatar={user.profile_picture_url}
        onAvatarPress={() => {
          router.push("/profile");
        }}
      />

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { backgroundColor: colors.viewBackground },
        ]}
      >
        <View>
          <View style={styles.separator} />

          <Text style={styles.title}>Currently Learning</Text>
          <View style={styles.separator} />
          {allCourses && allCourses.length > 0 ? (
            allCourses.map((course: any) => (
              <CourseCard
                key={course.id}
                courseID={course.id.toString()}
                courseTitle={course.name}
                unitInfo={course.description}
                // backgroundColor={course.background_color}
                iconUrl="https://cdn.iconscout.com/icon/free/png-256/javascript-2752148-2284965.png"
                description={course.description}
                author={course.author}
                difficultyLevel={course.difficulty_level}
                duration={course.duration}
                rating={course.rating}
              />
            ))
          ) : (
            <Text>No courses found</Text>
          )}
          {/* <CourseCard
          courseTitle="The JavaScript Ecosystem"
          unitInfo="Unit 1: In the beginning, there was Eden..."
          iconUrl="https://cdn.iconscout.com/icon/free/png-256/javascript-2752148-2284965.png"
          buttonTitle="Jump right back in"
        /> */}
          <View style={styles.separator} />

          <Text style={styles.title}>Other Topics</Text>
          <View style={styles.separator} />
          {/* <CourseCard
          courseTitle="Data Structures"
          unitInfo="Unit 1: Who is this Al Gore Rhythm?"
          iconUrl="https://cdn.iconscout.com/icon/free/png-256/javascript-2752148-2284965.png"
          buttonTitle="Jump right back in"
        /> */}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent",
  },
  scrollContent: {
    flexGrow: 1,
    marginHorizontal: 16,
    paddingVertical: 16,
    justifyContent: "flex-start",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    fontFamily: "OpenSauceOne-Regular",
    alignSelf: "center",
  },
  separator: {
    marginVertical: 10,
    height: 1,
    width: "80%",
    alignSelf: "center",
  },
  headerItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  logo: {
    width: 36,
    height: 36,
  },
  stickyHeaderTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
});
