/**
 * @file imageImporter.js
 * @description Image import and processing pipeline
 */

import { state } from './state.js';
import { showNotification } from '../utils/notifications.js';
import { rgbToHex, hexToRgb, distanceBetweenColors } from '../utils/colorUtils.js';
import { renderGrid } from './grid.js';
import { renderPalette } from './palette.js';
import { updateExport } from './export.js';

/**
 * Initialize image worker
 */
export function initImageWorker() {
    try {
        state.imageWorker = new Worker('imageWorker.js');
        
        state.imageWorker.onmessage = function(e) {
            const { type, result, progress, message, error } = e.data;
            
            switch(type) {
                case 'PROGRESS':
                    updateWorkerProgress(progress, message);
                    break;
                    
                case 'COMPLETE':
                    handleWorkerComplete(result);
                    break;
                    
                case 'ERROR':
                    handleWorkerError(error);
                    break;
            }
        };
        
        state.imageWorker.onerror = function(error) {
            console.error('Worker error:', error);
            handleWorkerError('Worker failed to initialize');
            state.workerReady = false;
            updateWorkerStatus('error', 'Worker Error - Using Fallback');
        };
        
        state.workerReady = true;
        updateWorkerStatus('ready', 'Web Worker Ready ⚡');
        
    } catch (error) {
        console.warn('Web Worker not supported, using fallback mode');
        state.workerReady = false;
        updateWorkerStatus('fallback', 'Fallback Mode (No Worker)');
    }
}

/**
 * Initialize image import UI listeners
 */
export function initImageImportListeners() {
    document.getElementById('importImageInput')?.addEventListener('change', handleImageUpload);
    document.getElementById('processImageBtn')?.addEventListener('click', handleProcessImage);
    document.getElementById('sendToGridBtn')?.addEventListener('click', handleSendToGrid);
}

/**
 * Update worker status display
 * @param {string} status - Status type ('ready', 'error', 'fallback')
 * @param {string} text - Status text to display
 */
export function updateWorkerStatus(status, text) {
    const statusEl = document.getElementById('workerStatus');
    if (statusEl) {
        statusEl.className = 'worker-status ' + status;
        const textEl = statusEl.querySelector('.status-text');
        if (textEl) textEl.textContent = text;
        
        const icon = statusEl.querySelector('.status-icon');
        if (icon) {
            if (status === 'ready') {
                icon.textContent = '⚡';
            } else if (status === 'error') {
                icon.textContent = '⚠️';
            } else {
                icon.textContent = '💾';
            }
        }
    }
}

/**
 * Update worker progress display
 * @param {number} progress - Percentage complete
 * @param {string} message - Status message
 */
export function updateWorkerProgress(progress, message) {
    const overlay = document.getElementById('workerLoadingOverlay');
    const messageEl = document.getElementById('loadingMessage');
    const progressEl = document.getElementById('loadingProgress');
    
    if (overlay && !overlay.classList.contains('hidden')) {
        if (messageEl) messageEl.textContent = message;
        if (progressEl) progressEl.textContent = Math.round(progress) + '%';
    }
}

/**
 * Show worker loading overlay
 */
export function showWorkerLoading() {
    const overlay = document.getElementById('workerLoadingOverlay');
    if (overlay) {
        overlay.classList.remove('hidden');
    }
}

/**
 * Hide worker loading overlay
 */
export function hideWorkerLoading() {
    const overlay = document.getElementById('workerLoadingOverlay');
    if (overlay) {
        overlay.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => {
            overlay.classList.add('hidden');
            overlay.style.animation = '';
        }, 300);
    }
}

/**
 * Handle worker completion
 * @param {Object} result - Processing result
 */
export function handleWorkerComplete(result) {
    hideWorkerLoading();
    
    state.processedImageData = result;
    renderReducedPreview(result.pixelData, result.width, result.height);
    
    document.getElementById('reducedPreviewContainer').style.display = 'block';
    document.getElementById('sendToGridBtn').disabled = false;
    
    const stats = result.stats;
    const statsMessage = `Processed! ${stats.originalColors}→${stats.finalColors} colors`;
    showNotification(statsMessage, 'success');
}

