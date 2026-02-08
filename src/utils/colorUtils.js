/**
 * @file colorUtils.js
 * @description Color conversion and manipulation utilities
 */

/**
 * Convert RGB values to hexadecimal color string
 * @param {number} r - Red value (0-255)
 * @param {number} g - Green value (0-255)
 * @param {number} b - Blue value (0-255)
 * @returns {string} Hex color string (e.g., '#a8d8ea')
 */
export function rgbToHex(r, g, b) {
    return '#' + [r, g, b].map((x) => {
        const hex = x.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    }).join('');
}

/**
 * Convert hexadecimal color to RGB object
 * @param {string} hex - Hex color string (e.g., '#a8d8ea')
 * @returns {Object} RGB object {r, g, b}
 */
export function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
        ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16),
          }
        : { r: 255, g: 255, b: 255 };
}

/**
 * Calculate Euclidean distance between two colors in RGB space
 * Useful for finding the closest color in a palette
 * @param {Object} color1 - RGB object {r, g, b}
 * @param {Object} color2 - RGB object {r, g, b}
 * @returns {number} Distance value
 */
export function distanceBetweenColors(color1, color2) {
    const dr = color1.r - color2.r;
    const dg = color1.g - color2.g;
    const db = color1.b - color2.b;
    return Math.sqrt(dr * dr + dg * dg + db * db);
}

/**
 * Convert hexadecimal color to HSL (Hue, Saturation, Lightness)
 * @param {string} hex - Hex color string
 * @returns {Object} HSL object {h, s, l}
 */
export function hexToHsl(hex) {
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

/**
 * Convert HSL values to hexadecimal color
 * @param {number} h - Hue (0-360)
 * @param {number} s - Saturation (0-100)
 * @param {number} l - Lightness (0-100)
 * @returns {string} Hex color string
 */
export function hslToHex(h, s, l) {
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

/**
 * Get a human-friendly name for a color
 * @param {string} hex - Hex color string
 * @returns {string} Color name or empty string
 */
export function getColorName(hex) {
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

    const lowerHex = hex.toLowerCase();
    if (colorNames[lowerHex]) {
        return colorNames[lowerHex];
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
