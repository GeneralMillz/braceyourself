# User Experience Guide

Comprehensive guide to user flows, interaction patterns, and design decisions in Brace Yourself.

---

## Table of Contents

1. Getting Started Flows
2. Main Interaction Model
3. Feature-Specific Flows
4. Mobile UX
5. Accessibility
6. Error Handling & Feedback

---

## Getting Started Flows

### First-Time User Experience

```
App Load
  → No saved design → Welcome Screen
    → "Recent Sessions" empty? Yes
    → Offer 3 paths: [Template Gallery] [Upload Photo] [Blank Grid]
       → Path A: Template Gallery
          - Browse 5 packs (Turtles, Hearts, Flowers, Animals, Emojis)
          - See color palette preview
          - Click template → grid populates
          - Proceed to editor
       → Path B: Upload Photo
          - Click "Choose Image"
          - Show image preview
          - Review color reduction
          - Click "Apply" → grid populated
          - Proceed to editor
       → Path C: Blank Canvas
          - Set grid size (default 10x10)
          - Choose palette (Pastel or Muted)
          - Start editing
    → Editor loaded
    → Show "Guided Tour" button (optional)
```

### Returning User Experience

```
App Load
  → Saved design in localStorage
  → Load automatically with prompt
    → "Continue editing?" Yes/No
    → Yes: Load last design, show "Undo" hint, jump to canvas
    → No: Show welcome screen, show recent sessions list
       → Click recent session thumbnail → load that design
```

---

## Welcome Screen

### Layout (Desktop)

```
┌─────────────────────────────────────┐
│          BRACE YOURSELF             │
│        Digital Pattern Designer     │
├─────────────────────────────────────┤
│                                     │
│  Choose how to get started:         │
│                                     │
│  [📚 Gallery]  [📷 Photo]  [⬜ Blank] │
│                                     │
├─────────────────────────────────────┤
│  Recent Sessions (if any)           │
│  [Design 1]  [Design 2]  [Design 3] │
│                                     │
└─────────────────────────────────────┘
```

### Interaction Patterns

- **Default action**: Template gallery (most visual, engaging)
- **Keyboard**: Arrow keys to navigate buttons, Enter to select
- **Mobile**: Buttons stack vertically, larger touch targets
- **Recent sessions**: Show thumbnail preview on hover

---

## Guided Tour Flow

For new users opting into guided experience:

```
Step 1: Understanding the Grid
  - Highlight grid area
  - Show "Each square is one stitch"
  - Demo: Click one square to show color

Step 2: Color Palette
  - Highlight palette section
  - Show "Click color, then click grid squares"
  - Demo: Select color, click grid square

Step 3: Making Changes
  - Show eraser tool
  - Show fill color
  - Demo: Erase a square, refill

Step 4: Exporting Pattern
  - Show export section
  - Explain different export formats
  - Show copy/download buttons
```

Each step has:
- Narrative text (left/bottom)
- Animated highlight of relevant UI
- "Next" button to continue
- "Skip" button to exit tour
- Progress indicator (Step 1/4, etc.)

---

## Main Editor Layout

### Desktop Layout

```
┌─────────────────────────────────────┐
│ BRACE YOURSELF v2.0          [⚙️]   │
├──────────┬──────────────────────────┤
│ PALETTE  │ GRID EDITOR              │
│          │                          │
│ [Color]  │  ⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜         │
│ [Color]  │  ⬜🟩⬜⬜⬜🟩⬜⬜⬜⬜         │
│ [Color]  │  ⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜         │
│ [Color]  │  ⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜         │
│ [+] Add  │  ...                    │
│          ├──────────┬───────────────┤
│ Tools:   │ EXPORT   │ FEATURES      │
│ [Eraser] │ [Copy]   │ [Templates]   │
│ [Fill]   │ [Download]│ [Harmony]    │
│          │ [Grid]   │ [Difficulty]  │
│          │          │ [Keywords]    │
└──────────┴────────────┴───────────────┘
```

