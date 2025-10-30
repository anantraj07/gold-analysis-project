/* ============================================
   GOLD PRICE ANALYSIS - THEME.JS (FIXED)
   Theme Toggle Functionality with Bug Fixes
   ============================================ */

class ThemeManager {
    constructor() {
        this.THEME_KEY = 'goldAnalysisTheme';
        this.DARK_THEME = 'dark';
        this.LIGHT_THEME = 'light';
        this.themeToggle = document.getElementById('themeToggle');
        this.init();
    }

    init() {
        // Load saved theme or default to dark
        const savedTheme = this.getSavedTheme();
        this.applyTheme(savedTheme);
        
        // Add click listener - FIX: Ensure it's properly bound
        if (this.themeToggle) {
            this.themeToggle.addEventListener('click', () => this.toggleTheme());
            console.log('Theme toggle initialized ✅');
        } else {
            console.warn('Theme toggle button not found!');
        }

        // Listen for system theme changes
        if (window.matchMedia) {
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
                if (!this.hasUserPreference()) {
                    this.applyTheme(e.matches ? this.DARK_THEME : this.LIGHT_THEME);
                }
            });
        }
    }

    getSavedTheme() {
        // Try to get from localStorage
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

    applyTheme(theme) {
        const isDark = theme === this.DARK_THEME;
        const body = document.body;

        // FIX: Apply to body instead of documentElement for better compatibility
        if (isDark) {
            body.classList.remove('light-theme');
        } else {
            body.classList.add('light-theme');
        }

        // Update toggle button icon
        if (this.themeToggle) {
            const iconElement = this.themeToggle.querySelector('.theme-icon');
            if (iconElement) {
                iconElement.textContent = isDark ? '☀️' : '🌙';
            }
            this.themeToggle.setAttribute('title', isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode');
            this.themeToggle.setAttribute('aria-label', isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode');
        }

        // Save preference
        try {
            localStorage.setItem(this.THEME_KEY, theme);
        } catch (e) {
            console.warn('Could not save theme preference:', e);
        }

        // Update CSS custom properties
        this.updateCSSVariables(isDark);

        console.log(`Theme applied: ${theme}`);
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
        } else {
            root.style.setProperty('--dark-bg', '#ffffff');
            root.style.setProperty('--light-bg', '#f8f9fa');
            root.style.setProperty('--text-light', '#1a1a1a');
            root.style.setProperty('--text-muted', '#666666');
            root.style.setProperty('--accent-cyan', '#0066cc');
            root.style.setProperty('--accent-orange', '#cc6600');
            root.style.setProperty('--border-color', '#dddddd');
        }
    }

    toggleTheme() {
        const currentTheme = this.getCurrentTheme();
        const newTheme = currentTheme === this.DARK_THEME ? this.LIGHT_THEME : this.DARK_THEME;
        
        console.log(`Toggling theme from ${currentTheme} to ${newTheme}`);
        
        this.applyTheme(newTheme);

        // Trigger chart redraw if charts exist
        if (window.chartManager) {
            setTimeout(() => {
                console.log('Updating charts for new theme...');
                window.chartManager.updateChartsTheme();
                window.dispatchEvent(new Event('resize'));
            }, 100);
        }

        // Dispatch custom event
        window.dispatchEvent(new CustomEvent('themeChanged', { 
            detail: { theme: newTheme } 
        }));
    }

    getCurrentTheme() {
        return document.body.classList.contains('light-theme') 
            ? this.LIGHT_THEME 
            : this.DARK_THEME;
    }

    // Get current color scheme
    getColors() {
        const isDark = this.getCurrentTheme() === this.DARK_THEME;
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
            green: '#00ff00',
            red: '#ff6b6b',
            isDark
        };
    }
}

// Initialize theme manager when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.themeManager = new ThemeManager();
        console.log('ThemeManager initialized on DOMContentLoaded');
    });
} else {
    window.themeManager = new ThemeManager();
    console.log('ThemeManager initialized immediately');
}
