// Smooth scrolling for navigation links
document.addEventListener('DOMContentLoaded', () => {
    // Mobile menu toggle
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('navMenu');

    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            hamburger.classList.toggle('active');
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
                navMenu.classList.remove('active');
                hamburger.classList.remove('active');
            }
        });

        // Close menu when clicking a link
        navMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                hamburger.classList.remove('active');
            });
        });
    }

    // Stats counter animation
    const stats = document.querySelectorAll('.stat-number');
    const observerOptions = {
        threshold: 0.5,
        rootMargin: '0px'
    };

    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = parseInt(entry.target.getAttribute('data-target'));
                animateCounter(entry.target, target);
                statsObserver.unobserve(entry.target);
            }
        });
    }, observerOptions);

    stats.forEach(stat => {
        statsObserver.observe(stat);
    });

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href !== '#' && href !== '') {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    });

    // Add scroll effect to navbar
    let lastScroll = 0;
    const navbar = document.querySelector('.navbar');

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;

        if (currentScroll > 100) {
            navbar.style.boxShadow = '0 5px 20px rgba(0, 0, 0, 0.15)';
        } else {
            navbar.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
        }

        lastScroll = currentScroll;
    });

    // Lazy loading for images
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.getAttribute('data-src');
                img.removeAttribute('data-src');
                imageObserver.unobserve(img);
            }
        });
    });

    images.forEach(img => imageObserver.observe(img));

    // Add animation to feature cards
    const featureCards = document.querySelectorAll('.feature-card, .gallery-item, .team-member');
    const cardObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '0';
                entry.target.style.transform = 'translateY(30px)';

                setTimeout(() => {
                    entry.target.style.transition = 'all 0.6s ease';
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }, 100);

                cardObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    featureCards.forEach(card => cardObserver.observe(card));

    // Initialize tooltips
    initializeTooltips();

    // Add loading animation
    window.addEventListener('load', () => {
        document.body.classList.add('loaded');
    });
});

// Counter animation function
function animateCounter(element, target) {
    let current = 0;
    const increment = target / 50;
    const duration = 2000;
    const stepTime = duration / 50;

    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = target;
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current);
        }
    }, stepTime);
}

// Initialize tooltips
function initializeTooltips() {
    const tooltipElements = document.querySelectorAll('[data-tooltip]');

    tooltipElements.forEach(element => {
        element.addEventListener('mouseenter', (e) => {
            const tooltip = document.createElement('div');
            tooltip.className = 'tooltip';
            tooltip.textContent = element.getAttribute('data-tooltip');
            document.body.appendChild(tooltip);

            const rect = element.getBoundingClientRect();
            tooltip.style.left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2) + 'px';
            tooltip.style.top = rect.top - tooltip.offsetHeight - 10 + 'px';

            element._tooltip = tooltip;
        });

        element.addEventListener('mouseleave', (e) => {
            if (element._tooltip) {
                element._tooltip.remove();
                element._tooltip = null;
            }
        });
    });
}

// Form validation
function validateForm(formId) {
    const form = document.getElementById(formId);
    if (!form) return true;

    const inputs = form.querySelectorAll('input[required], textarea[required], select[required]');
    let isValid = true;

    inputs.forEach(input => {
        if (!input.value.trim()) {
            input.style.borderColor = 'var(--danger-color)';
            isValid = false;
        } else {
            input.style.borderColor = 'var(--border-color)';
        }
    });

    return isValid;
}

// Copy to clipboard function
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showNotification('Copied to clipboard!', 'success');
    }).catch(err => {
        console.error('Failed to copy:', err);
        showNotification('Failed to copy', 'error');
    });
}

