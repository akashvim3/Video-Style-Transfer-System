class VideoStyleTransfer {
    constructor() {
        this.isProcessing = false;
        this.videoSource = 'webcam';
        this.selectedStyle = 'starry-night';
        this.styleIntensity = 0.8;
        this.blendStyle = 'none';
        this.blendRatio = 0.5;
        this.stream = null;
        this.videoElement = null;
        this.canvasElement = null;
        this.ctx = null;
        this.fps = 0;
        this.lastTime = Date.now();
        this.frameCount = 0;
        this.styleTensors = {};
        this.isModelLoaded = false;
    }

    async initialize() {
        console.log('Initializing Video Style Transfer System...');
        this.videoElement = document.getElementById('originalVideo');
        this.canvasElement = document.getElementById('stylizedCanvas');
        this.ctx = this.canvasElement.getContext('2d');

        // In a production environment, you would load the actual TensorFlow.js models here
        // For demonstration, we'll simulate the model loading
        await this.loadModels();

        console.log('Video Style Transfer System Ready!');
    }

    async loadModels() {
        // Simulate model loading time
        return new Promise((resolve) => {
            setTimeout(() => {
                console.log('Style transfer models loaded successfully!');
                this.isModelLoaded = true;

                // Initialize style representations
                this.styleTensors = {
                    'starry-night': this.generateStyleVector(),
                    'scream': this.generateStyleVector(),
                    'wave': this.generateStyleVector(),
                    'picasso': this.generateStyleVector(),
                    'monet': this.generateStyleVector(),
                    'kandinsky': this.generateStyleVector()
                };

                resolve();
            }, 1000);
        });
    }

    generateStyleVector() {
        // In production, this would be actual style embeddings from pre-trained models
        // For demonstration, we generate random style parameters
        return {
            hue: Math.random() * 360,
            saturation: 50 + Math.random() * 50,
            brightness: -20 + Math.random() * 40,
            contrast: 0.8 + Math.random() * 0.4,
            blur: Math.random() * 2,
            edgeEnhance: Math.random()
        };
    }

    async startWebcam() {
        try {
            this.stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 640 },
                    height: { ideal: 480 },
                    facingMode: 'user'
                }
            });

            this.videoElement.srcObject = this.stream;
            this.videoElement.play();

            this.videoElement.onloadedmetadata = () => {
                this.canvasElement.width = this.videoElement.videoWidth;
                this.canvasElement.height = this.videoElement.videoHeight;
            };

            updateStatus('Webcam started successfully');
            return true;
        } catch (error) {
            console.error('Error accessing webcam:', error);
            updateStatus('Error: Could not access webcam');
            alert('Could not access webcam. Please ensure you have granted camera permissions.');
            return false;
        }
    }

    stopWebcam() {
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
        }
    }

    async loadVideoFile(file) {
        return new Promise((resolve, reject) => {
            const url = URL.createObjectURL(file);
            this.videoElement.src = url;

            this.videoElement.onloadedmetadata = () => {
                this.canvasElement.width = this.videoElement.videoWidth;
                this.canvasElement.height = this.videoElement.videoHeight;
                this.videoElement.play();
                updateStatus('Video file loaded successfully');
                resolve();
            };

            this.videoElement.onerror = () => {
                reject(new Error('Failed to load video file'));
            };
        });
    }

    async processFrame() {
        if (!this.isProcessing || !this.videoElement.videoWidth) {
            return;
        }

        const startTime = performance.now();

        // Draw original frame
        this.ctx.drawImage(
            this.videoElement,
            0, 0,
            this.canvasElement.width,
            this.canvasElement.height
        );

        // Get image data
        const imageData = this.ctx.getImageData(
            0, 0,
            this.canvasElement.width,
            this.canvasElement.height
        );

        // Apply style transfer
        const styledData = this.applyStyleTransfer(imageData);

        // Put styled image back
        this.ctx.putImageData(styledData, 0, 0);

        // Calculate FPS
        this.frameCount++;
        const currentTime = Date.now();
        if (currentTime - this.lastTime >= 1000) {
            this.fps = this.frameCount;
            this.frameCount = 0;
            this.lastTime = currentTime;
            document.getElementById('fpsCounter').textContent = this.fps;
        }

        // Update processing time
        const processingTime = (performance.now() - startTime).toFixed(2);
        document.getElementById('processingTime').textContent = `${processingTime}ms`;

        // Continue processing
        requestAnimationFrame(() => this.processFrame());
    }

    applyStyleTransfer(imageData) {
        const data = imageData.data;
        const style = this.styleTensors[this.selectedStyle];

        // Apply style transformations
        // This is a simplified version - production would use actual neural network inference

        for (let i = 0; i < data.length; i += 4) {
            let r = data[i];
            let g = data[i + 1];
            let b = data[i + 2];

            // Convert to HSL
            const hsl = this.rgbToHsl(r, g, b);

            // Apply style modifications
            hsl[0] = (hsl[0] + style.hue * this.styleIntensity) % 360;
            hsl[1] = Math.min(100, hsl[1] * (1 + (style.saturation / 100) * this.styleIntensity));
            hsl[2] = Math.max(0, Math.min(100, hsl[2] + style.brightness * this.styleIntensity));

            // Convert back to RGB
            const rgb = this.hslToRgb(hsl[0], hsl[1], hsl[2]);

            // Apply contrast
            const factor = style.contrast * this.styleIntensity;
            r = ((rgb[0] / 255 - 0.5) * factor + 0.5) * 255;
            g = ((rgb[1] / 255 - 0.5) * factor + 0.5) * 255;
            b = ((rgb[2] / 255 - 0.5) * factor + 0.5) * 255;

            // Clamp values
            data[i] = Math.max(0, Math.min(255, r));
            data[i + 1] = Math.max(0, Math.min(255, g));
            data[i + 2] = Math.max(0, Math.min(255, b));
        }

        // Apply style blending if second style is selected
        if (this.blendStyle !== 'none') {
            this.blendStyles(imageData);
        }

        // Apply artistic filters
        this.applyArtisticFilters(imageData, style);

        return imageData;
    }

    blendStyles(imageData) {
        const blendStyleData = this.styleTensors[this.blendStyle];
        const data = imageData.data;
        const ratio = this.blendRatio;

        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];

            // Apply blend style hue shift
            const hsl = this.rgbToHsl(r, g, b);
            hsl[0] = (hsl[0] + blendStyleData.hue * ratio) % 360;

            const rgb = this.hslToRgb(hsl[0], hsl[1], hsl[2]);

            data[i] = Math.max(0, Math.min(255, rgb[0]));
            data[i + 1] = Math.max(0, Math.min(255, rgb[1]));
            data[i + 2] = Math.max(0, Math.min(255, rgb[2]));
        }
    }

    applyArtisticFilters(imageData, style) {
        // Apply edge enhancement for certain styles
        if (style.edgeEnhance > 0.5) {
            this.enhanceEdges(imageData, style.edgeEnhance * this.styleIntensity);
        }

        // Apply texture effects
        if (style.blur > 0) {
            this.applyTexture(imageData, style.blur * this.styleIntensity);
        }
    }

    enhanceEdges(imageData, strength) {
        const data = imageData.data;
        const width = imageData.width;
        const tempData = new Uint8ClampedArray(data);

        for (let y = 1; y < imageData.height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {
                const idx = (y * width + x) * 4;

                for (let c = 0; c < 3; c++) {
                    const tl = tempData[((y-1) * width + (x-1)) * 4 + c];
                    const tc = tempData[((y-1) * width + x) * 4 + c];
                    const tr = tempData[((y-1) * width + (x+1)) * 4 + c];
                    const cl = tempData[(y * width + (x-1)) * 4 + c];
                    const cc = tempData[(y * width + x) * 4 + c];
                    const cr = tempData[(y * width + (x+1)) * 4 + c];
                    const bl = tempData[((y+1) * width + (x-1)) * 4 + c];
                    const bc = tempData[((y+1) * width + x) * 4 + c];
                    const br = tempData[((y+1) * width + (x+1)) * 4 + c];

                    const edge = Math.abs(-tl - tc - tr - cl + 8*cc - cr - bl - bc - br);
                    data[idx + c] = Math.max(0, Math.min(255, cc + edge * strength * 0.3));
                }
            }
        }
    }

    applyTexture(imageData, intensity) {
        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
            const noise = (Math.random() - 0.5) * intensity * 20;
            data[i] = Math.max(0, Math.min(255, data[i] + noise));
            data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise));
            data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise));
        }
    }

    rgbToHsl(r, g, b) {
        r /= 255;
        g /= 255;
        b /= 255;

        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;

        if (max === min) {
            h = s = 0;
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

            switch (max) {
                case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
                case g: h = ((b - r) / d + 2) / 6; break;
                case b: h = ((r - g) / d + 4) / 6; break;
            }
        }

        return [h * 360, s * 100, l * 100];
    }

    hslToRgb(h, s, l) {
        h /= 360;
        s /= 100;
        l /= 100;

        let r, g, b;

        if (s === 0) {
            r = g = b = l;
        } else {
            const hue2rgb = (p, q, t) => {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1/6) return p + (q - p) * 6 * t;
                if (t < 1/2) return q;
                if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                return p;
            };

            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;

            r = hue2rgb(p, q, h + 1/3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1/3);
        }

        return [r * 255, g * 255, b * 255];
    }
}

