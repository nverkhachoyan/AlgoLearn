import { useLocalSearchParams, router } from 'expo-router';
import {
  StyleSheet,
  View,
  ScrollView,
  Animated,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { Text, Menu, IconButton, Button } from 'react-native-paper';
import { useEffect, useState, useRef } from 'react';
import { useTheme } from 'react-native-paper';
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
import { TabGradients } from '@/constants/Colors';
import { buildImgUrl } from '@/src/lib/utils/transform';
import Conditional from '@/src/components/Conditional';

export default function CourseDetails() {
  const { courseId, hasProgress } = useLocalSearchParams();
  const { colors }: { colors: Colors } = useTheme();
  const { user } = useUser();
  const [isCurrentModulePressed, setIsCurrentModulePressed] = useState(false);
  const { isAuthed } = useAuth();
  const [menuVisible, setMenuVisible] = useState(false);
  const rotationValue = useRef(new Animated.Value(0)).current;
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

  const startRotation = () => {
    Animated.timing(rotationValue, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const stopRotation = () => {
    Animated.timing(rotationValue, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  useEffect(() => {
    if (menuVisible) {
      startRotation();
    } else {
      stopRotation();
    }
  }, [menuVisible]);

  const spin = rotationValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '90deg'],
  });

  if (isLoading) {
    return <Spinning />;
  }

  const headerGradientColors = TabGradients.index.dark;

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
        <Text style={{ fontSize: 20, fontWeight: 'bold' }}>
          Course not found.
          <IconButton icon="arrow-left" onPress={() => router.back()} />
        </Text>
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
        gradientColors={headerGradientColors}
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

      <View
        style={[
          styles.footerContainer,
          { backgroundColor: colors.surface },
          isLargeScreen && styles.webFooter,
        ]}
      >
        <Conditional
          condition={course.currentModule != undefined}
          renderTrue={() => (
            <View>
              <Menu
                visible={menuVisible}
                onDismiss={() => setMenuVisible(false)}
                elevation={5}
                anchor={
                  <Animated.View style={{ transform: [{ rotate: spin }] }}>
                    <IconButton
                      icon="cog"
                      size={24}
                      onPress={() => setMenuVisible(!menuVisible)}
                      style={styles.settingsButton}
                      mode="contained"
                    />
                  </Animated.View>
                }
                anchorPosition="top"
                contentStyle={[styles.menuContent, { backgroundColor: colors.surface }]}
              >
                <Menu.Item
                  onPress={() => {
                    setMenuVisible(false);
                    handleRestartCourse();
                  }}
                  title="Restart Course"
                  leadingIcon="restart"
                />
              </Menu>
            </View>
          )}
          renderFalse={null}
        />

        <View style={[styles.mainButton, isLargeScreen && styles.webMainButton]}>
          <View style={styles.container}>
            <Button
              mode="contained"
              onPress={handleStartCourse}
              loading={isLoading}
              style={[styles.button, { backgroundColor: colors.primary }]}
              labelStyle={{ color: colors.onPrimary }}
              disabled={isLoading}
            >
              {isAuthed && course.currentModule ? 'Continue Course' : 'Start Course'}
            </Button>
          </View>
        </View>
      </View>
    </View>
  );
}

const HEADER_HEIGHT = 80;
const MAX_CONTENT_WIDTH = 1200;

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
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
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
    backgroundColor: '#333',
    opacity: 0.2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  webFooter: {
    paddingHorizontal: 40,
    paddingVertical: 16,
  },
  settingsButton: {
    marginRight: 8,
  },
  mainButton: {
    flex: 1,
  },
  webMainButton: {
    maxWidth: 300,
    marginLeft: 'auto',
  },
  menuContent: {
    borderRadius: 8,
    marginTop: -40,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  button: {
    borderRadius: 8,
  },
});
