import React, { useState, useCallback, useMemo } from 'react';
import {
  StyleSheet,
  Animated,
  LayoutAnimation,
  Platform,
  UIManager,
  View,
  StyleProp,
  ViewStyle,
  TextStyle,
  TouchableOpacity,
} from 'react-native';
import { Text, Surface } from '@/src/components/ui';
import { useAppTheme } from '@/src/context/ThemeContext';
import Conditional from '@/src/components/Conditional';
import { Feather } from '@expo/vector-icons';
import { Unit } from '@/src/features/course/types/units';
import { router } from 'expo-router';
import { Colors } from '@/constants/Colors';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface TableOfContentsProps {
  courseId: number;
  units: Unit[];
}

// Custom Accordion Component
const Accordion = ({
  title,
  expanded,
  onPress,
  style,
  titleStyle,
  left,
  right,
  children,
}: {
  title: string | React.ReactNode;
  expanded: boolean;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  titleStyle?: StyleProp<TextStyle>;
  left?: React.ReactNode | ((props: any) => React.ReactNode);
  right?: React.ReactNode | ((props: any) => React.ReactNode);
  children?: React.ReactNode;
}) => {
  return (
    <View>
      <TouchableOpacity style={style} onPress={onPress} activeOpacity={0.7}>
        <View style={{ flexDirection: 'row', alignItems: 'center', padding: 15 }}>
          {left && (typeof left === 'function' ? left({}) : left)}
          <View style={{ flex: 1 }}>
            {typeof title === 'string' ? <Text style={titleStyle}>{title}</Text> : title}
          </View>
          {right && (typeof right === 'function' ? right({}) : right)}
        </View>
      </TouchableOpacity>
      {expanded && children}
    </View>
  );
};

// Custom List Section Component
const Section = ({
  style,
  children,
}: {
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
}) => {
  return <View style={style}>{children}</View>;
};

// Custom List Item Component
const ListItem = ({
  title,
  style,
  titleStyle,
  left,
  onPress,
}: {
  title: string;
  style?: StyleProp<ViewStyle>;
  titleStyle?: StyleProp<TextStyle>;
  left?: React.ReactNode | ((props: any) => React.ReactNode);
  onPress?: () => void;
}) => {
  return (
    <TouchableOpacity style={style} onPress={onPress} activeOpacity={0.7}>
      <View style={{ flexDirection: 'row', alignItems: 'center', padding: 10 }}>
        {left && (typeof left === 'function' ? left({}) : left)}
        <Text style={titleStyle}>{title}</Text>
      </View>
    </TouchableOpacity>
  );
};

const ANIMATION_DURATION = 200;

const configureAnimation = () => {
  LayoutAnimation.configureNext(
    LayoutAnimation.create(
      ANIMATION_DURATION,
      LayoutAnimation.Types.easeInEaseOut,
      LayoutAnimation.Properties.opacity
    )
  );
};

const ChevronIcon: React.FC<{ rotation: Animated.Value; color: string }> = React.memo(
  ({ rotation, color }) => {
    const rotationStyle = useMemo(
      () => ({
        transform: [
          {
            rotate: rotation.interpolate({
              inputRange: [0, 1],
              outputRange: ['0deg', '90deg'],
            }),
          },
        ],
      }),
      [rotation]
    );

    return (
      <Animated.View style={rotationStyle}>
        <Feather name="chevron-right" size={16} color={color} />
      </Animated.View>
    );
  }
);

const ModuleItem: React.FC<{
  courseId: number;
  unitId: number;
  module: Unit['modules'][0];
  onPress: (courseId: number, unitId: number, moduleId: number) => void;
  style: StyleProp<ViewStyle>;
  titleStyle: StyleProp<TextStyle>;
  leftElement: React.ReactNode;
}> = React.memo(({ module, onPress, style, titleStyle, leftElement, courseId, unitId }) => (
  <ListItem
    left={() => leftElement}
    title={module.name}
    style={style}
    titleStyle={titleStyle}
    onPress={() => onPress(courseId, unitId, module.id)}
  />
));

