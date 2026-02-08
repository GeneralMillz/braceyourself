/**
 * @file state.js
 * @description Global application state
 * This is the single source of truth for the entire app.
 * All modules read/write to this state object.
 */

export const state = {
    // Grid State
    gridWidth: 24,
    gridHeight: 24,
    gridData: [],
    
    // Palette State
    palette: [],
    selectedColor: null,
    
    // Image Import State
    uploadedImage: null,
    processedImageData: null,
    
    // Harmonizer State
    harmonizerPalette: null,
    
    // Template State
    templates: [],
    
    // Inspiration State
    inspiration: [],
    
    // Session State
    recentSessions: [],
    guidedFlowActive: false,
    currentStartMode: null,
    
    // Web Worker State
    imageWorker: null,
    workerReady: false,
};

/**
 * Reset state to defaults (for testing or hard clear)
 */
export function resetState() {
    state.gridWidth = 24;
    state.gridHeight = 24;
    state.gridData = [];
    state.palette = [];
    state.selectedColor = null;
    state.uploadedImage = null;
    state.processedImageData = null;
    state.harmonizerPalette = null;
    state.templates = [];
    state.inspiration = [];
    state.recentSessions = [];
    state.guidedFlowActive = false;
    state.currentStartMode = null;
    state.imageWorker = null;
    state.workerReady = false;
}
