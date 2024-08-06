import { StatusBar } from "expo-status-bar";
import {
  Platform,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Text, View } from "@/components/Themed";
import { useAuthContext } from "@/context/AuthProvider";
import Button from "@/components/common/Button";
import { router } from "expo-router";
import { Seperator } from "@/components/common/Seperator";
import moment from "moment";
import { Feather, FontAwesome } from "@expo/vector-icons";
import { useEffect } from "react";
import useTheme from "@/hooks/useTheme";
import TableOfContents from "./components/TableOfContents";

export default function SessionTOC() {
  const { user, isAuthed, loading, signOut, deleteAccount } = useAuthContext();
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

  const handleSignOut = () => {
    signOut();
    router.replace("/welcome");
  };

  useEffect(() => {
    if (!loading && !isAuthed && !user) {
      router.navigate("/welcome");
    }
  }, [loading, isAuthed, user]);

  if (!isAuthed || !user) {
    return <Text>Not logged in</Text>;
  }

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.secondaryBackground },
      ]}
    >
      <Text style={styles.courseTitle}> The JavaScript Ecosystem </Text>
      <ScrollView
        contentContainerStyle={[
          styles.unitContainer,
          { backgroundColor: colors.secondaryBackground },
        ]}
      >
        {units.map((unit: any) => {
          return (
            <View key={unit.unitNumber} style={[styles.unitTitle]}>
              <View style={[styles.unitTitleContainer]}>
                <Text style={[styles.unitTitleText, { color: colors.text }]}>
                  {unit.unitNumber}.
                </Text>
                <Text style={[styles.unitTitleText, { color: colors.text }]}>
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
                        { backgroundColor: colors.listBackground },
                      ]}
                    >
                      <Text
                        style={[styles.moduleTitle, { color: colors.text }]}
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
