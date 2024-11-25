import { useState } from "react";
import { StyleSheet, ScrollView, View } from "react-native";
import { Searchbar, Text } from "react-native-paper";

import { router } from "expo-router";
import { StickyHeader } from "@/src/components/common/StickyHeader";
import { useTheme } from "react-native-paper";
import CourseCard from "../../../src/features/course/components/CourseCard";
import { useCourses } from "@/src/hooks/useCourses";
import { useUser } from "@/src/hooks/useUser";
import { CourseSection } from "@/src/features/course/components/CourseSection";

export default function Explore() {
  const { user } = useUser();
  const { colors } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const { courses, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useCourses({
      userId: 4,
      currentPage: 1,
      pageSize: 5,
      type: "summary",
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
          { backgroundColor: colors.background },
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
          <CourseSection
            title="Explore"
            courses={courses}
            hasNextPage={hasNextPage}
            isFetchingNextPage={isFetchingNextPage}
            onLoadMore={() => {}}
            filter="explore"
          />
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
    // fontFamily: "OpenSauceOne-Regular",
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
