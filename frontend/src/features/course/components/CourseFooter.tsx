import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, View, Animated, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import Conditional from '@/src/components/Conditional';
import { Text } from '@/src/components/ui';
import { useAppTheme } from '@/src/context/ThemeContext';
import { Colors } from '@/constants/Colors';
import { Module } from '../../module/types';

type CourseFooterProps = {
  isLoading: boolean;
  module: Module | null | undefined;
  handleStartCourse: () => void;
  handleRestartCourse: () => void;
  isLargeScreen: boolean;
};

const CourseFooter: React.FC<CourseFooterProps> = ({
  isLoading,
  module,
  handleStartCourse,
  handleRestartCourse,
  isLargeScreen,
}) => {
  const { theme } = useAppTheme();
  const { colors }: { colors: Colors } = theme;
  const [menuVisible, setMenuVisible] = useState(false);
  const rotationValue = useRef(new Animated.Value(0)).current;

  const startRotation = () => {
    Animated.timing(rotationValue, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const stopRotation = () => {
    Animated.timing(rotationValue, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  useEffect(() => {
    if (menuVisible) {
      startRotation();
      stopRotation();
    }
  }, [menuVisible]);

  const spin = rotationValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const handleCogPress = () => {
    setMenuVisible(prev => !prev);
  };

  const styles = StyleSheet.create({
    footerContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderTopWidth: 1,
      borderTopColor: colors.outlineVariant,
    },
    webFooter: {
      paddingHorizontal: 40,
      paddingVertical: 16,
    },
    settingsButton: {
      marginRight: 8,
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.surface,
    },
    mainButton: {
      flex: 1,
    },
    webMainButton: {
      maxWidth: 300,
      marginLeft: 'auto',
    },
    safeArea: {
      backgroundColor: colors.surface,
    },
    menuContent: {
      position: 'absolute',
      right: 0,
      top: -120,
      backgroundColor: colors.surface,
      borderRadius: 8,
      padding: 8,
      elevation: 3,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 3,
      zIndex: 1000,
    },
    menuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 12,
      borderRadius: 4,
    },
    menuItemText: {
      marginLeft: 8,
      color: colors.onSurface,
    },
    button: {
      borderRadius: 8,
      paddingVertical: 10,
      paddingHorizontal: 16,
      justifyContent: 'center',
      alignItems: 'center',
    },
    buttonContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 4,
    },
  });

  console.log(module);

  return (
    <SafeAreaView edges={['bottom']} style={styles.safeArea}>
      <View style={[styles.footerContainer, isLargeScreen && styles.webFooter]}>
        <Conditional
          condition={module != null}
          renderTrue={() => (
            <View style={[styles.mainButton, isLargeScreen && styles.webMainButton]}>
              {/* Custom menu implementation */}
              <View style={{ position: 'relative' }}>
                <Animated.View style={[styles.settingsButton, { transform: [{ rotate: spin }] }]}>
                  <TouchableOpacity onPress={handleCogPress}>
                    <Feather name="settings" size={24} color={colors.onSurface} />
                  </TouchableOpacity>
                </Animated.View>

                {menuVisible && (
                  <View style={styles.menuContent}>
                    <TouchableOpacity
                      style={styles.menuItem}
                      onPress={() => {
                        setMenuVisible(false);
                        handleRestartCourse();
                      }}
                    >
                      <Feather name="refresh-cw" size={20} color={colors.onSurface} />
                      <Text style={styles.menuItemText}>Restart Course</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>

              <TouchableOpacity
                onPress={handleStartCourse}
                disabled={isLoading}
                style={[
                  styles.button,
                  { backgroundColor: colors.primary, opacity: isLoading ? 0.7 : 1 },
                ]}
              >
                <View style={styles.buttonContent}>
                  {isLoading ? (
                    <ActivityIndicator size="small" color={colors.onPrimary} />
                  ) : (
                    <Text style={{ color: colors.onPrimary, fontWeight: '600' }}>
                      {module ? 'Continue Course' : 'Start Course'}
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            </View>
          )}
          renderFalse={
            <View
              style={{
                flex: 1,
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                paddingVertical: 20,
              }}
            >
              <TouchableOpacity
                onPress={handleStartCourse}
                disabled={isLoading}
                style={[
                  styles.button,
                  { backgroundColor: colors.primary, opacity: isLoading ? 0.7 : 1 },
                ]}
              >
                <View style={styles.buttonContent}>
                  {isLoading ? (
                    <ActivityIndicator size="small" color={colors.onPrimary} />
                  ) : (
                    <Text style={{ color: colors.onPrimary, fontWeight: '600' }}>
                      {module ? 'Continue Course' : 'Start Course'}
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            </View>
          }
        />
      </View>
    </SafeAreaView>
  );
};

export default CourseFooter;
