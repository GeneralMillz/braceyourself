/**
 * @file difficulty.js
 * @description Pattern difficulty estimation
 */

import { state } from './state.js';
import { showNotification } from '../utils/notifications.js';

/**
 * Initialize difficulty estimator UI
 */
export function initDifficultyEstimator() {
    const btn = document.getElementById('analyzeDifficultyBtn');
    if (btn) {
        btn.addEventListener('click', analyzeDifficulty);
    }
}

/**
 * Analyze and display pattern difficulty
 */
export function analyzeDifficulty() {
    const difficulty = estimateDifficultyValue();
    const factors = calculateDifficultyFactors();

    const output = document.getElementById('difficultyOutput');
    if (!output) return;

    const badge = document.getElementById('difficultyBadge');
    const factorsDiv = document.getElementById('difficultyFactors');
    const explanation = document.getElementById('difficultyExplanation');

    if (badge) {
        badge.className = `difficulty-badge ${difficulty.toLowerCase()}`;
        badge.textContent = difficulty;
    }

    if (factorsDiv) {
        let factorsHtml = '';
        for (let key in factors) {
            factorsHtml += `
                <div class="difficulty-factor">
                    <span class="difficulty-factor-label">${key}:</span>
                    <span class="difficulty-factor-value">${factors[key]}</span>
                </div>
            `;
        }
        factorsDiv.innerHTML = factorsHtml;
    }

    if (explanation) {
        explanation.textContent = getDifficultyExplanation(factors, difficulty);
    }

    output.style.display = 'block';
}

/**
 * Estimate difficulty level
 * @returns {string} 'Easy', 'Medium', or 'Hard'
 */
export function estimateDifficultyValue() {
    const factors = calculateDifficultyFactors();
    let score = 0;

    score += factors['Colors Used'];
    score += Math.floor(factors['Avg Changes/Row'] / 2);
    score += Math.floor(factors['Total Pixels'] / 50);

    if (score <= 15) return 'Easy';
    if (score <= 35) return 'Medium';
    return 'Hard';
}

/**
 * Calculate difficulty metrics
 * @returns {Object} Metrics object
 */
export function calculateDifficultyFactors() {
    const colorSet = new Set();
    let totalChanges = 0;
    let totalPixels = 0;

    for (let row of state.gridData) {
        let rowChanges = 0;
        let lastColor = null;

        for (let color of row) {
            if (color) {
                colorSet.add(color);
                totalPixels++;
                if (color !== lastColor) {
                    rowChanges++;
                }
                lastColor = color;
            }
        }
        totalChanges += rowChanges;
    }

    return {
        'Colors Used': colorSet.size,
        'Avg Changes/Row': Math.round((totalChanges / state.gridHeight) * 10) / 10,
        'Total Pixels': totalPixels,
        'Grid Size': `${state.gridWidth}×${state.gridHeight}`,
    };
}

/**
 * Generate difficulty explanation text
 * @param {Object} factors - Result from calculateDifficultyFactors()
 * @param {string} difficulty - Difficulty level
 * @returns {string} Explanation text
 */
export function getDifficultyExplanation(factors, difficulty) {
    let explanation = '';

    const colors = factors['Colors Used'];
    const changes = factors['Avg Changes/Row'];

    if (colors <= 2) {
        explanation += 'This pattern uses very few colors, making it quite simple. ';
    } else if (colors <= 4) {
        explanation += 'This pattern uses a limited palette, keeping it manageable. ';
    } else {
        explanation += 'This pattern uses many colors, which increases complexity. ';
    }

    if (changes >= 15) {
        explanation += 'Many color changes per row mean more frequent thread switches. ';
    } else if (changes >= 8) {
        explanation += 'A moderate number of color changes makes this moderately challenging. ';
    } else {
        explanation += 'Few color changes allow for longer continuous sections. ';
    }

    if (difficulty === 'Easy') {
        explanation += 'Overall, this is a beginner-friendly pattern!';
    } else if (difficulty === 'Medium') {
        explanation += 'This requires some attention but is achievable with practice.';
    } else {
        explanation += 'This is a challenging pattern for experienced bracelet makers.';
    }

    return explanation;
}
