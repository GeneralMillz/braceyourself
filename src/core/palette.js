/**
 * @file palette.js
 * @description Color palette management
 */

import { state } from './state.js';

/**
 * Initialize palette with default soft pastel colors
 */
export function initPalette() {
    state.palette = [
        { hex: '#a8d8ea', label: 'Sky Blue' },
        { hex: '#d4c5f9', label: 'Lavender' },
        { hex: '#ffc0cb', label: 'Soft Pink' },
        { hex: '#ffe4b5', label: 'Peach' },
        { hex: '#c1ffc1', label: 'Mint Green' },
    ];
    state.selectedColor = state.palette[0];
}

/**
 * Render the palette list in the UI
 */
export function renderPalette() {
    const paletteList = document.getElementById('paletteList');
    if (!paletteList) return;

    paletteList.innerHTML = '';

    if (state.palette.length === 0) {
        paletteList.innerHTML = '<p style="color: #999; font-size: 0.9rem;">No colors. Add one to start painting.</p>';
        return;
    }

    state.palette.forEach((color) => {
        const swatch = document.createElement('div');
        swatch.className = 'palette-swatch';
        if (state.selectedColor === color) {
            swatch.classList.add('active');
        }

        swatch.innerHTML = `
            <div class="palette-color" style="background-color: ${color.hex};"></div>
            <div class="palette-info">
                <div class="palette-label">${color.label || 'Unnamed'}</div>
                <div class="palette-hex">${color.hex}</div>
            </div>
            <button class="palette-remove" aria-label="Remove color" ${state.palette.length === 1 ? 'disabled' : ''}>×</button>
        `;

        swatch.addEventListener('click', () => selectColor(color));

        const removeBtn = swatch.querySelector('.palette-remove');
        removeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            removeColor(color);
        });

        paletteList.appendChild(swatch);
    });
}

/**
 * Select a color as the active brush color
 * @param {Object} color - Color object {hex, label}
 */
export function selectColor(color) {
    state.selectedColor = color;
    renderPalette();
}

/**
 * Add a new color to the palette
 */
export function addColor() {
    const colorInput = document.getElementById('newColorInput');
    const labelInput = document.getElementById('newColorLabel');

    const hex = colorInput.value || '#a8d8ea';
    const label = labelInput.value || `Color ${state.palette.length + 1}`;

    state.palette.push({ hex, label });
    state.selectedColor = state.palette[state.palette.length - 1];

    // Reset inputs
    colorInput.value = '#a8d8ea';
    labelInput.value = '';

    renderPalette();
}

/**
 * Remove a color from the palette
 * @param {Object} color - Color object to remove
 */
export function removeColor(color) {
    const index = state.palette.indexOf(color);
    if (index > -1) {
        state.palette.splice(index, 1);
    }

    // If removed color was selected, select another
    if (state.selectedColor === color) {
        state.selectedColor = state.palette.length > 0 ? state.palette[0] : null;
    }

    renderPalette();
}
