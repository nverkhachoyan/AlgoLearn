import React, { useMemo } from "react";
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import SectionRenderer from "./components/SectionRenderer";

export default function ModuleSession(props: any) {
  const content = {
    sections: [
      {
        type: "text",
        content:
          "## Welcome to JavaScript: The Language of the Web\n\nJavaScript is a versatile and powerful programming language that brings interactivity and dynamism to web pages. Let's embark on an exciting journey to learn the fundamentals of JavaScript! [Get started](https://static.vecteezy.com/system/resources/thumbnails/027/254/720/small/colorful-ink-splash-on-transparent-background-png.png)",
        position: 1,
      },
      {
        type: "text",
        content:
          "![JavaScript Logo](https://static.vecteezy.com/system/resources/thumbnails/027/254/720/small/colorful-ink-splash-on-transparent-background-png.png)",
        position: 2,
      },
      // {
      //   type: "lottie",
      //   animation: "require('@/assets/lotties/AlgoLearnLogo.json')",
      //   position: 3,
      // },
      {
        type: "text",
        content:
          "### Key Concepts in JavaScript\n\n\n1. **Variables**: Store and manipulate data\n2. **Functions**: Reusable blocks of code\n3. **Control Flow**: Make decisions and repeat actions\n4. **Objects**: Organize and structure your code\n\nLet's start with variables!",
        position: 4,
      },
      {
        type: "question",
        question_id: 1,
        question:
          "Which keyword is used to declare a constant variable in JavaScript?",
        options: [
          { id: 1, content: "var" },
          { id: 2, content: "let" },
          { id: 3, content: "const" },
        ],
        correct_option_id: 3,
        position: 5,
      },
      {
        type: "video",
        url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        position: 6,
      },
      {
        type: "code",
        content:
          '\n// Declaring variables\nlet age = 25;\nconst PI = 3.14159;\n// Using variables\nconsole.log(`I am ${age} years old`);\nconsole.log(`The value of PI is ${PI}`);\nfunction hello(){const help = "true"}',
        position: 7,
      },
      {
        type: "text",
        content:
          "**Pro Tip:** Use `const` for values that won't change, and `let` for variables that might be reassigned. Avoid using `var` in modern JavaScript.",
        position: 8,
      },
      {
        type: "text",
        content:
          "![JavaScript in action](https://octodex.github.com/images/minion.png)",
        position: 9,
      },
      {
        type: "text",
        content:
          "Now that you've learned about variables, you're ready to start your JavaScript journey! In the next section, we'll explore functions and how they can make your code more efficient and organized.",
        position: 10,
      },
    ],
  };

  const sections = content.sections;

  const sortedSections = useMemo(
    () => sections.sort((a, b) => a.position - b.position),
    [sections],
  );

  return (
    <ScrollView stickyHeaderIndices={[0]}>
      <View style={styles.stickyHeader}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => router.back()}>
            <Feather name="x" size={18} color="black" />
          </TouchableOpacity>
          <Text style={styles.headerText}>Module 1: JavaScript</Text>
        </View>
      </View>
      <View style={styles.viewContainer}>
        {sortedSections.map((section: any) => (
          <SectionRenderer key={section.position} section={section} />
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  stickyHeader: {
    backgroundColor: "white",
    paddingLeft: 20,
    paddingVertical: 20,
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    marginBottom: 30,
    borderBottomEndRadius: 8,
    borderBottomStartRadius: 8,
  },
  headerContent: {
    flex: 1,
    flexDirection: "row",
    gap: 10,
  },
  headerText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  viewContainer: {
    flex: 1,
    padding: 20,
  },
});
