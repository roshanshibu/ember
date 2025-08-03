import { useEffect, useRef, useState } from "react";
import "./Player.css";
import Hls from "hls.js";

export default function Player({
  serverURL,
  accessToken,
  isSmallPlayer,
  setIsSmallPlayer,
  currentQueue,
  currentlyPlayingIndex,
  setCurrentlyPlayingIndex,
}) {
  const audioRef = useRef();
  const [albumArtBlob, setAlbumArtBlob] = useState(null);

  useEffect(() => {
    const uuid = currentQueue[currentlyPlayingIndex]["UUID"];
    const url = `${serverURL}/Music/${uuid}/${uuid}.m3u8`;
    var config = {
      xhrSetup: function (xhr) {
        xhr.setRequestHeader("Authorization", accessToken);
      },
      maxBufferLength: 300,
      backBufferLength: 300,
      lowLatencyMode: false,
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

    const albumArtSrc = `${serverURL}/Music/${uuid}/${uuid}.png`;
    const albumArtOptions = {
      headers: {
        Authorization: accessToken,
      },
    };
    fetch(albumArtSrc, albumArtOptions)
      .then((res) => res.blob())
      .then((blob) => {
        objectURL = URL.createObjectURL(blob);
        setAlbumArtBlob(objectURL);
        console.log(objectURL);
      })
      .catch(() => {
        setAlbumArtBlob(null);
      });
  }, [currentlyPlayingIndex]);

  const nextSong = () => {
    if (currentlyPlayingIndex == currentQueue.length - 1) {
      setCurrentlyPlayingIndex(0);
    } else {
      setCurrentlyPlayingIndex(currentlyPlayingIndex + 1);
    }
  };

  const previousSong = () => {
    if (currentlyPlayingIndex == 0) {
      setCurrentlyPlayingIndex(currentQueue.length - 1);
    } else {
      setCurrentlyPlayingIndex(currentlyPlayingIndex - 1);
    }
  };

  return (
    <article
      className={`PlayerContainer ${isSmallPlayer && "smallPlayer"}`}
      onClick={() => {
        if (isSmallPlayer) {
          setIsSmallPlayer(false);
        }
      }}
    >
      <audio
        preload="true"
        id="AudioPlayer"
        ref={audioRef}
        controls
        crossOrigin="anonymous"
        style={{ display: "none" }}
      ></audio>
      <div className="mobileWidthControl">
        <div className="topControlsContainer">
          <div
            className="controlsContainer"
            onClick={() => {
              setIsSmallPlayer(true);
            }}
          >
            <img src="Arrow.svg" />
            Back
          </div>
          <div className="controlsContainer">
            <img src="Queue.svg" />
            Queue
          </div>
        </div>
        <div
          className="albumArt"
          style={{ background: `src(${albumArtBlob})` }}
        ></div>
        <p className="songName">
          {currentQueue[currentlyPlayingIndex]["Name"]}
        </p>

        <section>
          <div className="artistAlbumContainer">
            <p>{currentQueue[currentlyPlayingIndex]["Artists"] || "-"}</p>
            <p>{currentQueue[currentlyPlayingIndex]["Album"] || "-"}</p>
          </div>
          <input
            type="range"
            min="0"
            max={currentQueue[currentlyPlayingIndex]["Duration"] || 0}
            className="timeline"
          ></input>
          <div className="elapsedTimeContainer">
            <p>0:11</p>
            <p>3:12</p>
          </div>
        </section>

        <div className="playbackControlsContainer">
          <div onClick={previousSong}>
            <img src="Previous.svg" />
          </div>
          <div>
            <img src="Play.svg" />
          </div>
          <div onClick={nextSong}>
            <img src="Next.svg" />
          </div>
        </div>
      </div>
    </article>
  );
}
