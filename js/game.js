// Main Game Controller
class IdleBeastlands {
    constructor() {
        this.gameLoaded = false;
        this.isPaused = false;
        this.version = '1.0.0';
        
        this.initializeGame();
    }

    async initializeGame() {
        try {
            console.log('🏰 Initializing Idle Beastlands v' + this.version);
            
            // Wait for DOM to be ready
            if (document.readyState !== 'complete') {
                await new Promise(resolve => {
                    window.addEventListener('load', resolve);
                });
            }

            // Initialize game systems
            this.setupEventListeners();
            this.startGameLoop();
            this.setupVisibilityHandling();
            
            // Add starter creature if this is a new game
            this.checkFirstTimeSetup();
            
            this.gameLoaded = true;
            console.log('✅ Game initialized successfully');
            
            // Show welcome message for new players
            if (gameState.stats.playTime === 0) {
                this.showWelcomeMessage();
            }

        } catch (error) {
            console.error('❌ Failed to initialize game:', error);
            this.showErrorMessage('Failed to load game. Please refresh the page.');
        }
    }

    setupEventListeners() {
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            this.handleKeyPress(e);
        });

        // Window beforeunload for save reminder
        window.addEventListener('beforeunload', () => {
            gameState.saveGame();
        });

        // Handle window focus/blur for pause functionality
        window.addEventListener('focus', () => {
            this.resumeGame();
        });

        window.addEventListener('blur', () => {
            this.pauseGame();
        });

        // Mobile touch events
        this.setupMobileEvents();
    }

    setupMobileEvents() {
        // Prevent double-tap zoom on mobile
        let lastTouchEnd = 0;
        document.addEventListener('touchend', (e) => {
            const now = Date.now();
            if (now - lastTouchEnd <= 300) {
                e.preventDefault();
            }
            lastTouchEnd = now;
        }, false);

        // Handle mobile swipe gestures for habitat switching
        let touchStartX = 0;
        let touchStartY = 0;

        document.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        });

        document.addEventListener('touchmove', (e) => {
            if (!touchStartX || !touchStartY) return;

            const touchEndX = e.touches[0].clientX;
            const touchEndY = e.touches[0].clientY;

            const diffX = touchStartX - touchEndX;
            const diffY = touchStartY - touchEndY;

            // Only handle horizontal swipes
            if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
                if (diffX > 0) {
                    this.switchToNextHabitat();
                } else {
                    this.switchToPreviousHabitat();
                }
                
                touchStartX = 0;
                touchStartY = 0;
            }
        });
    }

    handleKeyPress(e) {
        // Keyboard shortcuts
        switch (e.key) {
            case '1':
                if (gameState.unlockedHabitats.has('forest')) {
                    ui.switchHabitat('forest');
                }
                break;
            case '2':
                if (gameState.unlockedHabitats.has('volcano')) {
                    ui.switchHabitat('volcano');
                }
                break;
            case '3':
                if (gameState.unlockedHabitats.has('glacier')) {
                    ui.switchHabitat('glacier');
                }
                break;
            case 'b':
            case 'B':
                if (breedingManager.canBreed()) {
                    ui.startBreeding();
                }
                break;
            case 's':
            case 'S':
                if (e.ctrlKey || e.metaKey) {
                    e.preventDefault();
                    gameState.saveGame();
                    ui.showNotification({
                        type: 'success',
                        title: 'Game Saved',
                        message: 'Your progress has been saved!',
                        duration: 1500
                    });
                }
                break;
            case 'p':
            case 'P':
                this.togglePause();
                break;
            case 'Escape':
                // Close any open modals
                document.querySelectorAll('.modal').forEach(modal => {
                    if (modal.style.display === 'block') {
                        ui.closeModal(modal);
                    }
                });
                break;
        }
    }

    startGameLoop() {
        // Main game loop - runs every frame for smooth animations
        const gameLoop = () => {
            if (!this.isPaused && this.gameLoaded) {
                this.updateGame();
            }
            requestAnimationFrame(gameLoop);
        };

        requestAnimationFrame(gameLoop);

        // Secondary loop for game logic (every second)
        setInterval(() => {
            if (!this.isPaused && this.gameLoaded) {
                this.updateGameLogic();
            }
        }, 1000);
    }

    updateGame() {
        // Handle smooth animations and real-time effects
        this.updateParticleEffects();
        this.updateCreatureAnimations();
    }

    updateGameLogic() {
        // Update play time
        gameState.stats.playTime++;

        // Check for automatic unlocks
        this.checkAutoUnlocks();

        // Update creature ages and happiness
        gameState.updateCreatureAges();

        // Calculate and apply idle income
        const income = gameState.calculateIdleIncome();
        if (income > 0) {
            gameState.addResource('mana', income);
        }

        // Update magic surge
        gameState.updateMagicSurge();

        // Check achievements
        gameState.checkAchievements();

        // Auto-save periodically
        if (gameState.stats.playTime % 30 === 0) { // Every 30 seconds
            gameState.saveGame();
        }
    }

    updateParticleEffects() {
        // Update floating mana particles and other visual effects
        // This would handle any smooth animations
    }

    updateCreatureAnimations() {
        // Update creature animations based on their state
        document.querySelectorAll('.creature-card').forEach(card => {
            if (card.classList.contains('floating')) {
                // Add slight random variation to floating animation
                const randomDelay = Math.random() * 1000;
                card.style.animationDelay = randomDelay + 'ms';
            }
        });
    }

    checkAutoUnlocks() {
        // Check for habitat unlocks
        if (!gameState.unlockedHabitats.has('volcano') && 
            gameState.getResource('mana') >= GAME_DATA.habitats.volcano.unlockCost) {
            this.unlockHabitat('volcano');
        }

        if (!gameState.unlockedHabitats.has('glacier') && 
            gameState.getResource('mana') >= GAME_DATA.habitats.glacier.unlockCost) {
            this.unlockHabitat('glacier');
        }

        // Check for creature unlocks based on farm level
        this.checkCreatureUnlocks();
    }

    unlockHabitat(habitatId) {
        const habitat = GAME_DATA.habitats[habitatId];
        if (!habitat) return;

        if (gameState.spendResource('mana', habitat.unlockCost)) {
            gameState.unlockedHabitats.add(habitatId);
            
            ui.showNotification({
                type: 'success',
                title: 'New Habitat Unlocked!',
                message: `${habitat.emoji} ${habitat.name} is now available!`,
                duration: 4000
            });

            // Update UI to show new tab
            if (ui) {
                ui.updateHabitatDisplay();
            }
        }
    }

    checkCreatureUnlocks() {
        // Check for creatures that unlock based on farm level or other conditions
        Object.values(GAME_DATA.creatures).forEach(creature => {
            if (gameState.unlockedCreatures.has(creature.id)) return;

            if (creature.unlockMethod === 'farmLevel' && 
                gameState.farmLevel >= creature.farmLevelRequired) {
                gameState.unlockedCreatures.add(creature.id);
                
                ui.showNotification({
                    type: 'success',
                    title: 'New Creature Available!',
                    message: `${creature.emoji} ${creature.name} can now be hatched!`,
                    duration: 3000
                });
            }
        });
    }

    checkFirstTimeSetup() {
        // Add starter creature if player has no creatures
        const hasAnyCreature = Object.keys(gameState.creatures).length > 0;
        
        if (!hasAnyCreature && gameState.getResource('eggs') > 0) {
            // Auto-hatch a baby unicorn in the forest
            creatureManager.hatchCreature('baby-unicorn', 'forest');
            
            ui.showNotification({
                type: 'success',
                title: 'Welcome to Idle Beastlands!',
                message: '🦄 Your first unicorn has joined your farm!',
                duration: 4000
            });
        }
    }

    showWelcomeMessage() {
        setTimeout(() => {
            ui.showNotification({
                type: 'info',
                title: '🏰 Welcome to Idle Beastlands!',
                message: 'Click creatures for mana, breed hybrids, and build your magical empire!',
                duration: 6000
            });
        }, 1000);

        // Show tutorial hints
        setTimeout(() => {
            ui.showNotification({
                type: 'info',
                title: '💡 Pro Tip',
                message: 'Use Shift+Click to select creatures for breeding!',
                duration: 4000
            });
        }, 8000);
    }

    showErrorMessage(message) {
        ui.showNotification({
            type: 'error',
            title: 'Error',
            message: message,
            duration: 5000
        });
    }

    // Habitat navigation
    switchToNextHabitat() {
        const habitats = ['forest', 'volcano', 'glacier'];
        const current = habitats.indexOf(ui.currentHabitat);
        const next = (current + 1) % habitats.length;
        
        if (gameState.unlockedHabitats.has(habitats[next])) {
            ui.switchHabitat(habitats[next]);
        }
    }

    switchToPreviousHabitat() {
        const habitats = ['forest', 'volcano', 'glacier'];
        const current = habitats.indexOf(ui.currentHabitat);
        const prev = (current - 1 + habitats.length) % habitats.length;
        
        if (gameState.unlockedHabitats.has(habitats[prev])) {
            ui.switchHabitat(habitats[prev]);
        }
    }

    // Game state management
    pauseGame() {
        if (!this.isPaused) {
            this.isPaused = true;
            console.log('⏸️ Game paused');
        }
    }

    resumeGame() {
        if (this.isPaused) {
            this.isPaused = false;
            console.log('▶️ Game resumed');
            
            // Handle offline progress when resuming
            gameState.handleOfflineProgress();
        }
    }

    togglePause() {
        if (this.isPaused) {
            this.resumeGame();
        } else {
            this.pauseGame();
        }
        
        ui.showNotification({
            type: 'info',
            title: this.isPaused ? 'Game Paused' : 'Game Resumed',
            message: this.isPaused ? 'Press P to resume' : 'Press P to pause',
            duration: 1500
        });
    }

    setupVisibilityHandling() {
        // Handle page visibility changes for offline progress
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pauseGame();
                gameState.saveGame();
            } else {
                this.resumeGame();
            }
        });
    }

    // Debug functions (for development)
    addMana(amount = 1000) {
        gameState.addResource('mana', amount);
        console.log(`Added ${amount} mana`);
    }

    addEggs(amount = 5) {
        gameState.addResource('eggs', amount);
        console.log(`Added ${amount} eggs`);
    }

    unlockAllCreatures() {
        Object.keys(GAME_DATA.creatures).forEach(id => {
            gameState.unlockedCreatures.add(id);
        });
        console.log('Unlocked all creatures');
    }

    unlockAllHabitats() {
        Object.keys(GAME_DATA.habitats).forEach(id => {
            gameState.unlockedHabitats.add(id);
        });
        console.log('Unlocked all habitats');
    }

    // Performance monitoring
    getPerformanceInfo() {
        return {
            gameLoaded: this.gameLoaded,
            isPaused: this.isPaused,
            creatures: Object.keys(gameState.creatures).length,
            playTime: gameState.stats.playTime,
            lastSave: new Date(gameState.stats.lastSave).toLocaleString(),
            version: this.version
        };
    }
}

// Initialize the game when the page loads
window.addEventListener('DOMContentLoaded', () => {
    window.game = new IdleBeastlands();
});

// Export debug functions to global scope for development
window.debug = {
    addMana: (amount) => window.game?.addMana(amount),
    addEggs: (amount) => window.game?.addEggs(amount),
    unlockAll: () => {
        window.game?.unlockAllCreatures();
        window.game?.unlockAllHabitats();
    },
    info: () => window.game?.getPerformanceInfo(),
    save: () => gameState?.saveGame(),
    load: () => gameState?.loadGame(),
    reset: () => gameState?.resetGame()
};


