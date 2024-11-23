import { memo } from "react";
import { View, Text } from "@/src/components/Themed";
import { TouchableOpacity, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";

export const ModuleFooter = memo(
  ({
    moduleName,
    onNext,
    colors,
  }: {
    moduleName: string;
    onNext: () => void;
    colors: any;
  }) => (
    <View
      style={[
        styles.stickyFooter,
        { backgroundColor: colors.secondaryBackground },
      ]}
    >
      <View style={styles.stickyFooterInner}>
        <TouchableOpacity onPress={() => router.back()}>
          <Feather name="arrow-left" size={18} color={colors.icon} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push("toc" as any)}>
          <Text>
            <Feather name="book-open" color={colors.icon} />
            {moduleName}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onNext}>
          <Feather name="arrow-right" size={18} color={colors.icon} />
        </TouchableOpacity>
      </View>
    </View>
  )
);

const styles = StyleSheet.create({
  stickyFooter: {
    paddingTop: 40,
    height: 40,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    borderTopEndRadius: 8,
    borderTopStartRadius: 8,
  },
  stickyFooterInner: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    height: 40,
  },
});
