# Module Reference

Detailed API documentation for all app modules.

## Core Modules

### `state.js`
Global application state container.

**Exports:**
- `state` - Object containing all app state
- `resetState()` - Reset everything to defaults

**State Structure:**
```javascript
{
    gridWidth: 24,
    gridHeight: 24,
    gridData: [],                    // 2D array of color strings
    palette: [],                     // Array of {hex, label}
    selectedColor: null,            // Current brush color
    uploadedImage: null,
    processedImageData: null,
    templates: [],
    inspiration: [],
    recentSessions: [],
    guidedFlowActive: false,
    currentStartMode: null,          // 'template', 'photo', or 'blank'
    imageWorker: null,
    workerReady: boolean
}
```

---

### `grid.js`
Grid rendering and cell interaction.

**Exports:**
- `initGrid()` - Create empty grid
- `renderGrid()` - Render grid to DOM
- `handleCellClick(row, col)` - Paint cell
- `handleCellErase(row, col)` - Erase cell
- `handleResizeGrid()` - Resize grid

---

### `palette.js`
Color palette management.

**Exports:**
- `initPalette()` - Initialize with default colors
- `renderPalette()` - Render palette UI
- `selectColor(color)` - Set active brush color
- `addColor()` - Add new color to palette
- `removeColor(color)` - Remove color from palette

---

### `export.js`
Pattern text generation and export.

**Exports:**
- `generateColorMapping()` → `{colorMap, usedColors}`
- `generatePatternText()` → `string`
- `generateLegendText()` → `string`
- `updateExport()` - Update export textareas
- `copyToClipboard(elementId)` - Copy text to clipboard
- `downloadTextFile()` - Download as .txt file

---

### `storage.js`
LocalStorage persistence.

**Exports:**
- `saveDesign()` - Save to localStorage
- `loadDesign()` → `design object or null`
- `promptLoadDesign()` - Dialog to load previous design
- `handleClearDesign()` - Clear grid and reset
- `loadRecentSessions()` - Load from localStorage
- `saveRecentSession()` - Save current as recent session
- `loadRecentSession(session)` - Load a specific session
- `generateThumbnailFromGrid()` → `dataURL`
- `getFavorites()` → `[templateIds]`
- `toggleFavorite(templateId)` - Toggle favorite status
- `isFavorited(templateId)` → `boolean`

---

### `templates.js`
Template library system.

**Exports:**
- `initTemplateLibrary()` - Load all templates and setup UI
- `renderTemplateLibrary(category)` - Render template grid
- `applyTemplateToGrid(template)` - Apply template to main grid
- `applyRandomTemplate(category)` - Apply random template from category
- `getTemplateCategoryKey(template)` → `string`
- `getTemplatePaletteEntries(template)` → `[{key, hex}]`
- `getTemplateColorAt(template, x, y)` → `hex or null`
- `buildGridDataFromTemplate(template)` → `2D color array`
- `generateDefaultTemplates()` → `[template objects]`

---

### `imageImporter.js`
Image processing pipeline.

**Exports:**
- `initImageWorker()` - Setup Web Worker
- `initImageImportListeners()` - Setup event listeners
- `handleImageUpload(event)` - Process uploaded image
- `handleProcessImage()` - Start processing
- `handleSendToGrid()` - Apply to main grid
- `processImageWithWorker(...)` - Send to Web Worker
- `processImageFallback(...)` - Fallback processing
- `resizeImageNearestNeighbor(img, width, height)` → `pixels`
- `quantizeColorsMedianCut(pixelData, maxColors)` → `{pixelData, palette}`
- `renderReducedPreview(pixelData, width, height)` - Draw preview

---

### `harmonizer.js`
Color harmony generation.

**Exports:**
- `initColorHarmonizer()` - Setup UI
- `generateHarmonizerPalette(mode)` - Generate palette
  - Modes: 'complementary', 'analogous', 'triadic', 'pastel', 'muted'
- `renderHarmonizerOutput(palette)` - Display swatches
- `applyHarmonizerPalette()` - Use generated palette
- `recolorGridNearest()` - Recolor grid with new palette

---

