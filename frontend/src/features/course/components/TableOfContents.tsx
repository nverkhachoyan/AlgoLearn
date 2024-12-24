import React, { useState, useCallback, useMemo } from "react";
import {
  StyleSheet,
  Animated,
  LayoutAnimation,
  Platform,
  UIManager,
} from "react-native";
import { List, Surface, Text } from "react-native-paper";
import { Feather } from "@expo/vector-icons";
import { View } from "react-native";
import { Unit } from "@/src/features/course/types/units";
import { router } from "expo-router";

// Enable LayoutAnimation for Android
if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface TableOfContentsProps {
  courseId: number;
  units: Unit[];
}

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

const ChevronIcon: React.FC<{ rotation: Animated.Value; color: string }> =
  React.memo(({ rotation, color }) => {
    const rotationStyle = useMemo(
      () => ({
        transform: [
          {
            rotate: rotation.interpolate({
              inputRange: [0, 1],
              outputRange: ["0deg", "90deg"],
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
  });

const ModuleItem: React.FC<{
  courseId: number;
  unitId: number;
  module: Unit["modules"][0];
  unitNumber: number;
  moduleNumber: number;
  onPress: (courseId: number, unitId: number, moduleId: number) => void;
  backgroundColor: string;
  textColor: string;
}> = React.memo(
  ({
    courseId,
    unitId,
    module,
    unitNumber,
    moduleNumber,
    onPress,
    backgroundColor,
    textColor,
  }) => (
    <List.Item
      left={() => (
        <Text style={{ color: "#fff" }}>{`${unitNumber}.${moduleNumber}`}</Text>
      )}
      title={module.name}
      style={[styles.moduleItem, { backgroundColor }]}
      titleStyle={{ color: textColor }}
      onPress={() => onPress(courseId, unitId, module.id)}
    />
  )
);

const TableOfContents: React.FC<TableOfContentsProps> = ({
  courseId,
  units = [],
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [expandedId, setExpandedId] = useState<number>();

  const mainRotation = useMemo(() => new Animated.Value(1), []);
  const unitRotations = useMemo(
    () =>
      Object.fromEntries(units.map((unit) => [unit.id, new Animated.Value(0)])),
    [units]
  );

  const handleMainPress = useCallback(() => {
    configureAnimation();
    setIsVisible((prev) => !prev);
    Animated.timing(mainRotation, {
      toValue: isVisible ? 0 : 1,
      duration: ANIMATION_DURATION,
      useNativeDriver: true,
    }).start();
  }, [isVisible, mainRotation]);

  const handleUnitPress = useCallback(
    (id: number) => {
      configureAnimation();
      setExpandedId((prevId) => (prevId === id ? undefined : id));

      Animated.timing(unitRotations[id], {
        toValue: expandedId === id ? 0 : 1,
        duration: ANIMATION_DURATION,
        useNativeDriver: true,
      }).start();
    },
    [expandedId, unitRotations]
  );

  const handleModulePress = (
    courseId: number,
    unitId: number,
    moduleId: number
  ) => {
    router.replace({
      pathname: "/(protected)/course/[courseId]/module/[moduleId]",
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
            outputRange: ["180deg", "0deg"],
          }),
        },
      ],
    }),
    [mainRotation]
  );

  if (!units.length) return null;

  return (
    <Surface style={styles.container} elevation={4}>
      <List.Section style={styles.section}>
        <List.Accordion
          left={(props) => (
            <Feather {...props} name="list" size={20} color="#fff" />
          )}
          right={(props) => (
            <Animated.View style={mainChevronStyle}>
              <Feather {...props} name="chevron-down" size={20} color="#fff" />
            </Animated.View>
          )}
          title="Table of Contents"
          expanded={isVisible}
          onPress={handleMainPress}
          style={styles.header}
          titleStyle={styles.headerText}
        >
          {units.map((unit) => (
            <List.Accordion
              key={unit.id}
              title={`${unit.unitNumber}. ${unit.name}`}
              expanded={expandedId === unit.id}
              onPress={() => handleUnitPress(unit.id)}
              style={[styles.unitAccordion, { backgroundColor: "#121212" }]}
              titleStyle={[styles.accordionTitle, { color: "#fff" }]}
              right={() => (
                <ChevronIcon rotation={unitRotations[unit.id]} color="#fff" />
              )}
            >
              <View style={styles.contentContainer}>
                <Text style={[styles.description, { color: "#fff" }]}>
                  {unit.description}
                </Text>
                <View style={styles.modulesList}>
                  {unit.modules?.map((module) => (
                    <ModuleItem
                      key={module.id}
                      courseId={courseId}
                      unitId={unit.id}
                      module={module}
                      unitNumber={unit.unitNumber}
                      moduleNumber={module.moduleNumber}
                      onPress={handleModulePress}
                      backgroundColor={"#2D3338"}
                      textColor="#fff"
                    />
                  ))}
                </View>
              </View>
            </List.Accordion>
          ))}
        </List.Accordion>
      </List.Section>
    </Surface>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "90%",
    backgroundColor: "#1A2942",
    alignSelf: "center",
    borderRadius: 15,
  },
  section: {
    backgroundColor: "#1A2942",
  },
  header: {
    backgroundColor: "#1A2942",
  },
  headerText: {
    color: "#fff",
    fontWeight: "bold",
  },
  unitAccordion: {
    paddingLeft: 16,
  },
  accordionTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  contentContainer: {
    width: "95%",
  },
  description: {
    fontSize: 16,
    marginVertical: 16,
    textAlign: "center",
  },
  modulesList: {
    paddingLeft: 16,
    paddingBottom: 16,
  },
  moduleItem: {
    marginVertical: 4,
    paddingHorizontal: 15,
    borderRadius: 5,
  },
});

export default React.memo(TableOfContents);
