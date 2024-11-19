import {StyleSheet, ActivityIndicator} from "react-native";
import {View, ScrollView, Text} from "@/components/Themed";
import {useAuthContext} from "@/context/AuthProvider";
import CourseCard from "@/components/tabs/CourseCard";
import Button from "@/components/common/Button";
import {router} from "expo-router";
import useTheme from "@/hooks/useTheme";
import {StickyHeader} from "@/components/common/StickyHeader";
import { useProgress } from "@/hooks/useProgress";
import useToast from "@/hooks/useToast";

export default function Home() {
  const { user, invalidateAuth } = useAuthContext();
  const {
    courses,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
  } = useProgress({ user_id: 4, pageSize: 5 });
  const { colors } = useTheme();
  const { showToast } = useToast();

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  if (isLoading || user.isPending || !user.data) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#25A879" />
        <Button
          title="Clear local storage"
          onPress={() => {
            invalidateAuth();
          }}
        />
      </View>
    );
  }

  if (error) {
    showToast("Failed to fetch courses");
  }

  return (
    <View style={styles.container}>
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
          <Text style={styles.title}>Currently Learning</Text>
          <View style={styles.separator} />
          
          {courses && courses.length > 0 ? (
            <>
              {courses.map((course) => (
                <CourseCard
                  key={`course-${course.id}`}
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
              ))}

              <View style={styles.loadMoreContainer}>
              {hasNextPage && (
                  <Button
                  title={"Load more"}
                  icon={{
                    type: "ionicons",
                    name: 'reload-outline',
                    position: 'right',
                    color: colors.textContrast
                  }}
                  onPress={handleLoadMore}
                  style={{
                    backgroundColor: colors.buttonBackground,
                  }}
                  textStyle={{
                    fontSize: 14,
                    color: colors.buttonText,
                  }}
                />
              )}
              
              {isFetchingNextPage && (
                <ActivityIndicator size="small" color="#25A879" />
              )}
              
              {!hasNextPage && courses.length > 0 && (
                <Text style={styles.endMessage}>No more courses to load</Text>
              )}
              </View>
            </>
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
  loadingContainer: {
    flex: 1,
    alignSelf: "center",
    justifyContent: "center",
    gap: 16,
  },
  loadMoreContainer: {
    flex: 1,
    alignSelf: "center",
    justifyContent: "center",
    gap: 16,
    marginTop: 10
  },
  endMessage: {
    textAlign: "center",
    padding: 10,
    color: "#666",
  },
});
