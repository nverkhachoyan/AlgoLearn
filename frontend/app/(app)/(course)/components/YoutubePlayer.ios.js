import React, { useCallback, useState } from "react";
import { Alert } from "react-native";
import YoutubePlayer from "react-native-youtube-iframe";

const NativeYoutubePlayer = ({ videoId }) => {
  const [videoPlaying, setVideoPlaying] = useState(false);

  const onStateChange = useCallback((state) => {
    if (state === "ended") {
      setVideoPlaying(false);
      Alert.alert("Video has finished playing!");
    }
  }, []);

  const togglePlaying = useCallback(() => {
    setVideoPlaying((prev) => !prev);
  }, []);

  return (
    <>
      <YoutubePlayer
        height={300}
        play={videoPlaying}
        videoId={videoId}
        onChangeState={onStateChange}
      />
    </>
  );
};

export default NativeYoutubePlayer;
