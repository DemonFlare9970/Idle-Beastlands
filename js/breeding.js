// Breeding System Module
class BreedingManager {
    constructor(gameState) {
        this.gameState = gameState;
        this.breedingInProgress = false;
        this.breedingTimer = null;
    }

    // Set creature in breeding slot
    setBreedingSlot(slotIndex, habitat, creatureSlot) {
        if (this.breedingInProgress) return false;
        
        const creature = this.gameState.getCreature(habitat, creatureSlot);
        if (!creature) return false;

        // Check if creature is already in the other slot
        const otherSlot = slotIndex === 0 ? 1 : 0;
        if (this.gameState.breedingSlots[otherSlot] && 
            this.gameState.breedingSlots[otherSlot].habitat === habitat &&
            this.gameState.breedingSlots[otherSlot].slotIndex === creatureSlot) {
            return false;
        }

        return this.gameState.setBreedingSlot(slotIndex, habitat, creatureSlot);
    }

    // Clear breeding slot
    clearBreedingSlot(slotIndex) {
        if (this.breedingInProgress) return false;
        this.gameState.clearBreedingSlot(slotIndex);
        return true;
    }

    // Check if breeding is possible
    canBreed() {
        return !this.breedingInProgress && this.gameState.canBreed();
    }

    // Start breeding process
    startBreeding() {
        if (!this.canBreed()) return false;

        this.breedingInProgress = true;
        
        // Show breeding animation/timer
        if (window.ui) {
            window.ui.startBreedingAnimation();
        }

        // Set timer for breeding completion
        this.breedingTimer = setTimeout(() => {
            this.completeBreeding();
        }, GAME_DATA.constants.BREEDING_TIME * 1000);

        return true;
    }

    // Complete breeding process
    completeBreeding() {
        if (!this.breedingInProgress) return;

        const result = this.gameState.attemptBreeding();
        this.breedingInProgress = false;
        
        if (this.breedingTimer) {
            clearTimeout(this.breedingTimer);
            this.breedingTimer = null;
        }

        // Show result to player
        if (window.ui) {
            window.ui.showBreedingResult(result);
        }

        return result;
    }

    // Get breeding prediction
    getBreedingPrediction() {
        if (!this.gameState.breedingSlots[0] || !this.gameState.breedingSlots[1]) {
            return null;
        }

        const creature1 = this.gameState.breedingSlots[0].creatureId;
        const creature2 = this.gameState.breedingSlots[1].creatureId;
        
        const combo1 = `${creature1}+${creature2}`;
        const combo2 = `${creature2}+${creature1}`;
        
        const result = GAME_DATA.breedingCombos[combo1] || GAME_DATA.breedingCombos[combo2];
        
        if (result) {
            const resultCreature = GAME_DATA.creatures[result];
            return {
                type: 'success',
                creature: resultCreature,
                chance: 100
            };
        } else {
            return {
                type: 'unknown',
                creature: null,
                chance: 10, // 10% chance for random egg
                possibleResults: ['Random Egg', 'Nothing']
            };
        }
    }

    // Get all possible breeding combinations
    getAllBreedingCombinations() {
        const combinations = [];
        const unlockedCreatures = Array.from(this.gameState.unlockedCreatures);
        
        Object.entries(GAME_DATA.breedingCombos).forEach(([combo, result]) => {
            const [creature1, creature2] = combo.split('+');
            
            if (unlockedCreatures.includes(creature1) && unlockedCreatures.includes(creature2)) {
                const resultCreature = GAME_DATA.creatures[result];
                combinations.push({
                    ingredient1: GAME_DATA.creatures[creature1],
                    ingredient2: GAME_DATA.creatures[creature2],
                    result: resultCreature,
                    discovered: this.gameState.unlockedCreatures.has(result)
                });
            }
        });

        return combinations.sort((a, b) => {
            const tierOrder = ['common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic'];
            return tierOrder.indexOf(a.result.tier) - tierOrder.indexOf(b.result.tier);
        });
    }

    // Get breeding hints
    getBreedingHints() {
        const unlockedCreatures = Array.from(this.gameState.unlockedCreatures);
        const hints = [];

        // Find combinations where player has one ingredient but not the other
        Object.entries(GAME_DATA.breedingCombos).forEach(([combo, result]) => {
            const [creature1, creature2] = combo.split('+');
            
            if (!this.gameState.unlockedCreatures.has(result)) {
                const has1 = unlockedCreatures.includes(creature1);
                const has2 = unlockedCreatures.includes(creature2);
                
                if (has1 && !has2) {
                    hints.push({
                        knownCreature: GAME_DATA.creatures[creature1],
                        unknownCreature: GAME_DATA.creatures[creature2],
                        result: GAME_DATA.creatures[result],
                        hint: `Try combining ${GAME_DATA.creatures[creature1].name} with a ${GAME_DATA.creatures[creature2].tier} tier creature`
                    });
                } else if (!has1 && has2) {
                    hints.push({
                        knownCreature: GAME_DATA.creatures[creature2],
                        unknownCreature: GAME_DATA.creatures[creature1],
                        result: GAME_DATA.creatures[result],
                        hint: `Try combining ${GAME_DATA.creatures[creature2].name} with a ${GAME_DATA.creatures[creature1].tier} tier creature`
                    });
                }
            }
        });

        return hints.slice(0, 3); // Return top 3 hints
    }

