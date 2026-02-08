/**
 * @file ui/modals.js
 * @description Modal dialog management
 */

/**
 * Initialize modal handlers
 */
export function initModals() {
    const previewModal = document.getElementById('previewModal');
    const printModal = document.getElementById('printModal');

    // Preview modal
    document.getElementById('closePreviewModal')?.addEventListener('click', () => {
        if (previewModal) previewModal.classList.remove('active');
    });

    // Print modal
    document.getElementById('closePrintModal')?.addEventListener('click', () => {
        if (printModal) printModal.classList.remove('active');
    });

    // Close on overlay click
    if (previewModal) {
        previewModal.addEventListener('click', (e) => {
            if (e.target === previewModal) {
                previewModal.classList.remove('active');
            }
        });
    }

    if (printModal) {
        printModal.addEventListener('click', (e) => {
            if (e.target === printModal) {
                printModal.classList.remove('active');
            }
        });
    }
}

export default { initModals };
