#  Idle Beastlands

**Breed beasts. Harvest magic. Build your fantasy empire.**

A magical creature farming and breeding idle game where you raise mythical creatures like unicorns, phoenixes, dragons, and more!


###  Core Gameplay
- **Creature Farming**: Raise and care for magical creatures that produce mana
- **Idle Progression**: Creatures continue producing resources while you're away
- **Breeding System**: Combine creatures to discover new hybrids and rare species
- **Multiple Habitats**: Unlock Forest, Volcano, and Glacier biomes
- **Upgrade System**: Improve habitats, food quality, and magical auras

### Creature System
- **10 Unique Creatures** across 6 tiers (Common to Mythic)
- **Age Progression**: Creatures evolve from Baby → Adult → Elder
- **Happiness System**: Keep creatures happy for maximum production
- **Interactive Care**: Feed and play with creatures for bonuses

### Breeding Mechanics
- **Genetic Combinations**: Specific breeding recipes unlock new creatures
- **Discovery System**: Experiment to find unknown combinations
- **Breeding Timer**: 30-second breeding process with visual feedback
- **Success Rates**: Different combinations have varying success chances

### Resource Management
- **Mana**: Primary currency from creature production and clicks
- **Essence**: Rare currency from high-tier creatures
- **Eggs**: Used to hatch new creatures
- **Crystals**: Premium currency for special purchases

### Achievement System
- Track your progress with various achievement goals
- Unlock rewards including bonus resources and crystals
- Multiple achievement categories (breeding, collection, progression)

## Getting Started

### Installation
1. Clone or download this repository
2. Open `index.html` in a modern web browser
3. Start playing immediately - no additional setup required!

### First Steps
1. **Click your starter unicorn** to generate mana
2. **Collect enough mana** to purchase a Fairy Chick (100 mana)
3. **Breed creatures** by selecting two and clicking "Start Breeding"
4. **Upgrade your habitat** to increase production
5. **Unlock new biomes** as you progress

### Controls
- **Click creatures** to generate instant mana
- **Shift+Click** to select creatures for breeding
- **Ctrl+Click** to open creature details
- **Keyboard shortcuts**:
  - `1`, `2`, `3` - Switch between habitats
  - `B` - Start breeding (if ready)
  - `Ctrl+S` - Manual save
  - `P` - Pause/unpause game
  - `ESC` - Close modals

##  Mobile Support

The game is fully responsive and includes:
- Touch-friendly interface
- Swipe gestures for habitat switching
- Optimized layouts for small screens
- Prevented double-tap zoom

##  Technical Features

### Performance
- Efficient idle calculation system
- Smart offline progress handling (up to 24 hours)
- Automatic save system every 5 seconds
- Optimized rendering for smooth gameplay

### Data Persistence
- Automatic local storage saves
- Import/export save functionality (planned)
- Version-safe save system
- Backup and restore capabilities

### Browser Compatibility
- Modern browsers (Chrome, Firefox, Safari, Edge)
- ES6+ JavaScript features
- CSS Grid and Flexbox layouts
- Local Storage API

## Creature Tiers & Examples

| Tier | Creatures | Unlock Method |
|------|-----------|---------------|
| **Common** | Baby Unicorn, Fairy Chick | Starter, Purchase |
| **Uncommon** | Phoenix Hatchling, Ice Fox | Breeding, Farm Level |
| **Rare** | Thunder Griffin, Lava Toad | Breeding, Discovery |
| **Epic** | Draconicorn, Golem Calf | Breeding, Minigame |
| **Legendary** | Celestial Serpent | Complex Breeding |
| **Mythic** | Time Phoenix | Evolution (100 hours) |

##  Development

### File Structure
```
idle-beastlands/
├── index.html          # Main HTML file
├── css/
│   └── styles.css      # All styling and animations
├── js/
│   ├── gameData.js     # Creature definitions and game constants
│   ├── gameState.js    # Save/load system and game state management
│   ├── creatures.js    # Creature interaction and management
│   ├── breeding.js     # Breeding system and combinations
│   ├── ui.js          # User interface management
│   └── game.js        # Main game controller and loops
└── README.md          # This file
```

### Architecture
- **Modular Design**: Each system is separated into its own module
- **Event-Driven**: UI updates based on game state changes
- **Data-Driven**: Creatures and game content defined in data files
- **Scalable**: Easy to add new creatures, habitats, and features

### Debug Commands
Open browser console and use:
```javascript
debug.addMana(1000)     // Add mana
debug.addEggs(5)        // Add eggs
debug.unlockAll()       // Unlock everything
debug.info()            // Show game info
debug.save()            // Manual save
debug.reset()           // Reset game
```

##  Future Features

### Planned Updates
- **Shop System**: Purchase creatures and upgrades with crystals
- **Collection View**: Detailed creature encyclopedia
- **Mini-games**: Interactive ways to discover creatures
- **Social Features**: Share your farm with friends
- **Seasonal Events**: Limited-time creatures and bonuses
- **Prestige System**: Reset for permanent bonuses

### Monetization Features (Ready)
- **Crystal System**: Premium currency implemented
- **Ad Integration Points**: Prepared for ad bonuses
- **Battle Pass Structure**: Achievement system ready for seasons
- **Cosmetic System**: Framework for creature skins

##  License

This project is open source. Feel free to use, modify, and distribute according to your needs.

## Contributing

Contributions are welcome! Areas where help is appreciated:
- New creature designs and abilities
- Additional breeding combinations
- UI/UX improvements
- Performance optimizations
- Mobile enhancements
- Accessibility improvements

## 🎵 Credits

- **Game Design**: Based on idle/incremental game mechanics
- **Emojis**: Using Unicode emoji for creature representations
- **Fonts**: Google Fonts (Orbitron, Nunito)
- **Inspiration**: Cookie Clicker, AdVenture Capitalist, Egg Inc.

---

**Happy Beast Breeding!**

*Version 1.0.0 - Initial Release*
