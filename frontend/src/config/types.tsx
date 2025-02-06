export type Bombs = Set<string>;

export type XY = {
    x: number;
    y: number;
};

export type Grid = number[][];

export type Game = {
    id: number;
    grid: Grid;
    solveGrid: Grid;
    bombs: Bombs;
    timer: number;
    closingTime: number;
}

export type Cell = {
    x: number;
    y: number;
    value: number;
}

export type initialGameState = {
    grid: Grid;
    nb_bombs: number;
};

type Result = {
    error?: string;
    eliminated?: boolean;
}

export type ResultOnReveal = {
    cells: Cell[];
    eliminated: boolean;
}

export type ResultEndGame = Result & {
    win?: boolean;
    grid?: Grid;
    winner?: string[];
    eliminated?: string[];
}

export type ResultOnGame = {
    win: boolean;
    grid: Grid;
    eliminated: boolean;
}

export type ResultOnMatch = {
    winner: string[];
    loser: string[];
}

export type ResultOnError = {
    type: string;
    message: string;
}