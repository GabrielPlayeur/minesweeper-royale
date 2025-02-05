import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useSocket from "../hooks/useSocket";
import { Card, CardContent } from "../components/ui/card";


const WaitingPage = () => {
  const navigate = useNavigate();
  const socket = useSocket();
  const [playersWaiting, setPlayersWaiting] = useState<string[]>([]);
  const [nbPlayerPerMatch, setNbPlayerPerMatch] = useState(0);

  useEffect(() => {
    socket.on("updateQueue", (data: { players: string[], nb_player_per_match: number }) => {
      setPlayersWaiting(data.players);
      setNbPlayerPerMatch(data.nb_player_per_match);
    });

    socket.on("matchFound", ({ roomId }) => {
      navigate(`/game/${roomId}`);
    });

    return () => {
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
                  <p className="text-gray-600">Slot vide</p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
      <button onClick={() => cancel()}>Cancel</button>
    </div>
  );
};

export default WaitingPage;
