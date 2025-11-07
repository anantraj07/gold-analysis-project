/* ============================================
   GOLD PRICE ANALYSIS - STATISTICS.JS
   Statistical Calculations & Analysis
   ============================================ */

class StatisticsCalculator {
    constructor(data) {
        this.data = data || [];
        this.values = this.data.map(d => parseFloat(d.Gold_Price_INR || 0));
    }

    // Central Tendency
    mean() {
        return this.values.reduce((a, b) => a + b, 0) / this.values.length;
    }

    median() {
        const sorted = [...this.values].sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
    }

    mode() {
        const frequency = {};
        let maxFreq = 0;
        let mode = null;

        this.values.forEach(val => {
            frequency[val] = (frequency[val] || 0) + 1;
            if (frequency[val] > maxFreq) {
                maxFreq = frequency[val];
                mode = val;
            }
        });

        return mode;
    }

    // Dispersion
    variance() {
        const avg = this.mean();
        return this.values.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / this.values.length;
    }

    standardDeviation() {
        return Math.sqrt(this.variance());
    }

    coefficientOfVariation() {
        return (this.standardDeviation() / this.mean()) * 100;
    }

    // Range & Quartiles
    min() {
        return Math.min(...this.values);
    }

    max() {
        return Math.max(...this.values);
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
        } else {
            return sorted[base];
        }
    }

    Q1() { return this.quartile(1); }
    Q2() { return this.quartile(2); }
    Q3() { return this.quartile(3); }

    IQR() {
        return this.Q3() - this.Q1();
    }

    // Distribution Shape
    skewness() {
        const avg = this.mean();
        const std = this.standardDeviation();
        const n = this.values.length;
        
        const m3 = this.values.reduce((sum, val) => sum + Math.pow(val - avg, 3), 0) / n;
        return m3 / Math.pow(std, 3);
    }

    kurtosis() {
        const avg = this.mean();
        const std = this.standardDeviation();
        const n = this.values.length;
        
        const m4 = this.values.reduce((sum, val) => sum + Math.pow(val - avg, 4), 0) / n;
        return (m4 / Math.pow(std, 4)) - 3;
    }

    // Percentiles
    percentile(p) {
        const sorted = [...this.values].sort((a, b) => a - b);
        const index = (p / 100) * sorted.length;
        const lower = Math.floor(index) - 1;
        const upper = lower + 1;
        const weight = index % 1;

        if (lower < 0) return sorted[0];
        if (upper >= sorted.length) return sorted[sorted.length - 1];

        return sorted[lower] * (1 - weight) + sorted[upper] * weight;
    }

    // Summary Statistics
    getSummary() {
        return {
            count: this.values.length,
            mean: this.mean(),
            median: this.median(),
            mode: this.mode(),
            std: this.standardDeviation(),
            variance: this.variance(),
            cv: this.coefficientOfVariation(),
            min: this.min(),
            max: this.max(),
            range: this.range(),
            Q1: this.Q1(),
            Q2: this.Q2(),
            Q3: this.Q3(),
            IQR: this.IQR(),
            skewness: this.skewness(),
            kurtosis: this.kurtosis(),
            p05: this.percentile(5),
            p25: this.percentile(25),
            p50: this.percentile(50),
            p75: this.percentile(75),
            p95: this.percentile(95)
        };
    }
}

// Correlation Calculator
class CorrelationCalculator {
    static pearson(x, y) {
        const n = x.length;
        const sumX = x.reduce((a, b) => a + b, 0);
        const sumY = y.reduce((a, b) => a + b, 0);
        const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
        const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
        const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0);

        const numerator = n * sumXY - sumX * sumY;
        const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

        return denominator === 0 ? 0 : numerator / denominator;
    }

    static covariance(x, y) {
        const meanX = x.reduce((a, b) => a + b, 0) / x.length;
        const meanY = y.reduce((a, b) => a + b, 0) / y.length;
        
        return x.reduce((sum, xi, i) => sum + (xi - meanX) * (y[i] - meanY), 0) / x.length;
    }
}

// Linear Regression
class LinearRegression {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.calculate();
    }

    calculate() {
        const n = this.x.length;
        const sumX = this.x.reduce((a, b) => a + b, 0);
        const sumY = this.y.reduce((a, b) => a + b, 0);
        const sumXY = this.x.reduce((sum, xi, i) => sum + xi * this.y[i], 0);
        const sumX2 = this.x.reduce((sum, xi) => sum + xi * xi, 0);

        this.slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
        this.intercept = (sumY - this.slope * sumX) / n;

        // R-squared
        const meanY = sumY / n;
        const ssTotal = this.y.reduce((sum, yi) => sum + Math.pow(yi - meanY, 2), 0);
        const ssResidual = this.y.reduce((sum, yi, i) => {
            const predicted = this.slope * this.x[i] + this.intercept;
            return sum + Math.pow(yi - predicted, 2);
        }, 0);

        this.r2 = 1 - (ssResidual / ssTotal);
    }

    predict(x) {
        return this.slope * x + this.intercept;
    }

    getEquation() {
        return `y = ${this.slope.toFixed(4)}x + ${this.intercept.toFixed(2)}`;
    }
}

// Confidence Interval Calculator
class ConfidenceInterval {
    static meanCI(data, confidence = 0.95) {
        const calc = new StatisticsCalculator(data);
        const mean = calc.mean();
        const std = calc.standardDeviation();
        const n = data.length;
        
        // t-value lookup (simplified for 95% and 99%)
        const tValues = { 0.95: 1.96, 0.99: 2.576 };
        const t = tValues[confidence] || 1.96;
        
        const margin = t * (std / Math.sqrt(n));
        
        return {
            lower: mean - margin,
            upper: mean + margin,
            margin: margin,
            mean: mean
        };
    }

    static proportionCI(successes, total, confidence = 0.95) {
        const p = successes / total;
        const z = confidence === 0.95 ? 1.96 : 2.576;
        const margin = z * Math.sqrt((p * (1 - p)) / total);
        
        return {
            lower: p - margin,
            upper: p + margin,
            margin: margin,
            proportion: p
        };
    }
}

// Hypothesis Testing
class HypothesisTesting {
    static tTest(sample1, sample2, alpha = 0.05) {
        const calc1 = new StatisticsCalculator(sample1);
        const calc2 = new StatisticsCalculator(sample2);
        
        const mean1 = calc1.mean();
        const mean2 = calc2.mean();
        const var1 = calc1.variance();
        const var2 = calc2.variance();
        const n1 = sample1.length;
        const n2 = sample2.length;
        
        const pooledVar = ((n1 - 1) * var1 + (n2 - 1) * var2) / (n1 + n2 - 2);
        const tStat = (mean1 - mean2) / Math.sqrt(pooledVar * (1/n1 + 1/n2));
        
        return {
            tStatistic: tStat,
            alpha: alpha,
            significant: Math.abs(tStat) > 1.96 // Simplified
        };
    }

    static correlationSignificance(r, n, alpha = 0.05) {
        const t = r * Math.sqrt(n - 2) / Math.sqrt(1 - r * r);
        const significant = Math.abs(t) > 1.96;
        
        return {
            correlation: r,
            tStatistic: t,
            significant: significant,
            alpha: alpha
        };
    }
}

// Export classes
window.StatisticsCalculator = StatisticsCalculator;
window.CorrelationCalculator = CorrelationCalculator;
window.LinearRegression = LinearRegression;
window.ConfidenceInterval = ConfidenceInterval;
window.HypothesisTesting = HypothesisTesting;
