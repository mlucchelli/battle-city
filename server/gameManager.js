class GameManager {
    constructor() {
        this.rooms = new Map();
        this.playerConnections = new Map();
    }

    generatePIN() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let pin = '';
        for (let i = 0; i < 5; i++) {
            pin += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        
        // Ensure PIN is unique
        if (this.rooms.has(pin)) {
            return this.generatePIN();
        }
        
        return pin;
    }

    createRoom(socket) {
        const pin = this.generatePIN();
        const room = {
            pin: pin,
            players: [socket.id],
            maxPlayers: 2,
            status: 'waiting',
            createdAt: Date.now(),
            gameState: {
                playerPositions: {}
            }
        };

        // Initialize host player position
        room.gameState.playerPositions[socket.id] = {
            x: 4, y: 12, direction: 'up', role: 'host'
        };

        this.rooms.set(pin, room);
        this.playerConnections.set(socket.id, { pin, isHost: true });

        socket.join(pin);
        
        return {
            success: true,
            pin: pin,
            role: 'host',
            status: 'waiting'
        };
    }

    joinRoom(socket, pin) {
        const room = this.rooms.get(pin.toUpperCase());
        
        if (!room) {
            return { success: false, error: 'Room not found' };
        }

        if (room.players.length >= room.maxPlayers) {
            return { success: false, error: 'Room is full' };
        }

        if (room.players.includes(socket.id)) {
            return { success: false, error: 'Already in room' };
        }

        // Add player to room
        room.players.push(socket.id);
        room.status = room.players.length === room.maxPlayers ? 'ready' : 'waiting';
        
        // Initialize guest player position
        room.gameState.playerPositions[socket.id] = {
            x: 8, y: 12, direction: 'up', role: 'guest'
        };
        
        this.playerConnections.set(socket.id, { pin: pin.toUpperCase(), isHost: false });
        socket.join(pin.toUpperCase());

        return {
            success: true,
            pin: pin.toUpperCase(),
            role: 'guest',
            status: room.status,
            playerCount: room.players.length
        };
    }

    getRoom(pin) {
        return this.rooms.get(pin);
    }

    removePlayer(socketId) {
        const connection = this.playerConnections.get(socketId);
        if (!connection) return;

        const room = this.rooms.get(connection.pin);
        if (!room) return;

        // Remove player from room
        room.players = room.players.filter(id => id !== socketId);
        
        // If room is empty, delete it
        if (room.players.length === 0) {
            this.rooms.delete(connection.pin);
        } else {
            room.status = 'waiting';
        }

        this.playerConnections.delete(socketId);
        
        return {
            pin: connection.pin,
            remainingPlayers: room.players.length
        };
    }

    getRoomInfo(pin) {
        const room = this.rooms.get(pin);
        if (!room) return null;

        return {
            pin: room.pin,
            playerCount: room.players.length,
            maxPlayers: room.maxPlayers,
            status: room.status
        };
    }

    // Handle player movement
    movePlayer(socketId, direction, delta) {
        const connection = this.playerConnections.get(socketId);
        if (!connection) return null;

        const room = this.rooms.get(connection.pin);
        if (!room || room.status !== 'ready') return null;

        const playerPos = room.gameState.playerPositions[socketId];
        if (!playerPos) return null;

        // Calculate new position
        const newX = Math.max(0, Math.min(12, playerPos.x + delta.x));
        const newY = Math.max(0, Math.min(12, playerPos.y + delta.y));

        // Check bounds and basic collision
        if (this.isValidPosition(newX, newY, room)) {
            playerPos.x = newX;
            playerPos.y = newY;
            playerPos.direction = direction;

            return {
                playerId: socketId,
                position: { x: newX, y: newY },
                direction: direction,
                pin: connection.pin
            };
        }

        return null;
    }

    // Basic collision detection (just boundaries for now)
    isValidPosition(x, y, room) {
        // Check map boundaries
        if (x < 0 || x > 12 || y < 0 || y > 12) {
            return false;
        }

        // TODO: Add collision with other players
        // TODO: Add collision with terrain

        return true;
    }

    // Get all player positions in a room
    getRoomGameState(pin) {
        const room = this.rooms.get(pin);
        if (!room) return null;
        
        return room.gameState;
    }

    // Clean up old rooms (older than 10 minutes)
    cleanupOldRooms() {
        const tenMinutesAgo = Date.now() - (10 * 60 * 1000);
        
        for (const [pin, room] of this.rooms.entries()) {
            if (room.createdAt < tenMinutesAgo) {
                this.rooms.delete(pin);
                // Clean up player connections for this room
                for (const [socketId, connection] of this.playerConnections.entries()) {
                    if (connection.pin === pin) {
                        this.playerConnections.delete(socketId);
                    }
                }
            }
        }
    }
}

module.exports = GameManager;