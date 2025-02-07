import { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import useSocket from "../hooks/useSocket";
import { Card, CardContent } from "../components/ui/card";
import StyledButton from "../components/ui/Button";
import { ResultOnError } from "../config/types";


const Waiting = () => {
  const location = useLocation();
  const playerName = location.state?.playerName || "player00";
  const navigate = useNavigate();
  const socket = useSocket();
  const [playersWaiting, setPlayersWaiting] = useState<string[]>([]);
  const [nbPlayerPerMatch, setNbPlayerPerMatch] = useState(0);
  const hasJoinedQueue = useRef(false);

  useEffect(() => {
    if (!socket || hasJoinedQueue.current) return;
    hasJoinedQueue.current = true;
    socket.emit("joinQueue", playerName);
  }, [socket]);

  useEffect(() => {
    socket.on("error", (error: ResultOnError) => {
      console.error(error.type, error.message);
    });

    socket.on("updateQueue", (data: { players: string[], nb_player_per_match: number }) => {
      setPlayersWaiting(data.players);
      setNbPlayerPerMatch(data.nb_player_per_match);
    });

    socket.on("matchFound", ({ roomId }) => {
      navigate(`/game/${roomId}`);
    });

    return () => {
      socket.off("error");
      socket.off("updateQueue");
      socket.off("matchFound");
    };
  }, [socket, navigate]);

  const cancel = () => {
    navigate('/');
    socket.emit("cancelQueue");
  }

  return (
    <div>
      <h1>Waiting for other players...</h1>
      <p>Waiting players : {playersWaiting.length} / {nbPlayerPerMatch}</p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4">
        {[...Array(nbPlayerPerMatch)].map((_, index) => {
          const player = index < playersWaiting.length ? playersWaiting[index] : null;
          return (
            <Card
              key={index}
              className={`p-4 rounded-2xl shadow-md text-center ${player ? "bg-white" : "bg-gray-300 animate-pulse"}`}
            >
              <CardContent>
                {player ? (
                  <>
                    <h3 className="text-lg font-bold">{player}</h3>
                  </>
                ) : (
                  <p className="text-gray-600">Empty slot</p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
      <StyledButton onClick={() => cancel()} className="">Cancel</StyledButton>
    </div>
  );
};

export default Waiting;
