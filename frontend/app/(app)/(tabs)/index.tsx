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


interface Course {
  id: number;
  name: string;
  description: string;
  background_color: string;
  authors: Array<{ id: number; name: string }>;
  difficulty_level: string;
  duration: number;
  rating: number;
  current_unit: any | null;
  current_module: any | null;
}


export default function Home() {
  const { user, isAuthed, invalidateAuth, isInitialized } = useAuthContext();
  const {
    courses: learningCourses,
    fetchNextPage: fetchNextLearning,
    hasNextPage: hasNextLearning,
    isFetchingNextPage: isFetchingNextLearning,
    isLoading: isLoadingLearning,
    error: learningError,
  } = useProgress({ 
    user_id: 4, 
    page: 1, 
    pageSize: 5, 
    type: "summary", 
    filter: "learning" 
  });
  const {
    courses: exploreCourses,
    fetchNextPage: fetchNextExplore,
    hasNextPage: hasNextExplore,
    isFetchingNextPage: isFetchingNextExplore,
    isLoading: isLoadingExplore,
    error: exploreError,
  } = useProgress({ 
    user_id: 4, 
    page: 1, 
    pageSize: 5, 
    type: "summary", 
    filter: "explore" 
  });
  const { colors } = useTheme();
  const { showToast } = useToast();

  const handleLoadMoreLearning = () => {
    if (hasNextLearning && !isFetchingNextLearning) {
      fetchNextLearning();
    }
  };

  const handleLoadMoreExplore =  () => {
    if (hasNextExplore && !isFetchingNextExplore) {
      fetchNextExplore()
    }
  }

  if (!isInitialized) {
    return  <ActivityIndicator size="large" color="#25A879" />;
  }

   // Then check if user is authenticated
   if (!isAuthed) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.title}>Please sign in</Text>
        <Button
          title="Go to Sign In"
          onPress={() => router.push("signup" as any)}
        />
      </View>
    );
  }
  
  if (user.isPending) {
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

  if (learningError || exploreError) {
    showToast("Failed to fetch courses");
  }


  const renderCourseList = (courseList: Course[], emptyMessage: string, filter: string) => {
    if (courseList.length === 0) {
      return <Text style={styles.emptyMessage}>{emptyMessage}</Text>;
    }

    return courseList.map((course) => {

      if (filter === "learning") {
        return <CourseCard
        key={`course-${course.id}`}
        courseID={course.id.toString()}
        courseTitle={course.name}
        backgroundColor={course.background_color || colors.cardBackground}
        iconUrl="https://cdn.iconscout.com/icon/free/png-256/javascript-2752148-2284965.png"
        description={course.description}
        authors={course.authors}
        difficultyLevel={course.difficulty_level}
        duration={course.duration + ''}
        rating={course.rating}
        currentUnit={course.current_unit}
        currentModule={course.current_module}
        filter="learning"
      />
      } else if (filter === "explore") {
        return <CourseCard
        key={`course-${course.id}`}
        courseID={course.id.toString()}
        courseTitle={course.name}
        backgroundColor={course.background_color || colors.cardBackground}
        iconUrl="https://cdn.iconscout.com/icon/free/png-256/javascript-2752148-2284965.png"
        description={course.description}
        authors={course.authors}
        difficultyLevel={course.difficulty_level}
        duration={course.duration + ''}
        rating={course.rating}
        filter="explore"
      />
      }
    });
  };

  return (
    <View style={styles.container}>
      <StickyHeader
        cpus={user.data?.cpus ?? 0}
        strikeCount={user.data?.streaks?.length ?? 0}
        userAvatar={user.data?.profile_picture_url}
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
          
          {renderCourseList(learningCourses, "No courses in progress", "learning")}

          <View style={styles.loadMoreContainer}>
            {hasNextExplore && (
              <Button
                title="Load more"
                icon={{
                  type: "ionicons",
                  name: 'reload-outline',
                  position: 'right',
                  color: colors.textContrast
                }}
                onPress={handleLoadMoreLearning}
                style={{
                  backgroundColor: colors.buttonBackground,
                }}
                textStyle={{
                  fontSize: 14,
                  color: colors.buttonText,
                }}
              />
            )}
            
            {isFetchingNextLearning && (
              <ActivityIndicator size="small" color="#25A879" />
            )}
            
            {!hasNextLearning && learningCourses?.length > 0 && (
              <Text style={styles.endMessage}>No more courses to load</Text>
            )}
          </View>

          <View style={styles.separator} />
          <Text style={styles.title}>Explore Courses</Text>
          <View style={styles.separator} />
          
          {renderCourseList(exploreCourses, "No courses to explore", "explore")}

          <View style={styles.loadMoreContainer}>
            {hasNextExplore && (
              <Button
                title="Load more"
                icon={{
                  type: "ionicons",
                  name: 'reload-outline',
                  position: 'right',
                  color: colors.textContrast
                }}
                onPress={handleLoadMoreExplore}
                style={{
                  backgroundColor: colors.buttonBackground,
                }}
                textStyle={{
                  fontSize: 14,
                  color: colors.buttonText,
                }}
              />
            )}
            
            {isFetchingNextExplore && (
              <ActivityIndicator size="small" color="#25A879" />
            )}
            
            {!hasNextExplore && exploreCourses?.length > 0 && (
              <Text style={styles.endMessage}>No more courses to load</Text>
            )}
          </View>
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
  emptyMessage: {
    textAlign: 'center',
    padding: 16,
    color: '#666',
    fontStyle: 'italic',
  },
});
