import { useState } from "react";
import "./Login.css";
import { getRandomPlaylist } from "../../lib/APIs";
import { TOKEN_KEY, SERVER_URL_KEY } from "../../lib/constants";

export default function Login({
  setLoggedIn,
  serverURL,
  setServerURL,
  accessToken,
  setAccessToken,
  setCurrentQueue,
}) {
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const connectToServer = () => {
    setIsLoading(true);
    setIsError(false);
    getRandomPlaylist(serverURL, accessToken)
      .then((response) => {
        if (response.error) {
          setErrorMessage(response.error);
          setIsError(true);
          localStorage.clear(TOKEN_KEY);
          localStorage.clear(SERVER_URL_KEY);
        } else {
          console.log("login successful");
          setCurrentQueue(response.data["playlist"]);
          setLoggedIn(true);
          localStorage.setItem(TOKEN_KEY, accessToken);
          localStorage.setItem(SERVER_URL_KEY, serverURL);
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <main className="loginContainer">
      <p className="amberBranding">amber</p>
      <div className="credsContainer">
        <input
          type="text"
          className="credsInput"
          placeholder="Server URL"
          onChange={(e) => setServerURL(e.target.value)}
        />
        <input
          type="password"
          className="credsInput"
          placeholder="Access Token"
          onChange={(e) => setAccessToken(e.target.value)}
        />
        <button className="connectButton" onClick={connectToServer}>
          Connect to Server{" "}
          <img
            src="LoadingArcAnimated.svg"
            style={{ width: "15px", display: isLoading ? "" : "none" }}
          />
          <img
            src="ArrowTail.svg"
            style={{ width: "15px", display: isLoading ? "none" : "" }}
          />
        </button>
      </div>
      {isError && <p className="connectionError">{errorMessage}</p>}
    </main>
  );
}
