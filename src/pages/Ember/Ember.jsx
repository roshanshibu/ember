import "./Ember.css";
import Player from "../../views/Player/Player";

export default function Ember({ setLoggedIn, serverURL, accessToken }) {
  return (
    <main className="emberMainContainer">
      <Player
        {...{
          serverURL,
          accessToken,
        }}
      />
      <p>Ember Main App</p>
    </main>
  );
}
