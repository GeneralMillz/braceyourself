/**
 * @file templates.js
 * @description Template library management
 * Handles loading, rendering, and applying design templates
 */

import { state } from './state.js';
import { showNotification } from '../utils/notifications.js';
import { renderGrid } from './grid.js';
import { renderPalette } from './palette.js';
import { updateExport } from './export.js';

/**
 * Initialize template library
 * Loads all template packs and renders the library
 */
export async function initTemplateLibrary() {
    state.templates = generateDefaultTemplates();
    
    // Load template packs
    await loadTurtleTemplates();
    await loadHeartTemplates();
    await loadFlowerTemplates();
    await loadAnimalTemplates();
    await loadEmojiTemplates();
    
    renderTemplateLibrary('all');

    // Category buttons
    document.querySelectorAll('.template-category-buttons .category-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.template-category-buttons .category-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            renderTemplateLibrary(e.target.dataset.category);
        });
    });
    
    // Random template buttons
    document.querySelectorAll('.template-random-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            applyRandomTemplate(btn.dataset.category);
        });
    });

    const surpriseBtn = document.getElementById('surpriseMeBtn');
    if (surpriseBtn) {
        surpriseBtn.addEventListener('click', () => applyRandomTemplate('all'));
    }
}

/**
 * Load template files from a folder
 * @param {string} folder - Folder path (e.g., 'templates/hearts')
 * @param {string[]} files - Array of filenames
 * @param {string} fallbackCategory - Default category if not in template
 */
async function loadTemplateFiles(folder, files, fallbackCategory) {
    for (const filename of files) {
        try {
            const response = await fetch(`${folder}/${filename}`);
            if (response.ok) {
                const template = await response.json();
                if (!template.category) {
                    template.category = fallbackCategory;
                }
                state.templates.push(template);
            }
        } catch (error) {
            console.warn(`Failed to load template: ${filename}`, error);
        }
    }
}

// ============================================
// TEMPLATE PACK LOADERS
// ============================================

async function loadTurtleTemplates() {
    const turtleFiles = [
        'cute-round-turtle-16x16.json',
        'side-view-turtle-20x20.json',
        'baby-turtle-12x12.json',
        'pixel-art-turtle-24x24.json',
        'detailed-shell-turtle-28x28.json',
        'minimalist-turtle-16x16.json',
        'chibi-turtle-20x20.json',
        'cartoon-turtle-24x24.json',
        'silhouette-turtle-20x20.json',
        'swimming-turtle-24x24.json',
        'heart-shell-turtle-20x20.json',
        'patterned-shell-turtle-24x24.json',
        'forward-facing-turtle-20x20.json',
        'big-eyes-turtle-16x16.json',
        'tiny-legs-turtle-12x12.json',
        'flower-shell-turtle-20x20.json',
        'bow-turtle-16x16.json',
        'star-shell-turtle-20x20.json',
        'rainbow-shell-turtle-24x24.json',
        'geometric-shell-turtle-20x20.json',
        'pastel-turtle-16x16.json',
        'bold-turtle-24x24.json',
        'outline-turtle-16x16.json',
        'filled-silhouette-turtle-20x20.json',
        'thick-outline-turtle-20x20.json',
        'thin-outline-turtle-16x16.json',
        'shadow-turtle-24x24.json',
        'emoji-turtle-20x20.json',
        'left-facing-turtle-20x20.json',
        'right-facing-turtle-20x20.json',
        'happy-turtle-12x12.json',
        'sleepy-turtle-16x16.json',
        'jumping-turtle-20x20.json',
        'mega-turtle-32x32.json'
    ];
    
    await loadTemplateFiles('templates/turtles', turtleFiles, 'turtles');
}

async function loadHeartTemplates() {
    const heartFiles = [
        'classic-heart-12x12.json',
        'classic-heart-16x16.json',
        'classic-heart-20x20.json',
        'classic-heart-24x24.json',
        'pixel-heart-12x12.json',
        'puffy-heart-16x16.json',
        'double-heart-20x20.json',
        'broken-heart-16x16.json',
        'heart-arrow-20x20.json',
        'heart-wings-24x24.json',
        'heart-sparkles-20x20.json',
        'pastel-heart-16x16.json',
        'rainbow-heart-20x20.json',
        'outline-heart-16x16.json',
        'filled-heart-12x12.json',
        'gradient-heart-24x24.json',
        'kawaii-heart-16x16.json',
        'bow-heart-20x20.json',
        'star-heart-16x16.json',
        'turtle-shell-heart-24x24.json',
        'geometric-heart-20x20.json',
        'flower-heart-20x20.json',
        'initial-h-heart-16x16.json',
        'initial-jh-heart-24x24.json',
        'slim-heart-12x12.json'
    ];

    await loadTemplateFiles('templates/hearts', heartFiles, 'hearts');
}

