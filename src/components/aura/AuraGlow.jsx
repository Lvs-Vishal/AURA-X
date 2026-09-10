import React from 'react';
import { motion } from 'framer-motion';

export function AuraGlow({ riskLevel, heartRate, children }) {
  const colors = {
    SAFE: '#34D399',
    LOW: '#34D399',
    MEDIUM: '#F2B84B',
    MODERATE: '#F2B84B',
    HIGH: '#FF6B57'
  };
  
  const color = colors[riskLevel] || '#4FD8C4';
  
  // Cap the pulse animation speed so it stays calming
  const baseCycle = 60000 / (heartRate || 60);
  const cycleMs = Math.max(baseCycle, 1200);

  return (
    <div className="relative flex items-center justify-center p-12 w-full max-w-sm mx-auto">
      {/* Outer Pulse */}
      <motion.div
        className="absolute inset-0 rounded-full blur-[60px] opacity-30"
        style={{ backgroundColor: color }}
        animate={{ scale: [1, 1.15, 1], opacity: [0.15, 0.35, 0.15] }}
        transition={{ duration: cycleMs / 1000, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Inner Content */}
      <div className="relative z-10 text-center flex flex-col items-center gap-4">
        {children}
      </div>
    </div>
  );
}
