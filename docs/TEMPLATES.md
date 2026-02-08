# Template System

## Template Format

Templates are JSON files defining pixel art designs with colors.

### JSON Schema

```json
{
  "id": "unique-lowercase-id",
  "name": "Human Readable Display Name",
  "category": "hearts|flowers|animals|emojis|turtles|shapes|letters|icons",
  "width": 16,
  "height": 16,
  "palette": {
    "A": "#hexcolor",
    "B": "#hexcolor",
    ".": null
  },
  "pixelGrid": [
    "................",
    ".......A........",
    "......AAA.......",
    ".....AAAAA......",
    "....AAAAAAA.....",
    "...AAAAAAAA.....",
    "..AAAAAAAAA.....",
    ".AAAAAAAAAA.....",
    "AAAAAAAAAA......",
    "AAAAAAAAAA......",
    ".AAAAAAAAAA.....",
    "..AAAAAAAAA.....",
    "...AAAAAAAA.....",
    "....AAAAAAA.....",
    ".....AAAAA......",
    "......AAA......."
  ]
}
```

### Field Descriptions

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique identifier (lowercase, hyphens OK) |
| `name` | string | Display name shown in UI |
| `category` | string | Category for filtering |
| `width` | number | Pixel width (4-32 recommended) |
| `height` | number | Pixel height (4-32 recommended) |
| `palette` | object | Maps character → hex color |
| `pixelGrid` | string[] | Rows of characters |

### Palette Rules

- **"."** = Empty/transparent pixel
- **"A", "B", "C", etc.** = Color indices
- **null value** = Not required for "."
- Each character must exist in palette OR be "."

### Pixel Grid Rules

- Each row must be a string
- Each row length must equal `width`
- Total rows must equal `height`
- Only use characters defined in palette + "."

## Creating a New Template

### Step 1: Design the Pattern

Start with a 16×16 or 20×20 grid. Use any pixel art tool or draw by hand.

### Step 2: Reduce to 2 Colors Maximum

More colors = more complex. Start simple.

Example of a simple heart:
```
................
.......A........
......AAA.......
.....AAAAA......
....AAAAAAA.....
..AAAAAAAAAA....
..AAAAAAAAAA....
.AAAAAAAAAA.....
.AAAAAAAAA......
..AAAAAAA.......
..AAAAAAA.......
...AAAAA.......
....AAA.........
.....A.........
................
................
```

### Step 3: Create JSON File

```bash
# File location: templates/{category}/{id}.json
# Example: templates/hearts/classic-heart-16x16.json
```

```json
{
  "id": "classic-heart-16x16",
  "name": "Classic Heart",
  "category": "hearts",
  "width": 16,
  "height": 16,
  "palette": {
    "A": "#ffc0cb"
  },
  "pixelGrid": [
    "................",
    ".......A........",
    "......AAA.......",
    "......................etc
  ]
}
```

### Step 4: Add to Template Pack

Place JSON file in appropriate folder:
- `templates/turtles/`
- `templates/hearts/`
- `templates/flowers/`
- `templates/animals/`
- `templates/emojis/`

### Step 5: Update Loader

Edit `src/core/templates.js` and add filename to appropriate array:

```javascript
async function loadHeartTemplates() {
    const heartFiles = [
        // ... existing files ...
        'classic-heart-16x16.json',  // ← Add here
    ];
    await loadTemplateFiles('templates/hearts', heartFiles, 'hearts');
}
```

## Template Design Tips

### Color Restrictions

- **Bracelet threads**: Limited to ~12 colors max
- **"." = background**: Never colored
- **Palette lock**: Forces colors to user's thread colors

### Size Recommendations

- **Small (12×12-16×16)**: Detailed designs
- **Medium (20×20)**: Balanced detail and size
- **Large (24×24-32×32)**: Bold patterns, larger details

### Design Principles

1. **Pixel-perfect**: Sharp edges, no antialiasing
2. **Recognizable**: Should be identifiable at small tiles
3. **Symmetry**: Consider horizontal/vertical symmetry
4. **Contrast**: Use color differences for clarity
5. **Padding**: Leave 2-4 pixels of "." border for breathing room

## Legacy Template Format

For backward compatibility, the system also supports:

```json
{
  "colors": ["#a8d8ea", "#4a4a4a"],
  "pixels": [
    [0, 0, 0, 0, 0, 0],
    [0, 1, 1, 1, 1, 0],
    [1, 0, 0, 0, 0, 1],
    ...
  ]
}
```

**Note:** New templates should use the modern format.

## Template Pack Structure

### Existing Packs

| Pack | Count | Style | File Count |
|------|-------|-------|-----------|
| Turtles | 34 | Various styles | templates/turtles/ |
| Hearts | 25 | Sizes 12-24px | templates/hearts/ |
| Flowers | 25 | Various flowers | templates/flowers/ |
| Animals | 25 | Cute critters | templates/animals/ |
| Emojis | 25 | Emotion faces | templates/emojis/ |

### Adding a New Pack

1. Create `templates/{packname}/` folder
2. Create 20-40 templates in pack style
3. Add loader function in `src/core/templates.js`:
   ```javascript
   async function load{PackName}Templates() {
       const files = ['file1.json', 'file2.json', ...];
       await loadTemplateFiles('templates/{packname}', files, '{packname}');
   }
   ```
4. Call loader from `initTemplateLibrary()`:
   ```javascript
   await load{PackName}Templates();
   ```
5. Update category button in HTML if new category
6. Update documentation

## Validating Templates

### Checklist

- [ ] `id` is unique and lowercase
- [ ] `name` is readable
- [ ] `category` is valid
- [ ] `width` and `height` match pixelGrid
- [ ] All pixelGrid rows are strings
- [ ] All pixelGrid row lengths equal width
- [ ] No rows are shortcuts (must exactly match width)
- [ ] All referenced characters exist in palette
- [ ] No undefined character references
- [ ] Palette contains only hex colors or null
- [ ] File is valid JSON (use jsonlint.com)

### File Naming Convention

```
{adjective}-{object}-{width}x{height}.json

Examples:
  classic-heart-16x16.json
  pixel-heart-12x12.json
  kawaii-heart-16x16.json
  simple-daisy-16x16.json
  geometric-heart-20x20.json
```

## Auto-Template Mode (Experimental)

The "Turtle Mode" option in image import attempts to:
1. Detect contours in uploaded image
2. Apply turtle-friendly color enhancement
3. Prevent fine patterns from over-simplifying

This is lossy and experimental. For best results with photos:
- Use high-contrast images
- Avoid complex textures
- Consider manual design instead

---

Questions? See [ARCHITECTURE.md](ARCHITECTURE.md) for the template loading system.
