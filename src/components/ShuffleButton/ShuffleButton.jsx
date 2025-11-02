import { getRandomPlaylist } from "../../lib/APIs";
import "./ShuffleButton.css";

export default function ShuffleButton({
  serverURL,
  accessToken,
  setCurrentQueue,
  setCurrentlyPlayingIndex,
}) {
  const getNewRandomPlaylist = () => {
    getRandomPlaylist(serverURL, accessToken).then((response) => {
      setCurrentQueue(response.data["playlist"]);
      setCurrentlyPlayingIndex(0);
    });
  };

  return (
    <div className="shuffleButton" onClick={getNewRandomPlaylist}>
      <img src="Shuffle.svg" />
    </div>
  );
}
