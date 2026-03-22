import { useEffect, useState } from "react";
import "./App.css";
import Login from "./pages/Login/Login";
import Ember from "./pages/Ember/Ember";
import { TOKEN_KEY, SERVER_URL_KEY } from "./lib/constants";

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [serverURL, setServerURL] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [currentQueue, setCurrentQueue] = useState([]);
  const [currentlyPlayingIndex, setCurrentlyPlayingIndex] = useState(0);

  useEffect(() => {
    const key = localStorage.getItem(TOKEN_KEY);
    if (key) {
      const cachedServerURL = localStorage.getItem(SERVER_URL_KEY);
      setLoggedIn(true);
      setAccessToken(key);
      setServerURL(cachedServerURL);
    }
  }, []);

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
