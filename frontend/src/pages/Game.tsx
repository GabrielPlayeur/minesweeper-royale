// @ts-nocheck // pixi ne prend pas en charge les types
import { useEffect, useRef } from "react";
import { Stage } from "@pixi/react";
import useSocket from "../hooks/useSocket";
import useGameLogic from "../hooks/useGameLogic";
import Cell from "../components/Cell";
import GameStatus from "../components/GameStatus";
import { GRID_SIZE, CELL_SIZE } from "../config/constants";
import LeaderBoard from "../components/LeaderBoard";

const Game = () => {
  const socket = useSocket();
  const { grid, dig, toggleDig, handleClick, handleRightClick, placedFlags, remainingCells } = useGameLogic(Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill(-1)), socket);
  const hasGameState = useRef(false);

  useEffect(() => {
    if (!socket || hasGameState.current) return;
    hasGameState.current = true;
    socket.emit("requestGameState");
  }, [socket]);

  return (
    <>
      <div className="flex flex-col-reverse md:flex-row justify-evenly items-center">
        <div className="h-1/4 left-1/2 -translate-x-1/2 bottom-10 fixed">
          <GameStatus placedFlags={placedFlags} remainingCells={remainingCells} toggleDig={toggleDig} dig={dig} />
        </div>
        <div className="h-1/4 top-20 right-10 fixed">
          <LeaderBoard />
        </div>
      </div>

      <div className="flex justify-between items-center h-full bg-lime-400 overflow-scroll">
        <Stage
          width={GRID_SIZE * CELL_SIZE}
          height={GRID_SIZE * CELL_SIZE}
          onContextMenu={(e) => e.preventDefault()}
          className="mx-auto"
        >
          {grid.map((row, x) => row.map((cellValue, y) => (
            <Cell
              key={`${x}-${y}`}
              cell={{ x, y, cellValue }}
              onClick={(event) => handleClick(event, { x, y })}
              onContextMenu={(event) => handleRightClick(event, { x, y })} />
          ))
          )}
        </Stage>
      </div>
    </>
  );
};

export default Game;
