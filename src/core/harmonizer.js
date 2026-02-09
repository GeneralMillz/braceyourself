/**
 * @file harmonizer.js
 * @description Color harmony generation
 */

import { state } from './state.js';
import { showNotification } from '../utils/notifications.js';
import { hexToHsl, hslToHex, distanceBetweenColors, hexToRgb } from '../utils/colorUtils.js';
import { renderPalette } from './palette.js';
import { renderGrid } from './grid.js';
import { updateExport } from './export.js';

/**
 * Initialize color harmonizer UI
 */
export function initColorHarmonizer() {
    document.getElementById('complementaryBtn')?.addEventListener('click', () => {
        generateHarmonizerPalette('complementary');
    });
    document.getElementById('analogousBtn')?.addEventListener('click', () => {
        generateHarmonizerPalette('analogous');
    });
    document.getElementById('triadicBtn')?.addEventListener('click', () => {
        generateHarmonizerPalette('triadic');
    });
    document.getElementById('pastelizeBtn')?.addEventListener('click', () => {
        generateHarmonizerPalette('pastel');
    });
    document.getElementById('muteBtn')?.addEventListener('click', () => {
        generateHarmonizerPalette('muted');
    });
    document.getElementById('applyHarmonizerPaletteBtn')?.addEventListener('click', applyHarmonizerPalette);
    document.getElementById('recolorGridBtn')?.addEventListener('click', recolorGridNearest);
}

/**
 * Generate a harmonic palette
 * @param {string} mode - Harmony mode: 'complementary', 'analogous', 'triadic', 'pastel', 'muted'
 */
export function generateHarmonizerPalette(mode) {
    const baseHex = document.getElementById('harmonizerColorPicker')?.value || '#a8d8ea';
    const baseHsl = hexToHsl(baseHex);

    let palette = [];

    switch(mode) {
        case 'complementary':
            palette = [
                baseHex,
                hslToHex((baseHsl.h + 180) % 360, baseHsl.s, baseHsl.l),
            ];
            break;
        case 'analogous':
            palette = [
                hslToHex((baseHsl.h - 30 + 360) % 360, baseHsl.s, baseHsl.l),
                baseHex,
                hslToHex((baseHsl.h + 30) % 360, baseHsl.s, baseHsl.l),
            ];
            break;
        case 'triadic':
            palette = [
                baseHex,
                hslToHex((baseHsl.h + 120) % 360, baseHsl.s, baseHsl.l),
                hslToHex((baseHsl.h + 240) % 360, baseHsl.s, baseHsl.l),
            ];
            break;
        case 'pastel':
            palette = [
                hslToHex(baseHsl.h, Math.max(20, baseHsl.s - 30), Math.min(85, baseHsl.l + 20)),
                hslToHex((baseHsl.h + 90) % 360, Math.max(20, baseHsl.s - 30), Math.min(85, baseHsl.l + 20)),
                hslToHex((baseHsl.h + 180) % 360, Math.max(20, baseHsl.s - 30), Math.min(85, baseHsl.l + 20)),
                hslToHex((baseHsl.h + 270) % 360, Math.max(20, baseHsl.s - 30), Math.min(85, baseHsl.l + 20)),
            ];
            break;
        case 'muted':
            palette = [
                hslToHex(baseHsl.h, Math.max(15, baseHsl.s - 40), Math.max(40, baseHsl.l - 20)),
                hslToHex((baseHsl.h + 120) % 360, Math.max(15, baseHsl.s - 40), Math.max(40, baseHsl.l - 20)),
                hslToHex((baseHsl.h + 240) % 360, Math.max(15, baseHsl.s - 40), Math.max(40, baseHsl.l - 20)),
            ];
            break;
    }

    state.harmonizerPalette = palette;
    renderHarmonizerOutput(palette);
}

/**
 * Render harmonizer output
 * @param {string[]} palette - Array of hex colors
 */
export function renderHarmonizerOutput(palette) {
    const output = document.getElementById('harmonizerOutput');
    const swatches = document.getElementById('harmonizerSwatches');

    if (!swatches) return;

    swatches.innerHTML = '';
    palette.forEach(color => {
        const swatch = document.createElement('div');
        swatch.className = 'harmonizer-swatch';
        swatch.style.backgroundColor = color;
        swatch.title = color;
        swatches.appendChild(swatch);
    });

    if (output) {
        output.style.display = 'block';
    }
}

/**
 * Apply harmonizer palette to current palette
 */
export function applyHarmonizerPalette() {
    if (!state.harmonizerPalette) return;

    state.palette = state.harmonizerPalette.map((hex, i) => ({
        hex,
        label: `Color ${i + 1}`,
    }));
    state.selectedColor = state.palette[0];

    renderPalette();
    updateExport();
    showNotification('Harmonic palette applied!', 'success');
}

/**
 * Recolor grid using nearest color from harmonizer palette
 */
export function recolorGridNearest() {
    if (!state.harmonizerPalette) return;

    for (let y = 0; y < state.gridHeight; y++) {
        for (let x = 0; x < state.gridWidth; x++) {
            const currentColor = state.gridData[y][x];
            if (currentColor) {
                let nearest = state.harmonizerPalette[0];
                let minDistance = Infinity;

                for (let paletteColor of state.harmonizerPalette) {
                    const dist = distanceBetweenColors(hexToRgb(currentColor), hexToRgb(paletteColor));
                    if (dist < minDistance) {
                        minDistance = dist;
                        nearest = paletteColor;
                    }
                }

                state.gridData[y][x] = nearest;
            }
        }
    }

    renderGrid();
    updateExport();
    showNotification('Grid recolored with harmonizer palette!', 'success');
}
