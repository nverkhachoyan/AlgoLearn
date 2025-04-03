import { Image, StyleSheet, View, Animated, Pressable } from 'react-native';
import { router } from 'expo-router';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import Button from '@/src/components/Button';
import { Author, Unit } from '@/src/features/course/types';
import { useAppTheme } from '@/src/context/ThemeContext';
import { Text, Divider } from '@/src/components/ui';
import { useState, useRef, useEffect } from 'react';
import { Module } from '@/src/features/module/types';
import { COURSE_CARD, CURRENT_MODULE, CURRENT_MODULE_PRESSED } from '@/constants/Colors';
import { BlurView } from 'expo-blur';

export default function CourseCard(props: {
  courseID: string;
  courseTitle: string;
  buttonTitle?: string;
  backgroundColor?: string;
  iconUrl: string;
  description: string;
  authors?: Author[];
  difficultyLevel?: string;
  duration?: string;
  rating?: number;
  currentUnit?: Unit | null;
  currentModule?: Module | null;
  type?: string;
  filter?: string;
  hasProgress?: boolean;
}) {
  const { theme } = useAppTheme();
  const { colors, dark } = theme;
  const [isCoursePressed, setIsCoursePressed] = useState(false);
  const [isCurrentModulePressed, setIsCurrentModulePressed] = useState(false);

  // Colors
  const courseBg = COURSE_CARD[dark ? 'dark' : 'light'];
  const currentModuleBg = isCurrentModulePressed
    ? CURRENT_MODULE_PRESSED[dark ? 'dark' : 'light']
    : CURRENT_MODULE[dark ? 'dark' : 'light'];

  // Animation values
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;

  // Animation for press effect
  useEffect(() => {
    if (isCoursePressed) {
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 0.98,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0.95,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isCoursePressed]);

  return (
    <Pressable
      onPress={() =>
        router.push({
          pathname: '/(protected)/course/[courseId]',
          params: {
            courseId: props.courseID,
            hasProgress: props.currentModule?.id && 'true',
          },
        })
      }
      onPressIn={() => setIsCoursePressed(true)}
      onPressOut={() => setIsCoursePressed(false)}
      style={styles.pressableContainer}
    >
      <Animated.View
        style={[
          styles.animatedContainer,
          {
            transform: [{ scale: scaleAnim }],
            opacity: fadeAnim,
            backgroundColor: courseBg,
            borderRadius: 8,
          },
        ]}
      >
        <View style={styles.container}>
          <View style={[{ backgroundColor: 'transparent', elevation: 4, zIndex: 10 }]}>
            {/* Card Content */}
            <View style={styles.contentContainer}>
              <View style={styles.headerRow}>
                <Image source={{ uri: props.iconUrl }} style={styles.icon} />

                <View style={styles.headerInfo}>
                  <Text variant="headline" style={[styles.title, { color: colors.onSurface }]}>
                    {props.courseTitle}
                  </Text>
                  {props.authors?.map(author => (
                    <Text
                      variant="caption"
                      key={author.id}
                      style={[styles.author, { color: colors.secondary }]}
                    >
                      {author.name}
                    </Text>
                  ))}
                </View>
              </View>

              <BlurView
                tint="light"
                style={{
                  marginBottom: 16,
                  borderRadius: 8,
                  overflow: 'hidden',
                }}
              >
                <View style={[styles.info]}>
                  <View style={styles.infoItem}>
                    <Feather name="percent" size={15} color={colors.secondary} />
                    <Text variant="body" style={[styles.infoText, { color: colors.onSurface }]}>
                      {props.difficultyLevel}
                    </Text>
                  </View>
                  <View style={styles.infoItemDivider} />
                  <View style={styles.infoItem}>
                    <Feather name="clock" size={15} color={colors.secondary} />
                    <Text variant="body" style={[styles.infoText, { color: colors.onSurface }]}>
                      {props.duration}
                    </Text>
                  </View>
                  <View style={styles.infoItemDivider} />
                  <View style={styles.infoItem}>
                    <Feather name="star" size={15} color={colors.secondary} />
                    <Text variant="body" style={[styles.infoText, { color: colors.onSurface }]}>
                      {props.rating}
                    </Text>
                  </View>
                </View>
              </BlurView>

              <Divider style={[styles.divider, { backgroundColor: colors.outline }]} />

              <Text variant="body" style={[styles.description, { color: colors.onSurface }]}>
                {props.description}
              </Text>

              {props?.currentUnit && (
                <View style={styles.currentModuleContainer}>
                  <View>
                    <Pressable
                      onPress={() =>
                        router.push({
                          pathname: '/(protected)/course/[courseId]/module/[moduleId]',
                          params: {
                            courseId: props.courseID,
                            unitId: props.currentUnit?.id,
                            moduleId: props.currentModule?.id as number,
                            hasProgress: props.hasProgress ? 'true' : 'false',
                          },
                        })
                      }
                      onPressIn={() => setIsCurrentModulePressed(true)}
                      onPressOut={() => setIsCurrentModulePressed(false)}
                      style={[
                        styles.currentModuleContent,
                        {
                          overflow: 'hidden',
                          borderRadius: 8,
                          transform: [{ scale: isCurrentModulePressed ? 0.98 : 1 }],
                          backgroundColor: currentModuleBg,
                        },
                      ]}
                    >
                      <View style={styles.currentModuleHeader}>
                        <MaterialIcons
                          name="play-circle-filled"
                          size={20}
                          color="#FFF"
                          style={styles.currentModuleIcon}
                        />
                        <Text variant="caption" style={styles.currentModuleTitle}>
                          Unit {props.currentUnit.unitNumber} · Module{' '}
                          {props.currentModule?.moduleNumber}
                        </Text>
                      </View>

                      <Text variant="subtitle" style={styles.currentModuleName} numberOfLines={1}>
                        {props.currentModule?.name}
                      </Text>

                      <Text
                        variant="body"
                        style={styles.currentModuleDescription}
                        numberOfLines={2}
                      >
                        {props.currentModule?.description}
                      </Text>

                      <Button
                        title="Continue"
                        onPress={() =>
                          router.push({
                            pathname: '/(protected)/course/[courseId]/module/[moduleId]',
                            params: {
                              courseId: props.courseID,
                              moduleId: props.currentModule?.id as number,
                              unitId: props.currentUnit?.id,
                            },
                          })
                        }
                        style={styles.continueButton}
                        textStyle={styles.continueButtonText}
                        iconStyle={{ color: '#1d855f' }}
                        icon={{
                          type: 'feather',
                          name: 'arrow-right',
                          position: 'right',
                        }}
                      />
                    </Pressable>
                  </View>
                </View>
              )}

              {props.filter === 'explore' && (
                <View style={styles.buttonContainer}>
                  <Button
                    title="Check it out"
                    onPress={() =>
                      router.push({
                        pathname: '/(protected)/course/[courseId]',
                        params: {
                          courseId: props.courseID,
                        },
                      })
                    }
                    style={{
                      backgroundColor: colors.tertiary,
                      borderRadius: 25,
                      paddingVertical: 8,
                    }}
                    textStyle={{
                      fontSize: 16,
                      fontWeight: '600',
                      color: '#FFFFFF',
                    }}
                    icon={{
                      type: 'feather',
                      name: 'arrow-right',
                      position: 'right',
                    }}
                    iconStyle={{
                      color: '#FFFFFF',
                    }}
                  />
                </View>
              )}
            </View>
          </View>
        </View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressableContainer: {
    marginVertical: 10,
    shadowOffset: { height: 0, width: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
  },
  animatedContainer: {
    width: '100%',
  },
  container: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  accentGradient: {
    // height: 6,
    width: '100%',
  },
  contentContainer: {
    padding: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  headerInfo: {
    flex: 1,
    marginLeft: 15,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  author: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  icon: {
    width: 64,
    height: 64,
    borderRadius: 12,
  },
  info: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    marginLeft: 6,
    fontSize: 14,
  },
  infoItemDivider: {
    width: 1,
    height: '70%',
    backgroundColor: 'rgba(128, 128, 128, 0.3)',
  },
  divider: {
    marginBottom: 16,
  },
  description: {
    fontSize: 15,
    fontFamily: 'OpenSauceOne-Regular',
    fontWeight: 400,
    lineHeight: 22,
    marginBottom: 20,
  },
  currentModuleContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  currentModuleGradient: {
    width: '100%',
  },
  currentModuleContent: {
    padding: 12,
  },
  currentModuleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  currentModuleIcon: {
    marginRight: 6,
  },
  currentModuleTitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },
  currentModuleName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  currentModuleDescription: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 10,
    lineHeight: 18,
  },
  continueButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 25,
    alignSelf: 'center',
  },
  continueButtonText: {
    color: '#1d855f',
    fontSize: 14,
    fontWeight: '600',
  },
  buttonContainer: {
    alignItems: 'center',
  },
});