// Show notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;

    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        padding: 15px 25px;
        background: ${type === 'success' ? 'var(--success-color)' : type === 'error' ? 'var(--danger-color)' : 'var(--primary-color)'};
        color: white;
        border-radius: 8px;
        box-shadow: 0 5px 20px rgba(0,0,0,0.2);
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }

    @keyframes fadeIn {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    .tooltip {
        position: absolute;
        background: var(--dark-color);
        color: white;
        padding: 8px 12px;
        border-radius: 6px;
        font-size: 0.85rem;
        z-index: 10000;
        pointer-events: none;
        white-space: nowrap;
        animation: fadeIn 0.2s ease;
    }

    .tooltip::after {
        content: '';
        position: absolute;
        top: 100%;
        left: 50%;
        transform: translateX(-50%);
        border: 5px solid transparent;
        border-top-color: var(--dark-color);
    }
`;
document.head.appendChild(style);

// Prevent right-click on images (optional)
document.addEventListener('contextmenu', (e) => {
    if (e.target.tagName === 'IMG') {
        // Uncomment to prevent right-click on images
        // e.preventDefault();
    }
});

// Performance monitoring
if (window.performance && window.performance.now) {
    const loadTime = window.performance.now();
    console.log(`Page loaded in ${loadTime.toFixed(2)}ms`);
}

// Error handling
window.addEventListener('error', (e) => {
    console.error('Global error:', e.error);
});

// Unhandled promise rejection
window.addEventListener('unhandledrejection', (e) => {
    console.error('Unhandled promise rejection:', e.reason);
});

// Utility functions
const utils = {
    debounce: (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    throttle: (func, limit) => {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    formatDate: (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    },

    generateId: () => {
        return '_' + Math.random().toString(36).substr(2, 9);
    }
};

// Export utilities
window.utils = utils;

// Console welcome message
console.log('%c🎨 Video Style Transfer AI', 'font-size: 24px; font-weight: bold; color: #6366f1;');
console.log('%cWelcome to VideoStyleAI! Transform your videos with AI-powered artistic styles.', 'font-size: 14px; color: #666;');
console.log('%cPowered by TensorFlow.js', 'font-size: 12px; color: #999;');


// Documentation, API, and Support Page Interactivity

document.addEventListener('DOMContentLoaded', () => {

    // Mobile sidebar toggle for docs and API pages
    const mobileSidebarToggle = () => {
        const sidebar = document.querySelector('.docs-sidebar, .api-sidebar');
        if (sidebar && window.innerWidth < 992) {
            const heading = sidebar.querySelector('h3');
            if (heading) {
                heading.addEventListener('click', () => {
                    sidebar.classList.toggle('active');
                });
            }
        }
    };

    mobileSidebarToggle();
    window.addEventListener('resize', mobileSidebarToggle);

    // Smooth scrolling for documentation navigation
    document.querySelectorAll('.docs-menu a, .api-menu a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            const target = document.querySelector(targetId);

            if (target) {
                // Update active state
                document.querySelectorAll('.docs-menu li, .api-menu li').forEach(li => {
                    li.classList.remove('active');
                });
                link.closest('li').classList.add('active');

                // Scroll to target
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });

                // Close mobile menu
                const sidebar = document.querySelector('.docs-sidebar, .api-sidebar');
                if (sidebar && window.innerWidth < 992) {
                    sidebar.classList.remove('active');
                }
            }
        });
    });

    // Code block copy functionality
    document.querySelectorAll('.code-block').forEach(block => {
        const copyBtn = document.createElement('button');
        copyBtn.className = 'copy-code-btn';
        copyBtn.innerHTML = '<i class="fas fa-copy"></i> Copy';
        copyBtn.style.cssText = `
            position: absolute;
            top: 10px;
            right: 10px;
            background: rgba(255,255,255,0.1);
            color: white;
            border: 1px solid rgba(255,255,255,0.2);
            padding: 5px 12px;
            border-radius: 5px;
            cursor: pointer;
            font-size: 0.85rem;
            transition: all 0.3s;
        `;

        block.style.position = 'relative';
        block.appendChild(copyBtn);

        copyBtn.addEventListener('click', () => {
            const code = block.querySelector('code, pre').textContent;
            navigator.clipboard.writeText(code).then(() => {
                copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
                copyBtn.style.background = 'rgba(16, 185, 129, 0.2)';

                setTimeout(() => {
                    copyBtn.innerHTML = '<i class="fas fa-copy"></i> Copy';
                    copyBtn.style.background = 'rgba(255,255,255,0.1)';
                }, 2000);
            });
        });

        copyBtn.addEventListener('mouseenter', () => {
            copyBtn.style.background = 'rgba(255,255,255,0.2)';
        });

        copyBtn.addEventListener('mouseleave', () => {
            copyBtn.style.background = 'rgba(255,255,255,0.1)';
        });
    });

    // Search highlighting in documentation
    const docsSearch = document.getElementById('docsSearch');
    if (docsSearch) {
        docsSearch.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const sections = document.querySelectorAll('.doc-section, .api-section');

            if (searchTerm === '') {
                sections.forEach(section => {
                    section.style.display = 'block';
                });
                return;
            }

            sections.forEach(section => {
                const text = section.textContent.toLowerCase();
                if (text.includes(searchTerm)) {
                    section.style.display = 'block';
                    // Highlight matching text
                    highlightText(section, searchTerm);
                } else {
                    section.style.display = 'none';
                }
            });
        });
    }

    function highlightText(element, searchTerm) {
        // Simple highlight implementation
        // In production, use a proper highlighting library
    }

});

// Cookie Settings Functionality

function openCookieSettings() {
    // Create modal
    const modal = document.createElement('div');
    modal.className = 'cookie-settings-modal active';
    modal.innerHTML = `
        <div class="cookie-settings-content">
            <h3><i class="fas fa-cookie-bite"></i> Cookie Settings</h3>
            <p>Manage your cookie preferences below:</p>

            <div class="cookie-toggle">
                <div>
                    <label><strong>Essential Cookies</strong></label>
                    <p style="font-size: 0.9rem; color: #6b7280; margin: 0.5rem 0 0 0;">
                        Required for the website to function
                    </p>
                </div>
                <input type="checkbox" checked disabled>
            </div>

            <div class="cookie-toggle">
                <div>
                    <label><strong>Performance Cookies</strong></label>
                    <p style="font-size: 0.9rem; color: #6b7280; margin: 0.5rem 0 0 0;">
                        Help us improve website performance
                    </p>
                </div>
                <input type="checkbox" id="performanceCookies" checked>
            </div>

            <div class="cookie-toggle">
                <div>
                    <label><strong>Functional Cookies</strong></label>
                    <p style="font-size: 0.9rem; color: #6b7280; margin: 0.5rem 0 0 0;">
                        Remember your preferences
                    </p>
                </div>
                <input type="checkbox" id="functionalCookies" checked>
            </div>

            <div class="cookie-toggle">
                <div>
                    <label><strong>Analytics Cookies</strong></label>
                    <p style="font-size: 0.9rem; color: #6b7280; margin: 0.5rem 0 0 0;">
                        Understand how you use our service
                    </p>
                </div>
                <input type="checkbox" id="analyticsCookies" checked>
            </div>

            <div style="display: flex; gap: 1rem; margin-top: 2rem;">
                <button class="btn btn-primary" onclick="saveCookieSettings(this)">
                    <i class="fas fa-save"></i> Save Preferences
                </button>
                <button class="btn btn-secondary" onclick="closeCookieSettings(this)">
                    Cancel
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // Close on background click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

function saveCookieSettings(btn) {
    const performance = document.getElementById('performanceCookies').checked;
    const functional = document.getElementById('functionalCookies').checked;
    const analytics = document.getElementById('analyticsCookies').checked;

    // Save to localStorage
    localStorage.setItem('cookiePreferences', JSON.stringify({
        performance,
        functional,
        analytics,
        timestamp: Date.now()
    }));

    // Show success message
    if (typeof showNotification === 'function') {
        showNotification('Cookie preferences saved successfully!', 'success');
    } else {
        alert('Cookie preferences saved!');
    }

    // Close modal
    btn.closest('.cookie-settings-modal').remove();
}

function closeCookieSettings(btn) {
    btn.closest('.cookie-settings-modal').remove();
}

// Add data-label attributes for responsive tables
document.addEventListener('DOMContentLoaded', () => {
    const cookiesTables = document.querySelectorAll('.cookies-table');

    cookiesTables.forEach(table => {
        const headers = Array.from(table.querySelectorAll('thead th')).map(th => th.textContent);

        table.querySelectorAll('tbody tr').forEach(row => {
            Array.from(row.querySelectorAll('td')).forEach((cell, index) => {
                cell.setAttribute('data-label', headers[index]);
            });
        });
    });
});
