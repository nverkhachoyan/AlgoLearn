import React, { useState } from "react";
import { StyleSheet, TouchableOpacity, Text } from "react-native";
import { Image } from "expo-image";
import Markdown from "react-native-markdown-display";
import { ImageContent } from "@/src/features/module/types/sections";
import { Card } from "react-native-paper";

import ImageView from "react-native-image-viewing";

interface ImageSectionProps {
  content: ImageContent;
  position: number;
  colors: any;
}

export const ImageSection = ({
  content,
  position,
  colors,
}: ImageSectionProps) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <>
      <Card style={[styles.section, { backgroundColor: colors.surface }]}>
        <Card.Content>
          <TouchableOpacity
            onPress={() => setIsVisible(true)}
            style={styles.imageContainer}
          >
            <Image source={{ uri: content.url }} style={styles.image} />
            {content.footer && (
              <Text style={styles.caption}>{content.footer}</Text>
            )}
          </TouchableOpacity>
        </Card.Content>
      </Card>

      <ImageView
        images={[{ uri: content.url }]}
        imageIndex={0}
        visible={isVisible}
        onRequestClose={() => setIsVisible(false)}
      />
    </>
  );
};

const styles = StyleSheet.create({
  section: {
    marginVertical: 10,
  },
  imageContainer: {
    width: "100%",
  },
  image: {
    width: "100%",
    height: 200,
    borderRadius: 8,
  },
  caption: {
    marginTop: 8,
    textAlign: "center",
    fontSize: 14,
    color: "#666",
  },
});
