# Battle City Modern 🎮

A modern, competitive multiplayer version of the classic Battle City tank game, built for web browsers with real-time PIN-based matchmaking.

## 🎯 Project Status

**Current Phase:** MVP (Phase 1) - 1v1 Base Race  
**Timeline:** 2 months development  
**Platform:** Web Browser (Desktop-first)

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Firebase account
- Railway account (for deployment)

### Installation
```bash
git clone <repository-url>
cd battle-city-amoun
npm install
```

### Development
```bash
npm run dev
```

### Build & Deploy
```bash
npm run build
npm run deploy
```

## 🎮 Game Features

### Core Mechanics
- **Real-time 1v1 tank battles** with grid-based movement
- **PIN-based matchmaking** using 5-digit alphanumeric codes
- **Fog of War system** with 3-tile radius exploration
- **Eagle destruction** win condition
- **Power-up system** triggered by kill counters
- **Desktop controls** (Arrow keys + Spacebar)

### Power-ups
- ⭐ **Star**: Tank upgrades (speed → dual bullets → armor piercing)
- 🛡️ **Helmet**: Temporary invulnerability
- 💥 **Grenade**: Destroy all enemies on screen
- 🔨 **Shovel**: Reinforce eagle with steel walls (15s)
- 🚗 **Tank**: Extra life/respawn token
- ⏱️ **Timer**: Freeze all enemies temporarily

### Terrain Types
- **Brick**: Destructible walls (4 hits standard, 2 with max power)
- **Steel**: Indestructible (except max power bullets)
- **Forest**: Concealment without collision
- **Water**: Impassable for tanks, bullets pass through
- **Ice**: Low friction sliding effect

## 🏗️ Architecture

### Tech Stack
- **Frontend**: HTML5 Canvas/WebGL
- **Backend**: Node.js + Express
- **Real-time**: WebSocket connections
- **Database**: Firebase Realtime Database
- **Hosting**: Railway
- **State Management**: Client prediction + server validation

### Performance Targets
- **Latency**: <100ms target
- **Frame Rate**: 60 FPS stable
- **Bandwidth**: <50KB/s per player
- **Concurrent Matches**: 500+ (MVP)
- **Uptime**: 99.5% target

## 🎨 Assets & Sprites

### Sprite System
- **Atlas**: 25x16 grid @ 64px cells
- **Naming**: `cell_r{row}_c{col}` format
- **Scaling**: Nearest-neighbor, integer multiples
- **Animation**: Frame-based sequences

### Key Animations
```javascript
// Tank animations (per direction)
tank_yellow_up: ['cell_r6_c0', 'cell_r6_c1']
tank_yellow_right: ['cell_r6_c2', 'cell_r6_c3']

// Power-ups
powerup_star: ['cell_r6_c16', 'cell_r6_c17']
powerup_helmet: ['cell_r6_c18', 'cell_r6_c19']

// Effects
explosion_small: ['cell_r7_c0', 'cell_r7_c1', 'cell_r7_c2']
```

## 🎯 Development Phases

### Phase 1: MVP (Current)
- ✅ Real-time 1v1 battles
- ✅ PIN-based matchmaking
- ✅ Essential power-ups
- ✅ 3 balanced maps
- ✅ Eagle destruction win condition

### Phase 2: Team Expansion (Future)
- 🔄 2v2 multiplayer support
- 🔄 Team coordination mechanics
- 🔄 Enhanced power-up sharing
- 🔄 Spectator mode

### Phase 3: MOBA Evolution (Future)
- ⏳ NPC minion spawning
- ⏳ Lane-based progression
- ⏳ Advanced objective control

## 🎮 Controls

| Key | Action |
|-----|--------|
| Arrow Keys | Move tank (4-directional) |
| Spacebar | Shoot |
| Escape | Pause game |

## 🌐 Multiplayer Flow

1. **Create Game** → Generate 5-digit PIN
2. **Share PIN** → Second player joins via PIN
3. **3-second countdown** → Match begins
4. **Real-time gameplay** → First eagle destruction wins
5. **Best of 3 format** → Complete match
6. **Results & rematch** → Stats display with rematch option

## 🔧 Development Team

### Specialized Claude Agents
- **`canvas-game-engine`** - Rendering & game loops
- **`websocket-multiplayer`** - Real-time networking
- **`battle-city-mechanics`** - Game logic & combat
- **`firebase-backend`** - Database & cloud functions
- **`sprite-animation`** - Visual effects & animations
- **`audio-system`** - Sound effects & spatial audio
- **`project-orchestrator`** - Task coordination

## 📊 Success Metrics

### MVP Targets
- **Technical**: <100ms latency, 99.5% uptime
- **Gameplay**: <3% disconnect rate, 3+ matches/session
- **User**: 40% day-1 retention, 500 concurrent users
- **Business**: Viral PIN sharing, community formation

## 🚀 Getting Started as Developer

### Week 1-2: Foundation
- Basic tank movement and rendering
- Map loading and collision system
- Fog of war implementation
- Local multiplayer prototype

### Week 3-4: Networking
- WebSocket server implementation
- PIN-based matchmaking system
- Real-time state synchronization

### Week 5-6: Game Features
- Combat system with bullets and damage
- Power-up spawning and collection
- Eagle destruction win condition

### Week 7-8: Polish & Deploy
- UI/UX implementation
- Sound integration and visual effects
- Firebase integration and Railway deployment

## 🔒 Security & Performance

### Security Measures
- Input validation on server
- Rate limiting for actions
- Encrypted communications
- Anti-cheat detection algorithms

### Performance Optimization
- Sprite batching for rendering efficiency
- Delta compression for network updates
- Object pooling for bullets and effects
- Spatial partitioning for collision detection

## 🤝 Contributing

This project uses specialized Claude agents for development. See the development team section above for details on how different aspects of the game are handled by specialized agents.

## 📄 License

[Add your license information here]

## 🎮 Play Now

[Add deployment URL when available]

---

Built with ❤️ using modern web technologies for the classic tank combat experience.