### `difficulty.js`
Pattern complexity estimation.

**Exports:**
- `initDifficultyEstimator()` - Setup UI
- `analyzeDifficulty()` - Analyze and display
- `estimateDifficultyValue()` → `'Easy' | 'Medium' | 'Hard'`
- `calculateDifficultyFactors()` → `{...metrics}`
- `getDifficultyExplanation(factors, difficulty)` → `string`

---

### `keywords.js`
Auto keyword generation.

**Exports:**
- `initKeywordHelper()` - Setup UI
- `generateKeywords()` - Analyze and generate keywords

Generates keywords from:
- Pattern title
- Color names
- Pattern difficulty
- Generic bracelet keywords
- Aesthetic properties (minimalist, colorful, etc.)

---

### `print.js`
Print sheet generation.

**Exports:**
- `initPrintSheet()` - Setup UI
- `generatePrintPreview()` - Generate and show preview

---

### `inspiration.js`
Inspiration gallery with color palettes.

**Exports:**
- `initInspirationGallery()` - Load and setup UI
- `generateDefaultInspiration()` → `[inspiration objects]`
- `renderInspirationGallery(category)` - Render gallery
- `showInspirationModal(inspo)` - Show preview modal
- `applyInspirationPalette(inspo)` - Use palette
- `applyInspirationPattern(inspo)` - Use as pattern base

---

### `guided.js`
New user onboarding flow.

**Exports:**
- `startGuidedFlow(mode)` - Start guided setup
  - Modes: 'template', 'photo', 'blank'
- `closeGuidedFlow()` - Finish guided flow

---

## UI Modules

### `ui/welcome.js`
Welcome screen and startup.

**Exports:**
- `initWelcomeScreen()` - Setup
- `showWelcomeScreen()` - Show overlay
- `hideWelcomeScreen()` - Hide overlay
- `handleStartFromTemplate()` - Navigate to templates
- `handleStartFromPhoto()` - Open file picker
- `handleStartFromBlank()` - Create blank grid + guided flow

---

### `ui/modals.js`
Modal dialog management.

**Exports:**
- `initModals()` - Setup modal listeners

---

### `ui/mobileBar.js`
Mobile action bar.

**Exports:**
- `initMobileActionBar()` - Setup mobile buttons

---

## Utility Modules

### `utils/colorUtils.js`
Color conversion and analysis.

**Exports:**
- `rgbToHex(r, g, b)` → `string`
- `hexToRgb(hex)` → `{r, g, b}`
- `distanceBetweenColors(rgb1, rgb2)` → `number`
- `hexToHsl(hex)` → `{h, s, l}`
- `hslToHex(h, s, l)` → `string`
- `getColorName(hex)` → `string` (nearest named color)

---

### `utils/notifications.js`
Toast notifications.

**Exports:**
- `showNotification(message, type, duration)`
  - Types: 'info', 'success', 'error', 'warning'
  - Default duration: 3000ms

---

## Main Entry Point

### `main.js`
Application bootstrap.

**Exports:**
- `initApp()` - Initialize entire application
- `toggleDeveloperMode()` - Toggle dev mode
- `APP_VERSION` - Current version

**Initialization sequence:**
1. Initialize Web Worker
2. Load saved design or defaults
3. Render UI
4. Setup event listeners
5. Initialize feature modules
6. Load recent sessions

---

## Usage Patterns

### Updating State and UI

```javascript
// 1. Update state
state.selectedColor = color;

// 2. Re-render affected UI
renderPalette();

// 3. Update exports if needed
updateExport();
```

### Adding a New Feature Module

1. Create `src/core/featureName.js`
2. Import state: `import { state } from './state.js';`
3. Export public functions
4. Call init function from `main.js`
5. Update documentation

### Handling Async Operations

```javascript
// Use async/await
async function loadData() {
    const data = await fetch('/api/data');
    state.data = data;
    renderUI();
}

// Or use Promises
fetch('/api/data')
    .then(res => res.json())
    .then(data => {
        state.data = data;
        renderUI();
    });
```

---

See [ARCHITECTURE.md](ARCHITECTURE.md) for system design and [README.md](README.md) for quickstart.
