// ============================================
// IMAGE WORKER — WEB WORKER FOR IMAGE PROCESSING
// High-performance image resizing, quantization, and dithering
// ============================================

self.addEventListener('message', function(e) {
    const { type, data } = e.data;

    try {
        switch(type) {
            case 'PROCESS_IMAGE':
                processImage(data);
                break;
            default:
                self.postMessage({ type: 'ERROR', error: 'Unknown message type' });
        }
    } catch (error) {
        self.postMessage({ 
            type: 'ERROR', 
            error: error.message,
            stack: error.stack 
        });
    }
});

function processImage(data) {
    const {
        imageData,
        targetWidth,
        targetHeight,
        maxColors,
        detailBoost,
        resizeMode,
        usePaletteLock,
        lockedPalette,
        enableDithering,
        autoTemplateMode
    } = data;

    // Step 1: Smart Resize
    self.postMessage({ type: 'PROGRESS', progress: 0, message: 'Resizing image...' });
    const resizedPixels = smartResize(imageData, targetWidth, targetHeight, resizeMode, detailBoost);

    // Step 2: Auto-template processing (if enabled)
    let processedPixels = resizedPixels;
    if (autoTemplateMode) {
        self.postMessage({ type: 'PROGRESS', progress: 25, message: 'Applying turtle template...' });
        processedPixels = applyAutoTemplate(resizedPixels, targetWidth, targetHeight);
    }

    // Step 3: Color Quantization
    self.postMessage({ type: 'PROGRESS', progress: 50, message: 'Quantizing colors...' });
    const quantizedData = quantizeColorsOptimized(
        processedPixels,
        maxColors,
        detailBoost,
        enableDithering,
        usePaletteLock,
        lockedPalette
    );

    // Step 4: Generate output
    self.postMessage({ type: 'PROGRESS', progress: 90, message: 'Finalizing pattern...' });
    const result = {
        pixelData: quantizedData.pixelData,
        width: targetWidth,
        height: targetHeight,
        palette: quantizedData.palette,
        stats: {
            originalColors: countUniqueColors(processedPixels),
            finalColors: quantizedData.palette.length,
            processingTime: Date.now()
        }
    };

    self.postMessage({ type: 'COMPLETE', result });
}

// ============================================
// SMART RESIZE ENGINE
// ============================================

function smartResize(imageData, targetWidth, targetHeight, mode, detailBoost) {
    const { data: pixels, width: srcWidth, height: srcHeight } = imageData;
    
    let cropX = 0, cropY = 0, cropWidth = srcWidth, cropHeight = srcHeight;
    
    // Calculate target aspect ratio
    const targetRatio = targetWidth / targetHeight;
    const sourceRatio = srcWidth / srcHeight;

    switch(mode) {
        case 'fit':
            // Preserve aspect ratio, no cropping
            if (sourceRatio > targetRatio) {
                // Image is wider
                targetHeight = Math.round(targetWidth / sourceRatio);
            } else {
                // Image is taller
                targetWidth = Math.round(targetHeight * sourceRatio);
            }
            break;

        case 'fill':
            // Crop to fill entire target
            if (sourceRatio > targetRatio) {
                // Crop width
                cropWidth = Math.round(srcHeight * targetRatio);
                cropX = Math.round((srcWidth - cropWidth) / 2);
            } else {
                // Crop height
                cropHeight = Math.round(srcWidth / targetRatio);
                cropY = Math.round((srcHeight - cropHeight) / 2);
            }
            break;

        case 'centeredCrop':
            // Auto-center subject with edge detection
            const bounds = detectSubjectBounds(pixels, srcWidth, srcHeight);
            cropX = bounds.x;
            cropY = bounds.y;
            cropWidth = bounds.width;
            cropHeight = bounds.height;
            break;
    }

    // Edge-preserving downsampling with optional sharpening
    return resizeWithQuality(
        pixels, 
        srcWidth, 
        srcHeight,
        targetWidth, 
        targetHeight,
        cropX,
        cropY,
        cropWidth,
        cropHeight,
        detailBoost
    );
}