async function loadFlowerTemplates() {
    const flowerFiles = [
        'simple-daisy-16x16.json',
        'five-petal-16x16.json',
        'rose-silhouette-20x20.json',
        'tulip-20x20.json',
        'sunflower-24x24.json',
        'cherry-blossom-20x20.json',
        'lotus-24x24.json',
        'hibiscus-24x24.json',
        'lavender-sprig-28x28.json',
        'daisy-chain-24x24.json',
        'flower-stem-20x20.json',
        'flower-leaves-20x20.json',
        'heart-center-flower-16x16.json',
        'turtle-shell-flower-24x24.json',
        'pastel-flower-16x16.json',
        'rainbow-flower-20x20.json',
        'outline-flower-16x16.json',
        'filled-flower-16x16.json',
        'pixel-flower-20x20.json',
        'chibi-flower-16x16.json',
        'sparkle-flower-20x20.json',
        'rose-bud-16x16.json',
        'twin-tulip-24x24.json',
        'sunburst-flower-24x24.json',
        'lily-20x20.json'
    ];

    await loadTemplateFiles('templates/flowers', flowerFiles, 'flowers');
}

async function loadAnimalTemplates() {
    const animalFiles = [
        'cat-head-16x16.json',
        'dog-head-16x16.json',
        'bunny-20x20.json',
        'bear-20x20.json',
        'frog-16x16.json',
        'turtle-chibi-20x20.json',
        'whale-24x24.json',
        'dolphin-24x24.json',
        'penguin-20x20.json',
        'fox-20x20.json',
        'owl-20x20.json',
        'bee-16x16.json',
        'butterfly-24x24.json',
        'bird-16x16.json',
        'duck-16x16.json',
        'elephant-chibi-24x24.json',
        'giraffe-chibi-24x24.json',
        'koala-20x20.json',
        'panda-20x20.json',
        'hedgehog-20x20.json',
        'hamster-16x16.json',
        'seal-20x20.json',
        'octopus-24x24.json',
        'starfish-20x20.json',
        'turtle-outline-16x16.json'
    ];

    await loadTemplateFiles('templates/animals', animalFiles, 'animals');
}

async function loadEmojiTemplates() {
    const emojiFiles = [
        'smiley-12x12.json',
        'heart-eyes-16x16.json',
        'laughing-16x16.json',
        'crying-16x16.json',
        'winking-12x12.json',
        'blushing-16x16.json',
        'star-eyes-16x16.json',
        'angry-12x12.json',
        'surprised-12x12.json',
        'sleepy-16x16.json',
        'turtle-emoji-16x16.json',
        'flower-emoji-12x12.json',
        'heart-emoji-12x12.json',
        'rainbow-emoji-16x16.json',
        'sun-emoji-16x16.json',
        'moon-emoji-16x16.json',
        'star-emoji-12x12.json',
        'sparkle-emoji-12x12.json',
        'thumbs-up-20x20.json',
        'peace-sign-20x20.json',
        'paw-print-16x16.json',
        'music-note-12x12.json',
        'camera-16x16.json',
        'cloud-16x16.json',
        'fire-16x16.json'
    ];

    await loadTemplateFiles('templates/emojis', emojiFiles, 'emojis');
}

// ============================================
// TEMPLATE RENDERING & APPLICATION
// ============================================

/**
 * Get normalized category key
 * @param {Object} template - Template object
 * @returns {string} Lowercase category
 */
export function getTemplateCategoryKey(template) {
    return (template.category || '').toLowerCase();
}

/**
 * Get palette entries from template (handles both old and new formats)
 * @param {Object} template - Template object
 * @returns {Object[]} Array of {key, hex} entries
 */
export function getTemplatePaletteEntries(template) {
    if (template.palette) {
        return Object.entries(template.palette).map(([key, hex]) => ({ key, hex }));
    }
    if (template.colors) {
        return template.colors.map((hex, index) => ({ key: String(index + 1), hex }));
    }
    return [];
}

/**
 * Get color at template position (handles both old and new formats)
 * @param {Object} template - Template object
 * @param {number} x - X position
 * @param {number} y - Y position
 * @returns {string|null} Hex color or null
 */
export function getTemplateColorAt(template, x, y) {
    if (template.pixelGrid) {
        const row = template.pixelGrid[y] || '';
        const charKey = row[x];
        if (charKey && charKey !== '.' && template.palette && template.palette[charKey]) {
            return template.palette[charKey];
        }
        return null;
    }

    if (template.pixels) {
        const row = template.pixels[y] || [];
        const colorIdx = row[x] || 0;
        if (colorIdx > 0 && template.colors) {
            return template.colors[colorIdx - 1] || null;
        }
    }

    return null;
}

/**
 * Build grid data from template
 * @param {Object} template - Template object
 * @returns {Object[][]} Grid data (2D array of color strings)
 */
export function buildGridDataFromTemplate(template) {
    const gridData = [];
    const height = template.height || 0;
    const width = template.width || 0;

    for (let y = 0; y < height; y++) {
        const row = [];
        for (let x = 0; x < width; x++) {
            row.push(getTemplateColorAt(template, x, y));
        }
        gridData.push(row);
    }

    return gridData;
}

/**
 * Generate default templates
 * @returns {Object[]} Array of default template objects
 */
