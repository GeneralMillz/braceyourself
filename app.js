/* ==============================================
   APP.JS - Brace Yourself Pattern Designer
   ============================================== */

// ============================================
// STATE
// ============================================

const state = {
    gridWidth: 24,
    gridHeight: 24,
    gridData: [],
    palette: [],
    selectedColor: null,
    uploadedImage: null,
    processedImageData: null,
    recentSessions: [],
    guidedFlowActive: false,
    currentStartMode: null,
    imageWorker: null,
    workerReady: false,
};

// ============================================
// WEB WORKER INITIALIZATION
// ============================================

function initImageWorker() {
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

function updateWorkerStatus(status, text) {
    const statusEl = document.getElementById('workerStatus');
    if (statusEl) {
        statusEl.className = 'worker-status ' + status;
        statusEl.querySelector('.status-text').textContent = text;
        
        const icon = statusEl.querySelector('.status-icon');
        if (status === 'ready') {
            icon.textContent = '⚡';
        } else if (status === 'error') {
            icon.textContent = '⚠️';
        } else {
            icon.textContent = '💾';
        }
    }
}

function updateWorkerProgress(progress, message) {
    const overlay = document.getElementById('workerLoadingOverlay');
    const messageEl = document.getElementById('loadingMessage');
    const progressEl = document.getElementById('loadingProgress');
    
    if (overlay && !overlay.classList.contains('hidden')) {
        if (messageEl) messageEl.textContent = message;
        if (progressEl) progressEl.textContent = Math.round(progress) + '%';
    }
}

function handleWorkerComplete(result) {
    hideWorkerLoading();
    
    // Store processed data
    state.processedImageData = result;
    
    // Render preview
    renderReducedPreview(result.pixelData, result.width, result.height);
    
    // Show reduced preview container and enable send button
    document.getElementById('reducedPreviewContainer').style.display = 'block';
    document.getElementById('sendToGridBtn').disabled = false;
    
    // Show stats
    const stats = result.stats;
    const statsMessage = `Processed! ${stats.originalColors}→${stats.finalColors} colors`;
    showNotification(statsMessage, 'success');
}

function handleWorkerError(error) {
    hideWorkerLoading();
    console.error('Worker processing error:', error);
    showNotification('Processing failed. Try fallback mode or smaller image.', 'error');
}

function showWorkerLoading() {
    const overlay = document.getElementById('workerLoadingOverlay');
    if (overlay) {
        overlay.classList.remove('hidden');
    }
}

function hideWorkerLoading() {
    const overlay = document.getElementById('workerLoadingOverlay');
    if (overlay) {
        overlay.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => {
            overlay.classList.add('hidden');
            overlay.style.animation = '';
        }, 300);
    }
}

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', initApp);

function initApp() {
    // Initialize Web Worker
    initImageWorker();
    
    // Try to load saved design; otherwise initialize defaults
    const savedDesign = loadDesign();
    if (savedDesign && confirm('Load previous design?')) {
        // savedDesign already applied the state
    } else {
        initPalette();
        initGrid();
    }

    initEventListeners();
    renderPalette();
    renderGrid();
    updateExport();
}

function initPalette() {
    // Default palette with soft pastel colors
    state.palette = [
        { hex: '#a8d8ea', label: 'Sky Blue' },
        { hex: '#d4c5f9', label: 'Lavender' },
        { hex: '#ffc0cb', label: 'Soft Pink' },
        { hex: '#ffe4b5', label: 'Peach' },
        { hex: '#c1ffc1', label: 'Mint Green' },
    ];
    state.selectedColor = state.palette[0];
}

function initGrid() {
    state.gridData = Array(state.gridHeight)
        .fill(null)
        .map(() => Array(state.gridWidth).fill(null));
}

function initEventListeners() {
    // Palette
    document.getElementById('addColorBtn').addEventListener('click', addColor);

    // Grid
    document.getElementById('resizeGridBtn').addEventListener('click', handleResizeGrid);

    // Image Import
    initImageImportListeners();

    // Export
    document.getElementById('copyPatternBtn').addEventListener('click', () => copyToClipboard('patternOutput'));
    document.getElementById('copyLegendBtn').addEventListener('click', () => copyToClipboard('legendOutput'));
    document.getElementById('downloadBtn').addEventListener('click', downloadTextFile);

    // Save/Load
    document.getElementById('saveDesignBtn').addEventListener('click', saveDesign);
    document.getElementById('loadDesignBtn').addEventListener('click', promptLoadDesign);
    document.getElementById('clearDesignBtn').addEventListener('click', handleClearDesign);

    // Color input on Enter
    document.getElementById('newColorInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addColor();
    });
    document.getElementById('newColorLabel').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addColor();
    });
}

// ============================================
// IMAGE IMPORT & PROCESSING
// ============================================

function initImageImportListeners() {
    document.getElementById('importImageInput').addEventListener('change', handleImageUpload);
    document.getElementById('processImageBtn').addEventListener('click', handleProcessImage);
    document.getElementById('sendToGridBtn').addEventListener('click', handleSendToGrid);
}

function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
            // Draw to original preview canvas
            const canvas = document.getElementById('imageOriginalPreview');
            const ctx = canvas.getContext('2d');
            
            // Set canvas size to maintain aspect ratio, max 200px wide
            const maxSize = 200;
            const ratio = Math.min(maxSize / img.width, maxSize / img.height);
            canvas.width = img.width * ratio;
            canvas.height = img.height * ratio;
            
            ctx.imageSmoothingEnabled = false;
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            
            // Store image data for processing
            state.uploadedImage = img;
            
            // Enable process button
            document.getElementById('processImageBtn').disabled = false;
            showNotification('Image loaded! Click "Process Image" to continue.', 'success');
        };
        img.src = event.target.result;
    };
    reader.readAsDataURL(file);
}

function handleProcessImage() {
    if (!state.uploadedImage) {
        showNotification('Please upload an image first.', 'error');
        return;
    }

    const targetWidth = parseInt(document.getElementById('importWidth').value, 10);
    const targetHeight = parseInt(document.getElementById('importHeight').value, 10);
    const maxColors = parseInt(document.getElementById('importMaxColors').value, 10);

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

    // Get new control values
    const detailBoost = parseInt(document.getElementById('detailBoostSlider').value, 10);
    const resizeMode = document.getElementById('resizeModeSelect').value;
    const usePaletteLock = document.getElementById('paletteLockToggle').checked;
    const enableDithering = document.getElementById('ditheringToggle').checked;
    const autoTemplateMode = document.getElementById('autoTemplateToggle').checked;

    // Prepare locked palette if enabled
    let lockedPalette = null;
    if (usePaletteLock && state.palette.length > 0) {
        lockedPalette = state.palette.map(c => c.hex);
    }

    // Use Web Worker if available
    if (state.workerReady && state.imageWorker) {
        processImageWithWorker(targetWidth, targetHeight, maxColors, detailBoost, resizeMode, usePaletteLock, lockedPalette, enableDithering, autoTemplateMode);
    } else {
        // Fallback to original processing
        processImageFallback(targetWidth, targetHeight, maxColors);
    }
}

