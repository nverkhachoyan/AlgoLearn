import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Animated,
  Dimensions,
  Pressable,
  Easing,
  Keyboard,
  SafeAreaView,
  TouchableWithoutFeedback,
  Platform,
  ViewStyle,
  TextStyle,
  GestureResponderEvent,
} from 'react-native';

const TOAST_MAX_WIDTH = 0.8;
const TOAST_ANIMATION_DURATION = 200;

export const positions = {
  TOP: 20,
  BOTTOM: -20,
  CENTER: 0,
} as const;

export const durations = {
  LONG: 3500,
  SHORT: 2000,
} as const;

interface ToastContainerProps {
  visible?: boolean;
  duration?: number;
  animation?: boolean;
  shadow?: boolean;
  position?: number;
  opacity?: number;
  delay?: number;
  hideOnPress?: boolean;
  keyboardAvoiding?: boolean;
  accessible?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityRole?: 'alert' | 'button' | 'link';
  slideFrom?: 'top' | 'bottom';
  containerStyle?: ViewStyle;
  backgroundColor?: string;
  shadowColor?: string;
  textColor?: string;
  textStyle?: TextStyle;
  onPress?: (event: GestureResponderEvent) => void;
  onHide?: () => void;
  onHidden?: () => void;
  onShow?: () => void;
  onShown?: () => void;
  children?: React.ReactNode;
}

const styles = StyleSheet.create({
  defaultStyle: {
    position: 'absolute',
    left: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
  } as ViewStyle,
  containerStyle: {
    padding: 10,
    backgroundColor: '#000',
    opacity: 0.8,
    borderRadius: 5,
  } as ViewStyle,
  shadowStyle: {
    shadowColor: '#000',
    shadowOffset: {
      width: 4,
      height: 4,
    },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 10,
  } as ViewStyle,
  textStyle: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
  } as TextStyle,
});

const Touchable = Pressable || TouchableWithoutFeedback;
const Wrapper = SafeAreaView || View;

