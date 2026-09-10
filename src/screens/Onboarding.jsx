import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '../components/common/Button';
import { useSimulation } from '../state/SimulationContext';

export default function Onboarding() {
  const navigate = useNavigate();
  const { onboardingComplete } = useSimulation();

  if (onboardingComplete) {
    navigate('/home');
    return null;
  }

  return (
    <div className="min-h-screen bg-ink flex flex-col items-center justify-center relative overflow-hidden">
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2 }}
      >
        <motion.div
          className="w-96 h-96 bg-pulse rounded-full blur-[100px] opacity-20"
          animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.25, 0.15] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        />
      </motion.div>
      
      <div className="relative z-10 flex flex-col items-center text-center max-w-md px-6 w-full">
        <h1 className="text-5xl font-sans font-bold text-text-primary tracking-tight mb-2">AURA-X</h1>
        <h2 className="text-xl text-pulse font-medium mb-12">AI Personal Health Guardian</h2>
        
        <div className="flex flex-wrap justify-center items-center gap-3 text-[0.8125rem] font-mono tracking-[0.2em] text-text-secondary uppercase mb-16">
          <span>Sense</span>
          <span className="w-1 h-1 rounded-full bg-hairline shrink-0"></span>
          <span>Learn</span>
          <span className="w-1 h-1 rounded-full bg-hairline shrink-0"></span>
          <span>Predict</span>
          <span className="w-1 h-1 rounded-full bg-hairline shrink-0"></span>
          <span>Act</span>
        </div>
        
        <Button onClick={() => navigate('/create-profile')} className="w-full text-lg shadow-[0_0_40px_-10px_rgba(79,216,196,0.3)]">
          Get Started
        </Button>
      </div>
    </div>
  );
}
