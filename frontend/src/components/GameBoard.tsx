// @ts-nocheck // pixi ne prend pas en charge les types
import { useEffect } from "react";
import { Stage } from "@pixi/react";
import useSocket from "../hooks/useSocket";
import useGameLogic from "../hooks/useGameLogic";
import Cell from "./Cell";
import GameStatus from "./GameStatus";
import { GRID_SIZE, CELL_SIZE } from "../config/constants";

const GameBoard = () => {
  const socket = useSocket();
  const { grid, dig, toggleDig, handleClick, handleRightClick, placedFlags, remainingCells } = useGameLogic(Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill(-1)), socket);

  useEffect(() => {
    socket.emit("requestGameState");
  }, [socket]);

  return (
    <div className="game-board">
      <GameStatus placeFlags={placedFlags} remainingCells={remainingCells} />
      <Stage
        width={GRID_SIZE * CELL_SIZE}
        height={GRID_SIZE * CELL_SIZE}
        onContextMenu={(e) => e.preventDefault()}
      >
        {grid.map((row, x) =>
          row.map((cellValue, y) => (
            <Cell
              key={`${x}-${y}`}
              cell={{ x, y, cellValue }}
              onClick={(event) => handleClick(event, { x, y })}
              onContextMenu={(event) => handleRightClick(event, { x, y })}
            />
          ))
        )}
      </Stage>
      <button onClick={toggleDig}>{dig ? "🔨 Dig" : "🚩 Flag"}</button>
    </div>
  );
};

export default GameBoard;
