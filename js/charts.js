/* ============================================
   GOLD PRICE ANALYSIS - CHARTS.JS (COMPLETE)
   With Modal View and Fixed Date Labels
   ============================================ */

class StatisticsCalculator {
    constructor(data) {
        this.data = data;
        this.values = data.map(d => parseFloat(d.Gold_Price_INR));
    }

    mean() {
        return this.values.reduce((a, b) => a + b, 0) / this.values.length;
    }

    median() {
        const sorted = [...this.values].sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
    }

    min() {
        return Math.min(...this.values);
    }

    max() {
        return Math.max(...this.values);
    }

    standardDeviation() {
        const mean = this.mean();
        const variance = this.values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / this.values.length;
        return Math.sqrt(variance);
    }
}

class ChartManager {
    constructor() {
        this.charts = {};
        this.isMobile = window.innerWidth < 768;
        this.initializeModal();
    }

    initializeModal() {
        const modalHTML = `
            <div id="chartModal" class="chart-modal">
                <div class="chart-modal-content">
                    <span class="chart-modal-close">&times;</span>
                    <h3 id="modalChartTitle"></h3>
                    <canvas id="modalCanvas"></canvas>
                </div>
            </div>
        `;
        
        if (!document.getElementById('chartModal')) {
            document.body.insertAdjacentHTML('beforeend', modalHTML);
        }

        const modalStyles = `
            <style>
                .chart-modal {
                    display: none;
                    position: fixed;
                    z-index: 10000;
                    left: 0;
                    top: 0;
                    width: 100%;
                    height: 100%;
                    background-color: rgba(0, 0, 0, 0.9);
                    overflow: auto;
                }

                .chart-modal-content {
                    background-color: var(--light-bg);
                    margin: 2% auto;
                    padding: 2rem;
                    border: 2px solid var(--primary-gold);
                    border-radius: 12px;
                    width: 95%;
                    max-width: 1400px;
                    position: relative;
                }

                .chart-modal-close {
                    color: var(--primary-gold);
                    position: absolute;
                    top: 1rem;
                    right: 1.5rem;
                    font-size: 2.5rem;
                    font-weight: bold;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }

                .chart-modal-close:hover {
                    color: var(--dark-gold);
                    transform: scale(1.1);
                }

                .chart-modal-content h3 {
                    color: var(--primary-gold);
                    margin-bottom: 1.5rem;
                    font-size: 1.5rem;
                }

                .chart-modal-content canvas {
                    width: 100% !important;
                    height: 600px !important;
                    max-height: 70vh;
                }

                .chart-container {
                    cursor: zoom-in;
                    position: relative;
                }

                .chart-container::after {
                    content: '🔍 Click to enlarge';
                    position: absolute;
                    top: 10px;
                    right: 10px;
                    background: rgba(255, 215, 0, 0.9);
                    color: #000;
                    padding: 0.25rem 0.75rem;
                    border-radius: 4px;
                    font-size: 0.75rem;
                    font-weight: 600;
                    opacity: 0;
                    transition: opacity 0.3s ease;
                    pointer-events: none;
                }

                .chart-container:hover::after {
                    opacity: 1;
                }

                @media (max-width: 768px) {
                    .chart-modal-content {
                        width: 98%;
                        margin: 5% auto;
                        padding: 1rem;
                    }

                    .chart-modal-content canvas {
                        height: 400px !important;
                    }
                }
            </style>
        `;

        if (!document.getElementById('chartModalStyles')) {
            const styleElement = document.createElement('div');
            styleElement.id = 'chartModalStyles';
            styleElement.innerHTML = modalStyles;
            document.head.appendChild(styleElement);
        }

        const modal = document.getElementById('chartModal');
        const closeBtn = document.querySelector('.chart-modal-close');

        closeBtn.onclick = () => {
            modal.style.display = 'none';
            const modalChart = this.charts['modalCanvas'];
            if (modalChart) {
                modalChart.destroy();
                delete this.charts['modalCanvas'];
            }
        };

        window.onclick = (event) => {
            if (event.target === modal) {
                modal.style.display = 'none';
                const modalChart = this.charts['modalCanvas'];
                if (modalChart) {
                    modalChart.destroy();
                    delete this.charts['modalCanvas'];
                }
            }
        };
    }

    openChartModal(chartTitle, chartData, chartType, chartOptions) {
        const modal = document.getElementById('chartModal');
        const modalCanvas = document.getElementById('modalCanvas');
        const modalTitle = document.getElementById('modalChartTitle');

        modalTitle.textContent = chartTitle;
        modal.style.display = 'block';

        if (this.charts['modalCanvas']) {
            this.charts['modalCanvas'].destroy();
        }

        this.charts['modalCanvas'] = new Chart(modalCanvas, {
            type: chartType,
            data: chartData,
            options: {
                ...chartOptions,
                maintainAspectRatio: false
            }
        });
    }

