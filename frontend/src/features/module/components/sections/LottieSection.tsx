import React, { useState, useEffect, memo, useRef } from 'react';
import {
  StyleSheet,
  View,
  ActivityIndicator as RNActivityIndicator,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { Card, Text, ActivityIndicator, Surface } from '@/src/components/ui';
import { Feather } from '@expo/vector-icons';
import { useAppTheme } from '@/src/context/ThemeContext';
import LottieView from 'lottie-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { LottieContent } from '@/src/features/module/types/sections';
import { useAnimationProgress } from '@/src/lib/utils/useAnimationProgress';
import { useAnimationSpeed } from '@/src/lib/utils/useAnimationSpeed';
import { MediaControls } from '@/src/components/MediaControls';
import { buildImgUrl } from '@/src/lib/utils/transform';
import Conditional, { StateRenderer } from '@/src/components/Conditional';

interface LottieSectionProps {
  content: LottieContent;
  folderObjectKey?: string;
  position: number;
  colors: any;
}

type AnimationState = 'loading' | 'error' | 'loaded' | 'empty';

export const LottieSection = memo(({ content, colors, folderObjectKey }: LottieSectionProps) => {
  const { theme } = useAppTheme();
  const { dark } = theme;
  const animationRef = useRef<LottieView>(null);
  const [lottieURL, setLottieURL] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(content.autoplay === true);
  const [showControls, setShowControls] = useState(false);
  const [isDraggingSlider, setIsDraggingSlider] = useState(false);
  const opacityAnim = useRef(new Animated.Value(1)).current;

  // Modern color scheme
  const primaryBlue = '#0070F3';

  // Define gradient colors based on theme
  const gradientColors = dark
    ? ([colors.surface, colors.surfaceVariant + '20'] as readonly [string, string])
    : (['#FFFFFF', '#F8F8F8'] as readonly [string, string]);

  const {
    speedMultiplier,
    showSpeedMenu,
    speedOptions,
    speedButtonRef,
    toggleSpeed,
    selectSpeed,
    handleLongPressSpeed,
    setShowSpeedMenu,
    applySpeedChange,
  } = useAnimationSpeed({
    onSpeedChange: newSpeed => {
      applySpeedChange(animationRef, newSpeed, progress, isPlaying);
    },
  });

  const { progress, setProgress, resetProgress } = useAnimationProgress({
    isPlaying,
    isDragging: isDraggingSlider,
    loop: content.loop !== false,
    speed: content.speed || 1,
    speedMultiplier,
  });

  const getAnimationState = (): AnimationState => {
    if (isLoading) return 'loading';
    if (error) return 'error';
    if (lottieURL) return 'loaded';
    return 'empty';
  };

  const toggleControls = () => {
    if (showControls) {
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => setShowControls(false));
    } else {
      setShowControls(true);
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  };

  useEffect(() => {
    async function initAnimation() {
      setIsLoading(true);
      const result = buildImgUrl('modules', folderObjectKey!, content.objectKey, 'lottie');
      setLottieURL(result);
      setIsLoading(false);
    }

    initAnimation();
  }, [folderObjectKey, content.objectKey]);

  const handlePlayPause = () => {
    if (isPlaying) {
      setIsPlaying(false);
      animationRef.current?.pause();
    } else {
      setIsPlaying(true);

      if (progress >= 0.99) {
        animationRef.current?.reset();
        resetProgress();
      }

      animationRef.current?.resume();
    }
  };

  const handleReset = () => {
    resetProgress();

    if (animationRef.current) {
      animationRef.current.reset();
      if (isPlaying) {
        animationRef.current.play();
      }
    }
  };

  const handleAnimationFailure = (errorMessage: string) => {
    console.error('LottieView animation failure:', errorMessage);
    setError('Failed to load animation');

    if (content.fallbackUrl) {
      console.log('Animation failed, trying fallback URL');
      setLottieURL({ uri: content.fallbackUrl });
    }
  };

  useEffect(() => {
    if (animationRef.current && !isLoading) {
      if (content.autoplay !== true) {
        setTimeout(() => {
          if (animationRef.current) {
            animationRef.current.pause();
            resetProgress();
          }
        }, 50);
      }
    }
  }, [lottieURL, isLoading, content.autoplay]);

  const handleSliderValueChange = (value: number) => {
    setIsDraggingSlider(true);
    setProgress(value);
  };

  const handleSliderComplete = (value: number) => {
    if (animationRef.current) {
      // Use simple approach - reset and play from the position
      if (value === 1) {
        animationRef.current.reset();
      } else {
        // Temporarily pause animation
        const wasPlaying = isPlaying;
        animationRef.current.pause();

        // Wait for a frame to ensure animation paused
        requestAnimationFrame(() => {
          if (animationRef.current) {
            // Set to specific frame
            animationRef.current.play(value);

            // If it wasn't playing, pause it again
            if (!wasPlaying) {
              setTimeout(() => {
                if (animationRef.current) {
                  animationRef.current.pause();
                }
              }, 5);
            }
          }
        });
      }
    }
    setIsDraggingSlider(false);
  };

  return (
    <Card style={styles.section} elevation={1}>
      <View style={styles.cardContent}>
        {/* Header with tag and controls toggle */}
        <View style={styles.headerRow}>
          <View style={[styles.tag, { backgroundColor: primaryBlue }]}>
            <Text style={styles.tagText}>Animation</Text>
          </View>
          <TouchableOpacity onPress={toggleControls} style={styles.controlToggle}>
            <Feather
              name={showControls ? 'chevron-up' : 'chevron-down'}
              size={20}
              color={dark ? colors.tertiary : primaryBlue}
            />
          </TouchableOpacity>
        </View>

        <StateRenderer
          state={getAnimationState()}
          renderers={{
            loading: (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={dark ? colors.tertiary : primaryBlue} />
                <Text style={[styles.loadingText, { color: colors.onSurfaceVariant }]}>
                  Loading animation...
                </Text>
              </View>
            ),

            error: (
              <View style={styles.errorContainer}>
                <View style={styles.errorIcon}>
                  <Feather name="alert-circle" size={32} color={colors.warning} />
                </View>
                <Text style={[styles.errorText, { color: colors.warning }]}>{error}</Text>
                {content.fallbackUrl ? (
                  <Text style={{ color: colors.onSurfaceVariant, fontSize: 13 }}>
                    Trying to load fallback...
                  </Text>
                ) : content.altText ? (
                  <Text style={[styles.altText, { color: colors.onSurfaceVariant }]}>
                    {content.altText}
                  </Text>
                ) : null}
              </View>
            ),

            loaded: (
              <View style={styles.animationWrapper}>
                <TouchableOpacity
                  style={styles.animationContainer}
                  activeOpacity={0.9}
                  onPress={toggleControls}
                >
                  <LottieView
                    ref={animationRef}
                    source={{
                      uri: lottieURL,
                    }}
                    style={styles.lottieView}
                    autoPlay={false}
                    loop={content.loop !== false}
                    speed={(content.speed || 1) * speedMultiplier}
                    resizeMode="contain"
                    onAnimationFailure={handleAnimationFailure}
                    progress={isDraggingSlider ? progress : undefined}
                    onLayout={() => {
                      // Force correct initial state after layout
                      if (content.autoplay === true) {
                        setTimeout(() => animationRef.current?.play(), 50);
                      } else {
                        setTimeout(() => animationRef.current?.pause(), 50);
                      }
                    }}
                  />
                </TouchableOpacity>

                {content.caption && (
                  <Text style={[styles.caption, { color: colors.onSurfaceVariant }]}>
                    {content.caption}
                  </Text>
                )}

                {showControls && (
                  <View style={styles.controlsContainer}>
                    <MediaControls
                      isPlaying={isPlaying}
                      progress={progress}
                      primaryColor={dark ? colors.tertiary : primaryBlue}
                      surfaceVariant={colors.surfaceVariant}
                      speedMultiplier={speedMultiplier}
                      showSpeedMenu={showSpeedMenu}
                      speedOptions={speedOptions}
                      speedButtonRef={speedButtonRef}
                      opacity={opacityAnim}
                      onPlayPause={handlePlayPause}
                      onReset={handleReset}
                      onProgressChange={handleSliderValueChange}
                      onProgressComplete={handleSliderComplete}
                      onSpeedToggle={toggleSpeed}
                      onSpeedLongPress={handleLongPressSpeed}
                      onSpeedSelect={selectSpeed}
                      onSpeedMenuClose={() => setShowSpeedMenu(false)}
                    />
                  </View>
                )}
              </View>
            ),

            empty: null,
          }}
        />
      </View>
    </Card>
  );
});

const styles = StyleSheet.create({
  section: {
    marginVertical: 12,
    borderRadius: 16,
    overflow: 'hidden',
  },
  gradientBackground: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  cardContent: {
    padding: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
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
  controlToggle: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.02)',
    borderRadius: 12,
  },
  loadingText: {
    marginTop: 8,
    fontSize: 13,
    fontWeight: '500',
  },
  errorContainer: {
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.02)',
    borderRadius: 12,
    padding: 16,
  },
  errorIcon: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    marginBottom: 8,
    fontWeight: '500',
    fontSize: 14,
  },
  altText: {
    textAlign: 'center',
    marginTop: 8,
    fontSize: 13,
  },
  animationWrapper: {
    paddingTop: 4,
  },
  animationContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    overflow: 'hidden',
  },
  lottieView: {
    width: '100%',
    height: 200,
    zIndex: 1,
  },
  caption: {
    fontSize: 13,
    fontStyle: 'italic',
    textAlign: 'center',
    opacity: 0.8,
    marginTop: 8,
  },
  controlsContainer: {
    marginTop: 8,
    backgroundColor: 'rgba(0,0,0,0.03)',
    borderRadius: 12,
    padding: 10,
  },
});
