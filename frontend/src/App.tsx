// @ts-nocheck
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import GameBoard from "./pages/GameBoard";
import WaitingPage from "./pages/WaitingPage";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/matchmaking" element={<WaitingPage />} />
        <Route path="/game/:roomId" element={<GameBoard />} />
      </Routes>
    </Router>
  );
}

export default App;
