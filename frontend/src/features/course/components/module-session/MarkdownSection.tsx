import React, { memo } from "react";
import { Linking, StyleSheet } from "react-native";
import { Image } from "expo-image";
import Markdown from "react-native-markdown-display";
import { MarkdownContent } from "@/src/features/module/types/sections";
import { Card } from "react-native-paper";

interface MarkdownSectionProps {
  content: MarkdownContent;
  position: number;
  colors: any;
}

export const MarkdownSection = memo(
  ({ content, position, colors }: MarkdownSectionProps) => (
    <Card style={[styles.section, { backgroundColor: colors.surface }]}>
      <Card.Content>
        <Markdown
          key={position}
          rules={{
            code: () => null,
            image: (node) => (
              <Image
                key={node.key}
                source={{ uri: node.attributes.src }}
                style={[
                  styles.section,
                  {
                    width: "100%",
                    height: 200,
                    //@ts-ignore
                    contentFit: "contain",
                    color: colors.onSurface,
                  } as const,
                ]}
              />
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
  )
);

const styles = StyleSheet.create({
  section: {
    marginVertical: 10,
  },
});
