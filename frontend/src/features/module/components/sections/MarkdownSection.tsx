import React, { useState, useEffect, memo } from 'react';
import { Linking, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Image } from 'expo-image';
import Markdown from 'react-native-markdown-display';
import { MarkdownContent } from '@/src/features/module/types/sections';
import { Card } from '@/src/components/ui';
import { Feather } from '@expo/vector-icons';
import ImageView from 'react-native-image-viewing';
import { Colors } from '@/constants/Colors';
import CodeBlock from './CodeBlock';

interface MarkdownSectionProps {
  content: MarkdownContent;
  position: number;
  colors: Colors;
}

export const MarkdownSection = memo(({ content, position, colors }: MarkdownSectionProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [images, setImages] = useState<Array<{ uri: string }>>([]);

  useEffect(() => {
    const markdownContent = content.markdown;
    const imageUrlRegex = /!\[.*?\]\((.*?)\)/g;
    const matches = [...markdownContent.matchAll(imageUrlRegex)];
    const imageUrls = matches.map(match => ({ uri: match[1] }));
    setImages(imageUrls);
  }, [content.markdown]);

  return (
    <>
      <Card style={[styles.section, { backgroundColor: colors.background }]} elevation={0}>
        <View style={styles.cardContent}>
          <Markdown
            key={position}
            rules={{
              code_block: node => {
                return <CodeBlock key={node.key} code={node.content} colors={colors} />;
              },
              fence: node => {
                return <CodeBlock key={node.key} code={node.content} colors={colors} />;
              },
              image: node => (
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
                    <TouchableOpacity style={styles.zoomButton}>
                      <Feather name="zoom-in" size={20} color="#fff" />
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              ),
            }}
            style={{
              body: {
                fontSize: 16,
                fontFamily: 'OpenSauceOne-Regular',
                lineHeight: 24,
              },
              heading1: {
                fontSize: 24,
                fontFamily: 'OpenSauceOne-Bold',
              },
              heading2: {
                fontSize: 22,
                fontFamily: 'OpenSauceOne-Bold',
              },
              heading3: {
                fontSize: 20,
                fontFamily: 'OpenSauceOne-Bold',
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
                textDecorationLine: 'underline',
                fontWeight: '500',
              },
              blockquote: {
                borderLeftWidth: 4,
                borderLeftColor: colors.tertiary,
                paddingLeft: 16,
                paddingVertical: 12,
                backgroundColor: colors.surfaceVariant + '30',
                marginVertical: 16,
                borderRadius: 8,
              },
              code_inline: {
                color: colors.primary,
                fontFamily: 'OpenSauceOne-Bold',
                backgroundColor: colors.surfaceVariant + '50',
                paddingHorizontal: 6,
                paddingVertical: 2,
                borderRadius: 4,
              },
              hr: {
                backgroundColor: colors.outlineVariant,
                height: 1,
                marginVertical: 24,
              },
            }}
            onLinkPress={url => {
              Linking.openURL(url);
              return false;
            }}
          >
            {content.markdown}
          </Markdown>
        </View>
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
});
const styles = StyleSheet.create({
  section: {
    marginVertical: 16,
    borderRadius: 24,
    overflow: 'hidden',
    borderColor: 'rgba(0,0,0,0.06)',
  },
  cardContent: {
    padding: 24,
  },
  imageContainer: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    marginVertical: 16,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    right: 8,
    bottom: 8,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 20,
  },
  zoomButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
