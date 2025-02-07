import { useLocation, useNavigate } from "react-router-dom";
import StyledButton from "../components/ui/Button";
import { useEffect } from "react";

const End = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const gameResult = location.state?.result || "lose"; // Par défaut "perdu"

    useEffect(() => {
        const handleKeyPress = (event: KeyboardEvent) => {
            navigate("/");
        };

        window.addEventListener("keydown", handleKeyPress);

        return () => {
            window.removeEventListener("keydown", handleKeyPress);
        }
    });


    return (
        <div>
            <h1>{gameResult === "win" ? "🎉 You win !" : gameResult === "lose_bomb" ? "You lose by clicking on a bomb" : "You lose by time"}</h1>
            <StyledButton onClick={() => navigate("/")}>Replay</StyledButton>
        </div>
    );
};

export default End