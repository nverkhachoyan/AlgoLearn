import { memo } from "react";
import { TouchableOpacity, StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { useCourse } from "../../hooks/useCourses";

export const ModuleFooter = memo(
  ({
    moduleName,
    onNext,
    onTOC,
    colors,
  }: {
    moduleName: string;
    onNext: () => void;
    onTOC: () => void;
    colors: any;
  }) => (
    <View style={[styles.stickyFooter, { backgroundColor: colors.surface }]}>
      <View style={styles.stickyFooterInner}>
        <TouchableOpacity onPress={() => router.back()}>
          <Feather name="arrow-left" size={18} color={colors.onSurface} />
        </TouchableOpacity>
        <TouchableOpacity onPress={onTOC}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
            <Feather name="book-open" color={colors.onSurface} />
            <Text style={{ color: colors.onSurface }}>{moduleName}</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={onNext}>
          <Feather name="arrow-right" size={18} color={colors.onSurface} />
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
