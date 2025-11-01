import { useEffect, useState } from "react";
import "./Search.css";
import QueueItem from "../QueueItem/QueueItem";

export function SearchResults({
  serverURL,
  accessToken,
  results,
  setCurrentQueue,
  setCurrentlyPlayingIndex,
}) {
  return (
    <div className="searchResultsContainer">
      {results.map((r, i) => (
        <QueueItem
          songName={r.Name}
          artistName={r.Artists}
          UUID={r.UUID}
          isPlaying={false}
          serverURL={serverURL}
          accessToken={accessToken}
          handleClick={() => {
            setCurrentQueue(results);
            setCurrentlyPlayingIndex(i);
          }}
        />
      ))}
      {results && results.length == 0 && (
        <p className="noHitsLabel">No results</p>
      )}
    </div>
  );
}

export default function Search({
  serverURL,
  accessToken,
  searchTerm,
  setSearchTerm,
  setSearchResults,
}) {
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const searchUrl = `${serverURL}/search?term=${searchTerm}`;
    const searchOptions = {
      headers: {
        Authorization: accessToken,
      },
    };
    if (searchTerm.length > 3) {
      fetch(searchUrl, searchOptions)
        .then((res) => {
          setIsLoading(true);
          res
            .json()
            .then((data) => setSearchResults(data.results))
            .catch((e) => {
              console.error(`search failed with error [${e}]`);
            });
        })
        .finally(() => setIsLoading(false));
    }
  }, [searchTerm]);

  return (
    <div className="searchInput">
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search"
      ></input>
      <img src={isLoading ? "LoadingArcAnimated.svg" : "Search.svg"} />
    </div>
  );
}
