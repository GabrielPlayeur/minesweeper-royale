import { Game, Bombs, generateGame, isGameWin, revealCells, getRemainingTime } from '../src/components/games';
import { TIMER_EVOLUTION, Grid, config } from '../src/config/constants';

describe('Games module', () => {
    let grid: Grid = [
        [-1, 1, 0, 0],
        [-1, 1, 1, 0],
        [-1, -1, 1, 0],
        [-1, -1, 1, 0],
    ];
    let solvedGrid: Grid = [
        [9, 1, 0, 0],
        [2, 2, 1, 0],
        [1, 9, 1, 0],
        [1, 1, 1, 0],
    ];

    let bombs: Bombs = new Set(['0,0', '2,1']);

    test('Generate a game', () => {
        var game: Game = generateGame(0);
        expect(game).toEqual({
            id: 0,
            grid: game.grid,
            solveGrid: game.solveGrid,
            bombs: game.bombs,
            timer: TIMER_EVOLUTION[0],
            closingTime: 0,
        });
        game = generateGame(9);
        expect(game).toEqual({
            id: 9,
            grid: game.grid,
            solveGrid: game.solveGrid,
            bombs: game.bombs,
            timer: 1,
            closingTime: 0,
        });
    });

    test('Check if a game is win', () => {
        expect(isGameWin(bombs, ['0,0', '1,1', '2,1'])).toEqual(false);
        expect(isGameWin(bombs, ['0,0', '1,1'])).toEqual(false);
        expect(isGameWin(bombs, [])).toEqual(false);
        expect(isGameWin(bombs, ['0,0', '2,1'])).toEqual(true);
    });

    test('Reveal list of cells after clicking at (x, y)', () => {
        const originalValue = config.GRID_SIZE;
        (config as any).GRID_SIZE = 4;
        expect(revealCells(bombs, solvedGrid, 0, 0)).toEqual([]);
        expect(revealCells(bombs, solvedGrid, 2, 2)).toEqual([{ x: 2, y: 2, value: 1 }]);
        expect(revealCells(bombs, solvedGrid, 3, 3)).toEqual([
            { value: 0, x: 3, y: 3 },
            { value: 0, x: 2, y: 3 },
            { value: 0, x: 1, y: 3 },
            { value: 0, x: 0, y: 3 },
            { value: 1, x: 1, y: 2 },
            { value: 0, x: 0, y: 2 },
            { value: 2, x: 1, y: 1 },
            { value: 1, x: 0, y: 1 },
            { value: 1, x: 2, y: 2 },
            { value: 1, x: 3, y: 2 },
        ]);
        expect(revealCells(bombs, solvedGrid, 9, 9)).toEqual([]);
        expect(revealCells(bombs, solvedGrid, -1, -1)).toEqual([]);

        config.GRID_SIZE = originalValue;
    });

    test('Get remaining time', () => {
        var game = generateGame(0);
        expect(getRemainingTime(game)).toEqual(game.timer);

        game.closingTime = Date.now();
        expect(getRemainingTime(game)).toBeLessThan(10000);

        game.closingTime = 10;
        expect(getRemainingTime(game)).toEqual(0);
    });
});
