import React, { useState, useCallback } from "react";
import { View, Text, Linking, Alert, StyleSheet } from "react-native";
import { Image } from "expo-image";
import LottieView from "lottie-react-native";
import Markdown from "react-native-markdown-display";
import YoutubePlayer from "react-native-youtube-iframe";
import CodeBlock from "./CodeBlock";

const SectionRenderer = ({ section }: { section: any }) => {
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

export default SectionRenderer;

const styles = StyleSheet.create({
  section: {
    marginVertical: 10,
  },
});
