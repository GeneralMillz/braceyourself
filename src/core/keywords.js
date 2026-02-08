/**
 * @file keywords.js
 * @description Keyword generation for pattern descriptions
 */

import { state } from './state.js';
import { showNotification } from '../utils/notifications.js';
import { estimateDifficultyValue } from './difficulty.js';
import { getColorName } from '../utils/colorUtils.js';

/**
 * Initialize keyword helper UI
 */
export function initKeywordHelper() {
    const generateBtn = document.getElementById('generateKeywordsBtn');
    const copyBtn = document.getElementById('copyKeywordsBtn');

    if (generateBtn) {
        generateBtn.addEventListener('click', generateKeywords);
    }
    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            const { copyToClipboard } = await import('./export.js');
            copyToClipboard('keywordsTextarea');
        });
    }
}

/**
 * Auto-generate keywords from pattern analysis
 */
export function generateKeywords() {
    const title = document.getElementById('patternTitleInput')?.value || '';
    const keywords = [];

    // Add title words
    if (title) {
        keywords.push(...title.toLowerCase().split(/\s+/));
    }

    // Analyze colors
    const uniqueColors = new Set();
    for (let row of state.gridData) {
        for (let color of row) {
            if (color) uniqueColors.add(color);
        }
    }

    uniqueColors.forEach(color => {
        const name = getColorName(color);
        if (name && !keywords.includes(name)) {
            keywords.push(name);
        }
    });

    // Add category based on complexity
    const difficulty = estimateDifficultyValue();
    if (difficulty === 'Easy') {
        keywords.push('simple', 'beginner', 'easy');
    } else if (difficulty === 'Hard') {
        keywords.push('complex', 'advanced', 'detailed');
    } else {
        keywords.push('intermediate');
    }

    // Add generic bracelet keywords
    const braceletKeywords = ['alpha', 'bracelet', 'pattern', 'beads', 'jewelry', 'handmade', 'craft', 'design'];
    keywords.push(...braceletKeywords);

    // Add aesthetic keywords based on colors
    if (uniqueColors.size <= 3) {
        keywords.push('minimalist');
    }
    if (uniqueColors.size >= 6) {
        keywords.push('colorful');
    }

    // Remove duplicates and limit to 20
    const unique = Array.from(new Set(keywords)).filter(k => k.length > 2).slice(0, 20);

    const textarea = document.getElementById('keywordsTextarea');
    if (textarea) {
        textarea.value = unique.join(' ');
    }

    const output = document.getElementById('keywordOutput');
    if (output) {
        output.style.display = 'block';
    }

    showNotification('Keywords generated!', 'success');
}
