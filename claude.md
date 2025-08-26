Battle City Modern - claude.md
Project Overview
Project Name: Battle City Modern
Development Phase: MVP (Phase 1)
Target Platform: Web Browser (Desktop-first)
Architecture: Real-time multiplayer with PIN-based matchmaking
Tech Stack: HTML5/Canvas + Node.js + WebSockets + Firebase + Railway
Vision Statement
Create a modern, competitive multiplayer version of the classic Battle City game, accessible through web browsers with instant PIN-based matchmaking. Focus on preserving core tank combat mechanics while adding contemporary multiplayer features and progression systems.

Development Phases
Phase 1: MVP - 1v1 Base Race (Current Focus)
Timeline: 2 months
Core Features:

Real-time 1v1 tank battles
PIN-based matchmaking (5-digit alphanumeric)
Desktop controls (Arrow keys + Spacebar)
Eagle destruction win condition
Essential power-ups system
3 balanced maps

Technical Requirements:

WebSocket real-time communication
Firebase backend integration
Railway hosting deployment
Client-server state synchronization
Basic anti-cheat validation

Phase 2: Team Expansion (Future)
Timeline: Months 3-4
Features:

2v2 multiplayer support
Team coordination mechanics
Enhanced power-up sharing
Spectator mode

Phase 3: MOBA Evolution (Future)
Timeline: Months 5-6
Features:

NPC minion spawning (LoL-style)
Lane-based progression
Advanced objective control

Core Game Mechanics
Movement & Combat
Grid System: 13x13 tiles
Movement: 4-directional (no diagonals)
Controls: Arrow Keys (move) + Spacebar (shoot)
Bullet Limit: 1 per player (upgrades to 2 with 3-star power-up)
Friendly Fire: Stuns for 0.5s (prevents griefing)
Respawn: 3s delay + 1.2s invulnerability
Exploration System: 3-tile radius fog of war revelation, permanent visibility
Power-Up System
Trigger: Global kill counter at 4th, 11th, 18th enemy destroyed
Spawn: Random position from 16 central locations
Types:

⭐ Star: Tank upgrade (faster bullets → dual bullets → steel-piercing)
🛡️ Helmet: Temporary invulnerability
💥 Grenade: Destroy all enemies on screen
🔨 Shovel: Reinforce eagle with steel walls (15s duration)
🚗 Tank: Extra life/respawn token
⏱️ Timer: Freeze all enemies temporarily

Terrain Types

Brick: Destructible (4 hits standard, 2 with max power)
Steel: Only destroyed by max power bullets (2 hits same side)
Forest: Concealment, no collision
Water: Impassable for tanks, bullets pass through
Ice: Low friction, sliding effect

Technical Specification
Network Architecture
Client: HTML5 Canvas/WebGL
Server: Node.js + Express
Real-time: WebSocket connections
Database: Firebase Realtime Database
Hosting: Railway
State: Client prediction + server validation
Matchmaking System
PIN Format: 5 characters (alphanumeric)
Room Lifecycle: 10 minutes auto-expire
Max Players: 2 (MVP), 4 (Phase 2)
Connection: WebSocket with reconnection support
Validation: Server-side anti-cheat
Performance Targets
Latency: <100ms target
Frame Rate: 60 FPS stable
Bandwidth: <50KB/s per player
Concurrent: 500+ matches (MVP)
Uptime: 99.5% target

Asset Implementation
Sprite System
Atlas: 25x16 grid @ 64px cells
Naming: cell_r{row}\_c{col} format
Scaling: Nearest-neighbor, integer multiples (2x, 3x, 4x)
Animation: Frame-based sequences
Key Animations Needed
javascript// Tank animations (per direction)
tank_yellow_up: ['cell_r6_c0', 'cell_r6_c1']
tank_yellow_right: ['cell_r6_c2', 'cell_r6_c3']
tank_yellow_down: ['cell_r6_c4', 'cell_r6_c5']
tank_yellow_left: ['cell_r6_c6', 'cell_r6_c7']

// Power-ups
powerup_star: ['cell_r6_c16', 'cell_r6_c17']
powerup_helmet: ['cell_r6_c18', 'cell_r6_c19']
powerup_grenade: ['cell_r6_c20', 'cell_r6_c21']

// Effects
explosion_small: ['cell_r7_c0', 'cell_r7_c1', 'cell_r7_c2']
explosion_large: ['cell_r7_c3', 'cell_r7_c4', 'cell_r7_c5']

// Eagle states
eagle_normal: ['cell_r6_c23']
eagle_destroyed: ['cell_r6_c24']
Terrain Mapping
javascript// Terrain tiles
brick: 'cell_r2_c8'
steel: 'cell_r2_c9'
water: 'cell_r2_c10'
forest: 'cell_r2_c11'
ice: 'cell_r2_c12'
fog: 'cell_r2_c13' // Dark overlay for unexplored areas