### Interaction Zones

**Zone 1: Palette (Left)**
- Master list of colors
- Current color highlighted
- Add new color button
- Color info on hover (hex, name)
- Right-click to delete color

**Zone 2: Grid (Center)**
- Click to paint with selected color
- Right-click to erase
- Shift+click to fill bucket
- Keyboard: Arrow keys to navigate cursor
- Keyboard: Numbers 1-9 to select colors 1-9

**Zone 3: Export (Bottom)**
- Copy to clipboard for text-based formats
- Download as text file
- Preview of export format

**Zone 4: Features (Right)**
- Collapsible sections
- One feature active at a time
- Smooth transitions

---

## Feature-Specific Flows

### Template Library Flow

```
Click [Templates] button
  ↓
Show template gallery with 5 packs:
[Turtles] [Hearts] [Flowers] [Animals] [Emojis]
  ↓
User clicks pack → Expand to show templates
  ↓
Show grid of templates (3 columns)
  - Each template shows thumbnail + color palette
  - Favorite icon (heart) on hover
  - "Random" button at top
  ↓
User clicks template
  ↓
Apply to current grid with confirmation:
"Replace current grid with this template?"
[Yes] [No]
  ↓
Grid updates with template
  - Colors adapted to current palette
  - Show notification: "Template applied"
  - Templates panel collapses
  - Focus returns to grid
```

**Keyboard Navigation in Templates:**
- Tab: Move between templates
- Enter: Apply selected template
- Space: Favorite/unfavorite
- Esc: Close templates panel

**Favorites System:**
- Heart icon in top-right of each template
- Click to toggle favorite
- Favorites show at top of list
- Persists in localStorage

### Image Import Flow

```
Click [Upload Photo] in welcome
  OR
Click [Import Image] in features
  ↓
File picker opens
  ↓
User selects image
  ↓
Show loading spinner + progress
  ↓
Image processing steps:
  1. Resize to fit grid (maintain aspect ratio)
  2. Color quantization (Median Cut algorithm)
  3. Generate preview of reduced colors
  ↓
Show preview:
┌──────────────────────────────┐
│ Original Image | Reduced (8c)│
├──────────────────────────────┤
│ [Fewer Colors] [More Colors] │
│     (4 colors)  (16 colors)  │
└──────────────────────────────┘
  ↓
User selects color count (default: 8)
  ↓
Click [Apply to Grid]
  ↓
Grid populates with color mapping
  - Show notification: "Image imported and quantized"
  - Save design automatically
  ↓
User can now edit or export
```

**Performance Considerations:**
- Image processing runs in Web Worker (non-blocking)
- Large images (>5MB) show warning but proceed
- Resize happens server-side logic (actually client with Canvas)
- Quantization uses Median Cut algorithm (fast, quality)

### Color Harmony Flow

```
Click [Harmony] button
  ↓
Show dropdown: Pick harmony mode
  [Complementary] [Analogous] [Triadic] [Pastel] [Muted]
  ↓
User clicks mode
  ↓
Show preview of suggested colors
┌─────────────────────────────────┐
│ Pick a base color from palette  │
│ [Color Swatch] [Color Swatch]   │
│        ...                      │
│ [Generate] [Apply]              │
└─────────────────────────────────┘
  ↓
User clicks [Generate]
  ↓
Algorithm calculates harmony colors
  - Complementary: Rotate hue 180°
  - Analogous: Rotate hue ±30°
  - Triadic: Rotate hue ±120°
  - Pastel: Desaturate & brighten
  - Muted: Desaturate & darken
  ↓
Show suggested new colors
  ↓
User clicks [Apply]
  ↓
New colors added to palette
  - Show notification: "Harmony colors added"
  - Harmony panel collapses (optional)
```

### Difficulty/Keyword Flow

