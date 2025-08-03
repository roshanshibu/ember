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
  const [albumArtSrc, setAlbumArtSrc] = useState(null);
  const [currentPlaybackTime, setCurrentPlaybackTime] = useState("0:00");
  const [currentPlaybackTimeValue, setCurrentPlaybackTimeValue] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAutoplayEnabled, SetAutoPlay] = useState(false);

  const audioRef = useRef();

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
        const objectUrl = URL.createObjectURL(blob);
        setAlbumArtSrc(objectUrl);
        return () => URL.revokeObjectURL(objectUrl);
      })
      .catch(() => {
        setAlbumArtSrc(null);
        console.log("failed to get album art!");
      });
  }, [currentlyPlayingIndex]);

  const nextSong = () => {
    if (currentlyPlayingIndex == currentQueue.length - 1) {
      setCurrentlyPlayingIndex(0);
    } else {
      setCurrentlyPlayingIndex(currentlyPlayingIndex + 1);
    }
    SetAutoPlay(true);
    playMusic();
  };

  const previousSong = () => {
    if (currentlyPlayingIndex == 0) {
      setCurrentlyPlayingIndex(currentQueue.length - 1);
    } else {
      setCurrentlyPlayingIndex(currentlyPlayingIndex - 1);
    }
  };

  const pauseMusic = () => {
    setIsPlaying(false);
    audioRef.current.pause();
  };
  const playMusic = () => {
    setIsPlaying(true);
    audioRef.current.play();
  };

  const getMinutesAndSeconds = (time) => {
    let minutes = Math.floor(time / 60);
    let seconds = Math.floor(time % 60)
      .toString()
      .padStart(2, "0");
    return `${minutes}:${seconds}`;
  };
  const onMusicTimeUpdate = () => {
    let currentTime = audioRef.current.currentTime;
    setCurrentPlaybackTime(getMinutesAndSeconds(currentTime));
    setCurrentPlaybackTimeValue(currentTime);
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
        onTimeUpdate={onMusicTimeUpdate}
        autoPlay={isAutoplayEnabled}
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
        <img className="albumArt" src={albumArtSrc || "Music.svg"} />
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
            value={currentPlaybackTimeValue}
            onChange={(e) => {
              audioRef.current.currentTime = e.target.value;
            }}
            className="timeline"
          ></input>
          <div className="elapsedTimeContainer">
            <p>{currentPlaybackTime}</p>
            <p>
              {getMinutesAndSeconds(
                currentQueue[currentlyPlayingIndex]["Duration"]
              )}
            </p>
          </div>
        </section>

        <div className="playbackControlsContainer">
          <div onClick={previousSong}>
            <img src="Previous.svg" />
          </div>
          {isPlaying ? (
            <div onClick={pauseMusic}>
              <img src="Pause.svg" />
            </div>
          ) : (
            <div onClick={playMusic}>
              <img src="Play.svg" />
            </div>
          )}
          <div onClick={nextSong}>
            <img src="Next.svg" />
          </div>
        </div>
      </div>
    </article>
  );
}
