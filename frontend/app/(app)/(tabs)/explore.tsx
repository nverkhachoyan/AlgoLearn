import { useState } from "react";
import { StyleSheet, ScrollView } from "react-native";
import { Searchbar } from "react-native-paper";
import { Text, View } from "@/components/Themed";
import Button from "@/components/common/Button";
import { useAuthContext } from "@/context/AuthProvider";
import { router } from "expo-router";
import { StickyHeader } from "@/components/common/StickyHeader";
import useTheme from "@/hooks/useTheme";
import CourseCard from "./components/CourseCard";
import { useCourses } from "@/hooks/useCourses";

export default function Explore() {
  const { isAuthed, user, invalidateAuth } = useAuthContext();
  const { colors } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const { coursesOutline, isCoursesOutlinePending, coursesOutlineFetchError } =
    useCourses();

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
        cpus={user.data.cpus ?? 0}
        strikeCount={user.data.streaks?.length ?? 0}
        userAvatar={user.data.profile_picture_url}
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
          <Searchbar
            placeholder="Explore"
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchBar}
          />
          <View style={styles.separator} />
          {coursesOutline && coursesOutline.length > 0 ? (
            coursesOutline.map((course: any) => (
              <CourseCard
                key={course.id}
                courseID={course.id.toString()}
                courseTitle={course.name}
                backgroundColor={course.background_color}
                iconUrl="https://cdn.iconscout.com/icon/free/png-256/javascript-2752148-2284965.png"
                description={course.description}
                authors={course.authors}
                difficultyLevel={course.difficulty_level}
                duration={course.duration}
                rating={course.rating}
              />
            ))
          ) : (
            <Text>No courses found</Text>
          )}

          <View style={styles.separator} />

          <Text style={styles.title}>Other Topics</Text>
          <View style={styles.separator} />
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
  scrollContent: {
    flexGrow: 1,
    marginHorizontal: 16,
    paddingVertical: 16,
    justifyContent: "flex-start",
  },
  searchBar: {
    borderRadius: 5,
  },
});
