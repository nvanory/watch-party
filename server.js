const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

io.on('connection', (socket) => {
    socket.on('join_room', (roomId) => { socket.join(roomId); });
    
    socket.on('play_video', (data) => { socket.to(data.roomId).emit('play_video', data.time); });
    socket.on('pause_video', (roomId) => { socket.to(roomId).emit('pause_video'); });
    
    // Новое: обработка перемотки видео
    socket.on('seek_video', (data) => { socket.to(data.roomId).emit('seek_video', data.time); });
    
    socket.on('change_video', (data) => { socket.to(data.roomId).emit('change_video', data.videoUrl); });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
});
