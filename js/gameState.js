// Game State Management
class GameState {
    constructor() {
        this.loadGame();
        this.initializeState();
        this.startAutoSave();
        this.handleOfflineProgress();
    }

    initializeState() {
        // Ensure all required properties exist
        if (!this.resources) {
            this.resources = {
                mana: 0,
                essence: 0,
                eggs: 3, // Start with 3 eggs
                crystals: 10 // Start with 10 crystals
            };
        }

        if (!this.creatures) {
            this.creatures = {};
        }

        if (!this.unlockedCreatures) {
            this.unlockedCreatures = new Set(['baby-unicorn']);
        } else {
            // Convert array to Set if loaded from localStorage
            this.unlockedCreatures = new Set(this.unlockedCreatures);
        }

        if (!this.unlockedHabitats) {
            this.unlockedHabitats = new Set(['forest']);
        } else {
            this.unlockedHabitats = new Set(this.unlockedHabitats);
        }

        if (!this.upgrades) {
            this.upgrades = {
                forest: { habitat: 0, food: 0, magic: 0 },
                volcano: { habitat: 0, food: 0, magic: 0 },
                glacier: { habitat: 0, food: 0, magic: 0 }
            };
        }

        if (!this.achievements) {
            this.achievements = {};
        }

        if (!this.stats) {
            this.stats = {
                totalManaEarned: 0,
                creaturesHatched: 0,
                successfulBreeds: 0,
                clickCount: 0,
                playTime: 0,
                lastSave: Date.now()
            };
        }

        if (!this.currentHabitat) {
            this.currentHabitat = 'forest';
        }

        if (!this.breedingSlots) {
            this.breedingSlots = [null, null];
        }

        if (!this.magicSurge) {
            this.magicSurge = {
                active: false,
                timeRemaining: 0,
                nextAvailable: 0
            };
        }

        if (!this.farmLevel) {
            this.farmLevel = 1;
        }

        if (!this.lastOfflineCheck) {
            this.lastOfflineCheck = Date.now();
        }
    }

    // Resource management
    addResource(type, amount) {
        if (this.resources[type] !== undefined) {
            this.resources[type] += amount;
            this.stats.totalManaEarned += (type === 'mana') ? amount : 0;
            this.checkAchievements();
            return true;
        }
        return false;
    }

    spendResource(type, amount) {
        if (this.resources[type] >= amount) {
            this.resources[type] -= amount;
            return true;
        }
        return false;
    }

    getResource(type) {
        return this.resources[type] || 0;
    }

    // Creature management
    addCreature(creatureId, slotIndex = null) {
        const creatureData = GAME_DATA.creatures[creatureId];
        if (!creatureData) return false;

        // Find available slot if not specified
        if (slotIndex === null) {
            const habitatCreatures = this.getCreaturesInHabitat(creatureData.habitat);
            const maxSlots = this.getMaxSlots(creatureData.habitat);
            
            if (habitatCreatures.length >= maxSlots) {
                return false; // No available slots
            }
            
            slotIndex = this.findAvailableSlot(creatureData.habitat);
        }

        const creature = {
            id: creatureId,
            slotIndex: slotIndex,
            habitat: creatureData.habitat,
            age: 'baby',
            bornAt: Date.now(),
            lastAgeCheck: Date.now(),
            happiness: 100,
            lastFed: 0,
            lastPlayed: 0,
            buffs: []
        };

        const creatureKey = `${creatureData.habitat}_${slotIndex}`;
        this.creatures[creatureKey] = creature;
        this.unlockedCreatures.add(creatureId);
        this.stats.creaturesHatched++;
        
        this.checkAchievements();
        return true;
    }

    removeCreature(habitat, slotIndex) {
        const creatureKey = `${habitat}_${slotIndex}`;
        delete this.creatures[creatureKey];
    }

    getCreature(habitat, slotIndex) {
        const creatureKey = `${habitat}_${slotIndex}`;
        return this.creatures[creatureKey];
    }

    getCreaturesInHabitat(habitat) {
        return Object.values(this.creatures).filter(creature => 
            creature && creature.habitat === habitat
        );
    }

    findAvailableSlot(habitat) {
        const maxSlots = this.getMaxSlots(habitat);
        for (let i = 0; i < maxSlots; i++) {
            if (!this.getCreature(habitat, i)) {
                return i;
            }
        }
        return -1;
    }

    getMaxSlots(habitat) {
        const habitatLevel = this.upgrades[habitat]?.habitat || 0;
        return 6 + habitatLevel; // Base 6 slots + upgrades
    }

    // Upgrade management
    getUpgradeCost(habitat, upgradeType) {
        const currentLevel = this.upgrades[habitat][upgradeType];
        const upgradeData = GAME_DATA.upgrades[upgradeType];
        return Math.floor(upgradeData.baseCost * Math.pow(upgradeData.costMultiplier, currentLevel));
    }