Game Flow
Match Lifecycle

1. Player creates game → Generate PIN
2. Share PIN → Second player joins
3. 3-second countdown → Match starts
4. Real-time gameplay → First eagle destruction wins
5. Round complete → Best of 3 format
6. Match end → Stats display + rematch option
   Input Handling
   javascript// Controls mapping
   ArrowUp: moveUp()
   ArrowDown: moveDown()  
   ArrowLeft: moveLeft()
   ArrowRight: moveRight()
   Spacebar: shoot()
   Escape: pause()
   State Management
   javascriptGameState = {
   phase: 'lobby' | 'playing' | 'paused' | 'ended',
   players: [Player1, Player2],
   map: MapData,
   powerups: [PowerUp[]],
   bullets: [Bullet[]],
   score: {p1: 0, p2: 0},
   timer: matchDuration,
   fogOfWar: {
     player1Explored: Set<string>, // "x,y" coordinates
     player2Explored: Set<string>,
     visionRadius: 3
   }
   }

MVP Development Checklist
Core Systems

Movement System: Grid-based 4-directional tank movement
Combat System: Bullet firing, collision detection, damage
Map System: Tile-based terrain with collision rules
Fog of War System: Vision radius calculation, exploration tracking, rendering
Power-up System: Spawning, collection, effects application
Eagle System: Base destruction win condition

Networking

WebSocket Setup: Real-time client-server communication
PIN System: Room creation and joining via alphanumeric codes
State Sync: Client prediction with server validation
Reconnection: Handle disconnects and rejoin
Anti-cheat: Server-side validation of player actions

UI/UX

Main Menu: Clean interface with Create/Join options
Lobby: PIN display, connection status, ready system
HUD: Health, power-ups, score, timer display
Game Over: Results screen with rematch option
Controls: Key binding display and customization

Assets

Sprite Integration: Load and parse provided atlas
Animation System: Frame-based sprite animations
Sound Effects: Tank movement, shooting, explosions
Map Design: 3 balanced layouts for competitive play
Visual Polish: Particle effects, screen shake, UI animations

Backend

Firebase Setup: Database configuration and rules
Railway Deployment: Server hosting and scaling
Room Management: Auto-cleanup, expiration handling
Statistics: Basic match tracking and analytics
Error Handling: Graceful failure and recovery

Implementation Priority
Week 1-2: Foundation

Basic tank movement and rendering
Map loading and collision system
Fog of war implementation and vision system
Local multiplayer prototype

Week 3-4: Networking

WebSocket server implementation
PIN-based matchmaking system
Real-time state synchronization

Week 5-6: Game Features

Combat system with bullets and damage
Power-up spawning and collection
Eagle destruction win condition

Week 7-8: Polish & Deploy

UI/UX implementation and testing
Sound integration and visual effects
Firebase integration and Railway deployment

Technical Considerations
Performance Optimization

Sprite batching for rendering efficiency
Delta compression for network updates
Object pooling for bullets and effects
Spatial partitioning for collision detection

Security Measures

Input validation on server
Rate limiting for actions
Encrypted communications
Anti-cheat detection algorithms

Scalability Planning

Modular server architecture
Database sharding strategy
CDN integration for assets
Load balancer configuration

Success Metrics
MVP Targets

Technical: <100ms latency, 99.5% uptime
Gameplay: <3% disconnect rate, 3+ matches/session
User: 40% day-1 retention, 500 concurrent users
Business: Viral PIN sharing, community formation

Future Expansion

Mobile responsive design
Tournament infrastructure
User-generated content
Monetization through cosmetics

This claude.md serves as the technical specification and development guide for Battle City Modern. It combines the game design vision with concrete implementation details, asset specifications, and development priorities to ensure successful delivery of the MVP.

## Development Team - Specialized Agents

The project includes a team of 7 specialized Claude agents for efficient development coordination:

### 🎮 Core Development Agents
- **`canvas-game-engine`** - HTML5 Canvas rendering, sprite systems, game loops
- **`websocket-multiplayer`** - Real-time networking, matchmaking, state sync
- **`battle-city-mechanics`** - Game logic, combat rules, fog of war mechanics
- **`firebase-backend`** - Database design, cloud functions, persistence

### 🎨 Content & Experience Agents  
- **`sprite-animation`** - Animation systems, visual effects, pixel art
- **`audio-system`** - Web Audio API, sound effects, spatial audio

### 🏗️ Project Management
- **`project-orchestrator`** - Task coordination, workflow planning, agent management

**Usage**: These agents can be invoked automatically by Claude Code based on context, or explicitly called for specialized tasks. The project-orchestrator coordinates complex multi-agent features and ensures architectural consistency across the development team.
