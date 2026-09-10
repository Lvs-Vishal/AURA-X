import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Activity, AlertTriangle, AlertOctagon, Menu, Layers, Clock, History, Shield, X, User, Pill } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function BottomNav() {
  const [menuOpen, setMenuOpen] = useState(false);

  const mainNav = [
    { to: '/home', icon: Home, label: 'Home' },
    { to: '/live', icon: Activity, label: 'Live' },
    { to: '/risk', icon: AlertTriangle, label: 'Risk' },
    { to: '/emergency', icon: AlertOctagon, label: 'SOS', isEmergency: true },
  ];

  const extraNav = [
    { to: '/medications', icon: Pill, label: 'Medications' },
    { to: '/profile', icon: User, label: 'Profile Settings' },
    { to: '/context', icon: Layers, label: 'Context Engine' },
    { to: '/timeline', icon: Clock, label: 'Health Timeline' },
    { to: '/history', icon: History, label: 'History & Trends' },
    { to: '/privacy', icon: Shield, label: 'Privacy Settings' },
  ];

  return (
    <>
      <div className="bg-surface border-t border-hairline px-2 pb-safe pt-2 flex items-center justify-between z-40 relative">
        {mainNav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `flex flex-col items-center gap-1 p-2 min-w-[64px] transition-colors ${
              item.isEmergency 
                ? (isActive ? 'text-danger-strong' : 'text-danger') 
                : (isActive ? 'text-pulse' : 'text-text-secondary')
            }`}
          >
            <item.icon className="w-6 h-6" />
            <span className="text-[0.625rem] font-bold tracking-wider">{item.label}</span>
          </NavLink>
        ))}
        
        <button 
          onClick={() => setMenuOpen(true)}
          className="flex flex-col items-center gap-1 p-2 min-w-[64px] text-text-secondary transition-colors"
        >
          <Menu className="w-6 h-6" />
          <span className="text-[0.625rem] font-bold tracking-wider">Menu</span>
        </button>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <div className="absolute inset-0 z-50 flex flex-col justify-end pointer-events-none">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
              className="absolute inset-0 bg-ink/80 backdrop-blur-sm pointer-events-auto"
            />
            
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
              className="bg-surface border-t border-hairline rounded-t-3xl p-6 pb-8 pointer-events-auto relative"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-medium text-text-primary">More</h2>
                <button onClick={() => setMenuOpen(false)} className="p-2 bg-surface-raised rounded-full text-text-secondary">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-2">
                {extraNav.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => setMenuOpen(false)}
                    className={({ isActive }) => `flex items-center gap-4 p-4 rounded-xl transition-colors ${
                      isActive ? 'bg-pulse/10 text-pulse' : 'bg-surface-raised text-text-primary'
                    }`}
                  >
                    <item.icon className="w-6 h-6" />
                    <span className="font-medium">{item.label}</span>
                  </NavLink>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
