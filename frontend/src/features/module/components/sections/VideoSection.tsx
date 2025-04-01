import React, { memo } from "react";
import { StyleSheet, View } from "react-native";
import YoutubePlayer from "./YoutubePlayer";
import { VideoContent } from "@/src/features/module/types/sections";
import { Card, Text, Chip } from "react-native-paper";

interface VideoSectionProps {
  content: VideoContent;
  colors: any;
}

export const VideoSection = memo(({ content, colors }: VideoSectionProps) => {
  // Extract YouTube video ID and potentially video title from URL parameters
  const videoId = content.url.split("v=")[1]?.split("&")[0] || "";

  return (
    <Card
      style={[styles.section, { backgroundColor: colors.background }]}
      elevation={0}
      mode="elevated"
    >
      {/* Optional: Could extract title from URL or add to VideoContent type */}
      <View style={styles.videoContainer}>
        <View style={styles.playerWrapper}>
          <YoutubePlayer videoId={videoId} />
        </View>

        <View style={styles.videoControls}>
          <Chip
            icon="youtube"
            style={[
              styles.youtubeChip,
              { backgroundColor: colors.errorContainer },
            ]}
            textStyle={{ color: colors.onErrorContainer }}
          >
            YouTube
          </Chip>
        </View>

        <Text
          style={[styles.description, { color: colors.onSurfaceVariant }]}
          numberOfLines={2}
        >
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
    overflow: "hidden",
    borderColor: "rgba(0,0,0,0.06)",
  },
  videoContainer: {
    padding: 0,
  },
  playerWrapper: {
    height: 220,
    width: "100%",
    overflow: "hidden",
  },
  videoControls: {
    padding: 16,
    flexDirection: "row",
    justifyContent: "flex-start",
  },
  youtubeChip: {
    borderRadius: 16,
  },
  description: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    fontSize: 14,
    opacity: 0.8,
  },
});
