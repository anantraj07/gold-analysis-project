/* ============================================
   GOLD PRICE ANALYSIS - CHARTS.JS
   Chart.js Visualizations
   ============================================ */

class ChartManager {
    constructor() {
        this.charts = {};
        this.chartOptions = this.getDefaultOptions();
    }

    getDefaultOptions() {
        const colors = window.themeManager ? window.themeManager.getColors() : this.getDefaultColors();
        return {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    labels: {
                        color: colors.text,
                        font: { size: 12, family: "'Segoe UI', sans-serif" }
                    }
                }
            },
            scales: {
                y: {
                    ticks: { color: colors.text },
                    grid: { color: colors.borderColor }
                },
                x: {
                    ticks: { color: colors.text },
                    grid: { color: colors.borderColor }
                }
            }
        };
    }

    getDefaultColors() {
        return {
            primary: '#FFD700',
            darkGold: '#DAA520',
            darkBg: '#0a0a0a',
            text: '#ffffff',
            textMuted: '#888888',
            accentCyan: '#00ffff',
            accentOrange: '#FFA500',
            borderColor: '#333333'
        };
    }

    createHistogram(canvasId, data) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return;

        const calc = new StatisticsCalculator(data);
        const bins = 20;
        const min = calc.min();
        const max = calc.max();
        const binWidth = (max - min) / bins;

        const binCounts = Array(bins).fill(0);
        const binLabels = [];

        for (let i = 0; i < bins; i++) {
            const binMin = min + i * binWidth;
            binLabels.push(`₹${Math.round(binMin / 1000)}k`);
        }

        data.forEach(d => {
            const val = parseFloat(d.Gold_Price_INR);
            const binIndex = Math.min(Math.floor((val - min) / binWidth), bins - 1);
            binCounts[binIndex]++;
        });

        const colors = window.themeManager.getColors();

        this.charts[canvasId] = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: binLabels,
                datasets: [{
                    label: 'Frequency',
                    data: binCounts,
                    backgroundColor: colors.primary,
                    borderColor: colors.darkGold,
                    borderWidth: 1,
                    fill: true
                }]
            },
            options: {
                ...this.chartOptions,
                plugins: {
                    ...this.chartOptions.plugins,
                    title: { display: true, text: 'Price Distribution' }
                }
            }
        });
    }

    createTrendChart(canvasId, data) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return;

        const dates = data.map(d => new Date(d.Date).toLocaleDateString('en-IN', { month: 'short', year: '2-digit' }));
        const prices = data.map(d => parseFloat(d.Gold_Price_INR));

        const colors = window.themeManager.getColors();

        this.charts[canvasId] = new Chart(ctx, {
            type: 'line',
            data: {
                labels: dates,
                datasets: [{
                    label: 'Gold Price (₹ per 10g)',
                    data: prices,
                    borderColor: colors.primary,
                    backgroundColor: `rgba(255, 215, 0, 0.1)`,
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 0,
                    pointHoverRadius: 6,
                    pointBackgroundColor: colors.accentCyan
                }]
            },
            options: {
                ...this.chartOptions,
                plugins: {
                    ...this.chartOptions.plugins,
                    filler: { propagate: true }
                }
            }
        });
    }

    createVolatilityChart(canvasId, data) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return;

        // Group by month and calculate volatility
        const monthlyData = {};
        
        data.forEach(d => {
            const date = new Date(d.Date);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            
            if (!monthlyData[monthKey]) {
                monthlyData[monthKey] = [];
            }
            monthlyData[monthKey].push(parseFloat(d.Gold_Price_INR));
        });

        const months = Object.keys(monthlyData).sort();
        const volatilities = months.map(month => {
            const prices = monthlyData[month];
            const mean = prices.reduce((a, b) => a + b) / prices.length;
            const variance = prices.reduce((sum, p) => sum + Math.pow(p - mean, 2), 0) / prices.length;
            return Math.sqrt(variance);
        });

        const colors = window.themeManager.getColors();

        this.charts[canvasId] = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: months,
                datasets: [{
                    label: 'Monthly Volatility (Std Dev)',
                    data: volatilities,
                    backgroundColor: colors.accentOrange,
                    borderColor: colors.primary,
                    borderWidth: 1
                }]
            },
            options: this.chartOptions
        });
    }

    createCorrelationChart(canvasId) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return;

        const colors = window.themeManager.getColors();

        this.charts[canvasId] = new Chart(ctx, {
            type: 'bubble',
            data: {
                datasets: [
                    {
                        label: 'Strong Positive',
                        data: [{ x: 1, y: 2, r: 15 }],
                        backgroundColor: '#00ff00'
                    },
                    {
                        label: 'Moderate Negative',
                        data: [{ x: 2, y: 1, r: 12 }],
                        backgroundColor: colors.accentOrange
                    },
                    {
                        label: 'Weak Negative',
                        data: [{ x: 3, y: 3, r: 10 }],
                        backgroundColor: colors.primary
                    }
                ]
            },
            options: {
                ...this.chartOptions,
                scales: {
                    y: { min: 0, max: 4, ticks: { color: colors.text }, grid: { color: colors.borderColor } },
                    x: { min: 0, max: 4, ticks: { color: colors.text }, grid: { color: colors.borderColor } }
                }
            }
        });
    }

    createSurveyChart(canvasId, labels, data, type = 'doughnut') {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return;

        const colors = [
            window.themeManager.getColors().primary,
            window.themeManager.getColors().accentOrange,
            window.themeManager.getColors().accentCyan,
            '#00ff00',
            '#ff6b6b'
        ];

        this.charts[canvasId] = new Chart(ctx, {
            type: type,
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: colors.slice(0, data.length),
                    borderColor: window.themeManager.getColors().borderColor,
                    borderWidth: 2
                }]
            },
            options: {
                ...this.chartOptions,
                plugins: {
                    ...this.chartOptions.plugins,
                    legend: {
                        ...this.chartOptions.plugins.legend,
                        position: 'bottom'
                    }
                }
            }
        });
    }

    createDistributionChart(canvasId, data) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return;

        const calc = new StatisticsCalculator(data);
        const mean = calc.mean();
        const std = calc.standardDeviation();
        
        // Generate normal distribution curve
        const x = [];
        const y = [];
        for (let i = mean - 4 * std; i <= mean + 4 * std; i += std / 10) {
            x.push(i);
            const z = (i - mean) / std;
            y.push(Math.exp(-0.5 * z * z) / (std * Math.sqrt(2 * Math.PI)));
        }

        const colors = window.themeManager.getColors();

        this.charts[canvasId] = new Chart(ctx, {
            type: 'line',
            data: {
                labels: x.map(v => `₹${Math.round(v/1000)}k`),
                datasets: [{
                    label: 'Normal Distribution',
                    data: y,
                    borderColor: colors.primary,
                    backgroundColor: `rgba(255, 215, 0, 0.1)`,
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 0
                }]
            },
            options: this.chartOptions
        });
    }

    destroyAllCharts() {
        Object.keys(this.charts).forEach(key => {
            if (this.charts[key]) {
                this.charts[key].destroy();
            }
        });
        this.charts = {};
    }

    updateChartsTheme() {
        this.destroyAllCharts();
    }
}

