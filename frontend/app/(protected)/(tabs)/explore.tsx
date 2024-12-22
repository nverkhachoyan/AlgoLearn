import { useState } from "react";
import { StyleSheet, ScrollView, View } from "react-native";
import { Searchbar } from "react-native-paper";
import { router } from "expo-router";
import { StickyHeader } from "@/src/components/common/StickyHeader";
import { useTheme } from "react-native-paper";
import { useCourses } from "@/src/features/course/hooks/useCourses";
import { useUser } from "@/src/features/user/hooks/useUser";
import { CourseSection } from "@/src/features/course/components/CourseList";
import { Colors } from "@/constants/Colors";

export default function Explore() {
  const { user } = useUser();
  const { colors }: { colors: Colors } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const { courses, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useCourses({
      pageSize: 5,
      isAuthenticated: false,
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
        onAvatarPress={() => router.push("/(protected)/(profile)")}
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
            hasProgress={false}
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
