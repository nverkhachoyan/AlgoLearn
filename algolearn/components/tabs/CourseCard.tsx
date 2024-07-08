import { View, Text } from '../Themed';
import { StyleSheet } from 'react-native';
import Button from '../common/Button';

export default function CourseCard(props: {
  courseTitle: string;
  unitInfo: string;
  buttonTitle: string;
}) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{props.courseTitle}</Text>
      <View style={styles.separator} />
      <Text style={styles.unitInfo}>{props.unitInfo}</Text>
      <Text>Course Card</Text>
      <View style={styles.buttonContainer}>
        <Button
          title={props.buttonTitle}
          onPress={() => console.log('Get Started')}
          style={styles.button}
          textStyle={{ fontSize: 12 }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 0.2,
    borderRadius: 4,
    padding: 10,
  },
  separator: {
    marginVertical: 15,
    height: 1,
    backgroundColor: '#333',
    opacity: 0.2,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  buttonContainer: {
    alignItems: 'center',
    marginVertical: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  unitInfo: {
    fontSize: 16,
  },
});
