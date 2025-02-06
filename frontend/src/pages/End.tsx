import { useLocation, useNavigate } from "react-router-dom";

const End = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const gameResult = location.state?.result || "lose"; // Par défaut "perdu"

    return (
        <div>
            <h1>{gameResult === "win" ? "🎉 You win !" : gameResult === "lose_bomb" ? "You lose by clicking on a bomb" : "You lose by time"}</h1>
            <button onClick={() => navigate("/")}>Replay</button>
        </div>
    );
};

export default End