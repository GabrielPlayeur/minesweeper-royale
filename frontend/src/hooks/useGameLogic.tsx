import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { countFlags, countRemainingCells, getNeighbors, getRemainingCells, } from "../utils/gridHelpers";
import { Socket } from "socket.io-client";
import { Grid, initialGameState, ResultEndGame, ResultOnError, ResultOnGame, ResultOnMatch, ResultOnReveal, XY } from "../config/types";

export let NB_BOMBS = -1;

const useGameLogic = (initialGrid: Grid, socket: Socket) => {
  const [grid, setGrid] = useState(initialGrid);
  const [dig, setDig] = useState(true);
  const [placedFlags, setFlags] = useState(countFlags(initialGrid));
  const [remainingCells, setRemaining] = useState(countRemainingCells(initialGrid));
  const navigate = useNavigate();

  useEffect(() => {
    setRemaining(countRemainingCells(grid));
    setFlags(countFlags(grid));
  }, [grid]);

  useEffect(() => {
    if (remainingCells === NB_BOMBS) isGridFinish();
  }, [remainingCells]);

  useEffect(() => {
    if (!socket) return;

    socket.on("error", (error: ResultOnError) => {
      console.error(error.type, error.message);
    });

    socket.on("gameState", (data: initialGameState) => {
      setGrid([...data.grid.map(row => [...row])]);
      NB_BOMBS = data.nb_bombs!;    // #TODO: verify if data.nb_bombs is not null
    });

    socket.on("gameUpdate", (data: ResultOnReveal) => {
      if (data.eliminated === true) {
        navigate("/end", { state: { result: "lose_bomb" } });
        return;
      }
      setGrid((prevGrid) => {
        const newGrid = [...prevGrid];
        data.cells.forEach(cell => (newGrid[cell.x][cell.y] = cell.value));
        return newGrid;
      });
    });

    socket.on("gameStatus", (data: ResultOnGame) => {
      if (data.eliminated === true) {
        navigate("/end", { state: { result: "lose" } });
      } else if (data.win && data.grid) {
        setGrid(data.grid);
      }
    });

    socket.on("matchStatus", (data: ResultOnMatch) => {
      if (data.winner[0] === socket.id)
        navigate("/end", { state: { result: "win" } });
      else
        navigate("/end", { state: { result: "lose" } });
    });

    return () => {
      socket.off("error");
      socket.off("gameState");
      socket.off("gameUpdate");
      socket.off("gameStatus");
      socket.off("matchStatus");
    };
  }, [socket]);

  const toggleDig = () => setDig((prev) => !prev);

  const clickAction = (mouseActionSwitch: "left" | "right", { x, y }: XY): void => {
    if (((dig && mouseActionSwitch === 'left') || (!dig && mouseActionSwitch == 'right')) && grid[x][y] === -1) {  // unknown cell
      socket.emit("revealCell", { x, y });
    } else if (((!dig && mouseActionSwitch === 'left') || (dig && mouseActionSwitch == 'right')) && (grid[x][y] === -1 || grid[x][y] === 9)) { // place or remove flag
      const updatedGrid = [...grid];
      updatedGrid[x][y] = updatedGrid[x][y] === -1 ? 9 : -1;
      setGrid(updatedGrid);
    } else if (grid[x][y] !== 0) {
      var data = getNeighbors({ x, y }, grid);
      if (grid[x][y] <= data.flags) // dig around known cell
        data.neighbors.forEach(cell => socket.emit("revealCell", { x: cell[0], y: cell[1] }));
    }
  }
  type ClickEvent = {
    data?: {
      originalEvent?: MouseEvent;
    };
    button?: number;
  }

  const handleClick = (event: ClickEvent, { x, y }: XY) => {
    const nativeEvent = event.data?.originalEvent || event;
    if (!nativeEvent || nativeEvent.button !== 0) return;
    clickAction('left', { x, y });
  };

  const handleRightClick = (event: ClickEvent, { x, y }: XY) => {
    const nativeEvent = event.data?.originalEvent || event;
    if (!nativeEvent) return;
    clickAction('right', { x, y });
  };

  const isGridFinish = () => {
    socket.emit("isGridValid", { cells: getRemainingCells(grid) });
  }

  return { grid, dig, toggleDig, handleClick, handleRightClick, placedFlags, remainingCells };
};

export default useGameLogic;