// Initialize chart manager
const chartManager = new ChartManager();

// Initialize charts when page loads
window.addEventListener('load', () => {
    initializeAllCharts();
});

// Initialize charts based on page
function initializeAllCharts() {
    const currentPage = window.location.pathname;

    if (currentPage.includes('statistics')) {
        initializeStatisticsCharts();
    } else if (currentPage.includes('survey')) {
        initializeSurveyCharts();
    }
}

// Statistics page charts
function initializeStatisticsCharts() {
    if (typeof goldPrices === 'undefined') return;

    if (document.getElementById('histogramChart')) {
        chartManager.createHistogram('histogramChart', goldPrices);
    }

    if (document.getElementById('trendChart')) {
        chartManager.createTrendChart('trendChart', goldPrices);
    }

    if (document.getElementById('volatilityChart')) {
        chartManager.createVolatilityChart('volatilityChart', goldPrices);
    }

    if (document.getElementById('distributionChart')) {
        chartManager.createDistributionChart('distributionChart', goldPrices);
    }

    if (document.getElementById('correlationChart')) {
        chartManager.createCorrelationChart('correlationChart');
    }
}

// Survey page charts
function initializeSurveyCharts() {
    if (typeof surveyData === 'undefined') return;

    // Age chart
    if (document.getElementById('ageChart')) {
        chartManager.createSurveyChart('ageChart', 
            ['18-25', '26-35', '36-50', '50+'],
            [60, 20, 13.3, 6.7],
            'doughnut'
        );
    }

    // Gender chart
    if (document.getElementById('genderChart')) {
        chartManager.createSurveyChart('genderChart',
            ['Male', 'Female'],
            [60, 40],
            'doughnut'
        );
    }

    // Other survey charts
    const surveyCharts = [
        { id: 'occupationChart', labels: ['Students', 'Employed', 'Self-Employed'], data: [40, 46.7, 13.3] },
        { id: 'incomeChart', labels: ['<₹50K', '₹50K-₹1L', '₹1L-₹2.5L', '>₹2.5L'], data: [26.7, 33.3, 26.7, 13.3] },
        { id: 'hedgeChart', labels: ['Agree', 'Neutral', 'Disagree'], data: [60, 27, 13] },
        { id: 'interestChart', labels: ['High', 'Moderate', 'Low'], data: [47, 33, 20] },
        { id: 'purchaseChart', labels: ['Will Buy', 'Maybe', "Won't Buy"], data: [40, 33, 27] },
        { id: 'formChart', labels: ['Physical', 'ETFs', 'Schemes'], data: [53, 27, 20] },
        { id: 'riskChart', labels: ['Low', 'Moderate', 'High'], data: [47, 40, 13] },
        { id: 'sentimentChart', labels: ['Bullish', 'Neutral', 'Bearish'], data: [67, 20, 13] },
        { id: 'timelineChart', labels: ['Short-term', 'Medium-term', 'Long-term'], data: [33, 40, 27] },
        { id: 'sourceChart', labels: ['News', 'Experts', 'Communities', 'Social'], data: [40, 33, 20, 7] }
    ];

    surveyCharts.forEach(chart => {
        if (document.getElementById(chart.id)) {
            chartManager.createSurveyChart(chart.id, chart.labels, chart.data, 'bar');
        }
    });
}

// Update theme and redraw charts
if (window.themeManager) {
    const originalToggle = window.themeManager.toggleTheme.bind(window.themeManager);
    window.themeManager.toggleTheme = function() {
        originalToggle();
        setTimeout(() => {
            chartManager.updateChartsTheme();
            initializeAllCharts();
        }, 100);
    };
}

// Export chart manager
window.chartManager = chartManager;
