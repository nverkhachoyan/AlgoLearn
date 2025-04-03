import { Toast, ToastContainerProps } from '@/src/components/Toast';
import { useAppTheme } from '@/src/context/ThemeContext';

const CustomToast = () => {
  const { theme } = useAppTheme();
  const { colors } = theme;

  const showToast = (message: string, props?: ToastContainerProps) => {
    const {
      duration = 3000,
      position = -50,
      textStyle = { color: colors.onSurface },
      opacity = 1,
      containerStyle = {
        paddingVertical: 20,
        paddingHorizontal: 20,
        backgroundColor: colors.surface,
      },
      ...restProps
    } = props || {};

    Toast.show(message, {
      duration,
      position,
      textStyle,
      opacity,
      containerStyle,
      ...restProps,
    });
  };

  return { showToast };
};

export default CustomToast;
