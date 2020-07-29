import React, { useState } from "react";
import { toggleVideo, toggleAudio, localMediaStream } from "../webRTC";
import { Video } from "./MediaChatView";

export default function () {
  const [sendVideo, setUseVideo] = useState(true);
  const [sendAudio, setUseAudio] = useState(true);

  const onChangeVideo = (e) => {
    setUseVideo(e.target.checked);
    toggleVideo(sendVideo);
  };

  const onChangeAudio = (e) => {
    setUseAudio(e.target.checked);
    toggleAudio(sendAudio);
  };

  return (
    <div id="my-video">
      You:
      <Video srcObject={localMediaStream()} />
      <input
        type="checkbox"
        id="send-video"
        checked={sendVideo}
        onChange={onChangeVideo}
      />
      <label htmlFor="send-video">Video</label>
      <input
        type="checkbox"
        id="send-audio"
        checked={sendAudio}
        onChange={onChangeAudio}
      />
      )<label htmlFor="send-audio">Audio</label>
    </div>
  );
}
