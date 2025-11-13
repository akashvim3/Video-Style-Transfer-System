class DemoController {
    constructor() {
        this.currentTab = 'webcam';
        this.isProcessing = false;
        this.currentStyle = 'starry-night';
        this.demoVideo = null;
        this.demoCanvas = null;
        this.ctx = null;
        this.animationFrame = null;
        this.stats = {
            fps: 0,
            latency: 0,
            quality: 100
        };
    }

    init() {
        this.demoVideo = document.getElementById('demoVideo');
        this.demoCanvas = document.getElementById('demoCanvas');

        if (this.demoCanvas) {
            this.ctx = this.demoCanvas.getContext('2d');
        }

        this.initializeControlListeners();
        this.updateLiveStats();
    }

    initializeControlListeners() {
        // Intensity slider
        const intensitySlider = document.getElementById('intensitySlider');
        if (intensitySlider) {
            intensitySlider.addEventListener('input', (e) => {
                document.getElementById('intensityValue').textContent = e.target.value + '%';
            });
        }

        // Edge slider
        const edgeSlider = document.getElementById('edgeSlider');
        if (edgeSlider) {
            edgeSlider.addEventListener('input', (e) => {
                document.getElementById('edgeValue').textContent = e.target.value + '%';
            });
        }

        // Saturation slider
        const saturationSlider = document.getElementById('saturationSlider');
        if (saturationSlider) {
            saturationSlider.addEventListener('input', (e) => {
                document.getElementById('saturationValue').textContent = e.target.value + '%';
            });
        }

        // Texture slider
        const textureSlider = document.getElementById('textureSlider');
        if (textureSlider) {
            textureSlider.addEventListener('input', (e) => {
                document.getElementById('textureValue').textContent = e.target.value + '%';
            });
        }

        // Comparison slider
        const compareSlider = document.getElementById('compareSlider');
        if (compareSlider) {
            compareSlider.addEventListener('input', (e) => {
                this.updateComparisonView(e.target.value);
            });
        }

        // Upload zone
        const uploadZone = document.getElementById('uploadZone');
        const videoFileInput = document.getElementById('videoFileInput');

        if (uploadZone && videoFileInput) {
            uploadZone.addEventListener('click', () => {
                videoFileInput.click();
            });

            uploadZone.addEventListener('dragover', (e) => {
                e.preventDefault();
                uploadZone.style.borderColor = '#6366f1';
                uploadZone.style.background = 'rgba(99, 102, 241, 0.1)';
            });

            uploadZone.addEventListener('dragleave', () => {
                uploadZone.style.borderColor = '#e5e7eb';
                uploadZone.style.background = 'white';
            });

            uploadZone.addEventListener('drop', (e) => {
                e.preventDefault();
                uploadZone.style.borderColor = '#e5e7eb';
                uploadZone.style.background = 'white';

                const file = e.dataTransfer.files[0];
                if (file && file.type.startsWith('video/')) {
                    this.loadVideoFile(file);
                }
            });

            videoFileInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    this.loadVideoFile(file);
                }
            });
        }
    }

    loadVideoFile(file) {
        const url = URL.createObjectURL(file);

        if (this.demoVideo) {
            this.demoVideo.src = url;
            this.demoVideo.load();

            this.demoVideo.onloadedmetadata = () => {
                if (this.demoCanvas) {
                    this.demoCanvas.width = this.demoVideo.videoWidth;
                    this.demoCanvas.height = this.demoVideo.videoHeight;
                }
                showNotification('Video loaded successfully!', 'success');
                switchTab('webcam'); // Switch back to processing view
            };
        }
    }

    updateComparisonView(value) {
        const canvasContainer = document.querySelector('.canvas-container');
        if (canvasContainer) {
            const clipValue = value + '%';
            this.demoCanvas.style.clipPath = `inset(0 ${100 - value}% 0 0)`;
        }
    }

    updateLiveStats() {
        setInterval(() => {
            // Simulate live stats (in production, these would be real measurements)
            this.stats.fps = 20 + Math.floor(Math.random() * 15);
            this.stats.latency = 25 + Math.floor(Math.random() * 30);
            this.stats.quality = 85 + Math.floor(Math.random() * 15);

            const fpsEl = document.getElementById('liveFPS');
            const latencyEl = document.getElementById('liveLatency');
            const gpuEl = document.getElementById('gpuUsage');
            const qualityEl = document.getElementById('qualityScore');

            if (fpsEl) fpsEl.textContent = this.stats.fps;
            if (latencyEl) latencyEl.textContent = this.stats.latency + 'ms';
            if (gpuEl) gpuEl.textContent = (40 + Math.floor(Math.random() * 30)) + '%';
            if (qualityEl) qualityEl.textContent = this.stats.quality + '/100';
        }, 1000);
    }
}

