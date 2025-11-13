class VideoRecorder {
    constructor() {
        this.mediaRecorder = null;
        this.recordedChunks = [];
        this.isRecording = false;
        this.stream = null;
        this.startTime = null;
        this.recordingDuration = 0;
        this.timerInterval = null;
    }

    async startRecording(canvasElement) {
        try {
            // Get canvas stream
            this.stream = canvasElement.captureStream(30); // 30 FPS

            // Check for supported MIME types
            const mimeType = this.getSupportedMimeType();

            // Create MediaRecorder
            this.mediaRecorder = new MediaRecorder(this.stream, {
                mimeType: mimeType,
                videoBitsPerSecond: 5000000 // 5 Mbps
            });

            // Handle data available
            this.mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    this.recordedChunks.push(event.data);
                }
            };

            // Handle stop
            this.mediaRecorder.onstop = () => {
                this.saveRecording();
            };

            // Start recording
            this.mediaRecorder.start(100); // Collect data every 100ms
            this.isRecording = true;
            this.startTime = Date.now();

            // Start timer
            this.startTimer();

            console.log('Recording started with', mimeType);
            this.showNotification('Recording started!', 'success');

            return true;
        } catch (error) {
            console.error('Error starting recording:', error);
            this.showNotification('Failed to start recording', 'error');
            return false;
        }
    }

    stopRecording() {
        if (this.mediaRecorder && this.isRecording) {
            this.mediaRecorder.stop();
            this.isRecording = false;
            this.stopTimer();

            // Stop all tracks
            if (this.stream) {
                this.stream.getTracks().forEach(track => track.stop());
            }

            console.log('Recording stopped');
            this.showNotification('Recording stopped! Preparing download...', 'info');
        }
    }

    saveRecording() {
        if (this.recordedChunks.length === 0) {
            this.showNotification('No data to save', 'error');
            return;
        }

        // Create blob from chunks
        const blob = new Blob(this.recordedChunks, {
            type: this.getSupportedMimeType()
        });

        // Create download link
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `stylized-video-${Date.now()}.webm`;

        document.body.appendChild(a);
        a.click();

        // Cleanup
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 100);

        // Reset
        this.recordedChunks = [];
        this.showNotification('Video downloaded successfully!', 'success');
    }

    getSupportedMimeType() {
        const types = [
            'video/webm;codecs=vp9,opus',
            'video/webm;codecs=vp8,opus',
            'video/webm;codecs=h264,opus',
            'video/webm'
        ];

        for (const type of types) {
            if (MediaRecorder.isTypeSupported(type)) {
                return type;
            }
        }

        return 'video/webm';
    }

    startTimer() {
        this.timerInterval = setInterval(() => {
            this.recordingDuration = Math.floor((Date.now() - this.startTime) / 1000);
            this.updateTimerDisplay();
        }, 1000);
    }

    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
        this.recordingDuration = 0;
    }

    updateTimerDisplay() {
        const minutes = Math.floor(this.recordingDuration / 60);
        const seconds = this.recordingDuration % 60;
        const display = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

        const timerElement = document.getElementById('recordingTimer');
        if (timerElement) {
            timerElement.textContent = display;
        }
    }

    showNotification(message, type) {
        if (typeof showNotification === 'function') {
            showNotification(message, type);
        } else {
            console.log(`[${type}] ${message}`);
        }
    }

    // Screenshot capture
    captureFrame(canvasElement) {
        try {
            canvasElement.toBlob((blob) => {
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `stylized-frame-${Date.now()}.png`;
                a.click();
                URL.revokeObjectURL(url);

                this.showNotification('Frame captured!', 'success');
            }, 'image/png');
        } catch (error) {
            console.error('Error capturing frame:', error);
            this.showNotification('Failed to capture frame', 'error');
        }
    }

    // Export with quality options
    async exportWithQuality(canvasElement, quality = 'high') {
        const qualitySettings = {
            'low': { scale: 0.5, bitrate: 2000000 },
            'medium': { scale: 0.75, bitrate: 3500000 },
            'high': { scale: 1.0, bitrate: 5000000 },
            'ultra': { scale: 1.0, bitrate: 8000000 }
        };

        const settings = qualitySettings[quality] || qualitySettings['high'];

        // Create temporary canvas with scaled dimensions
        const tempCanvas = document.createElement('canvas');
        const ctx = tempCanvas.getContext('2d');

        tempCanvas.width = canvasElement.width * settings.scale;
        tempCanvas.height = canvasElement.height * settings.scale;

        ctx.drawImage(canvasElement, 0, 0, tempCanvas.width, tempCanvas.height);

        // Start recording with scaled canvas
        const stream = tempCanvas.captureStream(30);
        const recorder = new MediaRecorder(stream, {
            mimeType: this.getSupportedMimeType(),
            videoBitsPerSecond: settings.bitrate
        });

        const chunks = [];

        recorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                chunks.push(event.data);
            }
        };

        return new Promise((resolve) => {
            recorder.onstop = () => {
                const blob = new Blob(chunks, { type: this.getSupportedMimeType() });
                resolve(blob);
            };

            recorder.start();

            // Record for specified duration or until stopped
            setTimeout(() => {
                recorder.stop();
            }, this.recordingDuration * 1000 || 10000);
        });
    }
}

// Global recorder instance
const videoRecorder = new VideoRecorder();

