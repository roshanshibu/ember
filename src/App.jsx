import { useState } from "react";
import "./App.css";
import Login from "./pages/Login/Login";
import Ember from "./pages/Ember/Ember";

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [serverURL, setServerURL] = useState("");
  const [accessToken, setAccessToken] = useState("");

  return loggedIn ? (
    <Ember
      {...{
        setLoggedIn,
        serverURL,
        accessToken,
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
      }}
    />
  );
}

export default App;
