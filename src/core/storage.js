/**
 * @file storage.js
 * @description LocalStorage persistence for designs and sessions
 */

import { state } from './state.js';
import { showNotification } from '../utils/notifications.js';
import { renderPalette } from './palette.js';
import { renderGrid } from './grid.js';
import { updateExport } from './export.js';

const STORAGE_KEY = 'braceyourself_current_design';
const RECENT_SESSION_KEY = 'braceyourself_recent_sessions';
const FAVORITES_KEY = 'braceyourself_favorites';

/**
 * Save current design to localStorage
 */
export function saveDesign() {
    const design = {
        gridWidth: state.gridWidth,
        gridHeight: state.gridHeight,
        gridData: state.gridData,
        palette: state.palette,
        selectedColorHex: state.selectedColor ? state.selectedColor.hex : null,
    };

    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(design));
        showNotification('Design saved!', 'success');
    } catch (e) {
        showNotification('Error saving design.', 'error');
        return;
    }
    // Also save to recent sessions
    if (typeof saveRecentSession === 'function') {
        saveRecentSession();
    }
}

/**
 * Load design from localStorage
 * @returns {Object|null} Loaded design or null if none exists
 */
export function loadDesign() {
    let saved;
    try {
        saved = localStorage.getItem(STORAGE_KEY);
    } catch (e) {
        showNotification('Error accessing localStorage.', 'error');
        return null;
    }
    if (!saved) return null;
    let design;
    try {
        design = JSON.parse(saved);
    } catch (e) {
        showNotification('Error parsing saved design.', 'error');
        return null;
    }
    state.gridWidth = design.gridWidth || 24;
    state.gridHeight = design.gridHeight || 24;
    state.gridData = design.gridData || [];
    state.palette = design.palette || [];

    // Restore selected color
    if (design.selectedColorHex) {
        state.selectedColor = state.palette.find((c) => c.hex === design.selectedColorHex);
    }
    if (!state.selectedColor && state.palette.length > 0) {
        state.selectedColor = state.palette[0];
    }

    // Update grid size inputs
    const widthInput = document.getElementById('widthInput');
    const heightInput = document.getElementById('heightInput');
    if (widthInput) widthInput.value = state.gridWidth;
    if (heightInput) heightInput.value = state.gridHeight;

    return design;
}

/**
 * Prompt user to load previous design
 */
export function promptLoadDesign() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
        showNotification('No saved design found.', 'info');
        return;
    }

    if (confirm('Load the last saved design? (Current work will be lost.)')) {
        loadDesign();
        renderPalette();
        renderGrid();
        updateExport();
        showNotification('Design loaded!', 'success');
    }
}

/**
 * Clear everything and reset to default
 */
export async function handleClearDesign() {
    if (confirm('Clear the entire grid and reset to default? This cannot be undone.')) {
        // Import these dynamically to avoid circular deps
        let initPalette, initGrid;
        try {
            ({ initPalette } = await import('./palette.js'));
        } catch (e) {
            showNotification('Failed to load palette module.', 'error');
            return;
        }
        try {
            ({ initGrid } = await import('./grid.js'));
        } catch (e) {
            showNotification('Failed to load grid module.', 'error');
            return;
        }
        initPalette();
        initGrid();
        state.gridWidth = 24;
        state.gridHeight = 24;
        document.getElementById('widthInput').value = 24;
        document.getElementById('heightInput').value = 24;
        renderPalette();
        renderGrid();
        updateExport();
        showNotification('Grid cleared.', 'success');
    }
}

/**
 * Load recent sessions from localStorage
 */
export function loadRecentSessions() {
    let saved;
    try {
        saved = localStorage.getItem(RECENT_SESSION_KEY);
    } catch (e) {
        showNotification('Error accessing recent sessions.', 'error');
        return;
    }
    if (!saved) return;
    try {
        state.recentSessions = JSON.parse(saved);
    } catch (e) {
        showNotification('Error parsing recent sessions.', 'error');
        state.recentSessions = [];
    }
}

/**
 * Save current design to recent sessions
 */
export function saveRecentSession() {
    const thumbnail = generateThumbnailFromGrid();
    const title = document.getElementById('patternTitleInput')?.value || 'Untitled Pattern';
    
    const session = {
        id: Date.now(),
        title: title,
        thumbnail: thumbnail,
        gridWidth: state.gridWidth,
        gridHeight: state.gridHeight,
        gridData: state.gridData,
        palette: state.palette,
        savedAt: new Date().toISOString(),
    };

    state.recentSessions.unshift(session);
    state.recentSessions = state.recentSessions.slice(0, 3);
    
    localStorage.setItem(RECENT_SESSION_KEY, JSON.stringify(state.recentSessions));
    
    if (typeof renderRecentDesignsPanel === 'function') {
        renderRecentDesignsPanel();
    }
}

/**
 * Load a specific saved session
 * @param {Object} session - Session object to load
 */
export function loadRecentSession(session) {
    state.gridWidth = session.gridWidth;
    state.gridHeight = session.gridHeight;
    state.gridData = session.gridData;
    state.palette = session.palette;
    state.selectedColor = state.palette[0] || null;

    document.getElementById('widthInput').value = state.gridWidth;
    document.getElementById('heightInput').value = state.gridHeight;
    const titleInput = document.getElementById('patternTitleInput');
    if (titleInput) titleInput.value = session.title;

    renderPalette();
    renderGrid();
    updateExport();

    showNotification('Design loaded!', 'success');
}

/**
 * Generate thumbnail image from current grid
 * @returns {string} Data URL of thumbnail image
 */
export function generateThumbnailFromGrid() {
    const canvas = document.createElement('canvas');
    canvas.width = 80;
    canvas.height = 80;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 80, 80);

    const cellSize = Math.floor(80 / Math.max(state.gridWidth, state.gridHeight));

    for (let y = 0; y < state.gridHeight; y++) {
        for (let x = 0; x < state.gridWidth; x++) {
            const color = state.gridData[y] ? state.gridData[y][x] : null;
            if (color) {
                ctx.fillStyle = color;
                ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
            }
        }
    }

    return canvas.toDataURL('image/png');
}

/**
 * Get all favorites
 * @returns {string[]} Array of template IDs
 */
export function getFavorites() {
    let favorites;
    try {
        favorites = localStorage.getItem(FAVORITES_KEY);
    } catch (e) {
        showNotification('Error accessing favorites.', 'error');
        return [];
    }
    if (!favorites) return [];
    try {
        return JSON.parse(favorites);
    } catch (e) {
        showNotification('Error parsing favorites.', 'error');
        return [];
    }
}

/**
 * Toggle favorite status for a template
 * @param {string} templateId - Template ID to toggle
 */
export function toggleFavorite(templateId) {
    const favorites = getFavorites();
    const index = favorites.indexOf(templateId);
    if (index > -1) {
        favorites.splice(index, 1);
    } else {
        favorites.push(templateId);
    }
    try {
        localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    } catch (e) {
        showNotification('Error saving favorites.', 'error');
    }
}

/**
 * Check if template is favorited
 * @param {string} templateId - Template ID to check
 * @returns {boolean} True if favorited
 */
export function isFavorited(templateId) {
    return getFavorites().includes(templateId);
}
