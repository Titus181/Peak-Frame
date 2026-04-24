export const calculatePredictions = (records, targetWeight, averageIntake) => {
  if (!records || records.length < 3) return null; // Need at least 3 points for meaningful regression

  // Sort records by date ascending
  const sorted = [...records].sort((a, b) => new Date(a.date) - new Date(b.date));
  
  // Use recent 30 days data to capture current trend
  const latestDate = new Date(sorted[sorted.length - 1].date);
  const thirtyDaysAgo = new Date(latestDate);
  thirtyDaysAgo.setDate(latestDate.getDate() - 30);
  
  let recentRecords = sorted.filter(r => new Date(r.date) >= thirtyDaysAgo);
  
  // Fallback to last 7 points if we don't have enough data in the 30 day window
  if (recentRecords.length < 3) {
      recentRecords = sorted.slice(-7);
  }
  if (recentRecords.length < 3) return null;

  // Prepare data for linear regression (x = days, y = weight)
  const baseTime = new Date(recentRecords[0].date).getTime();
  const dataPoints = recentRecords.map(r => ({
      x: (new Date(r.date).getTime() - baseTime) / (1000 * 3600 * 24),
      y: r.weight
  }));

  const n = dataPoints.length;
  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
  
  dataPoints.forEach(p => {
      sumX += p.x;
      sumY += p.y;
      sumXY += p.x * p.y;
      sumX2 += p.x * p.x;
  });

  // Slope (Δkg / day)
  const denominator = (n * sumX2 - sumX * sumX);
  if (denominator === 0) return null;
  const slope = (n * sumXY - sumX * sumY) / denominator;
  
  // Intercept
  const intercept = (sumY - slope * sumX) / n;
  
  // Calculate Standard Error for Confidence Intervals
  let sse = 0;
  let sumSqDevX = 0;
  const meanX = sumX / n;

  dataPoints.forEach(p => {
      const predictedY = slope * p.x + intercept;
      sse += Math.pow(p.y - predictedY, 2);
      sumSqDevX += Math.pow(p.x - meanX, 2);
  });
  
  const standardErrorOfRegression = Math.sqrt(sse / (n - 2));
  const standardErrorOfSlope = sumSqDevX > 0 ? standardErrorOfRegression / Math.sqrt(sumSqDevX) : 0.05;
  
  // 1 kg weight loss = ~7700 kcal
  const dailyWeightChange = slope;
  const dailyDeficit = -(dailyWeightChange * 7700); // Positive means deficit (weight loss)
  const dynamicTDEE = Number(averageIntake) + dailyDeficit;
  
  const currentWeight = recentRecords[recentRecords.length - 1].weight;
  const weightToLose = currentWeight - targetWeight;
  
  let p50Date = null, p10Date = null, p90Date = null;
  let isLosingWeight = false;

  if (slope < -0.005) { // Losing at least 5g per day to be meaningful
      isLosingWeight = true;
      const daysToTargetP50 = weightToLose / Math.abs(slope);
      
      // Use 1.28 standard deviations for approx 80% confidence interval (P10 to P90)
      const slopeP10 = slope - (1.28 * standardErrorOfSlope); // Steeper (Optimistic)
      const slopeP90 = slope + (1.28 * standardErrorOfSlope); // Flatter (Pessimistic)
      
      const baseDate = new Date(recentRecords[recentRecords.length - 1].date);
      
      p50Date = new Date(baseDate.getTime() + daysToTargetP50 * 24 * 3600 * 1000).toISOString().split('T')[0];
      
      if (slopeP10 < 0) {
          const daysP10 = weightToLose / Math.abs(slopeP10);
          p10Date = new Date(baseDate.getTime() + daysP10 * 24 * 3600 * 1000).toISOString().split('T')[0];
      }
      
      if (slopeP90 < 0) {
          const daysP90 = weightToLose / Math.abs(slopeP90);
          p90Date = new Date(baseDate.getTime() + daysP90 * 24 * 3600 * 1000).toISOString().split('T')[0];
      }
  }

  return {
      trendKgPerDay: slope,
      dailyDeficit: Math.round(dailyDeficit),
      dynamicTDEE: Math.round(dynamicTDEE > 0 ? dynamicTDEE : 0),
      isLosingWeight,
      p10Date, 
      p50Date, 
      p90Date,
      daysEvaluated: Math.round(dataPoints[dataPoints.length - 1].x)
  };
};