// Initialize demo controller
let demoController;
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('demoVideo')) {
        demoController = new DemoController();
        demoController.init();
    }
});

// Tab switching
function switchTab(tabName) {
    const tabs = document.querySelectorAll('.tab-btn');
    const contents = document.querySelectorAll('.tab-content');

    tabs.forEach(tab => tab.classList.remove('active'));
    contents.forEach(content => content.classList.remove('active'));

    document.querySelector(`[onclick="switchTab('${tabName}')"]`)?.classList.add('active');
    document.getElementById(`${tabName}-tab`)?.classList.add('active');

    if (demoController) {
        demoController.currentTab = tabName;
    }
}

// Style carousel scrolling
function scrollStyles(direction) {
    const container = document.getElementById('stylesContainer');
    if (container) {
        const scrollAmount = 300;
        container.scrollBy({
            left: direction * scrollAmount,
            behavior: 'smooth'
        });
    }
}

// Apply quick style
function applyQuickStyle(styleName) {
    document.querySelectorAll('.style-card').forEach(card => {
        card.classList.remove('active');
    });

    document.querySelector(`[data-style="${styleName}"]`)?.classList.add('active');

    if (demoController) {
        demoController.currentStyle = styleName;
    }

    showNotification(`Applied ${styleName.replace('-', ' ')} style!`, 'success');
}

// Apply preset
function applyPreset(presetName) {
    const presets = {
        subtle: { intensity: 40, edge: 70, saturation: 90, texture: 30 },
        balanced: { intensity: 60, edge: 50, saturation: 100, texture: 50 },
        intense: { intensity: 90, edge: 30, saturation: 120, texture: 80 },
        artistic: { intensity: 80, edge: 20, saturation: 110, texture: 70 }
    };

    const preset = presets[presetName];
    if (preset) {
        document.getElementById('intensitySlider').value = preset.intensity;
        document.getElementById('intensityValue').textContent = preset.intensity + '%';

        document.getElementById('edgeSlider').value = preset.edge;
        document.getElementById('edgeValue').textContent = preset.edge + '%';

        document.getElementById('saturationSlider').value = preset.saturation;
        document.getElementById('saturationValue').textContent = preset.saturation + '%';

        document.getElementById('textureSlider').value = preset.texture;
        document.getElementById('textureValue').textContent = preset.texture + '%';

        showNotification(`Applied ${presetName} preset!`, 'success');
    }
}

// Start demo transfer
async function startDemoTransfer() {
    if (!demoController) return;

    if (!demoController.isProcessing) {
        // Start webcam if needed
        if (demoController.currentTab === 'webcam') {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: { width: 640, height: 480 }
                });
                demoController.demoVideo.srcObject = stream;
                await demoController.demoVideo.play();
            } catch (error) {
                console.error('Webcam error:', error);
                showNotification('Could not access webcam', 'error');
                return;
            }
        }

        demoController.isProcessing = true;
        showNotification('Processing started!', 'success');

        // Update button
        const btn = document.querySelector('[onclick="startDemoTransfer()"]');
        if (btn) {
            btn.innerHTML = '<i class="fas fa-stop"></i> Stop Processing';
            btn.classList.add('btn-danger');
        }

        // Start processing loop
        processVideoFrame();
    } else {
        // Stop processing
        demoController.isProcessing = false;

        if (demoController.animationFrame) {
            cancelAnimationFrame(demoController.animationFrame);
        }

        // Stop webcam
        if (demoController.demoVideo.srcObject) {
            demoController.demoVideo.srcObject.getTracks().forEach(track => track.stop());
        }

        showNotification('Processing stopped', 'info');

        // Update button
        const btn = document.querySelector('[onclick="startDemoTransfer()"]');
        if (btn) {
            btn.innerHTML = '<i class="fas fa-play"></i> Start Processing';
            btn.classList.remove('btn-danger');
        }
    }
}

