import { StyleSheet, Image, View } from 'react-native';
import { Text } from '@/src/components/ui';
import { Feather } from '@expo/vector-icons';

export default function CourseHeader({ course, imgURL }: any) {
  return (
    <View>
      <Image
        source={{
          uri: imgURL,
        }}
        style={styles.icon}
      />
      <Text variant="headline" style={styles.courseTitle}>
        {course.name}
      </Text>
      {course.authors.map((author: any) => (
        <Text variant="body" key={author.id} style={styles.courseAuthor}>
          {author.name}
        </Text>
      ))}
      <View style={styles.courseMetricsContainer}>
        <Text variant="body">
          <Feather name="percent" size={15} /> {course?.difficultyLevel}
        </Text>
        <Text variant="body">
          <Feather name="clock" size={15} /> {course.duration}
        </Text>
        <Text variant="body">
          <Feather name="star" size={15} /> {course.rating}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  icon: {
    width: 100,
    height: 100,
    alignSelf: 'center',
    marginVertical: 10,
    borderRadius: 8,
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
  courseMetricsContainer: {
    fontSize: 20,
    textAlign: 'center',
    marginVertical: 5,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
  },
});
