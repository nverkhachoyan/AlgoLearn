import { useLocalSearchParams } from 'expo-router';
import { View, ScrollView, Text } from '@/components/Themed';
import { Feather, MaterialIcons, AntDesign } from '@expo/vector-icons';
import { StyleSheet, Image, Animated } from 'react-native';
import { useState, useRef } from 'react';
import Button from '@/components/common/Button';
import StickyHeader from '@/components/StickyHeader';
import { useAuthContext } from '@/context/AuthProvider';
import { router } from 'expo-router';
import TableOfContents from './components/TableOfContents';
import { useCourses } from '../hooks/useCourses';

export default function CourseDetails() {
  const { user } = useAuthContext();
  const { courseID } = useLocalSearchParams();
  const { allCourses, isCoursesPending } = useCourses();
  const units = [
    {
      unitNumber: '1',
      unitName: 'algorithms',
      modules: {
        '1': 'module 1',
        '2': 'module 2',
        '3': 'module 3',
      },
    },
    {
      unitNumber: '2',
      unitName: 'whatever',
      modules: {
        '1': 'module 1',
        '2': 'module 2',
        '3': 'module 3',
      },
    },
    {
      unitNumber: '3',
      unitName: 'something',
      modules: {
        '1': 'module 1',
        '2': 'module 2',
        '3': 'module 3',
        '4': 'module 4',
        '5': 'module 5',
      },
    },
  ];

  const TOCAnimationRef = useRef(new Animated.Value(0)).current;
  const course = allCourses.find(
    (course: any) => course.id.toString() === courseID
  );
  const [isCollapsed, setIsCollapsed] = useState(false);
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

  if (!allCourses || !user || isCoursesPending) {
    return <Text>Loading...</Text>;
  }

  return (
    <ScrollView
      contentContainerStyle={styles.scrollView}
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
        {course ? (
          <>
            <View>
              <Image
                source={{
                  uri: 'https://cdn.iconscout.com/icon/free/png-256/javascript-2752148-2284965.png',
                }}
                style={styles.icon}
              />
              <Text style={styles.courseTitle}>{course.name}</Text>
              <Text style={styles.courseAuthor}>{course.author}</Text>
              <View style={styles.courseMetricsContainer}>
                <Text>
                  <Feather name={'percent'} size={15} />{' '}
                  {' ' + course?.difficulty_level}
                </Text>
                <Text>
                  <Feather name={'clock'} size={15} />
                  {' ' + course.duration}
                </Text>
                <Text>
                  <Feather name={'star'} size={15} />
                  {' ' + course.rating}
                </Text>
              </View>
              {/* TABLE OF CONTENTS */}
              <TableOfContents units={units} />

              <View style={styles.separator} />
              <View style={styles.courseDescriptionContainer}>
                <View style={styles.courseInfoTitleContainer}>
                  <MaterialIcons name='description' size={24} />
                  <Text style={styles.courseInfoTitle}>Description</Text>
                </View>
                <Text style={styles.courseDescription}>
                  This course provides an in-depth look at the fundamentals of
                  computer science. You will learn the basics of algorithms,
                  data structures, and software engineering principles.
                </Text>
                <View style={styles.courseInfoTitleContainer}>
                  <AntDesign name='pushpin' size={24} />
                  <Text style={styles.courseInfoTitle}>Requirements</Text>
                </View>
                <Text style={styles.courseDescription}>
                  No prior programming experience is required. A willingness to
                  learn and a basic understanding of mathematics is helpful.
                </Text>
                <View style={styles.courseInfoTitleContainer}>
                  <AntDesign name='codesquare' size={24} />
                  <Text style={styles.courseInfoTitle}>
                    What you will learn
                  </Text>
                </View>
                <Text style={styles.courseDescription}>
                  By the end of this course, you will have a solid understanding
                  of algorithms, data structures, and problem-solving
                  techniques. You will be able to write efficient code and
                  understand the principles of software engineering.
                </Text>
              </View>
            </View>
            <View style={styles.buttonContainer}>
              <Button
                title='Start Course'
                onPress={() => console.log('Start Course')}
              />
            </View>
          </>
        ) : (
          <Text>Course not found.</Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flexGrow: 1,
    justifyContent: 'flex-start',
  },
  container: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  courseDescriptionContainer: {
    justifyContent: 'space-between',
    marginVertical: 10,
    marginHorizontal: 20,
  },
  courseInfoTitleContainer: {
    flexDirection: 'row',
    gap: 10,
    marginVertical: 10,
  },
  courseInfoTitle: {
    fontWeight: 'bold',
    fontSize: 18,
  },
  separator: {
    marginVertical: 10,
    height: 1,
    backgroundColor: '#333',
    opacity: 0.2,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginVertical: 18,
  },
  courseTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 5,
  },
  courseAuthor: {
    fontSize: 16,
    fontStyle: 'italic',
    textAlign: 'center',
    marginVertical: 5,
  },
  courseDescription: {
    fontSize: 18,
    paddingVertical: 10,
  },
  courseMetricsContainer: {
    fontSize: 20,
    textAlign: 'center',
    marginVertical: 5,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
  },
  unitInfo: {
    fontSize: 18,
    textAlign: 'center',
  },
  icon: {
    width: 60,
    height: 60,
    alignSelf: 'center',
    marginVertical: 10,
  },
  tocContainer: {
    width: '80%',
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    alignSelf: 'center',
    // overflow: "hidden",
  },
  unitsContainer: {},
  tocTitle: {
    padding: 15,
    backgroundColor: '#24272E',
    color: '#fff',
    fontWeight: 'bold',
  },
});
