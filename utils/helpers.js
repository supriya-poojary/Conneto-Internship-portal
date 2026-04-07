function calculateExpectedDays(durationStr) {
    if (!durationStr) return 30; // default 30 days if empty
    
    let duration = durationStr.toLowerCase();
    
    // Extract the number
    const match = duration.match(/(\d+)/);
    let num = match ? parseInt(match[1]) : 1; 
    
    // Check keyword
    if (duration.includes('month')) {
        return num * 26; // approx 26 working days in a month (excluding sundays)
    } else if (duration.includes('week')) {
        return num * 6; // 6 working days in a week
    } else if (duration.includes('day')) {
        // subtract sundays roughly (num/7)
        let sundays = Math.floor(num / 7);
        return num - sundays;
    } else {
        // Fallback or unparseable duration
        return 30;
    }
}

module.exports = {
    calculateExpectedDays
};
