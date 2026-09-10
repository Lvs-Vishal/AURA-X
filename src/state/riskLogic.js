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
