/* ============================================
   SURVEY DATA
   15 Responses (3% of 500 target)
   ============================================ */

const surveyData = [
    { id: 1, age: '18-25', gender: 'M', occupation: 'Student', income: '<50000', inflationHedge: 5, interest: 'High', purchase: 'Yes', form: 'Physical', risk: 'Low', sentiment: 'Bullish', timeline: 'Medium-term', source: 'News' },
    { id: 2, age: '26-35', gender: 'F', occupation: 'Employed', income: '50000-100000', inflationHedge: 4, interest: 'High', purchase: 'Yes', form: 'ETF', risk: 'Moderate', sentiment: 'Bullish', timeline: 'Long-term', source: 'Experts' },
    { id: 3, age: '18-25', gender: 'M', occupation: 'Student', income: '<50000', inflationHedge: 5, interest: 'Moderate', purchase: 'Maybe', form: 'Physical', risk: 'Low', sentiment: 'Bullish', timeline: 'Short-term', source: 'News' },
    { id: 4, age: '36-50', gender: 'F', occupation: 'Employed', income: '100000-250000', inflationHedge: 4, interest: 'High', purchase: 'Yes', form: 'Scheme', risk: 'Low', sentiment: 'Bullish', timeline: 'Long-term', source: 'Experts' },
    { id: 5, age: '18-25', gender: 'M', occupation: 'Employed', income: '50000-100000', inflationHedge: 3, interest: 'Low', purchase: 'No', form: 'ETF', risk: 'High', sentiment: 'Neutral', timeline: 'Short-term', source: 'Communities' },
    { id: 6, age: '18-25', gender: 'F', occupation: 'Student', income: '<50000', inflationHedge: 5, interest: 'High', purchase: 'Yes', form: 'Physical', risk: 'Low', sentiment: 'Bullish', timeline: 'Medium-term', source: 'News' },
    { id: 7, age: '26-35', gender: 'M', occupation: 'Self-Employed', income: '100000-250000', inflationHedge: 4, interest: 'Moderate', purchase: 'Maybe', form: 'Physical', risk: 'Moderate', sentiment: 'Bullish', timeline: 'Long-term', source: 'Experts' },
    { id: 8, age: '18-25', gender: 'F', occupation: 'Employed', income: '50000-100000', inflationHedge: 5, interest: 'High', purchase: 'Yes', form: 'Physical', risk: 'Low', sentiment: 'Bullish', timeline: 'Medium-term', source: 'News' },
    { id: 9, age: '50+', gender: 'M', occupation: 'Employed', income: '>250000', inflationHedge: 4, interest: 'Moderate', purchase: 'Maybe', form: 'Scheme', risk: 'Low', sentiment: 'Neutral', timeline: 'Long-term', source: 'Experts' },
    { id: 10, age: '18-25', gender: 'M', occupation: 'Student', income: '<50000', inflationHedge: 3, interest: 'Low', purchase: 'No', form: 'ETF', risk: 'High', sentiment: 'Bearish', timeline: 'Short-term', source: 'Social' },
    { id: 11, age: '26-35', gender: 'F', occupation: 'Employed', income: '100000-250000', inflationHedge: 5, interest: 'High', purchase: 'Yes', form: 'Physical', risk: 'Low', sentiment: 'Bullish', timeline: 'Medium-term', source: 'News' },
    { id: 12, age: '18-25', gender: 'M', occupation: 'Student', income: '<50000', inflationHedge: 4, interest: 'Moderate', purchase: 'Maybe', form: 'Physical', risk: 'Moderate', sentiment: 'Bullish', timeline: 'Short-term', source: 'Communities' },
    { id: 13, age: '18-25', gender: 'F', occupation: 'Employed', income: '50000-100000', inflationHedge: 5, interest: 'High', purchase: 'Yes', form: 'Physical', risk: 'Low', sentiment: 'Bullish', timeline: 'Medium-term', source: 'Experts' },
    { id: 14, age: '26-35', gender: 'M', occupation: 'Employed', income: '50000-100000', inflationHedge: 4, interest: 'Moderate', purchase: 'Maybe', form: 'ETF', risk: 'Moderate', sentiment: 'Bullish', timeline: 'Medium-term', source: 'News' },
    { id: 15, age: '18-25', gender: 'M', occupation: 'Student', income: '<50000', inflationHedge: 3, interest: 'Moderate', purchase: 'No', form: 'Physical', risk: 'High', sentiment: 'Bearish', timeline: 'Long-term', source: 'Communities' }
];

// Survey Summary Statistics
const surveySummary = {
    totalResponses: 15,
    targetResponses: 500,
    percentageComplete: 3,
    demographicsAge: {
        '18-25': 60,
        '26-35': 20,
        '36-50': 13.3,
        '50+': 6.7
    },
    demographicsGender: {
        'Male': 60,
        'Female': 40
    },
    occupationDistribution: {
        'Student': 40,
        'Employed': 46.7,
        'Self-Employed': 13.3
    },
    incomeDistribution: {
        '<₹50,000': 26.7,
        '₹50K-₹1L': 33.3,
        '₹1L-₹2.5L': 26.7,
        '>₹2.5L': 13.3
    },
    attitudesInflationHedge: {
        'Strongly Agree': 60,
        'Neutral': 27,
        'Disagree': 13
    },
    investmentInterest: {
        'High': 47,
        'Moderate': 33,
        'Low': 20
    },
    purchaseIntent: {
        'Will Buy': 40,
        'Maybe': 33,
        "Won't Buy": 27
    },
    preferredForm: {
        'Physical Gold': 53,
        'Gold ETFs': 27,
        'Gold Schemes': 20
    },
    perceivedRisk: {
        'Low': 47,
        'Moderate': 40,
        'High': 13
    },
    marketSentiment: {
        'Bullish': 67,
        'Neutral': 20,
        'Bearish': 13
    },
    investmentTimeline: {
        'Short-term (< 1 year)': 33,
        'Medium-term (1-3 years)': 40,
        'Long-term (3+ years)': 27
    },
    informationSources: {
        'Financial News': 40,
        'Expert Analysis': 33,
        'Online Communities': 20,
        'Social Media': 7
    }
};
