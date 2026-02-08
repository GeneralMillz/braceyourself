/**
 * @file export.js
 * @description Pattern export and file generation
 */

import { state } from './state.js';
import { showNotification } from '../utils/notifications.js';

/**
 * Generate color mapping for export
 * Maps each color hex to a letter (A, B, C, etc.)
 * @returns {Object} {colorMap, usedColors}
 */
export function generateColorMapping() {
    const usedColors = [];
    const colorMap = {};

    for (let row = 0; row < state.gridHeight; row++) {
        for (let col = 0; col < state.gridWidth; col++) {
            const color = state.gridData[row][col];
            if (color && !colorMap[color]) {
                const letter = String.fromCharCode(65 + usedColors.length); // A, B, C, ...
                usedColors.push(color);
                colorMap[color] = letter;
            }
        }
    }

    return { colorMap, usedColors };
}

/**
 * Generate pattern text (rows of letters)
 * @returns {string} Multi-line pattern string
 */
export function generatePatternText() {
    const { colorMap } = generateColorMapping();
    const lines = [];

    for (let row = 0; row < state.gridHeight; row++) {
        let line = '';
        for (let col = 0; col < state.gridWidth; col++) {
            const color = state.gridData[row][col];
            line += color ? colorMap[color] : '.';
        }
        lines.push(line);
    }

    return lines.join('\n');
}

/**
 * Generate legend text (color assignments)
 * @returns {string} Legend in format "A = #hex\nB = #hex"
 */
export function generateLegendText() {
    const { colorMap, usedColors } = generateColorMapping();

    if (usedColors.length === 0) {
        return '(No colors used yet)';
    }

    const lines = [];
    usedColors.forEach((color) => {
        const letter = colorMap[color];
        lines.push(`${letter} = ${color}`);
    });

    return lines.join('\n');
}

/**
 * Update the export textareas
 */
export function updateExport() {
    const patternOutput = document.getElementById('patternOutput');
    const legendOutput = document.getElementById('legendOutput');

    if (patternOutput) patternOutput.value = generatePatternText();
    if (legendOutput) legendOutput.value = generateLegendText();
}

/**
 * Copy text from textarea to clipboard
 * @param {string} elementId - ID of textarea element
 */
export function copyToClipboard(elementId) {
    const textarea = document.getElementById(elementId);
    if (!textarea) return;

    textarea.select();
    document.execCommand('copy');
    showNotification('Copied to clipboard!', 'success');
}

/**
 * Download pattern as text file
 */
export function downloadTextFile() {
    const pattern = generatePatternText();
    const legend = generateLegendText();

    const content = `PATTERN\n${pattern}\n\nLEGEND\n${legend}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bracelet-pattern.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showNotification('Pattern downloaded!', 'success');
}
