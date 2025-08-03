import { useState } from "react";
import "./App.css";
import Login from "./pages/Login/Login";
import Ember from "./pages/Ember/Ember";

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [serverURL, setServerURL] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [currentQueue, setCurrentQueue] = useState([]);
  const [currentlyPlayingIndex, setCurrentlyPlayingIndex] = useState(0);

  return loggedIn ? (
    <Ember
      {...{
        setLoggedIn,
        serverURL,
        accessToken,
        currentQueue,
        setCurrentQueue,
        currentlyPlayingIndex,
        setCurrentlyPlayingIndex,
      }}
    />
  ) : (
    <Login
      {...{
        setLoggedIn,
        serverURL,
        setServerURL,
        accessToken,
        setAccessToken,
        setCurrentQueue,
      }}
    />
  );
}

export default App;
