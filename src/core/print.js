/**
 * @file print.js
 * @description Pattern printing functionality
 */

import { generatePatternText, generateLegendText, generateColorMapping } from './export.js';

/**
 * Initialize print sheet UI
 */
export function initPrintSheet() {
    const btn = document.getElementById('generatePrintBtn');
    if (btn) {
        btn.addEventListener('click', generatePrintPreview);
    }
}

/**
 * Generate and display print preview
 */
export function generatePrintPreview() {
    const title = document.getElementById('patternTitleInput')?.value || 'Untitled Pattern';
    const patternText = generatePatternText();
    const legendText = generateLegendText();

    let printHtml = `
        <div class="print-sheet">
            <div class="print-sheet-title">${title}</div>
            
            <div class="print-sheet-legend">
                <div class="print-sheet-legend-title">Color Legend</div>
    `;

    const { colorMap, usedColors } = generateColorMapping();
    usedColors.forEach(color => {
        const letter = colorMap[color];
        printHtml += `
            <div class="print-sheet-legend-item">
                <span class="print-sheet-legend-color" style="background-color: ${color};"></span>
                ${letter} = ${color}
            </div>
        `;
    });

    printHtml += `
            </div>
            
            <div class="print-sheet-pattern">
    `;

    patternText.split('\n').forEach(row => {
        printHtml += `<div class="print-sheet-pattern-row">${row}</div>`;
    });

    printHtml += `
            </div>
        </div>
    `;

    const modal = document.getElementById('printModal');
    const content = document.getElementById('printPreviewContent');
    const printBtn = document.getElementById('printBtn');

    if (content) {
        content.innerHTML = printHtml;
    }
    if (printBtn) {
        printBtn.style.display = 'block';
        printBtn.onclick = () => window.print();
    }

    if (modal) {
        modal.classList.add('active');
    }
}
