import "./Ember.css";
import Player from "../../views/Player/Player";
import { useState } from "react";

export default function Ember({ setLoggedIn, serverURL, accessToken }) {
  const [isSmallPlayer, setIsSmallPlayer] = useState(true);
  return (
    <main className="emberMainContainer">
      <Player
        {...{
          serverURL,
          accessToken,
          isSmallPlayer,
          setIsSmallPlayer,
        }}
      />
      <p>Ember Main App</p>
    </main>
  );
}
