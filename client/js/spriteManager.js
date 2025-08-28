// SpriteManager.js - Sprite loading and management for Battle City Modern

const SpriteManager = {
    spriteSheet: null,
    atlas: null,
    isLoaded: false,
    loadingPromise: null,

    // Tank sprite definitions - corrected for Battle City sprite order
    tankSprites: {
        // Player 1 (Yellow tank) - Battle City order: up, left, down, right
        yellow: {
            up: ['cell_r6_c0', 'cell_r6_c1'],
            left: ['cell_r6_c2', 'cell_r6_c3'],
            down: ['cell_r6_c4', 'cell_r6_c5'],
            right: ['cell_r6_c6', 'cell_r6_c7']
        },
        // Player 2 (Green tank) - same pattern
        green: {
            up: ['cell_r8_c0', 'cell_r8_c1'],
            left: ['cell_r8_c2', 'cell_r8_c3'],
            down: ['cell_r8_c4', 'cell_r8_c5'],
            right: ['cell_r8_c6', 'cell_r8_c7']
        }
    },

    // Bullet sprite definitions - typically in first rows
    bulletSprites: {
        up: 'cell_r0_c8',
        right: 'cell_r0_c9', 
        down: 'cell_r0_c10',
        left: 'cell_r0_c11'
    },

    async init() {
        console.log('🎨 Initializing Sprite Manager...');
        
        if (this.loadingPromise) {
            return this.loadingPromise;
        }

        this.loadingPromise = this.loadAssets();
        return this.loadingPromise;
    },

    async loadAssets() {
        try {
            // Load atlas data and sprite sheet in parallel
            const [atlasData, spriteSheet] = await Promise.all([
                this.loadAtlas(),
                this.loadSpriteSheet()
            ]);

            this.atlas = atlasData;
            this.spriteSheet = spriteSheet;
            this.isLoaded = true;

            console.log('✅ Sprites loaded successfully');
            console.log('📊 Atlas contains', Object.keys(this.atlas.frames).length, 'sprites');
            
            return true;
        } catch (error) {
            console.error('❌ Error loading sprites:', error);
            throw error;
        }
    },

    async loadAtlas() {
        console.log('📋 Loading sprite atlas...');
        const response = await fetch('/graphics/battle_city_atlas_64grid.json');
        if (!response.ok) {
            throw new Error(`Failed to load atlas: ${response.status}`);
        }
        return await response.json();
    },

    async loadSpriteSheet() {
        console.log('🖼️ Loading sprite sheet...');
        
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                console.log('✅ Sprite sheet loaded:', img.width + 'x' + img.height);
                resolve(img);
            };
            img.onerror = () => {
                reject(new Error('Failed to load sprite sheet'));
            };
            img.src = '/graphics/sprite_sheet_1080p.png';
        });
    },

    getSprite(spriteName) {
        if (!this.isLoaded) {
            console.warn('⚠️ Sprites not loaded yet');
            return null;
        }

        const spriteData = this.atlas.frames[spriteName];
        if (!spriteData) {
            console.warn('⚠️ Sprite not found:', spriteName);
            return null;
        }

        return {
            image: this.spriteSheet,
            frame: spriteData.frame,
            name: spriteName
        };
    },

    drawSprite(ctx, spriteName, x, y, scale = 1) {
        const sprite = this.getSprite(spriteName);
        if (!sprite) return false;

        const { frame } = sprite;
        
        // Save context state
        ctx.save();
        
        // Configure for pixel art
        ctx.imageSmoothingEnabled = false;
        
        // Draw sprite
        ctx.drawImage(
            sprite.image,
            frame.x, frame.y, frame.w, frame.h,  // Source
            x, y, frame.w * scale, frame.h * scale  // Destination
        );
        
        // Restore context state
        ctx.restore();
        
        return true;
    },

    drawTank(ctx, tankColor, direction, x, y, animFrame = 0, scale = 1) {
        if (!this.tankSprites[tankColor]) {
            console.warn('⚠️ Tank color not found:', tankColor);
            return false;
        }

        const tankFrames = this.tankSprites[tankColor][direction];
        if (!tankFrames || tankFrames.length === 0) {
            console.warn('⚠️ Tank direction not found:', direction);
            return false;
        }

        // Use animation frame (cycle between available frames)
        const spriteFrame = animFrame % tankFrames.length;
        const spriteName = tankFrames[spriteFrame];

        return this.drawSprite(ctx, spriteName, x, y, scale);
    },

    drawBullet(ctx, direction, x, y, scale = 1) {
        // Draw bullet as geometric shape since atlas only has 64x64 tank sprites
        ctx.save();
        
        // Set bullet properties
        ctx.fillStyle = '#FFFF00'; // Yellow color like classic Battle City
        ctx.strokeStyle = '#FFA500'; // Orange outline
        ctx.lineWidth = 1;
        
        // Draw bullet based on direction
        const bulletSize = 8 * scale; // Small 8x8 pixel bullet
        
        switch(direction) {
            case 'up':
            case 'down':
                // Vertical bullet (taller rectangle)
                ctx.fillRect(x + 4, y, bulletSize/2, bulletSize);
                ctx.strokeRect(x + 4, y, bulletSize/2, bulletSize);
                break;
            case 'left':
            case 'right':
                // Horizontal bullet (wider rectangle)
                ctx.fillRect(x, y + 4, bulletSize, bulletSize/2);
                ctx.strokeRect(x, y + 4, bulletSize, bulletSize/2);
                break;
        }
        
        ctx.restore();
        return true;
    },

    // Utility functions
    getSpriteSize(spriteName) {
        const sprite = this.getSprite(spriteName);
        if (!sprite) return { width: 0, height: 0 };
        
        return {
            width: sprite.frame.w,
            height: sprite.frame.h
        };
    },

    getTankSize() {
        // All tanks are 64x64 pixels
        return { width: 64, height: 64 };
    },

    // Debug function to list available sprites
    listAvailableSprites() {
        if (!this.isLoaded) {
            console.log('❌ Sprites not loaded');
            return [];
        }

        const sprites = Object.keys(this.atlas.frames);
        console.log('📋 Available sprites:', sprites.length);
        
        // Group by rows for easier debugging
        const byRows = {};
        sprites.forEach(sprite => {
            const match = sprite.match(/cell_r(\d+)_c(\d+)/);
            if (match) {
                const row = match[1];
                if (!byRows[row]) byRows[row] = [];
                byRows[row].push(sprite);
            }
        });

        Object.keys(byRows).sort((a, b) => parseInt(a) - parseInt(b)).forEach(row => {
            console.log(`Row ${row}:`, byRows[row].sort());
        });

        return sprites;
    }
};

// Expose SpriteManager globally
window.SpriteManager = SpriteManager;