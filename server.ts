import cors from 'cors';
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';

const app = express();

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true,
}));

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
        credentials: true,
    },
});

io.on('connection', (socket) => {
    console.log(`Client connected: { Client ID: ${ socket.id }, username: ${ socket.handshake.auth.username } }`);

    socket.on('disconnect', () => {
        console.log(`Client disconnected: { Client ID: ${ socket.id }, username: ${ socket.handshake.auth.username }
         Room: ${ socket.handshake.auth.room }}`);
        socket.to(socket.handshake.auth.room).emit('user-disconnected', {socketId: socket.id});
    });

    socket.on('join', (data) => {
        console.log(`User ${ data.username } joined room ID: ${ data.room }`);
        socket.join(data.room);
        socket.broadcast.to(data.room).emit('user-joined', socket.id);
    });

    socket.on('signal', (data) => {
        const {room, signal} = data;
        console.log(`Sent data to room: ${ room }. From ${ socket.id }`);
        socket.broadcast.to(room).emit('signal', {signal, from: socket.id});
    });
});

const PORT = process.env.PORT ?? 5000;
server.listen(PORT, () => console.log(`Server running on port ${ PORT }`));
