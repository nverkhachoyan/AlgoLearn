import React from "react";

const WebYoutubePlayer = ({ videoId }) => {
  return (
    <iframe
      width="100%"
      height="200"
      src={`https://www.youtube.com/embed/${videoId}`}
      frameBorder="0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
    ></iframe>
  );
};

export default WebYoutubePlayer;
