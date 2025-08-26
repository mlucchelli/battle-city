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
            isMoving: false
        },
        player2: {
            gridX: 8, gridY: 12,      // Logic position (grid) 
            visualX: 512, visualY: 768, // Visual position (pixels)
            targetX: 512, targetY: 768, // Target for smooth movement
            direction: 'up',
            color: 'green', 
            animFrame: 0,
            isMoving: false
        }
    },

    animationTime: 0,
    moveSpeed: 1.5, // pixels per frame for heavy tank movement

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
            isMoving: false
        };
        
        this.players.player2 = {
            gridX: 8, gridY: 12,
            visualX: 8 * 64, visualY: 12 * 64, 
            targetX: 8 * 64, targetY: 12 * 64,
            direction: 'up',
            color: 'green',
            animFrame: 0,
            isMoving: false
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
        
        // TODO: Update bullets (Phase 4)  
        // TODO: Update collision detection (Phase 4)
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

    render() {
        // Clear canvas
        this.clearCanvas();
        
        // Draw game field
        this.drawGameField();
        
        // Draw tanks
        this.drawTanks();
        
        // TODO: Draw bullets (Phase 4)
        // TODO: Draw UI elements (scores, etc.)
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

        // Draw Player 1 (Yellow Tank) - use visual position for smooth movement
        const player1 = this.players.player1;
        
        const success1 = SpriteManager.drawTank(
            this.ctx,
            player1.color,
            player1.direction, 
            player1.visualX,
            player1.visualY,
            player1.animFrame,
            1 // scale
        );

        // Draw Player 2 (Green Tank) - use visual position for smooth movement
        const player2 = this.players.player2;
        
        const success2 = SpriteManager.drawTank(
            this.ctx,
            player2.color,
            player2.direction,
            player2.visualX, 
            player2.visualY,
            player2.animFrame,
            1 // scale
        );

        // Debug output (only when tanks fail to render)
        if (!success1) {
            console.warn('⚠️ Failed to render Player 1 tank');
        }
        if (!success2) {
            console.warn('⚠️ Failed to render Player 2 tank');
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
                console.log('🔫 Shoot');
                // TODO: Send shoot command to server (Phase 4)
                break;
            case 'Escape':
                this.togglePause();
                break;
        }

        // Send movement command to server
        if (direction && moveCommand) {
            this.sendMoveCommand(direction, moveCommand);
        }
    },

    handleKeyUp(e) {
        // Handle key releases if needed
        // For continuous movement, this would stop movement
    },

    sendMoveCommand(direction, moveCommand) {
        // Get local player
        const localPlayer = Network.playerRole === 'host' ? this.players.player1 : this.players.player2;
        
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
        
        // Only move if position would actually change
        if (newGridX !== localPlayer.gridX || newGridY !== localPlayer.gridY) {
            localPlayer.gridX = newGridX;
            localPlayer.gridY = newGridY;
            localPlayer.targetX = newGridX * 64;
            localPlayer.targetY = newGridY * 64;
            
            console.log(`🎮 Move ${direction}: Grid (${newGridX}, ${newGridY})`);
        }

        // Send to server
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
        }
    }
};

// Expose Game globally
window.Game = Game;