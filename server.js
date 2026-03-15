const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

// "Память" сервера: здесь мы храним текущее видео и время для каждой комнаты
const roomsState = {};

io.on('connection', (socket) => {
    
    // Когда зритель заходит в комнату
    socket.on('join_room', (roomId) => { 
        socket.join(roomId); 
        
        // Если для этой комнаты еще нет данных, создаем их
        if (!roomsState[roomId]) {
            roomsState[roomId] = {
                videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
                time: 0
            };
        }
        // Отправляем зрителю текущее состояние комнаты (чтобы видео не слетало)
        socket.emit('sync_state', roomsState[roomId]);
    });
    
    // --- СИНХРОНИЗАЦИЯ ВИДЕО ---

    socket.on('change_video', (data) => { 
        // Запоминаем новую ссылку и сбрасываем время
        if (roomsState[data.roomId]) {
            roomsState[data.roomId].videoUrl = data.videoUrl;
            roomsState[data.roomId].time = 0;
        }
        socket.to(data.roomId).emit('change_video', data.videoUrl); 
    });

    socket.on('play_video', (data) => { 
        if (roomsState[data.roomId]) roomsState[data.roomId].time = data.time;
        socket.to(data.roomId).emit('play_video', data.time); 
    });

    socket.on('pause_video', (roomId) => { 
        socket.to(roomId).emit('pause_video'); 
    });
    
    socket.on('seek_video', (data) => { 
        if (roomsState[data.roomId]) roomsState[data.roomId].time = data.time;
        socket.to(data.roomId).emit('seek_video', data.time); 
    });

    // --- ЧАТ ---
    // Сервер просто передает сообщение другим участникам, не сохраняя его у себя
    socket.on('chat_message', (data) => {
        socket.to(data.roomId).emit('chat_message', data.message);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
});
