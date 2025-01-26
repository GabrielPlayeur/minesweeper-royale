import React, { useEffect, useState } from "react";
import { Stage, Graphics, Text } from "@pixi/react";
import "@pixi/events";
import io from "socket.io-client";

const socket = io("http://localhost:3000");

const CELL_SIZE = 30;
const GRID_SIZE = 10;
const DIRS = [[-1, -1], [0, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [0, 1], [1, 1]];

const GameBoard = () => {
  const [grid, setGrid] = useState(Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill(-1)));
  const [dig, setDig] = useState(true);

  useEffect(() => {
    console.log("Connecting to WebSocket...");

    socket.on("connect", () => {
      console.log("Connected to WebSocket");
    });

    socket.on("connect_error", (err) => {
      console.error("Connection Error: ", err);
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from WebSocket server");
    });

    socket.on("gameState", (data) => {
      setGrid(data.grid);
    });

    socket.on("gameUpdate", (data) => {
      console.log("Received gameUpdate:", data);
      if (data.eliminated) {
        alert("You lost!");
      } else {
        setGrid((prevGrid) => {
          const newGrid = [...prevGrid];
          data.cells.forEach( cell => {
            newGrid[cell.x][cell.y] = cell.value;
          });
          return newGrid;
        });
      }
    });

    return () => {
      socket.off("gameState");
      socket.off("gameUpdate");
      socket.off("connect_error");
      socket.off("disconnect");
    };
  }, []);

  const getNeighbors = (x, y) => {
    var neighbors = [];
    var flags = 0;
    var dx, dy;
    DIRS.forEach(d => {
      dx = x + d[0];
      dy = y + d[1];
      if (-1 < dx && dx < GRID_SIZE && -1 < dy && dy < GRID_SIZE){
        if (grid[dx][dy] === -1) {
          neighbors.push([dx,dy]);
        } else if (grid[dx][dy] === 9) {
          flags++;
        }
      }
    });
    return {neighbors, flags};
  }

  const handleClick = (x, y) => {
    if (dig && grid[x][y] === -1) { // unknown cell
      socket.emit("revealCell", { x, y });
    } else if (!dig && grid[x][y] === -1 || grid[x][y] === 9) { // place or remove flag
      const updatedGrid = [...grid];
      updatedGrid[x][y] = updatedGrid[x][y] === -1 ? 9 : -1;
      console.log("Updated grid for cell:", x, y, updatedGrid[x][y]);
      setGrid(updatedGrid);
    } else if (grid[x][y] !== 0) {
      var data = getNeighbors(x,y);
      if (grid[x][y] <= data.flags) { // dig around known cell
        data.neighbors.forEach(cell => {
          socket.emit("revealCell", { x:cell[0], y:cell[1] });
        });
      }
    }
  };

  const toggleDig = () => {
    setDig((prevState) => !prevState);
  };

  return (
    <div>
      <button onClick={toggleDig} style={{ marginBottom: '10px' }}>
        {dig ? "DIG" : "FLAG"}
      </button>

      <Stage width={GRID_SIZE * CELL_SIZE} height={GRID_SIZE * CELL_SIZE}>
        {grid.map((row, x) =>
          row.map((cell, y) => (
            <React.Fragment key={`${x}-${y}`}>
              <Graphics
                draw={(g) => {
                  g.clear();
                  if (cell === -1){
                    g.beginFill(0xcccccc);
                  } else if (cell === 9){
                    g.beginFill(0xe9962b);
                  } else {
                    g.beginFill(0xffffff);
                  }
                  g.drawRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
                  g.endFill();
                  g.lineStyle(1, 0x000000);
                  g.drawRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
                }}
                interactive
                pointerdown={() => handleClick(x, y)}
              />
              {!(cell === -1 || cell === 0 || cell === 9) && (
                <Text
                  text={cell.toString()}
                  x={x * CELL_SIZE + CELL_SIZE / 2}
                  y={y * CELL_SIZE + CELL_SIZE / 2}
                  anchor={0.5}
                  style={{
                    fontSize: 16,
                    fill: 0x000000,
                    fontWeight: "bold",
                  }}
                />
              )}
            </React.Fragment>
          ))
        )}
      </Stage>
    </div>
  );
};

export default GameBoard;