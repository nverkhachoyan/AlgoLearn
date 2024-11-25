import React, { memo } from "react";
import { StyleSheet, View } from "react-native";
import YoutubePlayer from "./YoutubePlayer";
import { VideoContent } from "@/src/features/module/types/sections";

import { Card } from "react-native-paper";
interface VideoSectionProps {
  content: VideoContent;
  colors: any;
}

export const VideoSection = memo(({ content, colors }: VideoSectionProps) => (
  <Card style={[styles.section, { backgroundColor: colors.surface }]}>
    <Card.Title title="Video title" />
    <Card.Content>
      <View
        style={[
          {
            height: 199,
            marginVertical: 0,
            borderRadius: 5,
            overflow: "hidden",
          },
        ]}
      >
        <YoutubePlayer videoId={content.url.split("v=")[1]} />
      </View>
    </Card.Content>
  </Card>
));

const styles = StyleSheet.create({
  section: {
    marginVertical: 10,
  },
});
