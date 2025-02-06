import { config, Grid } from '../src/config/constants';
import { MatchNotFoundError, NoMatchAssignedError, PlayerAlreadyInMatchError } from '../src/errors/match.error';
import {
    matchs,
    playerAssigment,
    clearMatchs,
    findMatch,
    leaveMatch,
    startMatch,
    canLaunchMatch,
    hasPlayerWinGame,
    playPlayerAction,
    getFirstGame,
    getPlayersName,
    havePlayersWinMatch,
    getMatchFromPlayerId,
    getPlayerAssignment,
    getMatch,
} from '../src/matchManagers';

describe('Match Managers module', () => {
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

    let bombs: Set<string> = new Set(['0,0', '2,1']);

    beforeEach(() => {
        clearMatchs();
    });

    test('Get match id link to a player id', () => {
        expect(() => getPlayerAssignment('123')).toThrow(NoMatchAssignedError);

        findMatch('123', 'test');
        var ret = getPlayerAssignment('123');
        expect(ret).toEqual(0);
    });

    test('Get match link to an match id', () => {
        expect(() => getMatch(0)).toThrow(MatchNotFoundError);

        findMatch('123', 'test');
        var ret = getMatch(0);
        expect(ret).toEqual(matchs[0]);
    });

    test('Get match link to a player id', () => {
        findMatch('123', 'test');
        var ret = getMatchFromPlayerId('123');
        expect(ret).toEqual(matchs[0]);
    });

    test('Find a match for a player', () => {
        var ret = findMatch('123', 'test');
        expect(ret).toBe(matchs[0]);
        expect(matchs.length).toEqual(1);
        expect(playerAssigment['123']).toEqual(0);
        expect(matchs[0].nbPlayers).toEqual(1);

        expect(() => findMatch('123', 'test')).toThrow(PlayerAlreadyInMatchError);

        matchs[0].launch = true;
        ret = findMatch('123', 'test');
        expect(ret).toBe(matchs[1]);
        expect(matchs.length).toEqual(2);
        expect(playerAssigment['123']).toEqual(1);

        ret = findMatch('456', 'test2');
        expect(ret).toBe(matchs[1]);
        expect(matchs.length).toEqual(2);
        expect(playerAssigment['456']).toEqual(1);
    });

    test('Removes player from his current match', () => {
        findMatch('123', 'test');
        var ret = leaveMatch('123');
        expect(ret).toEqual(matchs[0]);
        expect(playerAssigment['123']).toEqual(undefined);
        expect(matchs[0].nbPlayers).toEqual(0);
    });

    test('Start a match', () => {
        findMatch('123', 'test');
        var ret = startMatch(0);
        expect(matchs[0].launch).toEqual(true);
        expect(ret).toEqual({ roomId: 0 });
    });

    test('Check if a match can be launch', () => {
        findMatch('123', 'test');
        var ret = canLaunchMatch(0);
        expect(ret).toEqual(false);

        for (let i = 0; i < config.NB_PLAYER_PER_MATCH - 1; i++) {
            findMatch(`${i}`, `test${i}`);
        }
        ret = canLaunchMatch(0);
        expect(ret).toEqual(true);

        startMatch(0);
        ret = canLaunchMatch(0);
        expect(ret).toEqual(false);
    });

    test('Check if a player win a game', () => {
        findMatch('123', 'test');
        startMatch(0);
        var ret = hasPlayerWinGame('123', []);
        expect(ret).toEqual({ win: false, grid: [], eliminated: false });

        var bombs: string[] = Array.from(matchs[0].games[0].bombs);
        ret = hasPlayerWinGame('123', bombs);
        expect(ret).toEqual({ win: true, grid: matchs[0].games[1].grid, eliminated: false });

        matchs[0].players['123'].eliminated = true;
        ret = hasPlayerWinGame('123', []);
        expect(ret).toEqual({ win: false, grid: [], eliminated: true });
    });

    test('Make the player action', () => {
        findMatch('123', 'test');
        startMatch(0);

        const originalValue = config.GRID_SIZE;
        (config as any).GRID_SIZE = 4;
        matchs[0].games[0].bombs = bombs;
        matchs[0].games[0].grid = grid;
        matchs[0].games[0].solveGrid = solvedGrid;

        var ret = playPlayerAction('123', 3, 0);
        expect(ret).toEqual({ cells: [{ x: 3, y: 0, value: 1 }], eliminated: false });

        ret = playPlayerAction('123', 0, 0);
        expect(ret).toEqual({cells: [], eliminated: true });
        expect(playerAssigment).not.toHaveProperty('123');
        expect(matchs[0].players['123'].eliminated).toEqual(true);

        config.GRID_SIZE = originalValue;
    });

    test('Get the firt game of the match', () => {
        findMatch('123', 'test');
        startMatch(0);

        const originalValue = config.NB_BOMBS;
        (config as any).NB_BOMBS = 2;
        matchs[0].games[0].bombs = bombs;
        matchs[0].games[0].grid = grid;
        matchs[0].games[0].solveGrid = solvedGrid;
        var ret = getFirstGame('123');
        expect(ret).toEqual({ grid: grid, nb_bombs: 2 });

        config.NB_BOMBS = originalValue;
    });

    test('Get players name of a match', () => {
        findMatch('123', 'test');
        expect(getPlayersName(matchs[0])).toEqual(['test']);

        findMatch('456', 'test2');
        expect(getPlayersName(matchs[0])).toEqual(['test', 'test2']);

        leaveMatch('123');
        expect(getPlayersName(matchs[0])).toEqual(['test2']);

        leaveMatch('456');
        expect(getPlayersName(matchs[0])).toEqual([]);
    });

    test('Check if a player win a match', () => {
        findMatch('123', 'test');
        var ret = havePlayersWinMatch(0);
        expect(ret).toEqual({ winner: ['123'], loser: [] });

        findMatch('456', 'test2');
        ret = havePlayersWinMatch(0);
        expect(ret).toEqual({ winner: ['123', '456'], loser: [] });
        expect(ret).toEqual(havePlayersWinMatch(0));

        matchs[0].players['456'].eliminated = true;
        ret = havePlayersWinMatch(0);
        expect(ret).toEqual({ winner: ['123'], loser: ['456'] });
        expect(ret).toEqual(havePlayersWinMatch(0));

        matchs[0].players['123'].eliminated = true;
        ret = havePlayersWinMatch(0);
        expect(ret).toEqual({ winner: [], loser: ['123', '456'] });
        expect(ret).toEqual(havePlayersWinMatch(0));
    });
});
