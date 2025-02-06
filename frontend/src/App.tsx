// @ts-nocheck
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Game from "./pages/Game";
import Waiting from "./pages/Waiting";
import End from "./pages/End";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/matchmaking" element={<Waiting />} />
        <Route path="/game/:roomId" element={<Game />} />
        <Route path="/end" element={<End />} />
      </Routes>
    </Router>
  );
}

export default App;
