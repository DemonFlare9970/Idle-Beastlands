# 🏰 Idle Beastlands - GitHub Pages

**Live Demo:** [Play Idle Beastlands](https://yourusername.github.io/idle-beastlands)

*Replace `yourusername` with your actual GitHub username*

## 🚀 Quick Deploy to GitHub Pages

### Step 1: Fork or Clone
1. **Fork this repository** to your GitHub account, or
2. **Clone and push** to your own repository:
   ```bash
   git clone https://github.com/yourusername/idle-beastlands.git
   cd idle-beastlands
   git remote set-url origin https://github.com/yourusername/idle-beastlands.git
   git push -u origin main
   ```

### Step 2: Enable GitHub Pages
1. Go to your repository on GitHub
2. Click **Settings** tab
3. Scroll down to **Pages** section
4. Under **Source**, select **GitHub Actions**
5. The game will automatically deploy when you push changes!

### Step 3: Access Your Game
- Your game will be available at: `https://yourusername.github.io/idle-beastlands`
- It may take a few minutes for the first deployment

## 🎮 Game Features

**Breed beasts. Harvest magic. Build your fantasy empire.**

A magical creature farming and breeding idle game where you raise mythical creatures like unicorns, phoenixes, dragons, and more!

### ✨ Core Features
- **🦄 10 Unique Creatures** across 6 tiers (Common to Mythic)
- **🧬 Advanced Breeding System** with genetic combinations
- **🏠 Three Biomes** - Forest, Volcano, and Glacier
- **⚡ Magic Surge Events** for bonus production
- **📱 Mobile Responsive** with touch controls
- **💾 Auto-Save System** with offline progress
- **🏆 Achievement System** with rewards

### 🎯 How to Play
1. **Click creatures** to generate mana instantly
2. **Breed combinations** to discover new hybrids
3. **Upgrade habitats** to boost production
4. **Unlock new biomes** as you progress
5. **Collect achievements** for bonus rewards

### 🎮 Controls
- **Click** creatures for mana
- **Shift+Click** to select for breeding
- **Ctrl+Click** for creature details
- **Keyboard shortcuts**: 1/2/3 (habitats), B (breed), P (pause)

## 🛠️ Technical Details

### File Structure
```
idle-beastlands/
├── index.html          # Main game file
├── css/
│   └── styles.css      # Game styling
├── js/
│   ├── gameData.js     # Creature definitions
│   ├── gameState.js    # Save/load system
│   ├── creatures.js    # Creature management
│   ├── breeding.js     # Breeding system
│   ├── ui.js          # User interface
│   └── game.js        # Main controller
└── .github/
    └── workflows/
        └── deploy.yml  # GitHub Pages deployment
```

### Browser Compatibility
- ✅ Chrome, Firefox, Safari, Edge
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)
- ✅ Modern JavaScript features (ES6+)
- ✅ Local Storage for save data

### Performance
- **Efficient idle calculations** for smooth gameplay
- **Smart offline progress** (up to 24 hours)
- **Optimized rendering** for 60fps animations
- **Automatic save system** every 5 seconds

## 🎨 Customization

### Adding New Creatures
Edit `js/gameData.js` to add new creatures:
```javascript
'new-creature': {
    id: 'new-creature',
    name: 'New Creature',
    emoji: '🐻',
    tier: 'common',
    habitat: 'forest',
    baseManaPerSecond: 2.0,
    // ... more properties
}
```

### Adding Breeding Combinations
Add to the `breedingCombos` section:
```javascript
'creature1+creature2': 'result-creature'
```

### Styling Changes
Modify `css/styles.css` for visual customizations:
- Colors and gradients
- Animations and effects
- Layout and spacing
- Mobile responsiveness

## 🔧 Development

### Local Development
1. **Clone the repository**
2. **Open `index.html`** in a browser
3. **Make changes** to any files
4. **Refresh browser** to see updates

### Debug Console
Open browser console and use:
```javascript
debug.addMana(1000)     // Add mana
debug.addEggs(5)        // Add eggs
debug.unlockAll()       // Unlock everything
debug.info()            // Show game info
debug.save()            // Manual save
debug.reset()           // Reset game
```

### Testing
- Test on different screen sizes
- Verify touch controls on mobile
- Check save/load functionality
- Test offline progress calculation

## 📈 Analytics & Monetization Ready

### Prepared Integration Points
- **Crystal system** for premium currency
- **Ad bonus slots** ready for implementation
- **Battle pass structure** via achievements
- **Analytics events** for user tracking

### Future Enhancements
- Social sharing features
- Leaderboards and competitions
- Seasonal events and content
- Push notifications for mobile

## 🤝 Contributing

Contributions welcome! Areas for improvement:
- New creature designs
- Additional breeding combinations
- UI/UX enhancements
- Mobile optimizations
- Accessibility improvements

### How to Contribute
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

Open source project - feel free to use, modify, and distribute!

## 🎉 Deployment Success

Once deployed, your game will be live at:
**https://yourusername.github.io/idle-beastlands**

Share your magical creature farm with the world! 🦄✨

---

*Happy Beast Breeding!*
