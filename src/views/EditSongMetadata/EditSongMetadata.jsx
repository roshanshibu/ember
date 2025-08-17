import { useEffect, useRef, useState } from "react";
import "./EditSongMetadata.css";
export default function EditSongMetadata({
  hideEditMetadataContainer,
  uuid,
  currentSongName,
  currentArtists,
  currentAlbum,
  currentAlbumArtObject,
  serverURL,
  accessToken,
}) {
  const [isAutoFetchLoading, setIsAutoFetchLoading] = useState(false);
  const [isAutoFetchCompleted, setIsAutoFetchCompleted] = useState(false);
  const [autoFetchResults, setAutoFetchResults] = useState([]);
  const [autoFetchOptionIndex, setAutoFetchOptionIndex] = useState(0);

  const [editSongName, setEditSongName] = useState("");
  const [editArtists, setEditArtists] = useState("");
  const [editAlbum, setEditAlbum] = useState("");
  const [editAlbumArtURL, setEditAlbumArtURL] = useState("");

  const [editAlbumArtObject, setEditAlbumArtObject] = useState(null);
  const [isNewAlbumArtLoading, setIsNewAlbumArtLoading] = useState(false);

  useEffect(() => {
    console.log("uuid changed");
    setIsAutoFetchCompleted(false);
    setEditSongName(currentSongName);
    setEditArtists(currentArtists);
    setEditAlbum(currentAlbum);
    setEditAlbumArtURL("-");
    setEditAlbumArtObject(currentAlbumArtObject);
  }, [uuid, currentAlbumArtObject]);

  const getFreshMetadataFromServer = () => {
    const url = `${serverURL}/getMetadata?UUID=${uuid}&fetchAll=1`;
    const urlOptions = {
      headers: {
        Authorization: accessToken,
      },
    };
    setIsAutoFetchLoading(true);
    fetch(url, urlOptions)
      .then((res) => {
        if (res.status != 200) throw new Error("Could not get metadata");
        return res.json();
      })
      .then((data) => {
        console.log(data);
        setAutoFetchResults(data);
        setEditSongName(data[0]["song"]);
        setEditArtists(data[0]["artists"].join(", "));
        setEditAlbum(data[0]["albumName"]);
        setEditAlbumArtURL(data[0]["albumArtURL"]);
        getNewAlbumArtSrc(data[0]["albumArtURL"]);
      })
      .catch(() => {
        setAutoFetchResults(null);
      })
      .finally(() => {
        setAutoFetchOptionIndex(0);
        setIsAutoFetchCompleted(true);
        setIsAutoFetchLoading(false);
      });
  };

  const getNewAlbumArtSrc = (newAlbumArtUrl) => {
    if (newAlbumArtUrl == "") {
      setEditAlbumArtObject(currentAlbumArtObject);
    }
    if (!newAlbumArtUrl) return;

    setIsNewAlbumArtLoading(true);
    fetch(newAlbumArtUrl)
      .then((res) => res.blob())
      .then((blob) => {
        const objectUrl = URL.createObjectURL(blob);
        setEditAlbumArtObject(objectUrl);
        return () => URL.revokeObjectURL(objectUrl);
      })
      .catch(() => {
        setEditAlbumArtObject(null);
        console.error("failed to get new album art!");
      })
      .finally(() => {
        setIsNewAlbumArtLoading(false);
      });
  };

  const getAnotherFetchResult = (increment = true) => {
    let nextIndex = autoFetchOptionIndex + (increment ? 1 : -1);
    if (nextIndex < 0) {
      nextIndex = autoFetchResults.length - 1;
    }
    if (nextIndex >= autoFetchResults.length) {
      nextIndex = 0;
    }
    setAutoFetchOptionIndex(nextIndex);
  };

  useEffect(() => {
    if (autoFetchResults && autoFetchResults[autoFetchOptionIndex]) {
      setEditSongName(autoFetchResults[autoFetchOptionIndex]["song"]);
      setEditArtists(
        autoFetchResults[autoFetchOptionIndex]["artists"].join(", ")
      );
      setEditAlbum(autoFetchResults[autoFetchOptionIndex]["albumName"]);
      setEditAlbumArtURL(autoFetchResults[autoFetchOptionIndex]["albumArtURL"]);
      getNewAlbumArtSrc(autoFetchResults[autoFetchOptionIndex]["albumArtURL"]);
    }
  }, [autoFetchOptionIndex]);

  return (
    <section className="editMetadataContainer">
      <header
        className="editMetadataHeader"
        onClick={hideEditMetadataContainer}
      >
        <p>Edit Song Metadata</p>
        <img src="Arrow.svg" />
      </header>
      <div className="albumArtImgViewer">
        {isNewAlbumArtLoading && (
          <img
            src="LoadingArcAnimated.svg"
            className="albumArtLoadingSpinner"
          />
        )}
        <img src={editAlbumArtObject || "Music.svg"} />
      </div>

      <div className="autoFetchContainer">
        {isAutoFetchCompleted ? (
          <p
            className={`autoFetchStatusText ${
              !autoFetchResults && "autoFetchStatusFail"
            }`}
          >
            Auto fetch {autoFetchResults ? "complete" : "failed!"}
          </p>
        ) : (
          <p
            onClick={() => {
              getFreshMetadataFromServer();
            }}
            className={isAutoFetchLoading && "autoFetchLoading"}
          >
            Get Metadata
          </p>
        )}
        {isAutoFetchCompleted &&
          autoFetchResults &&
          autoFetchResults.length > 1 && (
            <>
              <img
                src="Arrow.svg"
                onClick={() => getAnotherFetchResult(false)}
              />
              <img
                src="Arrow.svg"
                onClick={() => getAnotherFetchResult(true)}
              />
            </>
          )}
      </div>
      <input
        type="text"
        placeholder="Album art URL"
        value={editAlbumArtURL || ""}
        onChange={(e) => {
          setEditAlbumArtURL(e.target.value);
          getNewAlbumArtSrc(e.target.value);
        }}
      />
      <input
        type="text"
        placeholder="Song name"
        value={editSongName}
        onChange={(e) => {
          setEditSongName(e.target.value);
        }}
      />
      <input
        type="text"
        placeholder="Artists"
        value={editArtists || ""}
        onChange={(e) => {
          setEditArtists(e.target.value);
        }}
      />
      <input
        type="text"
        placeholder="Album"
        value={editAlbum || ""}
        onChange={(e) => {
          setEditAlbum(e.target.value);
        }}
      />
    </section>
  );
}
