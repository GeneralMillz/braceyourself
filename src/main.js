/**
 * @file main.js
 * @description Main application entry point
 * Initializes all modules and sets up event listeners
 */

// ============================================
// MODULE IMPORTS
// ============================================

import { state } from './core/state.js';
import { initPalette, renderPalette, addColor } from './core/palette.js';
import { initGrid, renderGrid, handleResizeGrid } from './core/grid.js';
import { updateExport, copyToClipboard, downloadTextFile } from './core/export.js';
import { saveDesign, loadDesign, promptLoadDesign, handleClearDesign, loadRecentSessions, renderRecentDesignsPanel } from './core/storage.js';
import { initTemplateLibrary } from './core/templates.js';
import { initInspirationGallery } from './core/inspiration.js';
import { initColorHarmonizer } from './core/harmonizer.js';
import { initKeywordHelper } from './core/keywords.js';
import { initDifficultyEstimator } from './core/difficulty.js';
import { initPrintSheet } from './core/print.js';
import { initImageWorker, initImageImportListeners } from './core/imageImporter.js';
import { initWelcomeScreen, handleStartFromTemplate, handleStartFromPhoto, handleStartFromBlank } from './ui/welcome.js';
import { initMobileActionBar } from './ui/mobileBar.js';
import { initModals } from './ui/modals.js';
import { showNotification } from './utils/notifications.js';

// ============================================
// VERSION
// ============================================

export const APP_VERSION = '2.0.0';

// ============================================
// DEVELOPER MODE
// ============================================

let isDeveloperMode = false;

export function toggleDeveloperMode() {
    isDeveloperMode = !isDeveloperMode;
    localStorage.setItem('braceyourself_dev_mode', isDeveloperMode ? 'true' : 'false');
    document.body.classList.toggle('dev-mode', isDeveloperMode);
    showNotification(`Developer mode ${isDeveloperMode ? 'ON' : 'OFF'}`, 'info');
}

// Check localStorage for developer mode on startup
if (typeof localStorage !== 'undefined') {
    isDeveloperMode = localStorage.getItem('braceyourself_dev_mode') === 'true';
    if (isDeveloperMode) {
        document.body.classList.add('dev-mode');
        console.log('🔧 Developer mode enabled');
    }
}

// Allow toggling via console
if (typeof window !== 'undefined') {
    window.toggleDevMode = toggleDeveloperMode;
}

// ============================================
// INITIALIZATION
// ============================================

/**
 * Initialize the entire application
 */
export function initApp() {
    console.log('🎨 Brace Yourself v' + APP_VERSION + ' initializing...');

    // Display version in footer
    const versionBadge = document.getElementById('versionBadge');
    if (versionBadge) {
        versionBadge.textContent = `v${APP_VERSION}`;
    }

    // Initialize Web Worker for image processing
    initImageWorker();
    
    // Load saved design or initialize defaults
    const savedDesign = loadDesign();
    if (savedDesign && confirm('Load previous design?')) {
        // Design already applied by loadDesign()
    } else {
        initPalette();
        initGrid();
    }

    // Render UI
    renderPalette();
    renderGrid();
    updateExport();

    // Setup event listeners
    initEventListeners();

    // Initialize feature modules
    initTemplateLibrary();
    initInspirationGallery();
    initColorHarmonizer();
    initKeywordHelper();
    initDifficultyEstimator();
    initPrintSheet();
    initImageImportListeners();
    initWelcomeScreen();
    initMobileActionBar();
    initModals();

    // Load recent sessions
    loadRecentSessions();
    renderRecentDesignsPanel();

    console.log('✅ App initialized successfully');
}

/**
 * Setup all event listeners
 */
function initEventListeners() {
    // Palette
    document.getElementById('addColorBtn')?.addEventListener('click', addColor);

    // Grid
    document.getElementById('resizeGridBtn')?.addEventListener('click', handleResizeGrid);

    // Export
    document.getElementById('copyPatternBtn')?.addEventListener('click', () => copyToClipboard('patternOutput'));
    document.getElementById('copyLegendBtn')?.addEventListener('click', () => copyToClipboard('legendOutput'));
    document.getElementById('downloadBtn')?.addEventListener('click', downloadTextFile);

    // Save/Load
    document.getElementById('saveDesignBtn')?.addEventListener('click', saveDesign);
    document.getElementById('loadDesignBtn')?.addEventListener('click', promptLoadDesign);
    document.getElementById('clearDesignBtn')?.addEventListener('click', handleClearDesign);

    // Keyboard shortcuts
    document.getElementById('newColorInput')?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addColor();
    });
    document.getElementById('newColorLabel')?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addColor();
    });

    // Welcome screen buttons
    document.getElementById('welcomeStartTemplate')?.addEventListener('click', () => {
        document.getElementById('welcomeScreen').classList.add('hidden');
        handleStartFromTemplate();
    });
    document.getElementById('welcomeStartPhoto')?.addEventListener('click', () => {
        document.getElementById('welcomeScreen').classList.add('hidden');
        handleStartFromPhoto();
    });
    document.getElementById('welcomeStartBlank')?.addEventListener('click', () => {
        document.getElementById('welcomeScreen').classList.add('hidden');
        handleStartFromBlank();
    });
}

/**
 * Run initialization when DOM is ready
 */
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}

// Export for testing/debugging
export default { state, initApp, toggleDeveloperMode, APP_VERSION };