// Global style transfer instance
let styleTransfer = null;

// Initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
    if (document.getElementById('originalVideo')) {
        styleTransfer = new VideoStyleTransfer();
        await styleTransfer.initialize();
    }
});

// Source selection
function selectSource(source) {
    document.querySelectorAll('.source-btn').forEach(btn => btn.classList.remove('active'));

    if (source === 'webcam') {
        document.getElementById('webcamBtn').classList.add('active');
        styleTransfer.videoSource = 'webcam';
    } else {
        document.getElementById('uploadBtn').classList.add('active');
        styleTransfer.videoSource = 'upload';
        document.getElementById('videoUpload').click();
    }
}

// Video upload handler
document.addEventListener('DOMContentLoaded', () => {
    const videoUpload = document.getElementById('videoUpload');
    if (videoUpload) {
        videoUpload.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (file) {
                try {
                    await styleTransfer.loadVideoFile(file);
                } catch (error) {
                    console.error('Error loading video:', error);
                    alert('Failed to load video file. Please try another file.');
                }
            }
        });
    }
});

// Style selection
function selectStyle(styleName) {
    document.querySelectorAll('.style-item').forEach(item => item.classList.remove('selected'));
    document.querySelector(`[data-style="${styleName}"]`).classList.add('selected');
    styleTransfer.selectedStyle = styleName;
}

