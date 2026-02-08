# Architecture Documentation

## High-Level Overview

Brace Yourself is built on a **modular architecture** that separates concerns into distinct, reusable modules. This design enables:

- **Scalability**: Easy to add new features
- **Maintainability**: Clear separation of concerns
- **Testability**: Independent module testing
- **Code Reuse**: Shared utilities across features

## Core Principles

1. **Single Responsibility**: Each module has one clear purpose
2. **State Centralization**: All state lives in `state.js`
3. **Module Independence**: Modules import only what they need
4. **Event-Driven UI**: DOM events trigger state updates, never the reverse
5. **Pure Functions**: Utility functions with no side effects

## Module Organization

```
src/
├── core/                    # Business logic core
│   ├── state.js            # ⭐ State management
│   ├── grid.js             # Grid rendering & cell interaction
│   ├── palette.js          # Color management
│   ├── export.js           # Pattern export/conversion
│   ├── storage.js          # LocalStorage + sessions
│   ├── templates.js        # Template library + rendering
│   ├── imageImporter.js    # Image processing pipeline
│   ├── harmonizer.js       # Color harmony algorithms
│   ├── difficulty.js       # Pattern analysis
│   ├── keywords.js         # Auto keyword generation
│   ├── print.js            # Print sheet generation
│   ├── inspiration.js      # Inspiration gallery
│   └── guided.js           # New user onboarding flow
├── ui/                     # User interface
│   ├── welcome.js          # Welcome screen & startup
│   ├── modals.js           # Modal dialog management
│   └── mobileBar.js        # Mobile action bar
├── utils/                  # Shared utilities
│   ├── colorUtils.js       # Color conversion helpers
│   └── notifications.js    # Toast notifications
└── main.js                 # Application entry point
```

## State Flow Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   Global State (state.js)               │
│                                                         │
│  • gridWidth, gridHeight                               │
│  • gridData (2D color array)                           │
│  • palette (color objects)                             │
│  • selectedColor                                       │
│  • uploadedImage, processedImageData                   │
│  • templates, inspiration                             │
│  • recentSessions                                      │
└─────────────────────────────────────────────────────────┘
           ↑                              ↓
           └──────────────────────────────┘
                   Bidirectional
              (modules read/write)


DOM Events          Core Modules       State Updates
    │                   │                   │
    ├─→ click grid  ─→ grid.js   ─→ gridData changes
    ├─→ add color   ─→ palette.js ─→ palette changes
    ├─→ upload img  ─→ imageImporter.js ─→ processedImageData
    └─→ click template ─→ templates.js ─→ gridData + palette
                                         + selectedColor
```

## Data Flow Diagrams

### Pattern Editor Flow

```
User clicks grid cell
         │
         ↓
handleCellClick() [grid.js]
         │
         ├─→ Check selectedColor exists
         ├─→ Update state.gridData[row][col]
         ├─→ renderGrid() [renders DOM]
         └─→ updateExport() [regenerates pattern text]
```

### Image Processing Flow

```
User uploads image
         │
         ↓
handleImageUpload() [imageImporter.js]
         │
         ├─→ Load image into canvas
         ├─→ Display preview
         └─→ Enable "Process Image" button

User clicks "Process Image"
         │
         ↓
handleProcessImage() [imageImporter.js]
         │
         ├─→ Check if Web Worker available
         │
         ├─→ (Yes) processImageWithWorker()
         │   │
         │   └─→ Send imageData to imageWorker.js
         │       │
         │       ├─→ Resize image (smartResize)
         │       ├─→ Quantize colors (mediacut)
         │       └─→ Send result back to main thread
         │
         └─→ (No) processImageFallback()
             │
             ├─→ resizeImageNearestNeighbor()
             ├─→ quantizeColorsMedianCut()
             └─→ Render preview

handleWorkerComplete() / Results received
         │
         ├─→ state.processedImageData = result
         ├─→ renderReducedPreview()
         └─→ Enable "Send to Grid" button
```

### Template Application Flow

```
User clicks template OR clicks "Random [Category]"
         │
         ↓
applyTemplateToGrid() [templates.js]
         │
         ├─→ buildGridDataFromTemplate()
         │   │
         │   └─→ For each pixel in template:
         │       ├─→ Call getTemplateColorAt()
         │       └─→ Handle both new & legacy formats
         │
         ├─→ Extract palette from template
         ├─→ Update state:
         │   ├─→ gridWidth, gridHeight
         │   ├─→ gridData (populated from template)
         │   └─→ palette (from template colors)
         │
         ├─→ Update UI:
         │   ├─→ renderPalette()
         │   ├─→ renderGrid()
         │   └─→ updateExport()
         │
         └─→ If currentStartMode='template':
             └─→ startGuidedFlow('template')
