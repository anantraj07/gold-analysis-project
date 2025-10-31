/* ============================================
   GOLD PRICE ANALYSIS - MAIN.JS
   Mobile-First Optimized - TAB FIX FOR NO OVERLAPPING
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

// ============================================
// TAB FUNCTIONALITY - CRITICAL FIX FOR NO OVERLAPPING
// ============================================

document.querySelectorAll('.tab-btn').forEach(button => {
    button.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        const tabName = button.getAttribute('data-tab');
        
        console.log('Switching to tab:', tabName);
        
        // STEP 1: Remove active from ALL buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // STEP 2: Hide ALL tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.style.display = 'none';
            content.classList.remove('active');
            content.style.visibility = 'hidden';
            content.style.opacity = '0';
            content.style.pointerEvents = 'none';
        });
        
        // STEP 3: Add active to clicked button
        button.classList.add('active');
        
        // STEP 4: Show ONLY selected tab content
        const tabContent = document.getElementById(tabName);
        if (tabContent) {
            console.log('Showing tab content:', tabName);
            
            tabContent.style.display = 'block';
            tabContent.classList.add('active');
            tabContent.style.visibility = 'visible';
            tabContent.style.opacity = '1';
            tabContent.style.pointerEvents = 'auto';
            tabContent.style.width = '100%';
            tabContent.style.zIndex = '4';
            
            // STEP 5: Scroll to content on mobile
            if (window.innerWidth < 768) {
                setTimeout(() => {
                    const tabSection = tabContent.closest('.stats-section');
                    if (tabSection) {
                        tabSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                }, 100);
            }
            
            // STEP 6: Force chart resize
            setTimeout(() => {
                console.log('Resizing charts');
                window.dispatchEvent(new Event('resize'));
                
                // Redraw all charts
                if (window.chartManager) {
                    Object.values(window.chartManager.charts).forEach(chart => {
                        if (chart && typeof chart.resize === 'function') {
                            try {
                                chart.resize();
                            } catch(err) {
                                console.log('Chart resize error:', err);
                            }
                        }
                    });
                }
            }, 200);
        } else {
            console.warn('Tab content not found:', tabName);
        }
    });
});

// Set first tab as active on page load
window.addEventListener('load', () => {
    console.log('Page loaded - initializing tabs');
    
    const firstBtn = document.querySelector('.tab-btn');
    const firstContent = document.querySelector('.tab-content');
    
    if (firstBtn && firstContent) {
        // Make sure all tabs are hidden first
        document.querySelectorAll('.tab-content').forEach(content => {
            content.style.display = 'none';
            content.classList.remove('active');
        });
        
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Activate first tab
        firstBtn.classList.add('active');
        firstContent.style.display = 'block';
        firstContent.classList.add('active');
        
        console.log('First tab activated');
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
                const offset = 80;
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

window.addEventListener('load', updateActiveLink);
window.addEventListener('popstate', updateActiveLink);

// Responsive Chart Handling
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        if (window.chartManager) {
            Object.values(window.chartManager.charts).forEach(chart => {
                if (chart && typeof chart.resize === 'function') {
                    try {
                        chart.resize();
                    } catch(err) {
                        console.log('Chart resize error on resize event:', err);
                    }
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
    
    if (Math.abs(diff) > swipeThreshold) {
        // Swipe detected
    }
}

// Utility Functions
const utils = {
    formatCurrency: (value) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value);
    },

    formatDate: (date) => {
        return new Intl.DateTimeFormat('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        }).format(new Date(date));
    },

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

    percentageChange: (oldValue, newValue) => {
        return (((newValue - oldValue) / oldValue) * 100).toFixed(2);
    },

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

    isMobile: () => {
        return window.innerWidth < 768;
    },

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
console.log('%cTab System: All overlapping issues fixed!', 
    'color: #00ff00; font-size: 12px; font-weight: bold');

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
