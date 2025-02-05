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

type Matchs = Match[];
export let matchs: Matchs = [];
export let playerAssigment: Record<string, number> = {};

setInterval(() => matchs.forEach(match => checkTimeouts(match)), 1000);

function getPlayerAssignment(playerId: string): number | null {
    if (playerAssigment[playerId] === undefined) {
        console.log(`ERROR: Player ${playerId} has no match assigned.`);
        return null;
    }
    return playerAssigment[playerId];
}

function getMatch(id: number | null | undefined): Match | null {
    if (id === null || id === undefined || id < 0 || id >= matchs.length) {
        console.warn(`ERROR: Invalid match ID: ${id}`);
        return null;
    }
    return matchs[id];
}

/**
 * Find a match to join for a player
 */
export function findMatch(playerId: string, playerName: string) {
    if (matchs.length === 0 || matchs[matchs.length - 1].launch === true)
        matchs.push(createNewMatch(matchs.length, "match-" + matchs.length));
    if (playerAssigment[playerId] !== undefined && getMatch(playerAssigment[playerId])?.launch === false)
        return;
    addPlayerInMatch(matchs[matchs.length - 1], playerId, playerName);
    playerAssigment[playerId] = matchs.length - 1;
    return matchs[matchs.length - 1];
}

/**
 * Removes player from his current match
 */
export function leaveMatch(playerId: string) {
    const matchId = getPlayerAssignment(playerId);
    if (matchId === null) return { error: 'NO_MATCH' };
    const match = getMatch(matchId);
    if (match === null) return { error: 'NO_MATCH' };
    removePlayerInMatch(match, playerId);
    delete playerAssigment[playerId];
    return { match };
}

export function startMatch(matchId: number) {
    var match = getMatch(matchId);
    if (match === null) return { error: 'NO_MATCH' };
    match.launch = true;
    return { roomId: matchId };
}

export function canLaunchMatch(matchId: number) {
    var match = getMatch(matchId);
    if (match === null) return { error: 'NO_MATCH' };
    return isMatchReadyToStart(match) && match.launch === false;
}

export function hasPlayerWinGame(playerId: string, lastCells: String[]) {
    const match = getMatchFromPlayer(playerId);
    if (!match) return { error: 'NO_MATCH' };
    var player = getPlayer(match.players, playerId);
    if (player.eliminated) return { eliminated: true };
    var level = player.level;
    var win = isGameWin(match.games[level].bombs, lastCells);
    if (!win) return { win: false };
    if (match.curLevel === level) incrToNextLevel(match);
    incrPlayerToNextLevel(match, playerId);
    return { win: true, grid: match.games[match.curLevel].grid };
}

/** return the list of the winner and the looser from a match */
export function havePlayersWinMatch(matchId: number) {
    const match = getMatch(matchId);
    if (match === null) return { error: 'NO_MATCH' };
    var winner: string[] = [];
    var loser: string[] = [];
    Object.entries(match.players).forEach(([id, player]) =>
        player.eliminated ? loser.push(id) : winner.push(id)
    );
    return { winner, loser };
}

export function getMatchFromPlayer(playerId: string) {
    const matchId = getPlayerAssignment(playerId);
    if (matchId === null) return;
    const match = getMatch(matchId);
    if (match === null) return;
    return match;
}

/** Reveal the cell x,y and return either eliminated or the list of the revealed cells*/
export function playPlayerAction(playerId: string, x: number, y: number) {
    const match = getMatchFromPlayer(playerId);
    if (!match) return { error: 'NO_MATCH' };
    var player = getPlayer(match.players, playerId);
    var game = match.games[player.level];
    var cells = revealCells(game.bombs, game.solveGrid, x, y);
    if (cells.length === 0 || player.eliminated === true) {
        // Player lost
        delete playerAssigment[playerId];
        setPlayerEliminated(match.players, playerId);
        return { eliminated: true };
    }
    return { cells };
}

export function getFirstGame(playerId: string) {
    const matchId = getPlayerAssignment(playerId);
    if (matchId === null) return { error: 'NO_MATCH' };
    const match = getMatch(matchId);
    if (match === null) return { error: 'NO_MATCH' };
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

// export function getMatchName(playerId: string)
