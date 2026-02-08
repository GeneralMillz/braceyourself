/**
 * @file grid.js
 * @description Grid management and rendering
 * Handles the main pixel grid for pattern design
 */

import { state } from './state.js';
import { showNotification } from '../utils/notifications.js';

/**
 * Initialize an empty grid with specified dimensions
 */
export function initGrid() {
    state.gridData = Array(state.gridHeight)
        .fill(null)
        .map(() => Array(state.gridWidth).fill(null));
}

/**
 * Render the grid in the DOM
 */
export function renderGrid() {
    const container = document.getElementById('gridContainer');
    if (!container) return;

    container.innerHTML = '';

    const colCount = state.gridWidth;
    container.style.gridTemplateColumns = `repeat(${colCount}, 28px)`;

    for (let row = 0; row < state.gridHeight; row++) {
        for (let col = 0; col < state.gridWidth; col++) {
            const cell = document.createElement('div');
            cell.className = 'grid-cell';
            cell.dataset.row = row;
            cell.dataset.col = col;

            const color = state.gridData[row][col];
            if (color) {
                cell.style.backgroundColor = color;
                cell.classList.add('filled');
            }

            // Left click to paint, Shift+Click to erase
            cell.addEventListener('click', (e) => {
                e.preventDefault();
                if (e.shiftKey) {
                    handleCellErase(row, col);
                } else {
                    handleCellClick(row, col);
                }
            });

            // Right click to erase
            cell.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                handleCellErase(row, col);
            });

            container.appendChild(cell);
        }
    }
}

/**
 * Handle a cell click (paint operation)
 * @param {number} row
 * @param {number} col
 */
export function handleCellClick(row, col) {
    if (!state.selectedColor) {
        showNotification('Please add a color to the palette first.', 'warning');
        return;
    }
    state.gridData[row][col] = state.selectedColor.hex;
    renderGrid();
    
    // Trigger export update if available
    if (typeof updateExport === 'function') {
        updateExport();
    }
}

/**
 * Handle a cell erase (right-click or shift-click)
 * @param {number} row
 * @param {number} col
 */
export function handleCellErase(row, col) {
    state.gridData[row][col] = null;
    renderGrid();
    
    // Trigger export update if available
    if (typeof updateExport === 'function') {
        updateExport();
    }
}

/**
 * Resize the grid to new dimensions
 * @param {number} newWidth
 * @param {number} newHeight
 */
export function handleResizeGrid() {
    const newWidth = parseInt(document.getElementById('widthInput').value, 10);
    const newHeight = parseInt(document.getElementById('heightInput').value, 10);

    if (isNaN(newWidth) || isNaN(newHeight) || newWidth < 4 || newHeight > 80 || newHeight < 4 || newHeight > 80) {
        showNotification('Grid size must be between 4 and 80.', 'error');
        return;
    }

    const hasContent = state.gridData.some((row) => row.some((cell) => cell !== null));

    if (hasContent && !confirm('Resizing will clear or truncate existing work. Continue?')) {
        return;
    }

    state.gridWidth = newWidth;
    state.gridHeight = newHeight;
    initGrid();
    renderGrid();
    
    if (typeof updateExport === 'function') {
        updateExport();
    }
}
