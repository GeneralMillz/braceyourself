/**
 * @file ui/mobileBar.js
 * @description Mobile action bar
 */

import { copyToClipboard } from '../core/export.js';
import { generatePrintPreview } from '../core/print.js';

/**
 * Initialize mobile action bar
 */
export function initMobileActionBar() {
    document.getElementById('mobileExportBtn')?.addEventListener('click', () => {
        copyToClipboard('patternOutput');
    });

    document.getElementById('mobilePrintBtn')?.addEventListener('click', () => {
        generatePrintPreview();
    });

    document.getElementById('mobileBBBtn')?.addEventListener('click', () => {
        window.open('https://www.braceletbook.com/patterns/add/', '_blank');
    });
}

export default { initMobileActionBar };
