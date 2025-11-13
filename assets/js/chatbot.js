class ChatbotAssistant {
    constructor() {
        this.isOpen = false;
        this.responses = {
            greeting: [
                "Hello! I'm here to help you with video style transfer. What would you like to know?",
                "Hi there! Ready to transform your videos with AI? Ask me anything!",
                "Welcome! I can help you understand and use our video style transfer features."
            ],
            styles: [
                "We offer 6 amazing artistic styles: Starry Night (Van Gogh), The Scream (Munch), Great Wave (Hokusai), Cubist (Picasso), Impressionist (Monet), and Abstract (Kandinsky). Each style applies unique artistic transformations to your video!",
                "Our style collection includes famous artworks from master painters. You can apply these styles individually or blend multiple styles together for unique effects!"
            ],
            howto: [
                "Getting started is easy! 1) Select your video source (webcam or upload), 2) Choose an artistic style, 3) Adjust intensity and blending options, 4) Click 'Start Transfer' to see the magic happen!",
                "To use the system: Pick a video source, select your favorite art style, customize the settings, and hit start. You can capture frames or adjust settings in real-time!"
            ],
            performance: [
                "For best performance, use a modern desktop computer with WebGL support. The system processes 15-30 frames per second depending on your hardware. Close unnecessary browser tabs for optimal speed!",
                "Video style transfer is computationally intensive. We recommend using Chrome or Firefox on a computer with a dedicated GPU for the best experience."
            ],
            blending: [
                "Style blending lets you combine two artistic styles! Select a primary style, then choose a second style from the blend dropdown. Use the blend ratio slider to control how much of each style is applied. Experiment to create unique artistic effects!",
                "You can mix any two styles together using our blending feature. Try combining Starry Night with Impressionist for dreamy effects, or Cubist with Abstract for bold geometric art!"
            ],
            privacy: [
                "Your privacy is our priority! All video processing happens locally in your browser using TensorFlow.js. Your videos never leave your device, and we don't collect, store, or transmit any of your video data.",
                "Everything runs client-side - no uploads, no servers, no data collection. Your videos stay completely private on your device!"
            ],
            download: [
                "You can capture individual frames by clicking 'Capture Frame' - they'll be saved as PNG images. For full video recording, we recommend using screen recording software while the style transfer is running.",
                "To save your work, use the capture frame button to download stylized snapshots. Full video export features are coming soon!"
            ],
            technical: [
                "Our system uses TensorFlow.js and convolutional neural networks to perform real-time artistic style transfer. It's based on research from Gatys et al. and optimized for browser performance using WebGL acceleration.",
                "The technology behind this uses deep learning models trained on famous artworks. These models learn the artistic patterns and apply them to your video frames while preserving the original content structure."
            ],
            support: [
                "Need help? Make sure you've granted camera permissions, use a modern browser (Chrome/Firefox), and check that WebGL is enabled. If issues persist, try refreshing the page or contact our support team!",
                "Common solutions: 1) Clear browser cache, 2) Enable camera permissions, 3) Use a supported browser, 4) Ensure WebGL is enabled. Still having trouble? Contact us through the contact page!"
            ]
        };

        this.keywords = {
            greeting: ['hello', 'hi', 'hey', 'greetings', 'good morning', 'good afternoon', 'good evening'],
            styles: ['style', 'styles', 'art', 'artistic', 'painting', 'starry night', 'van gogh', 'picasso', 'monet', 'available', 'options'],
            howto: ['how', 'start', 'use', 'begin', 'tutorial', 'guide', 'steps', 'instructions', 'work'],
            performance: ['slow', 'fast', 'speed', 'performance', 'fps', 'lag', 'optimize', 'hardware', 'requirements'],
            blending: ['blend', 'combine', 'mix', 'merge', 'multiple styles', 'two styles'],
            privacy: ['private', 'privacy', 'secure', 'security', 'data', 'upload', 'safe', 'confidential'],
            download: ['download', 'save', 'export', 'capture', 'record', 'video file'],
            technical: ['technology', 'how it works', 'ai', 'machine learning', 'neural network', 'algorithm', 'tensorflow'],
            support: ['help', 'problem', 'issue', 'error', 'not working', 'fix', 'trouble', 'support']
        };
    }

    detectIntent(message) {
        message = message.toLowerCase();

        for (const [intent, keywords] of Object.entries(this.keywords)) {
            for (const keyword of keywords) {
                if (message.includes(keyword)) {
                    return intent;
                }
            }
        }

        return 'default';
    }

    getResponse(message) {
        const intent = this.detectIntent(message);

        if (this.responses[intent]) {
            const responses = this.responses[intent];
            return responses[Math.floor(Math.random() * responses.length)];
        }

        return "I'm here to help with video style transfer! You can ask me about available styles, how to use the system, performance tips, privacy, or any other questions. What would you like to know?";
    }

    addMessage(message, isUser = false) {
        const messagesContainer = document.getElementById('chatMessages');
        const messageDiv = document.createElement('div');
        messageDiv.className = isUser ? 'user-message' : 'bot-message';

        if (!isUser) {
            const icon = document.createElement('i');
            icon.className = 'fas fa-robot';
            messageDiv.appendChild(icon);
        }

        const textP = document.createElement('p');
        textP.textContent = message;
        messageDiv.appendChild(textP);

        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
}

// Global chatbot instance
const chatbot = new ChatbotAssistant();

// Toggle chatbot
function toggleChatbot() {
    const body = document.getElementById('chatbotBody');
    const toggle = document.getElementById('chatbotToggle');

    body.classList.toggle('collapsed');

    if (body.classList.contains('collapsed')) {
        toggle.style.transform = 'rotate(0deg)';
    } else {
        toggle.style.transform = 'rotate(180deg)';
    }
}

// Open chatbot
function openChatbot() {
    const container = document.getElementById('chatbotContainer');
    const trigger = document.querySelector('.chatbot-trigger');

    container.classList.add('active');
    trigger.style.display = 'none';
}

// Close chatbot (optional)
function closeChatbot() {
    const container = document.getElementById('chatbotContainer');
    const trigger = document.querySelector('.chatbot-trigger');

    container.classList.remove('active');
    trigger.style.display = 'flex';
}

// Send message
function sendMessage() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();

    if (message === '') return;

    // Add user message
    chatbot.addMessage(message, true);
    input.value = '';

    // Get and add bot response
    setTimeout(() => {
        const response = chatbot.getResponse(message);
        chatbot.addMessage(response, false);
    }, 500);
}

// Enter key to send
document.addEventListener('DOMContentLoaded', () => {
    const chatInput = document.getElementById('chatInput');
    if (chatInput) {
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
    }
});

// Pre-loaded quick responses
const quickResponses = [
    {
        question: "What styles are available?",
        trigger: () => {
            chatbot.addMessage("What styles are available?", true);
            setTimeout(() => {
                chatbot.addMessage(chatbot.getResponse("styles"), false);
            }, 500);
        }
    },
    {
        question: "How do I start?",
        trigger: () => {
            chatbot.addMessage("How do I start?", true);
            setTimeout(() => {
                chatbot.addMessage(chatbot.getResponse("how to start"), false);
            }, 500);
        }
    },
    {
        question: "Is my data safe?",
        trigger: () => {
            chatbot.addMessage("Is my data safe?", true);
            setTimeout(() => {
                chatbot.addMessage(chatbot.getResponse("privacy"), false);
            }, 500);
        }
    }
];
