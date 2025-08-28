// Game.js - Core game logic and Canvas management for Battle City Modern

const Game = {
    canvas: null,
    ctx: null,
    isRunning: false,
    
    // Game state
    gameState: 'menu', // menu, lobby, playing, paused, ended
    
    // Canvas settings
    canvasWidth: 832,
    canvasHeight: 832,
    gridSize: 64,
    gridWidth: 13,
    gridHeight: 13,

    // Game objects
    players: {
        player1: {
            gridX: 4, gridY: 12,      // Logic position (grid)
            visualX: 256, visualY: 768, // Visual position (pixels)  
            targetX: 256, targetY: 768, // Target for smooth movement
            direction: 'up',
            color: 'yellow',
            animFrame: 0,
            isMoving: false,
            isDestroyed: false,
            respawnTime: null
        },
        player2: {
            gridX: 8, gridY: 12,      // Logic position (grid) 
            visualX: 512, visualY: 768, // Visual position (pixels)
            targetX: 512, targetY: 768, // Target for smooth movement
            direction: 'up',
            color: 'green', 
            animFrame: 0,
            isMoving: false,
            isDestroyed: false,
            respawnTime: null
        }
    },

    bullets: [], // Array to store active bullets

    animationTime: 0,
    moveSpeed: 1.5, // pixels per frame for heavy tank movement
    bulletSpeed: 4, // pixels per frame - bullets move faster than tanks

    // Collision detection constants
    TANK_SIZE: 64,
    BULLET_SIZE: 16,

    init() {
        console.log('🎮 Initializing Game...');
        this.setupCanvas();
        this.setupEventListeners();
    },

    setupCanvas() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Set canvas size
        this.canvas.width = this.canvasWidth;
        this.canvas.height = this.canvasHeight;
        
        // Configure context for pixel art
        this.ctx.imageSmoothingEnabled = false;
        this.ctx.mozImageSmoothingEnabled = false;
        this.ctx.webkitImageSmoothingEnabled = false;
        this.ctx.msImageSmoothingEnabled = false;
        
        console.log('✅ Canvas setup complete:', this.canvasWidth + 'x' + this.canvasHeight);
    },

    setupEventListeners() {
        // Keyboard event listeners for game controls
        document.addEventListener('keydown', (e) => {
            if (this.gameState === 'playing') {
                this.handleKeyDown(e);
            }
        });

        document.addEventListener('keyup', (e) => {
            if (this.gameState === 'playing') {
                this.handleKeyUp(e);
            }
        });

        // Prevent page scrolling with arrow keys when game is active
        document.addEventListener('keydown', (e) => {
            if (this.gameState === 'playing' && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
                e.preventDefault();
            }
        });
    },

    start() {
        console.log('🚀 Starting game...');
        this.gameState = 'playing';
        this.isRunning = true;
        
        // Initialize game objects
        this.initializeGameObjects();
        
        // Start game loop
        this.gameLoop();
        
        // Show controls hint
        UI.showToast('Use Arrow Keys to move, Spacebar to shoot', 'info', 5000);
    },

    stop() {
        console.log('⏹️ Stopping game...');
        this.isRunning = false;
        this.gameState = 'menu';
    },

    initializeGameObjects() {
        console.log('🎯 Initializing game objects...');
        
        // Initialize players at starting positions with smooth movement
        this.players.player1 = {
            gridX: 4, gridY: 12,
            visualX: 4 * 64, visualY: 12 * 64,
            targetX: 4 * 64, targetY: 12 * 64,
            direction: 'up',
            color: 'yellow',
            animFrame: 0,
            isMoving: false,
            isDestroyed: false,
            respawnTime: null
        };
        
        this.players.player2 = {
            gridX: 8, gridY: 12,
            visualX: 8 * 64, visualY: 12 * 64, 
            targetX: 8 * 64, targetY: 12 * 64,
            direction: 'up',
            color: 'green',
            animFrame: 0,
            isMoving: false,
            isDestroyed: false,
            respawnTime: null
        };
        
        console.log('✅ Game objects initialized');
        console.log('🟡 Player 1 (Yellow):', this.players.player1);
        console.log('🟢 Player 2 (Green):', this.players.player2);
    },

    gameLoop() {
        if (!this.isRunning) return;
        
        // Update game logic
        this.update();
        
        // Render game
        this.render();
        
        // Continue loop
        requestAnimationFrame(() => this.gameLoop());
    },

    update() {
        // Update animation time for sprite animations
        this.animationTime += 16; // Assuming 60fps (16ms per frame)
        
        // Update smooth movement for both players
        this.updateSmoothMovement(this.players.player1);
        this.updateSmoothMovement(this.players.player2);
        
        // Update tank animation frames (fast animation when moving)
        if (this.animationTime > (this.players.player1.isMoving || this.players.player2.isMoving ? 150 : 500)) {
            this.players.player1.animFrame = (this.players.player1.animFrame + 1) % 2;
            this.players.player2.animFrame = (this.players.player2.animFrame + 1) % 2;
            this.animationTime = 0;
        }
        
        // Update bullets physics and check collisions
        this.updateBullets();
        
        // Handle respawns
        this.updateRespawns();
    },

    updateSmoothMovement(player) {
        // Check if player is moving towards target
        if (player.visualX !== player.targetX || player.visualY !== player.targetY) {
            player.isMoving = true;

            // Calculate movement deltas
            const deltaX = player.targetX - player.visualX;
            const deltaY = player.targetY - player.visualY;
            
            // Log only significant movement changes (reduced spam)
            if (Math.abs(deltaX) > 32 || Math.abs(deltaY) > 32) {
                console.log(`🔄 Moving: (${player.visualX}, ${player.visualY}) -> (${player.targetX}, ${player.targetY})`);
            }

            // Move towards target with fixed speed
            if (Math.abs(deltaX) > this.moveSpeed) {
                player.visualX += deltaX > 0 ? this.moveSpeed : -this.moveSpeed;
            } else {
                player.visualX = player.targetX;
            }

            if (Math.abs(deltaY) > this.moveSpeed) {
                player.visualY += deltaY > 0 ? this.moveSpeed : -this.moveSpeed;
            } else {
                player.visualY = player.targetY;
            }

            // Check if arrived at target
            if (player.visualX === player.targetX && player.visualY === player.targetY) {
                player.isMoving = false;
                console.log(`✅ Arrived at target: (${player.visualX}, ${player.visualY})`);
            }
        } else {
            player.isMoving = false;
        }
    },

    updateBullets() {
        // Update bullet positions and check for collisions
        this.bullets = this.bullets.filter(bullet => {
            // Move bullet
            bullet.x += bullet.deltaX;
            bullet.y += bullet.deltaY;
            
            // Check boundary collisions (remove bullets that hit edges)
            if (bullet.x < 0 || bullet.x > this.canvasWidth || 
                bullet.y < 0 || bullet.y > this.canvasHeight) {
                console.log(`💥 Bullet ${bullet.id} hit boundary - destroyed`);
                
                // Send bullet destruction to server
                if (Network.socket && Network.isConnected) {
                    Network.sendBulletDestroy(bullet.id, Network.playerRole);
                }
                
                return false; // Remove bullet
            }
            
            // Check bullet-tank collisions
            const collision = this.checkBulletTankCollision(bullet);
            if (collision.hit) {
                console.log(`💥 Bullet-Tank collision detected: ${bullet.id} hit ${collision.targetPlayerId}`);
                
                // Send collision event to server
                if (Network.socket && Network.isConnected) {
                    Network.socket.emit('bullet-tank-collision', {
                        bulletId: bullet.id,
                        targetPlayerId: collision.targetPlayerId,
                        playerRole: Network.playerRole
                    });
                }
                
                return false; // Remove bullet
            }
            
            return true; // Keep bullet
        });
    },

    updateRespawns() {
        // Handle local player respawn timers (visual feedback)
        for (const playerKey in this.players) {
            const player = this.players[playerKey];
            if (player.isDestroyed && player.respawnTime && Date.now() >= player.respawnTime) {
                // Reset local player state (server will handle actual respawn)
                player.isDestroyed = false;
                player.respawnTime = null;
                console.log(`🔄 Local respawn timer cleared for ${playerKey}`);
            }
        }
    },

    // COLLISION DETECTION METHODS

    // Check bullet-tank collision using AABB (Axis-Aligned Bounding Box)
    checkBulletTankCollision(bullet) {
        // Check collision with both players
        for (const playerKey in this.players) {
            const player = this.players[playerKey];
            
            // Skip destroyed players
            if (player.isDestroyed) continue;
            
            // Skip self-collision (bullet hitting the player who shot it)
            if (bullet.playerId === this.getPlayerIdFromKey(playerKey)) {
                continue;
            }
            
            // AABB collision detection
            if (this.checkAABBCollision(
                bullet.x - this.BULLET_SIZE / 2, bullet.y - this.BULLET_SIZE / 2, this.BULLET_SIZE, this.BULLET_SIZE,
                player.visualX, player.visualY, this.TANK_SIZE, this.TANK_SIZE
            )) {
                return {
                    hit: true,
                    targetPlayer: player,
                    targetPlayerKey: playerKey,
                    targetPlayerId: this.getPlayerIdFromKey(playerKey)
                };
            }
        }
        
        return { hit: false };
    },

    // AABB collision detection utility
    checkAABBCollision(x1, y1, w1, h1, x2, y2, w2, h2) {
        return (
            x1 < x2 + w2 &&
            x1 + w1 > x2 &&
            y1 < y2 + h2 &&
            y1 + h1 > y2
        );
    },

    // Check tank-tank collision (grid-based)
    checkTankTankCollision(gridX, gridY, excludePlayerKey) {
        for (const playerKey in this.players) {
            if (playerKey === excludePlayerKey) continue;
            
            const player = this.players[playerKey];
            
            // Skip destroyed players
            if (player.isDestroyed) continue;
            
            // Check if positions overlap
            if (player.gridX === gridX && player.gridY === gridY) {
                return true;
            }
        }
        
        return false;
    },

    // Get player ID from player key (helper for network communication)
    getPlayerIdFromKey(playerKey) {
        if (playerKey === 'player1' && Network.playerRole === 'host') {
            return Network.socket.id;
        } else if (playerKey === 'player2' && Network.playerRole === 'guest') {
            return Network.socket.id;
        } else {
            // This is the other player
            // We need a way to get their socket ID
            // For now, return a placeholder - this will be handled by server
            return 'other-player';
        }
    },

    render() {
        // Clear canvas
        this.clearCanvas();
        
        // Draw game field
        this.drawGameField();
        
        // Draw tanks (only non-destroyed ones)
        this.drawTanks();
        
        // Draw bullets
        this.drawBullets();
        
        // Draw respawn indicators
        this.drawRespawnIndicators();
    },

    clearCanvas() {
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
    },

    drawGameField() {
        // Draw basic 13x13 grid for Phase 1
        this.ctx.strokeStyle = '#222222';
        this.ctx.lineWidth = 1;
        
        // Draw vertical lines
        for (let x = 0; x <= this.gridWidth; x++) {
            const posX = x * this.gridSize;
            this.ctx.beginPath();
            this.ctx.moveTo(posX, 0);
            this.ctx.lineTo(posX, this.canvasHeight);
            this.ctx.stroke();
        }
        
        // Draw horizontal lines
        for (let y = 0; y <= this.gridHeight; y++) {
            const posY = y * this.gridSize;
            this.ctx.beginPath();
            this.ctx.moveTo(0, posY);
            this.ctx.lineTo(this.canvasWidth, posY);
            this.ctx.stroke();
        }
        
        // Draw center indicator (for reference)
        const centerX = Math.floor(this.gridWidth / 2) * this.gridSize;
        const centerY = Math.floor(this.gridHeight / 2) * this.gridSize;
        
        this.ctx.fillStyle = '#333333';
        this.ctx.fillRect(centerX, centerY, this.gridSize, this.gridSize);
        
        // Draw border
        this.ctx.strokeStyle = '#666666';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(0, 0, this.canvasWidth, this.canvasHeight);
    },

    drawTanks() {
        // Only draw if sprites are loaded
        if (!SpriteManager.isLoaded) {
            console.warn('⚠️ Sprites not loaded, skipping tank rendering');
            return;
        }

        // Draw Player 1 (Yellow Tank) - only if not destroyed
        const player1 = this.players.player1;
        if (!player1.isDestroyed) {
            const success1 = SpriteManager.drawTank(
                this.ctx,
                player1.color,
                player1.direction, 
                player1.visualX,
                player1.visualY,
                player1.animFrame,
                1 // scale
            );

            if (!success1) {
                console.warn('⚠️ Failed to render Player 1 tank');
            }
        }

        // Draw Player 2 (Green Tank) - only if not destroyed
        const player2 = this.players.player2;
        if (!player2.isDestroyed) {
            const success2 = SpriteManager.drawTank(
                this.ctx,
                player2.color,
                player2.direction,
                player2.visualX, 
                player2.visualY,
                player2.animFrame,
                1 // scale
            );

            if (!success2) {
                console.warn('⚠️ Failed to render Player 2 tank');
            }
        }
    },

    drawBullets() {
        if (!SpriteManager.isLoaded) return;

        this.bullets.forEach(bullet => {
            const success = SpriteManager.drawBullet(
                this.ctx,
                bullet.direction,
                bullet.x - 4, // Center bullet (8x8 geometric bullet)
                bullet.y - 4,
                1 // scale
            );

            if (!success) {
                console.warn('⚠️ Failed to render bullet:', bullet);
            }
        });
    },

    drawRespawnIndicators() {
        // Draw respawn countdown for destroyed players
        this.ctx.fillStyle = '#ff0000';
        this.ctx.font = 'bold 20px Arial';
        this.ctx.textAlign = 'center';

        for (const playerKey in this.players) {
            const player = this.players[playerKey];
            if (player.isDestroyed && player.respawnTime) {
                const timeLeft = Math.max(0, Math.ceil((player.respawnTime - Date.now()) / 1000));
                if (timeLeft > 0) {
                    const x = player.gridX * this.gridSize + this.gridSize / 2;
                    const y = player.gridY * this.gridSize + this.gridSize / 2;
                    
                    this.ctx.fillText(`RESPAWN: ${timeLeft}`, x, y);
                }
            }
        }
    },

    // Input handling for tank movement
    handleKeyDown(e) {
        if (this.gameState !== 'playing') return;

        let direction = null;
        let moveCommand = null;

        switch(e.key) {
            case 'ArrowUp':
                direction = 'up';
                moveCommand = { x: 0, y: -1 };
                break;
            case 'ArrowDown':
                direction = 'down';  
                moveCommand = { x: 0, y: 1 };
                break;
            case 'ArrowLeft':
                direction = 'left';
                moveCommand = { x: -1, y: 0 };
                break;
            case 'ArrowRight':
                direction = 'right';
                moveCommand = { x: 1, y: 0 };
                break;
            case ' ':
                e.preventDefault(); // Prevent page scroll
                this.handleShoot();
                break;
            case 'Escape':
                this.togglePause();
                break;
        }

        // Send movement command to server (includes collision validation)
        if (direction && moveCommand) {
            this.sendMoveCommand(direction, moveCommand);
        }
    },

    handleKeyUp() {
        // Handle key releases if needed
        // For continuous movement, this would stop movement
    },

    sendMoveCommand(direction, moveCommand) {
        // Get local player
        const localPlayer = Network.playerRole === 'host' ? this.players.player1 : this.players.player2;
        
        // Don't move if destroyed
        if (localPlayer.isDestroyed) {
            console.log(`🚫 Movement blocked - tank is destroyed`);
            return;
        }
        
        // Update direction immediately for visual responsiveness
        localPlayer.direction = direction;
        
        // Block new movements if already moving - prevents diagonal movement
        if (localPlayer.isMoving) {
            console.log(`🚫 Movement blocked - tank is already moving`);
            return;
        }
        
        // Calculate new grid position
        const newGridX = Math.max(0, Math.min(12, localPlayer.gridX + moveCommand.x));
        const newGridY = Math.max(0, Math.min(12, localPlayer.gridY + moveCommand.y));
        
        // Check local tank-tank collision before moving
        const localPlayerKey = Network.playerRole === 'host' ? 'player1' : 'player2';
        if (this.checkTankTankCollision(newGridX, newGridY, localPlayerKey)) {
            console.log(`🚫 Movement blocked - tank-tank collision at (${newGridX}, ${newGridY})`);
            return;
        }
        
        // Only move if position would actually change
        if (newGridX !== localPlayer.gridX || newGridY !== localPlayer.gridY) {
            localPlayer.gridX = newGridX;
            localPlayer.gridY = newGridY;
            localPlayer.targetX = newGridX * 64;
            localPlayer.targetY = newGridY * 64;
            
            console.log(`🎮 Move ${direction}: Grid (${newGridX}, ${newGridY})`);
        }

        // Send to server (server will validate with additional collision checks)
        if (Network.socket && Network.isConnected) {
            Network.socket.emit('player-move', {
                direction: direction,
                delta: moveCommand,
                playerRole: Network.playerRole
            });
        }
    },

    // Handle movement updates from server
    onPlayerMove(data) {
        const { playerId, position, direction } = data;
        
        // Determine which player to update
        let player = null;
        if (playerId === Network.socket.id) {
            // This is our own movement confirmation - usually ignore since we predict locally
            return;
        } else {
            // This is the other player's movement
            player = Network.playerRole === 'host' ? this.players.player2 : this.players.player1;
        }

        if (player) {
            // Update other player with smooth movement
            player.gridX = position.x;
            player.gridY = position.y; 
            player.direction = direction;
            player.targetX = position.x * 64;
            player.targetY = position.y * 64;
            
            console.log(`📡 Other player moved to (${position.x}, ${position.y}) facing ${direction}`);
        }
    },

    // Handle shooting mechanism
    handleShoot() {
        // Get local player
        const localPlayer = Network.playerRole === 'host' ? this.players.player1 : this.players.player2;
        
        // Don't shoot if destroyed
        if (localPlayer.isDestroyed) {
            console.log('🚫 Cannot shoot - tank is destroyed');
            return;
        }
        
        // Check if player already has a bullet (limit 1 per player)
        const existingBullet = this.bullets.find(bullet => bullet.playerId === Network.socket.id);
        if (existingBullet) {
            console.log('🚫 Cannot shoot - bullet already active');
            return;
        }

        // Calculate bullet starting position (center of tank + offset in direction)
        let bulletX = localPlayer.visualX + 32; // Center of tank (64px / 2)
        let bulletY = localPlayer.visualY + 32;
        let deltaX = 0;
        let deltaY = 0;

        // Set bullet direction and starting offset
        switch(localPlayer.direction) {
            case 'up':
                bulletY -= 16;
                deltaY = -this.bulletSpeed;
                break;
            case 'down':
                bulletY += 16;
                deltaY = this.bulletSpeed;
                break;
            case 'left':
                bulletX -= 16;
                deltaX = -this.bulletSpeed;
                break;
            case 'right':
                bulletX += 16;
                deltaX = this.bulletSpeed;
                break;
        }

        // Create bullet object
        const bullet = {
            id: `${Network.socket.id}_${Date.now()}`,
            playerId: Network.socket.id,
            x: bulletX,
            y: bulletY,
            deltaX: deltaX,
            deltaY: deltaY,
            direction: localPlayer.direction
        };

        // Add bullet locally for immediate feedback
        this.bullets.push(bullet);
        
        console.log(`🔫 Shot bullet ${localPlayer.direction}:`, bullet);

        // Send shoot command to server
        if (Network.socket && Network.isConnected) {
            Network.socket.emit('player-shoot', {
                bullet: bullet,
                playerRole: Network.playerRole
            });
        }
    },

    // Handle bullet updates from server
    onBulletShot(data) {
        const { bullet, playerId } = data;
        
        // If this is not our bullet, add it to the local bullets array
        if (playerId !== Network.socket.id) {
            this.bullets.push(bullet);
            console.log(`📡 Received bullet from other player:`, bullet);
        }
    },

    // Handle bullet destruction from server
    onBulletDestroyed(data) {
        const { bulletId, playerId } = data;
        
        // Remove bullet from local array
        this.bullets = this.bullets.filter(bullet => bullet.id !== bulletId);
        console.log(`📡 Bullet destroyed: ${bulletId}`);
    },

    // Handle bullet-tank collision from server
    onBulletTankCollision(data) {
        const { bulletId, targetPlayerId, collision } = data;
        
        console.log(`💥 Bullet-Tank collision confirmed by server:`, data);
        
        // Remove bullet from local array
        this.bullets = this.bullets.filter(bullet => bullet.id !== bulletId);
        
        // Handle tank destruction
        if (targetPlayerId === Network.socket.id) {
            // Local player was hit
            const localPlayer = Network.playerRole === 'host' ? this.players.player1 : this.players.player2;
            localPlayer.isDestroyed = true;
            localPlayer.respawnTime = Date.now() + 3000; // 3 second respawn
            console.log(`☠️ Local player destroyed, respawning in 3 seconds`);
        } else {
            // Other player was hit
            const otherPlayer = Network.playerRole === 'host' ? this.players.player2 : this.players.player1;
            otherPlayer.isDestroyed = true;
            otherPlayer.respawnTime = Date.now() + 3000; // 3 second respawn
            console.log(`☠️ Other player destroyed, respawning in 3 seconds`);
        }
    },

    // Handle player respawn from server
    onPlayerRespawn(data) {
        const { playerId, position, direction } = data;
        
        console.log(`🔄 Player respawn confirmed by server:`, data);
        
        if (playerId === Network.socket.id) {
            // Local player respawned
            const localPlayer = Network.playerRole === 'host' ? this.players.player1 : this.players.player2;
            localPlayer.isDestroyed = false;
            localPlayer.respawnTime = null;
            localPlayer.gridX = position.x;
            localPlayer.gridY = position.y;
            localPlayer.visualX = position.x * 64;
            localPlayer.visualY = position.y * 64;
            localPlayer.targetX = position.x * 64;
            localPlayer.targetY = position.y * 64;
            localPlayer.direction = direction;
        } else {
            // Other player respawned
            const otherPlayer = Network.playerRole === 'host' ? this.players.player2 : this.players.player1;
            otherPlayer.isDestroyed = false;
            otherPlayer.respawnTime = null;
            otherPlayer.gridX = position.x;
            otherPlayer.gridY = position.y;
            otherPlayer.visualX = position.x * 64;
            otherPlayer.visualY = position.y * 64;
            otherPlayer.targetX = position.x * 64;
            otherPlayer.targetY = position.y * 64;
            otherPlayer.direction = direction;
        }
    },

    togglePause() {
        if (this.gameState === 'playing') {
            this.gameState = 'paused';
            console.log('⏸️ Game paused');
            UI.showToast('Game Paused - Press ESC to resume', 'info');
        } else if (this.gameState === 'paused') {
            this.gameState = 'playing';
            console.log('▶️ Game resumed');
            UI.showToast('Game Resumed', 'success');
        }
    },

    // Utility functions
    gridToPixel(gridX, gridY) {
        return {
            x: gridX * this.gridSize,
            y: gridY * this.gridSize
        };
    },

    pixelToGrid(pixelX, pixelY) {
        return {
            x: Math.floor(pixelX / this.gridSize),
            y: Math.floor(pixelY / this.gridSize)
        };
    },

    isValidGridPosition(x, y) {
        return x >= 0 && x < this.gridWidth && y >= 0 && y < this.gridHeight;
    },

    // Debug functions
    drawDebugInfo() {
        if (this.gameState === 'playing') {
            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = '12px Courier New';
            this.ctx.fillText(`FPS: ${Math.round(60)}`, 10, 20);
            this.ctx.fillText(`State: ${this.gameState}`, 10, 35);
            this.ctx.fillText(`Grid: ${this.gridWidth}x${this.gridHeight}`, 10, 50);
            this.ctx.fillText(`Bullets: ${this.bullets.length}`, 10, 65);
        }
    }
};

// Expose Game globally
window.Game = Game;