```

## Template Format Compatibility

The system supports **two template formats** for backward compatibility:

### Legacy Format (Turtles)
```javascript
{
  colors: ["#a8d8ea", "#4a4a4a"],      // Color array
  pixels: [[0,0,1], [1,1,1], ...]      // 2D numeric array (1-indexed)
}
```

### New Format (Hearts/Flowers/Animals/Emojis)
```javascript
{
  palette: {                            // Color map
    "A": "#ffc0cb",
    "B": "#ff69b4"
  },
  pixelGrid: ["..A..", ".AAA.", ...]   // String rows (. = empty)
}
```

Both formats are handled transparently by:
- `getTemplateColorAt()` - Get color at position, handles both
- `getTemplatePaletteEntries()` - Extract palette, handles both
- `buildGridDataFromTemplate()` - Build grid from template, handles both

## Image Processing Pipeline

### Resize Modes

1. **Fit** - Preserve aspect ratio, no cropping
2. **Fill** - Crop to exact size while preserving aspect ratio
3. **Auto-Center Subject** - Detect subject bounds and crop intelligently

### Color Quantization

Uses **Median Cut Algorithm**:
1. Collect all pixels from image
2. Create initial box containing all colors
3. Find largest axis (R, G, or B)
4. Split box at median of that axis
5. Repeat until desired number of colors

Alternative: User can enable **Dithering** (Floyd-Steinberg) for better quality at cost of more colors.

### Palette Lock Feature

If enabled, forces quantized colors to snap to user's current palette:
- Solves the problem of "I want to use specific thread colors"
- Finds nearest color in user palette for each source pixel
- Produces higher-fidelity patterns with consistent colors

## Web Worker Architecture

```
Main Thread                    Web Worker Thread
──────────────────────────────────────────────────────

handleProcessImage()
    │
    └→ state.imageWorker.postMessage()
           │
           ├→ imageData
           ├→ targetWidth/Height
           ├→ maxColors
           ├→ options...
           │
           ↓
                          ├─→ smartResize()
                          ├─→ quantizeColorsOptimized()
                          └─→ self.postMessage(result)
                                      │
                                      ↓
handleWorkerComplete()
    │
    ├─→ state.processedImageData = result
    └─→ renderReducedPreview()
```

**Why Web Worker?**
- Image processing is CPU-intensive
- Main thread can stay responsive to user input
- Fallback mode available if Worker unavailable

## Color Management

### Color Conversions

All supported:
- RGB ↔ Hex
- RGB ↔ HSL  
- Color distance calculation (Euclidean)
- Color naming (snap to nearest named color)

Used by:
- Palette selection/display
- Color harmonizer (works in HSL space)
- Image quantizer (finds nearest color)
- Keyword generator (color name extraction)

### Palette Structure

```javascript
state.palette = [
  { hex: "#ffc0cb", label: "Soft Pink" },
  { hex: "#d4c5f9", label: "Lavender" },
  { hex: "#a8d8ea", label: "Sky Blue" }
]

state.selectedColor = state.palette[0]  // Currently selected for painting
```

## Export System

### Pattern Export

Converts grid to text format:
- Scans grid left-to-right, top-to-bottom
- Builds color → letter mapping (A, B, C, ...)
- Outputs rows of letters (dots for empty cells)

```
Input:  state.gridData = [
  ["#ffc0cb", null, "#ffc0cb"],
  [null, "#ffc0cb", null],
  ["#ffc0cb", null, "#ffc0cb"]
]

Output: A.A
        .A.
        A.A

Legend: A = #ffc0cb
```

### Print Sheet

Generates HTML with:
- Title
- Color legend swatches
- Pattern rows (each cell is a letter)
- Print-optimized styling

## Session Persistence

### Auto-Save on Design Changes

Not implemented (by design). User must click "Save Design" explicitly.

### Recent Sessions

On each `saveRecentSession()`:
1. Generate thumbnail from current grid
2. Create session object with title, timestamp, gridData
3. Store in localStorage (max 3 sessions)
4. Update recent designs UI

Loaded on app startup to show "Continue where you left off".

## Developer Mode

Enabled via console:
```javascript
window.toggleDevMode()
```

Enables:
- All console logging
- Debug overlays (planned)
- Performance profiling (planned)
- Developer-only UI features (planned)

## Error Handling Strategy

1. **Image Processing Errors**
   - Try Web Worker
   - Fall back to main-thread processing
   - Show user-friendly error message

2. **File I/O Errors**
   - Try/catch around JSON.parse
   - Graceful degradation (use defaults)
   - Log to console for debugging

3. **DOM Errors**
   - Check element existence before updating
   - Use optional chaining (?.)
   - Fail silently if UI element missing

4. **State Errors**
   - Validate grid dimensions
   - Validate color values
   - Default to reasonable values

## Performance Considerations

1. **Grid Rendering**
   - Renders entire grid on every change
   - O(width × height) complexity
   - Could optimize with dirty rect tracking

2. **Export Generation**
   - Scans entire grid each time
   - Should cache if static

3. **Template Loading**
   - Loads all templates async on startup
   - Could lazy-load by category

4. **Image Processing**
   - Offloaded to Web Worker (non-blocking)
   - Median cut is O(n log n) for n pixels × colors

## Future Architecture Improvements

1. **State Management Library** (Redux/Zustand)
   - Would help with undo/redo
   - Better time-travel debugging

2. **Virtual Grid Rendering**
   - Only render visible cells for huge grids
   - Would enable 1000x1000 grids

3. **Service Worker**
   - Offline support
   - Cache templates locally

4. **IndexedDB**
   - Store high-res thumbnails
   - Store full design history
   - Currently limited by localStorage

5. **Type Safety**
   - TypeScript for better IDE support
   - Catch errors at dev time

---

See [MODULES.md](MODULES.md) for detailed API reference of each module.