    // Calculate breeding success rate based on creature compatibility
    calculateSuccessRate(creature1Id, creature2Id) {
        const combo1 = `${creature1Id}+${creature2Id}`;
        const combo2 = `${creature2Id}+${creature1Id}`;
        
        if (GAME_DATA.breedingCombos[combo1] || GAME_DATA.breedingCombos[combo2]) {
            return 100; // Known combination
        }

        const creature1 = GAME_DATA.creatures[creature1Id];
        const creature2 = GAME_DATA.creatures[creature2Id];
        
        if (!creature1 || !creature2) return 0;

        // Same habitat bonus
        let baseRate = 10;
        if (creature1.habitat === creature2.habitat) {
            baseRate += 5;
        }

        // Tier compatibility
        const tierOrder = ['common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic'];
        const tier1Index = tierOrder.indexOf(creature1.tier);
        const tier2Index = tierOrder.indexOf(creature2.tier);
        const tierDifference = Math.abs(tier1Index - tier2Index);
        
        if (tierDifference <= 1) {
            baseRate += 5; // Adjacent tiers
        } else if (tierDifference > 3) {
            baseRate -= 5; // Very different tiers
        }

        return Math.max(5, Math.min(20, baseRate)); // Clamp between 5-20%
    }

    // Get breeding cost
    getBreedingCost() {
        return GAME_DATA.constants.BREEDING_BASE_COST;
    }

    // Get breeding time remaining
    getBreedingTimeRemaining() {
        if (!this.breedingInProgress || !this.breedingTimer) return 0;
        
        // This is approximate since we don't track the exact start time
        return GAME_DATA.constants.BREEDING_TIME;
    }

    // Cancel breeding (if allowed)
    cancelBreeding() {
        if (!this.breedingInProgress) return false;
        
        if (this.breedingTimer) {
            clearTimeout(this.breedingTimer);
            this.breedingTimer = null;
        }
        
        this.breedingInProgress = false;
        
        // Refund half the cost
        const refund = Math.floor(GAME_DATA.constants.BREEDING_BASE_COST * 0.5);
        this.gameState.addResource('mana', refund);
        
        if (window.ui) {
            window.ui.showNotification({
                type: 'info',
                title: 'Breeding Cancelled',
                message: `Refunded ${refund} mana`,
                duration: 2000
            });
        }
        
        return true;
    }

    // Get random breeding result for unknown combinations
    getRandomBreedingResult() {
        const random = Math.random();
        
        if (random < 0.05) { // 5% chance for rare egg
            return {
                type: 'rare_egg',
                reward: { eggs: 2, essence: 1 }
            };
        } else if (random < 0.15) { // 10% chance for common egg
            return {
                type: 'common_egg',
                reward: { eggs: 1 }
            };
        } else if (random < 0.25) { // 10% chance for mana bonus
            return {
                type: 'mana_bonus',
                reward: { mana: 100 }
            };
        } else {
            return {
                type: 'failure',
                reward: {}
            };
        }
    }

    // Auto-discover new combinations through experimentation
    discoverNewCombination(creature1Id, creature2Id) {
        // This could be used for future expansions where players can discover
        // new combinations not in the base data
        const combinationKey = `${creature1Id}+${creature2Id}`;
        
        // For now, just log the attempt
        console.log(`Attempted breeding combination: ${combinationKey}`);
        
        // Future: Could save experimental combinations and their results
        // Could implement a research system where repeated attempts reveal new combinations
    }

    // Get creature breeding stats
    getCreatureBreedingStats(creatureId) {
        const creature = GAME_DATA.creatures[creatureId];
        if (!creature) return null;

        // Count how many combinations this creature is part of
        let participatesIn = 0;
        let canProduce = [];

        Object.entries(GAME_DATA.breedingCombos).forEach(([combo, result]) => {
            const [creature1, creature2] = combo.split('+');
            if (creature1 === creatureId || creature2 === creatureId) {
                participatesIn++;
                canProduce.push(GAME_DATA.creatures[result]);
            }
        });

        return {
            participatesIn,
            canProduce: canProduce.filter((c, i, arr) => 
                arr.findIndex(other => other.id === c.id) === i
            ), // Remove duplicates
            tier: creature.tier,
            habitat: creature.habitat
        };
    }
}

// Initialize global breeding manager
window.breedingManager = new BreedingManager(window.gameState);