/**
 * Handle worker error
 * @param {string} error - Error message
 */
export function handleWorkerError(error) {
    hideWorkerLoading();
    console.error('Worker processing error:', error);
    showNotification('Processing failed. Try fallback mode or smaller image.', 'error');
}

/**
 * Handle image file upload
 * @param {Event} e - Change event from file input
 */
export function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.getElementById('imageOriginalPreview');
            const ctx = canvas.getContext('2d');
            
            const maxSize = 200;
            const ratio = Math.min(maxSize / img.width, maxSize / img.height);
            canvas.width = img.width * ratio;
            canvas.height = img.height * ratio;
            
            ctx.imageSmoothingEnabled = false;
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            
            state.uploadedImage = img;
            
            document.getElementById('processImageBtn').disabled = false;
            showNotification('Image loaded! Click "Process Image" to continue.', 'success');
        };
        img.src = event.target.result;
    };
    reader.readAsDataURL(file);
}

/**
 * Handle image processing
 */
export function handleProcessImage() {
    if (!state.uploadedImage) {
        showNotification('Please upload an image first.', 'error');
        return;
    }

    const targetWidth = parseInt(document.getElementById('importWidth')?.value, 10);
    const targetHeight = parseInt(document.getElementById('importHeight')?.value, 10);
    const maxColors = parseInt(document.getElementById('importMaxColors')?.value, 10);

    if (isNaN(targetWidth) || isNaN(targetHeight) || isNaN(maxColors)) {
        showNotification('Please enter valid numbers for all fields.', 'error');
        return;
    }

    if (targetWidth < 4 || targetHeight < 4 || targetWidth > 80 || targetHeight > 80) {
        showNotification('Grid size must be between 4 and 80.', 'error');
        return;
    }

    if (maxColors < 2 || maxColors > 12) {
        showNotification('Max colors must be between 2 and 12.', 'error');
        return;
    }

    const detailBoost = parseInt(document.getElementById('detailBoostSlider')?.value, 10) || 0;
    const resizeMode = document.getElementById('resizeModeSelect')?.value || 'fill';
    const usePaletteLock = document.getElementById('paletteLockToggle')?.checked;
    const enableDithering = document.getElementById('ditheringToggle')?.checked;
    const autoTemplateMode = document.getElementById('autoTemplateToggle')?.checked;

    let lockedPalette = null;
    if (usePaletteLock && state.palette.length > 0) {
        lockedPalette = state.palette.map(c => c.hex);
    }

    if (state.workerReady && state.imageWorker) {
        processImageWithWorker(targetWidth, targetHeight, maxColors, detailBoost, resizeMode, usePaletteLock, lockedPalette, enableDithering, autoTemplateMode);
    } else {
        processImageFallback(targetWidth, targetHeight, maxColors);
    }
}

/**
 * Process image using web worker
 */
export function processImageWithWorker(targetWidth, targetHeight, maxColors, detailBoost, resizeMode, usePaletteLock, lockedPalette, enableDithering, autoTemplateMode) {
    try {
        showWorkerLoading();
        
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = state.uploadedImage.width;
        tempCanvas.height = state.uploadedImage.height;
        const tempCtx = tempCanvas.getContext('2d');
        tempCtx.drawImage(state.uploadedImage, 0, 0);
        const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
        
        state.imageWorker.postMessage({
            type: 'PROCESS_IMAGE',
            data: {
                imageData: imageData,
                targetWidth: targetWidth,
                targetHeight: targetHeight,
                maxColors: maxColors,
                detailBoost: detailBoost,
                resizeMode: resizeMode,
                usePaletteLock: usePaletteLock,
                lockedPalette: lockedPalette,
                enableDithering: enableDithering,
                autoTemplateMode: autoTemplateMode
            }
        });
        
    } catch (error) {
        console.error('Failed to send to worker:', error);
        hideWorkerLoading();
        showNotification('Worker failed, trying fallback...', 'warning');
        processImageFallback(targetWidth, targetHeight, maxColors);
    }
}

