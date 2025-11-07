/* ============================================
   GOLD PRICE ANALYSIS - STATISTICS.JS (CORRECTED)
   Statistical Calculations & Analysis
   Based on actual data: 76 data points from gold prices
   ============================================ */

class StatisticsCalculator {
@@ -12,19 +11,16 @@ class StatisticsCalculator {

    // Central Tendency
    mean() {
        if (this.values.length === 0) return 0;
        return this.values.reduce((a, b) => a + b, 0) / this.values.length;
    }

    median() {
        if (this.values.length === 0) return 0;
        const sorted = [...this.values].sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
    }

    mode() {
        if (this.values.length === 0) return null;
        const frequency = {};
        let maxFreq = 0;
        let mode = null;
@@ -42,7 +38,6 @@ class StatisticsCalculator {

    // Dispersion
    variance() {
        if (this.values.length === 0) return 0;
        const avg = this.mean();
        return this.values.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / this.values.length;
    }
@@ -52,19 +47,15 @@ class StatisticsCalculator {
    }

    coefficientOfVariation() {
        const mean = this.mean();
        if (mean === 0) return 0;
        return (this.standardDeviation() / mean) * 100;
    }

    // Range & Quartiles
    min() {
        if (this.values.length === 0) return 0;
        return Math.min(...this.values);
    }

    max() {
        if (this.values.length === 0) return 0;
        return Math.max(...this.values);
    }

@@ -73,7 +64,6 @@ class StatisticsCalculator {
    }

    quartile(q) {
        if (this.values.length === 0) return 0;
        const sorted = [...this.values].sort((a, b) => a - b);
        const pos = (q / 4) * (sorted.length - 1);
        const base = Math.floor(pos);
@@ -96,35 +86,28 @@ class StatisticsCalculator {

    // Distribution Shape
    skewness() {
        if (this.values.length === 0) return 0;
        const avg = this.mean();
        const std = this.standardDeviation();
        const n = this.values.length;

        if (std === 0) return 0;
        
        const m3 = this.values.reduce((sum, val) => sum + Math.pow(val - avg, 3), 0) / n;
        return m3 / Math.pow(std, 3);
    }

    kurtosis() {
        if (this.values.length === 0) return 0;
        const avg = this.mean();
        const std = this.standardDeviation();
        const n = this.values.length;

        if (std === 0) return 0;
        
        const m4 = this.values.reduce((sum, val) => sum + Math.pow(val - avg, 4), 0) / n;
        return (m4 / Math.pow(std, 4)) - 3;
    }

    // Percentiles
    percentile(p) {
        if (this.values.length === 0) return 0;
        const sorted = [...this.values].sort((a, b) => a - b);
        const index = (p / 100) * (sorted.length - 1);
        const lower = Math.floor(index);
        const upper = lower + 1;
        const weight = index % 1;

@@ -138,35 +121,33 @@ class StatisticsCalculator {
    getSummary() {
        return {
            count: this.values.length,
            mean: Math.round(this.mean()),
            median: Math.round(this.median()),
            mode: this.mode(),
            std: Math.round(this.standardDeviation()),
            variance: Math.round(this.variance()),
            cv: this.coefficientOfVariation().toFixed(2),
            min: Math.round(this.min()),
            max: Math.round(this.max()),
            range: Math.round(this.range()),
            Q1: Math.round(this.Q1()),
            Q2: Math.round(this.Q2()),
            Q3: Math.round(this.Q3()),
            IQR: Math.round(this.IQR()),
            skewness: this.skewness().toFixed(3),
            kurtosis: this.kurtosis().toFixed(3),
            p05: Math.round(this.percentile(5)),
            p25: Math.round(this.percentile(25)),
            p50: Math.round(this.percentile(50)),
            p75: Math.round(this.percentile(75)),
            p95: Math.round(this.percentile(95))
        };
    }
}

// Correlation Calculator
class CorrelationCalculator {
    static pearson(x, y) {
        if (x.length === 0 || y.length === 0 || x.length !== y.length) return 0;
        
        const n = x.length;
        const sumX = x.reduce((a, b) => a + b, 0);
        const sumY = y.reduce((a, b) => a + b, 0);
@@ -181,39 +162,19 @@ class CorrelationCalculator {
    }

    static covariance(x, y) {
        if (x.length === 0 || y.length === 0 || x.length !== y.length) return 0;
        
        const meanX = x.reduce((a, b) => a + b, 0) / x.length;
        const meanY = y.reduce((a, b) => a + b, 0) / y.length;

        return x.reduce((sum, xi, i) => sum + (xi - meanX) * (y[i] - meanY), 0) / x.length;
    }

    static calculateAllCorrelations(goldPrices, usdIndex, inflation) {
        const goldUsdCorr = this.pearson(goldPrices, usdIndex);
        const goldInflationCorr = this.pearson(goldPrices, inflation);
        const usdInflationCorr = this.pearson(usdIndex, inflation);

        return {
            goldUsd: goldUsdCorr.toFixed(3),
            goldInflation: goldInflationCorr.toFixed(3),
            usdInflation: usdInflationCorr.toFixed(3)
        };
    }
}

// Linear Regression
class LinearRegression {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.slope = 0;
        this.intercept = 0;
        this.r2 = 0;
        
        if (x.length > 0 && y.length > 0 && x.length === y.length) {
            this.calculate();
        }
    }

    calculate() {
@@ -223,27 +184,12 @@ class LinearRegression {
        const sumXY = this.x.reduce((sum, xi, i) => sum + xi * this.y[i], 0);
        const sumX2 = this.x.reduce((sum, xi) => sum + xi * xi, 0);

        const denominator = n * sumX2 - sumX * sumX;
        
        if (denominator === 0) {
            this.slope = 0;
            this.intercept = sumY / n;
            this.r2 = 0;
            return;
        }

        this.slope = (n * sumXY - sumX * sumY) / denominator;
        this.intercept = (sumY - this.slope * sumX) / n;

        // R-squared
        const meanY = sumY / n;
        const ssTotal = this.y.reduce((sum, yi) => sum + Math.pow(yi - meanY, 2), 0);
        
        if (ssTotal === 0) {
            this.r2 = 0;
            return;
        }
        
        const ssResidual = this.y.reduce((sum, yi, i) => {
            const predicted = this.slope * this.x[i] + this.intercept;
            return sum + Math.pow(yi - predicted, 2);
@@ -259,19 +205,11 @@ class LinearRegression {
    getEquation() {
        return `y = ${this.slope.toFixed(4)}x + ${this.intercept.toFixed(2)}`;
    }

    getR2() {
        return this.r2.toFixed(4);
    }
}

// Confidence Interval Calculator
class ConfidenceInterval {
    static meanCI(data, confidence = 0.95) {
        if (!data || data.length === 0) {
            return { lower: 0, upper: 0, margin: 0, mean: 0 };
        }
        
        const calc = new StatisticsCalculator(data);
        const mean = calc.mean();
        const std = calc.standardDeviation();
@@ -292,17 +230,13 @@ class ConfidenceInterval {
    }

    static proportionCI(successes, total, confidence = 0.95) {
        if (total === 0) {
            return { lower: 0, upper: 0, margin: 0, proportion: 0 };
        }
        
        const p = successes / total;
        const z = confidence === 0.95 ? 1.96 : 2.576;
        const margin = z * Math.sqrt((p * (1 - p)) / total);

        return {
            lower: Math.max(0, p - margin),
            upper: Math.min(1, p + margin),
            margin: margin,
            proportion: p
        };
@@ -312,10 +246,6 @@ class ConfidenceInterval {
// Hypothesis Testing
class HypothesisTesting {
    static tTest(sample1, sample2, alpha = 0.05) {
        if (!sample1 || !sample2 || sample1.length === 0 || sample2.length === 0) {
            return { tStatistic: 0, alpha: alpha, significant: false };
        }
        
        const calc1 = new StatisticsCalculator(sample1);
        const calc2 = new StatisticsCalculator(sample2);

@@ -327,109 +257,31 @@ class HypothesisTesting {
        const n2 = sample2.length;

        const pooledVar = ((n1 - 1) * var1 + (n2 - 1) * var2) / (n1 + n2 - 2);
        
        if (pooledVar === 0) {
            return { tStatistic: 0, alpha: alpha, significant: false };
        }
        
        const tStat = (mean1 - mean2) / Math.sqrt(pooledVar * (1/n1 + 1/n2));

        return {
            tStatistic: tStat.toFixed(3),
            alpha: alpha,
            significant: Math.abs(tStat) > 1.96
        };
    }

    static correlationSignificance(r, n, alpha = 0.05) {
        if (n < 3) {
            return { correlation: r, tStatistic: 0, significant: false, alpha: alpha };
        }
        
        const denominator = Math.sqrt(1 - r * r);
        if (denominator === 0) {
            return { correlation: r, tStatistic: 0, significant: false, alpha: alpha };
        }
        
        const t = r * Math.sqrt(n - 2) / denominator;
        const significant = Math.abs(t) > 1.96;

        return {
            correlation: r.toFixed(3),
            tStatistic: t.toFixed(3),
            significant: significant,
            alpha: alpha
        };
    }
}

// Time Series Analysis
class TimeSeriesAnalysis {
    static calculateReturns(prices) {
        if (!prices || prices.length < 2) return [];
        
        const returns = [];
        for (let i = 1; i < prices.length; i++) {
            const ret = ((prices[i] - prices[i-1]) / prices[i-1]) * 100;
            returns.push(ret);
        }
        return returns;
    }

    static calculateCumulativeReturn(startPrice, endPrice) {
        if (startPrice === 0) return 0;
        return ((endPrice - startPrice) / startPrice) * 100;
    }

    static calculateAnnualizedReturn(startPrice, endPrice, years) {
        if (startPrice === 0 || years === 0) return 0;
        return (Math.pow(endPrice / startPrice, 1 / years) - 1) * 100;
    }

    static calculateVolatility(returns) {
        if (!returns || returns.length === 0) return 0;
        
        const calc = new StatisticsCalculator(returns.map(r => ({ Gold_Price_INR: r })));
        return calc.standardDeviation();
    }

    static identifyTrend(prices, windowSize = 20) {
        if (!prices || prices.length < windowSize) return 'insufficient_data';
        
        const recent = prices.slice(-windowSize);
        const older = prices.slice(-windowSize * 2, -windowSize);
        
        if (older.length === 0) return 'insufficient_data';
        
        const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
        const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;
        
        const changePercent = ((recentAvg - olderAvg) / olderAvg) * 100;
        
        if (changePercent > 5) return 'bullish';
        if (changePercent < -5) return 'bearish';
        return 'sideways';
    }
}

// Export classes
if (typeof window !== 'undefined') {
    window.StatisticsCalculator = StatisticsCalculator;
    window.CorrelationCalculator = CorrelationCalculator;
    window.LinearRegression = LinearRegression;
    window.ConfidenceInterval = ConfidenceInterval;
    window.HypothesisTesting = HypothesisTesting;
    window.TimeSeriesAnalysis = TimeSeriesAnalysis;
}

// Module exports for Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        StatisticsCalculator,
        CorrelationCalculator,
        LinearRegression,
        ConfidenceInterval,
        HypothesisTesting,
        TimeSeriesAnalysis
    };
}
