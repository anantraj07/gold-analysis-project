/* ============================================
   GOLD PRICE ANALYSIS - CHARTS.JS (FIXED)
   All charts working with correct data
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
    Q3() { return this.quartile(3); }
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
                }

                .chart-modal-close:hover {
                    color: #DAA520;
                }

                .chart-modal-content h3 {
                    color: #FFD700;
                    margin-bottom: 1.5rem;
                }

                .chart-modal-content canvas {
                    width: 100% !important;
                    height: 600px !important;
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
                    labels: {
                        color: '#ffffff',
                        font: { size: 12 },
                        padding: 15
                    }
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
                y: {
                    ticks: { color: '#ffffff', font: { size: 11 } },
                    grid: { color: 'rgba(255, 255, 255, 0.1)' }
                },
                x: {
                    ticks: { color: '#ffffff', font: { size: 11 } },
                    grid: { drawOnChartArea: false }
                }
            }
        };
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

        if (this.charts[canvasId]) {
            this.charts[canvasId].destroy();
        }

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

        this.charts[canvasId] = new Chart(ctx, {
            type: 'bar',
            data: chartData,
            options: this.getDefaultOptions()
        });

        ctx.style.cursor = 'pointer';
        ctx.onclick = () => {
            this.openChartModal('Price Distribution Histogram', chartData, 'bar', this.getDefaultOptions());
        };
    }

    createTrendChart(canvasId, data) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return;

        const sampledData = data.filter((_, index) => index % 5 === 0 || index === data.length - 1);
        
        const labels = sampledData.map(d => {
            const date = new Date(d.Date);
            return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
        });
        
        const prices = sampledData.map(d => parseFloat(d.Gold_Price_INR));

        if (this.charts[canvasId]) {
            this.charts[canvasId].destroy();
        }

        const chartData = {
            labels: labels,
            datasets: [{
                label: 'Gold Price (₹ per 10g)',
                data: prices,
                borderColor: '#FFD700',
                backgroundColor: 'rgba(255, 215, 0, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.3,
                pointRadius: 2,
                pointHoverRadius: 6,
                pointBackgroundColor: '#00ffff'
            }]
        };

        const options = {
            ...this.getDefaultOptions(),
            scales: {
                y: {
                    ticks: {
                        color: '#ffffff',
                        callback: function(value) {
                            return '₹' + (value/1000).toFixed(0) + 'k';
                        }
                    },
                    grid: { color: 'rgba(255, 255, 255, 0.1)' }
                },
                x: {
                    ticks: {
                        color: '#ffffff',
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
            options: options
        });

        ctx.style.cursor = 'pointer';
        ctx.onclick = () => {
            this.openChartModal('Price Trend Over Time', chartData, 'line', options);
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

        if (this.charts[canvasId]) {
            this.charts[canvasId].destroy();
        }

        const chartData = {
            labels: quarters,
            datasets: [{
                label: 'Volatility (Std Dev)',
                data: volatilities,
                backgroundColor: volatilities.map(v => 
                    v > 3000 ? 'rgba(255, 68, 68, 0.6)' : 
                    v > 2000 ? 'rgba(255, 165, 0, 0.6)' : 
                    'rgba(0, 255, 0, 0.6)'
                ),
                borderColor: '#FFD700',
                borderWidth: 2
            }]
        };

        this.charts[canvasId] = new Chart(ctx, {
            type: 'bar',
            data: chartData,
            options: this.getDefaultOptions()
        });

        ctx.style.cursor = 'pointer';
        ctx.onclick = () => {
            this.openChartModal('Quarterly Volatility', chartData, 'bar', this.getDefaultOptions());
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

        if (this.charts[canvasId]) {
            this.charts[canvasId].destroy();
        }

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

        this.charts[canvasId] = new Chart(ctx, {
            type: 'line',
            data: chartData,
            options: this.getDefaultOptions()
        });

        ctx.style.cursor = 'pointer';
        ctx.onclick = () => {
            this.openChartModal('Normal Distribution', chartData, 'line', this.getDefaultOptions());
        };
    }

    createBoxPlotChart(canvasId, data) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return;

        const calc = new StatisticsCalculator(data);

        if (this.charts[canvasId]) {
            this.charts[canvasId].destroy();
        }

        const chartData = {
            labels: ['Min', 'Q1', 'Median', 'Q3', 'Max'],
            datasets: [{
                label: 'Gold Price Distribution (₹)',
                data: [
                    Math.round(calc.min()),
                    Math.round(calc.Q1()),
                    Math.round(calc.median()),
                    Math.round(calc.Q3()),
                    Math.round(calc.max())
                ],
                backgroundColor: [
                    'rgba(255, 68, 68, 0.6)',
                    'rgba(255, 215, 0, 0.4)',
                    'rgba(255, 215, 0, 0.6)',
                    'rgba(255, 215, 0, 0.4)',
                    'rgba(0, 255, 0, 0.6)'
                ],
                borderColor: '#FFD700',
                borderWidth: 2
            }]
        };

        const options = {
            ...this.getDefaultOptions(),
            scales: {
                y: {
                    ticks: {
                        color: '#ffffff',
                        callback: function(value) {
                            return '₹' + (value/1000).toFixed(0) + 'k';
                        }
                    },
                    grid: { color: 'rgba(255, 255, 255, 0.1)' }
                },
                x: {
                    ticks: { color: '#ffffff' },
                    grid: { drawOnChartArea: false }
                }
            }
        };

        this.charts[canvasId] = new Chart(ctx, {
            type: 'bar',
            data: chartData,
            options: options
        });

        ctx.style.cursor = 'pointer';
        ctx.onclick = () => {
            this.openChartModal('Box Plot Analysis', chartData, 'bar', options);
        };
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

        if (this.charts[canvasId]) {
            this.charts[canvasId].destroy();
        }

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

        const options = {
            responsive: true,
            maintainAspectRatio: false,
            interaction: { mode: 'index', intersect: false },
            plugins: {
                legend: {
                    labels: { color: '#ffffff' }
                }
            },
            scales: {
                y: {
                    type: 'linear',
                    position: 'left',
                    ticks: {
                        color: '#FFA500',
                        callback: function(value) { return value.toFixed(1) + '%'; }
                    },
                    grid: { color: 'rgba(255, 165, 0, 0.1)' }
                },
                y1: {
                    type: 'linear',
                    position: 'right',
                    ticks: {
                        color: '#FFD700',
                        callback: function(value) { return '₹' + value + 'k'; }
                    },
                    grid: { drawOnChartArea: false }
                },
                x: {
                    ticks: { color: '#ffffff' },
                    grid: { drawOnChartArea: false }
                }
            }
        };

        this.charts[canvasId] = new Chart(ctx, {
            type: 'line',
            data: chartData,
            options: options
        });

        ctx.style.cursor = 'pointer';
        ctx.onclick = () => {
            this.openChartModal('Gold vs Inflation', chartData, 'line', options);
        };
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

        if (this.charts[canvasId]) {
            this.charts[canvasId].destroy();
        }

        const chartData = {
            datasets: [{
                label: 'Gold vs Inflation',
                data: inflationData.map(d => ({ x: d.inflation, y: d.goldPrice })),
                backgroundColor: 'rgba(255, 215, 0, 0.7)',
                borderColor: '#FFD700',
                borderWidth: 2,
                pointRadius: 6,
                pointHoverRadius: 8
            }]
        };

        const options = {
            ...this.getDefaultOptions(),
            scales: {
                y: {
                    ticks: {
                        color: '#ffffff',
                        callback: function(value) { return '₹' + (value/1000).toFixed(0) + 'k'; }
                    },
                    grid: { color: 'rgba(255, 255, 255, 0.1)' }
                },
                x: {
                    ticks: {
                        color: '#ffffff',
                        callback: function(value) { return value.toFixed(1) + '%'; }
                    },
                    grid: { color: 'rgba(255, 255, 255, 0.1)' }
                }
            }
        };

        this.charts[canvasId] = new Chart(ctx, {
            type: 'scatter',
            data: chartData,
            options: options
        });

        ctx.style.cursor = 'pointer';
        ctx.onclick = () => {
            this.openChartModal('Correlation Scatter', chartData, 'scatter', options);
        };
    }

    createCorrelationChart(canvasId) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return;

        if (this.charts[canvasId]) {
            this.charts[canvasId].destroy();
        }

        const chartData = {
            labels: ['Gold-USD', 'Gold-Inflation', 'USD-Inflation'],
            datasets: [{
                label: 'Correlation Coefficient',
                data: [-0.998, 0.215, -0.156],
                backgroundColor: [
                    'rgba(255, 68, 68, 0.7)',
                    'rgba(255, 165, 0, 0.7)',
                    'rgba(255, 68, 68, 0.7)'
                ],
                borderColor: '#FFD700',
                borderWidth: 2
            }]
        };

        const options = {
            ...this.getDefaultOptions(),
            scales: {
                y: {
                    min: -1,
                    max: 1,
                    ticks: {
                        color: '#ffffff',
                        callback: function(value) { return value.toFixed(2); }
                    },
                    grid: { color: 'rgba(255, 255, 255, 0.1)' }
                },
                x: {
                    ticks: { color: '#ffffff' },
                    grid: { drawOnChartArea: false }
                }
            }
        };

        this.charts[canvasId] = new Chart(ctx, {
            type: 'bar',
            data: chartData,
            options: options
        });

        ctx.style.cursor = 'pointer';
        ctx.onclick = () => {
            this.openChartModal('Correlation Matrix', chartData, 'bar', options);
        };
    }

    // Survey Charts
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

        this.charts[canvasId] = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['18-25', '26-35', '36-50', '50+'],
                datasets: [{
                    data: [60, 20, 13.3, 6.7],
                    backgroundColor: ['rgba(255, 215, 0, 0.8)', 'rgba(255, 165, 0, 0.8)', 'rgba(0, 255, 255, 0.8)', 'rgba(255, 68, 68, 0.8)'],
                    borderColor: '#FFD700',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { labels: { color: '#ffffff' } } }
            }
        });
    }

    createGenderChart(canvasId) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return;

        if (this.charts[canvasId]) this.charts[canvasId].destroy();

        this.charts[canvasId] = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: ['Male', 'Female'],
                datasets: [{
                    data: [60, 40],
                    backgroundColor: ['rgba(0, 255, 255, 0.8)', 'rgba(255, 165, 0, 0.8)'],
                    borderColor: '#FFD700',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { labels: { color: '#ffffff' } } }
            }
        });
    }

    createOccupationChart(canvasId) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return;

        if (this.charts[canvasId]) this.charts[canvasId].destroy();

        this.charts[canvasId] = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Students', 'Employed', 'Self-Employed'],
                datasets: [{
                    label: 'Percentage',
                    data: [40, 46.7, 13.3],
                    backgroundColor: 'rgba(255, 215, 0, 0.7)',
                    borderColor: '#FFD700',
                    borderWidth: 2
                }]
            },
            options: {
                ...this.getDefaultOptions(),
                scales: {
                    y: { beginAtZero: true, max: 100, ticks: { color: '#ffffff', callback: v => v + '%' }, grid: { color: 'rgba(255, 255, 255, 0.1)' } },
                    x: { ticks: { color: '#ffffff' }, grid: { drawOnChartArea: false } }
                }
            }
        });
    }

    createIncomeChart(canvasId) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return;

        if (this.charts[canvasId]) this.charts[canvasId].destroy();

        this.charts[canvasId] = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['<₹50K', '₹50K-₹1L', '₹1L-₹2.5L', '>₹2.5L'],
                datasets: [{
                    label: 'Percentage',
                    data: [26.7, 33.3, 26.7, 13.3],
                    backgroundColor: ['rgba(255, 68, 68, 0.7)', 'rgba(255, 165, 0, 0.7)', 'rgba(255, 215, 0, 0.7)', 'rgba(0, 255, 0, 0.7)'],
                    borderColor: '#FFD700',
                    borderWidth: 2
                }]
            },
            options: {
                ...this.getDefaultOptions(),
                scales: {
                    y: { beginAtZero: true, max: 100, ticks: { color: '#ffffff', callback: v => v + '%' }, grid: { color: 'rgba(255, 255, 255, 0.1)' } },
                    x: { ticks: { color: '#ffffff' }, grid: { drawOnChartArea: false } }
                }
            }
        });
    }

    createHedgeChart(canvasId) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return;

        if (this.charts[canvasId]) this.charts[canvasId].destroy();

        this.charts[canvasId] = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Agree (60%)', 'Neutral (27%)', 'Disagree (13%)'],
                datasets: [{
                    data: [60, 27, 13],
                    backgroundColor: ['rgba(0, 255, 0, 0.8)', 'rgba(255, 165, 0, 0.8)', 'rgba(255, 68, 68, 0.8)'],
                    borderColor: '#FFD700',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { labels: { color: '#ffffff' } } }
            }
        });
    }

    createInterestChart(canvasId) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return;

        if (this.charts[canvasId]) this.charts[canvasId].destroy();

        this.charts[canvasId] = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: ['High (47%)', 'Moderate (33%)', 'Low (20%)'],
                datasets: [{
                    data: [47, 33, 20],
                    backgroundColor: ['rgba(0, 255, 0, 0.8)', 'rgba(255, 215, 0, 0.8)', 'rgba(255, 68, 68, 0.8)'],
                    borderColor: '#FFD700',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { labels: { color: '#ffffff' } } }
            }
        });
    }

    createPurchaseChart(canvasId) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return;

        if (this.charts[canvasId]) this.charts[canvasId].destroy();

        this.charts[canvasId] = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Yes', 'Maybe', 'No'],
                datasets: [{
                    label: 'Percentage',
                    data: [40, 33, 27],
                    backgroundColor: ['rgba(0, 255, 0, 0.7)', 'rgba(255, 165, 0, 0.7)', 'rgba(255, 68, 68, 0.7)'],
                    borderColor: '#FFD700',
                    borderWidth: 2
                }]
            },
            options: {
                ...this.getDefaultOptions(),
                scales: {
                    y: { beginAtZero: true, max: 100, ticks: { color: '#ffffff', callback: v => v + '%' }, grid: { color: 'rgba(255, 255, 255, 0.1)' } },
                    x: { ticks: { color: '#ffffff' }, grid: { drawOnChartArea: false } }
                }
            }
        });
    }

    createFormChart(canvasId) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return;

        if (this.charts[canvasId]) this.charts[canvasId].destroy();

        this.charts[canvasId] = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Physical Gold (53%)', 'Gold ETFs (27%)', 'Gold Schemes (20%)'],
                datasets: [{
                    data: [53, 27, 20],
                    backgroundColor: ['rgba(255, 215, 0, 0.8)', 'rgba(0, 255, 255, 0.8)', 'rgba(255, 165, 0, 0.8)'],
                    borderColor: '#FFD700',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { labels: { color: '#ffffff' } } }
            }
        });
    }

    createRiskChart(canvasId) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return;

        if (this.charts[canvasId]) this.charts[canvasId].destroy();

        this.charts[canvasId] = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: ['Low Risk (47%)', 'Moderate (40%)', 'High Risk (13%)'],
                datasets: [{
                    data: [47, 40, 13],
                    backgroundColor: ['rgba(0, 255, 0, 0.8)', 'rgba(255, 215, 0, 0.8)', 'rgba(255, 68, 68, 0.8)'],
                    borderColor: '#FFD700',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { labels: { color: '#ffffff' } } }
            }
        });
    }

    createSentimentChart(canvasId) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return;

        if (this.charts[canvasId]) this.charts[canvasId].destroy();

        this.charts[canvasId] = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Bullish', 'Neutral', 'Bearish'],
                datasets: [{
                    label: 'Percentage',
                    data: [67, 20, 13],
                    backgroundColor: ['rgba(0, 255, 0, 0.7)', 'rgba(255, 165, 0, 0.7)', 'rgba(255, 68, 68, 0.7)'],
                    borderColor: '#FFD700',
                    borderWidth: 2
                }]
            },
            options: {
                ...this.getDefaultOptions(),
                scales: {
                    y: { beginAtZero: true, max: 100, ticks: { color: '#ffffff', callback: v => v + '%' }, grid: { color: 'rgba(255, 255, 255, 0.1)' } },
                    x: { ticks: { color: '#ffffff' }, grid: { drawOnChartArea: false } }
                }
            }
        });
    }

    createTimelineChart(canvasId) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return;

        if (this.charts[canvasId]) this.charts[canvasId].destroy();

        this.charts[canvasId] = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Short-term <1yr (33%)', 'Medium 1-3yr (40%)', 'Long-term 3+yr (27%)'],
                datasets: [{
                    data: [33, 40, 27],
                    backgroundColor: ['rgba(255, 68, 68, 0.8)', 'rgba(255, 215, 0, 0.8)', 'rgba(0, 255, 0, 0.8)'],
                    borderColor: '#FFD700',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { labels: { color: '#ffffff' } } }
            }
        });
    }

    createSourceChart(canvasId) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return;

        if (this.charts[canvasId]) this.charts[canvasId].destroy();

        this.charts[canvasId] = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Financial News', 'Expert Analysis', 'Online Communities', 'Social Media'],
                datasets: [{
                    label: 'Trust Level (%)',
                    data: [40, 33, 20, 7],
                    backgroundColor: ['rgba(0, 255, 0, 0.7)', 'rgba(255, 215, 0, 0.7)', 'rgba(255, 165, 0, 0.7)', 'rgba(255, 68, 68, 0.7)'],
                    borderColor: '#FFD700',
                    borderWidth: 2
                }]
            },
            options: {
                ...this.getDefaultOptions(),
                scales: {
                    y: { beginAtZero: true, max: 50, ticks: { color: '#ffffff', callback: v => v + '%' }, grid: { color: 'rgba(255, 255, 255, 0.1)' } },
                    x: { ticks: { color: '#ffffff', font: { size: 10 } }, grid: { drawOnChartArea: false } }
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
}

// Initialize chart manager
const chartManager = new ChartManager();

// Wait for DOM and Chart.js to be ready
window.addEventListener('load', () => {
    console.log('Charts.js loaded');
    
    // Check if Chart.js is available
    if (typeof Chart === 'undefined') {
        console.error('Chart.js not loaded!');
        return;
    }

    // Initialize based on page type
    if (document.getElementById('histogramChart')) {
        console.log('Initializing price analysis charts...');
        initializeAllCharts();
    } else if (document.getElementById('ageChart')) {
        console.log('Initializing survey charts...');
        chartManager.createSurveyCharts();
    }
});

function initializeAllCharts() {
    // Get gold prices data from global scope
    let goldPrices = window.goldPrices;
    
    if (!goldPrices || goldPrices.length === 0) {
        console.error('Gold prices data not available! Make sure goldPrices.js is loaded first.');
        return;
    }
    
    console.log('Creating charts with ' + goldPrices.length + ' data points');
    
    // Create all charts
    try {
        if (document.getElementById('histogramChart')) {
            chartManager.createHistogram('histogramChart', goldPrices);
            console.log('Histogram created');
        }
        
        if (document.getElementById('trendChart')) {
            chartManager.createTrendChart('trendChart', goldPrices);
            console.log('Trend chart created');
        }
        
        if (document.getElementById('volatilityChart')) {
            chartManager.createVolatilityChart('volatilityChart', goldPrices);
            console.log('Volatility chart created');
        }
        
        if (document.getElementById('distributionChart')) {
            chartManager.createDistributionChart('distributionChart', goldPrices);
            console.log('Distribution chart created');
        }
        
        if (document.getElementById('boxplotChart')) {
            chartManager.createBoxPlotChart('boxplotChart', goldPrices);
            console.log('Box plot created');
        }
        
        if (document.getElementById('inflationChart')) {
            chartManager.createInflationChart('inflationChart');
            console.log('Inflation chart created');
        }
        
        if (document.getElementById('correlationScatterChart')) chartManager.createCorrelationScatterChart('correlationScatterChart');
        if (document.getElementById('correlationChart')) chartManager.createCorrelationChart('correlationChart');
    
         console.log('Charts initialized');
       }

window.chartManager = chartManager;
