/**
 * @file guided.js
 * @description Guided flow system for new users
 */

import { state } from './state.js';
import { showNotification } from '../utils/notifications.js';
import { estimateDifficultyValue } from './difficulty.js';
import { saveRecentSession } from './storage.js';

/**
 * Start guided flow for a specific mode
 * @param {string} mode - 'template', 'photo', or 'blank'
 */
export function startGuidedFlow(mode) {
    state.guidedFlowActive = true;
    const panel = document.getElementById('guidedFlowPanel');
    const content = document.getElementById('guidedContent');
    
    if (!panel || !content) return;

    panel.style.display = 'block';
    content.innerHTML = '';
    panel.scrollIntoView({ behavior: 'smooth' });

    const paletteStep = createGuidedStep(
        '1. Color Palette',
        getPaletteSuggestionText(mode),
        [
            { text: 'Use This Palette', action: () => applyGuidedPalette(mode) }
        ]
    );
    content.appendChild(paletteStep);

    setTimeout(() => {
        const difficultyStep = createGuidedStep(
            '2. Pattern Difficulty',
            'Analyzing your pattern...',
            []
        );
        content.appendChild(difficultyStep);
        
        setTimeout(() => {
            const difficulty = estimateDifficultyValue();
            updateGuidedStep(difficultyStep, getGuidedDifficultyText(difficulty));
        }, 500);
    }, 1000);

    setTimeout(() => {
        const keywordStep = createGuidedStep(
            '3. Keywords & Title',
            getGuidedKeywordText(mode),
            [
                { text: 'Generate Keywords', action: async () => {
                    const { generateKeywords } = await import('./keywords.js');
                    generateKeywords();
                }}
            ]
        );
        content.appendChild(keywordStep);
    }, 2000);

    setTimeout(() => {
        const finalStep = createGuidedStep(
            '4. Ready to Export',
            'Your pattern is ready! What would you like to do?',
            [
                { text: 'Export Pattern', action: async () => {
                    const { copyToClipboard } = await import('./export.js');
                    copyToClipboard('patternOutput');
                }},
                { text: 'Print', action: async () => {
                    const { generatePrintPreview } = await import('./print.js');
                    generatePrintPreview();
                }},
                { text: 'Done', action: () => closeGuidedFlow() }
            ]
        );
        content.appendChild(finalStep);
    }, 3000);
}

function createGuidedStep(title, text, actions) {
    const step = document.createElement('div');
    step.className = 'guided-step';

    const titleEl = document.createElement('div');
    titleEl.className = 'guided-step-title';
    titleEl.textContent = title;

    const contentEl = document.createElement('div');
    contentEl.className = 'guided-step-content';
    contentEl.textContent = text;

    step.appendChild(titleEl);
    step.appendChild(contentEl);

    actions.forEach(action => {
        const btn = document.createElement('button');
        btn.className = 'btn btn-small guided-action';
        btn.textContent = action.text;
        btn.addEventListener('click', action.action);
        step.appendChild(btn);
    });

    return step;
}

function updateGuidedStep(stepEl, newText) {
    const contentEl = stepEl.querySelector('.guided-step-content');
    if (contentEl) {
        contentEl.textContent = newText;
    }
}

function getPaletteSuggestionText(mode) {
    switch(mode) {
        case 'template':
            return 'This template comes with its own colors. You can modify them in the palette panel below.';
        case 'photo':
            return 'We extracted colors from your image. Check the processed preview!';
        case 'blank':
            return 'We\'ve set up a soft pastel palette to get you started. Perfect for cute designs!';
        default:
            return 'Your color palette is ready!';
    }
}

function getGuidedDifficultyText(difficulty) {
    const messages = {
        'Easy': '✨ This looks beginner-friendly! Simple colors and shapes make it perfect for your first bracelet.',
        'Medium': '🎨 This is a moderate pattern. It has some complexity but is definitely achievable!',
        'Hard': '🏆 This is an advanced pattern with lots of detail. A great challenge for experienced makers!'
    };
    return messages[difficulty] || 'Pattern analyzed!';
}

function getGuidedKeywordText(mode) {
    if (mode === 'template') {
        return 'Add a custom title for your pattern, or use the template name.';
    } else if (mode === 'photo') {
        return 'Give your pattern a name based on your image!';
    } else {
        return 'Name your creation! Keywords will be auto-generated from your colors and design.';
    }
}

function applyGuidedPalette(mode) {
    showNotification('Palette applied!', 'success');
}

export function closeGuidedFlow() {
    const panel = document.getElementById('guidedFlowPanel');
    if (!panel) return;

    panel.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => {
        panel.style.display = 'none';
        panel.style.animation = '';
        state.guidedFlowActive = false;
    }, 300);
    
    showNotification('Great job! Your pattern is complete. 🎉', 'success');
    saveRecentSession();
}
