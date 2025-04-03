import React, { memo } from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import YoutubePlayer from './YoutubePlayer';
import { VideoContent } from '@/src/features/module/types/sections';
import { Card, Text } from '@/src/components/ui';
import { Feather } from '@expo/vector-icons';

interface VideoSectionProps {
  content: VideoContent;
  colors: any;
}

export const VideoSection = memo(({ content, colors }: VideoSectionProps) => {
  // Extract YouTube video ID and potentially video title from URL parameters
  const videoId = content.url.split('v=')[1]?.split('&')[0] || '';

  return (
    <Card style={[styles.section, { backgroundColor: colors.background }]} elevation={0}>
      {/* Optional: Could extract title from URL or add to VideoContent type */}
      <View style={styles.videoContainer}>
        <View style={styles.playerWrapper}>
          <YoutubePlayer videoId={videoId} />
        </View>

        <View style={styles.videoControls}>
          <TouchableOpacity
            style={[styles.youtubeChip, { backgroundColor: colors.errorContainer }]}
          >
            <View style={styles.chipContent}>
              <Feather
                name="youtube"
                size={16}
                color={colors.onErrorContainer}
                style={styles.chipIcon}
              />
              <Text style={{ color: colors.onErrorContainer }}>YouTube</Text>
            </View>
          </TouchableOpacity>
        </View>

        <Text style={[styles.description, { color: colors.onSurfaceVariant }]} numberOfLines={2}>
          Learn more by watching this curated video explanation.
        </Text>
      </View>
    </Card>
  );
});

const styles = StyleSheet.create({
  section: {
    marginVertical: 16,
    borderRadius: 24,
    overflow: 'hidden',
    borderColor: 'rgba(0,0,0,0.06)',
  },
  videoContainer: {
    padding: 0,
  },
  playerWrapper: {
    height: 220,
    width: '100%',
    overflow: 'hidden',
  },
  videoControls: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  youtubeChip: {
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  chipContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chipIcon: {
    marginRight: 4,
  },
  description: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    fontSize: 14,
    opacity: 0.8,
  },
});
