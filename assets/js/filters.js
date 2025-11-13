class AdvancedFilters {
    constructor() {
        this.filters = {
            brightness: 0,
            contrast: 0,
            saturation: 0,
            hue: 0,
            blur: 0,
            sharpen: 0,
            vignette: 0,
            grain: 0,
            temperature: 0,
            tint: 0
        };
    }

    // Apply brightness filter
    applyBrightness(imageData, value) {
        const data = imageData.data;
        const adjustment = value * 2.55; // Convert to 0-255 range

        for (let i = 0; i < data.length; i += 4) {
            data[i] = Math.max(0, Math.min(255, data[i] + adjustment));
            data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + adjustment));
            data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + adjustment));
        }

        return imageData;
    }

    // Apply contrast filter
    applyContrast(imageData, value) {
        const data = imageData.data;
        const factor = (259 * (value + 255)) / (255 * (259 - value));

        for (let i = 0; i < data.length; i += 4) {
            data[i] = Math.max(0, Math.min(255, factor * (data[i] - 128) + 128));
            data[i + 1] = Math.max(0, Math.min(255, factor * (data[i + 1] - 128) + 128));
            data[i + 2] = Math.max(0, Math.min(255, factor * (data[i + 2] - 128) + 128));
        }

        return imageData;
    }

    // Apply saturation filter
    applySaturation(imageData, value) {
        const data = imageData.data;
        const adjustment = value / 100;

        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];

            const gray = 0.2989 * r + 0.5870 * g + 0.1140 * b;

            data[i] = Math.max(0, Math.min(255, gray + adjustment * (r - gray)));
            data[i + 1] = Math.max(0, Math.min(255, gray + adjustment * (g - gray)));
            data[i + 2] = Math.max(0, Math.min(255, gray + adjustment * (b - gray)));
        }

        return imageData;
    }

    // Apply vignette effect
    applyVignette(imageData, intensity) {
        const data = imageData.data;
        const width = imageData.width;
        const height = imageData.height;
        const centerX = width / 2;
        const centerY = height / 2;
        const maxDistance = Math.sqrt(centerX * centerX + centerY * centerY);

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const i = (y * width + x) * 4;
                const dx = x - centerX;
                const dy = y - centerY;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const vignette = 1 - (distance / maxDistance) * intensity;

                data[i] *= vignette;
                data[i + 1] *= vignette;
                data[i + 2] *= vignette;
            }
        }

        return imageData;
    }

    // Apply film grain
    applyGrain(imageData, intensity) {
        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
            const noise = (Math.random() - 0.5) * intensity * 50;
            data[i] = Math.max(0, Math.min(255, data[i] + noise));
            data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise));
            data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise));
        }

        return imageData;
    }

    // Apply temperature (warm/cool)
    applyTemperature(imageData, value) {
        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
            if (value > 0) {
                // Warm
                data[i] = Math.min(255, data[i] + value);
                data[i + 2] = Math.max(0, data[i + 2] - value * 0.5);
            } else {
                // Cool
                data[i] = Math.max(0, data[i] + value);
                data[i + 2] = Math.min(255, data[i + 2] - value);
            }
        }

        return imageData;
    }

    // Apply sharpening
    applySharpen(imageData, intensity) {
        const data = imageData.data;
        const width = imageData.width;
        const height = imageData.height;
        const tempData = new Uint8ClampedArray(data);

        const kernel = [
            0, -1, 0,
            -1, 5, -1,
            0, -1, 0
        ];

        for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {
                for (let c = 0; c < 3; c++) {
                    let sum = 0;
                    for (let ky = -1; ky <= 1; ky++) {
                        for (let kx = -1; kx <= 1; kx++) {
                            const idx = ((y + ky) * width + (x + kx)) * 4 + c;
                            const kernelIdx = (ky + 1) * 3 + (kx + 1);
                            sum += tempData[idx] * kernel[kernelIdx];
                        }
                    }

                    const idx = (y * width + x) * 4 + c;
                    const original = tempData[idx];
                    data[idx] = Math.max(0, Math.min(255, original + (sum - original) * intensity));
                }
            }
        }

        return imageData;
    }

    // Sepia filter
    applySepia(imageData) {
        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];

            data[i] = Math.min(255, (r * 0.393) + (g * 0.769) + (b * 0.189));
            data[i + 1] = Math.min(255, (r * 0.349) + (g * 0.686) + (b * 0.168));
            data[i + 2] = Math.min(255, (r * 0.272) + (g * 0.534) + (b * 0.131));
        }

        return imageData;
    }

    // Grayscale filter
    applyGrayscale(imageData) {
        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
            const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
            data[i] = data[i + 1] = data[i + 2] = gray;
        }

        return imageData;
    }

    // Invert colors
    applyInvert(imageData) {
        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
            data[i] = 255 - data[i];
            data[i + 1] = 255 - data[i + 1];
            data[i + 2] = 255 - data[i + 2];
        }

        return imageData;
    }

    // Apply all enabled filters
    applyAllFilters(imageData) {
        let result = imageData;

        if (this.filters.brightness !== 0) {
            result = this.applyBrightness(result, this.filters.brightness);
        }
        if (this.filters.contrast !== 0) {
            result = this.applyContrast(result, this.filters.contrast);
        }
        if (this.filters.saturation !== 0) {
            result = this.applySaturation(result, this.filters.saturation);
        }
        if (this.filters.vignette !== 0) {
            result = this.applyVignette(result, this.filters.vignette);
        }
        if (this.filters.grain !== 0) {
            result = this.applyGrain(result, this.filters.grain);
        }
        if (this.filters.temperature !== 0) {
            result = this.applyTemperature(result, this.filters.temperature);
        }
        if (this.filters.sharpen !== 0) {
            result = this.applySharpen(result, this.filters.sharpen);
        }

        return result;
    }

    // Reset all filters
    resetFilters() {
        this.filters = {
            brightness: 0,
            contrast: 0,
            saturation: 0,
            hue: 0,
            blur: 0,
            sharpen: 0,
            vignette: 0,
            grain: 0,
            temperature: 0,
            tint: 0
        };
    }

    // Set filter value
    setFilter(name, value) {
        if (this.filters.hasOwnProperty(name)) {
            this.filters[name] = value;
        }
    }

    // Get filter value
    getFilter(name) {
        return this.filters[name] || 0;
    }
}

// Global filters instance
const advancedFilters = new AdvancedFilters();

// Preset filters
const filterPresets = {
    vintage: () => {
        advancedFilters.setFilter('saturation', -20);
        advancedFilters.setFilter('temperature', 15);
        advancedFilters.setFilter('vignette', 0.3);
        advancedFilters.setFilter('grain', 0.2);
    },
    vibrant: () => {
        advancedFilters.setFilter('saturation', 30);
        advancedFilters.setFilter('contrast', 15);
        advancedFilters.setFilter('sharpen', 0.3);
    },
    dramatic: () => {
        advancedFilters.setFilter('contrast', 40);
        advancedFilters.setFilter('saturation', -10);
        advancedFilters.setFilter('vignette', 0.5);
        advancedFilters.setFilter('sharpen', 0.4);
    },
    soft: () => {
        advancedFilters.setFilter('brightness', 10);
        advancedFilters.setFilter('saturation', -10);
        advancedFilters.setFilter('temperature', 5);
    }
};

// Apply preset
function applyFilterPreset(presetName) {
    advancedFilters.resetFilters();
    if (filterPresets[presetName]) {
        filterPresets[presetName]();
    }
}
