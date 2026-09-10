export const computeRisk = (vitals, env, baseline, disasterMode) => {
  // Simple heuristic scoring (0-100)
  
  // 1. Heat Risk
  let heatScore = 0;
  if (env.ambientTemp > 35) heatScore += (env.ambientTemp - 35) * 5;
  if (env.humidity > 60) heatScore += (env.humidity - 60) * 0.5;
  if (vitals.heartRate > baseline.heartRate * 1.1) heatScore += 15;
  if (env.exposureMinutes > 30) heatScore += 10;
  if (disasterMode === 'heatwave') heatScore += 30;

  // 2. Respiratory Risk
  let respScore = 0;
  if (env.airQuality === 'Unhealthy') respScore += 50;
  else if (env.airQuality === 'Unhealthy for Sensitive Groups') respScore += 30;
  else if (env.airQuality === 'Moderate') respScore += 10;
  if (vitals.spo2 < baseline.spo2 - 2) respScore += 20;
  if (disasterMode === 'pollution') respScore += 30;

  // 3. Cardiovascular Risk
  let cardioScore = 0;
  if (vitals.heartRate > baseline.heartRate * 1.2) cardioScore += 30;
  if (vitals.bodyTemp > 37.5) cardioScore += 20;
  if (heatScore > 50) cardioScore += 10;

  // 4. Fatigue Risk
  let fatigueScore = 0;
  if (vitals.sleepHours < 6) fatigueScore += (6 - vitals.sleepHours) * 10;
  if (vitals.activityLevel === 'High') fatigueScore += 20;
  if (env.exposureMinutes > 60) fatigueScore += 15;
  
  // 5. Fall Risk (mostly safe unless triggered, handled via events mostly, but give a base score based on fatigue/age)
  let fallScore = (fatigueScore > 60) ? 20 : 0;
  if (baseline.userType === 'elderly') fallScore += 15;

  const clamp = (val) => Math.min(Math.max(val, 0), 100);
  
  const getSeverity = (score, riskId) => {
    if (riskId === 'fall' && score < 50) return 'SAFE';
    if (score < 20) return 'SAFE';
    if (score < 40) return 'LOW';
    if (score < 60) return 'MEDIUM';
    if (score < 80) return 'MODERATE';
    return 'HIGH';
  };

  const risks = [
    { riskId: 'heat', score: clamp(heatScore) },
    { riskId: 'respiratory', score: clamp(respScore) },
    { riskId: 'cardiovascular', score: clamp(cardioScore) },
    { riskId: 'fatigue', score: clamp(fatigueScore) },
    { riskId: 'fall', score: clamp(fallScore) }
  ];

  return risks.map(r => ({
    ...r,
    severity: getSeverity(r.score, r.riskId)
  }));
};

export const getOverallRisk = (risks) => {
  const maxScore = Math.max(...risks.map(r => r.score));
  if (maxScore >= 80) return { level: 'HIGH', label: '🔴 HIGH — Immediate Action Required', color: 'danger' };
  if (maxScore >= 60) return { level: 'MODERATE', label: '🟠 MODERATE — Early Warning', color: 'caution' };
  if (maxScore >= 40) return { level: 'MEDIUM', label: '🟡 MEDIUM — Elevated Risk', color: 'caution' };
  if (maxScore >= 20) return { level: 'LOW', label: '🟢 LOW — Monitor Slowly', color: 'safe' };
  return { level: 'SAFE', label: '🟢 SAFE — Stable', color: 'safe' };
};