const ToastContainer: React.FC<ToastContainerProps> = ({
  visible = false,
  duration = durations.SHORT,
  animation = true,
  shadow = true,
  position = positions.BOTTOM,
  opacity = 0.8,
  delay = 0,
  hideOnPress = true,
  keyboardAvoiding = true,
  accessible = true,
  accessibilityLabel,
  accessibilityHint,
  accessibilityRole = 'alert',
  slideFrom = 'bottom',
  containerStyle,
  textStyle,
  onPress,
  onHide,
  onHidden,
  onShow,
  onShown,
  children,
}) => {
  const window = Dimensions.get('window');
  const [state, setState] = useState({
    visible,
    opacity: new Animated.Value(0),
    translateY: new Animated.Value(slideFrom === 'top' ? -window.height : window.height),
    windowWidth: window.width,
    windowHeight: window.height,
    keyboardScreenY: window.height,
  });

  const animating = useRef(false);
  const rootRef = useRef<View>(null);
  const hideTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const showTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const dimensionListener = Dimensions.addEventListener('change', handleWindowChange);

    let keyboardListener: any;
    if (keyboardAvoiding) {
      keyboardListener = Keyboard.addListener('keyboardDidChangeFrame', handleKeyboardChange);
    }

    if (state.visible) {
      showTimeout.current = setTimeout(showToast, delay);
    }

    return () => {
      hideToast();
      dimensionListener?.remove();
      keyboardListener?.remove?.();
    };
  }, []);

  useEffect(() => {
    if (visible) {
      clearTimeout(showTimeout.current as ReturnType<typeof setTimeout>);
      clearTimeout(hideTimeout.current as ReturnType<typeof setTimeout>);
      showTimeout.current = setTimeout(showToast, delay);
    } else {
      hideToast();
    }

    setState(prevState => ({ ...prevState, visible }));
  }, [visible]);

  const handleWindowChange = useCallback(({ window }: { window: any }) => {
    setState(prevState => ({
      ...prevState,
      windowWidth: window.width,
      windowHeight: window.height,
    }));
  }, []);

  const handleKeyboardChange = useCallback(({ endCoordinates }: { endCoordinates: any }) => {
    setState(prevState => ({
      ...prevState,
      keyboardScreenY: endCoordinates.screenY,
    }));
  }, []);

  const setPointerEvents = useCallback((value: string) => {
    if (Platform.OS !== 'web') {
      rootRef.current?.setNativeProps({
        pointerEvents: value,
      });
    } else if (rootRef.current) {
      (rootRef.current as any).style.pointerEvents = value;
    }
  }, []);

  const showToast = useCallback(() => {
    clearTimeout(showTimeout.current as ReturnType<typeof setTimeout>);
    if (!animating.current) {
      clearTimeout(hideTimeout.current as ReturnType<typeof setTimeout>);
      animating.current = true;
      setPointerEvents('auto');
      onShow?.();

      const initialTranslateValue = slideFrom === 'top' ? -state.windowHeight : state.windowHeight;
      state.translateY.setValue(initialTranslateValue);

      Animated.parallel([
        Animated.timing(state.opacity, {
          toValue: opacity,
          duration: animation ? TOAST_ANIMATION_DURATION : 0,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(state.translateY, {
          toValue: 0,
          duration: animation ? TOAST_ANIMATION_DURATION : 0,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start(({ finished }) => {
        if (finished) {
          animating.current = !finished;
          onShown?.();
          if (duration > 0) {
            hideTimeout.current = setTimeout(hideToast, duration);
          }
        }
      });
    }
  }, [state.opacity, state.translateY, opacity, animation, onShow, onShown, duration]);

  const hideToast = useCallback(() => {
    clearTimeout(showTimeout.current as ReturnType<typeof setTimeout>);
    clearTimeout(hideTimeout.current as ReturnType<typeof setTimeout>);
    if (!animating.current) {
      setPointerEvents('none');
      onHide?.();

      const finalTranslateValue = slideFrom === 'top' ? -state.windowHeight : state.windowHeight;

      Animated.parallel([
        Animated.timing(state.opacity, {
          toValue: 0,
          duration: animation ? TOAST_ANIMATION_DURATION : 0,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(state.translateY, {
          toValue: finalTranslateValue,
          duration: animation ? TOAST_ANIMATION_DURATION : 0,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start(({ finished }) => {
        if (finished) {
          animating.current = false;
          onHidden?.();
        }
      });
    }
  }, [state.opacity, state.translateY, animation, onHide, onHidden]);

  const { windowWidth } = state;
  const offset = position;

  const { windowHeight, keyboardScreenY } = state;
  const keyboardHeight = Math.max(windowHeight - keyboardScreenY, 0);
  const calculatedPosition = offset
    ? {
        [offset < 0 ? 'bottom' : 'top']: offset < 0 ? keyboardHeight - offset : offset,
      }
    : {
        top: 0,
        bottom: keyboardHeight,
      };

  return state.visible || animating.current ? (
    <Wrapper
      style={[styles.defaultStyle, calculatedPosition]}
      pointerEvents="box-none"
      accessible={accessible}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessibilityRole={accessibilityRole}
    >
      <Touchable
        onPress={event => {
          onPress?.(event);
          hideOnPress && hideToast();
        }}
      >
        <Animated.View
          style={[
            styles.containerStyle,
            { marginHorizontal: windowWidth * ((1 - TOAST_MAX_WIDTH) / 2) },
            containerStyle,

            {
              opacity: state.opacity,
              transform: [{ translateY: state.translateY }],
            },
            shadow && styles.shadowStyle,
          ]}
          pointerEvents="none"
          ref={rootRef}
        >
          <Text style={[styles.textStyle, textStyle]}>{children}</Text>
        </Animated.View>
      </Touchable>
    </Wrapper>
  ) : null;
};

export default ToastContainer;
export type { ToastContainerProps };
