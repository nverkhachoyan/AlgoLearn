import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Image } from 'expo-image';
import { ImageContent } from '@/src/features/module/types/sections';
import { Card, Text } from '@/src/components/ui';
import { Feather } from '@expo/vector-icons';
import ImageView from 'react-native-image-viewing';

interface ImageSectionProps {
  content: ImageContent;
  position: number;
  colors: any;
}

export const ImageSection = ({ content, position, colors }: ImageSectionProps) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <>
      <Card style={[styles.section, { backgroundColor: colors.background }]} elevation={0}>
        <View style={styles.cardContent}>
          {content.headline && (
            <Text style={[styles.headline, { color: colors.onBackground }]} variant="title">
              {content.headline}
            </Text>
          )}

          <TouchableOpacity onPress={() => setIsVisible(true)} style={styles.imageContainer}>
            <Image
              source={{ uri: content.url }}
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

          {content.footer && (
            <View style={styles.captionContainer}>
              <Text style={[styles.caption, { color: colors.onSurfaceVariant }]}>
                {content.footer}
              </Text>
              {content.source && (
                <Text style={[styles.source, { color: colors.outline }]}>
                  Source: {content.source}
                </Text>
              )}
            </View>
          )}
        </View>
      </Card>

      <ImageView
        images={[{ uri: content.url }]}
        imageIndex={0}
        visible={isVisible}
        onRequestClose={() => setIsVisible(false)}
        backgroundColor="rgba(0,0,0,0.9)"
        presentationStyle="overFullScreen"
      />
    </>
  );
};

const styles = StyleSheet.create({
  section: {
    marginVertical: 16,
    borderRadius: 24,
    overflow: 'hidden',
    borderColor: 'rgba(0,0,0,0.06)',
  },
  cardContent: {
    padding: 20,
  },
  headline: {
    marginBottom: 16,
    fontWeight: '600',
  },
  imageContainer: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    aspectRatio: 16 / 9,
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
  captionContainer: {
    marginTop: 16,
    paddingHorizontal: 8,
  },
  caption: {
    textAlign: 'center',
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '500',
  },
  source: {
    textAlign: 'center',
    fontSize: 13,
    marginTop: 8,
    fontStyle: 'italic',
  },
});
