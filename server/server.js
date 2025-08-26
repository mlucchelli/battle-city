const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const path = require('path');
const GameManager = require('./gameManager');

const app = express();
const server = http.createServer(app);

// Configure CORS for Socket.IO
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from client directory
app.use(express.static(path.join(__dirname, '../client')));
app.use('/graphics', express.static(path.join(__dirname, '../graphics')));

// Initialize game manager
const gameManager = new GameManager();

// Socket.IO connection handling
io.on('connection', (socket) => {
    console.log(`Player connected: ${socket.id}`);

    // Handle create game
    socket.on('create-game', () => {
        const result = gameManager.createRoom(socket);
        console.log(`Room created: ${result.pin} by ${socket.id}`);
        
        socket.emit('game-created', result);
        
        // Notify room about player count
        socket.to(result.pin).emit('room-update', {
            playerCount: 1,
            status: 'waiting'
        });
    });

    // Handle join game
    socket.on('join-game', (data) => {
        const { pin } = data;
        const result = gameManager.joinRoom(socket, pin);
        
        if (result.success) {
            console.log(`Player ${socket.id} joined room ${result.pin}`);
            
            socket.emit('game-joined', result);
            
            // Notify all players in room
            io.to(result.pin).emit('room-update', {
                playerCount: result.playerCount,
                status: result.status
            });
            
            // If room is now ready, notify all players
            if (result.status === 'ready') {
                io.to(result.pin).emit('game-ready', {
                    message: 'Both players connected! Game ready to start.',
                    playerCount: result.playerCount
                });
            }
        } else {
            console.log(`Failed to join room: ${result.error}`);
            socket.emit('join-error', result);
        }
    });

    // Handle get room info
    socket.on('get-room-info', (data) => {
        const { pin } = data;
        const roomInfo = gameManager.getRoomInfo(pin);
        
        socket.emit('room-info', roomInfo);
    });

    // Handle disconnect
    socket.on('disconnect', () => {
        console.log(`Player disconnected: ${socket.id}`);
        
        const result = gameManager.removePlayer(socket.id);
        if (result) {
            // Notify remaining players
            socket.to(result.pin).emit('player-disconnected', {
                message: 'Player disconnected',
                playerCount: result.remainingPlayers
            });
        }
    });

    // Handle player movement
    socket.on('player-move', (data) => {
        const { direction, delta, playerRole } = data;
        console.log(`🎮 Player ${socket.id} (${playerRole}) moving ${direction}:`, delta);
        
        const moveResult = gameManager.movePlayer(socket.id, direction, delta);
        if (moveResult) {
            // Broadcast movement to all players in the room
            io.to(moveResult.pin).emit('player-moved', moveResult);
            console.log(`📡 Broadcasting movement to room ${moveResult.pin}`);
        }
    });

    // Handle ping for connection testing
    socket.on('ping', () => {
        socket.emit('pong');
    });
});

// Cleanup old rooms every 5 minutes
setInterval(() => {
    gameManager.cleanupOldRooms();
}, 5 * 60 * 1000);

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/index.html'));
});

app.get('/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        activeRooms: gameManager.rooms.size,
        timestamp: new Date().toISOString()
    });
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`🚀 Battle City server running on port ${PORT}`);
    console.log(`🌐 Game available at: http://localhost:${PORT}`);
});

module.exports = { app, server, io };