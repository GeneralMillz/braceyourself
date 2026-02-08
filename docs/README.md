# Brace Yourself - Pattern Designer

> A modern, modular pattern designer for creating alpha bracelet patterns for BraceletBook

## ✨ Features

- **Grid-Based Pattern Editor**: Design patterns on a customizable 4x4 to 80x80 pixel grid
- **Color Palette Management**: Create and manage custom color palettes with ease
- **100+ Template Library**: Pre-made templates in Hearts, Flowers, Animals, Emojis, Turtles
- **Image Import & Auto-Conversion**: Upload JPG/PNG images and automatically convert them to bracelet patterns
- **Web Worker Processing**: Fast, non-blocking image processing with fallback support
- **Color Harmonizer**: Generate harmonious color palettes (complementary, analogous, triadic, pastel, muted)
- **Difficulty Estimator**: Automatically analyze pattern complexity before making bracelets
- **Pattern Export**: Export patterns in text format for BraceletBook uploading
- **Print-Friendly Sheets**: Generate print-ready pattern guides with color legends
- **Recent Sessions**: Continue where you left off with automatic design saving
- **Mobile Responsive**: Fully responsive design for desktop, tablet, and mobile devices
- **Inspiration Gallery**: Browse pre-curated color palette inspirations
- **Keyword Generator**: Auto-generate SEO-friendly keywords for pattern listings

## 🚀 Quick Start

### 1. **Start from a Template**
   - Browse the 100+ pre-made templates organized by category (Hearts, Flowers, Animals, Emojis, Turtles)
   - Click any template to instantly load it into your grid
   - Use Random buttons for inspiration

### 2. **Start from an Image**
   - Upload any JPG, PNG, or WebP image
   - Configure size and color reduction settings
   - Automatically convert to a bracelet pattern with intelligent color quantization

### 3. **Start from Scratch**
   - Begin with a blank grid
   - Build your design pixel by pixel
   - Customize colors with the Color Harmonizer

### 4. **Export & Share**
   - Copy pattern text to clipboard
   - Download as .txt file for archival
   - Print a pattern sheet with color legend
   - Upload directly to BraceletBook

## 📁 Project Structure

```
braceyourself/
├── src/
│   ├── main.js                 # Application entry point
│   ├── core/
│   │   ├── state.js           # Global app state
│   │   ├── grid.js            # Grid rendering & editing
│   │   ├── palette.js         # Color palette management
│   │   ├── export.js          # Pattern export functions
│   │   ├── storage.js         # LocalStorage persistence
│   │   ├── templates.js       # Template library system
│   │   ├── imageImporter.js   # Image processing pipeline
│   │   ├── harmonizer.js      # Color harmony generation
│   │   ├── difficulty.js      # Difficulty estimation
│   │   ├── keywords.js        # Keyword generation
│   │   ├── print.js           # Print functionality
│   │   ├── inspiration.js     # Inspiration gallery
│   │   └── guided.js          # Guided setup flow
│   ├── ui/
│   │   ├── welcome.js         # Welcome screen
│   │   ├── modals.js          # Modal management
│   │   └── mobileBar.js       # Mobile action bar
│   └── utils/
│       ├── colorUtils.js      # Color conversion helpers
│       └── notifications.js   # Notification system
├── templates/
│   ├── turtles/              # 34 turtle designs
│   ├── hearts/               # 25 heart designs
│   ├── flowers/              # 25 flower designs
│   ├── animals/              # 25 animal designs
│   └── emojis/               # 25 emoji designs
├── docs/                      # Documentation
├── portfolio/                 # Portfolio case study
├── index.html                # Main HTML file
├── app.css                   # Stylesheet
├── print.css                 # Print stylesheet
├── theme_soft_pastel.css     # Theme definition
├── imageWorker.js            # Web Worker for image processing
└── README.md                 # This file
```

## 🏗️ Architecture

The app uses a **modular architecture** with ES6 modules for maintainability and scalability:

- **State Management**: Centralized in `src/core/state.js`
- **Feature Modules**: Each major feature has its own module (grid, palette, templates, etc.)
- **Utility Functions**: Shared helpers in `src/utils/`
- **UI Modules**: Separate UI components in `src/ui/`
- **Web Worker**: Heavy image processing offloaded to `imageWorker.js`

See [ARCHITECTURE.md](ARCHITECTURE.md) for detailed diagrams and design rationale.

## ⚙️ Technology Stack

- **HTML5** - Semantic markup
- **CSS3** - Grid layout, flexbox, animations
- **JavaScript ES6+** - Modern JS with modules
- **Web Workers** - Offload heavy image processing
- **LocalStorage** - Persist designs and sessions
- **Canvas API** - Grid rendering and image processing

## 🎨 Template Format

Templates use a character-based pixel grid format with optional colorization:

```json
{
  "id": "unique-template-id",
  "name": "Display Name",
  "category": "hearts",
  "width": 20,
  "height": 20,
  "palette": {
    "A": "#ffc0cb",
    "B": "#ff69b4",
    ".": null
  },
  "pixelGrid": [
    ".....................",
    "....AAA...AAA.......",
    "...AAABAAABAA.......",
    ...
  ]
}
```

See [TEMPLATES.md](TEMPLATES.md) for complete template creation guide.

## 📖 Documentation

- [ARCHITECTURE.md](ARCHITECTURE.md) - System design and module breakdown
- [MODULES.md](MODULES.md) - Detailed function reference
- [UX.md](UX.md) - User experience flows
- [TEMPLATES.md](TEMPLATES.md) - Template creation guide
- [ROADMAP.md](ROADMAP.md) - Planned features

## 🔧 Development

### Run Locally

```bash
# No build step required! Just open index.html in a browser
# Or use a local server:
python -m http.server 8000
```

### Developer Mode

Toggle developer mode in the browser console:

```javascript
window.toggleDevMode()
```

This enables:
- Console logging of state changes
- Debug overlays on grid and quantizer
- Performance metrics

### Testing

The app has been tested in:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 📝 Browser Compatibility

- ✅ Modern browsers (Chrome, Firefox, Safari, Edge)
- ⚠️ Web Worker support required for fast image processing (fallback available)
- ⚠️ LocalStorage required for design persistence
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## 📦 Version History

**v2.0.0**
- Complete modular architecture refactor
- Separated concerns into 17+ feature modules
- Added comprehensive documentation
- Improved code maintainability and extensibility

**v1.5.1**
- Web Worker support for image processing
- Added difficulty estimator
- Added color harmonizer

**v1.0.0**
- Initial release with template support
- Basic pattern editor and export

## 🤝 Contributing

This is a personal project created for portfolio purposes. Design suggestions and bug reports welcome!

## 📄 License

Personal project - All rights reserved.

---

**Made with ❤️ for pattern designers everywhere**
