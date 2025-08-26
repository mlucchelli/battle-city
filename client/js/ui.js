// UI.js - User Interface management for Battle City Modern

const UI = {
    elements: {},

    init() {
        console.log('🎨 Initializing UI...');
        this.cacheElements();
        this.setupEventListeners();
    },

    cacheElements() {
        // Cache frequently used DOM elements
        this.elements = {
            startScreen: document.getElementById('startScreen'),
            gameCanvas: document.getElementById('gameCanvas'),
            
            // Buttons
            createGameBtn: document.getElementById('createGameBtn'),
            joinGameBtn: document.getElementById('joinGameBtn'),
            connectBtn: document.getElementById('connectBtn'),
            backBtn: document.getElementById('backBtn'),
            
            // Forms and inputs
            joinForm: document.getElementById('joinForm'),
            pinInput: document.getElementById('pinInput'),
            
            // Status elements
            connectionStatus: document.getElementById('connectionStatus'),
            statusText: document.getElementById('statusText'),
            pinDisplay: document.getElementById('pinDisplay'),
            playerCount: document.getElementById('playerCount'),
            
            // Debug
            debugInfo: document.getElementById('debugInfo'),
            debugPlayers: document.getElementById('debugPlayers')
        };
    },

    setupEventListeners() {
        // Create Game button
        this.elements.createGameBtn.addEventListener('click', () => {
            this.showCreatingGame();
            Network.createGame();
        });

        // Join Game button
        this.elements.joinGameBtn.addEventListener('click', () => {
            this.showJoinForm();
        });

        // Connect button (in join form)
        this.elements.connectBtn.addEventListener('click', () => {
            const pin = this.elements.pinInput.value.trim();
            if (pin) {
                this.showJoiningGame(pin);
                Network.joinGame(pin);
            }
        });

        // Back button
        this.elements.backBtn.addEventListener('click', () => {
            this.showMainMenu();
        });

        // PIN input handling
        this.elements.pinInput.addEventListener('input', (e) => {
            // Convert to uppercase and limit to 5 characters
            e.target.value = e.target.value.toUpperCase().slice(0, 5);
        });

        this.elements.pinInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.elements.connectBtn.click();
            }
        });

        // Enable debug info with Ctrl+D
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'd') {
                e.preventDefault();
                this.toggleDebugInfo();
            }
        });
    },

    // Screen transitions
    showMainMenu() {
        this.elements.joinForm.classList.remove('active');
        this.elements.connectionStatus.classList.remove('active');
        this.elements.gameCanvas.classList.remove('active');
        
        this.elements.createGameBtn.style.display = 'block';
        this.elements.joinGameBtn.style.display = 'block';
        
        // Clear PIN input
        this.elements.pinInput.value = '';
    },

    showJoinForm() {
        this.elements.createGameBtn.style.display = 'none';
        this.elements.joinGameBtn.style.display = 'none';
        this.elements.joinForm.classList.add('active');
        
        // Focus on PIN input
        setTimeout(() => {
            this.elements.pinInput.focus();
        }, 100);
    },

    showGameCanvas() {
        this.elements.startScreen.style.display = 'none';
        this.elements.gameCanvas.classList.add('active');
    },

    // Connection status updates
    showCreatingGame() {
        this.elements.createGameBtn.style.display = 'none';
        this.elements.joinGameBtn.style.display = 'none';
        
        this.showConnectionStatus('Creating game<span class="loading"></span>', '', 'waiting');
    },

    showJoiningGame(pin) {
        this.elements.joinForm.classList.remove('active');
        this.showConnectionStatus(`Joining game ${pin}<span class="loading"></span>`, '', 'waiting');
    },

    showGameCreated(data) {
        const statusText = `Game created! Share this PIN with your opponent:`;
        const pinText = data.pin;
        
        this.showConnectionStatus(statusText, pinText, 'waiting');
        this.updatePlayerCount(1, 2);
    },

    showGameJoined(data) {
        const statusText = `Joined game ${data.pin}! Waiting for game to start<span class="loading"></span>`;
        
        this.showConnectionStatus(statusText, '', 'waiting');
        this.updatePlayerCount(data.playerCount, 2);
    },

    showGameReady(data) {
        const statusText = `${data.message} Starting in 3 seconds...`;
        
        this.showConnectionStatus(statusText, '', 'connected');
        this.updatePlayerCount(data.playerCount, 2);
    },

    showConnectionStatus(text, pin = '', type = 'waiting') {
        this.elements.connectionStatus.classList.remove('waiting', 'connected', 'error');
        this.elements.connectionStatus.classList.add('active', type);
        
        this.elements.statusText.innerHTML = text;
        this.elements.pinDisplay.textContent = pin;
    },

    updatePlayerCount(current, max) {
        this.elements.playerCount.textContent = `Players: ${current}/${max}`;
        
        // Update debug info
        if (this.elements.debugPlayers) {
            this.elements.debugPlayers.textContent = `${current}/${max}`;
        }
    },

    updateRoomStatus(data) {
        this.updatePlayerCount(data.playerCount, 2);
        
        if (data.status === 'waiting') {
            this.showConnectionStatus(
                'Waiting for another player<span class="loading"></span>', 
                Network.currentRoom, 
                'waiting'
            );
        }
    },

    // Error handling
    showJoinError(error) {
        this.showConnectionStatus(`Error: ${error}`, '', 'error');
        
        // Show back button or return to main menu after delay
        setTimeout(() => {
            this.showMainMenu();
        }, 3000);
    },

    showConnectionError(error) {
        this.showConnectionStatus(`Connection Error: ${error}`, '', 'error');
    },

    hideConnectionError() {
        if (this.elements.connectionStatus.classList.contains('error')) {
            this.elements.connectionStatus.classList.remove('active', 'error');
        }
    },

    showPlayerDisconnected(data) {
        this.showConnectionStatus(`${data.message}. Waiting for reconnection<span class="loading"></span>`, '', 'waiting');
        this.updatePlayerCount(data.playerCount, 2);
    },

    // Debug functions
    toggleDebugInfo() {
        const debugInfo = this.elements.debugInfo;
        if (debugInfo.style.display === 'none') {
            debugInfo.style.display = 'block';
            console.log('🐛 Debug info enabled');
        } else {
            debugInfo.style.display = 'none';
            console.log('🐛 Debug info disabled');
        }
    },

    // Utility functions
    showToast(message, type = 'info', duration = 3000) {
        // Simple toast notification system
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'error' ? '#ff4444' : type === 'success' ? '#44ff44' : '#4444ff'};
            color: white;
            padding: 15px 20px;
            border-radius: 5px;
            font-family: 'Courier New', monospace;
            z-index: 1000;
            opacity: 0;
            transition: opacity 0.3s;
        `;
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        // Fade in
        setTimeout(() => {
            toast.style.opacity = '1';
        }, 100);
        
        // Fade out and remove
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 300);
        }, duration);
    }
};

// Expose UI globally
window.UI = UI;