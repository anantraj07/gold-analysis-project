/* ============================================
   GOLD PRICE ANALYSIS - MAIN.JS (FIXED)
   ============================================ */

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

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            mobileMenuToggle.classList.remove('active');
        });
    });
}

document.addEventListener('click', (e) => {
    if (!e.target.closest('.nav-container')) {
        navMenu?.classList.remove('active');
        mobileMenuToggle?.classList.remove('active');
    }
});

navMenu?.addEventListener('click', (e) => {
    e.stopPropagation();
});

// ============================================
// TAB FUNCTIONALITY - FIXED
// ============================================

function initTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    if (tabButtons.length === 0 || tabContents.length === 0) return;
    
    // Hide all tabs initially
    tabContents.forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Show first tab
    if (tabContents[0]) {
        tabContents[0].classList.add('active');
    }
    if (tabButtons[0]) {
        tabButtons[0].classList.add('active');
    }
    
    // Add click handlers
    tabButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const tabName = this.getAttribute('data-tab');
            
            // Remove active from all
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Add active to selected
            this.classList.add('active');
            const selectedTab = document.getElementById(tabName);
            if (selectedTab) {
                selectedTab.classList.add('active');
                
                // Resize charts after tab switch
                setTimeout(() => {
                    window.dispatchEvent(new Event('resize'));
                    if (window.chartManager) {
                        Object.values(window.chartManager.charts).forEach(chart => {
                            if (chart && typeof chart.resize === 'function') {
                                chart.resize();
                            }
                        });
                    }
                }, 150);
            }
        });
    });
}

// Initialize tabs when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTabs);
} else {
    initTabs();
}

// Also init on window load
window.addEventListener('load', () => {
    setTimeout(initTabs, 100);
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
                    chart.resize();
                }
            });
        }
    }, 250);
});

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

// Accessibility improvements
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navMenu?.classList.contains('active')) {
        navMenu.classList.remove('active');
        mobileMenuToggle?.classList.remove('active');
    }
});

// Error handling for images
document.querySelectorAll('img').forEach(img => {
    img.addEventListener('error', function() {
        this.style.display = 'none';
    });
});

console.log('%c💰 Gold Price Analysis - Statistical Methods I', 
    'color: #FFD700; font-size: 16px; font-weight: bold;');
console.log('%cAll systems operational', 
    'color: #00ff00; font-size: 12px;');