/**
 * Fallback image processing without web worker
 */
export function processImageFallback(targetWidth, targetHeight, maxColors) {
    try {
        const resizedPixels = resizeImageNearestNeighbor(state.uploadedImage, targetWidth, targetHeight);
        const quantizedData = quantizeColorsMedianCut(resizedPixels, maxColors);
        const hexPixels = quantizedData.pixelData;
        const palette = quantizedData.palette;

        renderReducedPreview(hexPixels, targetWidth, targetHeight);

        state.processedImageData = {
            pixelData: hexPixels,
            width: targetWidth,
            height: targetHeight,
            palette: palette,
        };

        document.getElementById('reducedPreviewContainer').style.display = 'block';
        document.getElementById('sendToGridBtn').disabled = false;

        showNotification('Image processed! Click "Send to Grid" to apply pattern.', 'success');
    } catch (error) {
        console.error('Image processing error:', error);
        showNotification('Error processing image. Please try again.', 'error');
    }
}

/**
 * Resize image using nearest neighbor sampling
 */
export function resizeImageNearestNeighbor(img, targetWidth, targetHeight) {
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = img.width;
    tempCanvas.height = img.height;
    const tempCtx = tempCanvas.getContext('2d');
    tempCtx.drawImage(img, 0, 0);

    const srcData = tempCtx.getImageData(0, 0, img.width, img.height).data;
    const output = Array(targetHeight)
        .fill(null)
        .map(() => Array(targetWidth).fill(null));

    const xRatio = img.width / targetWidth;
    const yRatio = img.height / targetHeight;

    for (let y = 0; y < targetHeight; y++) {
        for (let x = 0; x < targetWidth; x++) {
            const srcX = Math.floor(x * xRatio);
            const srcY = Math.floor(y * yRatio);

            const srcIndex = (srcY * img.width + srcX) * 4;
            const r = srcData[srcIndex];
            const g = srcData[srcIndex + 1];
            const b = srcData[srcIndex + 2];
            const a = srcData[srcIndex + 3];

            if (a < 128) {
                output[y][x] = null;
            } else {
                output[y][x] = { r, g, b };
            }
        }
    }

    return output;
}

/**
 * Quantize colors using median cut algorithm
 */
export function quantizeColorsMedianCut(pixelData, maxColors) {
    const pixels = [];
    for (let row of pixelData) {
        for (let pixel of row) {
            if (pixel) {
                pixels.push(pixel);
            }
        }
    }

    if (pixels.length === 0) {
        return { pixelData: pixelData, palette: [{ hex: '#ffffff', label: 'White' }] };
    }

    const boxes = [pixels];
    let iteration = 0;

    while (boxes.length < maxColors && iteration < 20) {
        let maxBox = 0;
        let maxRange = 0;

        for (let i = 0; i < boxes.length; i++) {
            const range = getColorRange(boxes[i]);
            if (range > maxRange) {
                maxRange = range;
                maxBox = i;
            }
        }

        const box = boxes[maxBox];
        const [box1, box2] = splitBox(box);
        boxes.splice(maxBox, 1, box1, box2);
        iteration++;
    }

    const palette = boxes.map((box) => {
        const avgColor = getAverageColor(box);
        return { hex: rgbToHex(avgColor.r, avgColor.g, avgColor.b), label: '' };
    });

    const outputPixelData = Array(pixelData.length)
        .fill(null)
        .map(() => Array(pixelData[0].length).fill(null));

    for (let y = 0; y < pixelData.length; y++) {
        for (let x = 0; x < pixelData[y].length; x++) {
            const pixel = pixelData[y][x];
            if (pixel) {
                let nearestColor = palette[0].hex;
                let minDistance = Infinity;

                for (let paletteColor of palette) {
                    const dist = distanceBetweenColors(pixel, hexToRgb(paletteColor.hex));
                    if (dist < minDistance) {
                        minDistance = dist;
                        nearestColor = paletteColor.hex;
                    }
                }

                outputPixelData[y][x] = nearestColor;
            }
        }
    }

    return { pixelData: outputPixelData, palette };
}

