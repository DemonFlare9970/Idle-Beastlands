// Creature Management Module
class CreatureManager {
    constructor(gameState) {
        this.gameState = gameState;
        this.clickEffects = [];
    }

    // Handle creature clicks for mana generation
    handleCreatureClick(habitat, slotIndex, event) {
        const creature = this.gameState.getCreature(habitat, slotIndex);
        if (!creature) return;

        const creatureData = GAME_DATA.creatures[creature.id];
        if (!creatureData) return;

        // Calculate click mana based on creature's production
        const ageMultiplier = creatureData.ageStages[creature.age].multiplier;
        const habitatMultiplier = this.gameState.getHabitatMultiplier(habitat);
        const happinessMultiplier = creature.happiness / 100;
        const globalMultiplier = this.gameState.getManaMultiplier();

        const clickMana = Math.max(1, Math.floor(
            creatureData.baseManaPerSecond * 
            ageMultiplier * 
            habitatMultiplier * 
            happinessMultiplier * 
            globalMultiplier * 
            GAME_DATA.constants.CLICK_MANA_MULTIPLIER * 5 // 5x production as click reward
        ));

        this.gameState.addResource('mana', clickMana);
        this.gameState.stats.clickCount++;

        // Create visual effects
        this.createClickEffect(event.target, clickMana);
        this.createManaParticle(event.target, clickMana);

        // Increase happiness slightly
        creature.happiness = Math.min(100, creature.happiness + 1);

        return clickMana;
    }

    // Feed creature for temporary boost
    feedCreature(habitat, slotIndex) {
        const creature = this.gameState.getCreature(habitat, slotIndex);
        if (!creature) return false;

        const now = Date.now();
        const cooldown = 3600000; // 1 hour cooldown

        if (creature.lastFed && (now - creature.lastFed) < cooldown) {
            return false; // Still on cooldown
        }

        // Cost some mana to feed
        if (!this.gameState.spendResource('mana', 10)) {
            return false;
        }

        creature.lastFed = now;
        creature.happiness = Math.min(100, creature.happiness + 25);

        // Add temporary buff
        const buffId = 'fed_' + now;
        creature.buffs.push({
            id: buffId,
            type: 'production',
            multiplier: 1.5,
            duration: 3600, // 1 hour
            appliedAt: now
        });

        return true;
    }

    // Play with creature for happiness boost
    playWithCreature(habitat, slotIndex) {
        const creature = this.gameState.getCreature(habitat, slotIndex);
        if (!creature) return false;

        const now = Date.now();
        const cooldown = 1800000; // 30 minutes cooldown

        if (creature.lastPlayed && (now - creature.lastPlayed) < cooldown) {
            return false;
        }

        creature.lastPlayed = now;
        creature.happiness = Math.min(100, creature.happiness + 15);

        return true;
    }

    // Get creature's current production rate
    getCreatureProduction(habitat, slotIndex) {
        const creature = this.gameState.getCreature(habitat, slotIndex);
        if (!creature) return 0;

        const creatureData = GAME_DATA.creatures[creature.id];
        if (!creatureData) return 0;

        const ageMultiplier = creatureData.ageStages[creature.age].multiplier;
        const habitatMultiplier = this.gameState.getHabitatMultiplier(habitat);
        const happinessMultiplier = creature.happiness / 100;
        const globalMultiplier = this.gameState.getManaMultiplier();

        // Apply active buffs
        let buffMultiplier = 1.0;
        const now = Date.now();
        creature.buffs = creature.buffs.filter(buff => {
            const elapsed = (now - buff.appliedAt) / 1000;
            if (elapsed < buff.duration) {
                if (buff.type === 'production') {
                    buffMultiplier *= buff.multiplier;
                }
                return true;
            }
            return false;
        });

        return creatureData.baseManaPerSecond * 
               ageMultiplier * 
               habitatMultiplier * 
               happinessMultiplier * 
               globalMultiplier * 
               buffMultiplier;
    }

    // Get creature display info
    getCreatureDisplayInfo(habitat, slotIndex) {
        const creature = this.gameState.getCreature(habitat, slotIndex);
        if (!creature) return null;

        const creatureData = GAME_DATA.creatures[creature.id];
        if (!creatureData) return null;

        const ageData = creatureData.ageStages[creature.age];
        const production = this.getCreatureProduction(habitat, slotIndex);

        return {
            id: creature.id,
            name: creatureData.name,
            emoji: ageData.emoji,
            tier: creatureData.tier,
            age: creature.age,
            happiness: creature.happiness,
            production: production,
            description: creatureData.description,
            nextEvolution: this.getNextEvolution(creature, creatureData),
            buffs: creature.buffs.filter(buff => {
                const elapsed = (Date.now() - buff.appliedAt) / 1000;
                return elapsed < buff.duration;
            }),
            canFeed: this.canFeedCreature(creature),
            canPlay: this.canPlayWithCreature(creature)
        };
    }

