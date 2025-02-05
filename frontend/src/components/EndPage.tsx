import { useLocation, useNavigate } from "react-router-dom";

const EndPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const gameResult = location.state?.result || "lose"; // Par défaut "perdu"

  return (
    <div>
      <h1>{gameResult === "win" ? "🎉 You have win !" : gameResult === "lose_bomb" ? "You have lose by clicking on a bomb" : "You have lose by time"}</h1>
      <button onClick={() => navigate("/")}>Replay</button>
    </div>
  );
};

export default EndPage