// Control handlers
document.addEventListener('DOMContentLoaded', () => {
    const intensitySlider = document.getElementById('styleIntensity');
    const blendSelect = document.getElementById('blendStyle');
    const blendRatioSlider = document.getElementById('blendRatio');

    if (intensitySlider) {
        intensitySlider.addEventListener('input', (e) => {
            const value = e.target.value;
            document.getElementById('intensityValue').textContent = value;
            if (styleTransfer) {
                styleTransfer.styleIntensity = parseFloat(value);
            }
        });
    }

    if (blendSelect) {
        blendSelect.addEventListener('change', (e) => {
            if (styleTransfer) {
                styleTransfer.blendStyle = e.target.value;
            }
        });
    }

    if (blendRatioSlider) {
        blendRatioSlider.addEventListener('input', (e) => {
            const value = e.target.value;
            document.getElementById('blendValue').textContent = value;
            if (styleTransfer) {
                styleTransfer.blendRatio = parseFloat(value);
            }
        });
    }
});

// Start transfer
async function startTransfer() {
    if (!styleTransfer) {
        alert('System not initialized. Please refresh the page.');
        return;
    }

    if (styleTransfer.videoSource === 'webcam') {
        const success = await styleTransfer.startWebcam();
        if (!success) return;
    }

    styleTransfer.isProcessing = true;
    styleTransfer.processFrame();

    document.getElementById('startBtn').disabled = true;
    document.getElementById('stopBtn').disabled = false;
    document.getElementById('captureBtn').disabled = false;
    document.getElementById('downloadBtn').disabled = false;

    document.getElementById('processingIndicator').classList.add('active');
    setTimeout(() => {
        document.getElementById('processingIndicator').classList.remove('active');
    }, 2000);

    updateStatus('Processing video...');
}

// Stop transfer
function stopTransfer() {
    if (styleTransfer) {
        styleTransfer.isProcessing = false;
        styleTransfer.stopWebcam();
    }

    document.getElementById('startBtn').disabled = false;
    document.getElementById('stopBtn').disabled = true;
    document.getElementById('captureBtn').disabled = true;
    document.getElementById('downloadBtn').disabled = true;

    updateStatus('Stopped');
}

// Capture frame
function captureFrame() {
    const canvas = document.getElementById('stylizedCanvas');
    const link = document.createElement('a');
    link.download = `stylized-frame-${Date.now()}.png`;
    link.href = canvas.toDataURL();
    link.click();

    updateStatus('Frame captured successfully');
}

// Download video
function downloadVideo() {
    alert('Video recording feature will be implemented with MediaRecorder API. For now, use capture frame to save
// Download video (continuation)
function downloadVideo() {
    alert('Video recording feature: To record, use screen recording software or the capture frame option for individual frames. Full video recording with MediaRecorder API coming soon!');
    updateStatus('Use capture frame to save individual frames');
}

// Update status
function updateStatus(message) {
    document.getElementById('statusText').textContent = message;
}

// Scroll to transfer section
function scrollToTransfer() {
    document.getElementById('transferSection').scrollIntoView({
        behavior: 'smooth',
        block: 'start'
    });
}
