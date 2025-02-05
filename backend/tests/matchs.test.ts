import {
    createNewMatch,
    addPlayerInMatch,
    removePlayerInMatch,
    incrToNextLevel,
    incrPlayerToNextLevel,
    isMatchReadyToStart,
    checkTimeouts,
    Match,
} from '../src/components/matchs';
import { config } from '../src/config/constants';

describe('Matchs module', () => {
    let match: Match;

    beforeEach(() => {
        match = createNewMatch(0, "match-0");
    });

    test('Create a match', () => {
        expect(match).toEqual({
            id: 0,
            name: "match-0",
            games: match.games,
            players: {},
            nbPlayers: 0,
            curLevel: 0,
            launch: false,
        });
        expect(match.games.length).toEqual(1);
    });

    test('Add a player in match', () => {
        addPlayerInMatch(match, 'aze', 'test');
        expect(match.players).toEqual({
            aze: {
                name: 'test',
                match: 0,
                level: 0,
                progress: 0,
                eliminated: false,
            },
        });
        expect(match.nbPlayers).toEqual(1);

        addPlayerInMatch(match, 'aze', 'test');
        expect(match.players).toEqual({
            aze: {
                name: 'test',
                match: 0,
                level: 0,
                progress: 0,
                eliminated: false,
            },
        });
        expect(match.nbPlayers).toEqual(1);
    });

    test('Remove a player from a match', () => {
        addPlayerInMatch(match, 'aze', 'test');
        removePlayerInMatch(match, 'aze');
        expect(match.players).toEqual({});
        expect(match.nbPlayers).toEqual(0);

        removePlayerInMatch(match, 'aze');
        expect(match.players).toEqual({});
        expect(match.nbPlayers).toEqual(0);
    });

    test('Increase match level', () => {
        incrToNextLevel(match);
        expect(match.curLevel).toEqual(1);
        expect(match.games.length).toEqual(2);
        expect(match.games[0].closingTime).toBeGreaterThan(0);
    });

    test('Move player to the next level', () => {
        incrPlayerToNextLevel(match, 'aze');

        addPlayerInMatch(match, 'aze', 'test');
        incrPlayerToNextLevel(match, 'aze');
    });

    test('Check if a match is ready to start', () => {
        expect(isMatchReadyToStart(match)).toEqual(false);

        for (let i = 0; i < config.NB_PLAYER_PER_MATCH; i++) {
            addPlayerInMatch(match, `${i}`, `test${i}`);
        }
        expect(isMatchReadyToStart(match)).toEqual(true);
    });

    test('Check if a game is timeout to eliminate player', () => {
        addPlayerInMatch(match, '123', 'test1');
        addPlayerInMatch(match, '456', 'test2');
        checkTimeouts(match);
        expect(match.players['123'].eliminated).toEqual(false);
        expect(match.players['456'].eliminated).toEqual(false);

        incrPlayerToNextLevel(match, '123');
        incrToNextLevel(match);
        match.games[0].closingTime = 1; // to simulate a long periode of time
        checkTimeouts(match);
        expect(match.players['123'].eliminated).toEqual(false);
        expect(match.players['456'].eliminated).toEqual(true);
    });
});
