import React, { useState } from "react";
import {
  StyleSheet,
  Pressable,
  TouchableOpacity,
  ScrollView,
  View,
} from "react-native";
import { Text } from "react-native-paper";
import Button from "@/src/components/common/Button";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "react-native-paper";

export default function CourseSelectionScreen() {
  const { colors } = useTheme();
  const [checked, setChecked] = useState(false);

  return (
    <View style={styles.container}>
      <ScrollView style={[{ backgroundColor: colors.background }]}>
        <Pressable style={styles.goBackButton} onPress={() => router.back()}>
          <Feather name="arrow-left" size={24} color={colors.onSurface} />
        </Pressable>
        <Text style={[styles.title, { color: colors.onSurface }]}>
          Find a course that interests you
        </Text>

        <Text style={[styles.description, { color: colors.onSurface }]}>
          Select one (or more) of our courses and start learning at your own
          pace!
        </Text>

        <View>
          <TouchableOpacity
            onPress={() => {
              setChecked(!checked);
            }}
          >
            <View
              style={[styles.inputContainer, { borderColor: colors.onSurface }]}
            >
              {/* <TextInput
                style={[
                  {
                    borderColor: colors.border,
                    color: colors.text,
                  },
                ]}
                value="The JavaScript Ecosystem"
                placeholderTextColor={colors.placeholderText}
              /> */}

              <MaterialCommunityIcons
                name={
                  checked ? "checkbox-marked-outline" : "checkbox-blank-outline"
                }
                size={22}
                style={{ color: colors.onSurface }}
              />
            </View>
          </TouchableOpacity>
        </View>

        <Text style={[styles.informative, { color: colors.secondary }]}>
          More courses coming soon
        </Text>
      </ScrollView>
      <Button
        title="Start learning"
        onPress={() => {
          router.navigate("/(tabs)" as any);
        }}
        style={{
          backgroundColor: colors.background,
        }}
        textStyle={{ color: colors.onSurface }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingLeft: 25,
    paddingRight: 25,
  },
  goBackButton: {
    flexDirection: "row",
    alignItems: "center",
    position: "absolute",
    top: 20,
    left: 0,
    zIndex: 1,
  },
  titleContainer: {
    marginTop: 100,
    marginBottom: 30,
  },
  buttonContainer: {
    marginTop: 30,
    marginBottom: 30,
  },
  middleContent: {
    flex: 1,
    justifyContent: "center",
    marginTop: 30,
    marginBottom: 30,
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    textAlign: "left",
    marginTop: 70,
    marginBottom: 30,
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  line: {
    height: 1,
    flex: 1,
  },
  orText: {
    marginHorizontal: 10,
    fontSize: 16,
  },
  description: {
    marginBottom: 20,
    fontSize: 16,
  },
  informative: {
    alignSelf: "center",
    marginVertical: 20,
    fontSize: 14,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 45,
    padding: 10,
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 16,
  },
});
