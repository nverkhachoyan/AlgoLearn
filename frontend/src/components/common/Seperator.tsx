import { StyleSheet, View } from "react-native";

export function Seperator(props: any) {
  return (
    <View
      style={[styles.separator, { ...props.styles }]}
      // lightColor="#eee"
      // darkColor="rgba(255,255,255,0.1)"
    />
  );
}

const styles = StyleSheet.create({
  separator: {
    marginVertical: 30,
    height: 1,
    width: "80%",
  },
});
