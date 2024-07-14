import React, { useState, useCallback, useMemo } from "react";
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  Linking,
  Alert,
  StyleSheet,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { Image } from "expo-image";
import LottieView from "lottie-react-native";
import Markdown from "react-native-markdown-display";
import YoutubePlayer from "react-native-youtube-iframe";

const tokenize = (code: string) => {
  const keywords = [
    "const",
    "let",
    "var",
    "function",
    "return",
    "if",
    "else",
    "for",
    "while",
  ];
  const tokens = [];
  let current = "";

  for (let char of code) {
    if (/\s/.test(char)) {
      if (current) tokens.push(current);
      tokens.push(char);
      current = "";
    } else if (/[(){}\[\];]/.test(char)) {
      if (current) tokens.push(current);
      tokens.push(char);
      current = "";
    } else {
      current += char;
    }
  }
  if (current) tokens.push(current);

  return tokens.map((token) => {
    if (keywords.includes(token)) return { type: "keyword", value: token };
    if (/^["'`].*["'`]$/.test(token)) return { type: "string", value: token };
    if (/^\d+$/.test(token)) return { type: "number", value: token };
    if (/^[a-zA-Z_]\w*$/.test(token))
      return { type: "identifier", value: token };
    return { type: "punctuation", value: token };
  });
};

const CodeBlock = React.memo(({ code }: { code: string }) => {
  const tokens = useMemo(() => tokenize(code), [code]);

  return (
    <View style={[styles.section, styles.codeBlock]}>
      {tokens.map((token, index) => (
        <Text key={index} style={[styles.token, styles[token.type]]}>
          {token.value}
        </Text>
      ))}
    </View>
  );
});

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
          "```javascript\n// Declaring variables\nlet age = 25;\nconst PI = 3.14159;\n\n// Using variables\nconsole.log(`I am ${age} years old`);\nconsole.log(`The value of PI is ${PI}`);\n```",
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
        {sortedSections.map((section: any) => getComponent(section))}
      </View>
    </ScrollView>
  );
}

const getComponent = (section: any) => {
  const [videoPlaying, setVideoPlaying] = useState(false);

  const onStateChange = useCallback((state: any) => {
    if (state === "ended") {
      setVideoPlaying(false);
      Alert.alert("video has finished playing!");
    }
  }, []);

  const togglePlaying = useCallback(() => {
    setVideoPlaying((prev) => !prev);
  }, []);

  switch (section.type) {
    case "text":
      return (
        <Markdown
          key={section.position}
          rules={{
            code: () => null, // This will prevent Markdown from rendering code blocks
            image: (node) => {
              return (
                <Image
                  key={node.key}
                  source={{ uri: node.attributes.src }}
                  style={{ width: "100%", height: 200, resizeMode: "contain" }}
                />
              );
            },
          }}
          style={{
            body: { fontSize: 16, fontFamily: "OpenSauceOne-Regular" },
            heading1: { fontSize: 24, fontFamily: "OpenSauceOne-Bold" },
            heading2: { fontSize: 22, fontFamily: "OpenSauceOne-Bold" },
            heading3: {
              fontSize: 20,
              fontFamily: "OpenSauceOne-Bold",
            },
            ordered_list: { marginVertical: 15 },
            list_item: { marginVertical: 5 },
            text: { lineHeight: 24 },
            link: { color: "#434343", textDecorationLine: "underline" },
          }}
          onLinkPress={(url) => {
            Linking.openURL(url);
            return false;
          }}
        >
          {section.content}
        </Markdown>
      );
    case "image":
      return (
        <View
          key={section.position}
          style={[styles.section, { marginVertical: 10 }]}
        >
          <Image
            source={{ uri: section.url }}
            style={{ width: "100%", height: 200 }}
          />
          {section.description && <Text>{section.description}</Text>}
        </View>
      );
    case "lottie":
      return (
        <View
          key={section.position}
          style={[styles.section, { width: "100%" }]}
        >
          <LottieView
            source={section.animation}
            style={{ flex: 1, alignSelf: "center", width: 200, height: 200 }}
            autoPlay
            loop
          />
        </View>
      );
    case "question":
      return (
        <View
          key={section.position}
          style={[styles.section, { marginVertical: 10 }]}
        >
          <Text>{section.question}</Text>
          {section.options.map((option: any) => (
            <Text key={option.id}>{option.content}</Text>
          ))}
        </View>
      );
    case "video":
      return (
        <View
          key={section.position}
          style={[styles.section, { height: 200, marginVertical: 10 }]}
        >
          <YoutubePlayer
            height={300}
            play={videoPlaying}
            videoId={section.url.split("v=")[1]}
            onChangeState={onStateChange}
          />
        </View>
      );
    case "code":
      return (
        <CodeBlock
          key={section.position}
          code={section.content.replace(/```javascript\n|```/g, "")}
        />
      );
    default:
      return null;
  }
};

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
  section: {
    marginVertical: 10,
  },
  codeBlock: {
    backgroundColor: "#19171C",
    padding: 10,
    borderRadius: 5,
    flexDirection: "row",
    flexWrap: "wrap",
  },
  token: {
    fontFamily: "monospace",
  },
  keyword: {
    color: "#07a",
  },
  string: {
    color: "#690",
  },
  number: {
    color: "#905",
  },
  identifier: {
    color: "#DD4A68",
  },
  punctuation: {
    color: "#999",
  },
});
