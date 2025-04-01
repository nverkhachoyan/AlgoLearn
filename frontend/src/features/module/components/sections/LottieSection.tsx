import React, { useState, useEffect, memo, useRef } from 'react';
import {
  StyleSheet,
  View,
  ActivityIndicator,
  Image,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { Card, Text, useTheme as usePaperTheme } from 'react-native-paper';
import { useTheme } from 'react-native-paper';
import LottieView from 'lottie-react-native';
import { LottieContent } from '@/src/features/module/types/sections';

import { loadLottieAnimation } from '@/src/lib/utils/lottieLoader';
import { useAnimationProgress } from '@/src/lib/utils/useAnimationProgress';
import { useAnimationSpeed } from '@/src/lib/utils/useAnimationSpeed';

import { AnimationHeader } from '@/src/features/module/components/AnimationHeader';
import { MediaControls } from '@/src/components/MediaControls';

interface LottieSectionProps {
  content: LottieContent;
  position: number;
  colors: any;
}

export const LottieSection = memo(({ content, colors }: LottieSectionProps) => {
  const theme = usePaperTheme();
  const { dark } = useTheme();
  const animationRef = useRef<LottieView>(null);

  const [lottieSource, setLottieSource] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usingFallback, setUsingFallback] = useState(false);

  const [isPlaying, setIsPlaying] = useState(content.autoplay === true);
  const [showControls, setShowControls] = useState(false);
  const [isDraggingSlider, setIsDraggingSlider] = useState(false);
  const opacityAnim = useRef(new Animated.Value(1)).current;

  const textColorFilters = [{ keypath: '**.Arrow 1', color: dark ? 'white' : 'black' }];

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

  const toggleControls = () => {
    if (showControls) {
      // Hide controls with animation
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => setShowControls(false));
    } else {
      // Show controls
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

      const result = await loadLottieAnimation(content.source, content.fallbackUrl);

      setLottieSource(result.source);
      setError(result.error);
      setUsingFallback(result.usingFallback);
      setIsLoading(false);
    }

    initAnimation();
  }, [content.source, content.fallbackUrl]);

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

    // Try fallback if not already using it
    if (!usingFallback && content.fallbackUrl) {
      console.log('Animation failed, trying fallback URL');
      setUsingFallback(true);
      setLottieSource({ uri: content.fallbackUrl });
    }
  };

  // Force correct initial state
  useEffect(() => {
    if (animationRef.current && !isLoading && !usingFallback) {
      if (content.autoplay !== true) {
        setTimeout(() => {
          if (animationRef.current) {
            animationRef.current.pause();
            resetProgress();
          }
        }, 50);
      }
    }
  }, [lottieSource, isLoading, usingFallback, content.autoplay]);

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
    <Card
      style={[styles.section, { backgroundColor: colors.surface }]}
      elevation={0}
      mode="elevated"
    >
      {/* Animation Header */}
      <AnimationHeader
        title="Animation"
        showControls={showControls}
        onToggleControls={toggleControls}
        backgroundColor={colors.surface}
      />

      <Card.Content style={[styles.cardContent, { backgroundColor: colors.inverseOnSurface }]}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Loading animation...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            {content.fallbackUrl ? (
              <Text>Trying to load fallback image...</Text>
            ) : content.altText ? (
              <Text style={styles.altText}>{content.altText}</Text>
            ) : null}
          </View>
        ) : lottieSource ? (
          <>
            <TouchableOpacity
              style={styles.animationContainer}
              activeOpacity={0.9}
              onPress={toggleControls}
            >
              {usingFallback && content.fallbackUrl && (
                <Image
                  source={{ uri: content.fallbackUrl }}
                  style={[
                    styles.fallbackImage,
                    {
                      width: content.width || '100%',
                      height: content.height || 300,
                    },
                  ]}
                  resizeMode="contain"
                />
              )}

              {!usingFallback && (
                <LottieView
                  ref={animationRef}
                  source={lottieSource}
                  style={[
                    styles.lottieView,
                    {
                      width: content.width || '100%',
                      height: content.height || 200,
                    },
                  ]}
                  autoPlay={false}
                  loop={content.loop !== false}
                  speed={(content.speed || 1) * speedMultiplier}
                  colorFilters={textColorFilters}
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
              )}
            </TouchableOpacity>

            {content.caption && <Text style={styles.caption}>{content.caption}</Text>}

            {!usingFallback && showControls && (
              <MediaControls
                isPlaying={isPlaying}
                progress={progress}
                primaryColor={theme.colors.primary}
                surfaceVariant={theme.colors.surfaceVariant}
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
            )}
          </>
        ) : null}
      </Card.Content>
    </Card>
  );
});

const styles = StyleSheet.create({
  section: {
    marginVertical: 16,
    borderRadius: 16,
    overflow: 'hidden',
    borderColor: 'rgba(0,0,0,0.1)',
    borderWidth: 1,
  },
  cardContent: {
    padding: 0,
  },
  loadingContainer: {
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
  },
  errorContainer: {
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
  },
  altText: {
    textAlign: 'center',
    marginTop: 10,
  },
  caption: {
    marginTop: 12,
    marginBottom: 12,
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
    opacity: 0.8,
    paddingHorizontal: 16,
  },
  animationContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    // backgroundColor: "rgba(0,0,0,0.02)",
  },
  lottieView: {
    width: '100%',
    height: 200,
  },
  fallbackImage: {
    width: '100%',
    height: 200,
  },
});
