import React, { memo, useState, useEffect, useRef } from 'react';
import { StyleSheet, TouchableOpacity, View, Animated } from 'react-native';
import { Card, Text } from '@/src/components/ui';
import { Feather } from '@expo/vector-icons';
import { useAppTheme } from '@/src/context/ThemeContext';
import { QuestionContent, QuestionProgress } from '@/src/features/module/types/sections';
import { usePoints } from '@/src/features/user/hooks/usePoints';
import { Colors } from '@/constants/Colors';
import * as Haptics from 'expo-haptics';

interface QuestionSectionProps {
  content: QuestionContent;
  questionState: QuestionProgress | undefined;
  onAnswer: (questionId: number, optionId: number, isCorrect: boolean) => void;
  colors: Colors;
}

export const QuestionSection = memo(
  ({ content, questionState, onAnswer, colors }: QuestionSectionProps) => {
    const { addPoints, pointsValues } = usePoints();
    const [selectedOptionId, setSelectedOptionId] = useState<number | null>(null);
    const { theme } = useAppTheme();
    const { dark } = theme;

    const shakeAnimation = useRef(new Animated.Value(0)).current;

    const primaryBlue = '#0070F3';
    const correctGreen = '#25A879';
    const warningAmber = '#F59E0B';
    const defaultGray = dark ? '#333333' : '#EFEFEF';

    useEffect(() => {
      if (questionState?.optionId) {
        setSelectedOptionId(questionState.optionId);

        if (questionState.hasAnswered && !questionState.isCorrect) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          startShakeAnimation();
        } else if (questionState.hasAnswered && questionState.isCorrect) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      } else {
        setSelectedOptionId(null);
      }
    }, [content.id, questionState?.optionId, questionState?.hasAnswered, questionState?.isCorrect]);

    const startShakeAnimation = () => {
      Animated.sequence([
        Animated.timing(shakeAnimation, { toValue: 10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnimation, { toValue: -10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnimation, { toValue: 10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnimation, { toValue: -10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnimation, { toValue: 5, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnimation, { toValue: -5, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnimation, { toValue: 0, duration: 50, useNativeDriver: true }),
      ]).start();
    };

    const handleOptionPress = (optionId: number) => {
      setSelectedOptionId(optionId);

      const selectedOption = content.options.find(opt => opt.id === optionId);
      if (selectedOption) {
        onAnswer(content.id, optionId, selectedOption.isCorrect);
      }
    };

    return (
      <Card style={styles.section} elevation={1}>
        <View style={styles.container}>
          <View style={styles.headerRow}>
            <View style={[styles.tag, { backgroundColor: primaryBlue }]}>
              <Text style={styles.tagText}>Quiz</Text>
            </View>

            {questionState?.hasAnswered && questionState?.isCorrect && (
              <View style={styles.correctBadge}>
                <View style={styles.smallIcon}>
                  <Feather name="check" size={12} color="#fff" />
                </View>
                <Text style={styles.correctText}>Correct</Text>
              </View>
            )}
          </View>

          {/* Question text */}
          <Animated.View style={{ transform: [{ translateX: shakeAnimation }] }}>
            <Text style={styles.questionText}>{content.question}</Text>

            {/* Options */}
            <View style={styles.optionsContainer}>
              {content.options.map((option, index) => {
                const isSelected = option.id === selectedOptionId;
                const showResult = questionState?.hasAnswered;
                const isCorrect = showResult && option.isCorrect;
                const isIncorrect = showResult && isSelected && !option.isCorrect;

                let bgColor = defaultGray;
                let labelColor = dark ? '#fff' : '#333';

                if (isSelected) {
                  if (isCorrect) {
                    bgColor = correctGreen;
                    labelColor = '#fff';
                  } else if (isIncorrect) {
                    bgColor = warningAmber;
                    labelColor = '#fff';
                  } else {
                    bgColor = primaryBlue;
                    labelColor = '#fff';
                  }
                }

                return (
                  <TouchableOpacity
                    key={`${content.id}-${option.id}`}
                    onPress={() => handleOptionPress(option.id)}
                    style={[styles.optionRow, { backgroundColor: bgColor }]}
                    activeOpacity={0.7}
                  >
                    <View style={styles.optionContent}>
                      <Text style={[styles.optionLetter, { color: labelColor }]}>
                        {String.fromCharCode(65 + index)}
                      </Text>
                      <Text style={[styles.optionText, { color: labelColor }]}>
                        {option.content}
                      </Text>
                    </View>

                    {showResult && (option.isCorrect || isIncorrect) && (
                      <View style={styles.resultIcon}>
                        <Feather
                          name={option.isCorrect ? 'check-circle' : 'alert-circle'}
                          size={18}
                          color="#fff"
                        />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </Animated.View>
        </View>
      </Card>
    );
  }
);

const styles = StyleSheet.create({
  section: {
    marginVertical: 12,
    borderRadius: 16,
    overflow: 'hidden',
  },
  container: {
    padding: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  correctBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B981',
    paddingRight: 8,
    paddingLeft: 2,
    borderRadius: 12,
  },
  smallIcon: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  correctText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  questionText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  optionsContainer: {
    gap: 8,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  optionLetter: {
    fontSize: 14,
    fontWeight: '600',
    marginRight: 10,
    width: 18,
  },
  optionText: {
    fontSize: 14,
    flex: 1,
  },
  resultIcon: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  feedback: {
    marginTop: 12,
    padding: 12,
    borderRadius: 12,
  },
  feedbackText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
});
