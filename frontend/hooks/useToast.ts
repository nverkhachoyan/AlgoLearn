import { Toast } from "../components/common/Toast";
import useTheme from "./useTheme";

const CustomToast = () => {
  const { colors } = useTheme();

  const showToast = (message: string, props?: any) => {
    const {
      duration = 3000,
      position = -50,
      backgroundColor = colors.backgroundContrast,
      textStyle = { color: colors.textContrast },
      opacity = 1,
      containerStyle = {
        paddingVertical: 20,
        paddingHorizontal: 20,
      },
      ...restProps
    } = props || {};

    Toast.show(message, {
      duration,
      position,
      backgroundColor,
      textStyle,
      opacity,
      containerStyle,
      ...restProps,
    });
  };

  return { showToast };
};

export default CustomToast;