function resizeWithQuality(pixels, srcWidth, srcHeight, dstWidth, dstHeight, cropX, cropY, cropWidth, cropHeight, detailBoost) {
    const result = new Uint8Array(dstWidth * dstHeight * 4);
    
    const xRatio = cropWidth / dstWidth;
    const yRatio = cropHeight / dstHeight;
    
    // Sharpening kernel based on detailBoost
    const sharpen = detailBoost >= 1;
    
    for (let y = 0; y < dstHeight; y++) {
        for (let x = 0; x < dstWidth; x++) {
            // Map destination pixel to source
            const srcX = cropX + x * xRatio;
            const srcY = cropY + y * yRatio;
            
            let r, g, b, a;
            
            if (sharpen && detailBoost === 2) {
                // High detail: use sharpening
                const sharpened = sampleWithSharpening(pixels, srcWidth, srcHeight, srcX, srcY);
                r = sharpened[0];
                g = sharpened[1];
                b = sharpened[2];
                a = sharpened[3];
            } else {
                // Bilinear interpolation
                const sampled = bilinearSample(pixels, srcWidth, srcHeight, srcX, srcY);
                r = sampled[0];
                g = sampled[1];
                b = sampled[2];
                a = sampled[3];
            }
            
            const dstIdx = (y * dstWidth + x) * 4;
            result[dstIdx] = r;
            result[dstIdx + 1] = g;
            result[dstIdx + 2] = b;
            result[dstIdx + 3] = a;
        }
    }
    
    return result;
}

function bilinearSample(pixels, width, height, x, y) {
    const x1 = Math.floor(x);
    const y1 = Math.floor(y);
    const x2 = Math.min(x1 + 1, width - 1);
    const y2 = Math.min(y1 + 1, height - 1);
    
    const dx = x - x1;
    const dy = y - y1;
    
    const idx11 = (y1 * width + x1) * 4;
    const idx21 = (y1 * width + x2) * 4;
    const idx12 = (y2 * width + x1) * 4;
    const idx22 = (y2 * width + x2) * 4;
    
    const result = new Uint8Array(4);
    for (let i = 0; i < 4; i++) {
        const top = pixels[idx11 + i] * (1 - dx) + pixels[idx21 + i] * dx;
        const bottom = pixels[idx12 + i] * (1 - dx) + pixels[idx22 + i] * dx;
        result[i] = Math.round(top * (1 - dy) + bottom * dy);
    }
    
    return result;
}

function sampleWithSharpening(pixels, width, height, x, y) {
    // 3x3 sharpening kernel
    const cx = Math.round(x);
    const cy = Math.round(y);
    
    const kernel = [
        [0, -1, 0],
        [-1, 5, -1],
        [0, -1, 0]
    ];
    
    const result = [0, 0, 0, 0];
    
    for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
            const px = Math.max(0, Math.min(width - 1, cx + kx));
            const py = Math.max(0, Math.min(height - 1, cy + ky));
            const idx = (py * width + px) * 4;
            const weight = kernel[ky + 1][kx + 1];
            
            result[0] += pixels[idx] * weight;
            result[1] += pixels[idx + 1] * weight;
            result[2] += pixels[idx + 2] * weight;
            result[3] += pixels[idx + 3];
        }
    }
    
    result[3] /= 9; // Average alpha
    
    return result.map((v, i) => i === 3 ? Math.round(v) : Math.max(0, Math.min(255, Math.round(v))));
}

