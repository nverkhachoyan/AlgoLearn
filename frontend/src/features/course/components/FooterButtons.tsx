import { View, StyleSheet, ActivityIndicator, ViewStyle } from "react-native";
import Button from "@/src/components/common/Button";
import { Colors } from "@/constants/Colors";

interface FooterButtonsProps {
  colors: Colors;
  rightButton?: string;
  leftButton?: string;
  onStartCourse?: () => void;
  onLeftButtonPress?: () => void;
  isLoading?: boolean;
}

export default function FooterButtons({
  colors,
  rightButton,
  leftButton,
  onStartCourse,
  onLeftButtonPress,
  isLoading,
}: FooterButtonsProps) {
  return (
    <View style={[styles.footer, { backgroundColor: colors.background }]}>
      {leftButton && (
        <Button
          title={leftButton}
          style={
            { ...styles.button, backgroundColor: colors.error } as ViewStyle
          }
          textStyle={{ color: colors.onError }}
          onPress={onLeftButtonPress || (() => {})}
          disabled={isLoading}
        />
      )}
      {rightButton && (
        <Button
          title={rightButton}
          style={
            { ...styles.button, backgroundColor: colors.primary } as ViewStyle
          }
          textStyle={{ color: colors.onPrimary }}
          onPress={onStartCourse || (() => {})}
          disabled={isLoading}
        />
      )}
      {isLoading && (
        <ActivityIndicator
          size="small"
          color={colors.primary}
          style={styles.loader}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  button: {
    minWidth: 150,
  },
  loader: {
    position: "absolute",
    right: 24,
  },
});