    purchaseUpgrade(habitat, upgradeType) {
        const cost = this.getUpgradeCost(habitat, upgradeType);
        const upgradeData = GAME_DATA.upgrades[upgradeType];
        const currentLevel = this.upgrades[habitat][upgradeType];

        if (currentLevel >= upgradeData.maxLevel) return false;
        if (!this.spendResource('mana', cost)) return false;

        this.upgrades[habitat][upgradeType]++;
        return true;
    }

    getHabitatMultiplier(habitat) {
        const upgrades = this.upgrades[habitat];
        const habitatData = GAME_DATA.upgrades;
        
        let multiplier = GAME_DATA.habitats[habitat].baseMultiplier;
        multiplier *= Math.pow(habitatData.habitat.effect, upgrades.habitat);
        multiplier *= Math.pow(habitatData.food.effect, upgrades.food);
        multiplier *= Math.pow(habitatData.magic.effect, upgrades.magic);
        
        return multiplier;
    }

    // Breeding management
    setBreedingSlot(slotIndex, habitat, creatureSlot) {
        if (slotIndex < 0 || slotIndex > 1) return false;
        
        const creature = this.getCreature(habitat, creatureSlot);
        if (!creature) return false;

        this.breedingSlots[slotIndex] = {
            habitat: habitat,
            slotIndex: creatureSlot,
            creatureId: creature.id
        };
        return true;
    }

    clearBreedingSlot(slotIndex) {
        if (slotIndex >= 0 && slotIndex <= 1) {
            this.breedingSlots[slotIndex] = null;
        }
    }

    canBreed() {
        return this.breedingSlots[0] && this.breedingSlots[1] && 
               this.getResource('mana') >= GAME_DATA.constants.BREEDING_BASE_COST;
    }

    attemptBreeding() {
        if (!this.canBreed()) return null;

        const creature1 = this.breedingSlots[0].creatureId;
        const creature2 = this.breedingSlots[1].creatureId;
        
        // Try both combinations
        const combo1 = `${creature1}+${creature2}`;
        const combo2 = `${creature2}+${creature1}`;
        
        let resultCreature = GAME_DATA.breedingCombos[combo1] || GAME_DATA.breedingCombos[combo2];
        
        if (!this.spendResource('mana', GAME_DATA.constants.BREEDING_BASE_COST)) {
            return null;
        }

        // If no specific combo, random chance for rare creature or egg
        if (!resultCreature) {
            const random = Math.random();
            if (random < 0.1) { // 10% chance for random egg
                this.addResource('eggs', 1);
                return 'egg';
            } else {
                return 'failure';
            }
        }

        // Successful breeding
        this.stats.successfulBreeds++;
        this.unlockedCreatures.add(resultCreature);
        this.addResource('eggs', 1);
        
        // Clear breeding slots
        this.breedingSlots = [null, null];
        
        this.checkAchievements();
        return resultCreature;
    }

    // Achievement checking
    checkAchievements() {
        GAME_DATA.achievements.forEach(achievement => {
            if (this.achievements[achievement.id]) return; // Already completed

            let completed = false;
            switch (achievement.condition) {
                case 'creatures_hatched':
                    completed = this.stats.creaturesHatched >= achievement.target;
                    break;
                case 'total_mana_earned':
                    completed = this.stats.totalManaEarned >= achievement.target;
                    break;
                case 'successful_breeds':
                    completed = this.stats.successfulBreeds >= achievement.target;
                    break;
                case 'unique_tiers':
                    const tiers = new Set();
                    Array.from(this.unlockedCreatures).forEach(creatureId => {
                        const tier = GAME_DATA.creatures[creatureId]?.tier;
                        if (tier) tiers.add(tier);
                    });
                    completed = tiers.size >= achievement.target;
                    break;
                case 'habitats_unlocked':
                    completed = this.unlockedHabitats.size >= achievement.target;
                    break;
            }

            if (completed) {
                this.achievements[achievement.id] = Date.now();
                // Give rewards
                Object.keys(achievement.reward).forEach(resource => {
                    this.addResource(resource, achievement.reward[resource]);
                });
            }
        });
    }

    // Magic Surge event management
    startMagicSurge() {
        if (this.magicSurge.nextAvailable > Date.now()) return false;

        this.magicSurge.active = true;
        this.magicSurge.timeRemaining = GAME_DATA.constants.MAGIC_SURGE_DURATION;
        this.magicSurge.nextAvailable = Date.now() + (GAME_DATA.constants.MAGIC_SURGE_DURATION * 1000) + (3600 * 1000); // 1 hour cooldown
        return true;
    }

    updateMagicSurge() {
        if (this.magicSurge.active && this.magicSurge.timeRemaining > 0) {
            this.magicSurge.timeRemaining--;
            if (this.magicSurge.timeRemaining <= 0) {
                this.magicSurge.active = false;
            }
        }
    }

