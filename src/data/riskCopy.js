export const getRiskCopy = (riskId, vitals, env, baseline) => {
  switch(riskId) {
    case 'heat':
      return {
        factors: [
          `↑ ${Math.round(((vitals.heartRate - baseline.heartRate) / baseline.heartRate) * 100)}% HR above personal baseline`,
          `${env.ambientTemp.toFixed(1)}°C ambient temperature`,
          `${env.humidity.toFixed(0)}% humidity`,
          `${vitals.activityLevel} physical activity`,
          `${env.exposureMinutes} min continuous exposure`
        ],
        actions: [
          "Hydrate",
          "Take a rest",
          "Move to a cooler/shaded area",
          "Monitor symptoms"
        ]
      };
    case 'respiratory':
      return {
        factors: [
          `Air Quality: ${env.airQuality}`,
          `SpO₂ at ${vitals.spo2.toFixed(0)}%`,
          `${vitals.activityLevel} physical activity`
        ],
        actions: [
          "Wear a high-filtration mask",
          "Reduce physical exertion",
          "Move indoors if possible",
          "Use an air purifier"
        ]
      };
    case 'cardiovascular':
      return {
        factors: [
          `Sustained elevated HR: ${vitals.heartRate.toFixed(0)} BPM`,
          `Body Temp: ${vitals.bodyTemp.toFixed(1)}°C`,
          `High environmental stress (${env.ambientTemp.toFixed(1)}°C)`
        ],
        actions: [
          "Stop current activity immediately",
          "Sit or lie down in a cool place",
          "Loosen tight clothing",
          "Prepare to seek medical help if it doesn't resolve"
        ]
      };
    case 'fatigue':
      return {
        factors: [
          `Prolonged ${vitals.activityLevel} activity`,
          `Sleep duration: ${vitals.sleepHours} hours`,
          `Continuous exposure: ${env.exposureMinutes} min`
        ],
        actions: [
          "Take a mandatory 15-minute break",
          "Hydrate and have a light snack",
          "Stretch and rest eyes"
        ]
      };
    case 'fall':
      return {
        factors: [
          "Sudden acceleration detected",
          "Loss of altitude",
          "Lack of movement post-impact"
        ],
        actions: [
          "Check for injuries",
          "If unable to move, press and hold SOS",
          "Wait for emergency assistance"
        ]
      };
    default:
      return { factors: [], actions: [] };
  }
}
