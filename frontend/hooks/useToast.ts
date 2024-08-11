import { Toast } from "../components/common/Toast";
import useTheme from "./useTheme";

const CustomToast = () => {
  const { colors } = useTheme();
  const showToast = (props: any) => {
    const { message, ...rest } = props;
    Toast.show(message, {
      duration: 3000,
      position: -50,
      backgroundColor: colors.backgroundContrast,
      textStyle: {
        color: colors.textContrast,
      },
      opacity: 1,
      containerStyle: {
        paddingVertical: 20,
        paddingHorizontal: 20,
      },
      ...rest,
    });
  };

  return { showToast };
};

export default CustomToast;
