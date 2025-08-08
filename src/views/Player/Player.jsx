import { useEffect, useRef, useState } from "react";
import "./Player.css";
import Hls from "hls.js";
import ColorThief from "colorthief";

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
  const [albumArtSrcChange, setAlbumArtSrcChange] = useState(false);
  const [currentPlaybackTime, setCurrentPlaybackTime] = useState("0:00");
  const [currentPlaybackTimeValue, setCurrentPlaybackTimeValue] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAutoplayEnabled, SetAutoPlay] = useState(false);

  const audioRef = useRef();
  const albumArtImgRef = useRef();
  const albumArtContainerRef = useRef();

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

  useEffect(() => {
    console.log("album art changed");
    const colorThief = new ColorThief();
    if (albumArtImgRef.current.complete) {
      console.log("image load completed");

      let [r, g, b] = colorThief.getColor(albumArtImgRef.current);
      setPlayerBackgroundColor(r, g, b);
      albumArtImgRef.current.style.opacity = 1;
    }
    console.log(albumArtImgRef.current);
  }, [albumArtSrcChange]);

  const setPlayerBackgroundColor = (r, g, b) => {
    [r, g, b] = balanceBrightness(r, g, b);
    document.documentElement.style.setProperty(
      "--current-song-color",
      `rgb(${r}, ${g}, ${b})`
    );
  };

  const balanceBrightness = (
    r,
    g,
    b,
    minBrightness = 40,
    maxBrightness = 50
  ) => {
    const brightness = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    let scale = 1;
    if (brightness < minBrightness) {
      scale = minBrightness / brightness;
    } else if (brightness > maxBrightness) {
      scale = maxBrightness / brightness;
    }
    const newR = Math.min(255, Math.max(0, r * scale));
    const newG = Math.min(255, Math.max(0, g * scale));
    const newB = Math.min(255, Math.max(0, b * scale));

    return [Math.round(newR), Math.round(newG), Math.round(newB)];
  };

  const changeSong = (isNext) => {
    const newIndex = currentlyPlayingIndex + (isNext ? 1 : -1);
    if (newIndex >= currentQueue.length) {
      newIndex = 0;
    }
    if (newIndex == -1) {
      newIndex = currentQueue.length - 1;
    }
    setCurrentlyPlayingIndex(newIndex);
    albumArtContainerRef.current.style.background = `url(${albumArtImgRef.current.src}),  var(--current-song-color)`;
    albumArtImgRef.current.style.opacity = 0;

    if (isNext) {
      SetAutoPlay(true);
      playMusic();
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
        onEnded={() => changeSong(true)}
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
          className="albumArtContainer"
          onLoad={() => setAlbumArtSrcChange(!albumArtSrcChange)}
          ref={albumArtContainerRef}
        >
          <img
            className="albumArt"
            src={albumArtSrc || "Music.svg"}
            ref={albumArtImgRef}
          />
        </div>
        <p className="songName">
          {currentQueue[currentlyPlayingIndex]["Name"]}
        </p>

        <section>
          <div className="artistAlbumContainer">
            <p>{currentQueue[currentlyPlayingIndex]["Artists"] || "⠀"}</p>
            <p>{currentQueue[currentlyPlayingIndex]["Album"] || "⠀"}</p>
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
          <div onClick={() => changeSong(false)}>
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
          <div onClick={() => changeSong(true)}>
            <img src="Next.svg" />
          </div>
        </div>
      </div>
    </article>
  );
}
