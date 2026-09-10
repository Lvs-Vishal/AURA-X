import React, { useState, useEffect, useRef } from 'react';
import { useSimulation } from '../state/SimulationContext';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { CheckCircle2, ShieldAlert, MapPin, Phone, AlertOctagon } from 'lucide-react';
import { motion, useAnimation } from 'framer-motion';

export default function Emergency() {
  const { userProfile } = useSimulation();
  
  const [isHolding, setIsHolding] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);
  const [sosSent, setSosSent] = useState(false);
  
  const [showFallModal, setShowFallModal] = useState(false);
  const [fallCountdown, setFallCountdown] = useState(15);
  
  const holdTimerRef = useRef(null);
  const controls = useAnimation();

  // SOS Hold Logic
  const startHold = () => {
    if (sosSent) return;
    setIsHolding(true);
    controls.start({
      strokeDashoffset: 0,
      transition: { duration: 3, ease: "linear" }
    });
    
    let startTime = Date.now();
    holdTimerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min((elapsed / 3000) * 100, 100);
      setHoldProgress(progress);
      
      if (progress >= 100) {
        clearInterval(holdTimerRef.current);
        triggerSOS();
      }
    }, 50);
  };

  const endHold = () => {
    if (sosSent) return;
    setIsHolding(false);
    clearInterval(holdTimerRef.current);
    if (holdProgress < 100) {
      setHoldProgress(0);
      controls.stop();
      controls.set({ strokeDashoffset: 283 });
    }
  };

  const triggerSOS = () => {
    setSosSent(true);
    setIsHolding(false);
    setHoldProgress(100);
    controls.set({ strokeDashoffset: 0 });
  };

  // Fall Detection Demo
  useEffect(() => {
    let timer;
    if (showFallModal && fallCountdown > 0) {
      timer = setTimeout(() => setFallCountdown(c => c - 1), 1000);
    } else if (showFallModal && fallCountdown === 0) {
      setShowFallModal(false);
      triggerSOS();
    }
    return () => clearTimeout(timer);
  }, [showFallModal, fallCountdown]);

  const handleFallSimulation = () => {
    setShowFallModal(true);
    setFallCountdown(15);
  };

  const cancelFall = () => {
    setShowFallModal(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-20">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-sans font-medium text-text-primary mb-2">Emergency Response</h1>
        <p className="text-text-secondary">Instant access to critical assistance.</p>
      </div>

      <Card className="p-6 bg-surface-raised border-hairline mb-12">
        <h2 className="text-[0.8125rem] font-bold tracking-widest text-text-secondary uppercase mb-6 flex items-center gap-2">
          <ShieldAlert className="w-4 h-4" /> System Status
        </h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[0.9375rem]">Fall Detection</span>
            <div className="flex items-center gap-2 text-safe text-[0.8125rem] font-bold uppercase tracking-wider">
              <CheckCircle2 className="w-4 h-4" /> ON
            </div>
          </div>
          <div className="h-[1px] bg-hairline"></div>
          <div className="flex items-center justify-between">
            <span className="text-[0.9375rem]">Auto SOS</span>
            <div className="flex items-center gap-2 text-safe text-[0.8125rem] font-bold uppercase tracking-wider">
              <CheckCircle2 className="w-4 h-4" /> ON
            </div>
          </div>
          <div className="h-[1px] bg-hairline"></div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-text-secondary" />
              <span className="text-[0.9375rem]">Location</span>
            </div>
            <div className="flex items-center gap-2 text-safe text-[0.8125rem] font-bold uppercase tracking-wider">
              <CheckCircle2 className="w-4 h-4" /> Allowed
            </div>
          </div>
          <div className="h-[1px] bg-hairline"></div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-text-secondary" />
              <span className="text-[0.9375rem]">Emergency Contact</span>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 text-safe text-[0.8125rem] font-bold uppercase tracking-wider justify-end mb-1">
                <CheckCircle2 className="w-4 h-4" /> Added
              </div>
              <div className="text-xs text-text-secondary">{userProfile?.emergencyContact?.name}</div>
            </div>
          </div>
        </div>
      </Card>

      {/* SOS Button Area */}
      <div className="flex flex-col items-center justify-center py-8 relative">
        <div className="relative w-64 h-64 flex items-center justify-center mb-6">
          {/* Waveform behind button (ECG line) */}
          <div className="absolute inset-0 flex items-center justify-center opacity-30 pointer-events-none w-[200%] -left-[50%]">
            <svg width="100%" height="40" viewBox="0 0 400 40" preserveAspectRatio="none">
              <polyline points="0,20 150,20 160,5 170,35 180,20 400,20" fill="none" stroke="currentColor" strokeWidth="1" className="text-danger" />
            </svg>
          </div>

          {/* Progress Ring */}
          <svg className="absolute inset-0 w-full h-full transform -rotate-90 z-10 pointer-events-none" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="2" className="text-hairline" />
            <motion.circle 
              cx="50" 
              cy="50" 
              r="45" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="4" 
              className="text-danger"
              strokeDasharray="283"
              strokeDashoffset="283"
              animate={controls}
              strokeLinecap="round"
            />
          </svg>

          <button
            onMouseDown={startHold}
            onMouseUp={endHold}
            onMouseLeave={endHold}
            onTouchStart={startHold}
            onTouchEnd={endHold}
            className={`relative z-20 w-48 h-48 rounded-full flex flex-col items-center justify-center shadow-2xl transition-all duration-300 outline-none select-none
              ${sosSent ? 'bg-danger-strong scale-100' : isHolding ? 'bg-danger scale-95' : 'bg-surface-raised border border-danger hover:bg-danger/10'}
            `}
          >
            {sosSent ? (
              <CheckCircle2 className="w-16 h-16 text-ink mb-2" />
            ) : (
              <ShieldAlert className={`w-16 h-16 mb-2 ${isHolding ? 'text-ink' : 'text-danger'}`} />
            )}
            <span className={`text-2xl font-bold tracking-widest uppercase ${sosSent || isHolding ? 'text-ink' : 'text-danger'}`}>
              SOS
            </span>
          </button>
        </div>
        
        <div className="h-12 text-center">
          {sosSent ? (
            <div className="text-safe font-medium">SOS sent to {userProfile?.emergencyContact?.name} with your location.</div>
          ) : (
            <div className={`text-text-secondary font-medium transition-opacity duration-300 ${isHolding ? 'opacity-100 text-danger' : 'opacity-70'}`}>
              Hold for 3 seconds to send SOS
            </div>
          )}
        </div>
      </div>

      <div className="text-center pt-12 border-t border-hairline mt-12">
        <button 
          onClick={handleFallSimulation}
          className="text-sm text-text-secondary hover:text-text-primary underline decoration-hairline underline-offset-4"
        >
          Simulate Fall Detection
        </button>
      </div>

      {/* Fall Detection Modal */}
      {showFallModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/90 backdrop-blur-sm p-6">
          <Card className="w-full max-w-md p-8 text-center bg-surface border-danger/30 relative overflow-hidden shadow-[0_0_50px_-10px_rgba(255,107,87,0.3)]">
            <div className="absolute top-0 left-0 right-0 h-1 bg-hairline">
              <motion.div 
                className="h-full bg-danger" 
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ duration: 15, ease: 'linear' }}
              />
            </div>
            
            <div className="w-20 h-20 mx-auto rounded-full bg-danger/20 text-danger flex items-center justify-center mb-6">
              <AlertOctagon className="w-10 h-10" />
            </div>
            
            <h2 className="text-2xl font-sans font-medium text-text-primary mb-2">Fall Detected</h2>
            <p className="text-text-secondary mb-8">Are you okay?</p>
            
            <div className="text-6xl font-mono text-danger mb-8">
              {fallCountdown}
            </div>
            
            <p className="text-[0.9375rem] text-text-secondary mb-8 max-w-xs mx-auto">
              If you don't respond, an SOS will be sent to your emergency contact with your location.
            </p>
            
            <Button onClick={cancelFall} className="w-full py-4 text-lg bg-surface border border-hairline text-text-primary hover:bg-hairline">
              I'M OK
            </Button>
          </Card>
        </div>
      )}
    </div>
  );
}
