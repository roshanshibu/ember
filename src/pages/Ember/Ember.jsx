import "./Ember.css";
import Player from "../../views/Player/Player";
import { useEffect, useState } from "react";
import { getRandomPlaylist } from "../../lib/APIs";
import Home from "../../views/Home/Home";

export default function Ember({
  setLoggedIn,
  serverURL,
  accessToken,
  currentQueue,
  setCurrentQueue,
  currentlyPlayingIndex,
  setCurrentlyPlayingIndex,
}) {
  const [isSmallPlayer, setIsSmallPlayer] = useState(true);

  useEffect(() => {
    if (currentQueue.length == 0) {
      getRandomPlaylist(serverURL, accessToken).then((response) => {
        if (response.error) {
          setLoggedIn(false);
        } else {
          setCurrentlyPlayingIndex(0);
          setCurrentQueue(response.data["playlist"]);
        }
      });
    }
  }, []);

  return (
    <main className="emberMainContainer">
      <Player
        {...{
          serverURL,
          accessToken,
          isSmallPlayer,
          setIsSmallPlayer,
          currentQueue,
          setCurrentQueue,
          currentlyPlayingIndex,
          setCurrentlyPlayingIndex,
        }}
      />
      <Home
        {...{
          serverURL,
          accessToken,
          setCurrentQueue,
          setCurrentlyPlayingIndex,
        }}
      />
    </main>
  );
}