// Process video frame
function processVideoFrame() {
    if (!demoController || !demoController.isProcessing) return;

    const video = demoController.demoVideo;
    const canvas = demoController.demoCanvas;
    const ctx = demoController.ctx;

    if (video && canvas && ctx && video.videoWidth > 0) {
        // Draw video frame to canvas
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Get image data
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

        // Apply style transfer (simplified version)
        const styledData = applyDemoStyleTransfer(imageData);

        // Put back to canvas
        ctx.putImageData(styledData, 0, 0);
    }

    demoController.animationFrame = requestAnimationFrame(processVideoFrame);
}

// Simplified style transfer for demo
function applyDemoStyleTransfer(imageData) {
    const data = imageData.data;
    const intensity = parseInt(document.getElementById('intensitySlider')?.value || 80) / 100;
    const saturation = parseInt(document.getElementById('saturationSlider')?.value || 100) / 100;

    for (let i = 0; i < data.length; i += 4) {
        // Apply intensity-based color shift
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // Enhance colors based on intensity
        data[i] = Math.min(255, r * (1 + intensity * 0.2));
        data[i + 1] = Math.min(255, g * (1 + intensity * 0.15));
        data[i + 2] = Math.min(255, b * (1 + intensity * 0.25));

        // Apply saturation
        const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
        data[i] = gray + saturation * (data[i] - gray);
        data[i + 1] = gray + saturation * (data[i + 1] - gray);
        data[i + 2] = gray + saturation * (data[i + 2] - gray);
    }

    return imageData;
}

// Reset demo
function resetDemo() {
    if (demoController) {
        demoController.isProcessing = false;

        if (demoController.animationFrame) {
            cancelAnimationFrame(demoController.animationFrame);
        }

        // Reset sliders
        document.getElementById('intensitySlider').value = 80;
        document.getElementById('intensityValue').textContent = '80%';
        document.getElementById('edgeSlider').value = 50;
        document.getElementById('edgeValue').textContent = '50%';
        document.getElementById('saturationSlider').value = 100;
        document.getElementById('saturationValue').textContent = '100%';
        document.getElementById('textureSlider').value = 60;
        document.getElementById('textureValue').textContent = '60%';

        showNotification('Demo reset!', 'info');
    }
}

// Load sample video
function loadSampleVideo(type) {
    const sampleVideos = {
        portrait: 'Sample portrait video',
        landscape: 'Sample landscape video',
        urban: 'Sample urban scene',
        nature: 'Sample nature video',
        pet: 'Sample pet video',
        sports: 'Sample sports video'
    };

    showNotification(`Loading ${sampleVideos[type]}...`, 'info');

    // In production, load actual sample video
    setTimeout(() => {
        switchTab('webcam');
        showNotification('Sample loaded! Click Start Processing', 'success');
    }, 1000);
}

// Play/pause toggle
function togglePlay() {
    if (demoController && demoController.demoVideo) {
        const video = demoController.demoVideo;
        const icon = document.getElementById('playIcon');

        if (video.paused) {
            video.play();
            if (icon) icon.className = 'fas fa-pause';
        } else {
            video.pause();
            if (icon) icon.className = 'fas fa-play';
        }
    }
}

// Privacy-Friendly Usage Analytics (Client-Side Only)

class AnalyticsTracker {
    constructor() {
        this.session = {
            id: this.generateSessionId(),
            startTime: Date.now(),
            events: [],
            styles: {},
            features: {}
        };

        this.load();
    }

    generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    trackEvent(category, action, label = '', value = 0) {
        const event = {
            timestamp: Date.now(),
            category,
            action,
            label,
            value
        };

        this.session.events.push(event);
        this.save();

        console.log('📊 Analytics:', event);
    }

    trackStyleUsage(styleName) {
        if (!this.session.styles[styleName]) {
            this.session.styles[styleName] = 0;
        }
        this.session.styles[styleName]++;
        this.save();

        this.trackEvent('Style', 'Applied', styleName, 1);
    }

    trackFeatureUsage(featureName) {
        if (!this.session.features[featureName]) {
            this.session.features[featureName] = 0;
        }
        this.session.features[featureName]++;
        this.save();

        this.trackEvent('Feature', 'Used', featureName, 1);
    }

    trackPageView(pageName) {
        this.trackEvent('Navigation', 'PageView', pageName);
    }

    trackVideoProcessing(duration, fps, resolution) {
        this.trackEvent('Processing', 'VideoComplete', `${resolution}@${fps}fps`, duration);
    }

    trackExport(format, quality) {
        this.trackEvent('Export', 'Downloaded', `${format}_${quality}`, 1);
    }

    getSessionStats() {
        return {
            duration: Date.now() - this.session.startTime,
            eventsCount: this.session.events.length,
            mostUsedStyle: this.getMostUsed(this.session.styles),
            mostUsedFeature: this.getMostUsed(this.session.features)
        };
    }

    getMostUsed(obj) {
        let maxKey = null;
        let maxValue = 0;

        for (const [key, value] of Object.entries(obj)) {
            if (value > maxValue) {
                maxValue = value;
                maxKey = key;
            }
        }

        return maxKey;
    }

    save() {
        try {
            localStorage.setItem('videoStyleAI_analytics', JSON.stringify(this.session));
        } catch (e) {
            console.warn('Could not save analytics:', e);
        }
    }

    load() {
        try {
            const saved = localStorage.getItem('videoStyleAI_analytics');
            if (saved) {
                const data = JSON.parse(saved);
                // Merge with current session
                this.session.styles = data.styles || {};
                this.session.features = data.features || {};
            }
        } catch (e) {
            console.warn('Could not load analytics:', e);
        }
    }

    clear() {
        this.session.events = [];
        this.session.styles = {};
        this.session.features = {};
        this.save();
    }

    // Generate usage report
    generateReport() {
        const stats = this.getSessionStats();
        const totalStyles = Object.values(this.session.styles).reduce((a, b) => a + b, 0);
        const totalFeatures = Object.values(this.session.features).reduce((a, b) => a + b, 0);

        return {
            session: {
                id: this.session.id,
                duration: this.formatDuration(stats.duration),
                events: stats.eventsCount
            },
            styles: {
                total: totalStyles,
                mostUsed: stats.mostUsedStyle,
                breakdown: this.session.styles
            },
            features: {
                total: totalFeatures,
                mostUsed: stats.mostUsedFeature,
                breakdown: this.session.features
            }
        };
    }

    formatDuration(ms) {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);

        if (hours > 0) {
            return `${hours}h ${minutes % 60}m`;
        } else if (minutes > 0) {
            return `${minutes}m ${seconds % 60}s`;
        } else {
            return `${seconds}s`;
        }
    }
}

// Global analytics instance
const analytics = new AnalyticsTracker();

// Track page views automatically
document.addEventListener('DOMContentLoaded', () => {
    const pageName = document.title.split(' - ')[0] || 'Home';
    analytics.trackPageView(pageName);
});

// Track link clicks
document.addEventListener('click', (e) => {
    const link = e.target.closest('a');
    if (link && link.href) {
        const url = new URL(link.href);
        if (url.hostname === window.location.hostname) {
            analytics.trackEvent('Navigation', 'LinkClick', url.pathname);
        }
    }
});

// Track button clicks
document.addEventListener('click', (e) => {
    const button = e.target.closest('button');
    if (button) {
        const text = button.textContent.trim().substring(0, 50);
        analytics.trackEvent('Interaction', 'ButtonClick', text);
    }
});

/* Enhanced styles for new features */
