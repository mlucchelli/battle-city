# Plan: Battle City MVP - 4 Etapas de Desarrollo

## Etapa 1: Infraestructura Base y Pantalla Start
**Agentes:** `project-orchestrator`, `websocket-multiplayer`, `canvas-game-engine`

### Tareas:
- **Servidor WebSocket básico** (Node.js + Express)
- **Sistema de PINs** (generación 5 caracteres alphanumeric)
- **Gestión de salas** (create/join/track players)
- **HTML básico** con Canvas y UI elements
- **Pantalla Start** con botones Create Game / Join Game
- **Estados de conexión** (waiting, connected, error)

### Entregables:
- Servidor corriendo en localhost
- UI funcional create/join
- Confirmación visual de conexión exitosa

---

## Etapa 2: Procesamiento de Sprites y Sistema de Renderizado
**Agentes:** `sprite-animation`, `canvas-game-engine`

### Tareas:
- **Procesar atlas de sprites** (battle_city_atlas_64grid.json)
- **Extraer sprites de tanques** (2 tanques diferentes del atlas)
- **Sistema de renderizado Canvas** (13x13 grid setup)
- **Loader de sprites** con cell_r{row}_c{col} format
- **Rendering pipeline básico** (clear, draw sprites, present)

### Entregables:
- Atlas procesado y sprites identificados
- Canvas rendering funcional
- 2 tanques visibles en pantalla

---

## Etapa 3: Sistema de Movimiento Multiplayer
**Agentes:** `battle-city-mechanics`, `websocket-multiplayer`, `canvas-game-engine`

### Tareas:
- **Mecánicas de movimiento** (4-directional, grid-based)
- **Input handling** (arrow keys por jugador)
- **Protocolo de red** (movement messages)
- **Sincronización de estado** (posición tanques)
- **Interpolación visual** (smooth movement)
- **Detección de colisiones básica** (bordes del mapa)

### Entregables:
- Ambos jugadores pueden mover sus tanques
- Movimiento sincronizado en ambas pantallas
- Controles responsive y suaves

---

## Etapa 4: Sistema de Disparo Básico
**Agentes:** `battle-city-mechanics`, `canvas-game-engine`, `websocket-multiplayer`

### Tareas:
- **Mecánica de disparo** (spacebar, 1 bullet per player)
- **Sprites de bullets** (del atlas existente)
- **Física de proyectiles** (movement, collision con bordes)
- **Protocolo de bullets** (shoot messages)
- **Renderizado de bullets** (moving sprites)
- **Límite de bullets** (1 por jugador)

### Entregables:
- Sistema de disparo funcional
- Bullets visibles y sincronizadas
- Límite de 1 bullet por jugador respetado

---

## Tecnologías por Etapa:
- **Backend:** Node.js + Express + WebSockets
- **Frontend:** HTML5 + Canvas + Vanilla JS
- **Assets:** Existing sprite atlas processing
- **Testing:** Local development, 2 browser windows

## Coordinación:
- `project-orchestrator` supervisará integración entre etapas
- Testing continuo después de cada etapa
- Validación multiplayer real en cada entrega

¿Apruebas este plan de 4 etapas?