import { config, Grid, DIRS, TIMER_EVOLUTION } from '../config/constants';
import { countNeighbors } from '../utils/gridHelpers';

export type Bombs = Set<string>;

export interface Game {
    id: number;
    grid: Grid;
    solveGrid: Grid;
    bombs: Bombs;
    timer: number;
    closingTime: number;
}

export function generateGame(id: number): Game {
    var data = initializeGrid();
    var grid = data.grid;
    var solveGrid = data.solveGrid;
    var bombs = data.bombs;
    var timer = getTimer(id);
    selectStartCell(grid, solveGrid);
    return { id, grid, solveGrid, bombs, timer: timer, closingTime: 0 };
}

function getTimer(id: number) {
    if (id >= TIMER_EVOLUTION.length) return 1;
    return TIMER_EVOLUTION[id];
}

function initializeGrid() {
    const grid: Grid = Array(config.GRID_SIZE)
        .fill(null)
        .map(() => Array(config.GRID_SIZE).fill(-1));
    const bombs: Set<string> = new Set();
    for (let i = 0; i < config.NB_BOMBS; i++) {
        let pos: string;
        do {
            pos = `${Math.floor(Math.random() * config.GRID_SIZE)},${Math.floor(Math.random() * config.GRID_SIZE)}`;
        } while (bombs.has(pos));
        bombs.add(pos);
    }
    const solveGrid: Grid = Array(config.GRID_SIZE)
        .fill(null)
        .map((_, i) =>
            Array(config.GRID_SIZE)
                .fill(0)
                .map((_, j) => countNeighbors(i, j, bombs))
        );
    return { grid, bombs, solveGrid };
}

function selectStartCell(grid: Grid, solveGrid: Grid) {
    var choice = [];
    for (let i = 0; i < config.GRID_SIZE; i++) {
        for (let j = 0; j < config.GRID_SIZE; j++) {
            if (solveGrid[i][j] === 0) choice.push([i, j]);
        }
    }
    var [x, y] = choice[Math.floor(Math.random() * choice.length)];
    getCells(solveGrid, x, y).forEach(cell => {
        grid[cell.x][cell.y] = cell.value;
    });
}

function getCells(solveGrid: Grid, x: number, y: number) {
    if (solveGrid[x][y] !== 0) {
        return [{ x, y, value: solveGrid[x][y] }];
    }
    var res = [];
    var stack: [number, number][] = [[x, y]];
    var visited = new Set();
    var nx: number, ny: number, cell: number, dx: number, dy: number;
    while (stack.length) {
        [nx, ny] = stack.pop()!;
        cell = solveGrid[nx][ny];
        if (visited.has(`${nx},${ny}`)) continue;
        res.push({ x: nx, y: ny, value: cell });
        visited.add(`${nx},${ny}`);
        if (cell !== 0) continue;
        DIRS.forEach(d => {
            dx = nx + d[0];
            dy = ny + d[1];
            if (
                -1 < dx &&
                dx < config.GRID_SIZE &&
                -1 < dy &&
                dy < config.GRID_SIZE &&
                !visited.has(`${dx},${dy}`)
            ) {
                stack.push([dx, dy]);
            }
        });
    }
    return res;
}

export function isGameWin(bombs: Bombs, cells: String[]) {
    var cellsSet = new Set<String>(cells);
    if (bombs.size !== cellsSet.size) return false;
    for (let cell of bombs) {
        if (!cellsSet.has(cell)) return false;
    }
    return true;
}

export function revealCells(bombs: Bombs, solvedGrid: Grid, x: number, y: number) {
    if (x >= config.GRID_SIZE || y >= config.GRID_SIZE || x < 0 || y < 0) return [];
    if (bombs.has(`${x},${y}`)) return [];
    return getCells(solvedGrid, x, y);
}

export function getRemainingTime(game: Game) {
    if (game.closingTime === 0) return game.timer;
    const t = game.timer - (Date.now() - game.closingTime) / 1000;
    return t <= 0 ? 0 : t;
}
