export const calculateBMI = (weight, heightCm) => {
  if (!weight || !heightCm) return 0;
  const heightM = heightCm / 100;
  return Number((weight / (heightM * heightM)).toFixed(1));
};

export const calculateSMI = (skeletalMuscleMass, heightCm) => {
  if (!skeletalMuscleMass || !heightCm) return 0;
  const heightM = heightCm / 100;
  return Number((skeletalMuscleMass / (heightM * heightM)).toFixed(1));
};

export const calculateTargetProgress = (currentWeight, targetWeight, startWeight = null) => {
  if (!currentWeight || !targetWeight) return 0;
  
  // If we have a start weight (e.g. max weight in records), calculate progress relative to that
  if (startWeight && startWeight > targetWeight) {
    const totalToLose = startWeight - targetWeight;
    const lost = startWeight - currentWeight;
    let progress = (lost / totalToLose) * 100;
    return Math.max(0, Math.min(100, progress));
  }

  // Simple completion percentage
  let progress = (targetWeight / currentWeight) * 100;
  if (targetWeight < currentWeight) { // Losing weight
    return Math.max(0, Math.min(100, (targetWeight / currentWeight) * 100)); // Actually, if losing weight, target/current isn't progress. It's just a ratio.
  }
  
  return Number(progress.toFixed(1));
};

export const check168Status = () => {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const timeInMinutes = hours * 60 + minutes;
  
  const startWindow = 12 * 60; // 12:00
  const endWindow = 18 * 60 + 30; // 18:30
  
  return timeInMinutes >= startWindow && timeInMinutes <= endWindow;
};