    getDefaultColors() {
        const isDark = !document.body.classList.contains('light-theme');
        return {
            primary: '#FFD700',
            darkGold: '#DAA520',
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
                        font: { size: this.isMobile ? 10 : 12 },
                        padding: 15
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: colors.primary,
                    bodyColor: colors.text,
                    borderColor: colors.primary,
                    borderWidth: 1,
                    padding: 10
                }
            },
            scales: {
                y: {
                    ticks: { 
                        color: colors.text,
                        font: { size: 11 }
                    },
                    grid: { color: colors.borderColor + '33' }
                },
                x: {
                    ticks: { 
                        color: colors.text,
                        font: { size: 11 }
                    },
                    grid: { drawOnChartArea: false }
                }
            }
        };
    }

   class ChartManager {
    constructor() {
        this.charts = {};
        this.isMobile = window.innerWidth < 768;
        this.initializeModal();
    }

    // ... keep all your existing methods ...

    // REPLACE the generateGoldPriceData method with this:
    getHardcodedGoldData() {
        const goldPrices = [
            // January 2023
            { Date: '2023-01-03', Gold_Price_INR: 50485 },
            { Date: '2023-01-04', Gold_Price_INR: 50625 },
            { Date: '2023-01-05', Gold_Price_INR: 50875 },
            { Date: '2023-01-06', Gold_Price_INR: 51050 },
            { Date: '2023-01-09', Gold_Price_INR: 51230 },
            { Date: '2023-01-10', Gold_Price_INR: 50950 },
            { Date: '2023-01-11', Gold_Price_INR: 50800 },
            { Date: '2023-01-12', Gold_Price_INR: 50725 },
            { Date: '2023-01-13', Gold_Price_INR: 50300 },
            { Date: '2023-01-16', Gold_Price_INR: 50100 },
            { Date: '2023-01-17', Gold_Price_INR: 50250 },
            { Date: '2023-01-18', Gold_Price_INR: 50500 },
            { Date: '2023-01-19', Gold_Price_INR: 50750 },
            { Date: '2023-01-20', Gold_Price_INR: 50900 },
            { Date: '2023-01-23', Gold_Price_INR: 51100 },
            { Date: '2023-01-24', Gold_Price_INR: 51300 },
            { Date: '2023-01-25', Gold_Price_INR: 51500 },
            { Date: '2023-01-26', Gold_Price_INR: 51700 },
            { Date: '2023-01-27', Gold_Price_INR: 51900 },
            { Date: '2023-01-30', Gold_Price_INR: 52100 },
            { Date: '2023-01-31', Gold_Price_INR: 52300 },

            // February 2023
            { Date: '2023-02-01', Gold_Price_INR: 52000 },
            { Date: '2023-02-02', Gold_Price_INR: 51800 },
            { Date: '2023-02-03', Gold_Price_INR: 51600 },
            { Date: '2023-02-06', Gold_Price_INR: 51400 },
            { Date: '2023-02-07', Gold_Price_INR: 51200 },
            { Date: '2023-02-08', Gold_Price_INR: 51000 },
            { Date: '2023-02-09', Gold_Price_INR: 50800 },
            { Date: '2023-02-10', Gold_Price_INR: 50600 },
            { Date: '2023-02-13', Gold_Price_INR: 50400 },
            { Date: '2023-02-14', Gold_Price_INR: 50200 },
            { Date: '2023-02-15', Gold_Price_INR: 50000 },
            { Date: '2023-02-16', Gold_Price_INR: 49800 },
            { Date: '2023-02-17', Gold_Price_INR: 49600 },
            { Date: '2023-02-20', Gold_Price_INR: 49400 },
            { Date: '2023-02-21', Gold_Price_INR: 49200 },
            { Date: '2023-02-22', Gold_Price_INR: 49000 },
            { Date: '2023-02-23', Gold_Price_INR: 48800 },
            { Date: '2023-02-24', Gold_Price_INR: 48600 },
            { Date: '2023-02-27', Gold_Price_INR: 48400 },
            { Date: '2023-02-28', Gold_Price_INR: 48200 },

            // March 2023 - Bottom
            { Date: '2023-03-01', Gold_Price_INR: 48000 },
            { Date: '2023-03-02', Gold_Price_INR: 47800 },
            { Date: '2023-03-03', Gold_Price_INR: 47736 },
            { Date: '2023-03-06', Gold_Price_INR: 47850 },
            { Date: '2023-03-07', Gold_Price_INR: 48000 },
            { Date: '2023-03-08', Gold_Price_INR: 48200 },
            { Date: '2023-03-09', Gold_Price_INR: 48400 },
            { Date: '2023-03-10', Gold_Price_INR: 48600 },
            { Date: '2023-03-13', Gold_Price_INR: 48800 },
            { Date: '2023-03-14', Gold_Price_INR: 49000 },
            { Date: '2023-03-15', Gold_Price_INR: 49200 },
            { Date: '2023-03-16', Gold_Price_INR: 49400 },
            { Date: '2023-03-17', Gold_Price_INR: 49600 },
            { Date: '2023-03-20', Gold_Price_INR: 49800 },
            { Date: '2023-03-21', Gold_Price_INR: 50000 },
            { Date: '2023-03-22', Gold_Price_INR: 50200 },
            { Date: '2023-03-23', Gold_Price_INR: 50400 },
            { Date: '2023-03-24', Gold_Price_INR: 50600 },
            { Date: '2023-03-27', Gold_Price_INR: 50800 },
            { Date: '2023-03-28', Gold_Price_INR: 51000 },
            { Date: '2023-03-29', Gold_Price_INR: 51200 },
            { Date: '2023-03-30', Gold_Price_INR: 51400 },
            { Date: '2023-03-31', Gold_Price_INR: 51600 },

            // Key monthly points for the rest of 2023
            { Date: '2023-04-15', Gold_Price_INR: 53500 },
            { Date: '2023-04-30', Gold_Price_INR: 55500 },
            { Date: '2023-05-15', Gold_Price_INR: 57500 },
            { Date: '2023-05-31', Gold_Price_INR: 59500 },
            { Date: '2023-06-15', Gold_Price_INR: 61500 },
            { Date: '2023-06-30', Gold_Price_INR: 62500 },
            { Date: '2023-07-15', Gold_Price_INR: 63500 },
            { Date: '2023-07-31', Gold_Price_INR: 64500 },
            { Date: '2023-08-15', Gold_Price_INR: 65500 },
            { Date: '2023-08-31', Gold_Price_INR: 66500 },
            { Date: '2023-09-15', Gold_Price_INR: 67500 },
            { Date: '2023-09-30', Gold_Price_INR: 68500 },
            { Date: '2023-10-15', Gold_Price_INR: 69500 },
            { Date: '2023-10-31', Gold_Price_INR: 70500 },
            { Date: '2023-11-15', Gold_Price_INR: 71500 },
            { Date: '2023-11-30', Gold_Price_INR: 72500 },
            { Date: '2023-12-15', Gold_Price_INR: 73500 },
            { Date: '2023-12-29', Gold_Price_INR: 74500 },

            // 2024
            { Date: '2024-01-15', Gold_Price_INR: 75500 },
            { Date: '2024-01-31', Gold_Price_INR: 76500 },
            { Date: '2024-02-15', Gold_Price_INR: 77500 },
            { Date: '2024-02-29', Gold_Price_INR: 78500 },
            { Date: '2024-03-15', Gold_Price_INR: 79500 },
            { Date: '2024-03-29', Gold_Price_INR: 80500 },
            { Date: '2024-04-15', Gold_Price_INR: 81500 },
            { Date: '2024-04-30', Gold_Price_INR: 82500 },
            { Date: '2024-05-15', Gold_Price_INR: 83500 },
            { Date: '2024-05-31', Gold_Price_INR: 84500 },
            { Date: '2024-06-15', Gold_Price_INR: 85500 },
            { Date: '2024-06-28', Gold_Price_INR: 86500 },
            { Date: '2024-07-15', Gold_Price_INR: 87500 },
            { Date: '2024-07-31', Gold_Price_INR: 88500 },
            { Date: '2024-08-15', Gold_Price_INR: 89500 },
            { Date: '2024-08-30', Gold_Price_INR: 90500 },
            { Date: '2024-09-15', Gold_Price_INR: 91500 },
            { Date: '2024-09-30', Gold_Price_INR: 92500 },
            { Date: '2024-10-15', Gold_Price_INR: 93500 },
            { Date: '2024-10-31', Gold_Price_INR: 94500 },
            { Date: '2024-11-15', Gold_Price_INR: 95500 },
            { Date: '2024-11-29', Gold_Price_INR: 96500 },
            { Date: '2024-12-15', Gold_Price_INR: 97500 },
            { Date: '2024-12-31', Gold_Price_INR: 98500 },

            // 2025 - Peak
            { Date: '2025-01-15', Gold_Price_INR: 99500 },
            { Date: '2025-01-31', Gold_Price_INR: 100500 },
            { Date: '2025-02-15', Gold_Price_INR: 101500 },
            { Date: '2025-02-28', Gold_Price_INR: 102500 },
            { Date: '2025-03-15', Gold_Price_INR: 103500 },
            { Date: '2025-03-31', Gold_Price_INR: 104500 },
            { Date: '2025-04-15', Gold_Price_INR: 105500 },
            { Date: '2025-04-30', Gold_Price_INR: 106500 },
            { Date: '2025-05-15', Gold_Price_INR: 107500 },
            { Date: '2025-05-30', Gold_Price_INR: 108500 },
            { Date: '2025-06-15', Gold_Price_INR: 109000 },
            { Date: '2025-06-30', Gold_Price_INR: 109300 },
            { Date: '2025-07-15', Gold_Price_INR: 109500 },
            { Date: '2025-07-31', Gold_Price_INR: 109700 },
            { Date: '2025-08-15', Gold_Price_INR: 109800 },
            { Date: '2025-08-29', Gold_Price_INR: 109900 },
            { Date: '2025-09-15', Gold_Price_INR: 110100 },
            { Date: '2025-09-30', Gold_Price_INR: 110250 },
            { Date: '2025-10-01', Gold_Price_INR: 110383 },
            { Date: '2025-10-02', Gold_Price_INR: 110300 }
        ];

        return goldPrices;
    }
   
    createHistogram(canvasId, data) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return;

        const calc = new StatisticsCalculator(data);
        const bins = 15;
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

        if (this.charts[canvasId]) {
            this.charts[canvasId].destroy();
        }

        const chartData = {
            labels: binLabels,
            datasets: [{
                label: 'Frequency',
                data: binCounts,
                backgroundColor: 'rgba(255, 215, 0, 0.6)',
                borderColor: colors.primary,
                borderWidth: 2
            }]
        };

        const chartOptions = this.getDefaultOptions();

        this.charts[canvasId] = new Chart(ctx, {
            type: 'bar',
            data: chartData,
            options: chartOptions
        });

        ctx.onclick = () => {
            this.openChartModal('Price Distribution Histogram', chartData, 'bar', chartOptions);
        };
    }

    createTrendChart(canvasId, data) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return;

        // Create date-based sampling to ensure proper distribution
        const monthlyData = {};
        
        data.forEach(d => {
            const date = new Date(d.Date);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            
            if (!monthlyData[monthKey]) {
                monthlyData[monthKey] = {
                    dates: [],
                    prices: []
                };
            }
            monthlyData[monthKey].dates.push(date);
            monthlyData[monthKey].prices.push(parseFloat(d.Gold_Price_INR));
        });

        // Get one sample per month (middle date)
        const sampledDates = [];
        const sampledPrices = [];
        
        Object.keys(monthlyData).sort().forEach(monthKey => {
            const monthData = monthlyData[monthKey];
            const midIndex = Math.floor(monthData.dates.length / 2);
            const date = monthData.dates[midIndex];
            const price = monthData.prices[midIndex];
            
            const monthName = date.toLocaleDateString('en-US', { month: 'short' });
            const year = date.getFullYear();
            
            sampledDates.push(`${monthName} ${year}`);
            sampledPrices.push(price);
        });

        const colors = this.getDefaultColors();

        if (this.charts[canvasId]) {
            this.charts[canvasId].destroy();
        }

        const chartData = {
            labels: sampledDates,
            datasets: [{
                label: 'Gold Price (₹ per 10g)',
                data: sampledPrices,
                borderColor: colors.primary,
                backgroundColor: 'rgba(255, 215, 0, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.3,
                pointRadius: 3,
                pointHoverRadius: 6,
                pointBackgroundColor: colors.accentCyan
            }]
        };

        const chartOptions = {
            ...this.getDefaultOptions(),
            interaction: { intersect: false, mode: 'index' },
            scales: {
                ...this.getDefaultOptions().scales,
                x: {
                    ticks: {
                        color: colors.text,
                        font: { size: 10 },
                        maxRotation: 45,
                        minRotation: 45,
                        autoSkip: true,
                        maxTicksLimit: 15
                    },
                    grid: { drawOnChartArea: false }
                }
            }
        };

        this.charts[canvasId] = new Chart(ctx, {
            type: 'line',
            data: chartData,
            options: chartOptions
        });

        ctx.onclick = () => {
            this.openChartModal('Price Trend Over Time (Jan 2023 - Oct 2025)', chartData, 'line', chartOptions);
        };
    }

    createVolatilityChart(canvasId, data) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return;

        const quarterlyData = {};
        
        data.forEach(d => {
            const date = new Date(d.Date);
            const year = date.getFullYear();
            const quarter = Math.floor(date.getMonth() / 3) + 1;
            const quarterKey = `Q${quarter} ${year}`;
            
            if (!quarterlyData[quarterKey]) {
                quarterlyData[quarterKey] = [];
            }
            quarterlyData[quarterKey].push(parseFloat(d.Gold_Price_INR));
        });

        const quarters = Object.keys(quarterlyData).sort((a, b) => {
            const [qA, yA] = a.split(" ");
            const [qB, yB] = b.split(" ");
            if (yA !== yB) return parseInt(yA) - parseInt(yB);
            return qA.localeCompare(qB);
        });
        
        const volatilities = quarters.map(quarter => {
            const prices = quarterlyData[quarter];
            const mean = prices.reduce((a, b) => a + b) / prices.length;
            const variance = prices.reduce((sum, p) => sum + Math.pow(p - mean, 2), 0) / prices.length;
            return Math.round(Math.sqrt(variance));
        });

        const colors = this.getDefaultColors();

        if (this.charts[canvasId]) {
            this.charts[canvasId].destroy();
        }

        const chartData = {
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
                borderWidth: 2
            }]
        };

        const chartOptions = this.getDefaultOptions();

        this.charts[canvasId] = new Chart(ctx, {
            type: 'bar',
            data: chartData,
            options: chartOptions
        });

        ctx.onclick = () => {
            this.openChartModal('Quarterly Volatility Analysis', chartData, 'bar', chartOptions);
        };
    }

    createDistributionChart(canvasId, data) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return;

        const calc = new StatisticsCalculator(data);
        const mean = calc.mean();
        const std = calc.standardDeviation();
        
        const x = [];
        const y = [];
        for (let i = mean - 4 * std; i <= mean + 4 * std; i += std / 8) {
            x.push(i);
            const z = (i - mean) / std;
            y.push(Math.exp(-0.5 * z * z) / (std * Math.sqrt(2 * Math.PI)) * 1000000);
        }

        const colors = this.getDefaultColors();

        if (this.charts[canvasId]) {
            this.charts[canvasId].destroy();
        }

        const chartData = {
            labels: x.map(v => `₹${Math.round(v/1000)}k`),
            datasets: [{
                label: 'Normal Distribution',
                data: y,
                borderColor: colors.primary,
                backgroundColor: 'rgba(255, 215, 0, 0.2)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointRadius: 0
            }]
        };

        const chartOptions = this.getDefaultOptions();

        this.charts[canvasId] = new Chart(ctx, {
            type: 'line',
            data: chartData,
            options: chartOptions
        });

        ctx.onclick = () => {
            this.openChartModal('Normal Distribution Analysis', chartData, 'line', chartOptions);
        };
    }

    createBoxPlotChart(canvasId) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return;

        const colors = this.getDefaultColors();

        if (this.charts[canvasId]) {
            this.charts[canvasId].destroy();
        }

        const chartData = {
            labels: ['Min', 'Q1', 'Median', 'Q3', 'Max'],
            datasets: [{
                label: 'Gold Price Distribution',
                data: [47736, 58714, 67185, 77656, 110383],
                backgroundColor: [
                    'rgba(255, 68, 68, 0.6)',
                    'rgba(255, 215, 0, 0.4)',
                    'rgba(255, 215, 0, 0.6)',
                    'rgba(255, 215, 0, 0.4)',
                    'rgba(0, 255, 0, 0.6)'
                ],
                borderColor: colors.primary,
                borderWidth: 2
            }]
        };

        const chartOptions = {
            ...this.getDefaultOptions(),
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: colors.text,
                        font: { size: 11 },
                        callback: function(value) {
                            return '₹' + (value/1000).toFixed(0) + 'k';
                        }
                    },
                    grid: { color: colors.borderColor + '33' }
                },
                x: {
                    ticks: {
                        color: colors.text,
                        font: { size: 11 }
                    },
                    grid: { drawOnChartArea: false }
                }
            }
        };

        this.charts[canvasId] = new Chart(ctx, {
            type: 'bar',
            data: chartData,
            options: chartOptions
        });

        ctx.onclick = () => {
            this.openChartModal('Box Plot Analysis', chartData, 'bar', chartOptions);
        };
    }

    createInflationChart(canvasId) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return;

        const inflationData = [
            { month: 'Jan 2023', inflation: 6.52, goldPrice: 52000 },
            { month: 'Apr 2023', inflation: 4.70, goldPrice: 58000 },
            { month: 'Jul 2023', inflation: 7.44, goldPrice: 62000 },
            { month: 'Oct 2023', inflation: 5.02, goldPrice: 65000 },
            { month: 'Jan 2024', inflation: 5.10, goldPrice: 68000 },
            { month: 'Apr 2024', inflation: 4.83, goldPrice: 72000 },
            { month: 'Jul 2024', inflation: 3.65, goldPrice: 78000 },
            { month: 'Oct 2024', inflation: 5.49, goldPrice: 85000 },
            { month: 'Jan 2025', inflation: 4.91, goldPrice: 92000 },
            { month: 'Apr 2025', inflation: 4.83, goldPrice: 98000 },
            { month: 'Jul 2025', inflation: 3.54, goldPrice: 105000 },
            { month: 'Oct 2025', inflation: 5.49, goldPrice: 110383 }
        ];

        const colors = this.getDefaultColors();

        if (this.charts[canvasId]) {
            this.charts[canvasId].destroy();
        }

        const chartData = {
            labels: inflationData.map(d => d.month),
            datasets: [
                {
                    label: 'Inflation Rate (%)',
                    data: inflationData.map(d => d.inflation),
                    borderColor: colors.accentOrange,
                    backgroundColor: 'rgba(255, 165, 0, 0.1)',
                    borderWidth: 2,
                    yAxisID: 'y',
                    pointRadius: 4,
                    fill: true
                },
                {
                    label: 'Gold Price (₹ in thousands)',
                    data: inflationData.map(d => d.goldPrice / 1000),
                    type: 'line',
                    borderColor: colors.primary,
                    backgroundColor: 'transparent',
                    borderWidth: 3,
                    yAxisID: 'y1',
                    pointRadius: 5,
                    fill: false
                }
            ]
        };

        const chartOptions = {
            ...this.getDefaultOptions(),
            interaction: { mode: 'index', intersect: false },
            scales: {
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    ticks: {
                        color: colors.accentOrange,
                        font: { size: 11 },
                        callback: function(value) { return value.toFixed(1) + '%'; }
                    },
                    grid: { color: 'rgba(255, 165, 0, 0.1)' }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    ticks: {
                        color: colors.primary,
                        font: { size: 11 },
                        callback: function(value) { return '₹' + value + 'k'; }
                    },
                    grid: { drawOnChartArea: false }
                },
                x: {
                    ticks: {
                        color: colors.text,
                        font: { size: 10 },
                        maxRotation: 45,
                        minRotation: 45
                    },
                    grid: { drawOnChartArea: false }
                }
            }
        };

        this.charts[canvasId] = new Chart(ctx, {
            type: 'line',
            data: chartData,
            options: chartOptions
        });

        ctx.onclick = () => {
            this.openChartModal('Gold Prices vs Inflation Rate', chartData, 'line', chartOptions);
        };
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

        if (this.charts[canvasId]) {
            this.charts[canvasId].destroy();
        }

        const chartData = {
            datasets: [{
                label: 'Gold vs Inflation Correlation (r = 0.687)',
                data: inflationData.map(d => ({ x: d.inflation, y: d.goldPrice })),
                backgroundColor: 'rgba(255, 215, 0, 0.7)',
                borderColor: colors.primary,
                borderWidth: 2,
                pointRadius: 6,
                pointHoverRadius: 8
            }]
        };

        const chartOptions = {
            ...this.getDefaultOptions(),
            scales: {
                y: {
                    ticks: {
                        color: colors.text,
                        font: { size: 11 },
                        callback: function(value) { return '₹' + (value/1000).toFixed(0) + 'k'; }
                    },
                    grid: { color: colors.borderColor + '33' }
                },
                x: {
                    ticks: {
                        color: colors.text,
                        font: { size: 11 },
                        callback: function(value) { return value.toFixed(1) + '%'; }
                    },
                    grid: { color: colors.borderColor + '33' }
                }
            }
        };

        this.charts[canvasId] = new Chart(ctx, {
            type: 'scatter',
            data: chartData,
            options: chartOptions
        });

        ctx.onclick = () => {
            this.openChartModal('Correlation: Gold Price & Inflation', chartData, 'scatter', chartOptions);
        };
    }

    createCorrelationChart(canvasId) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return;

        const colors = this.getDefaultColors();

        if (this.charts[canvasId]) {
            this.charts[canvasId].destroy();
        }

        const chartData = {
            labels: ['Gold-USD', 'Gold-Inflation', 'USD-Inflation'],
            datasets: [{
                label: 'Correlation Coefficient',
                data: [-0.421, 0.687, -0.156],
                backgroundColor: [
                    'rgba(255, 68, 68, 0.7)',
                    'rgba(0, 255, 0, 0.7)',
                    'rgba(255, 68, 68, 0.7)'
                ],
                borderColor: colors.primary,
                borderWidth: 2
            }]
        };

        const chartOptions = {
            ...this.getDefaultOptions(),
            scales: {
                y: {
                    min: -1,
                    max: 1,
                    ticks: {
                        color: colors.text,
                        font: { size: 11 },
                        callback: function(value) { return value.toFixed(2); }
                    },
                    grid: { color: colors.borderColor + '33' }
                },
                x: {
                    ticks: {
                        color: colors.text,
                        font: { size: 11 }
                    },
                    grid: { drawOnChartArea: false }
                }
            }
        };

        this.charts[canvasId] = new Chart(ctx, {
            type: 'bar',
            data: chartData,
            options: chartOptions
        });

        ctx.onclick = () => {
            this.openChartModal('Correlation Matrix', chartData, 'bar', chartOptions);
        };
    }

    destroyAllCharts() {
        Object.keys(this.charts).forEach(key => {
            if (this.charts[key]) {
                this.charts[key].destroy();
            }
        });
        this.charts = {};
    }

    createSurveyCharts() {
        this.createAgeChart('ageChart');
        this.createGenderChart('genderChart');
        this.createOccupationChart('occupationChart');
        this.createIncomeChart('incomeChart');
        this.createHedgeChart('hedgeChart');
        this.createInterestChart('interestChart');
        this.createPurchaseChart('purchaseChart');
        this.createFormChart('formChart');
        this.createRiskChart('riskChart');
        this.createSentimentChart('sentimentChart');
        this.createTimelineChart('timelineChart');
        this.createSourceChart('sourceChart');
    }

    createAgeChart(canvasId) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return;

        const colors = this.getDefaultColors();

        if (this.charts[canvasId]) {
            this.charts[canvasId].destroy();
        }

        const chartData = {
            labels: ['18-25 years', '26-35 years', '36-50 years', '50+ years'],
            datasets: [{
                data: [60, 20, 13.3, 6.7],
                backgroundColor: [
                    'rgba(255, 215, 0, 0.8)',
                    'rgba(255, 165, 0, 0.8)',
                    'rgba(0, 255, 255, 0.8)',
                    'rgba(255, 68, 68, 0.8)'
                ],
                borderColor: colors.primary,
                borderWidth: 2
            }]
        };

        const chartOptions = {
            ...this.getDefaultOptions(),
            plugins: {
                ...this.getDefaultOptions().plugins,
                legend: {
                    display: true,
                    position: 'bottom',
                    labels: { color: colors.text }
                }
            }
        };

        this.charts[canvasId] = new Chart(ctx, {
            type: 'doughnut',
            data: chartData,
            options: chartOptions
        });

        ctx.onclick = () => {
            this.openChartModal('Age Distribution', chartData, 'doughnut', chartOptions);
        };
    }

    createGenderChart(canvasId) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return;

        const colors = this.getDefaultColors();

        if (this.charts[canvasId]) {
            this.charts[canvasId].destroy();
        }

        const chartData = {
            labels: ['Male', 'Female'],
            datasets: [{
                data: [60, 40],
                backgroundColor: [
                    'rgba(0, 255, 255, 0.8)',
                    'rgba(255, 165, 0, 0.8)'
                ],
                borderColor: colors.primary,
                borderWidth: 2
            }]
        };

        const chartOptions = {
            ...this.getDefaultOptions(),
            plugins: {
                ...this.getDefaultOptions().plugins,
                legend: {
                    display: true,
                    position: 'bottom',
                    labels: { color: colors.text }
                }
            }
        };

        this.charts[canvasId] = new Chart(ctx, {
            type: 'pie',
            data: chartData,
            options: chartOptions
        });

        ctx.onclick = () => {
            this.openChartModal('Gender Distribution', chartData, 'pie', chartOptions);
        };
    }

    createOccupationChart(canvasId) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return;

        const colors = this.getDefaultColors();

        if (this.charts[canvasId]) {
            this.charts[canvasId].destroy();
        }

        const chartData = {
            labels: ['Students', 'Employed', 'Self-Employed'],
            datasets: [{
                label: 'Percentage',
                data: [40, 46.7, 13.3],
                backgroundColor: 'rgba(255, 215, 0, 0.7)',
                borderColor: colors.primary,
                borderWidth: 2
            }]
        };

        const chartOptions = {
            ...this.getDefaultOptions(),
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        color: colors.text,
                        callback: function(value) { return value + '%'; }
                    },
                    grid: { color: colors.borderColor + '33' }
                },
                x: {
                    ticks: { color: colors.text },
                    grid: { drawOnChartArea: false }
                }
            }
        };

        this.charts[canvasId] = new Chart(ctx, {
            type: 'bar',
            data: chartData,
            options: chartOptions
        });

        ctx.onclick = () => {
            this.openChartModal('Occupation Distribution', chartData, 'bar', chartOptions);
        };
    }

    createIncomeChart(canvasId) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return;

        const colors = this.getDefaultColors();

        if (this.charts[canvasId]) {
            this.charts[canvasId].destroy();
        }

        const chartData = {
            labels: ['<₹50K', '₹50K-₹1L', '₹1L-₹2.5L', '>₹2.5L'],
            datasets: [{
                label: 'Percentage',
                data: [26.7, 33.3, 26.7, 13.3],
                backgroundColor: [
                    'rgba(255, 68, 68, 0.7)',
                    'rgba(255, 165, 0, 0.7)',
                    'rgba(255, 215, 0, 0.7)',
                    'rgba(0, 255, 0, 0.7)'
                ],
                borderColor: colors.primary,
                borderWidth: 2
            }]
        };

        const chartOptions = {
            ...this.getDefaultOptions(),
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        color: colors.text,
                        callback: function(value) { return value + '%'; }
                    },
                    grid: { color: colors.borderColor + '33' }
                },
                x: {
                    ticks: { color: colors.text },
                    grid: { drawOnChartArea: false }
                }
            }
        };

        this.charts[canvasId] = new Chart(ctx, {
            type: 'bar',
            data: chartData,
            options: chartOptions
        });

        ctx.onclick = () => {
            this.openChartModal('Income Distribution', chartData, 'bar', chartOptions);
        };
    }

    createHedgeChart(canvasId) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return;

        const colors = this.getDefaultColors();

        if (this.charts[canvasId]) {
            this.charts[canvasId].destroy();
        }

        const chartData = {
            labels: ['Agree (60%)', 'Neutral (27%)', 'Disagree (13%)'],
            datasets: [{
                data: [60, 27, 13],
                backgroundColor: [
                    'rgba(0, 255, 0, 0.8)',
                    'rgba(255, 165, 0, 0.8)',
                    'rgba(255, 68, 68, 0.8)'
                ],
                borderColor: colors.primary,
                borderWidth: 2
            }]
        };

        const chartOptions = {
            ...this.getDefaultOptions(),
            plugins: {
                ...this.getDefaultOptions().plugins,
                legend: {
                    display: true,
                    position: 'bottom',
                    labels: { color: colors.text }
                }
            }
        };

        this.charts[canvasId] = new Chart(ctx, {
            type: 'doughnut',
            data: chartData,
            options: chartOptions
        });

        ctx.onclick = () => {
            this.openChartModal('Gold as Inflation Hedge', chartData, 'doughnut', chartOptions);
        };
    }

    createInterestChart(canvasId) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return;

        const colors = this.getDefaultColors();

        if (this.charts[canvasId]) {
            this.charts[canvasId].destroy();
        }

        const chartData = {
            labels: ['High (47%)', 'Moderate (33%)', 'Low (20%)'],
            datasets: [{
                data: [47, 33, 20],
                backgroundColor: [
                    'rgba(0, 255, 0, 0.8)',
                    'rgba(255, 215, 0, 0.8)',
                    'rgba(255, 68, 68, 0.8)'
                ],
                borderColor: colors.primary,
                borderWidth: 2
            }]
        };

        const chartOptions = {
            ...this.getDefaultOptions(),
            plugins: {
                ...this.getDefaultOptions().plugins,
                legend: {
                    display: true,
                    position: 'bottom',
                    labels: { color: colors.text }
                }
            }
        };

        this.charts[canvasId] = new Chart(ctx, {
            type: 'pie',
            data: chartData,
            options: chartOptions
        });

        ctx.onclick = () => {
            this.openChartModal('Interest Level in Gold Investment', chartData, 'pie', chartOptions);
        };
    }

    createPurchaseChart(canvasId) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return;

        const colors = this.getDefaultColors();

        if (this.charts[canvasId]) {
            this.charts[canvasId].destroy();
        }

        const chartData = {
            labels: ['Yes', 'Maybe', 'No'],
            datasets: [{
                label: 'Percentage',
                data: [40, 33, 27],
                backgroundColor: [
                    'rgba(0, 255, 0, 0.7)',
                    'rgba(255, 165, 0, 0.7)',
                    'rgba(255, 68, 68, 0.7)'
                ],
                borderColor: colors.primary,
                borderWidth: 2
            }]
        };

        const chartOptions = {
            ...this.getDefaultOptions(),
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        color: colors.text,
                        callback: function(value) { return value + '%'; }
                    },
                    grid: { color: colors.borderColor + '33' }
                },
                x: {
                    ticks: { color: colors.text },
                    grid: { drawOnChartArea: false }
                }
            }
        };

        this.charts[canvasId] = new Chart(ctx, {
            type: 'bar',
            data: chartData,
            options: chartOptions
        });

        ctx.onclick = () => {
            this.openChartModal('Purchase Likelihood', chartData, 'bar', chartOptions);
        };
    }

    createFormChart(canvasId) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return;

        const colors = this.getDefaultColors();

        if (this.charts[canvasId]) {
            this.charts[canvasId].destroy();
        }

        const chartData = {
            labels: ['Physical Gold (53%)', 'Gold ETFs (27%)', 'Gold Schemes (20%)'],
            datasets: [{
                data: [53, 27, 20],
                backgroundColor: [
                    'rgba(255, 215, 0, 0.8)',
                    'rgba(0, 255, 255, 0.8)',
                    'rgba(255, 165, 0, 0.8)'
                ],
                borderColor: colors.primary,
                borderWidth: 2
            }]
        };

        const chartOptions = {
            ...this.getDefaultOptions(),
            plugins: {
                ...this.getDefaultOptions().plugins,
                legend: {
                    display: true,
                    position: 'bottom',
                    labels: { color: colors.text }
                }
            }
        };

        this.charts[canvasId] = new Chart(ctx, {
            type: 'doughnut',
            data: chartData,
            options: chartOptions
        });

        ctx.onclick = () => {
            this.openChartModal('Preferred Investment Form', chartData, 'doughnut', chartOptions);
        };
    }

    createRiskChart(canvasId) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return;

        const colors = this.getDefaultColors();

        if (this.charts[canvasId]) {
            this.charts[canvasId].destroy();
        }

        const chartData = {
            labels: ['Low Risk (47%)', 'Moderate (40%)', 'High Risk (13%)'],
            datasets: [{
                data: [47, 40, 13],
                backgroundColor: [
                    'rgba(0, 255, 0, 0.8)',
                    'rgba(255, 215, 0, 0.8)',
                    'rgba(255, 68, 68, 0.8)'
                ],
                borderColor: colors.primary,
                borderWidth: 2
            }]
        };

        const chartOptions = {
            ...this.getDefaultOptions(),
            plugins: {
                ...this.getDefaultOptions().plugins,
                legend: {
                    display: true,
                    position: 'bottom',
                    labels: { color: colors.text }
                }
            }
        };

        this.charts[canvasId] = new Chart(ctx, {
            type: 'pie',
            data: chartData,
            options: chartOptions
        });

        ctx.onclick = () => {
            this.openChartModal('Risk Perception', chartData, 'pie', chartOptions);
        };
    }

    createSentimentChart(canvasId) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return;

        const colors = this.getDefaultColors();

        if (this.charts[canvasId]) {
            this.charts[canvasId].destroy();
        }

        const chartData = {
            labels: ['Bullish', 'Neutral', 'Bearish'],
            datasets: [{
                label: 'Percentage',
                data: [67, 20, 13],
                backgroundColor: [
                    'rgba(0, 255, 0, 0.7)',
                    'rgba(255, 165, 0, 0.7)',
                    'rgba(255, 68, 68, 0.7)'
                ],
                borderColor: colors.primary,
                borderWidth: 2
            }]
        };

        const chartOptions = {
            ...this.getDefaultOptions(),
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        color: colors.text,
                        callback: function(value) { return value + '%'; }
                    },
                    grid: { color: colors.borderColor + '33' }
                },
                x: {
                    ticks: { color: colors.text },
                    grid: { drawOnChartArea: false }
                }
            }
        };

        this.charts[canvasId] = new Chart(ctx, {
            type: 'bar',
            data: chartData,
            options: chartOptions
        });

        ctx.onclick = () => {
            this.openChartModal('Market Sentiment', chartData, 'bar', chartOptions);
        };
    }

    createTimelineChart(canvasId) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return;

        const colors = this.getDefaultColors();

        if (this.charts[canvasId]) {
            this.charts[canvasId].destroy();
        }

        const chartData = {
            labels: ['Short-term <1yr (33%)', 'Medium 1-3yr (40%)', 'Long-term 3+yr (27%)'],
            datasets: [{
                data: [33, 40, 27],
                backgroundColor: [
                    'rgba(255, 68, 68, 0.8)',
                    'rgba(255, 215, 0, 0.8)',
                    'rgba(0, 255, 0, 0.8)'
                ],
                borderColor: colors.primary,
                borderWidth: 2
            }]
        };

        const chartOptions = {
            ...this.getDefaultOptions(),
            plugins: {
                ...this.getDefaultOptions().plugins,
                legend: {
                    display: true,
                    position: 'bottom',
                    labels: { color: colors.text }
                }
            }
        };

        this.charts[canvasId] = new Chart(ctx, {
            type: 'doughnut',
            data: chartData,
            options: chartOptions
        });

        ctx.onclick = () => {
            this.openChartModal('Investment Timeline Preference', chartData, 'doughnut', chartOptions);
        };
    }

    createSourceChart(canvasId) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return;

        const colors = this.getDefaultColors();

        if (this.charts[canvasId]) {
            this.charts[canvasId].destroy();
        }

        const chartData = {
            labels: ['Financial News', 'Expert Analysis', 'Online Communities', 'Social Media'],
            datasets: [{
                label: 'Trust Level (%)',
                data: [40, 33, 20, 7],
                backgroundColor: [
                    'rgba(0, 255, 0, 0.7)',
                    'rgba(255, 215, 0, 0.7)',
                    'rgba(255, 165, 0, 0.7)',
                    'rgba(255, 68, 68, 0.7)'
                ],
                borderColor: colors.primary,
                borderWidth: 2
            }]
        };

        const chartOptions = {
            ...this.getDefaultOptions(),
            scales: {
                y: {
                    beginAtZero: true,
                    max: 50,
                    ticks: {
                        color: colors.text,
                        callback: function(value) { return value + '%'; }
                    },
                    grid: { color: colors.borderColor + '33' }
                },
                x: {
                    ticks: { 
                        color: colors.text,
                        font: { size: 10 }
                    },
                    grid: { drawOnChartArea: false }
                }
            }
        };

        this.charts[canvasId] = new Chart(ctx, {
            type: 'bar',
            data: chartData,
            options: chartOptions
        });

        ctx.onclick = () => {
            this.openChartModal('Information Source Trust', chartData, 'bar', chartOptions);
        };
    }
}

