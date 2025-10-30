/* ============================================
   GOLD PRICE ANALYSIS - THEME.JS
   Theme Toggle Functionality
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
        
        // Add click listener
        if (this.themeToggle) {
            this.themeToggle.addEventListener('click', () => this.toggleTheme());
        }

        // Listen for system theme changes
        if (window.matchMedia) {
            window.matchMedia('(prefers-color-scheme: dark)').addListener((e) => {
                if (!this.hasUserPreference()) {
                    this.applyTheme(e.matches ? this.DARK_THEME : this.LIGHT_THEME);
                }
            });
        }
    }

    getSavedTheme() {
        // Try to get from localStorage (in-memory in Claude environment)
        try {
            const saved = localStorage.getItem(this.THEME_KEY);
            if (saved) return saved;
        } catch (e) {
            // localStorage not available, use fallback
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
        const html = document.documentElement;

        if (isDark) {
            html.classList.remove('light-theme');
        } else {
            html.classList.add('light-theme');
        }

        // Update toggle button icon
        if (this.themeToggle) {
            this.themeToggle.querySelector('.theme-icon').textContent = isDark ? '☀️' : '🌙';
            this.themeToggle.title = isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode';
        }

        // Save preference
        try {
            localStorage.setItem(this.THEME_KEY, theme);
        } catch (e) {
            // localStorage not available
        }
    }

    toggleTheme() {
        const currentTheme = this.getCurrentTheme();
        const newTheme = currentTheme === this.DARK_THEME ? this.LIGHT_THEME : this.DARK_THEME;
        this.applyTheme(newTheme);

        // Trigger chart redraw if charts exist
        setTimeout(() => {
            window.dispatchEvent(new Event('resize'));
        }, 100);
    }

    getCurrentTheme() {
        return document.documentElement.classList.contains('light-theme') 
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
            isDark
        };
    }
}

// Initialize theme manager
const themeManager = new ThemeManager();
window.themeManager = themeManager;