export const computePrediction = (vitalsHistory, envHistory, baseline, disasterMode) => {
  if (vitalsHistory.length < 2 || envHistory.length < 2) return { warning: null, projectedRisks: [] };

  const currentVitals = vitalsHistory[vitalsHistory.length - 1];
  const oldVitals = vitalsHistory[0];
  const currentEnv = envHistory[envHistory.length - 1];
  const oldEnv = envHistory[0];

  const timeDiffMins = (currentVitals.timestamp - oldVitals.timestamp) / 60000;
  if (timeDiffMins <= 0) return { warning: null, projectedRisks: [] };

  const rates = {
    heartRate: (currentVitals.heartRate - oldVitals.heartRate) / timeDiffMins,
    bodyTemp: (currentVitals.bodyTemp - oldVitals.bodyTemp) / timeDiffMins,
    ambientTemp: (currentEnv.ambientTemp - oldEnv.ambientTemp) / timeDiffMins,
    humidity: (currentEnv.humidity - oldEnv.humidity) / timeDiffMins,
  };

  const horizonMins = 30;

  const projectedVitals = {
    ...currentVitals,
    heartRate: Math.max(40, Math.min(220, currentVitals.heartRate + rates.heartRate * horizonMins)),
    bodyTemp: Math.max(35, Math.min(42, currentVitals.bodyTemp + rates.bodyTemp * horizonMins)),
  };

  const projectedEnv = {
    ...currentEnv,
    ambientTemp: Math.max(-20, Math.min(60, currentEnv.ambientTemp + rates.ambientTemp * horizonMins)),
    humidity: Math.max(0, Math.min(100, currentEnv.humidity + rates.humidity * horizonMins)),
    exposureMinutes: currentEnv.exposureMinutes + horizonMins
  };

  const currentRisks = computeRisk(currentVitals, currentEnv, baseline, disasterMode);
  const projectedRisks = computeRisk(projectedVitals, projectedEnv, baseline, disasterMode);

  const severityOrder = { SAFE: 0, LOW: 1, MEDIUM: 2, MODERATE: 3, HIGH: 4 };

  let worstEscalation = null;

  for (let i = 0; i < currentRisks.length; i++) {
    const current = currentRisks[i];
    const projected = projectedRisks[i];
    
    if (severityOrder[projected.severity] > severityOrder[current.severity]) {
      let nextThreshold = 20; 
      if (current.severity === 'LOW') nextThreshold = 40; 
      else if (current.severity === 'MEDIUM') nextThreshold = 60; 
      else if (current.severity === 'MODERATE') nextThreshold = 80;

      if (current.riskId === 'fall' && current.severity === 'SAFE') nextThreshold = 50;

      let etaMinutes = horizonMins;
      const scoreRate = (projected.score - current.score) / horizonMins;
      if (scoreRate > 0) {
        etaMinutes = (nextThreshold - current.score) / scoreRate;
      }
      
      etaMinutes = Math.max(10, Math.min(90, Math.round(etaMinutes)));

      const trendFactors = [];
      if (rates.ambientTemp > 0.1) trendFactors.push(`Ambient temperature rising ${rates.ambientTemp.toFixed(1)}°C/min`);
      if (rates.heartRate > 0.5) trendFactors.push(`Heart rate climbing, currently ${currentVitals.heartRate.toFixed(0)} BPM`);
      if (rates.bodyTemp > 0.05) trendFactors.push(`Body temperature rising ${rates.bodyTemp.toFixed(2)}°C/min`);
      if (rates.humidity > 0.5) trendFactors.push(`Humidity increasing ${rates.humidity.toFixed(1)}%/min`);
      if (trendFactors.length === 0) trendFactors.push(`Continuous exposure escalating risk`);

      const confidence = timeDiffMins >= 2 ? 'High' : (timeDiffMins >= 1 ? 'Moderate' : 'Low');

      const escalation = {
        riskId: current.riskId,
        currentSeverity: current.severity,
        predictedSeverity: projected.severity,
        etaMinutes,
        trendFactors: trendFactors.slice(0, 2),
        confidence
      };

      if (!worstEscalation || etaMinutes < worstEscalation.etaMinutes) {
        worstEscalation = escalation;
      }
    }
  }

  return {
    warning: worstEscalation,
    projectedRisks
  };
};

