import { Toast, ToastContainerProps } from '@/src/components/Toast';
import { useTheme } from 'react-native-paper';

const CustomToast = () => {
  const { colors } = useTheme();

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
