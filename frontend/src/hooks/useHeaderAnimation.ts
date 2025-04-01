import { useAnimatedStyle, interpolate, Extrapolation, SharedValue } from 'react-native-reanimated';

const TITLE_CONTENT_HEIGHT = 80;
const SCROLL_THRESHOLD = 80;

export const useHeaderAnimation = (
  scrollY: SharedValue<number> | undefined,
  collapsibleTitle = false
) => {
  const titleContentStyle = useAnimatedStyle(() => {
    if (!scrollY || !collapsibleTitle) {
      return {
        opacity: 1,
        height: TITLE_CONTENT_HEIGHT,
      };
    }

    const titleOpacity = interpolate(
      scrollY.value,
      [0, SCROLL_THRESHOLD * 0.6],
      [1, 0],
      Extrapolation.CLAMP
    );

    const height = interpolate(
      scrollY.value,
      [0, SCROLL_THRESHOLD],
      [TITLE_CONTENT_HEIGHT, 0],
      Extrapolation.CLAMP
    );

    const paddingVertical = interpolate(
      scrollY.value,
      [0, SCROLL_THRESHOLD],
      [10, 0],
      Extrapolation.CLAMP
    );

    return {
      opacity: titleOpacity,
      height,
      paddingVertical,
    };
  });

  return {
    titleContentStyle,
  };
};
