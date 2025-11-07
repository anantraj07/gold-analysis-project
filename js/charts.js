/* ============================================
   GOLD PRICE ANALYSIS - CHARTS.JS (FINAL)
   Complete working solution for all pages
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

    variance() {
        const mean = this.mean();
        return this.values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / this.values.length;
    }

    coefficientOfVariation() {
        const mean = this.mean();
        if (mean === 0) return 0;
        return (this.standardDeviation() / mean) * 100;
    }

    range() {
        return this.max() - this.min();
    }

    quartile(q) {
        const sorted = [...this.values].sort((a, b) => a - b);
        const pos = (q / 4) * (sorted.length - 1);
        const base = Math.floor(pos);
        const rest = pos - base;
        if (base + 1 < sorted.length) {
            return sorted[base] + rest * (sorted[base + 1] - sorted[base]);
        }
        return sorted[base];
    }

    Q1() { return this.quartile(1); }
    Q2() { return this.quartile(2); }
    Q3() { return this.quartile(3); }

    IQR() { return this.Q3() - this.Q1(); }

    skewness() {
        const avg = this.mean();
        const std = this.standardDeviation();
        const n = this.values.length;
        if (std === 0) return 0;
        const m3 = this.values.reduce((sum, val) => sum + Math.pow(val - avg, 3), 0) / n;
        return m3 / Math.pow(std, 3);
    }

    kurtosis() {
        const avg = this.mean();
        const std = this.standardDeviation();
        const n = this.values.length;
        if (std === 0) return 0;
        const m4 = this.values.reduce((sum, val) => sum + Math.pow(val - avg, 4), 0) / n;
        return (m4 / Math.pow(std, 4)) - 3;
    }

    percentile(p) {
        const sorted = [...this.values].sort((a, b) => a - b);
        const index = (p / 100) * (sorted.length - 1);
        const lower = Math.floor(index);
        const upper = lower + 1;
        const weight = index % 1;
        if (lower < 0) return sorted[0];
        if (upper >= sorted.length) return sorted[sorted.length - 1];
        return sorted[lower] * (1 - weight) + sorted[upper] * weight;
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
                    background-color: #1a1a1a;
                    margin: 2% auto;
                    padding: 2rem;
                    border: 2px solid #FFD700;
                    border-radius: 12px;
                    width: 95%;
                    max-width: 1400px;
                    position: relative;
                }

                .chart-modal-close {
                    color: #FFD700;
                    position: absolute;
                    top: 1rem;
                    right: 1.5rem;
                    font-size: 2.5rem;
                    font-weight: bold;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }

                .chart-modal-close:hover {
                    color: #DAA520;
                    transform: scale(1.1);
                }

                .chart-modal-content h3 {
                    color: #FFD700;
                    margin-bottom: 1.5rem;
                    font-size: 1.5rem;
                    text-align: center;
                }

                .chart-modal-content canvas {
                    width: 100% !important;
                    height: 600px !important;
                    max-height: 70vh;
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
            if (this.charts['modalCanvas']) {
                this.charts['modalCanvas'].destroy();
                delete this.charts['modalCanvas'];
            }
        };

        window.onclick = (event) => {
            if (event.target === modal) {
                modal.style.display = 'none';
                if (this.charts['modalCanvas']) {
                    this.charts['modalCanvas'].destroy();
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
            options: { ...chartOptions, maintainAspectRatio: false }
        });
    }

    getDefaultOptions() {
        return {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: { color: '#ffffff', font: { size: 12 }, padding: 15 }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: '#FFD700',
                    bodyColor: '#ffffff',
                    borderColor: '#FFD700',
                    borderWidth: 1,
                    padding: 10
                }
            },
            scales: {
                y: { ticks: { color: '#ffffff', font: { size: 11 } }, grid: { color: 'rgba(255, 255, 255, 0.1)' } },
                x: { ticks: { color: '#ffffff', font: { size: 11 } }, grid: { drawOnChartArea: false } }
            }
        };
    }

    // ===== PRICE ANALYSIS CHARTS =====
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

        if (this.charts[canvasId]) this.charts[canvasId].destroy();

        const chartData = {
            labels: binLabels,
            datasets: [{
                label: 'Frequency',
                data: binCounts,
                backgroundColor: 'rgba(255, 215, 0, 0.6)',
                borderColor: '#FFD700',
                borderWidth: 2
            }]
        };

        const chartOptions = this.getDefaultOptions();
        this.charts[canvasId] = new Chart(ctx, { type: 'bar', data: chartData, options: chartOptions });
        ctx.style.cursor = 'pointer';
        ctx.onclick = () => this.openChartModal('Price Distribution Histogram', chartData, 'bar', chartOptions);
    }

    createTrendChart(canvasId, data) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return;

        const monthlyData = {};
        data.forEach(d => {
            const date = new Date(d.Date);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            if (!monthlyData[monthKey]) {
                monthlyData[monthKey] = { dates: [], prices: [] };
            }
            monthlyData[monthKey].dates.push(date);
            monthlyData[monthKey].prices.push(parseFloat(d.Gold_Price_INR));
        });

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

        if (this.charts[canvasId]) this.charts[canvasId].destroy();

        const chartData = {
            labels: sampledDates,
            datasets: [{
                label: 'Gold Price (₹ per 10g)',
                data: sampledPrices,
                borderColor: '#FFD700',
                backgroundColor: 'rgba(255, 215, 0, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.3,
                pointRadius: 3,
                pointHoverRadius: 6,
                pointBackgroundColor: '#00ffff'
            }]
        };

        const chartOptions = { ...this.getDefaultOptions(), scales: { ...this.getDefaultOptions().scales, x: { ticks: { color: '#ffffff', font: { size: 10 }, maxRotation: 45, minRotation: 45, autoSkip: true, maxTicksLimit: 15 }, grid: { drawOnChartArea: false } } } };
        this.charts[canvasId] = new Chart(ctx, { type: 'line', data: chartData, options: chartOptions });
        ctx.style.cursor = 'pointer';
        ctx.onclick = () => this.openChartModal('Price Trend Over Time', chartData, 'line', chartOptions);
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
            if (!quarterlyData[quarterKey]) quarterlyData[quarterKey] = [];
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

        if (this.charts[canvasId]) this.charts[canvasId].destroy();

        const chartData = {
            labels: quarters,
            datasets: [{
                label: 'Volatility (Std Dev)',
                data: volatilities,
                backgroundColor: volatilities.map(v => v > 3000 ? 'rgba(255, 68, 68, 0.6)' : v > 2000 ? 'rgba(255, 165, 0, 0.6)' : 'rgba(0, 255, 0, 0.6)'),
                borderColor: '#FFD700',
                borderWidth: 2
            }]
        };

        const chartOptions = this.getDefaultOptions();
        this.charts[canvasId] = new Chart(ctx, { type: 'bar', data: chartData, options: chartOptions });
        ctx.style.cursor = 'pointer';
        ctx.onclick = () => this.openChartModal('Quarterly Volatility Analysis', chartData, 'bar', chartOptions);
    }

    createDistributionChart(canvasId, data) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return;

        const calc = new StatisticsCalculator(data);
        const mean = calc.mean();
        const std = calc.standardDeviation();
        const x = [], y = [];
        for (let i = mean - 4 * std; i <= mean + 4 * std; i += std / 8) {
            x.push(i);
            const z = (i - mean) / std;
            y.push(Math.exp(-0.5 * z * z) / (std * Math.sqrt(2 * Math.PI)) * 1000000);
        }

        if (this.charts[canvasId]) this.charts[canvasId].destroy();

        const chartData = {
            labels: x.map(v => `₹${Math.round(v/1000)}k`),
            datasets: [{
                label: 'Normal Distribution',
                data: y,
                borderColor: '#FFD700',
                backgroundColor: 'rgba(255, 215, 0, 0.2)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointRadius: 0
            }]
        };

        const chartOptions = this.getDefaultOptions();
        this.charts[canvasId] = new Chart(ctx, { type: 'line', data: chartData, options: chartOptions });
        ctx.style.cursor = 'pointer';
        ctx.onclick = () => this.openChartModal('Normal Distribution Analysis', chartData, 'line', chartOptions);
    }

    createBoxPlotChart(canvasId, data) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return;

        const calc = new StatisticsCalculator(data);
        if (this.charts[canvasId]) this.charts[canvasId].destroy();

        const chartData = {
            labels: ['Min', 'Q1', 'Median', 'Q3', 'Max'],
            datasets: [{
                label: 'Gold Price Distribution',
                data: [Math.round(calc.min()), Math.round(calc.Q1()), Math.round(calc.median()), Math.round(calc.Q3()), Math.round(calc.max())],
                backgroundColor: ['rgba(255, 68, 68, 0.6)', 'rgba(255, 215, 0, 0.4)', 'rgba(255, 215, 0, 0.6)', 'rgba(255, 215, 0, 0.4)', 'rgba(0, 255, 0, 0.6)'],
                borderColor: '#FFD700',
                borderWidth: 2
            }]
        };

        const chartOptions = { ...this.getDefaultOptions(), scales: { y: { beginAtZero: true, ticks: { color: '#ffffff', font: { size: 11 }, callback: function(value) { return '₹' + (value/1000).toFixed(0) + 'k'; } }, grid: { color: 'rgba(255, 255, 255, 0.1)' } }, x: { ticks: { color: '#ffffff', font: { size: 11 } }, grid: { drawOnChartArea: false } } } };
        this.charts[canvasId] = new Chart(ctx, { type: 'bar', data: chartData, options: chartOptions });
        ctx.style.cursor = 'pointer';
        ctx.onclick = () => this.openChartModal('Box Plot Analysis', chartData, 'bar', chartOptions);
    }

    createInflationChart(canvasId) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return;

        const inflationData = [
            { month: 'Jan 23', inflation: 6.52, goldPrice: 50485 },
            { month: 'Apr 23', inflation: 4.70, goldPrice: 51375 },
            { month: 'Jul 23', inflation: 7.44, goldPrice: 59200 },
            { month: 'Oct 23', inflation: 5.02, goldPrice: 64200 },
            { month: 'Jan 24', inflation: 5.10, goldPrice: 71200 },
            { month: 'Apr 24', inflation: 4.83, goldPrice: 77800 },
            { month: 'Jul 24', inflation: 3.65, goldPrice: 83800 },
            { month: 'Oct 24', inflation: 5.49, goldPrice: 89200 },
            { month: 'Jan 25', inflation: 4.91, goldPrice: 95800 },
            { month: 'Apr 25', inflation: 4.83, goldPrice: 101200 },
            { month: 'Jul 25', inflation: 3.54, goldPrice: 107800 },
            { month: 'Oct 25', inflation: 5.49, goldPrice: 110383 }
        ];

        if (this.charts[canvasId]) this.charts[canvasId].destroy();

        const chartData = {
            labels: inflationData.map(d => d.month),
            datasets: [
                {
                    label: 'Inflation Rate (%)',
                    data: inflationData.map(d => d.inflation),
                    borderColor: '#FFA500',
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
                    borderColor: '#FFD700',
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
                y: { type: 'linear', display: true, position: 'left', ticks: { color: '#FFA500', font: { size: 11 }, callback: function(value) { return value.toFixed(1) + '%'; } }, grid: { color: 'rgba(255, 165, 0, 0.1)' } },
                y1: { type: 'linear', display: true, position: 'right', ticks: { color: '#FFD700', font: { size: 11 }, callback: function(value) { return '₹' + value + 'k'; } }, grid: { drawOnChartArea: false } },
                x: { ticks: { color: '#ffffff', font: { size: 10 }, maxRotation: 45, minRotation: 45 }, grid: { drawOnChartArea: false } }
            }
        };

        this.charts[canvasId] = new Chart(ctx, { type: 'line', data: chartData, options: chartOptions });
        ctx.style.cursor = 'pointer';
        ctx.onclick = () => this.openChartModal('Gold Prices vs Inflation Rate', chartData, 'line', chartOptions);
    }

    createCorrelationScatterChart(canvasId) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return;

        const inflationData = [
            { inflation: 6.52, goldPrice: 50485 },
            { inflation: 4.70, goldPrice: 51375 },
            { inflation: 7.44, goldPrice: 59200 },
            { inflation: 5.02, goldPrice: 64200 },
            { inflation: 5.10, goldPrice: 71200 },
            { inflation: 4.83, goldPrice: 77800 },
            { inflation: 3.65, goldPrice: 83800 },
            { inflation: 5.49, goldPrice: 89200 },
            { inflation: 4.91, goldPrice: 95800 },
            { inflation: 4.83, goldPrice: 101200 },
            { inflation: 3.54, goldPrice: 107800 },
            { inflation: 5.49, goldPrice: 110383 }
        ];

        if (this.charts[canvasId]) this.charts[canvasId].destroy();

        const chartData = {
            datasets: [{
                label: 'Gold vs Inflation Correlation',
                data: inflationData.map(d => ({ x: d.inflation, y: d.goldPrice })),
                backgroundColor: 'rgba(255, 215, 0, 0.7)',
                borderColor: '#FFD700',
                borderWidth: 2,
                pointRadius: 6,
                pointHoverRadius: 8
            }]
        };

        const chartOptions = { ...this.getDefaultOptions(), scales: { y: { ticks: { color: '#ffffff', font: { size: 11 }, callback: function(value) { return '₹' + (value/1000).toFixed(0) + 'k'; } }, grid: { color: 'rgba(255, 255, 255, 0.1)' } }, x: { ticks: { color: '#ffffff', font: { size: 11 }, callback: function(value) { return value.toFixed(1) + '%'; } }, grid: { color: 'rgba(255, 255, 255, 0.1)' } } } };
        this.charts[canvasId] = new Chart(ctx, { type: 'scatter', data: chartData, options: chartOptions });
        ctx.style.cursor = 'pointer';
        ctx.onclick = () => this.openChartModal('Correlation: Gold Price & Inflation', chartData, 'scatter', chartOptions);
    }

    createCorrelationChart(canvasId) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return;

        if (this.charts[canvasId]) this.charts[canvasId].destroy();

        const chartData = {
            labels: ['Gold-USD', 'Gold-Inflation', 'USD-Inflation'],
            datasets: [{
                label: 'Correlation Coefficient',
                data: [-0.998, 0.215, -0.156],
                backgroundColor: ['rgba(255, 68, 68, 0.7)', 'rgba(255, 165, 0, 0.7)', 'rgba(255, 68, 68, 0.7)'],
                borderColor: '#FFD700',
                borderWidth: 2
            }]
        };

        const chartOptions = { ...this.getDefaultOptions(), scales: { y: { min: -1, max: 1, ticks: { color: '#ffffff', font: { size: 11 }, callback: function(value) { return value.toFixed(2); } }, grid: { color: 'rgba(255, 255, 255, 0.1)' } }, x: { ticks: { color: '#ffffff', font: { size: 11 } }, grid: { drawOnChartArea: false } } } };
        this.charts[canvasId] = new Chart(ctx, { type: 'bar', data: chartData, options: chartOptions });
        ctx.style.cursor = 'pointer';
        ctx.onclick = () => this.openChartModal('Correlation Matrix', chartData, 'bar', chartOptions);
    }

    // ===== STATISTICS CHARTS =====
    createSummaryStatsChart(canvasId, data) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return;

        const calc = new StatisticsCalculator(data);
        if (this.charts[canvasId]) this.charts[canvasId].destroy();

        const chartData = {
            labels: ['Mean', 'Median', 'Std Dev', 'Min', 'Q1', 'Q2', 'Q3', 'Max'],
            datasets: [{
                label: 'Value (₹ thousands)',
                data: [calc.mean() / 1000, calc.median() / 1000, calc.standardDeviation() / 1000, calc.min() / 1000, calc.Q1() / 1000, calc.Q2() / 1000, calc.Q3() / 1000, calc.max() / 1000],
                backgroundColor: ['rgba(255, 215, 0, 0.7)', 'rgba(0, 255, 255, 0.7)', 'rgba(255, 165, 0, 0.7)', 'rgba(255, 68, 68, 0.7)', 'rgba(0, 255, 0, 0.7)', 'rgba(100, 200, 255, 0.7)', 'rgba(200, 100, 255, 0.7)', 'rgba(255, 100, 200, 0.7)'],
                borderColor: '#FFD700',
                borderWidth: 2
            }]
        };

        const chartOptions = this.getDefaultOptions();
        this.charts[canvasId] = new Chart(ctx, { type: 'bar', data: chartData, options: chartOptions });
        ctx.style.cursor = 'pointer';
        ctx.onclick = () => this.openChartModal('Summary Statistics', chartData, 'bar', chartOptions);
    }

    createDispersionChart(canvasId, data) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return;

        const calc = new StatisticsCalculator(data);
        if (this.charts[canvasId]) this.charts[canvasId].destroy();

        const chartData = {
            labels: ['Variance', 'Std Dev', 'Range', 'IQR', 'CV (%)'],
            datasets: [{
                label: 'Dispersion Metrics',
                data: [calc.variance() / 1000000, calc.standardDeviation() / 1000, calc.range() / 1000, calc.IQR() / 1000, calc.coefficientOfVariation()],
                backgroundColor: ['rgba(255, 68, 68, 0.7)', 'rgba(255, 165, 0, 0.7)', 'rgba(255, 215, 0, 0.7)', 'rgba(0, 255, 0, 0.7)', 'rgba(0, 255, 255, 0.7)'],
                borderColor: '#FFD700',
                borderWidth: 2
            }]
        };

        const chartOptions = { ...this.getDefaultOptions(), scales: { r: { grid: { color: 'rgba(255, 255, 255, 0.1)' }, ticks: { color: '#ffffff' } } } };
        this.charts[canvasId] = new Chart(ctx, { type: 'radar', data: chartData, options: chartOptions });
        ctx.style.cursor = 'pointer';
        ctx.onclick = () => this.openChartModal('Dispersion Analysis', chartData, 'radar', chartOptions);
    }

    createPercentileChart(canvasId, data) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return;

        const calc = new StatisticsCalculator(data);
        if (this.charts[canvasId]) this.charts[canvasId].destroy();

        const percentiles = [5, 10, 25, 50, 75, 90, 95];
        const values = percentiles.map(p => calc.percentile(p) / 1000);

        const chartData = {
            labels: percentiles.map(p => `P${p}`),
            datasets: [{
                label: 'Price (₹ thousands)',
                data: values,
                borderColor: '#FFD700',
                backgroundColor: 'rgba(255, 215, 0, 0.2)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointRadius: 5,
                pointBackgroundColor: '#00ffff',
                pointBorderColor: '#FFD700',
                pointBorderWidth: 2
            }]
        };

        const chartOptions = this.getDefaultOptions();
        this.charts[canvasId] = new Chart(ctx, { type: 'line', data: chartData, options: chartOptions });
        ctx.style.cursor = 'pointer';
        ctx.onclick = () => this.openChartModal('Percentile Distribution', chartData, 'line', chartOptions);
    }

    createShapeMetricsChart(canvasId, data) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return;

        const calc = new StatisticsCalculator(data);
        if (this.charts[canvasId]) this.charts[canvasId].destroy();

        const skewness = parseFloat(calc.skewness());
        const kurtosis = parseFloat(calc.kurtosis());

        const chartData = {
            labels: ['Skewness', 'Kurtosis'],
            datasets: [{
                label: 'Distribution Shape',
                data: [skewness, kurtosis],
                backgroundColor: [skewness > 0 ? 'rgba(0, 255, 0, 0.7)' : 'rgba(255, 68, 68, 0.7)', kurtosis > 0 ? 'rgba(255, 215, 0, 0.7)' : 'rgba(0, 255, 255, 0.7)'],
                borderColor: '#FFD700',
                borderWidth: 2
            }]
        };

        const chartOptions = { ...this.getDefaultOptions(), scales: { y: { ticks: { color: '#ffffff', callback: function(value) { return value.toFixed(2); } }, grid: { color: 'rgba(255, 255, 255, 0.1)' } } } };
        this.charts[canvasId] = new Chart(ctx, { type: 'bar', data: chartData, options: chartOptions });
        ctx.style.cursor = 'pointer';
        ctx.onclick = () => this.openChartModal('Distribution Shape Metrics', chartData, 'bar', chartOptions);
    }

    createQuartileChart(canvasId, data) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return;

        const calc = new StatisticsCalculator(data);
        if (this.charts[canvasId]) this.charts[canvasId].destroy();

        const chartData = {
            labels: ['Q1', 'Q2\n(Median)', 'Q3'],
            datasets: [{
                label: 'Quartile Values (₹)',
                data: [calc.Q1(), calc.Q2(), calc.Q3()],
                backgroundColor: ['rgba(255, 215, 0, 0.4)', 'rgba(255, 215, 0, 0.7)', 'rgba(255, 215, 0, 0.4)'],
                borderColor: '#FFD700',
                borderWidth: 3
            }]
        };

        const chartOptions = { ...this.getDefaultOptions(), scales: { y: { ticks: { color: '#ffffff', callback: function(value) { return '₹' + (value/1000).toFixed(0) + 'k'; } }, grid: { color: 'rgba(255, 255, 255, 0.1)' } } } };
        this.charts[canvasId] = new Chart(ctx, { type: 'bar', data: chartData, options: chartOptions });
        ctx.style.cursor = 'pointer';
        ctx.onclick = () => this.openChartModal('Quartile Analysis', chartData, 'bar', chartOptions);
    }

    createDistributionCurveChart(canvasId, data) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return;

        const calc = new StatisticsCalculator(data);
        const mean = calc.mean();
        const std = calc.standardDeviation();
        if (this.charts[canvasId]) this.charts[canvasId].destroy();

        const x = [], y = [];
        for (let i = mean - 4 * std; i <= mean + 4 * std; i += std / 8) {
            x.push(i);
            const z = (i - mean) / std;
            y.push(Math.exp(-0.5 * z * z) / (std * Math.sqrt(2 * Math.PI)) * 1000000);
        }

        const chartData = {
            labels: x.map(v => `₹${Math.round(v/1000)}k`),
            datasets: [{
                label: 'Normal Distribution Curve',
                data: y,
                borderColor: '#FFD700',
                backgroundColor: 'rgba(255, 215, 0, 0.15)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointRadius: 0
            }]
        };

        const chartOptions = this.getDefaultOptions();
        this.charts[canvasId] = new Chart(ctx, { type: 'line', data: chartData, options: chartOptions });
        ctx.style.cursor = 'pointer';
        ctx.onclick = () => this.openChartModal('Distribution Curve', chartData, 'line', chartOptions);
    }

    // ===== SURVEY CHARTS =====
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
        if (this.charts[canvasId]) this.charts[canvasId].destroy();

        const chartData = {
            labels: ['18-25', '26-35', '36-50', '50+'],
            datasets: [{
                data: [60, 20, 13.3, 6.7],
                backgroundColor: ['rgba(255, 215, 0, 0.8)', 'rgba(255, 165, 0, 0.8)', 'rgba(0, 255, 255, 0.8)', 'rgba(255, 68, 68, 0.8)'],
                borderColor: '#FFD700',
                borderWidth: 2
            }]
        };

        const chartOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { color: '#ffffff' } } } };
        this.charts[canvasId] = new Chart(ctx, { type: 'doughnut', data: chartData, options: chartOptions });
        ctx.style.cursor = 'pointer';
        ctx.onclick = () => this.openChartModal('Age Distribution', chartData, 'doughnut', chartOptions);
    }

    createGenderChart(canvasId) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return;
        if (this.charts[canvasId]) this.charts[canvasId].destroy();

        const chartData = {
            labels: ['Male', 'Female'],
            datasets: [{
                data: [60, 40],
                backgroundColor: ['rgba(0, 255, 255, 0.8)', 'rgba(255, 165, 0, 0.8)'],
                borderColor: '#FFD700',
                borderWidth: 2
            }]
        };

        const chartOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { color: '#ffffff' } } } };
        this.charts[canvasId] = new Chart(ctx, { type: 'pie', data: chartData, options: chartOptions });
        ctx.style.cursor = 'pointer';
        ctx.onclick = () => this.openChartModal('Gender Distribution', chartData, 'pie', chartOptions);
    }

    createOccupationChart(canvasId) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return;
        if (this.charts[canvasId]) this.charts[canvasId].destroy();

        const chartData = {
            labels: ['Students', 'Employed', 'Self-Employed'],
            datasets: [{
                label: 'Percentage',
                data: [40, 46.7, 13.3],
                backgroundColor: 'rgba(255, 215, 0, 0.7)',
                borderColor: '#FFD700',
                borderWidth: 2
            }]
        };

        const chartOptions = { ...this.getDefaultOptions(), scales: { y: { beginAtZero: true, max: 100, ticks: { color: '#ffffff', callback: v => v + '%' }, grid: { color: 'rgba(255, 255, 255, 0.1)' } }, x: { ticks: { color: '#ffffff' }, grid: { drawOnChartArea: false } } } };
        this.charts[canvasId] = new Chart(ctx, { type: 'bar', data: chartData, options: chartOptions });
        ctx.style.cursor = 'pointer';
        ctx.onclick = () => this.openChartModal('Occupation Distribution', chartData, 'bar', chartOptions);
    }

    createIncomeChart(canvasId) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return;
        if (this.charts[canvasId]) this.charts[canvasId].destroy();

        const chartData = {
            labels: ['<₹50K', '₹50K-₹1L', '₹1L-₹2.5L', '>₹2.5L'],
            datasets: [{
                label: 'Percentage',
                data: [26.7, 33.3, 26.7, 13.3],
                backgroundColor: ['rgba(255, 68, 68, 0.7)', 'rgba(255, 165, 0, 0.7)', 'rgba(255, 215, 0, 0.7)', 'rgba(0, 255, 0, 0.7)'],
                borderColor: '#FFD700',
                borderWidth: 2
            }]
        };

        const chartOptions = { ...this.getDefaultOptions(), scales: { y: { beginAtZero: true, max: 100, ticks: { color: '#ffffff', callback: v => v + '%' }, grid: { color: 'rgba(255, 255, 255, 0.1)' } }, x: { ticks: { color: '#ffffff' }, grid: { drawOnChartArea: false } } } };
        this.charts[canvasId] = new Chart(ctx, { type: 'bar', data: chartData, options: chartOptions });
        ctx.style.cursor = 'pointer';
        ctx.onclick = () => this.openChartModal('Income Distribution', chartData, 'bar', chartOptions);
    }

    createHedgeChart(canvasId) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return;
        if (this.charts[canvasId]) this.charts[canvasId].destroy();

        const chartData = {
            labels: ['Agree (60%)', 'Neutral (27%)', 'Disagree (13%)'],
            datasets: [{
                data: [60, 27, 13],
                backgroundColor: ['rgba(0, 255, 0, 0.8)', 'rgba(255, 165, 0, 0.8)', 'rgba(255, 68, 68, 0.8)'],
                borderColor: '#FFD700',
                borderWidth: 2
            }]
        };

        const chartOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { color: '#ffffff' } } } };
        this.charts[canvasId] = new Chart(ctx, { type: 'doughnut', data: chartData, options: chartOptions });
        ctx.style.cursor = 'pointer';
        ctx.onclick = () => this.openChartModal('Gold as Inflation Hedge', chartData, 'doughnut', chartOptions);
    }

    createInterestChart(canvasId) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return;
        if (this.charts[canvasId]) this.charts[canvasId].destroy();

        const chartData = {
            labels: ['High (47%)', 'Moderate (33%)', 'Low (20%)'],
            datasets: [{
                data: [47, 33, 20],
                backgroundColor: ['rgba(0, 255, 0, 0.8)', 'rgba(255, 215, 0, 0.8)', 'rgba(255, 68, 68, 0.8)'],
                borderColor: '#FFD700',
                borderWidth: 2
            }]
        };

        const chartOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { color: '#ffffff' } } } };
        this.charts[canvasId] = new Chart(ctx, { type: 'pie', data: chartData, options: chartOptions });
        ctx.style.cursor = 'pointer';
        ctx.onclick = () => this.openChartModal('Interest Level in Gold Investment', chartData, 'pie', chartOptions);
    }

    createPurchaseChart(canvasId) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return;
        if (this.charts[canvasId]) this.charts[canvasId].destroy();

        const chartData = {
            labels: ['Yes', 'Maybe', 'No'],
            datasets: [{
                label: 'Percentage',
                data: [40, 33, 27],
                backgroundColor: ['rgba(0, 255, 0, 0.7)', 'rgba(255, 165, 0, 0.7)', 'rgba(255, 68, 68, 0.7)'],
                borderColor: '#FFD700',
                borderWidth: 2
            }]
        };

        const chartOptions = { ...this.getDefaultOptions(), scales: { y: { beginAtZero: true, max: 100, ticks: { color: '#ffffff', callback: v => v + '%' }, grid: { color: 'rgba(255, 255, 255, 0.1)' } }, x: { ticks: { color: '#ffffff' }, grid: { drawOnChartArea: false } } } };
        this.charts[canvasId] = new Chart(ctx, { type: 'bar', data: chartData, options: chartOptions });
        ctx.style.cursor = 'pointer';
        ctx.onclick = () => this.openChartModal('Purchase Likelihood', chartData, 'bar', chartOptions);
    }

    createFormChart(canvasId) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return;
        if (this.charts[canvasId]) this.charts[canvasId].destroy();

        const chartData = {
            labels: ['Physical Gold (53%)', 'Gold ETFs (27%)', 'Gold Schemes (20%)'],
            datasets: [{
                data: [53, 27, 20],
                backgroundColor: ['rgba(255, 215, 0, 0.8)', 'rgba(0, 255, 255, 0.8)', 'rgba(255, 165, 0, 0.8)'],
                borderColor: '#FFD700',
                borderWidth: 2
            }]
        };

        const chartOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { color: '#ffffff' } } } };
        this.charts[canvasId] = new Chart(ctx, { type: 'doughnut', data: chartData, options: chartOptions });
        ctx.style.cursor = 'pointer';
        ctx.onclick = () => this.openChartModal('Preferred Investment Form', chartData, 'doughnut', chartOptions);
    }

    createRiskChart(canvasId) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return;
        if (this.charts[canvasId]) this.charts[canvasId].destroy();

        const chartData = {
            labels: ['Low Risk (47%)', 'Moderate (40%)', 'High Risk (13%)'],
            datasets: [{
                data: [47, 40, 13],
                backgroundColor: ['rgba(0, 255, 0, 0.8)', 'rgba(255, 215, 0, 0.8)', 'rgba(255, 68, 68, 0.8)'],
                borderColor: '#FFD700',
                borderWidth: 2
            }]
        };

        const chartOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { color: '#ffffff' } } } };
        this.charts[canvasId] = new Chart(ctx, { type: 'pie', data: chartData, options: chartOptions });
        ctx.style.cursor = 'pointer';
        ctx.onclick = () => this.openChartModal('Risk Perception', chartData, 'pie', chartOptions);
    }

    createSentimentChart(canvasId) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return;
        if (this.charts[canvasId]) this.charts[canvasId].destroy();

        const chartData = {
            labels: ['Bullish', 'Neutral', 'Bearish'],
            datasets: [{
                label: 'Percentage',
                data: [67, 20, 13],
                backgroundColor: ['rgba(0, 255, 0, 0.7)', 'rgba(255, 165, 0, 0.7)', 'rgba(255, 68, 68, 0.7)'],
                borderColor: '#FFD700',
                borderWidth: 2
            }]
        };

        const chartOptions = { ...this.getDefaultOptions(), scales: { y: { beginAtZero: true, max: 100, ticks: { color: '#ffffff', callback: v => v + '%' }, grid: { color: 'rgba(255, 255, 255, 0.1)' } }, x: { ticks: { color: '#ffffff' }, grid: { drawOnChartArea: false } } } };
        this.charts[canvasId] = new Chart(ctx, { type: 'bar', data: chartData, options: chartOptions });
        ctx.style.cursor = 'pointer';
        ctx.onclick = () => this.openChartModal('Market Sentiment', chartData, 'bar', chartOptions);
    }

    createTimelineChart(canvasId) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return;
        if (this.charts[canvasId]) this.charts[canvasId].destroy();

        const chartData = {
            labels: ['Short-term <1yr (33%)', 'Medium 1-3yr (40%)', 'Long-term 3+yr (27%)'],
            datasets: [{
                data: [33, 40, 27],
                backgroundColor: ['rgba(255, 68, 68, 0.8)', 'rgba(255, 215, 0, 0.8)', 'rgba(0, 255, 0, 0.8)'],
                borderColor: '#FFD700',
                borderWidth: 2
            }]
        };

        const chartOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { color: '#ffffff' } } } };
        this.charts[canvasId] = new Chart(ctx, { type: 'doughnut', data: chartData, options: chartOptions });
        ctx.style.cursor = 'pointer';
        ctx.onclick = () => this.openChartModal('Investment Timeline Preference', chartData, 'doughnut', chartOptions);
    }

    createSourceChart(canvasId) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return;
        if (this.charts[canvasId]) this.charts[canvasId].destroy();

        const chartData = {
            labels: ['Financial News', 'Expert Analysis', 'Online Communities', 'Social Media'],
            datasets: [{
                label: 'Trust Level (%)',
                data: [40, 33, 20, 7],
                backgroundColor: ['rgba(0, 255, 0, 0.7)', 'rgba(255, 215, 0, 0.7)', 'rgba(255, 165, 0, 0.7)', 'rgba(255, 68, 68, 0.7)'],
                borderColor: '#FFD700',
                borderWidth: 2
            }]
        };

        const chartOptions = { ...this.getDefaultOptions(), scales: { y: { beginAtZero: true, max: 50, ticks: { color: '#ffffff', callback: v => v + '%' }, grid: { color: 'rgba(255, 255, 255, 0.1)' } }, x: { ticks: { color: '#ffffff', font: { size: 10 } }, grid: { drawOnChartArea: false } } } };
        this.charts[canvasId] = new Chart(ctx, { type: 'bar', data: chartData, options: chartOptions });
        ctx.style.cursor = 'pointer';
        ctx.onclick = () => this.openChartModal('Information Source Trust', chartData, 'bar', chartOptions);
    }

    destroyAllCharts() {
        Object.keys(this.charts).forEach(key => {
            if (this.charts[key]) {
                this.charts[key].destroy();
            }
        });
        this.charts = {};
    }
}

const chartManager = new ChartManager();

window.addEventListener('load', () => {
    console.log('✓ Charts.js loaded');
    
    if (document.getElementById('histogramChart')) {
        initializeAllCharts();
    } else if (document.getElementById('summaryStatsChart')) {
        console.log('✓ Statistics page detected');
        initializeStatisticsCharts();
    } else if (document.getElementById('ageChart')) {
        console.log('✓ Survey page detected');
        chartManager.createSurveyCharts();
    }
});

function initializeAllCharts() {
    let goldPrices = window.goldPrices;
    if (!goldPrices || goldPrices.length === 0) {
        console.error('✗ Gold prices data not available!');
        return;
    }
    
    console.log('✓ Creating price analysis charts with', goldPrices.length, 'data points');
    
    if (document.getElementById('histogramChart')) chartManager.createHistogram('histogramChart', goldPrices);
    if (document.getElementById('trendChart')) chartManager.createTrendChart('trendChart', goldPrices);
    if (document.getElementById('volatilityChart')) chartManager.createVolatilityChart('volatilityChart', goldPrices);
    if (document.getElementById('distributionChart')) chartManager.createDistributionChart('distributionChart', goldPrices);
    if (document.getElementById('boxplotChart')) chartManager.createBoxPlotChart('boxplotChart', goldPrices);
    if (document.getElementById('inflationChart')) chartManager.createInflationChart('inflationChart');
    if (document.getElementById('correlationScatterChart')) chartManager.createCorrelationScatterChart('correlationScatterChart');
    if (document.getElementById('correlationChart')) chartManager.createCorrelationChart('correlationChart');
    
    console.log('✓ All price analysis charts initialized');
}

function initializeStatisticsCharts() {
    let goldPrices = window.goldPrices;
    if (!goldPrices || goldPrices.length === 0) {
        console.error('✗ Gold prices data not available!');
        return;
    }
    
    console.log('✓ Creating statistics charts with', goldPrices.length, 'data points');
    
    if (document.getElementById('summaryStatsChart')) chartManager.createSummaryStatsChart('summaryStatsChart', goldPrices);
    if (document.getElementById('dispersionChart')) chartManager.createDispersionChart('dispersionChart', goldPrices);
    if (document.getElementById('percentileChart')) chartManager.createPercentileChart('percentileChart', goldPrices);
    if (document.getElementById('shapeMetricsChart')) chartManager.createShapeMetricsChart('shapeMetricsChart', goldPrices);
    if (document.getElementById('quartileChart')) chartManager.createQuartileChart('quartileChart', goldPrices);
    if (document.getElementById('distributionCurveChart')) chartManager.createDistributionCurveChart('distributionCurveChart', goldPrices);
    
    console.log('✓ All statistics charts initialized');
}

window.chartManager = chartManager;
window.initializeCharts = initializeAllCharts;
window.initializeStatisticsCharts = initializeStatisticsCharts;
