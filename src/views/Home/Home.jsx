import { useState } from "react";
import "./Home.css";
import Search, { SearchResults } from "../../components/Search/Search";
export default function Home({
  serverURL,
  accessToken,
  setCurrentQueue,
  setCurrentlyPlayingIndex,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  return (
    <article className="EmberHomeContainer">
      <Search
        {...{
          serverURL,
          accessToken,
          searchTerm,
          setSearchTerm,
          setSearchResults,
        }}
      />
      {searchTerm.length > 3 ? (
        <SearchResults
          serverURL={serverURL}
          accessToken={accessToken}
          results={searchResults}
          setCurrentQueue={setCurrentQueue}
          setCurrentlyPlayingIndex={setCurrentlyPlayingIndex}
        />
      ) : (
        <></>
      )}
    </article>
  );
}
