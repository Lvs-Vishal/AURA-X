import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, Fingerprint } from 'lucide-react';
import { useSimulation } from '../state/SimulationContext';

export default function BaselineLoading() {
  const navigate = useNavigate();
  const { userProfile, setOnboardingComplete } = useSimulation();
  
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setStep(1), 600),
      setTimeout(() => setStep(2), 1200),
      setTimeout(() => setStep(3), 1800),
      setTimeout(() => {
        setOnboardingComplete(true);
        navigate('/home');
      }, 2600)
    ];
    return () => timers.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const items = [
    "Baseline loaded",
    "Risk profile loaded",
    "Environment priorities loaded"
  ];

  const profileDisplay = userProfile?.userType ? userProfile.userType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Profile';

  return (
    <div className="min-h-screen bg-ink flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-8 h-8 rounded-full bg-safe/20 flex items-center justify-center text-safe">
            <Check className="w-5 h-5" />
          </div>
          <h1 className="text-2xl font-sans font-medium text-text-primary">User Identified</h1>
        </div>

        <div className="mb-12">
          <div className="text-lg text-text-primary">{userProfile?.name || 'User'}</div>
          <div className="text-text-secondary">Profile: {profileDisplay}</div>
        </div>

        <div className="flex items-center gap-4 mb-8">
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5], scale: [0.95, 1.05, 0.95] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-pulse"
          >
            <Fingerprint className="w-8 h-8" />
          </motion.div>
          <div className="text-text-primary font-medium">Loading personal response...</div>
        </div>

        <div className="space-y-4 ml-12">
          {items.map((item, index) => (
            <div key={item} className="flex items-center gap-3">
              <div className="w-5 h-5 flex items-center justify-center">
                {step > index ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="text-safe"
                  >
                    <Check className="w-5 h-5" />
                  </motion.div>
                ) : (
                  <div className="w-1.5 h-1.5 rounded-full bg-hairline"></div>
                )}
              </div>
              <span className={`transition-colors duration-300 ${step > index ? 'text-text-primary' : 'text-text-secondary'}`}>
                {item}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
