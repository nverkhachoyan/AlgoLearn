import { useState } from "react";
import { StyleSheet, ScrollView } from "react-native";
import { Searchbar } from "react-native-paper";
import { Text, View } from "@/src/components/Themed";
import { router } from "expo-router";
import { StickyHeader } from "@/src/components/common/StickyHeader";
import useTheme from "@/src/hooks/useTheme";
import CourseCard from "./components/CourseCard";
import { useCourses } from "@/src/hooks/useCourses";
import { useUser } from "@/src/hooks/useUser";

export default function Explore() {
  const { isAuthed, user, invalidateAuth } = useUser();
  const { colors } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const { courses } = useCourses({
    userId: 4,
    type: "summary",
    include: "progress",
    currentPage: 1,
    pageSize: 5,
    filter: "explore",
  });

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
        cpus={user.cpus ?? 0}
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
          <Searchbar
            placeholder="Explore"
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchBar}
          />
          <View style={styles.separator} />
          {courses && courses.length > 0 ? (
            courses.map((course: any) => (
              <CourseCard
                key={course.id}
                courseID={course.id.toString()}
                courseTitle={course.name}
                backgroundColor={course.backgroundColor}
                iconUrl="https://cdn.iconscout.com/icon/free/png-256/javascript-2752148-2284965.png"
                description={course.description}
                authors={course.authors}
                difficultyLevel={course.difficultyLevel}
                duration={course.duration}
                rating={course.rating}
                currentUnit={undefined}
                currentModule={undefined}
                filter="explore"
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
