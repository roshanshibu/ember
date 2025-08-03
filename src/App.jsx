import { useState } from "react";
import "./App.css";
import Login from "./pages/Login/Login";
import Home from "./pages/Home/Home";

function App() {
  const [loggedIn, setLoggedIn] = useState(false);

  return loggedIn ? <Home /> : <Login setLoggedIn={setLoggedIn} />;
}

export default App;