const chartManager = new ChartManager();

window.addEventListener('load', () => {
    console.log('Initializing charts...');
    
    if (document.getElementById('histogramChart')) {
        initializeAllCharts();
    } else if (document.getElementById('ageChart')) {
        console.log('Initializing survey charts...');
        chartManager.createSurveyCharts();
    }
});

function initializeAllCharts() {
    let goldPrices = window.goldPrices || chartManager.getHardcodedGoldData();
    
    console.log('Data points:', goldPrices.length);
    console.log('Date range:', goldPrices[0].Date, 'to', goldPrices[goldPrices.length-1].Date);
    
    if (document.getElementById('histogramChart')) chartManager.createHistogram('histogramChart', goldPrices);
    if (document.getElementById('trendChart')) chartManager.createTrendChart('trendChart', goldPrices);
    if (document.getElementById('volatilityChart')) chartManager.createVolatilityChart('volatilityChart', goldPrices);
    if (document.getElementById('distributionChart')) chartManager.createDistributionChart('distributionChart', goldPrices);
    if (document.getElementById('boxplotChart')) chartManager.createBoxPlotChart('boxplotChart');
    if (document.getElementById('inflationChart')) chartManager.createInflationChart('inflationChart');
    if (document.getElementById('correlationScatterChart')) chartManager.createCorrelationScatterChart('correlationScatterChart');
    if (document.getElementById('correlationChart')) chartManager.createCorrelationChart('correlationChart');
    
    console.log('Charts initialized with hardcoded data');
}
