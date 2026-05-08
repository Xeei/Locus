import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: '*', // For development
    methods: ['GET', 'POST'],
  },
});

const PORT = process.env.PORT || 3001;

app.get('/health', (req, res) => {
  res.send('VyperionLabs Reflector API Online');
});

io.on('connection', (socket) => {
  console.log(`[+] Client connected: ${socket.id}`);

  // When a user moves their cursor
  socket.on('cursor:move', (data) => {
    // Reflect to everyone else in the same room
    // For now we assume a global room if data.roomId is not provided
    const roomId = data.roomId || 'map:main-workspace';
    socket.to(roomId).emit('cursor:update', {
      ...data,
      id: socket.id, // Ensure the socket ID is correctly populated
    });
  });

  // When a user joins a room explicitly
  socket.on('room:join', (roomId) => {
    socket.join(roomId);
    console.log(`[Room] ${socket.id} joined ${roomId}`);
  });

  socket.on('disconnect', () => {
    console.log(`[-] Client disconnected: ${socket.id}`);
    // Broadcast cursor leave to all rooms this socket was part of
    // Since Socket.io automatically leaves rooms on disconnect, we might need to handle this differently
    // but a simple global broadcast or relying on last known room is sufficient for MVP.
    socket.broadcast.emit('cursor:leave', { id: socket.id });
  });
});

httpServer.listen(PORT, () => {
  console.log(`🚀 VyperionLabs API running on http://localhost:${PORT}`);
});
