/**
 * @file ui/welcome.js
 * @description Welcome screen and startup flow
 */

import { state } from '../core/state.js';
import { initPalette, renderPalette } from '../core/palette.js';
import { initGrid, renderGrid } from '../core/grid.js';
import { updateExport } from '../core/export.js';
import { loadRecentSession, loadRecentSessions, renderRecentDesignsPanel } from '../core/storage.js';
import { startGuidedFlow } from '../core/guided.js';
import { showNotification } from '../utils/notifications.js';

/**
 * Initialize welcome screen
 */
export function initWelcomeScreen() {
    loadRecentSessions();
    
    const hasCurrentWork = state.gridData.some(row => row.some(cell => cell !== null));
    
    if (!hasCurrentWork) {
        showWelcomeScreen();
    }

    document.getElementById('welcomeStartTemplate')?.addEventListener('click', () => {
        hideWelcomeScreen();
        handleStartFromTemplate();
    });

    document.getElementById('welcomeStartPhoto')?.addEventListener('click', () => {
        hideWelcomeScreen();
        handleStartFromPhoto();
    });

    document.getElementById('welcomeStartBlank')?.addEventListener('click', () => {
        hideWelcomeScreen();
        handleStartFromBlank();
    });
}

/**
 * Show welcome screen overlay
 */
export function showWelcomeScreen() {
    const welcomeScreen = document.getElementById('welcomeScreen');
    
    if (state.recentSessions.length > 0) {
        const recentSection = document.getElementById('welcomeRecentSection');
        if (recentSection) {
            recentSection.style.display = 'block';
            renderWelcomeRecentSessions();
        }
    }
    
    if (welcomeScreen) {
        welcomeScreen.classList.remove('hidden');
    }
}

/**
 * Hide welcome screen overlay
 */
export function hideWelcomeScreen() {
    const welcomeScreen = document.getElementById('welcomeScreen');
    if (!welcomeScreen) return;

    welcomeScreen.style.animation = 'fadeOut 0.3s ease';
    setTimeout(() => {
        welcomeScreen.classList.add('hidden');
        welcomeScreen.style.animation = '';
    }, 300);
}

/**
 * Render recent sessions in welcome screen
 */
function renderWelcomeRecentSessions() {
    const grid = document.getElementById('welcomeRecentGrid');
    if (!grid) return;

    grid.innerHTML = '';

    state.recentSessions.slice(0, 3).forEach(session => {
        const card = document.createElement('div');
        card.className = 'welcome-recent-card';

        const thumbnail = document.createElement('img');
        thumbnail.className = 'welcome-recent-thumbnail';
        thumbnail.src = session.thumbnail;

        const title = document.createElement('div');
        title.className = 'welcome-recent-title-text';
        title.textContent = session.title || 'Untitled';

        card.appendChild(thumbnail);
        card.appendChild(title);

        card.addEventListener('click', () => {
            loadRecentSession(session);
            hideWelcomeScreen();
        });

        grid.appendChild(card);
    });
}

/**
 * Start from template mode
 */
export function handleStartFromTemplate() {
    state.currentStartMode = 'template';
    
    const templatePanel = document.querySelector('.template-grid')?.parentElement;
    if (templatePanel) {
        templatePanel.scrollIntoView({ behavior: 'smooth' });
        templatePanel.style.animation = 'pulse 0.5s ease';
        setTimeout(() => {
            templatePanel.style.animation = '';
        }, 500);
    }
    
    showNotification('Choose a template to get started!', 'info');
}

/**
 * Start from photo  mode
 */
export function handleStartFromPhoto() {
    state.currentStartMode = 'photo';
    
    const imageInput = document.getElementById('importImageInput');
    if (imageInput) {
        imageInput.click();
    }
    
    const importPanel = imageInput?.closest('.panel');
    if (importPanel) {
        importPanel.scrollIntoView({ behavior: 'smooth' });
    }
    
    showNotification('Upload an image to create a pattern!', 'info');
}

/**
 * Start from blank grid mode
 */
export function handleStartFromBlank() {
    state.currentStartMode = 'blank';
    
    initPalette();
    initGrid();
    renderPalette();
    renderGrid();
    updateExport();
    
    startGuidedFlow('blank');
}

export default {
    initWelcomeScreen,
    showWelcomeScreen,
    hideWelcomeScreen,
    handleStartFromTemplate,
    handleStartFromPhoto,
    handleStartFromBlank
};
