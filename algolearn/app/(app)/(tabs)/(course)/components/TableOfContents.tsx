import { StyleSheet, TouchableOpacity, Animated } from "react-native";
import { Feather, FontAwesome } from "@expo/vector-icons";
import { Text, View } from "@/components/Themed";
import { useState, useRef, useEffect } from "react";
import { Course } from "@/types/userTypes";

export default function CourseUnit({ units }: { units: any }) {
  const [isTOCCollapsed, setIsTOCCollapsed] = useState(true);
  const [collapsedUnits, setCollapsedUnits] = useState<{
    [key: string]: boolean;
  }>({});
  const TOCAnimationRef = useRef(new Animated.Value(0)).current;

  // Initialize animation refs for each unit and its icon
  const animationRefs = useRef<{ [key: string]: Animated.Value }>({});
  const iconRefs = useRef<{ [key: string]: Animated.Value }>({});

  useEffect(() => {
    units.forEach((unit) => {
      if (!animationRefs.current[unit.unitNumber]) {
        animationRefs.current[unit.unitNumber] = new Animated.Value(0);
        iconRefs.current[unit.unitNumber] = new Animated.Value(0);
      }
    });
  }, [units]);

  const calculateTOCHeight = () => {
    let totalHeight = 10; // Base height for the TOC header
    units.forEach((unit) => {
      totalHeight += 44; // Height for each unit header
      if (collapsedUnits[unit.unitNumber]) {
        const moduleCount = Object.keys(unit.modules).length;
        totalHeight += 44 * moduleCount + 35; // Height for the modules if the unit is uncollapsed
      }
    });
    return totalHeight;
  };

  const animateTOC = (toValue: number, duration: number) => {
    Animated.timing(TOCAnimationRef, {
      toValue,
      duration,
      useNativeDriver: false,
    }).start();
  };

  const toggleCollapseTOC = () => {
    const toValue = isTOCCollapsed ? calculateTOCHeight() : 0;
    animateTOC(toValue, 150);
    setIsTOCCollapsed(!isTOCCollapsed);
  };

  const toggleExpandUnit = (unitNumber: string) => {
    const isExpanded = collapsedUnits[unitNumber] || false;
    const toValue = isExpanded ? 0 : 1;

    if (animationRefs.current[unitNumber] && iconRefs.current[unitNumber]) {
      Animated.timing(animationRefs.current[unitNumber], {
        toValue,
        duration: 100,
        useNativeDriver: false,
      }).start(() => {
        setCollapsedUnits((prevState) => ({
          ...prevState,
          [unitNumber]: !isExpanded,
        }));
      });

      Animated.timing(iconRefs.current[unitNumber], {
        toValue,
        duration: 100,
        useNativeDriver: false,
      }).start(() => {
        if (!isTOCCollapsed) {
          animateTOC(calculateTOCHeight(), 100);
        }
      });
    }
  };

  useEffect(() => {
    if (!isTOCCollapsed) {
      animateTOC(calculateTOCHeight(), 100);
    }
  }, [collapsedUnits]);

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
        {units.map((unit) => {
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
              style={styles.unitTitle}
            >
              <View style={styles.unitTitleContainer}>
                <Text style={styles.unitTitleText}>{unit.unitNumber}.</Text>
                <Text style={styles.unitTitleText}>{unit.unitName}</Text>
                <Animated.View style={{ transform: [{ rotate: iconRotate }] }}>
                  <FontAwesome name={"chevron-right"} />
                </Animated.View>
              </View>
              <Animated.View
                style={[styles.unitContainer, { height: moduleHeight }]}
              >
                <View style={styles.modulesContainer}>
                  {Object.entries(unit.modules).map(([key, module]) => (
                    <TouchableOpacity key={key} style={styles.moduleItem}>
                      <Text>{module}</Text>
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
}

const styles = StyleSheet.create({
  unitTitleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f1f1f1",
  },
  unitTitle: {
    padding: 15,
    backgroundColor: "#f1f1f1",
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
    backgroundColor: "#f1f1f1",
    marginVertical: 10,
  },
  moduleItem: {
    height: 40,
    justifyContent: "center",
    paddingHorizontal: 15,
    marginVertical: 5,
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
    backgroundColor: "#24272E",
    color: "#fff",
    fontWeight: "bold",
  },
});
