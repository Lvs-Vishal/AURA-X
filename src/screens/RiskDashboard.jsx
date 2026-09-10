import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSimulation } from '../state/SimulationContext';
import { Card } from '../components/common/Card';
import { RiskBadge } from '../components/aura/RiskBadge';
import { Activity, Flame, Wind, HeartPulse, Moon, AlertOctagon } from 'lucide-react';

export default function RiskDashboard() {
  const navigate = useNavigate();
  const { risks, overallRisk } = useSimulation();

  const getRiskIcon = (id) => {
    switch(id) {
      case 'heat': return Flame;
      case 'respiratory': return Wind;
      case 'cardiovascular': return HeartPulse;
      case 'fatigue': return Moon;
      case 'fall': return AlertOctagon;
      default: return Activity;
    }
  };

  const getRiskLabel = (id) => id.charAt(0).toUpperCase() + id.slice(1);

  const getColor = (severity) => {
    switch(severity) {
      case 'SAFE':
      case 'LOW': return 'bg-safe';
      case 'MEDIUM':
      case 'MODERATE': return 'bg-caution';
      case 'HIGH': return 'bg-danger';
      default: return 'bg-safe';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-2xl font-sans font-medium text-text-primary mb-2">Risk Analysis</h1>
          <p className="text-text-secondary text-sm">Real-time assessment of environmental and physiological stressors.</p>
        </div>
        <div className={`px-4 py-2 rounded-xl border font-bold text-sm tracking-wide bg-surface-raised bg-opacity-80
          ${overallRisk.level === 'SAFE' ? 'border-safe/50 text-safe' : 
            overallRisk.level === 'HIGH' ? 'border-danger/50 text-danger' : 'border-caution/50 text-caution'}
        `}>
          Overall: {overallRisk.label}
        </div>
      </div>

      <Card className="p-6 p-6 bg-surface-raised border-hairline">
        <div className="space-y-8">
          {risks.map(risk => {
            const Icon = getRiskIcon(risk.riskId);
            const label = getRiskLabel(risk.riskId);
            const colorClass = getColor(risk.severity);
            
            return (
              <div 
                key={risk.riskId}
                onClick={() => navigate(`/risk/${risk.riskId}`)}
                className="group cursor-pointer block"
              >
                <div className="flex justify-between items-end mb-3">
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5 text-text-secondary group-hover:text-text-primary transition-colors" />
                    <span className="font-bold text-[0.8125rem] tracking-widest uppercase text-text-secondary group-hover:text-text-primary transition-colors">
                      {label} Risk
                    </span>
                  </div>
                  <RiskBadge severity={risk.severity} className="group-hover:border-text-primary transition-colors" />
                </div>
                
                {/* Meter Bar */}
                <div className="h-3 w-full bg-ink rounded-full overflow-hidden border border-hairline relative">
                  {/* Background segments for scale */}
                  <div className="absolute inset-0 flex">
                    <div className="flex-1 border-r border-surface/50"></div>
                    <div className="flex-1 border-r border-surface/50"></div>
                    <div className="flex-1 border-r border-surface/50"></div>
                    <div className="flex-1 border-r border-surface/50"></div>
                    <div className="flex-1"></div>
                  </div>
                  
                  <div 
                    className={`h-full rounded-full transition-all duration-1000 ${colorClass}`}
                    style={{ width: `${Math.max(risk.score, 2)}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
