// @ts-nocheck // pixi ne prend pas en charge les types
import { useEffect } from "react";
import { Stage } from "@pixi/react";
import useSocket from "../hooks/useSocket";
import useGameLogic from "../hooks/useGameLogic";
import Cell from "../components/Cell";
import GameInfo from "../components/GameInfo";
import { GRID_SIZE, CELL_SIZE } from "../config/constants";
import LeaderBoard from "../components/LeaderBoard";

const Game = () => {
  const socket = useSocket();
  const { grid, dig, toggleDig, handleClick, handleRightClick, placedFlags, remainingCells } = useGameLogic(Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill(-1)), socket);

  useEffect(() => {
    socket.emit("requestGameState");
  }, [socket]);

  return (
    <>
      <div className="flex flex-col-reverse md:flex-row justify-evenly items-center">
        <div className="h-1/4 fixed max-md:left-1/2 max-md:-translate-x-1/2 max-md:bottom-10 md:top-1/2 md:-translate-y-1/2 md:left-10">
          <GameInfo placedFlags={placedFlags} remainingCells={remainingCells} toggleDig={toggleDig} dig={dig} />
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
              defaultColor={(x & 1) ^ (y & 1) ? "#5ea500" : "#7ccf00"}
              cell={{ x, y, cellValue }}
              onClick={(event) => handleClick(event, { x, y })}
              onContextMenu={(event) => handleRightClick(event, { x, y })}
            />
          )))}
        </Stage>
      </div>
    </>
  );
};

export default Game;