```
Click [Difficulty] button
  ↓
Analysis runs:
  - Pattern coverage (% colored pixels)
  - Color count (complexity)
  - Repeat units (if applicable)
  ↓
Show results:
┌────────────────────────────┐
│ Estimated Difficulty: 3/10 │
│ • 40% coverage             │
│ • 6 colors used            │
│ • Suitable for beginners   │
│                            │
│ See explanation of reasons │
└────────────────────────────┘
  ↓
Click [Generate Keywords]
  ↓
Auto-generate keywords from:
  - Pattern title
  - Color analysis
  - Difficulty level
  ↓
Show editable keyword list:
Input field: "Add keywords..."
[keyword1] [x] [keyword2] [x] ...
  ↓
User can add/remove keywords
  ↓
Keywords saved with design
```

---

## Mobile UX

### Responsive Breakpoints

```
Desktop (>900px)
  - Side-by-side layout
  - Large grid cells
  - Hover states on buttons
  - Right sidebar for features

Tablet (600-900px)
  - Palette at top, grid below
  - Features as horizontal tabs
  - Medium grid cells
  - Touch-friendly buttons

Mobile (<600px)
  - Full-width grid
  - Bottom action bar
  - Floating palette panel
  - Single active feature at a time
```

### Mobile Layout

```
┌──────────────────────┐
│  BRACE YOURSELF  [≡] │  Header with menu
├──────────────────────┤
│                      │
│  🟩🟩🟩🟩🟩🟩        │
│  🟩🟩🟩🟩🟩🟩   Grid │
│  🟩🟩🟩🟩🟩🟩        │
│                      │
├──────────────────────┤
│ ◀▶ Zoom Controls    │
├──────────────────────┤
│ [📚] [📷] [⚙️]  [💾] │  Bottom action bar
└──────────────────────┘

Floating panels (shown on demand):
  - [Color Palette] (swipe up)
  - [Export] (bottom sheet)
  - [Features] (tabs: Templates, Import, Tools)
```

### Touch Interactions

- **Single tap**: Select color or paint square
- **Long press**: Fill bucket / show context menu
- **Swipe up**: Show palette panel
- **Swipe down**: Hide floating panels
- **Pinch**: Zoom grid (future)
- **Two-finger rotate**: Rotate selection (future)

### Mobile-Specific UX

**Action Bar** (always accessible):
- 📚 **Templates**: Show template gallery as modal
- 📷 **Import**: Open file picker for images
- ⚙️ **Settings**: Palette, difficulty, keywords, harmony
- 💾 **Save**: Manual save (usually auto-saves)
- ≡ **Menu**: Help, load recent, clear design

**Floating Palette** (swipeable panel):
- Large touch targets
- Recent colors at top
- "+Add" button
- Close button
- Can be dragged to resize

**Export on Mobile**:
- Show full-screen export preview
- Buttons for copy/download
- Share button (text via SMS/Email)

---

## Keyboard Shortcuts

### Grid Editing
| Key | Action |
|-----|--------|
| Arrow Keys | Move cursor |
| 1-9 | Select color 1-9 |
| E | Select eraser |
| Space | Paint current square |
| Shift+Space | Fill bucket |
| Ctrl+Z | Undo (future) |
| Ctrl+Shift+Z | Redo (future) |

### Application
| Key | Action |
|-----|--------|
| Tab | Navigate to next element |
| Shift+Tab | Navigate to previous element |
| Ctrl+S | Save design |
| Ctrl+L | Load design |
| Ctrl+E | Show export |
| Ctrl+T | Show templates |
| Ctrl+I | Import image |
| ? | Show help |
| Esc | Close modals |

### Template Library (when open)
| Key | Action |
|-----|--------|
| Space | Favorite/unfavorite |
| Enter | Apply template |
| Esc | Close templates |

---

## Accessibility

### Keyboard Navigation

**Tab Order:**
1. Header (buttons, settings)
2. Palette (colors, add button)
3. Grid (cell by cell, row by row)
4. Export section
5. Features sidebar

