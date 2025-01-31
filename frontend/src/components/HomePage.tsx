import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useSocket from "../hooks/useSocket";

const HomePage = () => {
  const [playerName, setPlayerName] = useState(`Player${Math.floor(Math.random() * 100)}`);
  const navigate = useNavigate();
  const socket = useSocket();

  const joinQueue = () => {
    navigate("/matchmaking");
    socket.emit("joinQueue", playerName);
  };

  return (
    <div className="border-4 border-slate-900 rounded-3xl p-5 flex flex-col gap-3 bg-slate-400 shadow-2xl shadow-lime-500/60">
      <h3 className="text-center">Welcome on <strong className="text-lime-700 font-bold text-lg">Minesweeper</strong> BR !</h3>
      <input
        type="text"
        placeholder="Enter your name"
        className="px-4 py-2 border rounded-lg text-black focus:outline-none focus:ring-1 focus:ring-slate-900"
        onChange={(e) => setPlayerName(e.target.value)}
      />
      <button onClick={() => joinQueue()} className="rounded-md bg-lime-600 hover:ring-4 hover:ring-lime-400 py-1">🎮 Play</button>
    </div>
  );
};

export default HomePage;
