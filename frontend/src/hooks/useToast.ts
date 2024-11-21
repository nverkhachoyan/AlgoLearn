import { Toast, ToastContainerProps } from "@/src/components/common/Toast";
import useTheme from "./useTheme";

const CustomToast = () => {
  const { colors } = useTheme();

  const showToast = (message: string, props?: ToastContainerProps) => {
    const {
      duration = 3000,
      position = -50,
      textStyle = { color: colors.textContrast },
      opacity = 1,
      containerStyle = {
        paddingVertical: 20,
        paddingHorizontal: 20,
        backgroundColor: colors.backgroundContrast,
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