**Focus Indicators:**
- Outline: 2px color-coordinated outline
- High contrast (even on colored backgrounds)
- Visible on all interactive elements

### Screen Reader Support

**ARIA Labels:**
```
Grid: "Grid, 10 by 10 pixels, column 3 row 5 selected"
Color: "<color name> at hex <code>, selected"
Palette: "Color palette, 6 colors"
Button: "Add color to palette" / "Export as text"
```

**Announcements:**
- "Grid filled with green color"
- "Template applied, grid updated"
- "Image quantized to 8 colors"
- "Keywords generated"

### Color Independence

- Color changes communicated via patterns, not color alone:
  - Grid checkerboard shows "empty" vs "filled"
  - Palette shows color + label + hex
  - Difficulty shows text + visual indicator

### High Contrast Mode

- Force borders on all squares
- Increase text contrast to 7:1
- Remove reliance on color for state
- Larger touch targets (44x44px minimum)

### Motion Preferences

- Reduce animations if `prefers-reduced-motion`
- No auto-playing transitions
- Manual controls for features

---

## Error Handling & Feedback

### Notification System

**Toast Notifications** (auto-dismiss after 4s):
```
Success: "⬜ Design saved"
Error:   "❌ Could not load image"
Info:    "ℹ️ Feature unavailable on mobile"
Warning: "⚠️ Large image may take longer"
```

**Modal Dialogs** (require user action):
```
Destructive: "Clear design?"
              [Cancel] [Clear]

Confirmation: "Replace grid with template?"
              [Cancel] [Apply]

Error:       "Could not process image"
             [Details] [OK]
```

### Error States

**Image Upload Failed:**
```
❌ Could not process image
Possible reasons:
  • File is corrupted
  • File is too large (>10MB)
  • Browser doesn't support WebP

[Try Again] [Use Different Image]
```

**Load Design Failed:**
```
⚠️ Could not load design
The saved design may be corrupted.

[Start Fresh] [Help]
```

**Browser Compatibility:**
```
ℹ️ Feature not available
This browser doesn't support:
  • Image processing (using fallback)
  • Web Workers (slower processing)

[See Workarounds]
```

### Success Feedback

- **Color palette updated**: Show new color
- **Template applied**: Update grid smoothly
- **Design saved**: Toast with checkmark
- **Export copied**: "Copied to clipboard!"
- **Image imported**: Show thumbnail preview

---

## Design Principles

### 1. Progressive Disclosure

- Welcome screen: 3 simple paths (not overwhelming)
- Features available as tabs (not all shown)
- Settings collapsed by default
- Guided tour for first-timers

### 2. Consistency

- Color selection → always click palette first
- Naming: "Import Photo", "Add Color" (consistent verbs)
- Button placement: Primary action always prominent
- Shortcuts always show in tooltips

### 3. Feedback

- Every action gets a response
- Status indicators (loading, processing)
- Notifications for auto-saves
- Errors shown immediately, not silently

### 4. Efficiency

- Shortcuts for power users (keyboard navigation)
- Favorites system (recent/favorites at top)
- Recent sessions (resume quickly)
- Undo/Redo when available (future)

### 5. Delight

- Smooth animations (non-blocking)
- Color harmony suggestions (inspiring)
- Template randomizer (encourages experimentation)
- Pastel aesthetic throughout

---

## Future UX Improvements

### Planned
- [ ] Undo/Redo visualization (timeline)
- [ ] Drag-and-drop to reorder palette
- [ ] Multi-selection on grid
- [ ] Zoom slider for large grids
- [ ] Pattern preview (how it looks printed)
- [ ] Design sharing (QR codes)

### Under Consideration
- Collaborative editing (real-time sync)
- Pattern library (personal saved collection)
- Print preview before download
- Batch import (multiple images)
- Pattern generator (from text)

---

Last updated: Feb 2026