function detectSubjectBounds(pixels, width, height) {
    // Edge detection to find subject
    const edges = new Uint8Array(width * height);
    
    for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
            const idx = (y * width + x) * 4;
            
            // Simple Sobel operator
            const gx = (
                -pixels[((y-1)*width + (x-1))*4] + pixels[((y-1)*width + (x+1))*4] +
                -2*pixels[(y*width + (x-1))*4] + 2*pixels[(y*width + (x+1))*4] +
                -pixels[((y+1)*width + (x-1))*4] + pixels[((y+1)*width + (x+1))*4]
            );
            
            const gy = (
                -pixels[((y-1)*width + (x-1))*4] - 2*pixels[((y-1)*width + x)*4] - pixels[((y-1)*width + (x+1))*4] +
                pixels[((y+1)*width + (x-1))*4] + 2*pixels[((y+1)*width + x)*4] + pixels[((y+1)*width + (x+1))*4]
            );
            
            edges[y * width + x] = Math.min(255, Math.sqrt(gx*gx + gy*gy));
        }
    }
    
    // Find bounding box of high-edge areas
    let minX = width, maxX = 0, minY = height, maxY = 0;
    const threshold = 30;
    
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            if (edges[y * width + x] > threshold) {
                minX = Math.min(minX, x);
                maxX = Math.max(maxX, x);
                minY = Math.min(minY, y);
                maxY = Math.max(maxY, y);
            }
        }
    }
    
    // Add padding
    const padding = Math.min(width, height) * 0.05;
    minX = Math.max(0, minX - padding);
    maxX = Math.min(width - 1, maxX + padding);
    minY = Math.max(0, minY - padding);
    maxY = Math.min(height - 1, maxY + padding);
    
    return {
        x: Math.floor(minX),
        y: Math.floor(minY),
        width: Math.ceil(maxX - minX),
        height: Math.ceil(maxY - minY)
    };
}

// ============================================
// OPTIMIZED MEDIAN CUT QUANTIZATION
// ============================================

function quantizeColorsOptimized(pixels, maxColors, detailBoost, enableDithering, usePaletteLock, lockedPalette) {
    // Convert pixels to color list with typed arrays
    const numPixels = pixels.length / 4;
    const colors = new Uint8Array(numPixels * 3);
    
    let idx = 0;
    for (let i = 0; i < pixels.length; i += 4) {
        colors[idx++] = pixels[i];     // R
        colors[idx++] = pixels[i + 1]; // G
        colors[idx++] = pixels[i + 2]; // B
    }
    
    let palette;
    
    if (usePaletteLock && lockedPalette && lockedPalette.length > 0) {
        // Use locked palette
        palette = lockedPalette;
    } else {
        // Generate new palette using optimized median cut
        palette = medianCutOptimized(colors, maxColors);
    }
    
    // Map pixels to palette
    const width = Math.sqrt(numPixels); // Approximate, will be corrected by caller
    const height = numPixels / width;
    
    let mappedPixels;
    if (enableDithering) {
        mappedPixels = mapPixelsWithDithering(pixels, palette, width);
    } else {
        mappedPixels = mapPixelsToNearest(pixels, palette);
    }
    
    return {
        palette: palette,
        pixelData: mappedPixels
    };
}

function medianCutOptimized(colors, maxColors) {
    if (maxColors < 2) maxColors = 2;
    if (maxColors > 256) maxColors = 256;
    
    const numPixels = colors.length / 3;
    
    // Create initial bucket with all colors
    const buckets = [{
        colors: colors,
        count: numPixels
    }];
    
    // Recursively split buckets
    while (buckets.length < maxColors) {
        // Find bucket with largest range
        let maxRange = -1;
        let maxBucketIdx = -1;
        let maxChannel = 0;
        
        for (let i = 0; i < buckets.length; i++) {
            const bucket = buckets[i];
            if (bucket.count < 2) continue;
            
            const ranges = getColorRanges(bucket.colors);
            const range = Math.max(ranges.r, ranges.g, ranges.b);
            
            if (range > maxRange) {
                maxRange = range;
                maxBucketIdx = i;
                maxChannel = ranges.r >= ranges.g ? (ranges.r >= ranges.b ? 0 : 2) : (ranges.g >= ranges.b ? 1 : 2);
            }
        }
        
        if (maxBucketIdx === -1) break;
        
        // Split the bucket
        const bucket = buckets[maxBucketIdx];
        const split = splitBucket(bucket, maxChannel);
        
        buckets.splice(maxBucketIdx, 1, split.bucket1, split.bucket2);
    }
    
    // Average each bucket to get palette colors
    const palette = [];
    for (let bucket of buckets) {
        const avg = averageColors(bucket.colors);
        palette.push(rgbToHex(avg.r, avg.g, avg.b));
    }
    
    return palette;
}

