import { StyleSheet } from "react-native";
import { View, Text } from "@/src/components/Themed";
import { useAuthContext } from "@/src/context/AuthProvider";
import Button from "@/src/components/common/Button";

export default function Home() {
  const { invalidateAuth } = useAuthContext();

  return (
    <View style={styles.container}>
      <Text>
        Not logged in
        <Button
          title="Clear local storage"
          onPress={() => {
            invalidateAuth();
          }}
        />
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent",
  },
  scrollContent: {
    flexGrow: 1,
    marginHorizontal: 16,
    paddingVertical: 16,
    justifyContent: "flex-start",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    fontFamily: "OpenSauceOne-Regular",
    alignSelf: "center",
  },
  separator: {
    marginVertical: 10,
    height: 1,
    width: "80%",
    alignSelf: "center",
  },
  headerItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  logo: {
    width: 36,
    height: 36,
  },
  stickyHeaderTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
});
