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
                socket.emit("error", { type: error.name, message: error.message });
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
                socket.emit("error", { type: error.name, message: error.message });
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
                socket.emit("error", { type: error.name, message: error.message });
            }
        }
    });

    socket.on('revealCell', ({ x, y }) => {
        try {
            const playerId = socket.id;
            const matchId = playerAssigment[playerId];
            const matchName = getMatchFromPlayerId(playerId).name;
            const result = playPlayerAction(playerId, x, y);
            const ending = havePlayersWinMatch(matchId);
            socket.emit('gameUpdate', result);
            console.log(`Received revealCell event from ${playerId}: (${x}, ${y}) in match ${matchName}`);
            console.log(`Sending gameUpdate to ${matchName}`);
            if (ending.winner && ending.winner.length === 1) { // Match end only one player left
                io.to(matchName).emit('gameStatus', ending);
            }
        } catch (error) {
            if (error instanceof Error) {
                socket.emit("error", { type: error.name, message: error.message });
            }
        }
    });

    socket.on('isGridValid', ({ cells }) => {
        try {
            const playerId = socket.id;
            const result = hasPlayerWinGame(playerId, cells);
            const matchName = getMatchFromPlayerId(playerId).name;
            socket.emit('gameStatus', result);
            console.log(`Received isGridValid event from ${playerId} in match ${matchName}`);
            if (result.win)
                io.to(matchName).emit('timerStart', { time: 0 }); // TODO:change with the left time
        } catch (error) {
            if (error instanceof Error) {
                socket.emit("error", { type: error.name, message: error.message });
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
                socket.emit("error", { type: error.name, message: error.message });
            }
        }
    });
});

server.listen(3000, () => console.log('Server running on port 3000'));
