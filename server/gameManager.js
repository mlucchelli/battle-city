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
                playerPositions: {},
                bullets: [],
                playerStates: {} // Track player health/destroyed state
            }
        };

        // Initialize host player position and state
        room.gameState.playerPositions[socket.id] = {
            x: 4, y: 12, direction: 'up', role: 'host'
        };
        room.gameState.playerStates[socket.id] = {
            health: 1,
            isDestroyed: false,
            respawnTime: null
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
        
        // Initialize guest player position and state
        room.gameState.playerPositions[socket.id] = {
            x: 8, y: 12, direction: 'up', role: 'guest'
        };
        room.gameState.playerStates[socket.id] = {
            health: 1,
            isDestroyed: false,
            respawnTime: null
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
        
        // Clean up player data
        delete room.gameState.playerPositions[socketId];
        delete room.gameState.playerStates[socketId];
        
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

    // Enhanced movement with tank-tank collision detection
    movePlayer(socketId, direction, delta) {
        const connection = this.playerConnections.get(socketId);
        if (!connection) return null;

        const room = this.rooms.get(connection.pin);
        if (!room || room.status !== 'ready') return null;

        const playerPos = room.gameState.playerPositions[socketId];
        const playerState = room.gameState.playerStates[socketId];
        if (!playerPos || !playerState) return null;

        // Don't allow movement if player is destroyed
        if (playerState.isDestroyed) {
            console.log(`🚫 Movement blocked: Player ${socketId} is destroyed`);
            return null;
        }

        // Calculate new position
        const newX = Math.max(0, Math.min(12, playerPos.x + delta.x));
        const newY = Math.max(0, Math.min(12, playerPos.y + delta.y));

        // Check if position is valid (boundaries + tank-tank collision)
        if (this.isValidPosition(newX, newY, room, socketId)) {
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

        console.log(`🚫 Movement blocked: Invalid position (${newX}, ${newY})`);
        return null;
    }

    // Enhanced collision detection with tank-tank collision
    isValidPosition(x, y, room, playerId) {
        // Check map boundaries
        if (x < 0 || x > 12 || y < 0 || y > 12) {
            return false;
        }

        // Check tank-tank collision - prevent players from occupying same grid cell
        for (const [otherPlayerId, otherPos] of Object.entries(room.gameState.playerPositions)) {
            if (otherPlayerId !== playerId) {
                const otherPlayerState = room.gameState.playerStates[otherPlayerId];
                // Only check collision with non-destroyed players
                if (!otherPlayerState.isDestroyed && otherPos.x === x && otherPos.y === y) {
                    console.log(`🚫 Tank-tank collision: Position (${x}, ${y}) occupied by ${otherPlayerId}`);
                    return false;
                }
            }
        }

        // TODO: Add collision with terrain (brick, steel, etc.)

        return true;
    }

    // Handle bullet shooting
    shootBullet(socketId, bulletData) {
        // Get player connection info
        const connection = this.playerConnections.get(socketId);
        if (!connection) {
            console.log(`🔫 Shoot failed: Player ${socketId} not found in connections`);
            return null;
        }

        // Get room
        const room = this.rooms.get(connection.pin);
        if (!room) {
            console.log(`🔫 Shoot failed: Room ${connection.pin} not found`);
            return null;
        }

        // Check if game is ready
        if (room.status !== 'ready') {
            console.log(`🔫 Shoot failed: Game not ready in room ${connection.pin}`);
            return null;
        }

        // Check if player exists in room
        if (!room.players.includes(socketId)) {
            console.log(`🔫 Shoot failed: Player ${socketId} not in room ${connection.pin}`);
            return null;
        }

        // Check if player is destroyed
        const playerState = room.gameState.playerStates[socketId];
        if (playerState && playerState.isDestroyed) {
            console.log(`🔫 Shoot failed: Player ${socketId} is destroyed`);
            return null;
        }

        // Initialize bullets array if it doesn't exist
        if (!room.gameState.bullets) {
            room.gameState.bullets = [];
        }

        // Enforce 1 bullet per player limit
        const existingBulletIndex = room.gameState.bullets.findIndex(bullet => bullet.playerId === socketId);
        if (existingBulletIndex !== -1) {
            console.log(`🔫 Shoot failed: Player ${socketId} already has a bullet active`);
            return null;
        }

        // Create bullet object with unique ID and player info
        const bullet = {
            id: `${socketId}_${Date.now()}`,
            playerId: socketId,
            x: bulletData.x,
            y: bulletData.y,
            direction: bulletData.direction,
            speed: bulletData.speed || 4, // Default speed if not provided
            createdAt: Date.now()
        };

        // Add bullet to room's game state
        room.gameState.bullets.push(bullet);

        console.log(`🔫 Bullet created: ${bullet.id} by player ${socketId} in room ${connection.pin}`);
        console.log(`📊 Room ${connection.pin} now has ${room.gameState.bullets.length} active bullets`);

        // Return success with room pin for broadcasting
        return {
            success: true,
            pin: connection.pin,
            bullet: bullet
        };
    }

    // Remove bullet when it's destroyed/expired
    removeBullet(socketId, bulletId) {
        const connection = this.playerConnections.get(socketId);
        if (!connection) return null;

        const room = this.rooms.get(connection.pin);
        if (!room || !room.gameState.bullets) return null;

        const bulletIndex = room.gameState.bullets.findIndex(bullet => bullet.id === bulletId);
        if (bulletIndex === -1) return null;

        // Remove bullet from array
        const removedBullet = room.gameState.bullets.splice(bulletIndex, 1)[0];
        
        console.log(`🔫 Bullet removed: ${bulletId} from room ${connection.pin}`);
        console.log(`📊 Room ${connection.pin} now has ${room.gameState.bullets.length} active bullets`);

        return {
            success: true,
            pin: connection.pin,
            bulletId: bulletId
        };
    }

    // Handle bullet-tank collision
    handleBulletTankCollision(socketId, bulletId, targetPlayerId) {
        const connection = this.playerConnections.get(socketId);
        if (!connection) return null;

        const room = this.rooms.get(connection.pin);
        if (!room) return null;

        // Find and remove the bullet
        const bulletIndex = room.gameState.bullets.findIndex(bullet => bullet.id === bulletId);
        if (bulletIndex === -1) return null;

        const bullet = room.gameState.bullets.splice(bulletIndex, 1)[0];

        // Get target player state
        const targetPlayerState = room.gameState.playerStates[targetPlayerId];
        if (!targetPlayerState) return null;

        // Don't hit already destroyed players
        if (targetPlayerState.isDestroyed) return null;

        // "Destroy" the target player (in Battle City, one hit destroys)
        targetPlayerState.isDestroyed = true;
        targetPlayerState.respawnTime = Date.now() + 3000; // 3 second respawn delay

        console.log(`💥 Bullet-Tank collision: Bullet ${bulletId} hit player ${targetPlayerId}`);
        console.log(`☠️ Player ${targetPlayerId} destroyed, respawning in 3 seconds`);

        return {
            success: true,
            pin: connection.pin,
            bulletId: bulletId,
            targetPlayerId: targetPlayerId,
            collision: 'bullet-tank'
        };
    }

    // Handle player respawn
    respawnPlayer(playerId) {
        const connection = this.playerConnections.get(playerId);
        if (!connection) return null;

        const room = this.rooms.get(connection.pin);
        if (!room) return null;

        const playerState = room.gameState.playerStates[playerId];
        const playerPos = room.gameState.playerPositions[playerId];
        
        if (!playerState || !playerPos) return null;

        // Check if respawn time has passed
        if (!playerState.isDestroyed || playerState.respawnTime > Date.now()) {
            return null;
        }

        // Reset player state
        playerState.isDestroyed = false;
        playerState.health = 1;
        playerState.respawnTime = null;

        // Reset position to spawn point
        if (playerPos.role === 'host') {
            playerPos.x = 4;
            playerPos.y = 12;
        } else {
            playerPos.x = 8;
            playerPos.y = 12;
        }
        playerPos.direction = 'up';

        console.log(`🔄 Player ${playerId} respawned at (${playerPos.x}, ${playerPos.y})`);

        return {
            success: true,
            pin: connection.pin,
            playerId: playerId,
            position: { x: playerPos.x, y: playerPos.y },
            direction: playerPos.direction
        };
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

    // Update game state - check for respawns, etc.
    updateGameState() {
        for (const [pin, room] of this.rooms.entries()) {
            if (room.status === 'ready') {
                // Check for players ready to respawn
                for (const [playerId, playerState] of Object.entries(room.gameState.playerStates)) {
                    if (playerState.isDestroyed && 
                        playerState.respawnTime && 
                        playerState.respawnTime <= Date.now()) {
                        
                        // Auto-respawn player
                        this.respawnPlayer(playerId);
                        
                        // TODO: Emit respawn event to clients
                    }
                }
            }
        }
    }
}

module.exports = GameManager;