function processImageWithWorker(targetWidth, targetHeight, maxColors, detailBoost, resizeMode, usePaletteLock, lockedPalette, enableDithering, autoTemplateMode) {
    try {
        showWorkerLoading();
        
        // Get image data from uploaded image
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = state.uploadedImage.width;
        tempCanvas.height = state.uploadedImage.height;
        const tempCtx = tempCanvas.getContext('2d');
        tempCtx.drawImage(state.uploadedImage, 0, 0);
        const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
        
        // Send to worker
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

function processImageFallback(targetWidth, targetHeight, maxColors) {
    try {
        // Step 1: Resize image to target grid size
        const resizedPixels = resizeImageNearestNeighbor(state.uploadedImage, targetWidth, targetHeight);

        // Step 2: Quantize colors
        const quantizedData = quantizeColorsMedianCut(resizedPixels, maxColors);
        const hexPixels = quantizedData.pixelData;
        const palette = quantizedData.palette;

        // Step 3: Render preview
        renderReducedPreview(hexPixels, targetWidth, targetHeight);

        // Store for grid application
        state.processedImageData = {
            pixelData: hexPixels,
            width: targetWidth,
            height: targetHeight,
            palette: palette,
        };

        // Show reduced preview container and enable send button
        document.getElementById('reducedPreviewContainer').style.display = 'block';
        document.getElementById('sendToGridBtn').disabled = false;

        showNotification('Image processed! Click "Send to Grid" to apply pattern.', 'success');
    } catch (error) {
        console.error('Image processing error:', error);
        showNotification('Error processing image. Please try again.', 'error');
    }
}

function resizeImageNearestNeighbor(img, targetWidth, targetHeight) {
    // Create off-screen canvas to get original pixel data
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = img.width;
    tempCanvas.height = img.height;
    const tempCtx = tempCanvas.getContext('2d');
    tempCtx.drawImage(img, 0, 0);

    const srcData = tempCtx.getImageData(0, 0, img.width, img.height).data;

    // Create output array
    const output = Array(targetHeight)
        .fill(null)
        .map(() => Array(targetWidth).fill(null));

    // Nearest-neighbor scaling
    const xRatio = img.width / targetWidth;
    const yRatio = img.height / targetHeight;

    for (let y = 0; y < targetHeight; y++) {
        for (let x = 0; x < targetWidth; x++) {
            // Find nearest source pixel
            const srcX = Math.floor(x * xRatio);
            const srcY = Math.floor(y * yRatio);

            // Get pixel from source
            const srcIndex = (srcY * img.width + srcX) * 4;
            const r = srcData[srcIndex];
            const g = srcData[srcIndex + 1];
            const b = srcData[srcIndex + 2];
            const a = srcData[srcIndex + 3];

            // Skip transparent pixels
            if (a < 128) {
                output[y][x] = null;
            } else {
                output[y][x] = { r, g, b };
            }
        }
    }

    return output;
}

function quantizeColorsMedianCut(pixelData, maxColors) {
    // Flatten pixel data and filter out nulls
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

    // Median cut algorithm
    const boxes = [pixels];
    let iteration = 0;

    while (boxes.length < maxColors && iteration < 20) {
        // Find box with largest range
        let maxBox = 0;
        let maxRange = 0;

        for (let i = 0; i < boxes.length; i++) {
            const range = getColorRange(boxes[i]);
            if (range > maxRange) {
                maxRange = range;
                maxBox = i;
            }
        }

        // Split the box with largest range
        const box = boxes[maxBox];
        const [box1, box2] = splitBox(box);
        boxes.splice(maxBox, 1, box1, box2);
        iteration++;
    }

    // Generate palette from boxes
    const palette = boxes.map((box) => {
        const avgColor = getAverageColor(box);
        return { hex: rgbToHex(avgColor.r, avgColor.g, avgColor.b), label: '' };
    });

    // Map pixels to nearest palette color
    const outputPixelData = Array(pixelData.length)
        .fill(null)
        .map(() => Array(pixelData[0].length).fill(null));

    for (let y = 0; y < pixelData.length; y++) {
        for (let x = 0; x < pixelData[y].length; x++) {
            const pixel = pixelData[y][x];
            if (pixel) {
                // Find nearest palette color
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

function getColorRange(pixels) {
    if (pixels.length === 0) return 0;

    let minR = 255, maxR = 0;
    let minG = 255, maxG = 0;
    let minB = 255, maxB = 0;

    for (let pixel of pixels) {
        minR = Math.min(minR, pixel.r);
        maxR = Math.max(maxR, pixel.r);
        minG = Math.min(minG, pixel.g);
        maxG = Math.max(maxG, pixel.g);
        minB = Math.min(minB, pixel.b);
        maxB = Math.max(maxB, pixel.b);
    }

    const rRange = maxR - minR;
    const gRange = maxG - minG;
    const bRange = maxB - minB;

    return Math.max(rRange, gRange, bRange);
}

function splitBox(pixels) {
    const mids = { r: 0, g: 0, b: 0 };

    // Find midpoint of largest axis
    let minR = 255, maxR = 0;
    let minG = 255, maxG = 0;
    let minB = 255, maxB = 0;

    for (let pixel of pixels) {
        minR = Math.min(minR, pixel.r);
        maxR = Math.max(maxR, pixel.r);
        minG = Math.min(minG, pixel.g);
        maxG = Math.max(maxG, pixel.g);
        minB = Math.min(minB, pixel.b);
        maxB = Math.max(maxB, pixel.b);
    }

    const rRange = maxR - minR;
    const gRange = maxG - minG;
    const bRange = maxB - minB;

    // Sort by largest axis
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

    const box1 = [];
    const box2 = [];

    for (let pixel of pixels) {
        if (pixel[axis] < mids[axis]) {
            box1.push(pixel);
        } else {
            box2.push(pixel);
        }
    }

    // Handle edge case where one box is empty
    if (box1.length === 0) {
        box1.push(box2.pop());
    }
    if (box2.length === 0) {
        box2.push(box1.pop());
    }

    return [box1, box2];
}

function getAverageColor(pixels) {
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

function renderReducedPreview(pixelData, width, height) {
    const canvas = document.getElementById('imageReducedPreview');
    const ctx = canvas.getContext('2d');

    // Scale up pixels for visibility (8px per pixel, max 200px)
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

function handleSendToGrid() {
    if (!state.processedImageData) {
        showNotification('Please process an image first.', 'error');
        return;
    }

    const { pixelData, width, height, palette } = state.processedImageData;

    // Update grid dimensions
    state.gridWidth = width;
    state.gridHeight = height;
    state.gridData = pixelData;

    // Update palette with processed colors
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

    // Update grid size inputs
    document.getElementById('widthInput').value = width;
    document.getElementById('heightInput').value = height;

    // Render everything
    renderPalette();
    renderGrid();
    updateExport();

    showNotification('Pattern applied to grid! Ready to export.', 'success');
    
    // If started from photo mode, trigger guided flow
    if (state.currentStartMode === 'photo') {
        setTimeout(() => {
            startGuidedFlow('photo');
        }, 500);
    }
}

// ============================================
// COLOR UTILITY FUNCTIONS
// ============================================

function rgbToHex(r, g, b) {
    return '#' + [r, g, b].map((x) => {
        const hex = x.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    }).join('');
}

function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
        ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16),
          }
        : { r: 255, g: 255, b: 255 };
}

function distanceBetweenColors(color1, color2) {
    // Euclidean distance in RGB space
    const dr = color1.r - color2.r;
    const dg = color1.g - color2.g;
    const db = color1.b - color2.b;
    return Math.sqrt(dr * dr + dg * dg + db * db);
}

// ============================================
// PALETTE FUNCTIONS
// ============================================

function renderPalette() {
    const paletteList = document.getElementById('paletteList');
    paletteList.innerHTML = '';

    if (state.palette.length === 0) {
        paletteList.innerHTML = '<p style="color: #999; font-size: 0.9rem;">No colors. Add one to start painting.</p>';
        return;
    }

    state.palette.forEach((color) => {
        const swatch = document.createElement('div');
        swatch.className = 'palette-swatch';
        if (state.selectedColor === color) {
            swatch.classList.add('active');
        }

        swatch.innerHTML = `
            <div class="palette-color" style="background-color: ${color.hex};"></div>
            <div class="palette-info">
                <div class="palette-label">${color.label || 'Unnamed'}</div>
                <div class="palette-hex">${color.hex}</div>
            </div>
            <button class="palette-remove" aria-label="Remove color" ${state.palette.length === 1 ? 'disabled' : ''}>×</button>
        `;

        swatch.addEventListener('click', () => selectColor(color));

        const removeBtn = swatch.querySelector('.palette-remove');
        removeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            removeColor(color);
        });

        paletteList.appendChild(swatch);
    });
}

function selectColor(color) {
    state.selectedColor = color;
    renderPalette();
}

function addColor() {
    const colorInput = document.getElementById('newColorInput');
    const labelInput = document.getElementById('newColorLabel');

    const hex = colorInput.value || '#a8d8ea';
    const label = labelInput.value || `Color ${state.palette.length + 1}`;

    state.palette.push({ hex, label });
    state.selectedColor = state.palette[state.palette.length - 1];

    // Reset inputs
    colorInput.value = '#a8d8ea';
    labelInput.value = '';

    renderPalette();
}

function removeColor(color) {
    const index = state.palette.indexOf(color);
    if (index > -1) {
        state.palette.splice(index, 1);
    }

    // If removed color was selected, select another
    if (state.selectedColor === color) {
        state.selectedColor = state.palette.length > 0 ? state.palette[0] : null;
    }

    renderPalette();
}

// ============================================
// GRID FUNCTIONS
// ============================================

function renderGrid() {
    const container = document.getElementById('gridContainer');
    container.innerHTML = '';

    const colCount = state.gridWidth;
    container.style.gridTemplateColumns = `repeat(${colCount}, 28px)`;

    for (let row = 0; row < state.gridHeight; row++) {
        for (let col = 0; col < state.gridWidth; col++) {
            const cell = document.createElement('div');
            cell.className = 'grid-cell';
            cell.dataset.row = row;
            cell.dataset.col = col;

            const color = state.gridData[row][col];
            if (color) {
                cell.style.backgroundColor = color;
                cell.classList.add('filled');
            }

            // Left click to paint, Shift+Click to erase
            cell.addEventListener('click', (e) => {
                e.preventDefault();
                if (e.shiftKey) {
                    handleCellErase(row, col);
                } else {
                    handleCellClick(row, col);
                }
            });

            // Right click to erase
            cell.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                handleCellErase(row, col);
            });

            container.appendChild(cell);
        }
    }
}

function handleCellClick(row, col) {
    if (!state.selectedColor) {
        alert('Please add a color to the palette first.');
        return;
    }
    state.gridData[row][col] = state.selectedColor.hex;
    renderGrid();
    updateExport();
}

function handleCellErase(row, col) {
    state.gridData[row][col] = null;
    renderGrid();
    updateExport();
}

function handleResizeGrid() {
    const newWidth = parseInt(document.getElementById('widthInput').value, 10);
    const newHeight = parseInt(document.getElementById('heightInput').value, 10);

    if (isNaN(newWidth) || isNaN(newHeight) || newWidth < 4 || newHeight < 4 || newWidth > 80 || newHeight > 80) {
        alert('Grid size must be between 4 and 80.');
        return;
    }

    const hasContent = state.gridData.some((row) => row.some((cell) => cell !== null));

    if (hasContent && !confirm('Resizing will clear or truncate existing work. Continue?')) {
        return;
    }

    state.gridWidth = newWidth;
    state.gridHeight = newHeight;
    initGrid();
    renderGrid();
    updateExport();
}

// ============================================
// EXPORT FUNCTIONS
// ============================================

function updateExport() {
    const patternText = generatePatternText();
    const legendText = generateLegendText();

    document.getElementById('patternOutput').value = patternText;
    document.getElementById('legendOutput').value = legendText;
}

function generateColorMapping() {
    // Scan grid for colors actually used, in order of first appearance
    const usedColors = [];
    const colorMap = {};

    for (let row = 0; row < state.gridHeight; row++) {
        for (let col = 0; col < state.gridWidth; col++) {
            const color = state.gridData[row][col];
            if (color && !colorMap[color]) {
                const letter = String.fromCharCode(65 + usedColors.length); // A, B, C, ...
                usedColors.push(color);
                colorMap[color] = letter;
            }
        }
    }

    return { colorMap, usedColors };
}

function generatePatternText() {
    const { colorMap } = generateColorMapping();
    const lines = [];

    for (let row = 0; row < state.gridHeight; row++) {
        let line = '';
        for (let col = 0; col < state.gridWidth; col++) {
            const color = state.gridData[row][col];
            line += color ? colorMap[color] : '.';
        }
        lines.push(line);
    }

    return lines.join('\n');
}

function generateLegendText() {
    const { colorMap, usedColors } = generateColorMapping();

    if (usedColors.length === 0) {
        return '(No colors used yet)';
    }

    const lines = [];
    usedColors.forEach((color) => {
        const letter = colorMap[color];
        lines.push(`${letter} = ${color}`);
    });

    return lines.join('\n');
}

function copyToClipboard(elementId) {
    const textarea = document.getElementById(elementId);
    textarea.select();
    document.execCommand('copy');
    showNotification('Copied to clipboard!', 'success');
}

function downloadTextFile() {
    const pattern = document.getElementById('patternOutput').value;
    const legend = document.getElementById('legendOutput').value;

    const content = `PATTERN\n${pattern}\n\nLEGEND\n${legend}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bracelet-pattern.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showNotification('Pattern downloaded!', 'success');
}

// ============================================
// PERSISTENCE FUNCTIONS
// ============================================

const STORAGE_KEY = 'braceyourself_current_design';

function saveDesign() {
    const design = {
        gridWidth: state.gridWidth,
        gridHeight: state.gridHeight,
        gridData: state.gridData,
        palette: state.palette,
        selectedColorHex: state.selectedColor ? state.selectedColor.hex : null,
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(design));
    
    // Also save to recent sessions for welcome screen
    if (typeof saveRecentSession === 'function') {
        saveRecentSession();
    }
    
    showNotification('Design saved!', 'success');
}

function loadDesign() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return null;

    try {
        const design = JSON.parse(saved);

        state.gridWidth = design.gridWidth || 24;
        state.gridHeight = design.gridHeight || 24;
        state.gridData = design.gridData || [];
        state.palette = design.palette || [];

        // Restore selected color
        if (design.selectedColorHex) {
            state.selectedColor = state.palette.find((c) => c.hex === design.selectedColorHex);
        }
        if (!state.selectedColor && state.palette.length > 0) {
            state.selectedColor = state.palette[0];
        }

        // Update grid size inputs
        document.getElementById('widthInput').value = state.gridWidth;
        document.getElementById('heightInput').value = state.gridHeight;

        return design;
    } catch (e) {
        console.error('Error loading design:', e);
        return null;
    }
}

function promptLoadDesign() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
        showNotification('No saved design found.', 'info');
        return;
    }

    if (confirm('Load the last saved design? (Current work will be lost.)')) {
        loadDesign();
        renderPalette();
        renderGrid();
        updateExport();
        showNotification('Design loaded!', 'success');
    }
}

function handleClearDesign() {
    if (confirm('Clear the entire grid and reset to default? This cannot be undone.')) {
        initPalette();
        initGrid();
        state.gridWidth = 24;
        state.gridHeight = 24;
        document.getElementById('widthInput').value = 24;
        document.getElementById('heightInput').value = 24;
        renderPalette();
        renderGrid();
        updateExport();
        showNotification('Grid cleared.', 'success');
    }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;

    // Insert after the header
    const header = document.querySelector('.app-header');
    header.parentNode.insertBefore(notification, header.nextSibling);

    // Auto-remove after 3 seconds
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// ============================================
// TEMPLATE LIBRARY
// ============================================

async function initTemplateLibrary() {
    // Load and render default templates
    state.templates = generateDefaultTemplates();
    
    // Load template packs
    await loadTurtleTemplates();
    await loadHeartTemplates();
    await loadFlowerTemplates();
    await loadAnimalTemplates();
    await loadEmojiTemplates();
    
    renderTemplateLibrary('all');

    // Category buttons
    document.querySelectorAll('.template-category-buttons .category-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.template-category-buttons .category-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            renderTemplateLibrary(e.target.dataset.category);
        });
    });
    
    // Random template buttons
    document.querySelectorAll('.template-random-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            applyRandomTemplate(btn.dataset.category);
        });
    });

    const surpriseBtn = document.getElementById('surpriseMeBtn');
    if (surpriseBtn) {
        surpriseBtn.addEventListener('click', () => applyRandomTemplate('all'));
    }
}

async function loadTurtleTemplates() {
    const turtleFiles = [
        'cute-round-turtle-16x16.json',
        'side-view-turtle-20x20.json',
        'baby-turtle-12x12.json',
        'pixel-art-turtle-24x24.json',
        'detailed-shell-turtle-28x28.json',
        'minimalist-turtle-16x16.json',
        'chibi-turtle-20x20.json',
        'cartoon-turtle-24x24.json',
        'silhouette-turtle-20x20.json',
        'swimming-turtle-24x24.json',
        'heart-shell-turtle-20x20.json',
        'patterned-shell-turtle-24x24.json',
        'forward-facing-turtle-20x20.json',
        'big-eyes-turtle-16x16.json',
        'tiny-legs-turtle-12x12.json',
        'flower-shell-turtle-20x20.json',
        'bow-turtle-16x16.json',
        'star-shell-turtle-20x20.json',
        'rainbow-shell-turtle-24x24.json',
        'geometric-shell-turtle-20x20.json',
        'pastel-turtle-16x16.json',
        'bold-turtle-24x24.json',
        'outline-turtle-16x16.json',
        'filled-silhouette-turtle-20x20.json',
        'thick-outline-turtle-20x20.json',
        'thin-outline-turtle-16x16.json',
        'shadow-turtle-24x24.json',
        'emoji-turtle-20x20.json',
        'left-facing-turtle-20x20.json',
        'right-facing-turtle-20x20.json',
        'happy-turtle-12x12.json',
        'sleepy-turtle-16x16.json',
        'jumping-turtle-20x20.json',
        'mega-turtle-32x32.json'
    ];
    
    await loadTemplateFiles('templates/turtles', turtleFiles, 'turtles');
}

async function loadHeartTemplates() {
    const heartFiles = [
        'classic-heart-12x12.json',
        'classic-heart-16x16.json',
        'classic-heart-20x20.json',
        'classic-heart-24x24.json',
        'pixel-heart-12x12.json',
        'puffy-heart-16x16.json',
        'double-heart-20x20.json',
        'broken-heart-16x16.json',
        'heart-arrow-20x20.json',
        'heart-wings-24x24.json',
        'heart-sparkles-20x20.json',
        'pastel-heart-16x16.json',
        'rainbow-heart-20x20.json',
        'outline-heart-16x16.json',
        'filled-heart-12x12.json',
        'gradient-heart-24x24.json',
        'kawaii-heart-16x16.json',
        'bow-heart-20x20.json',
        'star-heart-16x16.json',
        'turtle-shell-heart-24x24.json',
        'geometric-heart-20x20.json',
        'flower-heart-20x20.json',
        'initial-h-heart-16x16.json',
        'initial-jh-heart-24x24.json',
        'slim-heart-12x12.json'
    ];

    await loadTemplateFiles('templates/hearts', heartFiles, 'hearts');
}

async function loadFlowerTemplates() {
    const flowerFiles = [
        'simple-daisy-16x16.json',
        'five-petal-16x16.json',
        'rose-silhouette-20x20.json',
        'tulip-20x20.json',
        'sunflower-24x24.json',
        'cherry-blossom-20x20.json',
        'lotus-24x24.json',
        'hibiscus-24x24.json',
        'lavender-sprig-28x28.json',
        'daisy-chain-24x24.json',
        'flower-stem-20x20.json',
        'flower-leaves-20x20.json',
        'heart-center-flower-16x16.json',
        'turtle-shell-flower-24x24.json',
        'pastel-flower-16x16.json',
        'rainbow-flower-20x20.json',
        'outline-flower-16x16.json',
        'filled-flower-16x16.json',
        'pixel-flower-20x20.json',
        'chibi-flower-16x16.json',
        'sparkle-flower-20x20.json',
        'rose-bud-16x16.json',
        'twin-tulip-24x24.json',
        'sunburst-flower-24x24.json',
        'lily-20x20.json'
    ];

    await loadTemplateFiles('templates/flowers', flowerFiles, 'flowers');
}

async function loadAnimalTemplates() {
    const animalFiles = [
        'cat-head-16x16.json',
        'dog-head-16x16.json',
        'bunny-20x20.json',
        'bear-20x20.json',
        'frog-16x16.json',
        'turtle-chibi-20x20.json',
        'whale-24x24.json',
        'dolphin-24x24.json',
        'penguin-20x20.json',
        'fox-20x20.json',
        'owl-20x20.json',
        'bee-16x16.json',
        'butterfly-24x24.json',
        'bird-16x16.json',
        'duck-16x16.json',
        'elephant-chibi-24x24.json',
        'giraffe-chibi-24x24.json',
        'koala-20x20.json',
        'panda-20x20.json',
        'hedgehog-20x20.json',
        'hamster-16x16.json',
        'seal-20x20.json',
        'octopus-24x24.json',
        'starfish-20x20.json',
        'turtle-outline-16x16.json'
    ];

    await loadTemplateFiles('templates/animals', animalFiles, 'animals');
}

async function loadEmojiTemplates() {
    const emojiFiles = [
        'smiley-12x12.json',
        'heart-eyes-16x16.json',
        'laughing-16x16.json',
        'crying-16x16.json',
        'winking-12x12.json',
        'blushing-16x16.json',
        'star-eyes-16x16.json',
        'angry-12x12.json',
        'surprised-12x12.json',
        'sleepy-16x16.json',
        'turtle-emoji-16x16.json',
        'flower-emoji-12x12.json',
        'heart-emoji-12x12.json',
        'rainbow-emoji-16x16.json',
        'sun-emoji-16x16.json',
        'moon-emoji-16x16.json',
        'star-emoji-12x12.json',
        'sparkle-emoji-12x12.json',
        'thumbs-up-20x20.json',
        'peace-sign-20x20.json',
        'paw-print-16x16.json',
        'music-note-12x12.json',
        'camera-16x16.json',
        'cloud-16x16.json',
        'fire-16x16.json'
    ];

    await loadTemplateFiles('templates/emojis', emojiFiles, 'emojis');
}

async function loadTemplateFiles(folder, files, fallbackCategory) {
    for (const filename of files) {
        try {
            const response = await fetch(`${folder}/${filename}`);
            if (response.ok) {
                const template = await response.json();
                if (!template.category) {
                    template.category = fallbackCategory;
                }
                state.templates.push(template);
            }
        } catch (error) {
            console.warn(`Failed to load template: ${filename}`, error);
        }
    }
}

function applyRandomTemplate(category) {
    const categoryKey = category === 'all' ? 'all' : category;
    const candidates = categoryKey === 'all'
        ? state.templates
        : state.templates.filter(t => getTemplateCategoryKey(t) === categoryKey);
    
    if (candidates.length === 0) {
        showNotification('No templates available for this category!', 'warning');
        return;
    }
    
    const randomTemplate = candidates[Math.floor(Math.random() * candidates.length)];
    applyTemplateToGrid(randomTemplate);
    showNotification(`Template "${randomTemplate.name}" selected!`, 'success');
}

function getTemplateCategoryKey(template) {
    return (template.category || '').toLowerCase();
}

function getTemplatePaletteEntries(template) {
    if (template.palette) {
        return Object.entries(template.palette).map(([key, hex]) => ({ key, hex }));
    }
    if (template.colors) {
        return template.colors.map((hex, index) => ({ key: String(index + 1), hex }));
    }
    return [];
}

function getTemplateColorAt(template, x, y) {
    if (template.pixelGrid) {
        const row = template.pixelGrid[y] || '';
        const charKey = row[x];
        if (charKey && charKey !== '.' && template.palette && template.palette[charKey]) {
            return template.palette[charKey];
        }
        return null;
    }

    if (template.pixels) {
        const row = template.pixels[y] || [];
        const colorIdx = row[x] || 0;
        if (colorIdx > 0 && template.colors) {
            return template.colors[colorIdx - 1] || null;
        }
    }

    return null;
}

function buildGridDataFromTemplate(template) {
    const gridData = [];
    const height = template.height || 0;
    const width = template.width || 0;

    for (let y = 0; y < height; y++) {
        const row = [];
        for (let x = 0; x < width; x++) {
            row.push(getTemplateColorAt(template, x, y));
        }
        gridData.push(row);
    }

    return gridData;
}

function generateDefaultTemplates() {
    return [
        {
            id: 'turtle-1',
            name: 'Cute Turtle',
            category: 'turtles',
            width: 16,
            height: 16,
            colors: ['#a8d8ea', '#4a4a4a'],
            pixels: [
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0],
                [0, 0, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1, 0, 0, 0, 0],
                [0, 1, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 1, 0, 0, 0],
                [1, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 1, 0, 0],
                [1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0],
                [1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0],
                [1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0],
                [1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0],
                [0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 1, 0, 0],
                [0, 0, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0],
                [0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            ]
        },
        {
            id: 'heart-1',
            name: 'Heart',
            category: 'shapes',
            width: 16,
            height: 16,
            colors: ['#ffc0cb', '#ffffff'],
            pixels: [
                [0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0],
                [0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0],
                [1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0],
                [1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0],
                [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
                [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
                [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
                [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
                [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
                [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0],
                [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0],
                [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0],
                [0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            ]
        },
        {
            id: 'star-1',
            name: 'Star',
            category: 'shapes',
            width: 16,
            height: 16,
            colors: ['#ffe4b5', '#ffffff'],
            pixels: [
                [0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0],
                [0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0],
                [0, 0, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 0, 0],
                [0, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 0],
                [1, 0, 0, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 0, 0, 1],
                [1, 0, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 0, 1],
                [1, 0, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 0, 1],
                [1, 0, 0, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 0, 0, 1],
                [0, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 0],
                [0, 0, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 0, 0],
                [0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0],
                [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0],
            ]
        },
    ];
}

function renderTemplateLibrary(category) {
    const grid = document.getElementById('templateGrid');
    grid.innerHTML = '';

    const filtered = category === 'all'
        ? state.templates
        : state.templates.filter(t => getTemplateCategoryKey(t) === category);

    filtered.forEach(template => {
        const card = document.createElement('div');
        card.className = 'template-card';

        const canvas = document.createElement('canvas');
        canvas.width = 100;
        canvas.height = 100;
        const ctx = canvas.getContext('2d');

        // Render template to canvas
        const cellSize = Math.floor(100 / Math.max(template.width, template.height));
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, 100, 100);

        for (let y = 0; y < template.height; y++) {
            for (let x = 0; x < template.width; x++) {
                const colorHex = getTemplateColorAt(template, x, y);
                if (colorHex) {
                    ctx.fillStyle = colorHex;
                    ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
                }
            }
        }

        const preview = document.createElement('div');
        preview.className = 'template-preview';
        preview.appendChild(canvas);

        const nameLabel = document.createElement('div');
        nameLabel.className = 'template-name';
        nameLabel.textContent = template.name;

        const favorite = document.createElement('button');
        favorite.className = 'template-favorite';
        favorite.innerHTML = '★';
        favorite.onclick = (e) => {
            e.stopPropagation();
            toggleFavorite(template.id);
        };

        card.appendChild(preview);
        card.appendChild(nameLabel);
        card.appendChild(favorite);

        card.addEventListener('click', () => applyTemplateToGrid(template));

        grid.appendChild(card);
    });
}

function applyTemplateToGrid(template) {
    // Resize grid to template size
    state.gridWidth = template.width;
    state.gridHeight = template.height;
    state.gridData = buildGridDataFromTemplate(template);

    // Set palette to template colors
    const paletteEntries = getTemplatePaletteEntries(template);
    state.palette = paletteEntries.map((entry, index) => ({
        hex: entry.hex,
        label: `Color ${index + 1}`,
    }));
    state.selectedColor = state.palette[0] || null;

    // Update UI
    document.getElementById('widthInput').value = template.width;
    document.getElementById('heightInput').value = template.height;

    renderPalette();
    renderGrid();
    updateExport();

    showNotification(`Template "${template.name}" applied!`, 'success');
    
    // If started from template mode, trigger guided flow
    if (state.currentStartMode === 'template') {
        setTimeout(() => {
            startGuidedFlow('template');
        }, 500);
    }
}

function toggleFavorite(templateId) {
    // Store favorites in localStorage
    const favorites = JSON.parse(localStorage.getItem('braceyourself_favorites') || '[]');
    const index = favorites.indexOf(templateId);
    if (index > -1) {
        favorites.splice(index, 1);
    } else {
        favorites.push(templateId);
    }
    localStorage.setItem('braceyourself_favorites', JSON.stringify(favorites));
    renderTemplateLibrary(document.querySelector('.template-category-buttons .category-btn.active').dataset.category);
}

// ============================================
// INSPIRATION GALLERY
// ============================================

function initInspirationGallery() {
    state.inspiration = generateDefaultInspiration();
    renderInspirationGallery('all');

    document.querySelectorAll('.inspiration-category-buttons .category-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.inspiration-category-buttons .category-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            renderInspirationGallery(e.target.dataset.category);
        });
    });
}

function generateDefaultInspiration() {
    return [
        {
            id: 'inspo-1',
            name: 'Pastel Sunrise',
            category: 'aesthetic',
            colors: ['#ffc0cb', '#ffb6c1', '#ffe4b5', '#fff0f5'],
            description: 'Soft pink and peach gradient'
        },
        {
            id: 'inspo-2',
            name: 'Ocean Vibes',
            category: 'nature',
            colors: ['#a8d8ea', '#7ec8e3', '#5eb3d6', '#4a7ba7'],
            description: 'Cool blues inspired by the sea'
        },
        {
            id: 'inspo-3',
            name: 'Forest Floor',
            category: 'nature',
            colors: ['#2d5016', '#5d7b1a', '#a5d6a7', '#c1ffc1'],
            description: 'Earthy greens and browns'
        },
        {
            id: 'inspo-4',
            name: 'Geometric Modern',
            category: 'geometric',
            colors: ['#000000', '#ffffff', '#4a4a4a', '#d4c5f9'],
            description: 'Bold black and white with accent'
        },
        {
            id: 'inspo-5',
            name: 'Minimalist Zen',
            category: 'minimalist',
            colors: ['#ffffff', '#e8e8e8', '#4a4a4a'],
            description: 'Simple and calm'
        },
    ];
}

function renderInspirationGallery(category) {
    const grid = document.getElementById('inspirationGrid');
    grid.innerHTML = '';

    const filtered = category === 'all' ? state.inspiration : state.inspiration.filter(i => i.category === category);

    filtered.forEach(inspo => {
        const card = document.createElement('div');
        card.className = 'inspiration-card';

        const preview = document.createElement('div');
        preview.className = 'inspiration-preview';
        preview.style.display = 'flex';
        preview.style.flexWrap = 'wrap';
        preview.style.alignContent = 'center';
        preview.style.justifyContent = 'center';
        preview.style.gap = '4px';
        preview.style.padding = '8px';

        inspo.colors.forEach(color => {
            const swatch = document.createElement('div');
            swatch.style.flex = '1';
            swatch.style.minWidth = '20px';
            swatch.style.height = '100%';
            swatch.style.minHeight = '30px';
            swatch.style.backgroundColor = color;
            swatch.style.borderRadius = '4px';
            swatch.style.border = '1px solid #ddd';
            preview.appendChild(swatch);
        });

        card.appendChild(preview);

        card.addEventListener('click', () => {
            showInspirationModal(inspo);
        });

        grid.appendChild(card);
    });
}

function showInspirationModal(inspo) {
    const modal = document.getElementById('previewModal');
    const body = document.getElementById('modalPreviewBody');

    body.innerHTML = `
        <h2>${inspo.name}</h2>
        <p style="color: #666; margin-bottom: 16px;">${inspo.description}</p>
        <div style="margin-bottom: 16px;">
            <p style="font-weight: 600; margin-bottom: 8px;">Color Palette:</p>
            <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                ${inspo.colors.map(color => `
                    <div style="flex: 1; min-width: 60px; text-align: center;">
                        <div style="height: 50px; background-color: ${color}; border: 1px solid #ddd; border-radius: 4px; margin-bottom: 4px;"></div>
                        <code style="font-size: 0.8rem; color: #666;">${color}</code>
                    </div>
                `).join('')}
            </div>
        </div>
        <div style="display: flex; gap: 8px;">
            <button class="btn btn-small" onclick="applyInspirationPalette(JSON.parse('${JSON.stringify(inspo).replace(/'/g, "\\'")}'))">Use Palette</button>
            <button class="btn btn-small" onclick="applyInspirationPattern(JSON.parse('${JSON.stringify(inspo).replace(/'/g, "\\'")}'))">Use as Pattern</button>
        </div>
    `;

    modal.classList.add('active');
}

function applyInspirationPalette(inspo) {
    state.palette = inspo.colors.map((hex, i) => ({
        hex,
        label: `Color ${i + 1}`,
    }));
    state.selectedColor = state.palette[0];

    renderPalette();
    updateExport();

    document.getElementById('previewModal').classList.remove('active');
    showNotification(`Palette from "${inspo.name}" applied!`, 'success');
}

function applyInspirationPattern(inspo) {
    // Create a simple pattern from inspiration colors
    const size = 24;
    const gridData = Array(size).fill(null).map((_, row) =>
        Array(size).fill(null).map((_, col) => {
            const colorIdx = ((row + col) % inspo.colors.length);
            return inspo.colors[colorIdx];
        })
    );

    state.gridWidth = size;
    state.gridHeight = size;
    state.gridData = gridData;
    state.palette = inspo.colors.map((hex, i) => ({
        hex,
        label: `Color ${i + 1}`,
    }));
    state.selectedColor = state.palette[0];

    document.getElementById('widthInput').value = size;
    document.getElementById('heightInput').value = size;

    renderPalette();
    renderGrid();
    updateExport();

    document.getElementById('previewModal').classList.remove('active');
    showNotification(`Pattern from "${inspo.name}" applied!`, 'success');
}

// ============================================
// COLOR HARMONIZER
// ============================================

function initColorHarmonizer() {
    document.getElementById('complementaryBtn').addEventListener('click', () => {
        generateHarmonizerPalette('complementary');
    });
    document.getElementById('analogousBtn').addEventListener('click', () => {
        generateHarmonizerPalette('analogous');
    });
    document.getElementById('triadicBtn').addEventListener('click', () => {
        generateHarmonizerPalette('triadic');
    });
    document.getElementById('pastelizeBtn').addEventListener('click', () => {
        generateHarmonizerPalette('pastel');
    });
    document.getElementById('muteBtn').addEventListener('click', () => {
        generateHarmonizerPalette('muted');
    });
    document.getElementById('applyHarmonizerPaletteBtn').addEventListener('click', applyHarmonizerPalette);
    document.getElementById('recolorGridBtn').addEventListener('click', recolorGridNearest);
}

function generateHarmonizerPalette(mode) {
    const baseHex = document.getElementById('harmonizerColorPicker').value;
    const baseHsl = hexToHsl(baseHex);

    let palette = [];

    switch(mode) {
        case 'complementary':
            palette = [
                baseHex,
                hslToHex((baseHsl.h + 180) % 360, baseHsl.s, baseHsl.l),
            ];
            break;
        case 'analogous':
            palette = [
                hslToHex((baseHsl.h - 30 + 360) % 360, baseHsl.s, baseHsl.l),
                baseHex,
                hslToHex((baseHsl.h + 30) % 360, baseHsl.s, baseHsl.l),
            ];
            break;
        case 'triadic':
            palette = [
                baseHex,
                hslToHex((baseHsl.h + 120) % 360, baseHsl.s, baseHsl.l),
                hslToHex((baseHsl.h + 240) % 360, baseHsl.s, baseHsl.l),
            ];
            break;
        case 'pastel':
            palette = [
                hslToHex(baseHsl.h, Math.max(20, baseHsl.s - 30), Math.min(85, baseHsl.l + 20)),
                hslToHex((baseHsl.h + 90) % 360, Math.max(20, baseHsl.s - 30), Math.min(85, baseHsl.l + 20)),
                hslToHex((baseHsl.h + 180) % 360, Math.max(20, baseHsl.s - 30), Math.min(85, baseHsl.l + 20)),
                hslToHex((baseHsl.h + 270) % 360, Math.max(20, baseHsl.s - 30), Math.min(85, baseHsl.l + 20)),
            ];
            break;
        case 'muted':
            palette = [
                hslToHex(baseHsl.h, Math.max(15, baseHsl.s - 40), Math.max(40, baseHsl.l - 20)),
                hslToHex((baseHsl.h + 120) % 360, Math.max(15, baseHsl.s - 40), Math.max(40, baseHsl.l - 20)),
                hslToHex((baseHsl.h + 240) % 360, Math.max(15, baseHsl.s - 40), Math.max(40, baseHsl.l - 20)),
            ];
            break;
    }

    state.harmonizerPalette = palette;
    renderHarmonizerOutput(palette);
}

function renderHarmonizerOutput(palette) {
    const output = document.getElementById('harmonizerOutput');
    const swatches = document.getElementById('harmonizerSwatches');

    swatches.innerHTML = '';
    palette.forEach(color => {
        const swatch = document.createElement('div');
        swatch.className = 'harmonizer-swatch';
        swatch.style.backgroundColor = color;
        swatch.title = color;
        swatches.appendChild(swatch);
    });

    output.style.display = 'block';
}

function applyHarmonizerPalette() {
    if (!state.harmonizerPalette) return;

    state.palette = state.harmonizerPalette.map((hex, i) => ({
        hex,
        label: `Color ${i + 1}`,
    }));
    state.selectedColor = state.palette[0];

    renderPalette();
    updateExport();
    showNotification('Harmonic palette applied!', 'success');
}

function recolorGridNearest() {
    if (!state.harmonizerPalette) return;

    // Recolor grid using nearest color from harmonizer palette
    for (let y = 0; y < state.gridHeight; y++) {
        for (let x = 0; x < state.gridWidth; x++) {
            const currentColor = state.gridData[y][x];
            if (currentColor) {
                let nearest = state.harmonizerPalette[0];
                let minDistance = Infinity;

                for (let paletteColor of state.harmonizerPalette) {
                    const dist = distanceBetweenColors(hexToRgb(currentColor), hexToRgb(paletteColor));
                    if (dist < minDistance) {
                        minDistance = dist;
                        nearest = paletteColor;
                    }
                }

                state.gridData[y][x] = nearest;
            }
        }
    }

    renderGrid();
    updateExport();
    showNotification('Grid recolored with harmonizer palette!', 'success');
}

// ============================================
// KEYWORD HELPER
// ============================================

function initKeywordHelper() {
    document.getElementById('generateKeywordsBtn').addEventListener('click', generateKeywords);
    document.getElementById('copyKeywordsBtn').addEventListener('click', () => {
        copyToClipboard('keywordsTextarea');
    });
}

function generateKeywords() {
    const title = document.getElementById('patternTitleInput').value || '';
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

    document.getElementById('keywordsTextarea').value = unique.join(' ');
    document.getElementById('keywordOutput').style.display = 'block';
}

function getColorName(hex) {
    const colorNames = {
        '#a8d8ea': 'blue',
        '#d4c5f9': 'purple',
        '#ffc0cb': 'pink',
        '#ffe4b5': 'peach',
        '#c1ffc1': 'mint',
        '#ffffff': 'white',
        '#000000': 'black',
        '#4a4a4a': 'gray',
    };

    // Exact match
    if (colorNames[hex.toLowerCase()]) {
        return colorNames[hex.toLowerCase()];
    }

    // Find closest color
    const rgb = hexToRgb(hex);
    let closest = '#ffffff';
    let minDist = Infinity;

    for (let knownHex in colorNames) {
        const dist = distanceBetweenColors(rgb, hexToRgb(knownHex));
        if (dist < minDist) {
            minDist = dist;
            closest = knownHex;
        }
    }

    return colorNames[closest] || '';
}

// ============================================
// DIFFICULTY ESTIMATOR
// ============================================

function initDifficultyEstimator() {
    document.getElementById('analyzeDifficultyBtn').addEventListener('click', analyzeDifficulty);
}

function analyzeDifficulty() {
    const difficulty = estimateDifficultyValue();
    const factors = calculateDifficultyFactors();

    const output = document.getElementById('difficultyOutput');
    const badge = document.getElementById('difficultyBadge');
    const factorsDiv = document.getElementById('difficultyFactors');
    const explanation = document.getElementById('difficultyExplanation');

    badge.className = `difficulty-badge ${difficulty.toLowerCase()}`;
    badge.textContent = difficulty;

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

    explanation.textContent = getDifficultyExplanation(factors, difficulty);
    output.style.display = 'block';
}

function estimateDifficultyValue() {
    const factors = calculateDifficultyFactors();
    let score = 0;

    score += factors['Colors Used'];
    score += Math.floor(factors['Avg Changes/Row'] / 2);
    score += Math.floor(factors['Total Pixels'] / 50);

    if (score <= 15) return 'Easy';
    if (score <= 35) return 'Medium';
    return 'Hard';
}

function calculateDifficultyFactors() {
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

function getDifficultyExplanation(factors, difficulty) {
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

// ============================================
// PRINT PATTERN SHEET
// ============================================

function initPrintSheet() {
    document.getElementById('generatePrintBtn').addEventListener('click', generatePrintPreview);
}

function generatePrintPreview() {
    const title = document.getElementById('patternTitleInput').value || 'Untitled Pattern';
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
    document.getElementById('printPreviewContent').innerHTML = printHtml;
    document.getElementById('printBtn').style.display = 'block';
    document.getElementById('printBtn').onclick = () => window.print();

    modal.classList.add('active');
}

// ============================================
// MODAL HELPERS
// ============================================

function initModals() {
    document.getElementById('closePreviewModal').addEventListener('click', () => {
        document.getElementById('previewModal').classList.remove('active');
    });

    document.getElementById('closePrintModal').addEventListener('click', () => {
        document.getElementById('printModal').classList.remove('active');
    });

    document.getElementById('previewModal').addEventListener('click', (e) => {
        if (e.target.id === 'previewModal') {
            document.getElementById('previewModal').classList.remove('active');
        }
    });

    document.getElementById('printModal').addEventListener('click', (e) => {
        if (e.target.id === 'printModal') {
            document.getElementById('printModal').classList.remove('active');
        }
    });
}

// ============================================
// COLOR CONVERSION HELPERS
// ============================================

function hexToHsl(hex) {
    const rgb = hexToRgb(hex);
    const r = rgb.r / 255;
    const g = rgb.g / 255;
    const b = rgb.b / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const l = (max + min) / 2;
    let h, s;

    if (max === min) {
        h = s = 0;
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch(max) {
            case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
            case g: h = ((b - r) / d + 2) / 6; break;
            case b: h = ((r - g) / d + 4) / 6; break;
        }
    }

    return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function hslToHex(h, s, l) {
    h = h % 360;
    s = s / 100;
    l = l / 100;

    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs((h / 60) % 2 - 1));
    const m = l - c / 2;

    let r, g, b;
    if (h < 60) { r = c; g = x; b = 0; }
    else if (h < 120) { r = x; g = c; b = 0; }
    else if (h < 180) { r = 0; g = c; b = x; }
    else if (h < 240) { r = 0; g = x; b = c; }
    else if (h < 300) { r = x; g = 0; b = c; }
    else { r = c; g = 0; b = x; }

    const toHex = (val) => {
        const hex = Math.round((val + m) * 255).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    };

    return '#' + toHex(r) + toHex(g) + toHex(b);
}

// ============================================
// WELCOME SCREEN & RECENT SESSIONS
// ============================================

function initWelcomeScreen() {
    loadRecentSessions();
    
    // Check if we should show welcome screen
    const hasRecentSession = state.recentSessions.length > 0;
    const hasCurrentWork = state.gridData.some(row => row.some(cell => cell !== null));
    
    if (!hasCurrentWork) {
        showWelcomeScreen();
    }

    // Event listeners
    document.getElementById('welcomeStartTemplate').addEventListener('click', () => {
        hideWelcomeScreen();
        handleStartFromTemplate();
    });

    document.getElementById('welcomeStartPhoto').addEventListener('click', () => {
        hideWelcomeScreen();
        handleStartFromPhoto();
    });

    document.getElementById('welcomeStartBlank').addEventListener('click', () => {
        hideWelcomeScreen();
        handleStartFromBlank();
    });
}

function showWelcomeScreen() {
    const welcomeScreen = document.getElementById('welcomeScreen');
    
    // Render recent sessions if any
    if (state.recentSessions.length > 0) {
        document.getElementById('welcomeRecentSection').style.display = 'block';
        renderWelcomeRecentSessions();
    }
    
    welcomeScreen.classList.remove('hidden');
}

function hideWelcomeScreen() {
    const welcomeScreen = document.getElementById('welcomeScreen');
    welcomeScreen.style.animation = 'fadeOut 0.3s ease';
    setTimeout(() => {
        welcomeScreen.classList.add('hidden');
        welcomeScreen.style.animation = '';
    }, 300);
}

function renderWelcomeRecentSessions() {
    const grid = document.getElementById('welcomeRecentGrid');
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

function loadRecentSessions() {
    const stored = localStorage.getItem('braceyourself_recent_sessions');
    if (stored) {
        try {
            state.recentSessions = JSON.parse(stored);
        } catch (e) {
            state.recentSessions = [];
        }
    }
}

function saveRecentSession() {
    // Generate thumbnail
    const thumbnail = generateThumbnailFromGrid();
    
    // Get title
    const title = document.getElementById('patternTitleInput').value || 'Untitled Pattern';
    
    // Create session object
    const session = {
        id: Date.now(),
        title: title,
        thumbnail: thumbnail,
        gridWidth: state.gridWidth,
        gridHeight: state.gridHeight,
        gridData: state.gridData,
        palette: state.palette,
        savedAt: new Date().toISOString(),
    };

    // Add to beginning of array
    state.recentSessions.unshift(session);
    
    // Keep only last 3
    state.recentSessions = state.recentSessions.slice(0, 3);
    
    // Save to localStorage
    localStorage.setItem('braceyourself_recent_sessions', JSON.stringify(state.recentSessions));
    
    // Update recent designs panel if visible
    renderRecentDesignsPanel();
}

function loadRecentSession(session) {
    state.gridWidth = session.gridWidth;
    state.gridHeight = session.gridHeight;
    state.gridData = session.gridData;
    state.palette = session.palette;
    state.selectedColor = state.palette[0] || null;

    document.getElementById('widthInput').value = state.gridWidth;
    document.getElementById('heightInput').value = state.gridHeight;
    document.getElementById('patternTitleInput').value = session.title;

    renderPalette();
    renderGrid();
    updateExport();

    showNotification('Design loaded!', 'success');
}

function generateThumbnailFromGrid() {
    const canvas = document.createElement('canvas');
    canvas.width = 80;
    canvas.height = 80;
    const ctx = canvas.getContext('2d');

    // Fill white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 80, 80);

    // Calculate cell size
    const cellSize = Math.floor(80 / Math.max(state.gridWidth, state.gridHeight));

    // Draw grid
    for (let y = 0; y < state.gridHeight; y++) {
        for (let x = 0; x < state.gridWidth; x++) {
            const color = state.gridData[y] ? state.gridData[y][x] : null;
            if (color) {
                ctx.fillStyle = color;
                ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
            }
        }
    }

    return canvas.toDataURL('image/png');
}

function renderRecentDesignsPanel() {
    const panel = document.getElementById('recentDesignsPanel');
    const grid = document.getElementById('recentDesignsGrid');

    if (state.recentSessions.length === 0) {
        panel.style.display = 'none';
        return;
    }

    panel.style.display = 'block';
    grid.innerHTML = '';

    state.recentSessions.forEach(session => {
        const card = document.createElement('div');
        card.className = 'recent-design-card';

        const thumbnail = document.createElement('img');
        thumbnail.className = 'recent-design-thumbnail';
        thumbnail.src = session.thumbnail;

        const title = document.createElement('div');
        title.className = 'recent-design-title';
        title.textContent = session.title || 'Untitled';

        const date = document.createElement('div');
        date.className = 'recent-design-date';
        const savedDate = new Date(session.savedAt);
        date.textContent = savedDate.toLocaleDateString();

        card.appendChild(thumbnail);
        card.appendChild(title);
        card.appendChild(date);

        card.addEventListener('click', () => {
            loadRecentSession(session);
        });

        grid.appendChild(card);
    });
}

// ============================================
// START MODE HANDLERS
// ============================================

function handleStartFromTemplate() {
    state.currentStartMode = 'template';
    
    // Scroll to template library
    const templatePanel = document.querySelector('.template-grid').parentElement;
    templatePanel.scrollIntoView({ behavior: 'smooth' });
    
    // Highlight template panel
    templatePanel.style.animation = 'pulse 0.5s ease';
    setTimeout(() => {
        templatePanel.style.animation = '';
    }, 500);
    
    showNotification('Choose a template to get started!', 'info');
}

function handleStartFromPhoto() {
    state.currentStartMode = 'photo';
    
    // Click the image input
    document.getElementById('importImageInput').click();
    
    // Scroll to image import panel
    const importPanel = document.getElementById('importImageInput').closest('.panel');
    importPanel.scrollIntoView({ behavior: 'smooth' });
    
    showNotification('Upload an image to create a pattern!', 'info');
}

function handleStartFromBlank() {
    state.currentStartMode = 'blank';
    
    // Initialize with default palette
    initPalette();
    initGrid();
    renderPalette();
    renderGrid();
    updateExport();
    
    // Start guided flow with default pastel palette
    startGuidedFlow('blank');
}

// ============================================
// GUIDED FLOW SYSTEM
// ============================================

function startGuidedFlow(mode) {
    state.guidedFlowActive = true;
    const panel = document.getElementById('guidedFlowPanel');
    const content = document.getElementById('guidedContent');
    
    panel.style.display = 'block';
    content.innerHTML = '';

    // Scroll to guided panel
    panel.scrollIntoView({ behavior: 'smooth' });

    // Step 1: Palette suggestion
    const paletteStep = createGuidedStep(
        '1. Color Palette',
        getPaletteSuggestionText(mode),
        [
            { text: 'Use This Palette', action: () => applyGuidedPalette(mode) }
        ]
    );
    content.appendChild(paletteStep);

    // Step 2: Auto-run difficulty (after palette)
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

    // Step 3: Keywords
    setTimeout(() => {
        const keywordStep = createGuidedStep(
            '3. Keywords & Title',
            getGuidedKeywordText(mode),
            [
                { text: 'Generate Keywords', action: () => generateKeywords() }
            ]
        );
        content.appendChild(keywordStep);
    }, 2000);

    // Step 4: Final actions
    setTimeout(() => {
        const finalStep = createGuidedStep(
            '4. Ready to Export',
            'Your pattern is ready! What would you like to do?',
            [
                { text: 'Export Pattern', action: () => copyToClipboard('patternOutput') },
                { text: 'Print', action: () => generatePrintPreview() },
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

    if (actions.length > 0) {
        actions.forEach(action => {
            const btn = document.createElement('button');
            btn.className = 'btn btn-small guided-action';
            btn.textContent = action.text;
            btn.addEventListener('click', action.action);
            step.appendChild(btn);
        });
    }

    return step;
}

function updateGuidedStep(stepEl, newText) {
    const contentEl = stepEl.querySelector('.guided-step-content');
    contentEl.textContent = newText;
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
    // Palette is already set based on mode
    showNotification('Palette applied!', 'success');
}

function closeGuidedFlow() {
    const panel = document.getElementById('guidedFlowPanel');
    panel.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => {
        panel.style.display = 'none';
        panel.style.animation = '';
        state.guidedFlowActive = false;
    }, 300);
    
    showNotification('Great job! Your pattern is complete. 🎉', 'success');
    
    // Auto-save to recent sessions
    saveRecentSession();
}

// ============================================
// MOBILE ACTION BAR
// ============================================

function initMobileActionBar() {
    document.getElementById('mobileExportBtn').addEventListener('click', () => {
        copyToClipboard('patternOutput');
    });

    document.getElementById('mobilePrintBtn').addEventListener('click', () => {
        generatePrintPreview();
    });

    document.getElementById('mobileBBBtn').addEventListener('click', () => {
        window.open('https://www.braceletbook.com/patterns/add/', '_blank');
    });
}

// ============================================
// INITIALIZE ALL NEW FEATURES
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    initTemplateLibrary();
    initInspirationGallery();
    initColorHarmonizer();
    initKeywordHelper();
    initDifficultyEstimator();
    initPrintSheet();
    initModals();
    initWelcomeScreen();
    initMobileActionBar();
    renderRecentDesignsPanel();
}, { once: true });
