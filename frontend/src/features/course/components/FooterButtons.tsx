import { StyleSheet, View, ViewStyle } from "react-native";
import { Button } from "react-native-paper";
import { Colors } from "@/constants/Colors";

interface FooterButtonsProps {
  colors: Colors;
  rightButton: string;
  onStartCourse: () => void;
  isLoading?: boolean;
}

export default function FooterButtons({
  colors,
  rightButton,
  onStartCourse,
  isLoading,
}: FooterButtonsProps) {
  const buttonStyle: ViewStyle = {
    ...styles.button,
    backgroundColor: colors.primary,
  };

  return (
    <View style={styles.container}>
      <Button
        mode="contained"
        onPress={onStartCourse}
        loading={isLoading}
        style={buttonStyle}
        labelStyle={{ color: colors.onPrimary }}
        disabled={isLoading}
      >
        {rightButton}
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  button: {
    borderRadius: 8,
  },
});
