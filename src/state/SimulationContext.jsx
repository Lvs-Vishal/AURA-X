import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { computeRisk, getOverallRisk, computePrediction } from './riskLogic';
import { db } from '../firebase';
import { doc, setDoc, addDoc, collection, onSnapshot, updateDoc, deleteDoc } from 'firebase/firestore';

const SimulationContext = createContext(null);

const DEFAULT_BASELINE = {
  general: { heartRate: 75, spo2: 98, bodyTemp: 36.6, gsr: 2 },
  outdoor_worker: { heartRate: 70, spo2: 98, bodyTemp: 36.8, gsr: 3 },
  elderly: { heartRate: 65, spo2: 96, bodyTemp: 36.4, gsr: 2 },
  farmer: { heartRate: 72, spo2: 97, bodyTemp: 36.7, gsr: 3 },
  industrial_worker: { heartRate: 74, spo2: 97, bodyTemp: 36.6, gsr: 3 },
  disaster_responder: { heartRate: 68, spo2: 99, bodyTemp: 36.5, gsr: 4 },
};

const defaultContextValue = {
  uid: 'local_user',
  onboardingComplete: true,
  setOnboardingComplete: () => {},
  userProfile: { name: 'Alex Johnson', age: 34, userType: 'general', emergencyContact: { name: 'Sarah Johnson', phone: '+15550192' } },
  setUserProfile: () => {},
  disasterMode: 'normal',
  setDisasterMode: () => {},
  privacySettings: {
    healthProcessing: 'local',
    cloudSync: false,
    locationSharing: 'sos_only',
    healthDataSharing: false
  },
  setPrivacySettings: () => {},
  medications: [],
  addMedication: async () => {},
  editMedication: async () => {},
  deleteMedication: async () => {},
  logDose: async () => {},
  vitals: {
    timestamp: Date.now(),
    heartRate: 75,
    spo2: 98,
    bodyTemp: 36.6,
    gsr: 2,
    activityLevel: 'Resting',
    sleepHours: 7.5,
  },
  vitalsHistory: [],
  environment: {
    timestamp: Date.now(),
    ambientTemp: 24,
    humidity: 45,
    pm25: 8,
    airQuality: 'Good',
    exposureMinutes: 0,
  },
  baseline: DEFAULT_BASELINE.general,
  risks: [],
  overallRisk: { level: 'SAFE', label: 'Stable' },
  earlyPrediction: null,
  notify: async () => {},
  profileStatus: 'exists'
};

