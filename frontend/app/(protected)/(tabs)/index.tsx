import { StyleSheet, ScrollView, View } from 'react-native';
import { CourseSection } from '@/src/features/course/components/CourseList';
import { useUser } from '@/src/features/user/hooks/useUser';
import { useCourses } from '@/src/features/course/hooks/useCourses';
import { StickyHeader } from '@/src/components/StickyHeader';
import { useRouter } from 'expo-router';
import { useAppTheme } from '@/src/context/ThemeContext';
import { useAuth } from '@/src/features/auth/AuthContext';
import { HeaderAndTabs, ContentBackground } from '@/constants/Colors';

export default function Home() {
  const { isAuthed } = useAuth();
  const { user } = useUser();
  const router = useRouter();
  const { colorScheme }: { colorScheme: 'light' | 'dark' } = useAppTheme();
  const { courses, fetchNextPage, hasNextPage, isFetchingNextPage } = useCourses({
    pageSize: 5,
    isAuthed,
  });

  return (
    <View style={[styles.container, { backgroundColor: ContentBackground[colorScheme] }]}>
      <StickyHeader
        cpus={user?.cpus ?? 0}
        streak={user?.streak || 0}
        onAvatarPress={() => router.push('/(protected)/(profile)')}
      />
      <ScrollView contentContainerStyle={[styles.scrollContent]}>
        <CourseSection
          title="Your Courses"
          courses={courses}
          hasNextPage={hasNextPage}
          isFetchingNextPage={isFetchingNextPage}
          onLoadMore={() => {
            if (hasNextPage && !isFetchingNextPage) {
              fetchNextPage();
            }
          }}
          hasProgress={true}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  scrollContent: {
    flexGrow: 1,
    marginHorizontal: 16,
    paddingVertical: 16,
    justifyContent: 'flex-start',
  },
});
