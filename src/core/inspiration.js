/**
 * @file inspiration.js
 * @description Inspiration gallery with color palettes
 */

import { state } from './state.js';
import { showNotification } from '../utils/notifications.js';
import { renderPalette } from './palette.js';
import { renderGrid } from './grid.js';
import { updateExport } from './export.js';

/**
 * Initialize inspiration gallery UI
 */
export function initInspirationGallery() {
    state.inspiration = generateDefaultInspiration();
    renderInspirationGallery('all');

    document.querySelectorAll('.inspiration-category-buttons .category-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.inspiration-category-buttons .category-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            renderInspirationGallery(e.target.dataset.category);
        });
    });
}

/**
 * Generate default inspiration palettes
 * @returns {Object[]} Array of inspiration objects
 */
export function generateDefaultInspiration() {
    return [
        {
            id: 'inspo-1',
            name: 'Pastel Sunrise',
            category: 'aesthetic',
            colors: ['#ffc0cb', '#ffb6c1', '#ffe4b5', '#fff0f5'],
            description: 'Soft pink and peach gradient'
        },
        {
            id: 'inspo-2',
            name: 'Ocean Vibes',
            category: 'nature',
            colors: ['#a8d8ea', '#7ec8e3', '#5eb3d6', '#4a7ba7'],
            description: 'Cool blues inspired by the sea'
        },
        {
            id: 'inspo-3',
            name: 'Forest Floor',
            category: 'nature',
            colors: ['#2d5016', '#5d7b1a', '#a5d6a7', '#c1ffc1'],
            description: 'Earthy greens and browns'
        },
        {
            id: 'inspo-4',
            name: 'Geometric Modern',
            category: 'geometric',
            colors: ['#000000', '#ffffff', '#4a4a4a', '#d4c5f9'],
            description: 'Bold black and white with accent'
        },
        {
            id: 'inspo-5',
            name: 'Minimalist Zen',
            category: 'minimalist',
            colors: ['#ffffff', '#e8e8e8', '#4a4a4a'],
            description: 'Simple and calm'
        },
    ];
}

/**
 * Render inspiration gallery grid
 * @param {string} category - Category filter ('all' for all)
 */
export function renderInspirationGallery(category) {
    const grid = document.getElementById('inspirationGrid');
    if (!grid) return;

    grid.innerHTML = '';

    const filtered = category === 'all' ? state.inspiration : state.inspiration.filter(i => i.category === category);

    filtered.forEach(inspo => {
        const card = document.createElement('div');
        card.className = 'inspiration-card';

        const preview = document.createElement('div');
        preview.className = 'inspiration-preview';
        preview.style.display = 'flex';
        preview.style.flexWrap = 'wrap';
        preview.style.alignContent = 'center';
        preview.style.justifyContent = 'center';
        preview.style.gap = '4px';
        preview.style.padding = '8px';

        inspo.colors.forEach(color => {
            const swatch = document.createElement('div');
            swatch.style.flex = '1';
            swatch.style.minWidth = '20px';
            swatch.style.height = '100%';
            swatch.style.minHeight = '30px';
            swatch.style.backgroundColor = color;
            swatch.style.borderRadius = '4px';
            swatch.style.border = '1px solid #ddd';
            preview.appendChild(swatch);
        });

        card.appendChild(preview);

        card.addEventListener('click', () => {
            showInspirationModal(inspo);
        });

        grid.appendChild(card);
    });
}

/**
 * Display inspiration modal
 * @param {Object} inspo - Inspiration object
 */
export function showInspirationModal(inspo) {
    const modal = document.getElementById('previewModal');
    const body = document.getElementById('modalPreviewBody');

    if (!body) return;

    body.innerHTML = `
        <h2>${inspo.name}</h2>
        <p style="color: #666; margin-bottom: 16px;">${inspo.description}</p>
        <div style="margin-bottom: 16px;">
            <p style="font-weight: 600; margin-bottom: 8px;">Color Palette:</p>
            <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                ${inspo.colors.map(color => `
                    <div style="flex: 1; min-width: 60px; text-align: center;">
                        <div style="height: 50px; background-color: ${color}; border: 1px solid #ddd; border-radius: 4px; margin-bottom: 4px;"></div>
                        <code style="font-size: 0.8rem; color: #666;">${color}</code>
                    </div>
                `).join('')}
            </div>
        </div>
        <div style="display: flex; gap: 8px;">
            <button class="btn btn-small" onclick="applyInspirationPalette(JSON.parse('${JSON.stringify(inspo).replace(/'/g, "\\'")}'))">Use Palette</button>
            <button class="btn btn-small" onclick="applyInspirationPattern(JSON.parse('${JSON.stringify(inspo).replace(/'/g, "\\'")}'))">Use as Pattern</button>
        </div>
    `;

    if (modal) {
        modal.classList.add('active');
    }
}

/**
 * Apply inspiration colors to palette
 * @param {Object} inspo - Inspiration object
 */
export function applyInspirationPalette(inspo) {
    state.palette = inspo.colors.map((hex, i) => ({
        hex,
        label: `Color ${i + 1}`,
    }));
    state.selectedColor = state.palette[0];

    renderPalette();
    updateExport();

    const modal = document.getElementById('previewModal');
    if (modal) {
        modal.classList.remove('active');
    }

    showNotification(`Palette from "${inspo.name}" applied!`, 'success');
}

/**
 * Create a pattern from inspiration colors
 * @param {Object} inspo - Inspiration object
 */
export function applyInspirationPattern(inspo) {
    const size = 24;
    const gridData = Array(size).fill(null).map((_, row) =>
        Array(size).fill(null).map((_, col) => {
            const colorIdx = ((row + col) % inspo.colors.length);
            return inspo.colors[colorIdx];
        })
    );

    state.gridWidth = size;
    state.gridHeight = size;
    state.gridData = gridData;
    state.palette = inspo.colors.map((hex, i) => ({
        hex,
        label: `Color ${i + 1}`,
    }));
    state.selectedColor = state.palette[0];

    document.getElementById('widthInput').value = size;
    document.getElementById('heightInput').value = size;

    renderPalette();
    renderGrid();
    updateExport();

    const modal = document.getElementById('previewModal');
    if (modal) {
        modal.classList.remove('active');
    }

    showNotification(`Pattern from "${inspo.name}" applied!`, 'success');
}
