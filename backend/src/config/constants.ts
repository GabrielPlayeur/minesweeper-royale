export const config = {
    GRID_SIZE: 15,
    NB_BOMBS: 15,
    NB_PLAYER_PER_MATCH: 2,
};
export const DIRS: [number, number][] = [
    [-1, -1],
    [0, -1],
    [1, -1],
    [-1, 0],
    [1, 0],
    [-1, 1],
    [0, 1],
    [1, 1],
];
export type Grid = number[][];
export const TIMER_EVOLUTION: number[] = [30, 20, 10, 5, 3, 1];