export function getColorRange(pixels) {
    if (pixels.length === 0) return 0;
    let minR = 255, maxR = 0, minG = 255, maxG = 0, minB = 255, maxB = 0;
    for (let pixel of pixels) {
        minR = Math.min(minR, pixel.r);
        maxR = Math.max(maxR, pixel.r);
        minG = Math.min(minG, pixel.g);
        maxG = Math.max(maxG, pixel.g);
        minB = Math.min(minB, pixel.b);
        maxB = Math.max(maxB, pixel.b);
    }
    return Math.max(maxR - minR, maxG - minG, maxB - minB);
}

export function splitBox(pixels) {
    const mids = { r: 0, g: 0, b: 0 };
    let minR = 255, maxR = 0, minG = 255, maxG = 0, minB = 255, maxB = 0;
    for (let pixel of pixels) {
        minR = Math.min(minR, pixel.r);
        maxR = Math.max(maxR, pixel.r);
        minG = Math.min(minG, pixel.g);
        maxG = Math.max(maxG, pixel.g);
        minB = Math.min(minB, pixel.b);
        maxB = Math.max(maxB, pixel.b);
    }
    const rRange = maxR - minR, gRange = maxG - minG, bRange = maxB - minB;
    let axis;
    if (rRange >= gRange && rRange >= bRange) {
        axis = 'r';
        mids.r = (minR + maxR) / 2;
    } else if (gRange >= bRange) {
        axis = 'g';
        mids.g = (minG + maxG) / 2;
    } else {
        axis = 'b';
        mids.b = (minB + maxB) / 2;
    }
    const box1 = [], box2 = [];
    for (let pixel of pixels) {
        if (pixel[axis] < mids[axis]) {
            box1.push(pixel);
        } else {
            box2.push(pixel);
        }
    }
    if (box1.length === 0) box1.push(box2.pop());
    if (box2.length === 0) box2.push(box1.pop());
    return [box1, box2];
}

export function getAverageColor(pixels) {
    if (pixels.length === 0) return { r: 0, g: 0, b: 0 };
    let sumR = 0, sumG = 0, sumB = 0;
    for (let pixel of pixels) {
        sumR += pixel.r;
        sumG += pixel.g;
        sumB += pixel.b;
    }
    return {
        r: Math.round(sumR / pixels.length),
        g: Math.round(sumG / pixels.length),
        b: Math.round(sumB / pixels.length),
    };
}

/**
 * Render reduced preview after processing
 */
export function renderReducedPreview(pixelData, width, height) {
    const canvas = document.getElementById('imageReducedPreview');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const maxSize = 200;
    const pixelSize = Math.max(1, Math.floor(maxSize / Math.max(width, height)));

    canvas.width = width * pixelSize;
    canvas.height = height * pixelSize;

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const color = pixelData[y][x];
            if (color) {
                ctx.fillStyle = color;
                ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
            } else {
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
                ctx.strokeStyle = '#eee';
                ctx.strokeRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
            }
        }
    }
}

/**
 * Send processed image to grid
 */
export function handleSendToGrid() {
    if (!state.processedImageData) {
        showNotification('Please process an image first.', 'error');
        return;
    }

    const { pixelData, width, height, palette } = state.processedImageData;

    state.gridWidth = width;
    state.gridHeight = height;
    state.gridData = pixelData;

    const uniqueColors = new Set();
    for (let row of pixelData) {
        for (let color of row) {
            if (color) uniqueColors.add(color);
        }
    }

    state.palette = Array.from(uniqueColors).map((hex, index) => ({
        hex,
        label: `Color ${index + 1}`,
    }));

    if (state.palette.length > 0) {
        state.selectedColor = state.palette[0];
    }

    document.getElementById('widthInput').value = width;
    document.getElementById('heightInput').value = height;

    renderPalette();
    renderGrid();
    updateExport();

    showNotification('Pattern applied to grid! Ready to export.', 'success');
    
    if (state.currentStartMode === 'photo') {
        const { startGuidedFlow } = await import('./guided.js');
        setTimeout(() => {
            startGuidedFlow('photo');
        }, 500);
    }
}
