import { config } from '../config/constants';
import { PlayerAlreadyInMatchError, PlayerNotInMatchError } from '../errors/match.error';
import { Game, generateGame } from './games';
import { Players, addPlayer, getPlayer, incrPlayerLevel, removePlayer, setPlayerEliminated } from './players';

type Games = Game[];

export interface Match {
    id: number;
    name: string;
    games: Games;
    players: Players;
    nbPlayers: number;
    curLevel: number;
    launch: boolean;
}

export function createNewMatch(id: number, name: string): Match {
    var games = [];
    var players = {};
    var curLevel = 0;
    games.push(generateGame(curLevel));
    return { id, name, games, players, nbPlayers: 0, curLevel, launch: false };
}

export function addPlayerInMatch(match: Match, playerId: string, playerName: string) {
    if (match.players[playerId] !== undefined) throw new PlayerAlreadyInMatchError();
    addPlayer(match.players, playerId, playerName, match.id);
    match.nbPlayers++;
}

export function removePlayerInMatch(match: Match, playerId: string) {
    if (match.players[playerId] === undefined) throw new PlayerNotInMatchError();
    removePlayer(match.players, playerId);
    match.nbPlayers--;
}

export function incrToNextLevel(match: Match) {
    match.games[match.curLevel].closingTime = Date.now();
    match.curLevel++;
    match.games.push(generateGame(match.curLevel));
}

export function incrPlayerToNextLevel(match: Match, playerId: string) {
    if (match.players[playerId] === undefined) throw new PlayerNotInMatchError();
    incrPlayerLevel(match.players, playerId);
}

export function isMatchReadyToStart(match: Match) {
    return match.nbPlayers === config.NB_PLAYER_PER_MATCH;
}

/**
 * Check if games for a match is timeout to eliminate player at this level.
 */
export function checkTimeouts(match: Match) {
    // TODO: optimize this
    match.games.forEach(game => {
        if (game.closingTime > 0) {
            const elapsedTime = (Date.now() - game.closingTime) / 1000;
            if (elapsedTime > game.timer) {
                Object.keys(match.players).forEach(playerId => {
                    var player = getPlayer(match.players, playerId);
                    if (!player.eliminated && player.level === game.id) {
                        setPlayerEliminated(match.players, playerId);
                    }
                });
            }
        }
    });
}
