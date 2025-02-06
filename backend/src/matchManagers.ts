import { getPlayer, setPlayerEliminated } from './components/players';
import { isGameWin, revealCells } from './components/games';
import {
    Match,
    addPlayerInMatch,
    createNewMatch,
    incrToNextLevel,
    incrPlayerToNextLevel,
    isMatchReadyToStart,
    checkTimeouts,
    removePlayerInMatch,
} from './components/matchs';
import { config } from './config/constants';
import { MatchNotFoundError, NoMatchAssignedError, PlayerAlreadyInMatchError } from './errors/match.error';

type Matchs = Match[];
export let matchs: Matchs = [];
export let playerAssigment: Record<string, number> = {};

setInterval(() => matchs.forEach(match => checkTimeouts(match)), 1000);

export function getPlayerAssignment(playerId: string): number {
    if (playerAssigment[playerId] === undefined) {
        console.log(`ERROR: Player ${playerId} has no match assigned.`);
        throw new NoMatchAssignedError();
    }
    return playerAssigment[playerId];
}

export function getMatch(id: number): Match {
    if (id === null || id === undefined || id < 0 || id >= matchs.length) {
        console.log(`ERROR: Invalid match ID: ${id}`);
        throw new MatchNotFoundError();
    }
    return matchs[id];
}

export function getMatchFromPlayerId(playerId: string) {
    const matchId = getPlayerAssignment(playerId);
    const match = getMatch(matchId);
    return match;
}

/**
 * Find a match to join for a player
 */
export function findMatch(playerId: string, playerName: string) {
    if (matchs.length === 0 || matchs[matchs.length - 1].launch === true)
        matchs.push(createNewMatch(matchs.length, 'match-' + matchs.length));
    if (matchs[playerAssigment[playerId]]?.launch === false)
        // Player all ready in a match
        throw new PlayerAlreadyInMatchError();
    addPlayerInMatch(matchs[matchs.length - 1], playerId, playerName);
    playerAssigment[playerId] = matchs.length - 1;
    return matchs[matchs.length - 1];
}

/**
 * Removes player from his current match
 */
export function leaveMatch(playerId: string) {
    const match = getMatchFromPlayerId(playerId);
    removePlayerInMatch(match, playerId);
    delete playerAssigment[playerId];
    return match;
}

export function startMatch(matchId: number) {
    const match = getMatch(matchId);
    match.launch = true;
    return { roomId: matchId };
}

export function canLaunchMatch(matchId: number) {
    const match = getMatch(matchId);
    return isMatchReadyToStart(match) && match.launch === false;
}

export function hasPlayerWinGame(playerId: string, lastCells: String[]) {
    const match = getMatchFromPlayerId(playerId);
    const player = getPlayer(match.players, playerId);
    if (player.eliminated) return { win: false, grid: [], eliminated: true };
    const level = player.level;
    const win = isGameWin(match.games[level].bombs, lastCells);
    if (!win) return { win: false, grid: [], eliminated: false };
    if (match.curLevel === level) incrToNextLevel(match);
    incrPlayerToNextLevel(match, playerId);
    return { win: true, grid: match.games[match.curLevel].grid, eliminated: false };
}

/** return the list of the winner and the looser from a match */
export function havePlayersWinMatch(matchId: number) {
    const match = getMatch(matchId);
    const winner: string[] = [];
    const loser: string[] = [];
    Object.entries(match.players).forEach(([id, player]) =>
        player.eliminated ? loser.push(id) : winner.push(id)
    );
    return { winner, loser };
}

/** Reveal the cell x,y and return either eliminated or the list of the revealed cells*/
export function playPlayerAction(playerId: string, x: number, y: number) {
    const match = getMatchFromPlayerId(playerId);
    const player = getPlayer(match.players, playerId);
    const game = match.games[player.level];
    const cells = revealCells(game.bombs, game.solveGrid, x, y);
    if (cells.length === 0 || player.eliminated === true) {
        // Player lost
        delete playerAssigment[playerId];
        setPlayerEliminated(match.players, playerId);
        return { cells, eliminated: true };
    }
    return { cells, eliminated: false };
}

export function getFirstGame(playerId: string) {
    const match = getMatchFromPlayerId(playerId);
    return { grid: match.games[0].grid, nb_bombs: config.NB_BOMBS };
}

export function getPlayersName(match: Match) {
    return Object.values(match.players).map(player => player.name);
}

/**
 * Clear the variable for the tests
 */
export function clearMatchs() {
    matchs = [];
    playerAssigment = {};
}
