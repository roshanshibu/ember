import { useState } from "react";
import "./Login.css";
import { getRandomPlaylist } from "../../lib/APIs";

export default function Login({ setLoggedIn }) {
  const [serverURL, setServerURL] = useState("");
  const [accessToken, setAccessToken] = useState("");

  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const connectToServer = () => {
    setIsLoading(true);
    setIsError(false);
    getRandomPlaylist(serverURL, accessToken)
      .then((response) => {
        console.log(response);
        if (response.error) {
          setErrorMessage(response.error);
          setIsError(true);
        } else {
          console.log("login successful");
          setLoggedIn(true);
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
