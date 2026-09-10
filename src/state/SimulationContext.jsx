import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { computeRisk, getOverallRisk } from './riskLogic';

const SimulationContext = createContext(null);

const DEFAULT_BASELINE = {
  general: { heartRate: 75, spo2: 98, bodyTemp: 36.6 },
  outdoor_worker: { heartRate: 70, spo2: 98, bodyTemp: 36.8 },
  elderly: { heartRate: 65, spo2: 96, bodyTemp: 36.4 },
  farmer: { heartRate: 72, spo2: 97, bodyTemp: 36.7 },
  industrial_worker: { heartRate: 74, spo2: 97, bodyTemp: 36.6 },
  disaster_responder: { heartRate: 68, spo2: 99, bodyTemp: 36.5 },
};

export const SimulationProvider = ({ children }) => {
  // Persistence
  const loadState = (key, defaultVal) => {
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : defaultVal;
    } catch {
      return defaultVal;
    }
  };

  const [onboardingComplete, setOnboardingComplete] = useState(() => loadState('onboardingComplete', false));
  const [userProfile, setUserProfile] = useState(() => loadState('userProfile', null));
  const [disasterMode, setDisasterMode] = useState(() => loadState('disasterMode', 'normal'));
  const [privacySettings, setPrivacySettings] = useState(() => loadState('privacySettings', {
    healthProcessing: 'local',
    cloudSync: false,
    locationSharing: 'sos_only',
    healthDataSharing: false
  }));
  const [medications, setMedications] = useState(() => loadState('medications', []));

  // Ensure saving to localStorage
  useEffect(() => localStorage.setItem('onboardingComplete', JSON.stringify(onboardingComplete)), [onboardingComplete]);
  useEffect(() => localStorage.setItem('userProfile', JSON.stringify(userProfile)), [userProfile]);
  useEffect(() => localStorage.setItem('disasterMode', JSON.stringify(disasterMode)), [disasterMode]);
  useEffect(() => localStorage.setItem('privacySettings', JSON.stringify(privacySettings)), [privacySettings]);
  useEffect(() => localStorage.setItem('medications', JSON.stringify(medications)), [medications]);

  // Medication Helpers
  const addMedication = (med) => setMedications(prev => [...prev, med]);
  const editMedication = (med) => setMedications(prev => prev.map(m => m.id === med.id ? med : m));
  const deleteMedication = (id) => setMedications(prev => prev.filter(m => m.id !== id));
  
  const logDose = (medId, time, status, dateStr = new Date().toISOString().split('T')[0]) => {
    setMedications(prev => prev.map(m => {
      if (m.id !== medId) return m;
      const newLog = [...m.log.filter(l => !(l.time === time && l.date === dateStr)), { date: dateStr, time, status }];
      return { ...m, log: newLog };
    }));
  };

  // Medication Reminder Notification Loop
  useEffect(() => {
    if (!onboardingComplete) return;

    const interval = setInterval(() => {
      const now = new Date();
      const todayStr = now.toISOString().split('T')[0];
      const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      
      const dayName = now.toLocaleDateString('en-US', { weekday: 'short' });

      setMedications(prevMeds => {
        let changed = false;
        const newMeds = prevMeds.map(med => {
          if (med.endDate && new Date(med.endDate) < now) return med;
          if (med.frequency === 'specific_days' && !med.days?.includes(dayName)) return med;
          
          let medChanged = false;
          let updatedLog = [...med.log];

          med.times.forEach(t => {
            const existingLog = updatedLog.find(l => l.date === todayStr && l.time === t);
            
            // Trigger Notification when time matches exactly
            if (t === currentTime && !existingLog) {
              updatedLog.push({ date: todayStr, time: t, status: 'pending' });
              medChanged = true;
              changed = true;
              
              if (med.reminderEnabled && Notification.permission === 'granted') {
                new Notification(`Medication Reminder`, {
                  body: `It's time to take ${med.name} (${med.dosage})`,
                  icon: '/vite.svg'
                });
              }
            }

            // Mark as missed if 15 minutes have passed
            if (existingLog && existingLog.status === 'pending') {
              const [h, m] = t.split(':').map(Number);
              const dueTime = new Date();
              dueTime.setHours(h, m, 0, 0);
              
              const diffMinutes = (now.getTime() - dueTime.getTime()) / 60000;
              if (diffMinutes > 15) {
                existingLog.status = 'missed';
                medChanged = true;
                changed = true;
              }
            }
          });

          return medChanged ? { ...med, log: updatedLog } : med;
        });

        return changed ? newMeds : prevMeds;
      });
    }, 30000);

    return () => clearInterval(interval);
  }, [onboardingComplete]);

  // Baseline
  const baseline = useMemo(() => {
    if (!userProfile) return DEFAULT_BASELINE.general;
    return { ...DEFAULT_BASELINE.general, ...DEFAULT_BASELINE[userProfile.userType], userType: userProfile.userType };
  }, [userProfile]);

  // Live Data State
  const [vitals, setVitals] = useState({
    timestamp: Date.now(),
    heartRate: baseline.heartRate,
    spo2: baseline.spo2,
    bodyTemp: baseline.bodyTemp,
    activityLevel: 'Resting',
    sleepHours: 7.5,
  });

  const [environment, setEnvironment] = useState({
    timestamp: Date.now(),
    ambientTemp: 24,
    humidity: 45,
    airQuality: 'Good',
    exposureMinutes: 0,
  });
  
  const [vitalsHistory, setVitalsHistory] = useState([]);

  // Simulation Engine (Ticks every 2s)
  useEffect(() => {
    if (!onboardingComplete) return;

    const interval = setInterval(() => {
      setVitals(prev => {
        const dHr = (Math.random() - 0.5) * 4;
        const dSpo2 = (Math.random() - 0.2) * 1;
        const dTemp = (Math.random() - 0.5) * 0.1;
        
        let newHr = Math.max(40, Math.min(200, prev.heartRate + dHr));
        let newSpo2 = Math.max(80, Math.min(100, prev.spo2 + dSpo2));
        let newTemp = Math.max(35, Math.min(42, prev.bodyTemp + dTemp));

        // Disaster Mode Bias
        if (disasterMode === 'heatwave') {
          newHr += 0.5;
          newTemp += 0.05;
        }

        const nextVitals = {
          ...prev,
          timestamp: Date.now(),
          heartRate: newHr,
          spo2: newSpo2,
          bodyTemp: newTemp,
        };
        
        setVitalsHistory(hist => {
          const newHist = [...hist, nextVitals];
          if (newHist.length > 60) newHist.shift();
          return newHist;
        });

        return nextVitals;
      });

      setEnvironment(prev => {
        let { ambientTemp, humidity, airQuality, exposureMinutes } = prev;
        
        if (disasterMode === 'heatwave') {
          ambientTemp = Math.min(45, ambientTemp + 0.5);
          humidity = Math.min(90, humidity + 1);
        } else if (disasterMode === 'pollution') {
          airQuality = 'Unhealthy';
        } else {
          ambientTemp += (24 - ambientTemp) * 0.1;
          humidity += (45 - humidity) * 0.1;
          airQuality = 'Good';
        }

        return {
          ...prev,
          timestamp: Date.now(),
          ambientTemp,
          humidity,
          airQuality,
          exposureMinutes: exposureMinutes + 1,
        };
      });

    }, 2000);

    return () => clearInterval(interval);
  }, [onboardingComplete, disasterMode]);

  // Derived Risks
  const risks = useMemo(() => computeRisk(vitals, environment, baseline, disasterMode), [vitals, environment, baseline, disasterMode]);
  const overallRisk = useMemo(() => getOverallRisk(risks), [risks]);

  const value = {
    onboardingComplete,
    setOnboardingComplete,
    userProfile,
    setUserProfile,
    disasterMode,
    setDisasterMode,
    privacySettings,
    setPrivacySettings,
    medications,
    addMedication,
    editMedication,
    deleteMedication,
    logDose,
    vitals,
    vitalsHistory,
    environment,
    baseline,
    risks,
    overallRisk
  };

  return (
    <SimulationContext.Provider value={value}>
      {children}
    </SimulationContext.Provider>
  );
};

export const useSimulation = () => useContext(SimulationContext);
