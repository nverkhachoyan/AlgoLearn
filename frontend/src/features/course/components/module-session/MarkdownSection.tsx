import React, { useState, useEffect, memo } from "react";
import { Linking, StyleSheet, TouchableOpacity } from "react-native";
import { Image } from "expo-image";
import Markdown from "react-native-markdown-display";
import { MarkdownContent } from "@/src/features/module/types/sections";
import { Card } from "react-native-paper";
import ImageView from "react-native-image-viewing";

interface MarkdownSectionProps {
  content: MarkdownContent;
  position: number;
  colors: any;
}

export const MarkdownSection = memo(
  ({ content, position, colors }: MarkdownSectionProps) => {
    const [isVisible, setIsVisible] = useState(false);
    const [images, setImages] = useState<Array<{ uri: string }>>([]);

    useEffect(() => {
      const markdownContent = content.markdown;
      const imageUrlRegex = /!\[.*?\]\((.*?)\)/g;
      const matches = [...markdownContent.matchAll(imageUrlRegex)];
      const imageUrls = matches.map((match) => ({ uri: match[1] }));
      setImages(imageUrls);
    }, [content.markdown]);

    return (
      <>
        <Card style={[styles.section, { backgroundColor: colors.surface }]}>
          <Card.Content>
            <Markdown
              key={position}
              rules={{
                code: () => null,
                image: (node) => (
                  <TouchableOpacity
                    onPress={() => {
                      setIsVisible(true);
                    }}
                    style={[
                      {
                        width: "100%",
                        height: 200,
                      },
                    ]}
                  >
                    <Image
                      key={node.key}
                      source={{ uri: node.attributes.src }}
                      style={[
                        {
                          width: "100%",
                          height: 200,
                        },
                      ]}
                    />
                  </TouchableOpacity>
                ),
              }}
              style={{
                body: { fontSize: 16, fontFamily: "OpenSauceOne-Regular" },
                heading1: { fontSize: 24, fontFamily: "OpenSauceOne-Bold" },
                heading2: { fontSize: 22, fontFamily: "OpenSauceOne-Bold" },
                heading3: { fontSize: 20, fontFamily: "OpenSauceOne-Bold" },
                ordered_list: { marginVertical: 15, color: colors.onSurface },
                list_item: { marginVertical: 4 },
                text: { lineHeight: 24, color: colors.onSurface },
                link: { color: "#434343", textDecorationLine: "underline" },
                code_inline: {
                  color: colors.text,
                  fontFamily: "OpenSauceOne-Bold",
                  backgroundColor: colors.background,
                },
              }}
              onLinkPress={(url) => {
                Linking.openURL(url);
                return false;
              }}
            >
              {content.markdown}
            </Markdown>
          </Card.Content>
        </Card>

        <ImageView
          images={images}
          imageIndex={0}
          visible={isVisible}
          onRequestClose={() => setIsVisible(false)}
          swipeToCloseEnabled={true}
        />
      </>
    );
  },
);

const styles = StyleSheet.create({
  section: {
    marginVertical: 10,
  },
});