    getManaMultiplier() {
        let multiplier = 1.0;
        if (this.magicSurge.active) {
            multiplier *= GAME_DATA.constants.MAGIC_SURGE_MULTIPLIER;
        }
        return multiplier;
    }

    // Creature aging and evolution
    updateCreatureAges() {
        const now = Date.now();
        Object.values(this.creatures).forEach(creature => {
            if (!creature) return;

            const creatureData = GAME_DATA.creatures[creature.id];
            if (!creatureData) return;

            const ageData = creatureData.ageStages[creature.age];
            const ageTime = (now - creature.bornAt) / 1000; // Age in seconds

            // Check for age progression
            if (creature.age === 'baby' && ageTime >= ageData.duration) {
                creature.age = 'adult';
                creature.lastAgeCheck = now;
            } else if (creature.age === 'adult' && ageTime >= (creatureData.ageStages.baby.duration + ageData.duration)) {
                creature.age = 'elder';
                creature.lastAgeCheck = now;
            }

            // Update happiness decay
            const timeSinceLastUpdate = (now - creature.lastAgeCheck) / 1000;
            if (timeSinceLastUpdate > 3600) { // 1 hour
                creature.happiness = Math.max(50, creature.happiness - 1);
                creature.lastAgeCheck = now;
            }
        });
    }

    // Calculate idle income
    calculateIdleIncome() {
        let totalManaPerSecond = 0;
        
        Object.values(this.creatures).forEach(creature => {
            if (!creature) return;

            const creatureData = GAME_DATA.creatures[creature.id];
            if (!creatureData) return;

            const ageMultiplier = creatureData.ageStages[creature.age].multiplier;
            const habitatMultiplier = this.getHabitatMultiplier(creature.habitat);
            const happinessMultiplier = creature.happiness / 100;
            const globalMultiplier = this.getManaMultiplier();

            const manaPerSecond = creatureData.baseManaPerSecond * 
                                ageMultiplier * 
                                habitatMultiplier * 
                                happinessMultiplier * 
                                globalMultiplier;

            totalManaPerSecond += manaPerSecond;
        });

        return totalManaPerSecond;
    }

    // Handle offline progress
    handleOfflineProgress() {
        const now = Date.now();
        const offlineTime = Math.min(
            (now - this.lastOfflineCheck) / 1000,
            GAME_DATA.constants.OFFLINE_CALCULATION_LIMIT
        );

        if (offlineTime > 60) { // Only calculate if offline for more than 1 minute
            const manaPerSecond = this.calculateIdleIncome();
            const offlineMana = manaPerSecond * offlineTime;
            
            if (offlineMana > 0) {
                this.addResource('mana', Math.floor(offlineMana));
                this.showOfflineModal(offlineTime, offlineMana);
            }
        }

        this.lastOfflineCheck = now;
    }

    showOfflineModal(offlineTime, manaEarned) {
        // This will be implemented in the UI module
        if (window.ui) {
            window.ui.showOfflineModal(offlineTime, manaEarned);
        }
    }

    // Save/Load game
    saveGame() {
        const saveData = {
            resources: this.resources,
            creatures: this.creatures,
            unlockedCreatures: Array.from(this.unlockedCreatures),
            unlockedHabitats: Array.from(this.unlockedHabitats),
            upgrades: this.upgrades,
            achievements: this.achievements,
            stats: this.stats,
            currentHabitat: this.currentHabitat,
            breedingSlots: this.breedingSlots,
            magicSurge: this.magicSurge,
            farmLevel: this.farmLevel,
            lastOfflineCheck: Date.now(),
            saveVersion: '1.0'
        };

        localStorage.setItem('idleBeastlands_save', JSON.stringify(saveData));
        this.stats.lastSave = Date.now();
    }

    loadGame() {
        const saveData = localStorage.getItem('idleBeastlands_save');
        if (saveData) {
            try {
                const parsed = JSON.parse(saveData);
                Object.assign(this, parsed);
                console.log('Game loaded successfully');
            } catch (error) {
                console.error('Failed to load save data:', error);
                this.resetGame();
            }
        }
    }

    resetGame() {
        localStorage.removeItem('idleBeastlands_save');
        location.reload();
    }

    startAutoSave() {
        setInterval(() => {
            this.saveGame();
        }, GAME_DATA.constants.SAVE_INTERVAL);
    }

    // Export save data
    exportSave() {
        const saveData = localStorage.getItem('idleBeastlands_save');
        if (saveData) {
            const blob = new Blob([saveData], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `idleBeastlands_save_${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            URL.revokeObjectURL(url);
        }
    }

    // Import save data
    importSave(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const saveData = JSON.parse(e.target.result);
                localStorage.setItem('idleBeastlands_save', JSON.stringify(saveData));
                location.reload();
            } catch (error) {
                alert('Invalid save file!');
            }
        };
        reader.readAsText(file);
    }
}

// Initialize global game state
window.gameState = new GameState();
