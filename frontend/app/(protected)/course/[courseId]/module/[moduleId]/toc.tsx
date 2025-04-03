import { StatusBar } from 'expo-status-bar';
import { Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from '@/src/components/ui';
import { useAppTheme } from '@/src/context/ThemeContext';
import { useAuth } from '@/src/features/auth/AuthContext';
import { router, useLocalSearchParams } from 'expo-router';
import { useCourse } from '@/src/features/course/hooks/useCourses';
import { Course } from '@/src/features/course/types/types';
import { Module } from '@/src/features/module/types';
import { FlashList } from '@shopify/flash-list';
import { Unit } from '@/src/features/course/types';
import { Feather } from '@expo/vector-icons';

export default function SessionTOC(): JSX.Element {
  const { theme } = useAppTheme();
  const { colors } = theme;
  const { isAuthed } = useAuth();
  const { courseId } = useLocalSearchParams();
  const { course }: { course: Course | undefined } = useCourse({
    courseId: parseInt(courseId as string, 10),
    isAuthed,
  });

  if (!course) {
    return <Text>No course found</Text>;
  }

  const renderModule = ({
    item: module,
    unitId,
  }: {
    item: Module;
    unitId: number;
  }): JSX.Element => (
    <TouchableOpacity
      style={[styles.moduleItem, { backgroundColor: colors.surface }]}
      onPress={() =>
        router.replace({
          pathname: '/(protected)/course/[courseId]/module/[moduleId]',
          params: {
            courseId: course.id,
            moduleId: module.id,
            unitId: unitId,
          },
        })
      }
    >
      <View style={styles.moduleContent}>
        <Text
          variant="body"
          style={[
            styles.moduleTitle,
            {
              color: colors.onSurface,
              marginBottom: (module.progress ?? 0) > 0 ? 4 : 0,
            },
          ]}
        >
          {module.name}
        </Text>
        {(module.progress ?? 0) > 0 && (
          <View style={styles.progressBarContainer}>
            <View
              style={[
                styles.progressBar,
                {
                  width: `${Math.min(module.progress ?? 0, 100)}%`,
                  backgroundColor: colors.primary,
                },
              ]}
            />
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderUnit = ({ item: unit }: { item: Unit }): JSX.Element => (
    <View style={[styles.unitTitle, { backgroundColor: colors.background }]}>
      <View style={styles.unitTitleContainer}>
        <Text variant="subtitle" style={[styles.unitTitleText, { color: colors.onSurface }]}>
          {unit.unitNumber}.
        </Text>
        <Text variant="subtitle" style={[styles.unitTitleText, { color: colors.onSurface }]}>
          {unit.name}
        </Text>
      </View>
      <View style={styles.modulesContainer}>
        <FlashList
          data={Object.values(unit.modules) as Module[]}
          renderItem={props => renderModule({ ...props, unitId: unit.unitNumber })}
          estimatedItemSize={50}
          keyExtractor={(item): string => item.id?.toString() ?? ''}
        />
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.onSurface }]}>
        <Feather name="book-open" color={colors.onSurface} />
        <Text variant="headline" style={styles.courseTitle}>
          {course.name}
        </Text>
      </View>
      <FlashList
        data={course.units}
        renderItem={renderUnit}
        estimatedItemSize={200}
        keyExtractor={(item): string => item.unitNumber.toString()}
      />
      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginVertical: 20,
    borderBottomWidth: 0.5,
  },
  courseTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 20,
    textAlign: 'center',
    textTransform: 'capitalize',
  },
  unitContainer: {
    borderRadius: 5,
    paddingHorizontal: 20,
  },
  unitTitleContainer: {
    textTransform: 'capitalize',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: 10,
    alignItems: 'center',
    marginHorizontal: 23,
  },
  unitTitle: {
    paddingVertical: 13,
    textTransform: 'capitalize',
  },
  unitTitleText: {
    fontSize: 16,
    fontWeight: 'bold',
    textTransform: 'capitalize',
  },

  modulesContainer: {
    backgroundColor: 'transparent',
    marginVertical: 10,
    height: 'auto',
  },
  moduleItem: {
    minHeight: 50,
    justifyContent: 'center',
    paddingHorizontal: 15,
    marginVertical: 5,
    borderRadius: 5,
    overflow: 'hidden',
  },
  moduleContent: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  moduleTitle: {
    textTransform: 'capitalize',
  },
  progressBarContainer: {
    height: 3,
    backgroundColor: '#E0E0E0',
    borderRadius: 1.5,
    overflow: 'hidden',
    marginTop: 4,
  },
  progressBar: {
    height: '100%',
    borderRadius: 1.5,
  },
  tocContainer: {
    width: '80%',
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
  },
  unitsContainer: {},
});