function getColorRanges(colors) {
    let minR = 255, maxR = 0, minG = 255, maxG = 0, minB = 255, maxB = 0;
    
    for (let i = 0; i < colors.length; i += 3) {
        const r = colors[i];
        const g = colors[i + 1];
        const b = colors[i + 2];
        
        minR = Math.min(minR, r); maxR = Math.max(maxR, r);
        minG = Math.min(minG, g); maxG = Math.max(maxG, g);
        minB = Math.min(minB, b); maxB = Math.max(maxB, b);
    }
    
    return {
        r: maxR - minR,
        g: maxG - minG,
        b: maxB - minB
    };
}

function splitBucket(bucket, channel) {
    const colors = bucket.colors;
    const numColors = colors.length / 3;
    
    // Sort by channel
    const indices = new Uint32Array(numColors);
    for (let i = 0; i < numColors; i++) {
        indices[i] = i;
    }
    
    indices.sort((a, b) => {
        const valA = colors[a * 3 + channel];
        const valB = colors[b * 3 + channel];
        return valA - valB;
    });
    
    // Split at median
    const median = Math.floor(numColors / 2);
    
    const colors1 = new Uint8Array(median * 3);
    const colors2 = new Uint8Array((numColors - median) * 3);
    
    for (let i = 0; i < median; i++) {
        const idx = indices[i];
        colors1[i * 3] = colors[idx * 3];
        colors1[i * 3 + 1] = colors[idx * 3 + 1];
        colors1[i * 3 + 2] = colors[idx * 3 + 2];
    }
    
    for (let i = median; i < numColors; i++) {
        const idx = indices[i];
        const j = i - median;
        colors2[j * 3] = colors[idx * 3];
        colors2[j * 3 + 1] = colors[idx * 3 + 1];
        colors2[j * 3 + 2] = colors[idx * 3 + 2];
    }
    
    return {
        bucket1: { colors: colors1, count: median },
        bucket2: { colors: colors2, count: numColors - median }
    };
}

function averageColors(colors) {
    let r = 0, g = 0, b = 0;
    const count = colors.length / 3;
    
    for (let i = 0; i < colors.length; i += 3) {
        r += colors[i];
        g += colors[i + 1];
        b += colors[i + 2];
    }
    
    return {
        r: Math.round(r / count),
        g: Math.round(g / count),
        b: Math.round(b / count)
    };
}

function mapPixelsToNearest(pixels, palette) {
    const width = Math.sqrt(pixels.length / 4);
    const height = pixels.length / 4 / width;
    const result = [];
    
    // Convert palette to RGB
    const paletteRGB = palette.map(hexToRgb);
    
    for (let i = 0; i < pixels.length; i += 4) {
        const r = pixels[i];
        const g = pixels[i + 1];
        const b = pixels[i + 2];
        const a = pixels[i + 3];
        
        if (a < 128) {
            result.push(null);
        } else {
            const nearest = findNearestColor(r, g, b, paletteRGB);
            result.push(palette[nearest]);
        }
    }
    
    // Convert to 2D array
    const grid = [];
    for (let y = 0; y < height; y++) {
        grid.push(result.slice(y * width, (y + 1) * width));
    }
    
    return grid;
}

