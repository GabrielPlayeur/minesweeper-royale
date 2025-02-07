import {
    Players,
    addPlayer,
    removePlayer,
    getAllPlayers,
    getPlayer,
    setPlayerEliminated,
    incrPlayerLevel,
    incrPlayerProgress,
} from '../src/components/players';
import { PlayerNotFoundError } from '../src/errors/player.error';

describe('Players module', () => {
    let players: Players;

    beforeEach(() => {
        players = {};
    });

    test('Add a player', () => {
        addPlayer(players, '123', 'Alice', 1);

        expect(players).toHaveProperty('123');
        expect(players['123']).toEqual({
            name: 'Alice',
            match: 1,
            level: 0,
            progress: new Set(),
            eliminated: false,
        });
    });

    test('Remove a player', () => {
        addPlayer(players, '123', 'Alice', 1);
        removePlayer(players, '123');
        expect(players).not.toHaveProperty('123');

        expect(() => removePlayer(players, '123')).toThrow(PlayerNotFoundError);
    });

    test('Get all players', () => {
        expect(getAllPlayers(players)).toEqual({});

        addPlayer(players, '123', 'Alice', 1);
        addPlayer(players, '456', 'Bob', 2);
        expect(getAllPlayers(players)).toEqual({
            '123': {
                name: 'Alice',
                match: 1,
                level: 0,
                progress: new Set(),
                eliminated: false,
            },
            '456': {
                name: 'Bob',
                match: 2,
                level: 0,
                progress: new Set(),
                eliminated: false,
            },
        });
    });

    test('Get specific player', () => {
        addPlayer(players, '123', 'Alice', 1);
        expect(getPlayer(players, '123')).toEqual({
            name: 'Alice',
            match: 1,
            level: 0,
            progress: new Set(),
            eliminated: false,
        });
        expect(() => getPlayer(players, '456')).toThrow(PlayerNotFoundError);
    });

    test('Set a player has eliminated', () => {
        addPlayer(players, '123', 'Alice', 1);
        setPlayerEliminated(players, '123');
        expect(players['123'].eliminated).toBe(true);

        expect(() => setPlayerEliminated(players, '456')).toThrow(PlayerNotFoundError);
    });

    test('Incr player level', () => {
        addPlayer(players, '123', 'Alice', 1);
        incrPlayerLevel(players, '123');
        expect(players['123'].level).toBe(1);
        expect(players['123'].progress).toEqual(new Set());

        expect(() => incrPlayerLevel(players, '456')).toThrow(PlayerNotFoundError);
    });

    test('Incr player progress', () => {
        addPlayer(players, '123', 'Alice', 1);
        incrPlayerProgress(players, '123', [{ x: 0, y: 0, value: 0 }]);
        expect(players['123'].progress.size).toEqual(1);

        expect(() => incrPlayerProgress(players, '456', [{ x: 0, y: 0, value: 0 }])).toThrow(
            PlayerNotFoundError
        );
    });
});
