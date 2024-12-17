import { StatusBar } from "expo-status-bar";
import {
  Platform,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  View,
} from "react-native";
import { Text } from "react-native-paper";
import { useTheme } from "react-native-paper";
import { useUser } from "@/src/features/user/hooks/useUser";

export default function SessionTOC() {
  const { isAuthenticated, user } = useUser();
  const { colors } = useTheme();

  const units = [
    {
      unitNumber: "1",
      unitName: "algorithms",
      modules: {
        "1": "module 1",
        "2": "module 2",
        "3": "module 3",
      },
    },
    {
      unitNumber: "2",
      unitName: "whatever",
      modules: {
        "1": "module 1",
        "2": "module 2",
        "3": "module 3",
      },
    },
    {
      unitNumber: "3",
      unitName: "something",
      modules: {
        "1": "module 1",
        "2": "module 2",
        "3": "module 3",
        "4": "module 4",
        "5": "module 5",
      },
    },
  ];

  if (!isAuthenticated || !user) {
    return <Text>Not logged in</Text>;
  }

  return (
    <View
      style={[styles.container, { backgroundColor: colors.secondaryContainer }]}
    >
      <Text style={styles.courseTitle}> The JavaScript Ecosystem </Text>
      <ScrollView
        contentContainerStyle={[
          styles.unitContainer,
          { backgroundColor: colors.secondaryContainer },
        ]}
      >
        {units.map((unit: any) => {
          return (
            <View key={unit.unitNumber} style={[styles.unitTitle]}>
              <View style={[styles.unitTitleContainer]}>
                <Text
                  style={[styles.unitTitleText, { color: colors.onSurface }]}
                >
                  {unit.unitNumber}.
                </Text>
                <Text
                  style={[styles.unitTitleText, { color: colors.onSurface }]}
                >
                  {unit.unitName}
                </Text>
              </View>
              <View style={styles.unitContainer}>
                <View style={styles.modulesContainer}>
                  {Object.entries(unit.modules).map(([key, module]) => (
                    <TouchableOpacity
                      key={key}
                      style={[
                        styles.moduleItem,
                        { backgroundColor: colors.onSecondaryContainer },
                      ]}
                    >
                      <Text
                        style={[
                          styles.moduleTitle,
                          { color: colors.onSurface },
                        ]}
                      >
                        {module as string}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
          );
        })}
      </ScrollView>
      <StatusBar style={Platform.OS === "ios" ? "light" : "auto"} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  courseTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginVertical: 20,
    textAlign: "center",
    textTransform: "capitalize",
  },
  unitContainer: {
    borderRadius: 5,
    paddingHorizontal: 20,
  },

  unitTitleContainer: {
    textTransform: "capitalize",
    flexDirection: "row",
    justifyContent: "flex-start",
    gap: 10,
    alignItems: "center",
    marginHorizontal: 23,
  },
  unitTitle: {
    paddingVertical: 13,
    textTransform: "capitalize",
  },
  unitTitleText: {
    fontSize: 16,
    fontWeight: "bold",
    textTransform: "capitalize",
  },

  modulesContainer: {
    backgroundColor: "transparent",
    marginVertical: 10,
  },
  moduleItem: {
    height: 40,
    justifyContent: "center",
    paddingHorizontal: 15,
    marginVertical: 5,
    borderRadius: 5,
    backgroundColor: "#fff",
  },
  moduleTitle: {
    textTransform: "capitalize",
  },
  tocContainer: {
    width: "80%",
    marginVertical: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
  },
  unitsContainer: {},
});
