class UIManager {
    constructor() {
        this.currentHabitat = 'forest';
        this.updateInterval = null;
        this.notifications = [];
        this.modals = {
            creature: null,
            breeding: null,
            shop: null,
            collection: null,
            settings: null
        };
        
        this.initializeUI();
        this.bindEvents();
        this.startUpdateLoop();
    }

    initializeUI() {
        this.updateResourceDisplay();
        this.updateHabitatDisplay();
        this.updateCreatureDisplay();
        this.updateBreedingDisplay();
        this.updateAchievementDisplay();
        this.updateUpgradeDisplay();
    }

    bindEvents() {
        document.querySelectorAll('.tab-button').forEach(button => {
            button.addEventListener('click', (e) => {
                this.switchHabitat(e.target.dataset.habitat);
            });
        });

        document.getElementById('habitat-upgrade')?.addEventListener('click', () => {
            this.purchaseUpgrade('habitat');
        });
        document.getElementById('food-upgrade')?.addEventListener('click', () => {
            this.purchaseUpgrade('food');
        });
        document.getElementById('magic-upgrade')?.addEventListener('click', () => {
            this.purchaseUpgrade('magic');
        });

        document.getElementById('breed-button')?.addEventListener('click', () => {
            this.startBreeding();
        });
        document.getElementById('breed-slot-1')?.addEventListener('click', () => {
            this.clearBreedingSlot(0);
        });
        document.getElementById('breed-slot-2')?.addEventListener('click', () => {
            this.clearBreedingSlot(1);
        });
        document.getElementById('shop-btn')?.addEventListener('click', () => {
            this.showShopModal();
        });
        document.getElementById('collection-btn')?.addEventListener('click', () => {
            this.showCollectionModal();
        });
        document.getElementById('settings-btn')?.addEventListener('click', () => {
            this.showSettingsModal();
        });
        document.getElementById('activate-surge')?.addEventListener('click', () => {
            this.activateMagicSurge();
        });
        document.querySelectorAll('.close-modal').forEach(button => {
            button.addEventListener('click', (e) => {
                this.closeModal(e.target.closest('.modal'));
            });
        });
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeModal(e.target);
            }
        });
    }

    startUpdateLoop() {
        this.updateInterval = setInterval(() => {
            this.updateResourceDisplay();
            this.updateCreatureDisplay();
            this.updateBreedingDisplay();
            this.updateMagicSurgeDisplay();
            this.checkEvolutions();
            this.updateIdleIncome();
        }, 1000);
    }

    updateResourceDisplay() {
        document.getElementById('mana-value').textContent = this.formatNumber(gameState.getResource('mana'));
        document.getElementById('essence-value').textContent = this.formatNumber(gameState.getResource('essence'));
        document.getElementById('eggs-value').textContent = this.formatNumber(gameState.getResource('eggs'));
        document.getElementById('crystals-value').textContent = this.formatNumber(gameState.getResource('crystals'));
    }

    switchHabitat(habitatId) {
        if (!gameState.unlockedHabitats.has(habitatId)) {
            this.showNotification({
                type: 'error',
                title: 'Habitat Locked',
                message: `Unlock ${GAME_DATA.habitats[habitatId].name} first!`,
                duration: 2000
            });
            return;
        }

        this.currentHabitat = habitatId;
        gameState.currentHabitat = habitatId;

        document.querySelectorAll('.tab-button').forEach(button => {
            button.classList.toggle('active', button.dataset.habitat === habitatId);
        });

        this.updateHabitatDisplay();
        this.updateCreatureDisplay();
        this.updateUpgradeDisplay();
    }

    updateHabitatDisplay() {
        const habitat = GAME_DATA.habitats[this.currentHabitat];
        document.getElementById('habitat-name').textContent = habitat.name;
        document.getElementById('habitat-description').textContent = habitat.description;
    }

    updateCreatureDisplay() {
        const grid = document.getElementById('creature-grid');
        if (!grid) return;

        grid.innerHTML = '';
        const maxSlots = gameState.getMaxSlots(this.currentHabitat);

        for (let i = 0; i < maxSlots; i++) {
            const creature = gameState.getCreature(this.currentHabitat, i);
            const card = this.createCreatureCard(creature, this.currentHabitat, i);
            grid.appendChild(card);
        }
    }

    createCreatureCard(creature, habitat, slotIndex) {
        const card = document.createElement('div');
        
        if (creature) {
            const info = creatureManager.getCreatureDisplayInfo(habitat, slotIndex);
            if (!info) return card;

            card.className = `creature-card tier-${info.tier}`;
            card.innerHTML = `
                <div class="creature-age">${info.age}</div>
                <div class="creature-emoji">${info.emoji}</div>
                <div class="creature-name">${info.name}</div>
                <div class="creature-tier tier-${info.tier}">${info.tier}</div>
                <div class="creature-production">${this.formatNumber(info.production)}/sec</div>
                ${info.happiness < 80 ? `<div class="happiness-indicator">😴 ${info.happiness}%</div>` : ''}
            `;

            card.addEventListener('click', (e) => {
                if (e.shiftKey) {
                    this.selectCreatureForBreeding(habitat, slotIndex);
                } else if (e.ctrlKey || e.metaKey) {
                    this.showCreatureModal(habitat, slotIndex);
                } else {
                    creatureManager.handleCreatureClick(habitat, slotIndex, e);
                }
            });

            if (info.happiness > 80) {
                card.classList.add('floating');
            }

            if (info.buffs.length > 0) {
                card.classList.add('sparkling');
            }

        } else {
            card.className = 'creature-card empty';
            card.innerHTML = `
                <div class="creature-emoji">➕</div>
                <div class="creature-name">Empty Slot</div>
                <div class="creature-tier">Hatch an egg!</div>
            `;

            card.addEventListener('click', () => {
                this.showHatchingModal(habitat, slotIndex);
            });
        }

        return card;
    }

    // Breeding UI
    updateBreedingDisplay() {
        const slot1 = document.getElementById('breed-slot-1');
        const slot2 = document.getElementById('breed-slot-2');
        const button = document.getElementById('breed-button');

        this.updateBreedingSlot(slot1, 0);
        this.updateBreedingSlot(slot2, 1);

        if (button) {
            const canBreed = breedingManager.canBreed();
            button.disabled = !canBreed;
            
            if (breedingManager.breedingInProgress) {
                button.innerHTML = `
                    <span>🔄 Breeding...</span>
                    <span class="breed-cost">Please wait</span>
                `;
            } else {
                button.innerHTML = `
                    <span>🥚 Start Breeding</span>
                    <span class="breed-cost">Cost: ${breedingManager.getBreedingCost()} ✨</span>
                `;
            }
        }

        // Update breeding prediction
        this.updateBreedingPrediction();
    }

    updateBreedingSlot(slotElement, slotIndex) {
        if (!slotElement) return;

        const slot = gameState.breedingSlots[slotIndex];
        if (slot) {
            const creature = gameState.getCreature(slot.habitat, slot.slotIndex);
            const creatureData = GAME_DATA.creatures[creature.id];
            
            slotElement.className = 'breed-slot filled';
            slotElement.innerHTML = `
                <div class="slot-content">
                    <div class="slot-icon">${creatureData.ageStages[creature.age].emoji}</div>
                    <div class="slot-text">${creatureData.name}</div>
                </div>
            `;
        } else {
            slotElement.className = 'breed-slot';
            slotElement.innerHTML = `
                <div class="slot-content">
                    <span class="slot-icon">➕</span>
                    <span class="slot-text">Select Creature</span>
                </div>
            `;
        }
    }

    updateBreedingPrediction() {
        const prediction = breedingManager.getBreedingPrediction();
        const info = document.querySelector('.breeding-info');
        
        if (!info || !prediction) return;

        if (prediction.type === 'success') {
            info.innerHTML = `
                <strong>Predicted Result:</strong><br>
                ${prediction.creature.emoji} ${prediction.creature.name}<br>
                <span class="tier-${prediction.creature.tier}">${prediction.creature.tier}</span> tier
            `;
        } else if (prediction.type === 'unknown') {
            info.innerHTML = `
                <strong>Unknown Combination</strong><br>
                ${prediction.chance}% chance for random reward<br>
                <small>Experiment to discover new creatures!</small>
            `;
        } else {
            info.textContent = 'Combine two creatures to discover new hybrids!';
        }
    }

    selectCreatureForBreeding(habitat, slotIndex) {
        let targetSlot = -1;
        if (!gameState.breedingSlots[0]) {
            targetSlot = 0;
        } else if (!gameState.breedingSlots[1]) {
            targetSlot = 1;
        } else {
            targetSlot = 0;
        }

        if (breedingManager.setBreedingSlot(targetSlot, habitat, slotIndex)) {
            this.showNotification({
                type: 'success',
                title: 'Creature Selected',
                message: `Added to breeding slot ${targetSlot + 1}`,
                duration: 1500
            });
        }
    }

    clearBreedingSlot(slotIndex) {
        if (breedingManager.clearBreedingSlot(slotIndex)) {
            this.showNotification({
                type: 'info',
                title: 'Slot Cleared',
                message: 'Breeding slot cleared',
                duration: 1000
            });
        }
    }

    startBreeding() {
        if (breedingManager.startBreeding()) {
            this.showNotification({
                type: 'info',
                title: 'Breeding Started',
                message: 'Your creatures are breeding...',
                duration: 2000
            });
        }
    }

    startBreedingAnimation() {
        const breedButton = document.getElementById('breed-button');
        if (breedButton) {
            breedButton.classList.add('pulsing');
        }
    }

    showBreedingResult(result) {
        const breedButton = document.getElementById('breed-button');
        if (breedButton) {
            breedButton.classList.remove('pulsing');
        }

        if (result && result !== 'failure' && result !== 'egg') {
            const creature = GAME_DATA.creatures[result];
            this.showNotification({
                type: 'success',
                title: 'Breeding Success!',
                message: `Discovered ${creature.emoji} ${creature.name}!`,
                duration: 4000
            });
        } else if (result === 'egg') {
            this.showNotification({
                type: 'success',
                title: 'Breeding Reward!',
                message: 'Received a mysterious egg!',
                duration: 3000
            });
        } else {
            this.showNotification({
                type: 'warning',
                title: 'Breeding Failed',
                message: 'The creatures were not compatible.',
                duration: 2000
            });
        }
    }

    // Upgrade system
    updateUpgradeDisplay() {
        const habitat = this.currentHabitat;
        const upgrades = gameState.upgrades[habitat];

        this.updateUpgradeButton('habitat-upgrade', 'habitat', upgrades.habitat);
        this.updateUpgradeButton('food-upgrade', 'food', upgrades.food);
        this.updateUpgradeButton('magic-upgrade', 'magic', upgrades.magic);
    }

    updateUpgradeButton(buttonId, upgradeType, currentLevel) {
        const button = document.getElementById(buttonId);
        if (!button) return;

        const cost = gameState.getUpgradeCost(this.currentHabitat, upgradeType);
        const maxLevel = GAME_DATA.upgrades[upgradeType].maxLevel;
        const canAfford = gameState.getResource('mana') >= cost;
        const isMaxLevel = currentLevel >= maxLevel;

        button.disabled = !canAfford || isMaxLevel;

        const costElement = button.querySelector('.upgrade-cost');
        if (isMaxLevel) {
            costElement.textContent = 'MAX LEVEL';
        } else {
            costElement.textContent = `Cost: ${this.formatNumber(cost)} ✨`;
        }

        const nameElement = button.querySelector('.upgrade-name');
        const baseName = nameElement.textContent.split(' (')[0]; // Remove existing level
        nameElement.textContent = `${baseName} (Lv.${currentLevel})`;
    }

    purchaseUpgrade(upgradeType) {
        if (gameState.purchaseUpgrade(this.currentHabitat, upgradeType)) {
            this.showNotification({
                type: 'success',
                title: 'Upgrade Purchased!',
                message: `${upgradeType} upgrade improved!`,
                duration: 2000
            });
            this.updateUpgradeDisplay();
        } else {
            this.showNotification({
                type: 'error',
                title: 'Cannot Upgrade',
                message: 'Not enough mana or max level reached',
                duration: 2000
            });
        }
    }

    // Achievement display
    updateAchievementDisplay() {
        const list = document.getElementById('achievement-list');
        if (!list) return;

        list.innerHTML = '';

        GAME_DATA.achievements.forEach(achievement => {
            const completed = !!gameState.achievements[achievement.id];
            const achievementElement = document.createElement('div');
            achievementElement.className = `achievement ${completed ? 'completed' : ''}`;
            
            achievementElement.innerHTML = `
                <div class="achievement-icon">${achievement.icon}</div>
                <div class="achievement-info">
                    <div class="achievement-name">${achievement.name}</div>
                    <div class="achievement-description">${achievement.description}</div>
                    ${completed ? '<div class="achievement-completed">✅ Completed</div>' : ''}
                </div>
            `;

            list.appendChild(achievementElement);
        });
    }

    updateMagicSurgeDisplay() {
        const section = document.getElementById('magic-surge');
        if (!section) return;

        const surge = gameState.magicSurge;
        const canActivate = surge.nextAvailable <= Date.now() && !surge.active;

        if (surge.active || canActivate) {
            section.style.display = 'block';
            
            if (surge.active) {
                const timer = document.getElementById('surge-timer');
                if (timer) {
                    const minutes = Math.floor(surge.timeRemaining / 60);
                    const seconds = surge.timeRemaining % 60;
                    timer.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
                }
                
                const button = document.getElementById('activate-surge');
                if (button) {
                    button.style.display = 'none';
                }
            } else {
                document.getElementById('activate-surge').style.display = 'block';
            }
        } else {
            section.style.display = 'none';
        }
    }

    activateMagicSurge() {
        if (gameState.startMagicSurge()) {
            this.showNotification({
                type: 'success',
                title: 'Magic Surge Activated!',
                message: 'Double mana production for 5 minutes!',
                duration: 3000
            });
        }
    }

    // Idle income display
    updateIdleIncome() {
        gameState.updateCreatureAges();
        
        // Calculate and add idle income
        const income = gameState.calculateIdleIncome();
        if (income > 0) {
            gameState.addResource('mana', income);
        }

        gameState.updateMagicSurge();
    }

    checkEvolutions() {
        creatureManager.checkEvolutions();
    }

    showCreatureModal(habitat, slotIndex) {
        const creature = creatureManager.getCreatureDisplayInfo(habitat, slotIndex);
        if (!creature) return;

        const modal = document.getElementById('creature-modal');
        if (!modal) return;

        document.getElementById('modal-creature-name').textContent = creature.name;
        document.getElementById('modal-creature-image').textContent = creature.emoji;
        document.getElementById('modal-creature-age').textContent = creature.age;
        document.getElementById('modal-creature-tier').textContent = creature.tier;
        document.getElementById('modal-creature-production').textContent = this.formatNumber(creature.production);
        document.getElementById('modal-creature-evolution').textContent = creature.nextEvolution;

        // Update action buttons
        const feedBtn = modal.querySelector('.feed-btn');
        const playBtn = modal.querySelector('.play-btn');
        const breedBtn = modal.querySelector('.select-breed-btn');

        if (feedBtn) {
            feedBtn.disabled = !creature.canFeed;
            feedBtn.onclick = () => {
                if (creatureManager.feedCreature(habitat, slotIndex)) {
                    this.showNotification({
                        type: 'success',
                        title: 'Fed Creature',
                        message: '+50% production for 1 hour!',
                        duration: 2000
                    });
                }
            };
        }

        if (playBtn) {
            playBtn.disabled = !creature.canPlay;
            playBtn.onclick = () => {
                if (creatureManager.playWithCreature(habitat, slotIndex)) {
                    this.showNotification({
                        type: 'success',
                        title: 'Played with Creature',
                        message: '+15% happiness!',
                        duration: 2000
                    });
                }
            };
        }

        if (breedBtn) {
            breedBtn.onclick = () => {
                this.selectCreatureForBreeding(habitat, slotIndex);
                this.closeModal(modal);
            };
        }

        modal.style.display = 'block';
    }

    showHatchingModal(habitat, slotIndex) {
        // Create and show hatching modal
        const availableCreatures = creatureManager.getAvailableCreatures();
        const eggs = gameState.getResource('eggs');

        if (eggs === 0) {
            this.showNotification({
                type: 'error',
                title: 'No Eggs Available',
                message: 'Breed creatures to get eggs!',
                duration: 2000
            });
            return;
        }

        // Simple implementation - for now just hatch a random unlocked creature
        const commonCreatures = availableCreatures.filter(c => c.tier === 'common');
        if (commonCreatures.length > 0) {
            const randomCreature = commonCreatures[Math.floor(Math.random() * commonCreatures.length)];
            if (creatureManager.hatchCreature(randomCreature.id, habitat)) {
                this.showNotification({
                    type: 'success',
                    title: 'Creature Hatched!',
                    message: `${randomCreature.emoji} ${randomCreature.name} joined your farm!`,
                    duration: 3000
                });
            }
        }
    }

    showShopModal() {
        // Implement shop modal
        this.showNotification({
            type: 'info',
            title: 'Coming Soon',
            message: 'Shop feature will be available in the next update!',
            duration: 2000
        });
    }

    showCollectionModal() {
        // Implement collection modal showing all creatures
        this.showNotification({
            type: 'info',
            title: 'Coming Soon',
            message: 'Creature collection will be available soon!',
            duration: 2000
        });
    }

    showSettingsModal() {
        // Implement settings modal
        this.showNotification({
            type: 'info',
            title: 'Settings',
            message: 'Save/Load and other settings coming soon!',
            duration: 2000
        });
    }

    closeModal(modal) {
        if (modal) {
            modal.style.display = 'none';
        }
    }

    // Notification system
    showNotification(notification) {
        const container = this.getNotificationContainer();
        const element = document.createElement('div');
        element.className = `notification notification-${notification.type}`;
        
        element.innerHTML = `
            <div class="notification-content">
                <div class="notification-title">${notification.title}</div>
                <div class="notification-message">${notification.message}</div>
            </div>
        `;

        container.appendChild(element);

        // Animate in
        setTimeout(() => element.classList.add('show'), 100);

        // Auto remove
        setTimeout(() => {
            element.classList.remove('show');
            setTimeout(() => {
                if (element.parentNode) {
                    element.parentNode.removeChild(element);
                }
            }, 300);
        }, notification.duration || 3000);
    }

    getNotificationContainer() {
        let container = document.getElementById('notification-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'notification-container';
            container.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 2000;
                pointer-events: none;
            `;
            document.body.appendChild(container);
        }
        return container;
    }

    showOfflineModal(offlineTime, manaEarned) {
        const hours = Math.floor(offlineTime / 3600);
        const minutes = Math.floor((offlineTime % 3600) / 60);
        
        let timeText = '';
        if (hours > 0) {
            timeText = `${hours}h ${minutes}m`;
        } else {
            timeText = `${minutes}m`;
        }

        this.showNotification({
            type: 'info',
            title: 'Welcome Back!',
            message: `You were away for ${timeText} and earned ${this.formatNumber(manaEarned)} mana!`,
            duration: 5000
        });
    }

    // Utility functions
    formatNumber(num) {
        if (num < 1000) return Math.floor(num).toString();
        if (num < 1000000) return (num / 1000).toFixed(1) + 'K';
        if (num < 1000000000) return (num / 1000000).toFixed(1) + 'M';
        return (num / 1000000000).toFixed(1) + 'B';
    }

    formatTime(seconds) {
        if (seconds < 60) return `${Math.floor(seconds)}s`;
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        return `${hours}h ${minutes}m`;
    }
}

// Initialize UI when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.ui = new UIManager();
});