export function generateDefaultTemplates() {
    return [
        {
            id: 'turtle-1',
            name: 'Cute Turtle',
            category: 'turtles',
            width: 16,
            height: 16,
            colors: ['#a8d8ea', '#4a4a4a'],
            pixels: [
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0],
                [0, 0, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1, 0, 0, 0, 0],
                [0, 1, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 1, 0, 0, 0],
                [1, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 1, 0, 0],
                [1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0],
                [1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0],
                [1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0],
                [1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0],
                [0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 1, 0, 0],
                [0, 0, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0],
                [0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            ]
        },
        {
            id: 'heart-1',
            name: 'Heart',
            category: 'shapes',
            width: 16,
            height: 16,
            colors: ['#ffc0cb', '#ffffff'],
            pixels: [
                [0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0],
                [0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0],
                [1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0],
                [1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0],
                [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
                [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
                [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
                [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
                [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
                [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0],
                [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0],
                [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0],
                [0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            ]
        },
        {
            id: 'star-1',
            name: 'Star',
            category: 'shapes',
            width: 16,
            height: 16,
            colors: ['#ffe4b5', '#ffffff'],
            pixels: [
                [0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0],
                [0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0],
                [0, 0, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 0, 0],
                [0, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 0],
                [1, 0, 0, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 0, 0, 1],
                [1, 0, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 0, 1],
                [1, 0, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 0, 1],
                [1, 0, 0, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 0, 0, 1],
                [0, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 0],
                [0, 0, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 0, 0],
                [0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0],
                [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0],
            ]
        },
    ];
}

/**
 * Render template library grid
 * @param {string} category - Category to filter by ('all' for everything)
 */
export function renderTemplateLibrary(category) {
    const grid = document.getElementById('templateGrid');
    if (!grid) return;

    grid.innerHTML = '';

    const filtered = category === 'all'
        ? state.templates
        : state.templates.filter(t => getTemplateCategoryKey(t) === category);

    filtered.forEach(template => {
        const card = document.createElement('div');
        card.className = 'template-card';

        const canvas = document.createElement('canvas');
        canvas.width = 100;
        canvas.height = 100;
        const ctx = canvas.getContext('2d');

        // Render template to canvas
        const cellSize = Math.floor(100 / Math.max(template.width, template.height));
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, 100, 100);

        for (let y = 0; y < template.height; y++) {
            for (let x = 0; x < template.width; x++) {
                const colorHex = getTemplateColorAt(template, x, y);
                if (colorHex) {
                    ctx.fillStyle = colorHex;
                    ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
                }
            }
        }

        const preview = document.createElement('div');
        preview.className = 'template-preview';
        preview.appendChild(canvas);

        const nameLabel = document.createElement('div');
        nameLabel.className = 'template-name';
        nameLabel.textContent = template.name;

        const favorite = document.createElement('button');
        favorite.className = 'template-favorite';
        favorite.innerHTML = '★';
        favorite.onclick = (e) => {
            e.stopPropagation();
            const { toggleFavorite } = await import('./storage.js');
            toggleFavorite(template.id);
            renderTemplateLibrary(category);
        };

        card.appendChild(preview);
        card.appendChild(nameLabel);
        card.appendChild(favorite);

        card.addEventListener('click', () => applyTemplateToGrid(template));

        grid.appendChild(card);
    });
}

/**
 * Apply random template from a category
 * @param {string} category - Category name ('all' for any template)
 */
export function applyRandomTemplate(category) {
    const categoryKey = category === 'all' ? 'all' : category;
    const candidates = categoryKey === 'all'
        ? state.templates
        : state.templates.filter(t => getTemplateCategoryKey(t) === categoryKey);
    
    if (candidates.length === 0) {
        showNotification('No templates available for this category!', 'warning');
        return;
    }
    
    const randomTemplate = candidates[Math.floor(Math.random() * candidates.length)];
    applyTemplateToGrid(randomTemplate);
    showNotification(`Template "${randomTemplate.name}" selected!`, 'success');
}

/**
 * Apply a template to the main grid
 * @param {Object} template - Template object to apply
 */
export function applyTemplateToGrid(template) {
    // Resize grid to template size
    state.gridWidth = template.width;
    state.gridHeight = template.height;
    state.gridData = buildGridDataFromTemplate(template);

    // Set palette to template colors
    const paletteEntries = getTemplatePaletteEntries(template);
    state.palette = paletteEntries.map((entry, index) => ({
        hex: entry.hex,
        label: `Color ${index + 1}`,
    }));
    state.selectedColor = state.palette[0] || null;

    // Update UI
    document.getElementById('widthInput').value = template.width;
    document.getElementById('heightInput').value = template.height;

    renderPalette();
    renderGrid();
    updateExport();

    showNotification(`Template "${template.name}" applied!`, 'success');
    
    // If started from template mode, trigger guided flow
    if (state.currentStartMode === 'template') {
        const { startGuidedFlow } = await import('./guided.js');
        setTimeout(() => {
            startGuidedFlow('template');
        }, 500);
    }
}
