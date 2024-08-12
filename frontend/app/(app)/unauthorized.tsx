import { StyleSheet } from "react-native";
import { View, ScrollView, Text } from "@/components/Themed";
import { useAuthContext } from "@/context/AuthProvider";
import CourseCard from "@/components/tabs/CourseCard";
import Button from "@/components/common/Button";
import { ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { useEffect, useRef } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import useTheme from "@/hooks/useTheme";
import { StickyHeader } from "@/components/common/StickyHeader";

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
