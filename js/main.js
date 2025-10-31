/* ============================================
   GOLD PRICE ANALYSIS - MAIN.JS
   Mobile-First Optimized
   ============================================ */

// DOM Elements
const mobileMenuToggle = document.getElementById('mobileMenuToggle');
const navMenu = document.getElementById('navMenu');
const navLinks = document.querySelectorAll('.nav-link');

// Mobile Menu Toggle
if (mobileMenuToggle) {
    mobileMenuToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        navMenu.classList.toggle('active');
        mobileMenuToggle.classList.toggle('active');
    });

    // Close menu when link is clicked
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            mobileMenuToggle.classList.remove('active');
        });
    });
}

// Close menu when clicking outside
document.addEventListener('click', (e) => {
    if (!e.target.closest('.nav-container')) {
        navMenu?.classList.remove('active');
        mobileMenuToggle?.classList.remove('active');
    }
});

// Prevent menu close when clicking inside menu
navMenu?.addEventListener('click', (e) => {
    e.stopPropagation();
});

// Tab Functionality with improved mobile handling
document.querySelectorAll('.tab-btn').forEach(button => {
    button.addEventListener('click', (e) => {
        const tabName = e.target.dataset.tab;
        
        // Remove active class from all buttons and contents
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        
        // Add active class to clicked button
        e.target.classList.add('active');
        
        // Show corresponding tab content
        const tabContent = document.getElementById(tabName);
        if (tabContent) {
            tabContent.classList.add('active');
            
            // Scroll to content on mobile
            if (window.innerWidth < 768) {
                setTimeout(() => {
                    tabContent.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }, 100);
            }
        }
        
        // Trigger chart redraw for proper responsive sizing
        setTimeout(() => {
            window.dispatchEvent(new Event('resize'));
            
            // Force chart.js to resize
            if (window.Chart) {
                Object.values(window.Chart.instances).forEach(chart => {
                    if (chart && chart.resize) {
                        chart.resize();
                    }
                });
            }
        }, 150);
    });
});

// Set first tab as active on page load
window.addEventListener('load', () => {
    const firstTab = document.querySelector('.tab-btn');
    if (firstTab && !document.querySelector('.tab-btn.active')) {
        firstTab.click();
    }
});

// Smooth Scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href !== '#') {
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                const offset = 80; // Account for fixed navbar
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - offset;
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        }
    });
});

// Active Link Highlighting
function updateActiveLink() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        link.classList.remove('active');
        if (href === currentPage || (currentPage === '' && href === 'index.html')) {
            link.classList.add('active');
        }
    });
}

// Run on page load and when URL changes
window.addEventListener('load', updateActiveLink);
window.addEventListener('popstate', updateActiveLink);

// Responsive Chart Handling
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        // Update all Chart.js instances
        if (window.Chart) {
            Object.values(window.Chart.instances).forEach(chart => {
                if (chart && chart.resize) {
                    chart.resize();
                }
            });
        }
    }, 250);
});

// Touch event handling for better mobile experience
let touchStartY = 0;
let touchEndY = 0;

document.addEventListener('touchstart', (e) => {
    touchStartY = e.changedTouches[0].screenY;
}, { passive: true });

document.addEventListener('touchend', (e) => {
    touchEndY = e.changedTouches[0].screenY;
    handleSwipe();
}, { passive: true });

function handleSwipe() {
    const swipeThreshold = 50;
    const diff = touchStartY - touchEndY;
    
    // Could add swipe gestures for tabs here if needed
    if (Math.abs(diff) > swipeThreshold) {
        // Swipe detected
    }
}

// Utility Functions
const utils = {
    // Format currency
    formatCurrency: (value) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value);
    },

    // Format date
    formatDate: (date) => {
        return new Intl.DateTimeFormat('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        }).format(new Date(date));
    },

    // Format large numbers
    formatNumber: (num) => {
        if (num >= 10000000) {
            return (num / 10000000).toFixed(2) + ' Cr';
        } else if (num >= 100000) {
            return (num / 100000).toFixed(2) + ' L';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(2) + 'K';
        }
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    },

    // Calculate percentage change
    percentageChange: (oldValue, newValue) => {
        return (((newValue - oldValue) / oldValue) * 100).toFixed(2);
    },

    // Debounce function for performance
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

    // Check if mobile device
    isMobile: () => {
        return window.innerWidth < 768;
    },

    // Check if tablet
    isTablet: () => {
        return window.innerWidth >= 768 && window.innerWidth < 1024;
    }
};

// Performance monitoring
const performanceMonitor = {
    logPageLoad: () => {
        if (window.performance) {
            const perfData = window.performance.timing;
            const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
            console.log(`Page load time: ${pageLoadTime}ms`);
        }
    }
};

// Run performance monitoring on load
window.addEventListener('load', () => {
    performanceMonitor.logPageLoad();
});

// Viewport height fix for mobile browsers
function setViewportHeight() {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
}

setViewportHeight();
window.addEventListener('resize', utils.debounce(setViewportHeight, 200));

// Prevent zoom on double tap for iOS
let lastTouchEnd = 0;
document.addEventListener('touchend', (e) => {
    const now = Date.now();
    if (now - lastTouchEnd <= 300) {
        e.preventDefault();
    }
    lastTouchEnd = now;
}, { passive: false });

// Export utilities globally
window.goldUtils = utils;

// Console messages
console.log('%c💰 Gold Price Analysis - Statistical Methods I', 
    'color: #FFD700; font-size: 16px; font-weight: bold; text-shadow: 2px 2px 4px rgba(0,0,0,0.5)');
console.log('%cMobile-Optimized Version • For Academic Purposes Only', 
    'color: #FFA500; font-size: 12px; font-style: italic');

// Accessibility improvements
document.addEventListener('keydown', (e) => {
    // ESC key closes mobile menu
    if (e.key === 'Escape' && navMenu?.classList.contains('active')) {
        navMenu.classList.remove('active');
        mobileMenuToggle?.classList.remove('active');
    }
    
    // Tab key navigation improvement
    if (e.key === 'Tab') {
        const focusableElements = document.querySelectorAll(
            'button, a, input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusableElements.length === 0) return;
        
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        
        if (e.shiftKey && document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
        }
    }
});

// Online/Offline status indicator
window.addEventListener('online', () => {
    console.log('Connection restored');
});

window.addEventListener('offline', () => {
    console.log('Connection lost');
});

// Error handling for images
document.querySelectorAll('img').forEach(img => {
    img.addEventListener('error', function() {
        this.style.display = 'none';
        console.warn(`Failed to load image: ${this.src}`);
    });
});

// Print optimization
window.addEventListener('beforeprint', () => {
    document.body.classList.add('printing');
});

window.addEventListener('afterprint', () => {
    document.body.classList.remove('printing');
});
