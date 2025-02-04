import { Socket, Server } from 'socket.io';
import express from 'express';
import http from 'http';
import {
    leaveMatch,
    canLaunchMatch,
    findMatch,
    getFirstGame,
    havePlayerWinGame,
    playPlayerAction,
    startMatch,
    getPlayersName,
    havePlayerWinMatch,
    playerAssigment,
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
        var playerId = socket.id;
        var match = findMatch(playerId, playerName);
        if (match === undefined)
            // player already in a queue
            return;
        console.log(`Add player ${playerId} into match : ${match.id}`);
        io.emit('updateQueue', {
            // TODO: don't send to every player connect
            players: getPlayersName(match),
            nb_player_per_match: config.NB_PLAYER_PER_MATCH,
        });
        if (canLaunchMatch(match.id)) {
            console.log(`Start match ${match.id}`);
            const initialGameState = startMatch(match.id);
            io.emit('matchFound', initialGameState); // TODO: don't send to every player connect
        }
    });

    socket.on('cancelQueue', () => {
        var playerId = socket.id;
        var rep = leaveMatch(playerId);
        if (rep.error || !rep.match) return;
        io.emit('updateQueue', {
            players: getPlayersName(rep.match),
            nb_player_per_match: config.NB_PLAYER_PER_MATCH,
        }); // TODO: don't send to every player connect
    });

    socket.on('requestGameState', () => {
        var playerId = socket.id;
        console.log(`Sending gameState to ${playerId}`);
        const initialGameState = getFirstGame(playerId);
        socket.emit('gameState', initialGameState);
    });

    socket.on('revealCell', ({ x, y }) => {
        var playerId = socket.id;
        var matchId = playerAssigment[playerId];
        console.log(`Received revealCell event from ${playerId}: (${x}, ${y})`);
        const result = playPlayerAction(playerId, x, y);
        socket.emit('gameUpdate', result);
        const ending = havePlayerWinMatch(matchId);
        if (ending.winner && ending.winner.length === 1) {
            io.emit('gameStatus', ending);
        }
    });

    socket.on('isGridValid', ({ cells }) => {
        var playerId = socket.id;
        console.log(`Received isGridValid event from ${playerId}`);
        const result = havePlayerWinGame(playerId, cells);
        socket.emit('gameStatus', result);
        if (result.win) io.emit('timerStart', { time: 0 }); // TODO: don't send to every player connect
    });

    socket.on('disconnect', () => {
        var playerId = socket.id;
        leaveMatch(playerId);
        console.log(`Player disconnected: ${socket.id}`);
    });
});

server.listen(3000, () => console.log('Server running on port 3000'));
