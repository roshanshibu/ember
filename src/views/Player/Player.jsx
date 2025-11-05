import { useEffect, useRef, useState } from "react";
import "./Player.css";
import Hls from "hls.js";
import ColorThief from "colorthief";
import { getRandomPlaylist } from "../../lib/APIs";
import QueueItem from "../../components/QueueItem/QueueItem";
import EditSongMetadata from "../EditSongMetadata/EditSongMetadata";

export default function Player({
  serverURL,
  accessToken,
  isSmallPlayer,
  setIsSmallPlayer,
  currentQueue,
  setCurrentQueue,
  currentlyPlayingIndex,
  setCurrentlyPlayingIndex,
}) {
  const [albumArtSrc, setAlbumArtSrc] = useState(null);
  const [albumArtSrcChange, setAlbumArtSrcChange] = useState(false);
  const [bustAlbumArtCache, setBustAlbumArtCache] = useState(false);
  const [currentPlaybackTime, setCurrentPlaybackTime] = useState("0:00");
  const [currentPlaybackTimeValue, setCurrentPlaybackTimeValue] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isExtraControlsVisible, setIsExtraControlsVisible] = useState(false);
  const [isQueueVisible, setIsQueueVisible] = useState(false);
  const [isEditViewVisible, setIsEditViewVisible] = useState(false);

  const audioRef = useRef();
  const albumArtImgRef = useRef();
  const doubleTapLeftRef = useRef();
  const doubleTapRightRef = useRef();

  const getAlbumArt = (uuid) => {
    const albumArtSrc = `${serverURL}/Music/${uuid}/${uuid}.png`;
    const albumArtOptions = {
      headers: {
        Authorization: accessToken,
      },
      // cache: bustAlbumArtCache ? "no-store" : "default",
      cache: "no-store",
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
        console.error("failed to get album art!");
      })
      .finally(() => {
        if (bustAlbumArtCache) {
          setBustAlbumArtCache(false);
        }
      });
  };

  useEffect(() => {
    if (bustAlbumArtCache) {
      getAlbumArt(currentQueue[currentlyPlayingIndex]["UUID"]);
    }
  }, [bustAlbumArtCache]);

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
        console.error(err);
      });
    }

    getAlbumArt(uuid);
  }, [currentlyPlayingIndex, currentQueue]);

  useEffect(() => {
    const colorThief = new ColorThief();
    if (albumArtImgRef.current.complete) {
      let [r, g, b] = colorThief.getColor(albumArtImgRef.current);
      setPlayerBackgroundColor(r, g, b);
    }
  }, [albumArtSrcChange]);

  useEffect(() => {
    if ("mediaSession" in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: currentQueue[currentlyPlayingIndex]["Name"] || "⠀",
        artist: currentQueue[currentlyPlayingIndex]["Artists"] || "⠀",
        album: currentQueue[currentlyPlayingIndex]["Album"] || "⠀",
        artwork: [
          {
            src: albumArtSrc,
            type: "image/png",
          },
        ],
      });

      navigator.mediaSession.setActionHandler("play", () => {
        playMusic();
      });
      navigator.mediaSession.setActionHandler("pause", () => {
        pauseMusic();
      });
      navigator.mediaSession.setActionHandler("previoustrack", () => {
        previousSong();
      });
      navigator.mediaSession.setActionHandler("nexttrack", () => {
        nextSong();
      });
    }
  }, [currentlyPlayingIndex, albumArtSrc]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updatePositionState = () => {
      if (
        "mediaSession" in navigator &&
        "setPositionState" in navigator.mediaSession
      ) {
        if (audio.duration && !isNaN(audio.duration)) {
          navigator.mediaSession.setPositionState({
            duration: audio.duration,
            playbackRate: audio.playbackRate,
            position: audio.currentTime,
          });
        }
      }
    };
    audio.addEventListener("timeupdate", updatePositionState);
  }, []);

  const getNewRandomPlaylist = () => {
    getRandomPlaylist(serverURL, accessToken).then((response) => {
      if (response.error) {
        setLoggedIn(false);
      } else {
        setIsExtraControlsVisible(false);
        setCurrentQueue(response.data["playlist"]);
      }
    });
  };

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

  const handleAlbumArtDoubleClick = (event) => {
    if (isExtraControlsVisible) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const widthPercent = Math.round((x / rect.width) * 10000) / 100;

    if (widthPercent < 40) {
      doubleTapLeftRef.current.classList.remove("doubleTabOverlayAnimation");
      doubleTapLeftRef.current.offsetHeight;
      doubleTapLeftRef.current.classList.add("doubleTabOverlayAnimation");
      seekSong(-10);
    }
    if (widthPercent > 60) {
      doubleTapRightRef.current.classList.remove("doubleTabOverlayAnimation");
      doubleTapRightRef.current.offsetHeight;
      doubleTapRightRef.current.classList.add("doubleTabOverlayAnimation");
      seekSong(10);
    }
  };

  const seekSong = (time) => {
    audioRef.current.currentTime += time;
    audioRef.current.play();
    setIsPlaying(true);
  };

  const removeDoubleTapOverlayAnimations = () => {
    doubleTapLeftRef.current.classList.remove("doubleTabOverlayAnimation");
    doubleTapRightRef.current.classList.remove("doubleTabOverlayAnimation");
  };

  const minimizePlayer = () => {
    removeDoubleTapOverlayAnimations();
    setIsQueueVisible(false);
    setIsSmallPlayer(true);
  };

  const handleAlbumArtImgClick = (event) => {
    const rect = albumArtImgRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const widthPercent = Math.round((x / rect.width) * 10000) / 100;
    if (!isExtraControlsVisible && widthPercent >= 40 && widthPercent <= 60) {
      setIsExtraControlsVisible(true);
    }
    if (isExtraControlsVisible && widthPercent <= 100) {
      setIsExtraControlsVisible(false);
    }
  };

  const hideExtraControls = () => {
    setIsExtraControlsVisible(false);
  };

  const playSongInQueueWithIndex = (newPlayingIndex) => {
    pauseMusic();
    setCurrentlyPlayingIndex(newPlayingIndex);
    playMusic();
  };

  const updateSongMetadata = (
    newSongName,
    newArtistName,
    newAlbumName,
    newAlbumArtURL
  ) => {
    const uuid = currentQueue[currentlyPlayingIndex]["UUID"];
    const updateAPI = `${serverURL}/replaceMetadata?UUID=${uuid}&albumArtURL=${encodeURIComponent(
      newAlbumArtURL
    )}&songName=${encodeURIComponent(
      newSongName
    )}&artistsUnsafe=${encodeURIComponent(
      newArtistName
    )}&albumName=${encodeURIComponent(newAlbumName)}`;

    fetch(updateAPI, {
      method: "POST",
      headers: {
        Authorization: accessToken,
      },
    })
      .then((response) => {
        console.log(response);
        let updatedQueue = currentQueue;
        updatedQueue[currentlyPlayingIndex]["Name"] = newSongName;
        updatedQueue[currentlyPlayingIndex]["Artists"] = newArtistName;
        updatedQueue[currentlyPlayingIndex]["Album"] = newAlbumName;
        setCurrentQueue(updatedQueue);
        setBustAlbumArtCache(true);
        setIsEditViewVisible(false);
      })
      .catch((err) => console.error(err));
  };
  return (
    <article
      className={`PlayerContainer ${isSmallPlayer && "smallPlayer"}`}
      onClick={() => {
        if (isSmallPlayer) setIsSmallPlayer(!isSmallPlayer);
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
        autoPlay={isPlaying}
        onEnded={nextSong}
      ></audio>
      <div className="mobileWidthControl">
        <div className="topControlsContainer">
          <div className="controlsContainer" onClick={minimizePlayer}>
            <img src="Arrow.svg" />
            Back
          </div>
          <div
            className="controlsContainer"
            onClick={() => {
              setIsQueueVisible((current) => !current);
              setIsEditViewVisible(false);
            }}
          >
            <img src={isQueueVisible ? "Close.svg" : "Queue.svg"} />
            Queue
          </div>
        </div>
        <div
          className={`utilityViewContainer ${
            isEditViewVisible && "utilityViewContainerVisible"
          }`}
        >
          <EditSongMetadata
            hideEditMetadataContainer={() => {
              setIsEditViewVisible(false);
            }}
            uuid={currentQueue[currentlyPlayingIndex]["UUID"]}
            currentSongName={currentQueue[currentlyPlayingIndex]["Name"]}
            currentArtists={currentQueue[currentlyPlayingIndex]["Artists"]}
            currentAlbum={currentQueue[currentlyPlayingIndex]["Album"]}
            currentAlbumArtObject={albumArtSrc}
            serverURL={serverURL}
            accessToken={accessToken}
            updateSongMetadata={updateSongMetadata}
          />
        </div>
        <div
          className={`utilityViewContainer ${
            isQueueVisible && "utilityViewContainerVisible"
          }`}
        >
          {currentQueue.map((item, i) => (
            <QueueItem
              key={i}
              songName={item.Name}
              artistName={item.Artists}
              UUID={item.UUID}
              isPlaying={currentlyPlayingIndex == i}
              serverURL={serverURL}
              accessToken={accessToken}
              handleClick={() => {
                playSongInQueueWithIndex(i);
              }}
            />
          ))}
        </div>
        <div
          className="albumArtContainer"
          onLoad={() => setAlbumArtSrcChange(!albumArtSrcChange)}
          onDoubleClick={handleAlbumArtDoubleClick}
          onClick={handleAlbumArtImgClick}
          onBlur={hideExtraControls}
          tabIndex={1}
        >
          <img
            className={`albumArt ${
              isExtraControlsVisible ? "tiltAlbumArt" : ""
            }`}
            src={albumArtSrc || "Music.svg"}
            ref={albumArtImgRef}
          />
          <div
            className={`extraControlsContainer ${
              isExtraControlsVisible ? "visibleControls" : ""
            }`}
          >
            <img
              src="Shuffle.svg"
              onClick={() => {
                getNewRandomPlaylist();
              }}
            />
            <img
              src="Edit.svg"
              onClick={() => {
                setIsExtraControlsVisible(false);
                setIsEditViewVisible((current) => !current);
              }}
            />
          </div>
          <div
            className="doubleTapOverlay leftDoubleTapOverlay"
            ref={doubleTapLeftRef}
          >
            <img src="WavyArrow.svg" />
            <p>- 10s</p>
          </div>
          <div
            className="doubleTapOverlay rightDoubleTapOverlay"
            ref={doubleTapRightRef}
          >
            <img src="WavyArrow.svg" />
            <p>+ 10s</p>
          </div>
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
          <div onClick={previousSong}>
            <img src="Previous.svg" />
          </div>
          {isPlaying ? (
            <div
              className="miniPlayerControlButton"
              onClick={(e) => {
                pauseMusic();
                e.stopPropagation();
              }}
            >
              <img src="Pause.svg" />
            </div>
          ) : (
            <div
              className="miniPlayerControlButton"
              onClick={(e) => {
                playMusic();
                e.stopPropagation();
              }}
            >
              <img src="Play.svg" />
            </div>
          )}
          <div
            onClick={(e) => {
              nextSong();
              e.stopPropagation();
            }}
            className="miniPlayerControlButton"
          >
            <img src="Next.svg" />
          </div>
        </div>
      </div>
    </article>
  );
}
