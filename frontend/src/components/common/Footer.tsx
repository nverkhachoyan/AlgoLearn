import { View, StyleSheet } from "react-native";
import { useTheme } from "react-native-paper";

export function EmptyFooter({
  height = 10,
  left,
  center,
  right,
}: {
  height?: number;
  left?: React.ReactNode;
  center?: React.ReactNode;
  right?: React.ReactNode;
}) {
  const { colors } = useTheme();
  return (
    <View
      style={[styles.container, { height, backgroundColor: colors.surface }]}
    >
      {left || center || right ? (
        <>
          <View style={styles.left}>{left}</View>
          <View style={styles.center}>{center}</View>
          <View style={styles.right}>{right}</View>
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 7 },
    shadowOpacity: 0.05,
    shadowRadius: 3.84,
    borderTopEndRadius: 8,
    borderTopStartRadius: 8,
    zIndex: 100,
  },
  left: {
    flex: 1,
  },
  center: {
    flex: 1,
  },
  right: {
    flex: 1,
  },
});
