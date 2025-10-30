/* ============================================
   ECONOMIC INDICATORS
   Current Market Data (October 30, 2025)
   ============================================ */

const economicIndicators = {
    goldPrice24K: 12241,
    goldPrice22K: 11221,
    goldPrice10g24K: 122410,
    goldPrice: {
        perGram24K: 12241,
        perGram22K: 11221,
        per10g24K: 122410,
        per10g22K: 112210,
        perTroyOz: 2048.50
    },
    inflation: {
        indiaCPI: 5.49,
        usCPI: 2.94,
        realInterestRate: -0.34
    },
    interestRates: {
        rbiRepoRate: 5.15,
        fedRate: 4.22,
        rbiReverseRepoRate: 4.65
    },
    exchangeRates: {
        usdINR: 88.73,
        eurINR: 96.48,
        gbpINR: 111.22
    },
    marketData: {
        goldenRatio: 1.618,
        volatilityIndex: 18.5,
        treasuryYield10Y: 4.15,
        sovereignGoldBond: 7.35
    },
    dates: {
        lastUpdated: '2025-10-30',
        dataSource: 'RBI, Bloomberg, World Gold Council',
        frequency: 'Daily'
    }
};

// Statistics for indicators
const indicatorStats = {
    description: 'Current macroeconomic environment',
    interpretation: {
        inflation: 'India CPI at 5.49% supports gold as inflation hedge',
        interest: 'Real interest rate negative (-0.34%) favors non-yield assets',
        usd: 'Stronger USD at 88.73/INR impacts gold attractiveness',
        rates: 'RBI maintaining restrictive stance at 5.15% repo rate'
    },
    trends: {
        goldPrice: 'Uptrend since Jan 2023, +131.3% return',
        inflation: 'Moderating but above RBI target of 4%',
        rbiRate: 'On hold after series of rate cuts',
        usdStrength: 'Relatively stable around 88-89 range'
    }
};

// Export data
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        surveyData,
        surveySummary,
        economicIndicators,
        indicatorStats
    };
}
