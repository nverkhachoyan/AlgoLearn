import { StyleSheet } from 'react-native';
import { View, ScrollView, Text } from '@/components/Themed';
import StickyHeader from '@/components/StickyHeader';
import { useAuthContext } from '@/context/auth';
import CourseCard from '@/components/tabs/CourseCard';

export default function Home() {
  const { user, isAuthed, loading } = useAuthContext();

  if (loading) {
    return <Text>Loading...</Text>;
  }

  if (!isAuthed || !user) {
    return <Text>Not logged in</Text>;
  }

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      stickyHeaderIndices={[0]}
    >
      <StickyHeader cpus={user.cpus} strikeCount={0} userAvatar={null} />

      <View style={styles.container}>
        <Text style={styles.title}>Currently Learning</Text>
        <View style={styles.separator} />
        <CourseCard
          courseTitle='The JavaScript Ecosystem'
          unitInfo='Unit 1: In the beginning, there was Eden...'
          buttonTitle='Jump right back in'
        />
        <Text style={styles.title}>Other Topics</Text>
        <View style={styles.separator} />
        <CourseCard
          courseTitle='Data Structures'
          unitInfo='Unit 1: Who is this Al Gore Rhythm?'
          buttonTitle='Jump right back in'
        />
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