    getNextEvolution(creature, creatureData) {
        const now = Date.now();
        const ageTime = (now - creature.bornAt) / 1000;

        if (creature.age === 'baby') {
            const timeLeft = creatureData.ageStages.baby.duration - ageTime;
            if (timeLeft > 0) {
                return `Adult in ${this.formatTime(timeLeft)}`;
            } else {
                return 'Ready to evolve!';
            }
        } else if (creature.age === 'adult') {
            const adultTime = ageTime - creatureData.ageStages.baby.duration;
            const timeLeft = creatureData.ageStages.adult.duration - adultTime;
            if (timeLeft > 0) {
                return `Elder in ${this.formatTime(timeLeft)}`;
            } else {
                return 'Ready to evolve!';
            }
        } else {
            return 'Maximum age reached';
        }
    }

    canFeedCreature(creature) {
        if (!creature.lastFed) return true;
        const now = Date.now();
        const cooldown = 3600000; // 1 hour
        return (now - creature.lastFed) >= cooldown;
    }

    canPlayWithCreature(creature) {
        if (!creature.lastPlayed) return true;
        const now = Date.now();
        const cooldown = 1800000; // 30 minutes
        return (now - creature.lastPlayed) >= cooldown;
    }

    // Hatch creature from egg
    hatchCreature(creatureId, habitat = null) {
        const creatureData = GAME_DATA.creatures[creatureId];
        if (!creatureData) return false;

        // Use specified habitat or creature's default habitat
        const targetHabitat = habitat || creatureData.habitat;

        // Check if habitat is unlocked
        if (!this.gameState.unlockedHabitats.has(targetHabitat)) {
            return false;
        }

        // Check if we have an egg to spend
        if (!this.gameState.spendResource('eggs', 1)) {
            return false;
        }

        // Add creature to habitat
        return this.gameState.addCreature(creatureId);
    }

    // Get available creatures for hatching
    getAvailableCreatures() {
        return Array.from(this.gameState.unlockedCreatures)
            .map(id => GAME_DATA.creatures[id])
            .filter(creature => creature)
            .sort((a, b) => {
                const tierOrder = ['common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic'];
                return tierOrder.indexOf(a.tier) - tierOrder.indexOf(b.tier);
            });
    }

    // Visual effects
    createClickEffect(element, amount) {
        const effect = document.createElement('div');
        effect.className = 'click-effect';
        effect.style.left = '50%';
        effect.style.top = '50%';
        effect.style.transform = 'translate(-50%, -50%)';
        
        const rect = element.getBoundingClientRect();
        effect.style.position = 'absolute';
        
        element.style.position = 'relative';
        element.appendChild(effect);

        // Remove effect after animation
        setTimeout(() => {
            if (effect.parentNode) {
                effect.parentNode.removeChild(effect);
            }
        }, 600);
    }

    createManaParticle(element, amount) {
        const particle = document.createElement('div');
        particle.className = 'mana-particle';
        particle.textContent = `+${amount} ✨`;
        
        const rect = element.getBoundingClientRect();
        particle.style.position = 'fixed';
        particle.style.left = rect.left + (rect.width / 2) + 'px';
        particle.style.top = rect.top + (rect.height / 2) + 'px';
        particle.style.zIndex = '1000';
        particle.style.pointerEvents = 'none';
        
        document.body.appendChild(particle);

        // Remove particle after animation
        setTimeout(() => {
            if (particle.parentNode) {
                particle.parentNode.removeChild(particle);
            }
        }, 2000);
    }

    // Utility functions
    formatTime(seconds) {
        if (seconds < 60) {
            return `${Math.floor(seconds)}s`;
        } else if (seconds < 3600) {
            return `${Math.floor(seconds / 60)}m`;
        } else {
            const hours = Math.floor(seconds / 3600);
            const minutes = Math.floor((seconds % 3600) / 60);
            return `${hours}h ${minutes}m`;
        }
    }

    formatNumber(num) {
        if (num < 1000) return num.toFixed(1);
        if (num < 1000000) return (num / 1000).toFixed(1) + 'K';
        if (num < 1000000000) return (num / 1000000).toFixed(1) + 'M';
        return (num / 1000000000).toFixed(1) + 'B';
    }

    // Auto-evolution check
    checkEvolutions() {
        Object.values(this.gameState.creatures).forEach(creature => {
            if (!creature) return;

            const creatureData = GAME_DATA.creatures[creature.id];
            if (!creatureData) return;

            const now = Date.now();
            const ageTime = (now - creature.bornAt) / 1000;

            // Check if creature should evolve
            if (creature.age === 'baby' && ageTime >= creatureData.ageStages.baby.duration) {
                creature.age = 'adult';
                this.showEvolutionNotification(creature, 'adult');
            } else if (creature.age === 'adult') {
                const adultStartTime = creatureData.ageStages.baby.duration;
                const adultTime = ageTime - adultStartTime;
                if (adultTime >= creatureData.ageStages.adult.duration) {
                    creature.age = 'elder';
                    this.showEvolutionNotification(creature, 'elder');
                }
            }
        });
    }

    showEvolutionNotification(creature, newAge) {
        const creatureData = GAME_DATA.creatures[creature.id];
        const notification = {
            type: 'evolution',
            title: 'Evolution!',
            message: `${creatureData.name} evolved to ${newAge}!`,
            emoji: creatureData.ageStages[newAge].emoji,
            duration: 3000
        };

        if (window.ui) {
            window.ui.showNotification(notification);
        }
    }
}

// Initialize global creature manager
window.creatureManager = new CreatureManager(window.gameState);
