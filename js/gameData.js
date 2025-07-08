// Game Data Configuration
const GAME_DATA = {
    // Creature definitions based on your tier system
    creatures: {
        'baby-unicorn': {
            id: 'baby-unicorn',
            name: 'Baby Unicorn',
            emoji: '🦄',
            tier: 'common',
            habitat: 'forest',
            baseManaPerSecond: 1.0,
            unlockCost: 0, // Starter creature
            unlockMethod: 'starter',
            breedingIngredients: [],
            ageStages: {
                baby: { duration: 300, multiplier: 1.0, emoji: '🦄' }, // 5 minutes
                adult: { duration: 1800, multiplier: 1.5, emoji: '🦄✨' }, // 30 minutes
                elder: { duration: Infinity, multiplier: 2.0, emoji: '🦄👑' }
            },
            description: 'A magical baby unicorn with healing powers.'
        },
        'fairy-chick': {
            id: 'fairy-chick',
            name: 'Fairy Chick',
            emoji: '🧚',
            tier: 'common',
            habitat: 'forest',
            baseManaPerSecond: 1.2,
            unlockCost: 100,
            unlockMethod: 'purchase',
            breedingIngredients: [],
            ageStages: {
                baby: { duration: 240, multiplier: 1.0, emoji: '🧚' },
                adult: { duration: 1200, multiplier: 1.4, emoji: '🧚‍♀️✨' },
                elder: { duration: Infinity, multiplier: 1.8, emoji: '🧚‍♀️👑' }
            },
            description: 'A tiny fairy that spreads magical dust.'
        },
        'phoenix-hatchling': {
            id: 'phoenix-hatchling',
            name: 'Phoenix Hatchling',
            emoji: '🔥',
            tier: 'uncommon',
            habitat: 'volcano',
            baseManaPerSecond: 2.5,
            unlockCost: 0,
            unlockMethod: 'breeding',
            breedingIngredients: ['fairy-chick', 'baby-unicorn'],
            ageStages: {
                baby: { duration: 600, multiplier: 1.0, emoji: '🔥' },
                adult: { duration: 2400, multiplier: 1.6, emoji: '🐦‍🔥' },
                elder: { duration: Infinity, multiplier: 2.2, emoji: '🐦‍🔥👑' }
            },
            description: 'A legendary fire bird that rises from ashes.'
        },
        'ice-fox': {
            id: 'ice-fox',
            name: 'Ice Fox',
            emoji: '🦊',
            tier: 'uncommon',
            habitat: 'glacier',
            baseManaPerSecond: 2.0,
            unlockCost: 500,
            unlockMethod: 'farmLevel',
            farmLevelRequired: 3,
            breedingIngredients: [],
            ageStages: {
                baby: { duration: 480, multiplier: 1.0, emoji: '🦊' },
                adult: { duration: 1800, multiplier: 1.5, emoji: '🦊❄️' },
                elder: { duration: Infinity, multiplier: 2.0, emoji: '🦊❄️👑' }
            },
            description: 'A mystical arctic fox with ice powers.'
        },
        'thunder-griffin': {
            id: 'thunder-griffin',
            name: 'Thunder Griffin',
            emoji: '⚡',
            tier: 'rare',
            habitat: 'forest',
            baseManaPerSecond: 5.0,
            unlockCost: 0,
            unlockMethod: 'breeding',
            breedingIngredients: ['phoenix-hatchling', 'ice-fox'],
            ageStages: {
                baby: { duration: 900, multiplier: 1.0, emoji: '⚡' },
                adult: { duration: 3600, multiplier: 1.8, emoji: '🦅⚡' },
                elder: { duration: Infinity, multiplier: 2.5, emoji: '🦅⚡👑' }
            },
            description: 'A majestic griffin that commands lightning.'
        },
        'lava-toad': {
            id: 'lava-toad',
            name: 'Lava Toad',
            emoji: '🐸',
            tier: 'rare',
            habitat: 'volcano',
            baseManaPerSecond: 4.5,
            unlockCost: 1500,
            unlockMethod: 'discovery', // Special volcano biome discovery
            breedingIngredients: [],
            ageStages: {
                baby: { duration: 720, multiplier: 1.0, emoji: '🐸' },
                adult: { duration: 2700, multiplier: 1.7, emoji: '🐸🌋' },
                elder: { duration: Infinity, multiplier: 2.3, emoji: '🐸🌋👑' }
            },
            description: 'A rare amphibian that thrives in volcanic heat.'
        },
        'draconicorn': {
            id: 'draconicorn',
            name: 'Draconicorn',
            emoji: '🐲',
            tier: 'epic',
            habitat: 'forest',
            baseManaPerSecond: 12.0,
            unlockCost: 0,
            unlockMethod: 'breeding',
            breedingIngredients: ['thunder-griffin', 'baby-unicorn'], // Modified from original spec
            ageStages: {
                baby: { duration: 1800, multiplier: 1.0, emoji: '🐲' },
                adult: { duration: 7200, multiplier: 2.0, emoji: '🐲🦄' },
                elder: { duration: Infinity, multiplier: 3.0, emoji: '🐲🦄👑' }
            },
            description: 'A legendary fusion of dragon and unicorn.'
        },
        'golem-calf': {
            id: 'golem-calf',
            name: 'Golem Calf',
            emoji: '🗿',
            tier: 'epic',
            habitat: 'glacier',
            baseManaPerSecond: 10.0,
            unlockCost: 5000,
            unlockMethod: 'minigame', // Future feature
            breedingIngredients: [],
            ageStages: {
                baby: { duration: 1200, multiplier: 1.0, emoji: '🗿' },
                adult: { duration: 4800, multiplier: 1.9, emoji: '🗿⛰️' },
                elder: { duration: Infinity, multiplier: 2.8, emoji: '🗿⛰️👑' }
            },
            description: 'A young stone golem with earth magic.'
        },
        'celestial-serpent': {
            id: 'celestial-serpent',
            name: 'Celestial Serpent',
            emoji: '🐍',
            tier: 'legendary',
            habitat: 'forest',
            baseManaPerSecond: 25.0,
            unlockCost: 0,
            unlockMethod: 'breeding',
            breedingIngredients: ['draconicorn', 'golem-calf'],
            ageStages: {
                baby: { duration: 3600, multiplier: 1.0, emoji: '🐍' },
                adult: { duration: 14400, multiplier: 2.2, emoji: '🐍⭐' },
                elder: { duration: Infinity, multiplier: 3.5, emoji: '🐍⭐👑' }
            },
            description: 'A cosmic serpent that bends space and time.'
        },
        'time-phoenix': {
            id: 'time-phoenix',
            name: 'Time Phoenix',
            emoji: '⏰',
            tier: 'mythic',
            habitat: 'volcano',
            baseManaPerSecond: 100.0,
            unlockCost: 0,
            unlockMethod: 'evolution', // Special evolution after 100 hours
            breedingIngredients: [],
            ageStages: {
                baby: { duration: 7200, multiplier: 1.0, emoji: '⏰' },
                adult: { duration: 28800, multiplier: 2.5, emoji: '⏰🔥' },
                elder: { duration: Infinity, multiplier: 5.0, emoji: '⏰🔥👑' }
            },
            description: 'The ultimate phoenix that controls time itself.'
        }
    },

    // Habitat information
    habitats: {
        forest: {
            id: 'forest',
            name: 'Enchanted Forest',
            emoji: '🌲',
            description: 'A mystical woodland where unicorns and fairies thrive.',
            unlockCost: 0,
            baseMultiplier: 1.0
        },
        volcano: {
            id: 'volcano',
            name: 'Volcanic Peaks',
            emoji: '🌋',
            description: 'Fiery mountains where phoenix and fire creatures dwell.',
            unlockCost: 1000,
            baseMultiplier: 1.2
        },
        glacier: {
            id: 'glacier',
            name: 'Crystal Glacier',
            emoji: '❄️',
            description: 'Frozen wastelands home to ice creatures and golems.',
            unlockCost: 2500,
            baseMultiplier: 1.1
        }
    },

    // Upgrade costs and effects
    upgrades: {
        habitat: {
            baseCost: 100,
            costMultiplier: 1.5,
            effect: 1.25, // 25% increase per level
            maxLevel: 50
        },
        food: {
            baseCost: 250,
            costMultiplier: 1.6,
            effect: 1.3, // 30% increase per level
            maxLevel: 30
        },
        magic: {
            baseCost: 500,
            costMultiplier: 1.8,
            effect: 1.5, // 50% increase per level
            maxLevel: 20
        }
    },

    // Achievement definitions
    achievements: [
        {
            id: 'first-creature',
            name: 'Welcome to Beastlands',
            description: 'Hatch your first creature',
            icon: '🥚',
            condition: 'creatures_hatched',
            target: 1,
            reward: { crystals: 5 }
        },
        {
            id: 'mana-collector',
            name: 'Mana Collector',
            description: 'Collect 1,000 mana',
            icon: '✨',
            condition: 'total_mana_earned',
            target: 1000,
            reward: { crystals: 10 }
        },
        {
            id: 'first-breed',
            name: 'Genetic Engineer',
            description: 'Successfully breed your first hybrid',
            icon: '🧬',
            condition: 'successful_breeds',
            target: 1,
            reward: { eggs: 5, crystals: 15 }
        },
        {
            id: 'tier-collector',
            name: 'Tier Hunter',
            description: 'Collect creatures from 3 different tiers',
            icon: '🏆',
            condition: 'unique_tiers',
            target: 3,
            reward: { essence: 10, crystals: 20 }
        },
        {
            id: 'habitat-master',
            name: 'Habitat Master',
            description: 'Unlock all three habitats',
            icon: '🏠',
            condition: 'habitats_unlocked',
            target: 3,
            reward: { essence: 25, crystals: 50 }
        }
    ],

    // Breeding combinations
    breedingCombos: {
        'fairy-chick+baby-unicorn': 'phoenix-hatchling',
        'baby-unicorn+fairy-chick': 'phoenix-hatchling',
        'phoenix-hatchling+ice-fox': 'thunder-griffin',
        'ice-fox+phoenix-hatchling': 'thunder-griffin',
        'thunder-griffin+baby-unicorn': 'draconicorn',
        'baby-unicorn+thunder-griffin': 'draconicorn',
        'draconicorn+golem-calf': 'celestial-serpent',
        'golem-calf+draconicorn': 'celestial-serpent'
    },

    // Constants
    constants: {
        CLICK_MANA_MULTIPLIER: 1.0, // Base mana per click
        BREEDING_BASE_COST: 50,
        BREEDING_TIME: 30, // seconds
        SAVE_INTERVAL: 5000, // ms
        MAGIC_SURGE_DURATION: 300, // seconds (5 minutes)
        MAGIC_SURGE_MULTIPLIER: 2.0,
        OFFLINE_CALCULATION_LIMIT: 86400 // 24 hours in seconds
    }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GAME_DATA;
}

