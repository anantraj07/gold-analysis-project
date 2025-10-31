/* ============================================
   GOLD PRICE ANALYSIS - CHARTS.JS
   Mobile-Optimized Chart Rendering with All Features
   ============================================ */

class ChartManager {
    constructor() {
        this.charts = {};
        this.isMobile = window.innerWidth < 768;
        this.isTablet = window.innerWidth >= 768 && window.innerWidth < 1024;
    }

    getDefaultColors() {
        const isDark = !document.body.classList.contains('light-theme');
        return {
            primary: '#FFD700',
            darkGold: '#DAA520',
            darkBg: isDark ? '#0a0a0a' : '#ffffff',
            text: isDark ? '#ffffff' : '#1a1a1a',
            textMuted: isDark ? '#888888' : '#666666',
            accentCyan: isDark ? '#00ffff' : '#0066cc',
            accentOrange: '#FFA500',
            borderColor: isDark ? '#333333' : '#dddddd',
            success: '#00ff00',
            danger: '#ff4444'
        };
    }

    getDefaultOptions() {
        const colors = this.getDefaultColors();
        return {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        color: colors.text,
                        font: { size: this.isMobile ? 10 : 12, family: "'Segoe UI', sans-serif" },
                        padding: this.isMobile ? 8 : 10
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: colors.primary,
                    bodyColor: colors.text,
                    borderColor: colors.primary,
                    borderWidth: 1
                }
            },
            scales: {
                y: {
                    ticks: { 
                        color: colors.text,
                        font: { size: this.isMobile ? 9 : 11 }
                    },
                    grid: { color: colors.borderColor + '33' }
                },
                x: {
                    ticks: { 
                        color: colors.text,
                        font: { size: this.isMobile ? 8 : 10 },
                        maxRotation: this.isMobile ? 90 : 45,
                        minRotation: this.isMobile ? 45 : 0
                    },
                    grid: { display: false }
                }
            }
        };
    }

    // Generate sample gold price data (643 days)
    generateGoldPriceData() {
        const data = [];
        let basePrice = 47736;
        const startDate = new Date('2023-01-03');
        
        for (let i = 0; i < 643; i++) {
            const date = new Date(startDate);
            date.setDate(startDate.getDate() + i);
            
            const trend = i * 97;
            const seasonal = Math.sin(i / 30) * 8000;
            const noise = (Math.random() - 0.5) * 5000;
            
            const price = Math.round(basePrice + trend + seasonal + noise);
            
            data.push({
                Date: date.toISOString().split('T')[0],
                Gold_Price_INR: Math.max(47736, Math.min(110383, price)).toString()
            });
        }
        return data;
    }

    createHistogram(canvasId, data) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return;

        const calc = new StatisticsCalculator(data);
        const bins = this.isMobile ? 15 : 20;
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

        const colors = this.getDefaultColors();

        this.charts[canvasId] = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: binLabels,
                datasets: [{
                    label: 'Frequency',
                    data: binCounts,
                    backgroundColor: 'rgba(255, 215, 0, 0.6)',
                    borderColor: colors.primary,
                    borderWidth: this.isMobile ? 1 : 2
                }]
            },
            options: {
                ...this.getDefaultOptions(),
                plugins: {
                    ...this.getDefaultOptions().plugins,
                    title: { 
                        display: false
                    }
                }
            }
        });
    }

    createTrendChart(canvasId, data) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return;

        // Sample data for performance
        const sampleRate = this.isMobile ? 10 : 5;
        const sampledData = data.filter((_, i) => i % sampleRate === 0);

        const dates = sampledData.map(d => {
            const date = new Date(d.Date);
            return this.isMobile ? 
                date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }) :
                date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' });
        });
        const prices = sampledData.map(d => parseFloat(d.Gold_Price_INR));

        const colors = this.getDefaultColors();

        this.charts[canvasId] = new Chart(ctx, {
            type: 'line',
            data: {
                labels: dates,
                datasets: [{
                    label: 'Gold Price (₹ per 10g)',
                    data: prices,
                    borderColor: colors.primary,
                    backgroundColor: 'rgba(255, 215, 0, 0.1)',
                    borderWidth: this.isMobile ? 2 : 3,
                    fill: true,
                    tension: 0.3,
                    pointRadius: this.isMobile ? 0 : 1,
                    pointHoverRadius: this.isMobile ? 4 : 6,
                    pointBackgroundColor: colors.accentCyan
                }]
            },
            options: {
                ...this.getDefaultOptions(),
                interaction: {
                    intersect: false,
                    mode: 'index'
                },
                scales: {
                    ...this.getDefaultOptions().scales,
                    y: {
                        ...this.getDefaultOptions().scales.y,
                        ticks: {
                            ...this.getDefaultOptions().scales.y.ticks,
                            callback: function(value) {
                                return '₹' + (value/1000).toFixed(0) + 'k';
                            }
                        }
                    },
                    x: {
                        ...this.getDefaultOptions().scales.x,
                        ticks: {
                            ...this.getDefaultOptions().scales.x.ticks,
                            autoSkip: true,
                            maxTicksLimit: this.isMobile ? 8 : 15
                        }
                    }
                }
            }
        });
    }

    createVolatilityChart(canvasId, data) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return;

        // Group by quarter for better visualization
        const quarterlyData = {};
        
        data.forEach(d => {
            const date = new Date(d.Date);
            const year = date.getFullYear();
            const quarter = Math.floor(date.getMonth() / 3) + 1;
            const quarterKey = `Q${quarter} ${year.toString().slice(2)}`;
            
            if (!quarterlyData[quarterKey]) {
                quarterlyData[quarterKey] = [];
            }
            quarterlyData[quarterKey].push(parseFloat(d.Gold_Price_INR));
        });

        const quarters = Object.keys(quarterlyData).sort();
        const volatilities = quarters.map(quarter => {
            const prices = quarterlyData[quarter];
            const mean = prices.reduce((a, b) => a + b) / prices.length;
            const variance = prices.reduce((sum, p) => sum + Math.pow(p - mean, 2), 0) / prices.length;
            return Math.round(Math.sqrt(variance));
        });

        const colors = this.getDefaultColors();

        this.charts[canvasId] = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: quarters,
                datasets: [{
                    label: 'Volatility (Std Dev)',
                    data: volatilities,
                    backgroundColor: volatilities.map(v => 
                        v > 13000 ? 'rgba(255, 68, 68, 0.6)' : 
                        v > 11000 ? 'rgba(255, 165, 0, 0.6)' : 
                        'rgba(0, 255, 0, 0.6)'
                    ),
                    borderColor: colors.primary,
                    borderWidth: this.isMobile ? 1 : 2
                }]
            },
            options: {
                ...this.getDefaultOptions(),
                scales: {
                    ...this.getDefaultOptions().scales,
                    y: {
                        ...this.getDefaultOptions().scales.y,
                        beginAtZero: true,
                        ticks: {
                            ...this.getDefaultOptions().scales.y.ticks,
                            callback: function(value) {
                                return '₹' + (value/1000).toFixed(1) + 'k';
                            }
                        }
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
        const step = std / (this.isMobile ? 5 : 10);
        for (let i = mean - 4 * std; i <= mean + 4 * std; i += step) {
            x.push(i);
            const z = (i - mean) / std;
            y.push(Math.exp(-0.5 * z * z) / (std * Math.sqrt(2 * Math.PI)) * 1000000);
        }

        const colors = this.getDefaultColors();

        this.charts[canvasId] = new Chart(ctx, {
            type: 'line',
            data: {
                labels: x.map(v => `₹${Math.round(v/1000)}k`),
                datasets: [{
                    label: 'Normal Distribution',
                    data: y,
                    borderColor: colors.primary,
                    backgroundColor: 'rgba(255, 215, 0, 0.2)',
                    borderWidth: this.isMobile ? 2 : 3,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 0
                }]
            },
            options: this.getDefaultOptions()
        });
    }

    createBoxPlotChart(canvasId) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return;

        const boxPlotData = {
            min: 47736,
            q1: 58714,
            median: 67185,
            q3: 77656,
            max: 110383
        };

        const colors = this.getDefaultColors();

        this.charts[canvasId] = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Gold Prices (₹)'],
                datasets: [
                    {
                        label: 'Min',
                        data: [boxPlotData.min],
                        backgroundColor: 'rgba(255, 68, 68, 0.6)',
                        borderColor: colors.danger,
                        borderWidth: 2
                    },
                    {
                        label: 'Q1 (25%)',
                        data: [boxPlotData.q1 - boxPlotData.min],
                        backgroundColor: 'rgba(255, 215, 0, 0.3)',
                        borderColor: colors.primary,
                        borderWidth: 2
                    },
                    {
                        label: 'Q2-Q1 (IQR Bottom)',
                        data: [boxPlotData.median - boxPlotData.q1],
                        backgroundColor: 'rgba(255, 215, 0, 0.5)',
                        borderColor: colors.primary,
                        borderWidth: 2
                    },
                    {
                        label: 'Q3-Q2 (IQR Top)',
                        data: [boxPlotData.q3 - boxPlotData.median],
                        backgroundColor: 'rgba(255, 215, 0, 0.5)',
                        borderColor: colors.primary,
                        borderWidth: 2
                    },
                    {
                        label: 'Max',
                        data: [boxPlotData.max - boxPlotData.q3],
                        backgroundColor: 'rgba(0, 255, 0, 0.3)',
                        borderColor: colors.success,
                        borderWidth: 2
                    }
                ]
            },
            options: {
                ...this.getDefaultOptions(),
                indexAxis: 'y',
                plugins: {
                    ...this.getDefaultOptions().plugins,
                    legend: {
                        display: true,
                        position: this.isMobile ? 'bottom' : 'right',
                        labels: {
                            ...this.getDefaultOptions().plugins.legend.labels,
                            font: { size: this.isMobile ? 9 : 11 }
                        }
                    }
                },
                scales: {
                    x: {
                        stacked: true,
                        ticks: {
                            color: this.getDefaultColors().text,
                            font: { size: this.isMobile ? 9 : 11 },
                            callback: function(value) {
                                return '₹' + (value/1000).toFixed(0) + 'k';
                            }
                        },
                        grid: { color: this.getDefaultColors().borderColor + '33' }
                    },
                    y: {
                        stacked: true,
                        ticks: {
                            color: this.getDefaultColors().text,
                            font: { size: this.isMobile ? 9 : 11 }
                        },
                        grid: { display: false }
                    }
                }
            }
        });
    }

    createInflationChart(canvasId) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return;

        const inflationData = [
            { month: 'Jan 23', inflation: 6.52, goldPrice: 52000 },
            { month: 'Apr 23', inflation: 4.70, goldPrice: 58000 },
            { month: 'Jul 23', inflation: 7.44, goldPrice: 62000 },
            { month: 'Oct 23', inflation: 5.02, goldPrice: 65000 },
            { month: 'Jan 24', inflation: 5.10, goldPrice: 68000 },
            { month: 'Apr 24', inflation: 4.83, goldPrice: 72000 },
            { month: 'Jul 24', inflation: 3.65, goldPrice: 78000 },
            { month: 'Oct 24', inflation: 5.49, goldPrice: 85000 },
            { month: 'Jan 25', inflation: 4.91, goldPrice: 92000 },
            { month: 'Apr 25', inflation: 4.83, goldPrice: 98000 },
            { month: 'Jul 25', inflation: 3.54, goldPrice: 105000 },
            { month: 'Oct 25', inflation: 5.49, goldPrice: 110383 }
        ];

        const colors = this.getDefaultColors();

        this.charts[canvasId] = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: inflationData.map(d => d.month),
                datasets: [
                    {
                        label: 'Inflation Rate (%)',
                        data: inflationData.map(d => d.inflation),
                        backgroundColor: 'rgba(255, 165, 0, 0.6)',
                        borderColor: colors.accentOrange,
                        borderWidth: this.isMobile ? 1 : 2,
                        yAxisID: 'y'
                    },
                    {
                        label: 'Gold Price (₹)',
                        data: inflationData.map(d => d.goldPrice),
                        type: 'line',
                        borderColor: colors.primary,
                        backgroundColor: 'rgba(255, 215, 0, 0.1)',
                        fill: false,
                        tension: 0.4,
                        borderWidth: this.isMobile ? 2 : 3,
                        pointRadius: this.isMobile ? 3 : 4,
                        pointHoverRadius: this.isMobile ? 5 : 6,
                        yAxisID: 'y1'
                    }
                ]
            },
            options: {
                ...this.getDefaultOptions(),
                interaction: {
                    mode: 'index',
                    intersect: false
                },
                plugins: {
                    ...this.getDefaultOptions().plugins,
                    legend: {
                        display: true,
                        position: this.isMobile ? 'bottom' : 'top',
                        labels: {
                            color: colors.text,
                            font: { size: this.isMobile ? 9 : 11 },
                            padding: this.isMobile ? 8 : 10
                        }
                    }
                },
                scales: {
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        ticks: {
                            color: colors.accentOrange,
                            font: { size: this.isMobile ? 9 : 11 },
                            callback: function(value) {
                                return value + '%';
                            }
                        },
                        grid: { color: 'rgba(255, 165, 0, 0.1)' },
                        title: {
                            display: !this.isMobile,
                            text: 'Inflation Rate (%)',
                            color: colors.accentOrange
                        }
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        ticks: {
                            color: colors.primary,
                            font: { size: this.isMobile ? 9 : 11 },
                            callback: function(value) {
                                return '₹' + (value/1000).toFixed(0) + 'k';
                            }
                        },
                        grid: { drawOnChartArea: false },
                        title: {
                            display: !this.isMobile,
                            text: 'Gold Price (₹)',
                            color: colors.primary
                        }
                    },
                    x: {
                        ticks: {
                            color: colors.text,
                            font: { size: this.isMobile ? 8 : 10 },
                            maxRotation: this.isMobile ? 90 : 45,
                            minRotation: this.isMobile ? 45 : 0
                        },
                        grid: { display: false }
                    }
                }
            }
        });
    }

    createCorrelationScatterChart(canvasId) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return;

        const inflationData = [
            { inflation: 6.52, goldPrice: 52000 },
            { inflation: 4.70, goldPrice: 58000 },
            { inflation: 7.44, goldPrice: 62000 },
            { inflation: 5.02, goldPrice: 65000 },
            { inflation: 5.10, goldPrice: 68000 },
            { inflation: 4.83, goldPrice: 72000 },
            { inflation: 3.65, goldPrice: 78000 },
            { inflation: 5.49, goldPrice: 85000 },
            { inflation: 4.91, goldPrice: 92000 },
            { inflation: 4.83, goldPrice: 98000 },
            { inflation: 3.54, goldPrice: 105000 },
            { inflation: 5.49, goldPrice: 110383 }
        ];

        const colors = this.getDefaultColors();

        this.charts[canvasId] = new Chart(ctx, {
            type: 'scatter',
            data: {
                datasets: [{
                    label: 'Gold vs Inflation',
                    data: inflationData.map(d => ({ x: d.inflation, y: d.goldPrice })),
                    backgroundColor: 'rgba(255, 215, 0, 0.6)',
                    borderColor: colors.primary,
                    borderWidth: 2,
                    pointRadius: this.isMobile ? 6 : 8,
                    pointHoverRadius: this.isMobile ? 8 : 10
                }]
            },
            options: {
                ...this.getDefaultOptions(),
                scales: {
                    y: {
                        ticks: {
                            color: colors.text,
                            font: { size: this.isMobile ? 9 : 11 },
                            callback: function(value) {
                                return '₹' + (value/1000).toFixed(0) + 'k';
                            }
                        },
                        grid: { color: colors.borderColor + '33' },
                        title: {
                            display: !this.isMobile,
                            text: 'Gold Price (₹)',
                            color: colors.text
                        }
                    },
                    x: {
                        ticks: {
                            color: colors.text,
                            font: { size: this.isMobile ? 9 : 11 },
                            callback: function(value) {
                                return value + '%';
                            }
                        },
                        grid: { color: colors.borderColor + '33' },
                        title: {
                            display: !this.isMobile,
                            text: 'Inflation Rate (%)',
                            color: colors.text
                        }
                    }
                }
            }
        });
    }

    createCorrelationChart(canvasId) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return;

        const colors = this.getDefaultColors();

        this.charts[canvasId] = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Gold-USD', 'Gold-Inflation', 'USD-Inflation'],
                datasets: [{
                    label: 'Correlation Coefficient',
                    data: [-0.421, 0.687, -0.156],
                    backgroundColor: [
                        'rgba(255, 68, 68, 0.6)',
                        'rgba(0, 255, 0, 0.6)',
                        'rgba(255, 68, 68, 0.6)'
                    ],
                    borderColor: colors.primary,
                    borderWidth: this.isMobile ? 1 : 2
                }]
            },
            options: {
                ...this.getDefaultOptions(),
                indexAxis: this.isMobile ? 'y' : 'x',
                scales: {
                    [this.isMobile ? 'x' : 'y']: {
                        min: -1,
                        max: 1,
                        ticks: {
                            color: colors.text,
                            font: { size: this.isMobile ? 9 : 11 }
                        },
                        grid: { color: colors.borderColor + '33' }
                    },
                    [this.isMobile ? 'y' : 'x']: {
                        ticks: {
                            color: colors.text,
                            font: { size: this.isMobile ? 9 : 11 }
                        },
                        grid: { display: false }
                    }
                }
            }
        });
    }

    createSurveyChart(canvasId, labels, data, type = 'doughnut') {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return;

        const chartColors = [
            this.getDefaultColors().primary,
            this.getDefaultColors().accentOrange,
            this.getDefaultColors().accentCyan,
            this.getDefaultColors().success,
            '#ff6b6b',
            '#9b59b6',
            '#3498db'
        ];

        this.charts[canvasId] = new Chart(ctx, {
            type: type,
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: chartColors.slice(0, data.length),
                    borderColor: this.getDefaultColors().borderColor,
                    borderWidth: 2
                }]
            },
            options: {
                ...this.getDefaultOptions(),
                plugins: {
                    ...this.getDefaultOptions().plugins,
                    legend: {
                        ...this.getDefaultOptions().plugins.legend,
                        position: this.isMobile ? 'bottom' : (type === 'doughnut' ? 'bottom' : 'top')
                    }
                }
            }
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
        setTimeout(() => {
            initializeAllCharts();
        }, 100);
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
    // Generate or get gold price data
    let goldPrices = [];
    if (typeof window.goldPrices !== 'undefined') {
        goldPrices = window.goldPrices;
    } else {
        goldPrices = chartManager.generateGoldPriceData();
    }

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

    if (document.getElementById('boxplotChart')) {
        chartManager.createBoxPlotChart('boxplotChart');
    }

    if (document.getElementById('inflationChart')) {
        chartManager.createInflationChart('inflationChart');
    }

    if (document.getElementById('correlationScatterChart')) {
        chartManager.createCorrelationScatterChart('correlationScatterChart');
    }

    if (document.getElementById('correlationChart')) {
        chartManager.createCorrelationChart('correlationChart');
    }
}

// Survey page charts
function initializeSurveyCharts() {
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
            chartManager.createSurveyChart(chart.id, chart.labels, chart.data, '
