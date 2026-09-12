import { useState, useEffect, useMemo } from 'react';
import { doc, collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { useSimulation } from './SimulationContext';

const DEFAULT_BASELINE = {
  general: { heartRate: 75, spo2: 98, bodyTemp: 36.6 },
  outdoor_worker: { heartRate: 70, spo2: 98, bodyTemp: 36.8 },
  elderly: { heartRate: 65, spo2: 96, bodyTemp: 36.4 },
  farmer: { heartRate: 72, spo2: 97, bodyTemp: 36.7 },
  industrial_worker: { heartRate: 74, spo2: 97, bodyTemp: 36.6 },
  disaster_responder: { heartRate: 68, spo2: 99, bodyTemp: 36.5 },
};

export function useFirebaseData() {
  const sim = useSimulation();
  const { uid, userProfile, disasterMode, logDose } = sim;

  const [vitals, setVitals] = useState(null);
  const [environment, setEnvironment] = useState(null);
  const [vitalsHistory, setVitalsHistory] = useState(null);
  const [risks, setRisks] = useState(null);
  const [overallRisk, setOverallRisk] = useState(null);
  const [earlyPrediction, setEarlyPrediction] = useState(null);
  const [medications, setMedications] = useState(null);
  const [timelineEvents, setTimelineEvents] = useState([]);

  useEffect(() => {
    if (!uid) return;
    
    let unsubVitals = () => {}, unsubEnv = () => {}, unsubRisk = () => {}, unsubMeds = () => {}, unsubVitalsHist = () => {}, unsubTimeline = () => {};

    try {
      unsubVitals = onSnapshot(doc(db, 'users', uid, 'vitals', 'latest'), (snap) => {
        if (snap.exists()) setVitals(snap.data());
      }, console.warn);
      
      unsubEnv = onSnapshot(doc(db, 'users', uid, 'environment', 'latest'), (snap) => {
        if (snap.exists()) setEnvironment(snap.data());
      }, console.warn);

      unsubRisk = onSnapshot(doc(db, 'users', uid, 'riskAssessments', 'latest'), (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          if (data.risks) setRisks(data.risks);
          if (data.overallRisk) setOverallRisk(data.overallRisk);
          if (data.earlyPrediction) setEarlyPrediction(data.earlyPrediction);
        }
      }, console.warn);

      const qMeds = collection(db, 'users', uid, 'medications');
      unsubMeds = onSnapshot(qMeds, (snap) => {
        setMedications(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      }, console.warn);

      const qVitalsHist = query(collection(db, 'users', uid, 'vitalsHistory'), orderBy('timestamp', 'desc'), limit(150));
      unsubVitalsHist = onSnapshot(qVitalsHist, (snap) => {
        if (snap.docs.length > 0) setVitalsHistory(snap.docs.map(d => d.data()).reverse());
      }, console.warn);

      const qTimeline = query(collection(db, 'users', uid, 'timelineEvents'), orderBy('timestamp', 'desc'), limit(50));
      unsubTimeline = onSnapshot(qTimeline, (snap) => {
        setTimelineEvents(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      }, console.warn);
    } catch (e) {
      console.warn('Firebase listeners initialization error:', e);
    }

    return () => {
      unsubVitals();
      unsubEnv();
      unsubRisk();
      unsubMeds();
      unsubVitalsHist();
      unsubTimeline();
    };
  }, [uid]);

  const baseline = useMemo(() => {
    if (!userProfile) return DEFAULT_BASELINE.general;
    return { ...DEFAULT_BASELINE.general, ...DEFAULT_BASELINE[userProfile.userType], userType: userProfile.userType };
  }, [userProfile]);

  const activeVitals = vitals || sim.vitals;
  const activeEnvironment = environment || sim.environment;
  const activeVitalsHistory = vitalsHistory || sim.vitalsHistory;
  const activeRisks = risks || sim.risks;
  const activeOverallRisk = overallRisk || sim.overallRisk;
  const activeEarlyPrediction = earlyPrediction || sim.earlyPrediction;
  const activeMedications = medications || sim.medications;

  return {
    uid,
    userProfile,
    disasterMode,
    vitals: activeVitals,
    environment: activeEnvironment,
    vitalsHistory: activeVitalsHistory,
    risks: activeRisks,
    overallRisk: activeOverallRisk,
    earlyPrediction: activeEarlyPrediction,
    medications: activeMedications,
    logDose,
    baseline,
    timelineEvents
  };
}

