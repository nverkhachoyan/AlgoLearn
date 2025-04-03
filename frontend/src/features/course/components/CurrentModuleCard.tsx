import { StyleSheet, TouchableOpacity } from 'react-native';
import { Card, CardContent, CardTitle, CardActions, Divider, Text } from '@/src/components/ui';
import Button from '@/src/components/Button';
import { router } from 'expo-router';
import { Course } from '../types/types';

export default function CurrentModuleCard({
  course,
  isPressed,
  onPressIn,
  onPressOut,
}: {
  course: Course;
  isPressed: boolean;
  onPressIn: () => void;
  onPressOut: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={() =>
        router.replace({
          pathname: '/(protected)/course/[courseId]/module/[moduleId]',
          params: {
            courseId: course.id,
            unitId: course.currentUnit?.id,
            moduleId: course.currentModule?.id as number,
          },
        })
      }
      style={[
        styles.currentModule,
        {
          backgroundColor: '#1d855f',
          transform: [{ scale: isPressed ? 1.02 : 1 }],
        },
      ]}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      activeOpacity={0.9}
    >
      <Card elevation={isPressed ? 8 : 4} style={{ backgroundColor: 'transparent' }}>
        <CardTitle
          title={`Unit ${course.currentUnit.unitNumber} Module ${course.currentModule?.moduleNumber}`}
        />
        <CardContent style={{ gap: 10 }}>
          <Text variant="title" style={{ color: '#E8E8E8' }}>
            {course.currentModule?.name}
          </Text>
          <Text variant="body" style={{ color: '#E8E8E8' }}>
            {course.currentModule?.description}
          </Text>
        </CardContent>
        <Divider style={styles.cardDivider} />
        <CardActions style={styles.cardActions}>
          <Button
            title="Jump back in"
            onPress={() => {
              router.push({
                pathname: '/(protected)/course/[courseId]/module/[moduleId]',
                params: {
                  courseId: course.id,
                  unitId: course.currentUnit?.id,
                  moduleId: course.currentModule?.id as number,
                  hasProgress: 'true',
                },
              });
            }}
            style={styles.jumpButton}
            textStyle={styles.jumpButtonText}
            iconStyle={{ color: '#24272E' }}
            icon={{
              type: 'feather',
              name: 'arrow-right',
              position: 'right',
            }}
          />
        </CardActions>
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  currentModule: {
    width: '90%',
    marginVertical: 10,
    alignSelf: 'center',
    marginBottom: 30,
  },
  cardDivider: {
    backgroundColor: '#E8E8E8',
    borderWidth: 0.1,
    width: '80%',
    alignSelf: 'center',
    marginTop: 15,
    marginBottom: 5,
  },
  cardActions: {
    flex: 1,
    flexDirection: 'column',
  },
  jumpButton: {
    marginVertical: 5,
    backgroundColor: 'white',
  },
  jumpButtonText: {
    fontSize: 14,
    color: '#24272E',
  },
});