// Helper functions for UI integration
function recordVideo() {
    const canvas = document.getElementById('stylizedCanvas') || document.getElementById('demoCanvas');

    if (!canvas) {
        alert('No canvas element found');
        return;
    }

    if (!videoRecorder.isRecording) {
        videoRecorder.startRecording(canvas);

        // Update UI
        const recordBtn = document.querySelector('[onclick="recordVideo()"]');
        if (recordBtn) {
            recordBtn.innerHTML = '<i class="fas fa-stop"></i> Stop Recording';
            recordBtn.classList.remove('btn-success');
            recordBtn.classList.add('btn-danger');
        }

        // Show recording indicator
        showRecordingIndicator(true);
    } else {
        videoRecorder.stopRecording();

        // Update UI
        const recordBtn = document.querySelector('[onclick="recordVideo()"]');
        if (recordBtn) {
            recordBtn.innerHTML = '<i class="fas fa-record-vinyl"></i> Record Video';
            recordBtn.classList.remove('btn-danger');
            recordBtn.classList.add('btn-success');
        }

        // Hide recording indicator
        showRecordingIndicator(false);
    }
}

function captureSnapshot() {
    const canvas = document.getElementById('stylizedCanvas') || document.getElementById('demoCanvas');

    if (!canvas) {
        alert('No canvas element found');
        return;
    }

    videoRecorder.captureFrame(canvas);
}

function showRecordingIndicator(show) {
    let indicator = document.getElementById('recordingIndicator');

    if (show && !indicator) {
        indicator = document.createElement('div');
        indicator.id = 'recordingIndicator';
        indicator.innerHTML = `
            <div style="position: fixed; top: 80px; right: 20px; background: rgba(239, 68, 68, 0.9);
                        color: white; padding: 10px 20px; border-radius: 25px;
                        box-shadow: 0 5px 20px rgba(239, 68, 68, 0.4); z-index: 1000;
                        display: flex; align-items: center; gap: 10px; font-weight: 600;">
                <span class="recording-dot" style="width: 12px; height: 12px; background: white;
                                                   border-radius: 50%; animation: pulse 1.5s infinite;"></span>
                REC <span id="recordingTimer">00:00</span>
            </div>
        `;
        document.body.appendChild(indicator);

        // Add pulse animation
        if (!document.getElementById('pulseAnimation')) {
            const style = document.createElement('style');
            style.id = 'pulseAnimation';
            style.textContent = `
                @keyframes pulse {
                    0%, 100% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.5; transform: scale(0.8); }
                }
            `;
            document.head.appendChild(style);
        }
    } else if (!show && indicator) {
        indicator.remove();
    }
}

// Export quality dialog
function showExportDialog() {
    const dialog = document.createElement('div');
    dialog.innerHTML = `
        <div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0;
                    background: rgba(0,0,0,0.7); z-index: 10000;
                    display: flex; align-items: center; justify-content: center;"
             onclick="this.remove()">
            <div style="background: white; padding: 30px; border-radius: 15px;
                        max-width: 400px; width: 90%;" onclick="event.stopPropagation()">
                <h3 style="margin-bottom: 20px;">Export Quality</h3>
                <div style="display: flex; flex-direction: column; gap: 10px;">
                    <button onclick="exportVideo('low'); this.closest('div').closest('div').remove()"
                            style="padding: 15px; border: 2px solid #e5e7eb; border-radius: 8px;
                                   background: white; cursor: pointer; text-align: left;">
                        <strong>Low (720p)</strong><br>
                        <small>Smaller file size, faster export</small>
                    </button>
                    <button onclick="exportVideo('medium'); this.closest('div').closest('div').remove()"
                            style="padding: 15px; border: 2px solid #e5e7eb; border-radius: 8px;
                                   background: white; cursor: pointer; text-align: left;">
                        <strong>Medium (1080p)</strong><br>
                        <small>Balanced quality and size</small>
                    </button>
                    <button onclick="exportVideo('high'); this.closest('div').closest('div').remove()"
                            style="padding: 15px; border: 2px solid #6366f1; border-radius: 8px;
                                   background: white; cursor: pointer; text-align: left;">
                        <strong>High (1080p+)</strong><br>
                        <small>Best quality (Recommended)</small>
                    </button>
                    <button onclick="exportVideo('ultra'); this.closest('div').closest('div').remove()"
                            style="padding: 15px; border: 2px solid #e5e7eb; border-radius: 8px;
                                   background: white; cursor: pointer; text-align: left;">
                        <strong>Ultra (4K)</strong><br>
                        <small>Maximum quality, larger file</small>
                    </button>
                </div>
                <button onclick="this.closest('div').closest('div').remove()"
                        style="margin-top: 20px; padding: 10px 20px; background: #e5e7eb;
                               border: none; border-radius: 8px; cursor: pointer; width: 100%;">
                    Cancel
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(dialog);
}

async function exportVideo(quality) {
    const canvas = document.getElementById('stylizedCanvas') || document.getElementById('demoCanvas');
    showNotification(`Exporting in ${quality} quality...`, 'info');

    try {
        const blob = await videoRecorder.exportWithQuality(canvas, quality);
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `stylized-video-${quality}-${Date.now()}.webm`;
        a.click();
        URL.revokeObjectURL(url);

        showNotification('Export complete!', 'success');
    } catch (error) {
        console.error('Export error:', error);
        showNotification('Export failed', 'error');
    }
}