export const SimulationProvider = ({ children, uid = 'local_user' }) => {
  const [profileStatus, setProfileStatus] = useState('loading');
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [disasterMode, setDisasterMode] = useState('normal');
  const [privacySettings, setPrivacySettings] = useState({
    healthProcessing: 'local',
    cloudSync: false,
    locationSharing: 'sos_only',
    healthDataSharing: false
  });
  const [medications, setMedications] = useState([]);

  // Local Storage fallback helper
  const loadLocalProfile = () => {
    try {
      const stored = localStorage.getItem('aura_user_profile');
      const onboarding = localStorage.getItem('aura_onboarding_complete');
      if (stored) {
        const parsed = JSON.parse(stored);
        setUserProfile(parsed);
        setOnboardingComplete(onboarding === 'true');
        setProfileStatus('exists');
        return true;
      }
    } catch (e) {
      console.warn('localStorage read error:', e);
    }
    // Default demo profile for initial view if none exists
    const demoProfile = {
      name: 'Alex Johnson',
      age: 34,
      userType: 'general',
      emergencyContact: { name: 'Sarah Johnson', phone: '+15550192' }
    };
    setUserProfile(demoProfile);
    setOnboardingComplete(true);
    setProfileStatus('exists');
    return false;
  };

  // Sync user profile data from Firestore with fallback
  useEffect(() => {
    if (!uid) {
      loadLocalProfile();
      return;
    }

    let resolved = false;

    // Timeout safety for Firestore connection
    const timeout = setTimeout(() => {
      if (!resolved) {
        console.warn('Firestore snapshot timed out, using local/demo profile');
        loadLocalProfile();
      }
    }, 1500);

    let unsub = () => {};
    try {
      unsub = onSnapshot(doc(db, 'users', uid), (docSnap) => {
        resolved = true;
        clearTimeout(timeout);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setOnboardingComplete(data.onboardingComplete || false);
          if (data.name) {
            setUserProfile({
              name: data.name,
              age: data.age,
              userType: data.userType,
              emergencyContact: data.emergencyContact
            });
            setProfileStatus('exists');
          } else {
            setProfileStatus('not_found');
          }
          if (data.disasterMode) setDisasterMode(data.disasterMode);
          if (data.privacySettings) setPrivacySettings(data.privacySettings);
        } else {
          loadLocalProfile();
        }
      }, (err) => {
        resolved = true;
        clearTimeout(timeout);
        console.warn('Firestore snapshot error:', err);
        loadLocalProfile();
      });
    } catch (err) {
      resolved = true;
      clearTimeout(timeout);
      console.warn('Firestore subscription error:', err);
      loadLocalProfile();
    }

    return () => {
      clearTimeout(timeout);
      unsub();
    };
  }, [uid]);

  // Sync medications from Firestore
  useEffect(() => {
    if (!uid) return;
    const unsub = onSnapshot(collection(db, 'users', uid, 'medications'), (snapshot) => {
      const meds = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setMedications(meds);
    });
    return unsub;
  }, [uid]);

  const notify = async (type, title, body, linkTo) => {
    if (!uid) return;
    try {
      await addDoc(collection(db, 'users', uid, 'notifications'), {
        type,
        title,
        body,
        linkTo,
        timestamp: Date.now(),
        read: false
      });
      if (Notification.permission === 'granted') {
        new Notification(title, { body, icon: '/vite.svg' });
      }
    } catch(e) {
      console.error(e);
    }
  };

  // Medication Helpers
  const addMedication = async (med) => {
    await addDoc(collection(db, 'users', uid, 'medications'), med);
  };
  const editMedication = async (med) => {
    const { id, ...data } = med;
    await updateDoc(doc(db, 'users', uid, 'medications', id), data);
  };
  const deleteMedication = async (id) => {
    await deleteDoc(doc(db, 'users', uid, 'medications', id));
  };
  
  const logDose = async (medId, time, status, dateStr = new Date().toISOString().split('T')[0]) => {
    const med = medications.find(m => m.id === medId);
    if (!med) return;
    const newLog = [...(med.log || []).filter(l => !(l.time === time && l.date === dateStr)), { date: dateStr, time, status }];
    await updateDoc(doc(db, 'users', uid, 'medications', medId), { log: newLog });
  };

  // Medication Reminder Notification Loop
  useEffect(() => {
    if (!uid || !onboardingComplete || medications.length === 0) return;

    const interval = setInterval(() => {
      const now = new Date();
      const todayStr = now.toISOString().split('T')[0];
      const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      
      const dayName = now.toLocaleDateString('en-US', { weekday: 'short' });

      medications.forEach(async (med) => {
        if (med.endDate && new Date(med.endDate) < now) return;
        if (med.frequency === 'specific_days' && !med.days?.includes(dayName)) return;
        
        let medChanged = false;
        let updatedLog = [...(med.log || [])];

        med.times.forEach(t => {
          const existingLog = updatedLog.find(l => l.date === todayStr && l.time === t);
          
          if (t === currentTime && !existingLog) {
            updatedLog.push({ date: todayStr, time: t, status: 'pending' });
            medChanged = true;
            
            if (med.reminderEnabled) {
              notify(
                'medication',
                'Medication Reminder',
                `It's time to take ${med.name} (${med.dosage})`,
                '/medications'
              );
            }
          }

          if (existingLog && existingLog.status === 'pending') {
            const [h, m] = t.split(':').map(Number);
            const dueTime = new Date();
            dueTime.setHours(h, m, 0, 0);
            
            const diffMinutes = (now.getTime() - dueTime.getTime()) / 60000;
            if (diffMinutes > 15) {
              existingLog.status = 'missed';
              medChanged = true;
            }
          }
        });

        if (medChanged) {
          try {
            await updateDoc(doc(db, 'users', uid, 'medications', med.id), { log: updatedLog });
          } catch (e) {
            console.error(e);
          }
        }
      });
    }, 30000);

    return () => clearInterval(interval);
  }, [uid, onboardingComplete, medications]);

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
    gsr: baseline.gsr,
    activityLevel: 'Resting',
    sleepHours: 7.5,
  });

  const [environment, setEnvironment] = useState({
    timestamp: Date.now(),
    ambientTemp: 24,
    humidity: 45,
    pm25: 8,
    airQuality: 'Good',
    exposureMinutes: 0,
  });
  
  const [vitalsHistory, setVitalsHistory] = useState([]);
  const [environmentHistory, setEnvironmentHistory] = useState([]);
  
  const [lastRisks, setLastRisks] = useState(null);

  // Notification state to avoid spamming
  const [notifiedPredictions, setNotifiedPredictions] = useState(new Set());

  // Simulation Engine (Ticks every 2s)
  useEffect(() => {
    if (!uid || !onboardingComplete) return;

    const interval = setInterval(() => {
      setVitals(prev => {
        const dHr = (Math.random() - 0.5) * 4;
        const dSpo2 = (Math.random() - 0.2) * 1;
        const dTemp = (Math.random() - 0.5) * 0.1;
        const dGsr = (Math.random() - 0.5) * 0.5;
        
        let newHr = Math.max(40, Math.min(200, prev.heartRate + dHr));
        let newSpo2 = Math.max(80, Math.min(100, prev.spo2 + dSpo2));
        let newTemp = Math.max(35, Math.min(42, prev.bodyTemp + dTemp));
        let newGsr = Math.max(1, Math.min(30, prev.gsr + dGsr));

        if (disasterMode === 'heatwave') {
          newHr += 0.5;
          newTemp += 0.05;
          newGsr += 0.2;
        }
        
        if (prev.activityLevel !== 'Resting') {
           newGsr += 0.3;
        }

        const nextVitals = {
          ...prev,
          timestamp: Date.now(),
          heartRate: newHr,
          spo2: newSpo2,
          bodyTemp: newTemp,
          gsr: newGsr
        };

        if (newGsr - prev.gsr > 1.5) { // sharp rise
          addDoc(collection(db, 'users', uid, 'timelineEvents'), {
            time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
            status: 'Stress ↑',
            severity: 'caution',
            duration: null,
            factors: ['GSR ↑'],
            action: '',
            timestamp: Date.now()
          }).catch(console.error);
        }
        
        setDoc(doc(db, 'users', uid, 'vitals', 'latest'), nextVitals).catch(console.error);
        
        setVitalsHistory(hist => {
          const newHist = [...hist, nextVitals];
          // Write to vitalsHistory collection every ~5 minutes (150 ticks of 2s)
          if (newHist.length % 150 === 0) {
            addDoc(collection(db, 'users', uid, 'vitalsHistory'), nextVitals).catch(console.error);
          }
          if (newHist.length > 150) newHist.shift();
          return newHist;
        });

        return nextVitals;
      });

      setEnvironment(prev => {
        let { ambientTemp, humidity, pm25, exposureMinutes } = prev;
        
        if (disasterMode === 'heatwave') {
          ambientTemp = Math.min(45, ambientTemp + 0.5);
          humidity = Math.min(90, humidity + 1);
        } else if (disasterMode === 'pollution') {
          pm25 = Math.min(200, pm25 + 5);
        } else {
          ambientTemp += (24 - ambientTemp) * 0.1;
          humidity += (45 - humidity) * 0.1;
          pm25 += (8 - pm25) * 0.1;
        }

        let airQuality = 'Good';
        if (pm25 > 55) airQuality = 'Unhealthy';
        else if (pm25 > 35) airQuality = 'Unhealthy for Sensitive Groups';
        else if (pm25 > 12) airQuality = 'Moderate';

        const nextEnv = {
          ...prev,
          timestamp: Date.now(),
          ambientTemp,
          humidity,
          pm25,
          airQuality,
          exposureMinutes: exposureMinutes + 1,
        };

        setDoc(doc(db, 'users', uid, 'environment', 'latest'), nextEnv).catch(console.error);

        setEnvironmentHistory(hist => {
          const newHist = [...hist, nextEnv];
          if (newHist.length > 150) newHist.shift();
          return newHist;
        });

        return nextEnv;
      });

    }, 2000);

    return () => clearInterval(interval);
  }, [uid, onboardingComplete, disasterMode]);

  // Derived Risks
  const risks = useMemo(() => computeRisk(vitals, environment, baseline, disasterMode), [vitals, environment, baseline, disasterMode]);
  const overallRisk = useMemo(() => getOverallRisk(risks), [risks]);
  
  const earlyPrediction = useMemo(() => {
    return computePrediction(vitalsHistory, environmentHistory, baseline, disasterMode);
  }, [vitalsHistory, environmentHistory, baseline, disasterMode]);

  // Sync Risks & Early Predictions to Firestore
  useEffect(() => {
    if (!uid || !onboardingComplete || !risks) return;
    setDoc(doc(db, 'users', uid, 'riskAssessments', 'latest'), {
      risks,
      overallRisk,
      earlyPrediction: earlyPrediction || null,
      timestamp: Date.now()
    }).catch(console.error);

    // Risk Escalation logic
    if (lastRisks) {
      const severityOrder = { SAFE: 0, LOW: 1, MEDIUM: 2, MODERATE: 3, HIGH: 4 };
      risks.forEach(risk => {
        const oldRisk = lastRisks.find(r => r.riskId === risk.riskId);
        if (oldRisk && severityOrder[risk.severity] > severityOrder[oldRisk.severity] && risk.severity !== 'SAFE' && risk.severity !== 'LOW') {
          notify(
            'risk',
            `${risk.riskId.charAt(0).toUpperCase() + risk.riskId.slice(1)} Risk Escalation`,
            `Risk level escalated to ${risk.severity}`,
            `/risk/${risk.riskId}`
          );
        }
      });
    }
    setLastRisks(risks);

  }, [risks, earlyPrediction, uid, onboardingComplete]);

  // Proactive Warning Notification
  useEffect(() => {
    if (!earlyPrediction?.warning) return;
    const { warning } = earlyPrediction;
    
    if (warning.confidence === 'High' && warning.etaMinutes <= 20) {
      const notifKey = `${warning.riskId}-${warning.predictedSeverity}`;
        if (!notifiedPredictions.has(notifKey)) {
          notify(
            'early_prediction',
            `${warning.riskId.charAt(0).toUpperCase() + warning.riskId.slice(1)} Risk Escalation`,
            `Risk may reach ${warning.predictedSeverity} in ~${warning.etaMinutes} min.`,
            `/risk/${warning.riskId}?predicted=true`
          );
          setNotifiedPredictions(prev => new Set(prev).add(notifKey));
        }
    }
  }, [earlyPrediction, notifiedPredictions]);

  const setDisasterModeDb = async (mode) => {
    setDisasterMode(mode);
    try { localStorage.setItem('aura_disaster_mode', mode); } catch (e) {}
    if (uid) {
      await setDoc(doc(db, 'users', uid), { disasterMode: mode }, { merge: true }).catch(console.warn);
    }
  };

  const setOnboardingCompleteDb = async (complete) => {
    setOnboardingComplete(complete);
    try { localStorage.setItem('aura_onboarding_complete', complete ? 'true' : 'false'); } catch (e) {}
    if (uid) {
      await setDoc(doc(db, 'users', uid), { onboardingComplete: complete }, { merge: true }).catch(console.warn);
    }
  };

  const setUserProfileDb = async (profile) => {
    setUserProfile(profile);
    setProfileStatus('exists');
    setOnboardingComplete(true);
    try {
      localStorage.setItem('aura_user_profile', JSON.stringify(profile));
      localStorage.setItem('aura_onboarding_complete', 'true');
    } catch (e) {}
    if (uid) {
      await setDoc(doc(db, 'users', uid), { ...profile, onboardingComplete: true }, { merge: true }).catch(console.warn);
    }
  };

  const setPrivacySettingsDb = async (settings) => {
    setPrivacySettings(settings);
    try { localStorage.setItem('aura_privacy_settings', JSON.stringify(settings)); } catch (e) {}
    if (uid) {
      await setDoc(doc(db, 'users', uid), { privacySettings: settings }, { merge: true }).catch(console.warn);
    }
  };

  const value = {
    uid,
    onboardingComplete,
    setOnboardingComplete: setOnboardingCompleteDb,
    userProfile,
    setUserProfile: setUserProfileDb,
    disasterMode,
    setDisasterMode: setDisasterModeDb,
    privacySettings,
    setPrivacySettings: setPrivacySettingsDb,
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
    overallRisk,
    earlyPrediction,
    notify,
    profileStatus
  };

  return (
    <SimulationContext.Provider value={value}>
      {children}
    </SimulationContext.Provider>
  );
};

export const useSimulation = () => {
  const context = useContext(SimulationContext);
  return context || defaultContextValue;
};

