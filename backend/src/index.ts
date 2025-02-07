import { Socket, Server } from 'socket.io';
import express from 'express';
import http from 'http';
import {
    leaveMatch,
    canLaunchMatch,
    findMatch,
    getFirstGame,
    hasPlayerWinGame,
    playPlayerAction,
    startMatch,
    getPlayersName,
    havePlayersWinMatch,
    playerAssigment,
    getMatchFromPlayerId,
    getMatchProgress,
    getPlayerRemainingTime,
} from './matchManagers';
import { config } from './config/constants';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: '*' },
});

io.on('connection', (socket: Socket) => {
    console.log(`Player connected: ${socket.id}`);

    socket.on('joinQueue', playerName => {
        try {
            const playerId = socket.id;
            const match = findMatch(playerId, playerName);
            console.log(`Add player ${playerId} into match : ${match.id}  on room ${match.name}`);
            //join the room
            socket.join(match.name);
            io.to(match.name).emit('updateQueue', {
                players: getPlayersName(match),
                nb_player_per_match: config.NB_PLAYER_PER_MATCH,
            });
            if (canLaunchMatch(match.id)) {
                console.log(`Start match ${match.id} on room ${match.name}`);
                const initialGameState = startMatch(match.id);
                io.to(match.name).emit('matchFound', initialGameState);
            }
        } catch (error) {
            if (error instanceof Error) {
                console.log('ERROR:', { type: error.name, message: error.message })
                socket.emit('error', { type: error.name, message: error.message });
            }
        }
    });

    socket.on('cancelQueue', () => {
        try {
            const playerId = socket.id;
            const match = leaveMatch(playerId);
            socket.leave(match.name);
            io.to(match.name).emit('updateQueue', {
                players: getPlayersName(match),
                nb_player_per_match: config.NB_PLAYER_PER_MATCH,
            });
        } catch (error) {
            if (error instanceof Error) {
                console.log('ERROR:', { type: error.name, message: error.message })
                socket.emit('error', { type: error.name, message: error.message });
            }
        }
    });

    socket.on('requestGameState', () => {
        try {
            const playerId = socket.id;
            console.log(`Sending gameState to ${playerId}`);
            const initialGameState = getFirstGame(playerId);
            socket.emit('gameState', initialGameState);
        } catch (error) {
            if (error instanceof Error) {
                console.log('ERROR:', { type: error.name, message: error.message })
                socket.emit('error', { type: error.name, message: error.message });
            }
        }
    });

    socket.on('revealCell', ({ x, y }) => {
        try {
            const playerId = socket.id;
            const matchName = getMatchFromPlayerId(playerId).name;
            console.log(`Received revealCell event from ${playerId}: (${x}, ${y}) in match ${matchName}`);
            const matchId = playerAssigment[playerId];
            const result = playPlayerAction(playerId, x, y);
            socket.emit('gameUpdate', result);
            io.to(matchName).emit('matchProgress', getMatchProgress(matchId));
            console.log(`Sending gameUpdate to ${matchName}`);
            const ending = havePlayersWinMatch(matchId);
            if (ending.winner && ending.winner.length === 1) {
                // Match end only one player left
                io.to(matchName).emit('matchStatus', ending);
            }
        } catch (error) {
            if (error instanceof Error) {
                console.log('ERROR:', { type: error.name, message: error.message })
                socket.emit('error', { type: error.name, message: error.message });
            }
        }
    });

    socket.on('isGridValid', ({ cells }) => {
        try {
            const playerId = socket.id;
            const match = getMatchFromPlayerId(playerId);
            console.log(`Received isGridValid event from ${playerId} in match ${match.name}`);
            const result = hasPlayerWinGame(playerId, cells);
            socket.emit('gameStatus', result); // TODO: send a timer here or store timer in the front ???
            if (result.win)
                io.to(match.name).emit('timerStart', {
                    level: match.curLevel - 1,
                    time: getPlayerRemainingTime(playerId),
                });
        } catch (error) {
            if (error instanceof Error) {
                console.log('ERROR:', { type: error.name, message: error.message })
                socket.emit('error', { type: error.name, message: error.message });
            }
        }
    });

    socket.on('disconnect', () => {
        try {
            const playerId = socket.id;
            const match = leaveMatch(playerId);
            socket.leave(match.name);
            io.to(match.name).emit('updateQueue', {
                players: getPlayersName(match),
                nb_player_per_match: config.NB_PLAYER_PER_MATCH,
            });
            console.log(`Player disconnected: ${socket.id}`);
        } catch (error) {
            if (error instanceof Error) {
                console.log('ERROR:', { type: error.name, message: error.message })
                socket.emit('error', { type: error.name, message: error.message });
            }
        }
    });
});

server.listen(3000, () => console.log('Server running on port 3000'));
