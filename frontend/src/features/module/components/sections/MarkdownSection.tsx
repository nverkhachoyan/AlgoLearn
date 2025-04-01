import React, { useState, useEffect, memo } from "react";
import { Linking, StyleSheet, TouchableOpacity, View } from "react-native";
import { Image } from "expo-image";
import Markdown from "react-native-markdown-display";
import { MarkdownContent } from "@/src/features/module/types/sections";
import { Card, Text, IconButton } from "react-native-paper";
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
        <Card
          style={[styles.section, { backgroundColor: colors.background }]}
          elevation={0}
          mode="elevated"
        >
          <Card.Content style={styles.cardContent}>
            <Markdown
              key={position}
              rules={{
                code: () => null,
                image: (node) => (
                  <TouchableOpacity
                    onPress={() => {
                      setIsVisible(true);
                    }}
                    style={styles.imageContainer}
                  >
                    <Image
                      key={node.key}
                      source={{ uri: node.attributes.src }}
                      style={styles.image}
                      contentFit="cover"
                      transition={300}
                    />
                    <View style={styles.imageOverlay}>
                      <IconButton
                        icon="magnify-plus-outline"
                        iconColor="#fff"
                        size={24}
                        style={styles.zoomIcon}
                      />
                    </View>
                  </TouchableOpacity>
                ),
              }}
              style={{
                body: {
                  fontSize: 16,
                  fontFamily: "OpenSauceOne-Regular",
                  lineHeight: 24,
                },
                heading1: {
                  fontSize: 24,
                  fontFamily: "OpenSauceOne-Bold",
                  marginTop: 24,
                  marginBottom: 16,
                  borderBottomWidth: 1,
                  borderBottomColor: colors.outlineVariant,
                  paddingBottom: 8,
                },
                heading2: {
                  fontSize: 22,
                  fontFamily: "OpenSauceOne-Bold",
                  marginTop: 20,
                  marginBottom: 12,
                  color: colors.onBackground,
                },
                heading3: {
                  fontSize: 20,
                  fontFamily: "OpenSauceOne-Bold",
                  marginTop: 16,
                  marginBottom: 8,
                  color: colors.onBackground,
                },
                ordered_list: {
                  marginVertical: 16,
                  color: colors.onBackground,
                },
                unordered_list: {
                  marginVertical: 16,
                },
                bullet_list: {
                  marginLeft: 8,
                },
                list_item: {
                  marginVertical: 6,
                },
                paragraph: {
                  marginVertical: 12,
                },
                text: {
                  lineHeight: 24,
                  color: colors.onBackground,
                  fontSize: 16,
                },
                link: {
                  color: colors.primary,
                  textDecorationLine: "underline",
                  fontWeight: "500",
                },
                blockquote: {
                  borderLeftWidth: 4,
                  borderLeftColor: colors.primary + "40",
                  paddingLeft: 16,
                  paddingVertical: 8,
                  backgroundColor: colors.surfaceVariant + "30",
                  marginVertical: 16,
                  borderRadius: 4,
                },
                code_inline: {
                  color: colors.primary,
                  fontFamily: "OpenSauceOne-Bold",
                  backgroundColor: colors.surfaceVariant + "50",
                  paddingHorizontal: 6,
                  paddingVertical: 2,
                  borderRadius: 4,
                },
                hr: {
                  backgroundColor: colors.outlineVariant,
                  height: 1,
                  marginVertical: 24,
                },
                fence: {
                  marginVertical: 16,
                  backgroundColor: "#1e1e1e",
                  borderRadius: 8,
                  padding: 16,
                  overflow: "hidden",
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
          backgroundColor="rgba(0,0,0,0.9)"
          presentationStyle="overFullScreen"
        />
      </>
    );
  }
);

const styles = StyleSheet.create({
  section: {
    marginVertical: 16,
    borderRadius: 24,
    overflow: "hidden",
    borderColor: "rgba(0,0,0,0.06)",
  },
  cardContent: {
    padding: 24,
  },
  imageContainer: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    overflow: "hidden",
    marginVertical: 16,
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  imageOverlay: {
    position: "absolute",
    right: 8,
    bottom: 8,
    backgroundColor: "rgba(0,0,0,0.4)",
    borderRadius: 20,
  },
  zoomIcon: {
    margin: 0,
  },
});
