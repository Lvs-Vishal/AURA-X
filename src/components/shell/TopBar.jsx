import React from 'react';
import { useSimulation } from '../../state/SimulationContext';
import { Bell, User } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export function TopBar() {
  const { userProfile, disasterMode } = useSimulation();
  const location = useLocation();

  const modeConfig = {
    normal: { label: '🟢 Normal', color: 'bg-safe/20 text-safe' },
    heatwave: { label: '☀️ Heatwave', color: 'bg-danger/20 text-danger' },
    pollution: { label: '🌫️ Pollution', color: 'bg-caution/20 text-caution' },
    flood: { label: '🌊 Flood', color: 'bg-pulse/20 text-pulse' },
    cyclone: { label: '🌀 Cyclone', color: 'bg-pulse/20 text-pulse' }
  };

  const activeMode = modeConfig[disasterMode] || modeConfig.normal;

  return (
    <div className="h-14 flex items-center justify-between px-4 border-b border-hairline bg-surface shrink-0 relative z-30">
      <div className="flex items-center">
        <h1 className="text-[1.125rem] font-sans font-medium text-text-primary">
          AURA-X
        </h1>
      </div>
      
      <div className="flex items-center gap-2">
        <Link to="/context" className={`px-3 py-1 mr-1 rounded-[999px] text-[0.6875rem] font-bold tracking-wide transition-colors ${activeMode.color}`}>
          {activeMode.label}
        </Link>
        <button className="p-1.5 text-text-secondary hover:text-text-primary transition-colors relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-pulse rounded-full"></span>
        </button>
        <Link to="/profile" className={`p-1.5 rounded-full transition-colors flex items-center justify-center ${location.pathname === '/profile' ? 'bg-pulse/20 text-pulse border border-pulse/30' : 'text-text-secondary hover:text-text-primary bg-surface-raised border border-hairline'}`}>
          <User className="w-5 h-5" />
        </Link>
      </div>
      
      {/* Waveform border effect */}
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-hairline via-pulse/30 to-hairline"></div>
    </div>
  );
}