function mapPixelsWithDithering(pixels, palette, width) {
    const height = pixels.length / 4 / width;
    const paletteRGB = palette.map(hexToRgb);
    
    // Create mutable copy for dithering
    const dithered = new Uint8Array(pixels);
    const result = [];
    
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const idx = (y * width + x) * 4;
            
            const oldR = dithered[idx];
            const oldG = dithered[idx + 1];
            const oldB = dithered[idx + 2];
            const a = dithered[idx + 3];
            
            if (a < 128) {
                result.push(null);
                continue;
            }
            
            const nearest = findNearestColor(oldR, oldG, oldB, paletteRGB);
            const newColor = paletteRGB[nearest];
            result.push(palette[nearest]);
            
            // Calculate error
            const errR = oldR - newColor.r;
            const errG = oldG - newColor.g;
            const errB = oldB - newColor.b;
            
            // Floyd-Steinberg dithering
            distributeError(dithered, width, height, x + 1, y, errR, errG, errB, 7/16);
            distributeError(dithered, width, height, x - 1, y + 1, errR, errG, errB, 3/16);
            distributeError(dithered, width, height, x, y + 1, errR, errG, errB, 5/16);
            distributeError(dithered, width, height, x + 1, y + 1, errR, errG, errB, 1/16);
        }
    }
    
    // Convert to 2D array
    const grid = [];
    for (let y = 0; y < height; y++) {
        grid.push(result.slice(y * width, (y + 1) * width));
    }
    
    return grid;
}

function distributeError(pixels, width, height, x, y, errR, errG, errB, weight) {
    if (x < 0 || x >= width || y < 0 || y >= height) return;
    
    const idx = (y * width + x) * 4;
    pixels[idx] = clamp(pixels[idx] + errR * weight);
    pixels[idx + 1] = clamp(pixels[idx + 1] + errG * weight);
    pixels[idx + 2] = clamp(pixels[idx + 2] + errB * weight);
}

function clamp(value) {
    return Math.max(0, Math.min(255, Math.round(value)));
}

function findNearestColor(r, g, b, palette) {
    let minDist = Infinity;
    let nearest = 0;
    
    for (let i = 0; i < palette.length; i++) {
        const pr = palette[i].r;
        const pg = palette[i].g;
        const pb = palette[i].b;
        
        // Euclidean distance in RGB space
        const dist = (r - pr) ** 2 + (g - pg) ** 2 + (b - pb) ** 2;
        
        if (dist < minDist) {
            minDist = dist;
            nearest = i;
        }
    }
    
    return nearest;
}

// ============================================
// AUTO-TEMPLATE MODE (TURTLES)
// ============================================

function applyAutoTemplate(pixels, width, height) {
    // Apply turtle-friendly color enhancement
    const enhanced = new Uint8Array(pixels.length);
    
    for (let i = 0; i < pixels.length; i += 4) {
        const r = pixels[i];
        const g = pixels[i + 1];
        const b = pixels[i + 2];
        const a = pixels[i + 3];
        
        // Shift colors toward turtle palette (greens, browns)
        const avg = (r + g + b) / 3;
        
        if (g > r && g > b) {
            // Enhance greens (shell)
            enhanced[i] = Math.max(0, r - 20);
            enhanced[i + 1] = Math.min(255, g + 30);
            enhanced[i + 2] = Math.max(0, b - 20);
        } else if (r > 100 && g > 80 && b < 80) {
            // Enhance browns (body)
            enhanced[i] = Math.min(255, r + 20);
            enhanced[i + 1] = g;
            enhanced[i + 2] = Math.max(0, b - 10);
        } else {
            // Keep others neutral
            enhanced[i] = r;
            enhanced[i + 1] = g;
            enhanced[i + 2] = b;
        }
        
        enhanced[i + 3] = a;
    }
    
    return enhanced;
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function rgbToHex(r, g, b) {
    return '#' + [r, g, b].map(x => {
        const hex = x.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    }).join('');
}

function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
}

function countUniqueColors(pixels) {
    const colors = new Set();
    for (let i = 0; i < pixels.length; i += 4) {
        const r = pixels[i];
        const g = pixels[i + 1];
        const b = pixels[i + 2];
        const a = pixels[i + 3];
        if (a >= 128) {
            colors.add(`${r},${g},${b}`);
        }
    }
    return colors.size;
}