const TableOfContents: React.FC<TableOfContentsProps> = ({ courseId, units = [] }) => {
  const { theme } = useAppTheme();
  const { colors }: { colors: Colors } = theme;
  const [isVisible, setIsVisible] = useState(true);
  const [expandedId, setExpandedId] = useState<number | undefined>(units[0]?.id);

  const mainRotation = useMemo(() => new Animated.Value(isVisible ? 1 : 0), [isVisible]);
  const unitRotations = useMemo(
    () =>
      Object.fromEntries(
        units.map(unit => [unit.id, new Animated.Value(expandedId === unit.id ? 1 : 0)])
      ),
    [units, expandedId]
  );

  const styles = StyleSheet.create({
    container: {
      backgroundColor: colors.elevation?.level2 || colors.surfaceVariant,
      borderRadius: 15,
      marginBottom: 16,
    },
    section: {
      backgroundColor: 'transparent',
      margin: 0,
      padding: 0,
    },
    header: {
      backgroundColor: colors.elevation?.level2 || colors.surfaceVariant,
      borderTopLeftRadius: 15,
      borderTopRightRadius: 15,
    },
    headerText: {
      color: colors.onSurface,
      fontWeight: 'bold',
    },
    unitAccordion: {
      paddingLeft: 16,
      backgroundColor: colors.elevation?.level1 || colors.surface,
    },
    accordionTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: colors.onSurfaceVariant,
    },
    contentContainer: {
      paddingHorizontal: 16,
      backgroundColor: colors.elevation?.level1 || colors.surface,
    },
    description: {
      fontSize: 14,
      marginVertical: 12,
      textAlign: 'left',
      color: colors.onSurfaceVariant,
      paddingHorizontal: 8,
    },
    modulesList: {
      paddingLeft: 0,
      paddingBottom: 16,
    },
    moduleItem: {
      marginVertical: 2,
      paddingHorizontal: 15,
      borderRadius: 8,
      backgroundColor: colors.elevation?.level3 || colors.surfaceVariant,
    },
    moduleItemText: {
      color: colors.onSurface,
    },
    moduleNumberText: {
      color: colors.onSurfaceVariant,
      fontSize: 12,
      minWidth: 30,
      textAlign: 'center',
      marginRight: 8,
    },
  });

  // Define chevronColor constant using theme color
  const chevronColor = colors.onSurfaceVariant;

  const handleMainPress = useCallback(() => {
    configureAnimation();
    setIsVisible(prev => !prev);
    Animated.timing(mainRotation, {
      toValue: isVisible ? 0 : 1,
      duration: ANIMATION_DURATION,
      useNativeDriver: true,
    }).start();
  }, [isVisible, mainRotation]);

  const handleUnitPress = useCallback(
    (id: number) => {
      configureAnimation();
      setExpandedId(prevId => (prevId === id ? undefined : id));

      Animated.timing(unitRotations[id], {
        toValue: expandedId === id ? 0 : 1,
        duration: ANIMATION_DURATION,
        useNativeDriver: true,
      }).start();
    },
    [expandedId, unitRotations]
  );

  const handleModulePress = (courseId: number, unitId: number, moduleId: number) => {
    router.replace({
      pathname: '/(protected)/course/[courseId]/module/[moduleId]',
      params: {
        courseId: courseId,
        unitId: unitId,
        moduleId: moduleId,
      },
    });
  };
  const mainChevronStyle = useMemo(
    () => ({
      transform: [
        {
          rotate: mainRotation.interpolate({
            inputRange: [0, 1],
            outputRange: ['180deg', '0deg'],
          }),
        },
      ],
    }),
    [mainRotation]
  );

  if (!units.length) return null;

  return (
    <Surface style={styles.container} elevation={2}>
      <Section style={styles.section}>
        <Accordion
          left={() => <Feather name="list" size={20} color={colors.onSurface} />}
          right={() => (
            <Animated.View style={mainChevronStyle}>
              <Feather name="chevron-down" size={20} color={colors.onSurface} />
            </Animated.View>
          )}
          title="Table of Contents"
          expanded={isVisible}
          onPress={handleMainPress}
          style={styles.header}
          titleStyle={styles.headerText}
        >
          <Conditional
            condition={units.length > 0}
            renderTrue={() =>
              units?.map(unit => (
                <Accordion
                  key={unit.id}
                  title={`${unit.unitNumber}. ${unit.name}`}
                  expanded={expandedId === unit.id}
                  onPress={() => handleUnitPress(unit.id)}
                  style={styles.unitAccordion}
                  titleStyle={styles.accordionTitle}
                  right={() => (
                    <ChevronIcon rotation={unitRotations[unit.id]} color={chevronColor} />
                  )}
                >
                  <View style={styles.contentContainer}>
                    <Text style={styles.description}>{unit.description}</Text>
                    <View style={styles.modulesList}>
                      <Conditional
                        condition={unit.modules.length > 0}
                        renderTrue={() =>
                          unit.modules?.map(module => (
                            <ModuleItem
                              key={module.id}
                              courseId={courseId}
                              unitId={unit.id}
                              module={module}
                              style={styles.moduleItem}
                              titleStyle={styles.moduleItemText}
                              leftElement={
                                <Text
                                  style={styles.moduleNumberText}
                                >{`${unit.unitNumber}.${module.moduleNumber}`}</Text>
                              }
                              onPress={handleModulePress}
                            />
                          ))
                        }
                        renderFalse={null}
                      />
                    </View>
                  </View>
                </Accordion>
              ))
            }
            renderFalse={null}
          />
        </Accordion>
      </Section>
    </Surface>
  );
};

export default React.memo(TableOfContents);
