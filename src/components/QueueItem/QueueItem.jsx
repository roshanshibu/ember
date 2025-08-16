import { useEffect, useState } from "react";
import "./QueueItem.css";

export default function QueueItem({
  songName,
  artistName,
  UUID,
  isPlaying,
  serverURL,
  accessToken,
  handleClick,
}) {
  const [albumArtSrc, setAlbumArtSrc] = useState(null);

  useEffect(() => {
    const albumArtSrc = `${serverURL}/Music/${UUID}/${UUID}.png`;
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
        console.error("failed to get album art!");
      });
  }, [UUID]);

  return (
    <div className="queueItemContainer" onClick={handleClick}>
      <div className="albumArtThumbnailContainer">
        <img className="albumArtThumbnail" src={albumArtSrc || "Music.svg"} />
      </div>
      <div className="queueItemTextContainer">
        <p className={isPlaying && "currentlyPlayingSongName"}>{songName}</p>
        <p>{artistName || "-"}</p>
      </div>
    </div>
  );
}
