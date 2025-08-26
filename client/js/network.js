// Network.js - WebSocket client for Battle City Modern

const Network = {
    socket: null,
    isConnected: false,
    currentRoom: null,
    playerRole: null,
    reconnectAttempts: 0,
    maxReconnectAttempts: 5,

    init() {
        this.connect();
    },

    connect() {
        console.log('🔌 Connecting to server...');
        
        // Connect to server with more robust options
        this.socket = io({
            timeout: 5000,
            reconnection: true,
            reconnectionAttempts: 3,
            reconnectionDelay: 1000
        });

        this.setupEventListeners();
    },

    setupEventListeners() {
        // Connection events
        this.socket.on('connect', () => {
            console.log('✅ Connected to server:', this.socket.id);
            this.isConnected = true;
            this.reconnectAttempts = 0;
            
            // Update debug info
            this.updateDebugInfo();
            
            // Hide any connection error messages
            UI.hideConnectionError();
        });

        this.socket.on('disconnect', () => {
            console.log('❌ Disconnected from server');
            this.isConnected = false;
            this.updateDebugInfo();
            
            // Show connection error
            UI.showConnectionError('Lost connection to server');
            
            // Attempt to reconnect
            this.attemptReconnect();
        });

        this.socket.on('connect_error', (error) => {
            console.error('Connection error:', error);
            UI.showConnectionError('Failed to connect to server');
            this.attemptReconnect();
        });

        // Game events
        this.socket.on('game-created', (data) => {
            console.log('🎮 Game created:', data);
            this.currentRoom = data.pin;
            this.playerRole = data.role;
            
            UI.showGameCreated(data);
            this.updateDebugInfo();
        });

        this.socket.on('game-joined', (data) => {
            console.log('🎮 Game joined:', data);
            this.currentRoom = data.pin;
            this.playerRole = data.role;
            
            UI.showGameJoined(data);
            this.updateDebugInfo();
        });

        this.socket.on('join-error', (data) => {
            console.log('❌ Join error:', data);
            UI.showJoinError(data.error);
        });

        this.socket.on('room-update', (data) => {
            console.log('📊 Room update:', data);
            UI.updateRoomStatus(data);
            this.updateDebugInfo();
        });

        this.socket.on('game-ready', (data) => {
            console.log('🚀 Game ready:', data);
            UI.showGameReady(data);
            
            // TODO: Transition to game screen after delay
            setTimeout(() => {
                this.startGame();
            }, 3000);
        });

        this.socket.on('player-disconnected', (data) => {
            console.log('👋 Player disconnected:', data);
            UI.showPlayerDisconnected(data);
            this.updateDebugInfo();
        });

        // Ping/Pong for connection testing
        this.socket.on('pong', () => {
            console.log('🏓 Pong received - Connection OK');
        });

        // Movement events
        this.socket.on('player-moved', (data) => {
            // Forward to game logic
            Game.onPlayerMove(data);
        });
    },

    // Game actions
    createGame() {
        if (!this.isConnected) {
            UI.showConnectionError('Not connected to server');
            return;
        }

        console.log('🎮 Creating new game...');
        this.socket.emit('create-game');
    },

    joinGame(pin) {
        if (!this.isConnected) {
            UI.showConnectionError('Not connected to server');
            return;
        }

        if (!pin || pin.length !== 5) {
            UI.showJoinError('Please enter a valid 5-character PIN');
            return;
        }

        console.log('🎮 Joining game with PIN:', pin);
        this.socket.emit('join-game', { pin: pin.toUpperCase() });
    },

    startGame() {
        console.log('🚀 Starting game...');
        UI.showGameCanvas();
        Game.start();
    },

    // Utility functions
    testConnection() {
        if (this.socket) {
            this.socket.emit('ping');
        }
    },

    attemptReconnect() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            console.log(`🔄 Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
            
            setTimeout(() => {
                if (!this.isConnected && this.socket) {
                    // Don't create new connection, let Socket.IO handle reconnection
                    this.socket.connect();
                }
            }, 1000 + (this.reconnectAttempts * 1000));
        } else {
            console.log('❌ Max reconnection attempts reached');
            UI.showConnectionError('Connection failed. Please refresh the page to try again.');
        }
    },

    updateDebugInfo() {
        // Update debug information in UI
        const debugConnection = document.getElementById('debugConnection');
        const debugRoom = document.getElementById('debugRoom');
        const debugPlayers = document.getElementById('debugPlayers');

        if (debugConnection) {
            debugConnection.textContent = this.isConnected ? 'Connected' : 'Disconnected';
            debugConnection.style.color = this.isConnected ? '#00ff00' : '#ff0000';
        }

        if (debugRoom) {
            debugRoom.textContent = this.currentRoom || 'None';
        }

        if (debugPlayers) {
            // This will be updated by room-update events
        }
    },

    // Cleanup
    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
        this.isConnected = false;
        this.currentRoom = null;
        this.playerRole = null;
    }
};

// Expose Network globally
window.Network = Network;