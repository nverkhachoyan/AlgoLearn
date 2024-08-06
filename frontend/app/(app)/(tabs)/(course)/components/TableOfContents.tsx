import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import {
  StyleSheet,
  TouchableOpacity,
  Animated,
  ScrollView,
} from "react-native";
import { Feather, FontAwesome } from "@expo/vector-icons";
import { Text, View } from "@/components/Themed";
import useTheme from "@/hooks/useTheme";

const CourseUnit = React.memo(({ units }: { units: any }) => {
  const { colors } = useTheme();
  const [isTOCCollapsed, setIsTOCCollapsed] = useState(true);
  const [collapsedUnits, setCollapsedUnits] = useState<{
    [key: string]: boolean;
  }>({});
  const TOCAnimationRef = useRef(new Animated.Value(0)).current;

  const animationRefs = useRef<{ [key: string]: Animated.Value }>({});
  const iconRefs = useRef<{ [key: string]: Animated.Value }>({});

  useEffect(() => {
    units.forEach((unit: any) => {
      if (!animationRefs.current[unit.unitNumber]) {
        animationRefs.current[unit.unitNumber] = new Animated.Value(0);
        iconRefs.current[unit.unitNumber] = new Animated.Value(0);
      }
    });
  }, [units]);

  const calculateTOCHeight = useMemo(() => {
    let totalHeight = 7; // Base height for the TOC header
    units.forEach((unit: any) => {
      totalHeight += 44; // Height for each unit header
      if (collapsedUnits[unit.unitNumber]) {
        const moduleCount = Object.keys(unit.modules).length;
        totalHeight += 44 * moduleCount + 35; // Height for the modules if the unit is uncollapsed
      }
    });
    return totalHeight;
  }, [units, collapsedUnits]);

  const animateTOC = useCallback(
    (toValue: number, duration: number) => {
      Animated.timing(TOCAnimationRef, {
        toValue,
        duration,
        useNativeDriver: false,
      }).start();
    },
    [TOCAnimationRef],
  );

  const toggleCollapseTOC = useCallback(() => {
    const toValue = isTOCCollapsed ? calculateTOCHeight : 0;
    animateTOC(toValue, 150);
    setIsTOCCollapsed(!isTOCCollapsed);
  }, [isTOCCollapsed, calculateTOCHeight, animateTOC]);

  const toggleExpandUnit = useCallback(
    (unitNumber: string) => {
      const isExpanded = collapsedUnits[unitNumber] || false;
      const toValue = isExpanded ? 0 : 1;

      if (animationRefs.current[unitNumber] && iconRefs.current[unitNumber]) {
        Animated.timing(animationRefs.current[unitNumber], {
          toValue,
          duration: 5,
          useNativeDriver: false,
        }).start(() => {
          setCollapsedUnits((prevState) => ({
            ...prevState,
            [unitNumber]: !isExpanded,
          }));
        });

        Animated.timing(iconRefs.current[unitNumber], {
          toValue,
          duration: 5,
          useNativeDriver: false,
        }).start(() => {
          if (!isTOCCollapsed) {
            animateTOC(calculateTOCHeight, 100);
          }
        });
      }
    },
    [collapsedUnits, calculateTOCHeight, animateTOC, isTOCCollapsed],
  );

  useEffect(() => {
    if (!isTOCCollapsed) {
      animateTOC(calculateTOCHeight, 100);
    }
  }, [collapsedUnits, calculateTOCHeight, animateTOC, isTOCCollapsed]);

  return (
    <View style={styles.tocContainer}>
      <TouchableOpacity onPress={toggleCollapseTOC}>
        <Text style={styles.tocTitle}>
          <Feather name="list" /> Table of Contents{" "}
        </Text>
      </TouchableOpacity>
      <Animated.View
        style={[styles.unitsContainer, { height: TOCAnimationRef }]}
      >
        {units.map((unit: any) => {
          if (
            !animationRefs.current[unit.unitNumber] ||
            !iconRefs.current[unit.unitNumber]
          ) {
            return null;
          }

          const moduleHeight = animationRefs.current[
            unit.unitNumber
          ].interpolate({
            inputRange: [0, 1],
            outputRange: [0, 44 * Object.keys(unit.modules).length + 35],
          });

          const iconRotate = iconRefs.current[unit.unitNumber].interpolate({
            inputRange: [0, 1],
            outputRange: ["0deg", "90deg"],
          });

          return (
            <TouchableOpacity
              key={unit.unitNumber}
              onPress={() => toggleExpandUnit(unit.unitNumber)}
              style={[styles.unitTitle, { backgroundColor: colors.background }]}
            >
              <View
                style={[
                  styles.unitTitleContainer,
                  { backgroundColor: colors.background },
                ]}
              >
                <Text style={[styles.unitTitleText, { color: colors.text }]}>
                  {unit.unitNumber}.
                </Text>
                <Text style={[styles.unitTitleText, { color: colors.text }]}>
                  {unit.unitName}
                </Text>
                <Animated.View style={{ transform: [{ rotate: iconRotate }] }}>
                  <FontAwesome name={"chevron-right"} color={colors.text} />
                </Animated.View>
              </View>
              <Animated.View
                style={[styles.unitContainer, { height: moduleHeight }]}
              >
                <View style={styles.modulesContainer}>
                  {Object.entries(unit.modules).map(([key, module]) => (
                    <TouchableOpacity
                      key={key}
                      style={[
                        styles.moduleItem,
                        { backgroundColor: colors.listBackground },
                      ]}
                    >
                      <Text style={{ color: colors.text }}>
                        {module as string}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </Animated.View>
            </TouchableOpacity>
          );
        })}
      </Animated.View>
    </View>
  );
});

const styles = StyleSheet.create({
  unitTitleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  unitTitle: {
    paddingHorizontal: 10,
    paddingVertical: 13,
  },
  unitTitleText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  unitContainer: {
    overflow: "hidden",
    borderRadius: 5,
  },
  modulesContainer: {
    backgroundColor: "transparent",
    marginVertical: 10,
  },
  moduleItem: {
    height: 40,
    justifyContent: "center",
    paddingHorizontal: 15,
    marginVertical: 5,
    borderRadius: 5,
    backgroundColor: "#fff",
  },
  tocContainer: {
    width: "80%",
    marginVertical: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    alignSelf: "center",
    overflow: "hidden",
  },
  unitsContainer: {},
  tocTitle: {
    padding: 15,
    // backgroundColor: "#24272E",
    backgroundColor: "#0F1421",
    color: "#fff",
    fontWeight: "bold",
  },
});

export default CourseUnit;
