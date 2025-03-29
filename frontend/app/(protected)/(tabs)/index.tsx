import React from 'react';
import { StyleSheet, ScrollView, View, ActivityIndicator, Text } from 'react-native';
import { CourseSection } from '@/src/features/course/components/CourseList';
import { useUser } from '@/src/features/user/hooks/useUser';
import useToast from '@/src/hooks/useToast';
import { useCourses } from '@/src/features/course/hooks/useCourses';
import { StickyHeader } from '@/src/components/common/StickyHeader';
import { router, useRouter } from 'expo-router';
import { useTheme } from 'react-native-paper';
import { useAuth } from '@/src/features/auth/AuthContext';
import ErrorBoundary from '@/src/components/ErrorBoundary';

export default function Home() {
  const { user, error: userError } = useUser();
  const { isAuthenticated, token } = useAuth();
  const { colors } = useTheme();
  const { showToast } = useToast();
  const router = useRouter();

  const { courses, fetchNextPage, hasNextPage, isFetchingNextPage, error } = useCourses({
    pageSize: 5,
    isAuthenticated: isAuthenticated,
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StickyHeader
        cpus={user?.cpus ?? 0}
        streak={user?.streak || 0}
        userAvatar={user?.profilePictureURL ?? ''}
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
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    alignSelf: 'center',
  },
  separator: {
    marginVertical: 10,
    height: 1,
    width: '80%',
    alignSelf: 'center',
  },
  loadingContainer: {
    flex: 1,
    alignSelf: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  loadMoreContainer: {
    flex: 1,
    alignSelf: 'center',
    justifyContent: 'center',
    gap: 16,
    marginTop: 10,
  },
  endMessage: {
    textAlign: 'center',
    padding: 10,
    color: '#666',
  },
  emptyMessage: {
    textAlign: 'center',
    padding: 16,
    color: '#666',
    fontStyle: 'italic',
  },
});
