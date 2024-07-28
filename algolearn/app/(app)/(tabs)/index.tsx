import { StyleSheet } from 'react-native';
import { View, ScrollView, Text } from '@/components/Themed';
import StickyHeader from '@/components/StickyHeader';
import { useAuthContext } from '@/context/AuthProvider';
import CourseCard from '@/components/tabs/CourseCard';
import Button from '@/components/common/Button';
import { router } from 'expo-router';
import { useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCourses } from './hooks/useCourses';

export default function Home() {
  const { user, isAuthed, loading, signOut } = useAuthContext();
  const { allCourses, isCoursesPending, coursesFetchError } = useCourses();

  if (loading) {
    return <Text>Loading...</Text>;
  }

  useEffect(() => {
    if (!loading && !isAuthed && !user) {
      router.navigate('welcome');
    }
  }, [loading, isAuthed]);

  if (!isAuthed || !user) {
    return (
      <Text>
        Not logged in
        <Button
          title='Clear local storage'
          onPress={() => AsyncStorage.clear()}
        />
      </Text>
    );
  }

  if (isCoursesPending) {
    return <Text>Fetching courses...</Text>;
  }

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      stickyHeaderIndices={[0]}
    >
      <StickyHeader
        cpus={user.cpus}
        strikeCount={user.streaks?.length ?? 0}
        userAvatar={null}
        onAvatarPress={() => {
          router.push('profile');
        }}
      />
      <View style={styles.container}>
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
              iconUrl='https://cdn.iconscout.com/icon/free/png-256/javascript-2752148-2284965.png'
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginHorizontal: 16,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'flex-start',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: 'OpenSauceOne-Regular',
    alignSelf: 'center',
  },
  separator: {
    marginVertical: 16,
    height: 1,
    width: '80%',
  },
});
