import React, { memo, useState, useRef, useEffect } from "react";
import {
  TouchableOpacity,
  StyleSheet,
  View,
  Modal,
  Animated,
  ScrollView,
  Dimensions,
} from "react-native";
import { Text } from "react-native-paper";
import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useCourse } from "../../hooks/useCourses";
import { SafeAreaView } from "react-native-safe-area-context";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

type TOCModalProps = {
  visible: boolean;
  courseId: string;
  unitId: string;
  moduleId: string;
  colors: any;
  onClose: () => void;
  onModuleSelect: (courseId: number, unitId: number, moduleId: number) => void;
};

const TOCModal: React.FC<TOCModalProps> = ({
  visible,
  courseId,
  unitId,
  moduleId,
  colors,
  onClose,
  onModuleSelect,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const numericCourseId = parseInt(courseId, 10);
  const { course, isLoading } = useCourse({
    courseId: numericCourseId,
    isAuthenticated: true,
  });

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 70,
          friction: 12,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: SCREEN_HEIGHT,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, fadeAnim, slideAnim]);

  // Sort units and modules when course data is available
  const sortedUnits = React.useMemo(() => {
    if (!course || !course.units) return [];

    return [...course.units].sort((a, b) => a.unitNumber - b.unitNumber);
  }, [course]);

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={onClose}
    >
      <Animated.View
        style={[
          styles.modalOverlay,
          {
            backgroundColor: colors.backdrop,
            opacity: fadeAnim,
          },
        ]}
        onTouchEnd={onClose}
      />
      <Animated.View
        style={[
          styles.modalContent,
          {
            backgroundColor: colors.surface,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text variant="titleLarge" style={{ color: colors.onSurface }}>
              Table of Contents
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Feather name="x" size={24} color={colors.onSurface} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.tocScrollView}>
            {!isLoading && course ? (
              sortedUnits.map((unit) => {
                // Sort modules within each unit
                const sortedModules = [...unit.modules].sort(
                  (a, b) => a.moduleNumber - b.moduleNumber
                );

                return (
                  <View key={unit.unitNumber} style={styles.unitContainer}>
                    <View style={styles.unitHeader}>
                      <Text
                        style={[styles.unitTitle, { color: colors.onSurface }]}
                      >
                        {unit.unitNumber}. {unit.name}
                      </Text>
                    </View>

                    <View style={styles.modulesContainer}>
                      {sortedModules.map((module) => (
                        <TouchableOpacity
                          key={module.id}
                          style={[
                            styles.moduleItem,
                            {
                              backgroundColor: colors.surfaceVariant,
                              borderLeftColor:
                                module.id === parseInt(moduleId, 10)
                                  ? colors.primary
                                  : "transparent",
                            },
                          ]}
                          onPress={() =>
                            onModuleSelect(
                              parseInt(courseId, 10),
                              parseInt(unitId, 10),
                              module.id
                            )
                          }
                          activeOpacity={0.7}
                        >
                          <Text
                            style={[
                              styles.moduleTitle,
                              {
                                color: colors.onSurface,
                                fontWeight:
                                  module.id === parseInt(moduleId, 10)
                                    ? "bold"
                                    : "normal",
                              },
                            ]}
                          >
                            {module.moduleNumber}. {module.name}
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
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                );
              })
            ) : (
              <View style={styles.loadingContainer}>
                <Text>Loading course content...</Text>
              </View>
            )}
          </ScrollView>
        </SafeAreaView>
      </Animated.View>
    </Modal>
  );
};

// Main ModuleFooter component
type ModuleFooterProps = {
  moduleName: string;
  onNext: () => void;
  onTOC: () => void;
  colors: any;
};

export const ModuleFooter: React.FC<ModuleFooterProps> = memo(
  ({ moduleName, onNext, onTOC, colors }) => {
    const [showTOCModal, setShowTOCModal] = useState(false);
    const params = useLocalSearchParams();
    const courseId = params.courseId as string;
    const moduleId = params.moduleId as string;
    const unitId = params.unitId as string;
    const handleTOCPress = () => {
      setShowTOCModal(true);
    };

    const handleCloseModal = () => {
      setShowTOCModal(false);
    };

    const handleModuleSelect = (
      targetModuleId: number,
      targetUnitId: number,
      targetCourseId: number
    ) => {
      setShowTOCModal(false);

      // Add a small delay to ensure the modal is closed before navigation
      setTimeout(() => {
        router.replace({
          pathname: "/(protected)/course/[courseId]/module/[moduleId]",
          params: {
            courseId: targetCourseId,
            moduleId: targetModuleId,
            unitId: targetUnitId,
          },
        });
      }, 300);
    };

    return (
      <>
        {/* TOC Modal */}
        <TOCModal
          visible={showTOCModal}
          courseId={courseId}
          moduleId={moduleId}
          unitId={unitId}
          colors={colors}
          onClose={handleCloseModal}
          onModuleSelect={handleModuleSelect}
        />

        {/* Footer */}
        <View
          style={[styles.stickyFooter, { backgroundColor: colors.surface }]}
        >
          <View style={styles.stickyFooterInner}>
            <TouchableOpacity onPress={() => router.back()}>
              <Feather name="arrow-left" size={18} color={colors.onSurface} />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleTOCPress}>
              <View style={styles.footerTitleContainer}>
                <Feather name="book-open" size={18} color={colors.onSurface} />
                <Text style={[styles.footerTitle, { color: colors.onSurface }]}>
                  {moduleName}
                </Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={onNext}>
              <Feather name="arrow-right" size={18} color={colors.onSurface} />
            </TouchableOpacity>
          </View>
        </View>
      </>
    );
  }
);

const styles = StyleSheet.create({
  stickyFooter: {
    paddingTop: 40,
    height: 40,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    borderTopEndRadius: 8,
    borderTopStartRadius: 8,
  },
  stickyFooterInner: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    height: 40,
  },
  footerTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  footerTitle: {
    fontWeight: "500",
  },
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContent: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: SCREEN_HEIGHT * 0.8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -3,
    },
    shadowOpacity: 0.27,
    shadowRadius: 4.65,
    elevation: 6,
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  closeButton: {
    padding: 4,
  },
  tocScrollView: {
    flex: 1,
  },
  unitContainer: {
    marginVertical: 8,
    paddingHorizontal: 20,
  },
  unitHeader: {
    marginBottom: 8,
  },
  unitTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  modulesContainer: {
    marginLeft: 8,
  },
  moduleItem: {
    padding: 12,
    marginVertical: 4,
    borderRadius: 8,
    borderLeftWidth: 3,
  },
  moduleTitle: {
    fontSize: 15,
  },
  progressBarContainer: {
    height: 3,
    backgroundColor: "rgba(0,0,0,0.1)",
    borderRadius: 1.5,
    overflow: "hidden",
    marginTop: 8,
  },
  progressBar: {
    height: "100%",
    borderRadius: 1.5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
});
