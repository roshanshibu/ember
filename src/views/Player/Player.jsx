import { useEffect, useRef } from "react";
import "./Player.css";
import Hls from "hls.js";

export default function Player({ serverURL, accessToken }) {
  const audioRef = useRef();

  useEffect(() => {
    const url = `${serverURL}/Music/bfacbc0a/bfacbc0a.m3u8`;
    var config = {
      xhrSetup: function (xhr, url) {
        xhr.setRequestHeader("Authorization", accessToken);
      },
      maxBufferLength: 300,
      backBufferLength: 300,
      lowLatencyMode: false,
      debug: true,
    };
    const hls = new Hls(config);

    if (Hls.isSupported()) {
      hls.log = true;
      hls.loadSource(url);
      hls.attachMedia(audioRef.current);
      hls.on(Hls.Events.ERROR, (err) => {
        console.log(err);
      });
    } else {
      console.log("load");
    }
  }, []);
  return (
    <article className="PlayerContainer">
      <p>Player here</p>
      <audio
        preload="true"
        id="AudioPlayer"
        ref={audioRef}
        controls
        crossOrigin="anonymous"
      ></audio>
    </article>
  );
}
