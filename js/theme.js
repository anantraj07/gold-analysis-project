/* ============================================
   GOLD PRICE ANALYSIS - THEME.JS (FIXED)
   Theme Toggle with Proper Navigation Support
   ============================================ */

class ThemeManager {
    constructor() {
        this.THEME_KEY = 'goldAnalysisTheme';
        this.DARK_THEME = 'dark';
        this.LIGHT_THEME = 'light';
        this.themeToggle = null;
        this.init();
    }

    init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }

    setup() {
        this.themeToggle = document.getElementById('themeToggle');
        
        // Load saved theme or default to dark
        const savedTheme = this.getSavedTheme();
        this.applyTheme(savedTheme, false);
        
        // Add click listener
        if (this.themeToggle) {
            this.themeToggle.addEventListener('click', () => this.toggleTheme());
            console.log('✅ Theme toggle initialized');
        } else {
            console.warn('⚠️ Theme toggle button not found! Make sure element with id="themeToggle" exists');
        }

        // Listen for system theme changes
        if (window.matchMedia) {
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
                if (!this.hasUserPreference()) {
                    this.applyTheme(e.matches ? this.DARK_THEME : this.LIGHT_THEME, true);
                }
            });
        }

        console.log('🎨 ThemeManager initialized');
    }

    getSavedTheme() {
        try {
            const saved = localStorage.getItem(this.THEME_KEY);
            if (saved) return saved;
        } catch (e) {
            console.warn('localStorage not available:', e);
        }

        // Check system preference
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
            return this.LIGHT_THEME;
        }

        return this.DARK_THEME;
    }

    hasUserPreference() {
        try {
            return localStorage.getItem(this.THEME_KEY) !== null;
        } catch (e) {
            return false;
        }
    }

    applyTheme(theme, updateCharts = true) {
        const isDark = theme === this.DARK_THEME;
        const body = document.body;

        // Apply theme class
        if (isDark) {
            body.classList.remove('light-theme');
            body.classList.add('dark-theme');
        } else {
            body.classList.remove('dark-theme');
            body.classList.add('light-theme');
        }

        // Update toggle button
        this.updateToggleButton(isDark);

        // Update CSS variables
        this.updateCSSVariables(isDark);

        // Save preference
        try {
            localStorage.setItem(this.THEME_KEY, theme);
        } catch (e) {
            console.warn('Could not save theme preference:', e);
        }

        // Update charts if needed
        if (updateCharts && window.chartManager) {
            setTimeout(() => {
                window.chartManager.updateChartsTheme();
            }, 100);
        }

        console.log(`Theme applied: ${theme}`);
    }

    updateToggleButton(isDark) {
        if (!this.themeToggle) {
            this.themeToggle = document.getElementById('themeToggle');
        }

        if (this.themeToggle) {
            const iconElement = this.themeToggle.querySelector('.theme-icon');
            if (iconElement) {
                iconElement.textContent = isDark ? '☀️' : '🌙';
            }
            
            const title = isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode';
            this.themeToggle.setAttribute('title', title);
            this.themeToggle.setAttribute('aria-label', title);
        }
    }

    updateCSSVariables(isDark) {
        const root = document.documentElement;
        
        if (isDark) {
            root.style.setProperty('--dark-bg', '#0a0a0a');
            root.style.setProperty('--light-bg', '#1a1a1a');
            root.style.setProperty('--text-light', '#ffffff');
            root.style.setProperty('--text-muted', '#888888');
            root.style.setProperty('--accent-cyan', '#00ffff');
            root.style.setProperty('--accent-orange', '#FFA500');
            root.style.setProperty('--border-color', '#333333');
            root.style.setProperty('--primary-gold', '#FFD700');
            root.style.setProperty('--dark-gold', '#DAA520');
            root.style.setProperty('--hover-bg', '#2a2a2a');
        } else {
            root.style.setProperty('--dark-bg', '#ffffff');
            root.style.setProperty('--light-bg', '#f8f9fa');
            root.style.setProperty('--text-light', '#1a1a1a');
            root.style.setProperty('--text-muted', '#666666');
            root.style.setProperty('--accent-cyan', '#0066cc');
            root.style.setProperty('--accent-orange', '#cc6600');
            root.style.setProperty('--border-color', '#dddddd');
            root.style.setProperty('--primary-gold', '#FFD700');
            root.style.setProperty('--dark-gold', '#DAA520');
            root.style.setProperty('--hover-bg', '#e9ecef');
        }
    }

    toggleTheme() {
        const currentTheme = this.getCurrentTheme();
        const newTheme = currentTheme === this.DARK_THEME ? this.LIGHT_THEME : this.DARK_THEME;
        
        console.log(`🔄 Toggling theme: ${currentTheme} → ${newTheme}`);
        
        this.applyTheme(newTheme, true);

        // Dispatch custom event for other components
        window.dispatchEvent(new CustomEvent('themeChanged', { 
            detail: { 
                theme: newTheme,
                isDark: newTheme === this.DARK_THEME
            } 
        }));
    }

    getCurrentTheme() {
        return document.body.classList.contains('light-theme') 
            ? this.LIGHT_THEME 
            : this.DARK_THEME;
    }

    isDarkMode() {
        return this.getCurrentTheme() === this.DARK_THEME;
    }

    // Get current color scheme for dynamic use
    getColors() {
        const isDark = this.isDarkMode();
        return {
            primary: '#FFD700',
            darkGold: '#DAA520',
            darkBg: isDark ? '#0a0a0a' : '#ffffff',
            lightBg: isDark ? '#1a1a1a' : '#f8f9fa',
            text: isDark ? '#ffffff' : '#1a1a1a',
            textMuted: isDark ? '#888888' : '#666666',
            accentCyan: isDark ? '#00ffff' : '#0066cc',
            accentOrange: isDark ? '#FFA500' : '#cc6600',
            borderColor: isDark ? '#333333' : '#dddddd',
            hoverBg: isDark ? '#2a2a2a' : '#e9ecef',
            green: '#00ff00',
            red: '#ff6b6b',
            isDark
        };
    }
}

// Initialize theme manager
let themeManager;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        themeManager = new ThemeManager();
        window.themeManager = themeManager;
    });
} else {
    themeManager = new ThemeManager();
    window.themeManager = themeManager;
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ThemeManager;
}
