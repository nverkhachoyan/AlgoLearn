import React from 'react';
import { StyleSheet, ScrollView, View, ActivityIndicator, Text } from 'react-native';
import { CourseSection } from '@/src/features/course/components/CourseList';
import { useUser } from '@/src/features/user/hooks/useUser';
import useToast from '@/src/hooks/useToast';
import { useCourses } from '@/src/features/course/hooks/useCourses';
import { StickyHeader } from '@/src/components/common/StickyHeader';
import { useRouter } from 'expo-router';
import { useTheme } from 'react-native-paper';
import { useAuth } from '@/src/features/auth/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/Colors';

export default function Home() {
  const { user, error: userError } = useUser();
  const { colors, dark }: { colors: Colors; dark: boolean } = useTheme();
  const { isAuthenticated, token } = useAuth();

  const { showToast } = useToast();
  const router = useRouter();

  const { courses, fetchNextPage, hasNextPage, isFetchingNextPage, error } = useCourses({
    pageSize: 5,
    isAuthenticated: isAuthenticated,
  });

  const headerGradientColors = dark
    ? (['#24272E', '#2D3347', '#363F5C'] as readonly [string, string, string])
    : (['#E6EAF5', '#C7D3E8', '#A8BDDB'] as readonly [string, string, string]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={headerGradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.backgroundGradient}
      />
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <StickyHeader
          cpus={user?.cpus ?? 0}
          streak={user?.streak || 0}
          onAvatarPress={() => router.push('/(protected)/(profile)')}
          gradientColors={headerGradientColors}
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
      </SafeAreaView>
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
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 70, // Increase height to cover enough space for the header + title content
    zIndex: 0,
  },
});
