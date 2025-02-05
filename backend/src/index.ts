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
    getMatchFromPlayer,
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

        //join the room
        socket.join(match.name);
        io.to(match.name).emit('updateQueue', {
            players: getPlayersName(match),
            nb_player_per_match: config.NB_PLAYER_PER_MATCH,
        });
        if (canLaunchMatch(match.id)) {
            console.log(`Start match ${match.id}`);
            const initialGameState = startMatch(match.id);
            io.to(match.name).emit('matchFound', initialGameState);
        }
    });

    socket.on('cancelQueue', () => {
        var playerId = socket.id;
        var rep = leaveMatch(playerId);
        if (rep.error || !rep.match) return;
        socket.leave(rep.match.name);
        io.to(rep.match.name).emit('updateQueue', {
            players: getPlayersName(rep.match),
            nb_player_per_match: config.NB_PLAYER_PER_MATCH,
        });
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
        const matchName = getMatchFromPlayer(playerId)?.name;
        console.log(`Received revealCell event from ${playerId}: (${x}, ${y})`);
        const result = playPlayerAction(playerId, x, y);
        socket.emit('gameUpdate', result);
        const ending = havePlayersWinMatch(matchId);
        if (ending.winner && ending.winner.length === 1 && matchName) {
            io.to(matchName).emit('gameStatus', ending);        //TODO: handle case with no matchName
        }
    });

    socket.on('isGridValid', ({ cells }) => {   // Maybe change the name of the event to checkGrid
        var playerId = socket.id;
        console.log(`Received isGridValid event from ${playerId}`);
        const result = hasPlayerWinGame(playerId, cells);
        socket.emit('gameStatus', result);
        const matchName = getMatchFromPlayer(playerId)?.name;
        if (result.win && matchName) {
            io.to(matchName).emit('timerStart', { time: 0 }); //TODO: handle case with no matchName 
        }
    });

    socket.on('disconnect', () => {
        var playerId = socket.id;
        var rep = leaveMatch(playerId);         //Same code as updateQueue
        if (rep.error || !rep.match) return;
        socket.leave(rep.match.name);
        io.to(rep.match.name).emit('updateQueue', {
            players: getPlayersName(rep.match),
            nb_player_per_match: config.NB_PLAYER_PER_MATCH,
        });
        console.log(`Player disconnected: ${socket.id}`);
    });
});

server.listen(3000, () => console.log('Server running on port 3000'));
