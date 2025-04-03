import { useLocalSearchParams, router } from 'expo-router';
import { StyleSheet, View, ScrollView, Platform, useWindowDimensions } from 'react-native';
import { useState } from 'react';
import {
  useCourse,
  useStartCourse,
  useResetCourseProgress,
} from '@/src/features/course/hooks/useCourses';
import { StickyHeader } from '@/src/components/StickyHeader';
import CourseHeader from '@/src/features/course/components/CourseHeader';
import CurrentModuleCard from '@/src/features/course/components/CurrentModuleCard';
import TableOfContents from '@/src/features/course/components/TableOfContents';
import CourseInfo from '@/src/features/course/components/CourseInfo';
import { useUser } from '@/src/features/user/hooks/useUser';
import { Colors } from '@/constants/Colors';
import { Spinning } from '@/src/components/Spinning';
import { Alert } from 'react-native';
import { useAuth } from '@/src/features/auth/AuthContext';
import { buildImgUrl } from '@/src/lib/utils/transform';
import Conditional from '@/src/components/Conditional';
import CourseFooter from '@/src/features/course/components/CourseFooter';
import { Text } from '@/src/components/ui';
import { useAppTheme } from '@/src/context/ThemeContext';
import { Feather } from '@expo/vector-icons';
import Button from '@/src/components/Button';

const MAX_CONTENT_WIDTH = 1200;

export default function CourseDetails() {
  const { courseId, hasProgress } = useLocalSearchParams();
  const { theme } = useAppTheme();
  const { colors }: { colors: Colors } = theme;
  const { user } = useUser();
  const [isCurrentModulePressed, setIsCurrentModulePressed] = useState(false);
  const { isAuthed } = useAuth();
  const { course, isLoading } = useCourse({
    courseId: parseInt(courseId as string),
    isAuthed: true,
    hasProgress: hasProgress === 'true',
  });
  const { startCourse } = useStartCourse(parseInt(courseId as string));
  const { resetCourseProgress } = useResetCourseProgress(parseInt(courseId as string));
  const { width } = useWindowDimensions();
  const isLargeScreen = width >= 1024;
  const isMediumScreen = width >= 768 && width < 1024;

  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    headerContainer: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 1,
    },
    webHeader: {
      position: 'fixed',
      backgroundColor: `${colors.surface}F2`,
    },
    scrollView: {
      flexGrow: 1,
      paddingVertical: 15,
      paddingHorizontal: Platform.OS === 'web' ? 0 : 15,
    },
    webScrollView: {
      alignItems: 'center',
    },
    content: {
      flex: 1,
      gap: 20,
      width: '100%',
    },
    webContent: {
      maxWidth: MAX_CONTENT_WIDTH,
      paddingHorizontal: 40,
    },
    tabletContent: {
      maxWidth: '100%',
      paddingHorizontal: 24,
    },
    webLayout: {
      flexDirection: 'row',
      gap: 40,
    },
    mobileLayout: {
      flexDirection: 'column',
      gap: 20,
    },
    webMainContent: {
      flex: 2,
    },
    mobileMainContent: {
      width: '100%',
    },
    webSidebar: {
      flex: 1,
      minWidth: 300,
      maxWidth: 400,
    },
    mobileSidebar: {
      width: '100%',
    },
    separator: {
      marginVertical: 10,
      height: 1,
      backgroundColor: colors.outlineVariant,
      opacity: 0.5,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });

  const navigateToModule = ({
    courseId,
    unitId,
    moduleId,
  }: {
    courseId: number;
    unitId: number;
    moduleId: number;
  }) => {
    router.push({
      pathname: '/(protected)/course/[courseId]/module/[moduleId]',
      params: {
        courseId,
        unitId,
        moduleId,
      },
    });
  };

  const handleStartCourse = async () => {
    if (course?.currentModule) {
      navigateToModule({
        courseId: parseInt(courseId as string),
        unitId: course.currentUnit.id,
        moduleId: course.currentModule.id,
      });
    } else {
      try {
        const response = await startCourse();
        if (response?.moduleId && response?.unitId) {
          navigateToModule({
            courseId: parseInt(courseId as string),
            unitId: response.unitId,
            moduleId: response.moduleId,
          });
        } else {
          router.dismissTo({
            pathname: '/(protected)/(tabs)',
          });
        }
      } catch (error) {
        console.log('Failed to start the course', error);
        Alert.alert('Error', 'Failed to start the course. Please try again.');
      }
    }
  };

  const handleRestartCourse = async () => {
    Alert.alert(
      'Restart Course',
      'Are you sure you want to restart this course? All progress will be lost.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Restart',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await resetCourseProgress();
              if (response?.success) {
                router.dismissTo({
                  pathname: '/(protected)/(tabs)',
                });
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to restart course. Please try again.');
            }
          },
        },
      ]
    );
  };

  if (isLoading) {
    return <Spinning />;
  }

  if (!course) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: colors.background,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text variant="headline" style={{ fontSize: 20, fontWeight: 'bold' }}>
            Course not found.
          </Text>
          <Button
            title="Go Back"
            icon={{ name: 'arrow-left', position: 'left' }}
            onPress={() => router.back()}
            style={{ marginLeft: 10 }}
          />
        </View>
      </View>
    );
  }

  const imgURL = buildImgUrl('courses', course?.folderObjectKey, course?.imgKey, course?.mediaExt);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StickyHeader
        cpus={user?.cpus || 0}
        streak={user?.streak || 0}
        onAvatarPress={() => user && router.push('/(protected)/(profile)')}
      />

      <ScrollView
        contentContainerStyle={[styles.scrollView, isLargeScreen && styles.webScrollView]}
      >
        <View
          style={[
            styles.content,
            isLargeScreen && styles.webContent,
            isMediumScreen && styles.tabletContent,
          ]}
        >
          <CourseHeader course={course} imgURL={imgURL} />

          {!isLargeScreen && course.units && (
            <TableOfContents courseId={parseInt(courseId as string)} units={course.units} />
          )}

          <View style={isLargeScreen ? styles.webLayout : styles.mobileLayout}>
            <View style={isLargeScreen ? styles.webMainContent : styles.mobileMainContent}>
              <Conditional
                condition={course.currentModule != undefined}
                renderTrue={() => (
                  <CurrentModuleCard
                    course={course}
                    isPressed={isCurrentModulePressed}
                    onPressIn={() => setIsCurrentModulePressed(true)}
                    onPressOut={() => setIsCurrentModulePressed(false)}
                  />
                )}
                renderFalse={null}
              />

              <CourseInfo course={course} colors={colors} />
            </View>

            {isLargeScreen && (
              <View style={styles.webSidebar}>
                {course.units && (
                  <TableOfContents courseId={parseInt(courseId as string)} units={course.units} />
                )}
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      <CourseFooter
        isLoading={isLoading}
        module={course.currentModule}
        handleStartCourse={handleStartCourse}
        handleRestartCourse={handleRestartCourse}
        isLargeScreen={isLargeScreen}
      />
    </View>
  );
}
