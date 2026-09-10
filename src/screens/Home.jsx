import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSimulation } from '../state/SimulationContext';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { AuraGlow } from '../components/aura/AuraGlow';
import { RiskBadge } from '../components/aura/RiskBadge';
import { Activity, Flame, Wind, HeartPulse, Moon, AlertOctagon, Droplets, CloudFog, Clock, Pill } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line } from 'recharts';

function Sparkline({ data, dataKey, color }) {
  if (!data || data.length === 0) return null;
  return (
    <div className="h-8 w-16 opacity-50 absolute right-4 bottom-4">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} dot={false} isAnimationActive={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const { userProfile, vitals, vitalsHistory, environment, risks, overallRisk, medications, logDose } = useSimulation();

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

  const nextMed = React.useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const dayName = new Date().toLocaleDateString('en-US', { weekday: 'short' });
    const now = new Date();
    
    let allDoses = [];
    
    (medications || []).forEach(med => {
      if (med.endDate && new Date(med.endDate) < now) return;
      if (med.frequency === 'specific_days' && !med.days?.includes(dayName)) return;
      
      med.times.forEach(t => {
        const log = med.log.find(l => l.date === todayStr && l.time === t);
        if (!log || (log.status !== 'taken')) {
          const [h, m] = t.split(':').map(Number);
          const dueTime = new Date();
          dueTime.setHours(h, m, 0, 0);
          
          allDoses.push({ med, time: t, dueTime, status: log?.status || 'upcoming' });
        }
      });
    });
    
    if (allDoses.length === 0) return null;
    allDoses.sort((a, b) => a.dueTime - b.dueTime);
    
    const overdue = allDoses.find(d => d.dueTime < now);
    return overdue || allDoses[0];
  }, [medications]);

  const getRiskLabel = (id) => id.charAt(0).toUpperCase() + id.slice(1);

  return (
    <div className="flex flex-col gap-6">
      {/* Primary Column */}
      <div className=" flex flex-col gap-6 gap-6">
        
        {/* Aura Hero */}
        <Card className="flex flex-col items-center py-8 relative overflow-hidden h-[300px] justify-center border-pulse/20 bg-gradient-to-b from-surface to-surface-raised">
          <AuraGlow riskLevel={overallRisk.level} heartRate={vitals.heartRate}>
            <div className="text-[1.5rem] font-sans font-medium">{userProfile?.name || 'User'}</div>
            <div className="text-[1.125rem] text-text-secondary mb-4">{overallRisk.level === 'SAFE' ? 'Stable' : 'Elevated Risk'}</div>
            <div className={`px-4 py-2 rounded-xl bg-surface-raised border font-bold text-sm tracking-wide bg-opacity-80
              ${overallRisk.level === 'SAFE' ? 'border-safe/50 text-safe' : 
                overallRisk.level === 'HIGH' ? 'border-danger/50 text-danger' : 'border-caution/50 text-caution'}
            `}>
              {overallRisk.label}
            </div>
          </AuraGlow>
        </Card>

        {/* Vitals Row */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="p-4 pb-6 relative overflow-hidden group hover:border-text-secondary transition-colors cursor-default">
            <div className="text-[0.6875rem] font-bold tracking-wider text-text-secondary uppercase mb-2 group-hover:text-pulse transition-colors">Heart Rate</div>
            <div className="text-2xl font-mono text-text-primary">{vitals.heartRate.toFixed(0)} <span className="text-sm text-text-secondary">BPM</span></div>
            <Sparkline data={vitalsHistory} dataKey="heartRate" color="#FF6B57" />
          </Card>
          <Card className="p-4 pb-6 relative overflow-hidden group hover:border-text-secondary transition-colors cursor-default">
            <div className="text-[0.6875rem] font-bold tracking-wider text-text-secondary uppercase mb-2 group-hover:text-pulse transition-colors">SpO₂</div>
            <div className="text-2xl font-mono text-text-primary">{vitals.spo2.toFixed(0)} <span className="text-sm text-text-secondary">%</span></div>
            <Sparkline data={vitalsHistory} dataKey="spo2" color="#4FD8C4" />
          </Card>
          <Card className="p-4 pb-6 relative overflow-hidden group hover:border-text-secondary transition-colors cursor-default">
            <div className="text-[0.6875rem] font-bold tracking-wider text-text-secondary uppercase mb-2 group-hover:text-pulse transition-colors">Body Temp</div>
            <div className="text-2xl font-mono text-text-primary">{vitals.bodyTemp.toFixed(1)} <span className="text-sm text-text-secondary">°C</span></div>
            <Sparkline data={vitalsHistory} dataKey="bodyTemp" color="#F2B84B" />
          </Card>
          <Card className="p-4 pb-6 flex flex-col justify-center bg-surface-raised border-hairline">
            <div className="text-[0.6875rem] font-bold tracking-wider text-text-secondary uppercase mb-2">Activity</div>
            <div className="text-lg font-sans text-text-primary truncate">{vitals.activityLevel}</div>
          </Card>
          <Card className="p-4 pb-6 flex flex-col justify-center bg-surface-raised border-hairline">
            <div className="text-[0.6875rem] font-bold tracking-wider text-text-secondary uppercase mb-2">Sleep</div>
            <div className="text-lg font-mono text-text-primary">{Math.floor(vitals.sleepHours)}h {Math.round((vitals.sleepHours % 1) * 60)}m</div>
          </Card>
        </div>

        {/* Waveform Divider */}
        <div className="h-[1px] bg-gradient-to-r from-transparent via-hairline to-transparent w-full my-2"></div>

        {/* Predicted Risks */}
        <Card className="p-6 bg-surface-raised border-hairline">
          <div className="mb-6">
            <h2 className="text-[0.6875rem] font-bold tracking-widest text-text-secondary uppercase mb-2">Overall Risk Level</h2>
            <div className="flex items-center justify-between">
              <div className={`text-lg font-bold ${overallRisk.level === 'SAFE' ? 'text-safe' : overallRisk.level === 'HIGH' ? 'text-danger' : 'text-caution'}`}>
                {overallRisk.level === 'SAFE' ? '🟢 SAFE' : overallRisk.level === 'HIGH' ? '🔴 HIGH' : '🟡 MODERATE'} — {overallRisk.level === 'SAFE' ? 'Stable Monitoring' : 'Early Warning'}
              </div>
              <Button variant="secondary" onClick={() => navigate('/risk')} className="py-1.5 px-3 text-[0.75rem] bg-surface h-auto rounded-full">
                Details
              </Button>
            </div>
          </div>
          
          <h2 className="text-[0.6875rem] font-bold tracking-widest text-text-secondary uppercase mb-3">Predicted / Assessed Risks</h2>
          <div className="space-y-2.5 mb-6">
            {risks.map(risk => {
              const getEmoji = (sev) => {
                if (sev === 'SAFE' || sev === 'LOW') return '🟢';
                if (sev === 'HIGH') return '🔴';
                return sev === 'MODERATE' ? '🟠' : '🟡';
              };
              
              const riskNameMapping = {
                'heat': '🔥 Heat Stress',
                'respiratory': '🫁 Respiratory Risk',
                'cardiovascular': '❤️ Cardiovascular Stress',
                'fatigue': '😴 Fatigue Risk',
                'fall': '🚶 Fall / Distress Risk'
              };

              return (
                <div 
                  key={risk.riskId}
                  onClick={() => navigate(`/risk/${risk.riskId}`)}
                  className="flex items-center justify-between p-3 rounded-xl bg-surface border border-hairline hover:border-text-secondary cursor-pointer transition-colors"
                >
                  <div className="font-medium text-[0.875rem] text-text-primary">
                    {riskNameMapping[risk.riskId] || getRiskLabel(risk.riskId)}
                  </div>
                  <div className={`text-[0.75rem] font-bold tracking-wider uppercase flex items-center gap-1.5 ${
                    risk.severity === 'SAFE' || risk.severity === 'LOW' ? 'text-safe' :
                    risk.severity === 'HIGH' ? 'text-danger' : 'text-caution'
                  }`}>
                    — {getEmoji(risk.severity)} {risk.severity}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-5 border-t border-hairline space-y-3">
            <div className="text-[0.8125rem] leading-relaxed">
              <span className="text-text-secondary font-medium">Prediction Horizon: </span>
              <span className="text-text-primary">Next 30–60 minutes</span>
            </div>
            <div className="text-[0.8125rem] leading-relaxed">
              <span className="text-text-secondary font-medium">Confidence: </span>
              <span className="text-text-primary">Based on current sensor quality + personal baseline + environment + activity</span>
            </div>
          </div>
        </Card>

        {/* Next Medication */}
        {nextMed && (
          <Card className={`p-4 border-hairline flex flex-col gap-4 ${
            nextMed.dueTime < new Date() ? 'bg-danger/10 border-danger/30' : 'bg-surface-raised'
          }`}>
            <div className="flex justify-between items-start">
              <div className="flex gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  nextMed.dueTime < new Date() ? 'bg-danger/20 text-danger' : 'bg-pulse/10 text-pulse'
                }`}>
                  <Pill className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-medium text-text-primary leading-tight">{nextMed.med.name}</h3>
                  <div className="text-[0.6875rem] font-mono text-text-secondary mt-1">{nextMed.med.dosage} • {nextMed.time}</div>
                </div>
              </div>
              <div className={`text-[0.6875rem] font-bold uppercase tracking-wider ${nextMed.dueTime < new Date() ? 'text-danger' : 'text-text-secondary'}`}>
                {nextMed.dueTime < new Date() ? 'Overdue' : 'Upcoming'}
              </div>
            </div>
            <Button 
              className={`w-full text-[0.8125rem] font-bold tracking-wide py-2 ${nextMed.dueTime < new Date() ? 'bg-danger hover:bg-danger-strong text-white' : ''}`}
              onClick={() => logDose(nextMed.med.id, nextMed.time, 'taken')}
            >
              Mark as Taken
            </Button>
          </Card>
        )}
      </div>

      {/* Secondary Column */}
      <div className=" flex flex-col gap-6 gap-6">
        <Card className="p-6 flex flex-col h-full bg-surface-raised border-hairline">
          <h2 className="text-[1.125rem] font-medium text-text-primary mb-6 flex items-center gap-2">
            <CloudFog className="w-5 h-5 text-text-secondary" />
            Current Environment
          </h2>
          
          <div className="space-y-6 flex-1">
            <div className="flex justify-between items-center border-b border-hairline pb-4">
              <div className="flex items-center gap-3 text-text-secondary">
                <Flame className="w-5 h-5" />
                <span className="text-sm">Ambient Temp</span>
              </div>
              <div className="text-right">
                <div className="font-mono text-lg text-text-primary">{environment.ambientTemp.toFixed(1)}°C</div>
                <div className="text-[0.65rem] font-bold uppercase text-text-secondary tracking-widest">{environment.ambientTemp > 35 ? <span className="text-danger">High</span> : 'Normal'}</div>
              </div>
            </div>
            
            <div className="flex justify-between items-center border-b border-hairline pb-4">
              <div className="flex items-center gap-3 text-text-secondary">
                <Droplets className="w-5 h-5" />
                <span className="text-sm">Humidity</span>
              </div>
              <div className="text-right">
                <div className="font-mono text-lg text-text-primary">{environment.humidity.toFixed(0)}%</div>
                <div className="text-[0.65rem] font-bold uppercase text-text-secondary tracking-widest">{environment.humidity > 60 ? <span className="text-caution">Elevated</span> : 'Normal'}</div>
              </div>
            </div>

            <div className="flex justify-between items-center border-b border-hairline pb-4">
              <div className="flex items-center gap-3 text-text-secondary">
                <Wind className="w-5 h-5" />
                <span className="text-sm">Air Quality</span>
              </div>
              <div className="text-right">
                <div className="font-sans text-sm text-text-primary max-w-[120px] text-right leading-tight">{environment.airQuality}</div>
              </div>
            </div>

            <div className="flex justify-between items-center border-b border-hairline pb-4">
              <div className="flex items-center gap-3 text-text-secondary">
                <Clock className="w-5 h-5" />
                <span className="text-sm">Exposure</span>
              </div>
              <div className="text-right">
                <div className="font-mono text-lg text-text-primary">{environment.exposureMinutes} min</div>
              </div>
            </div>
            
            <div className="flex justify-between items-center border-b border-hairline pb-4">
              <div className="flex items-center gap-3 text-text-secondary">
                <Activity className="w-5 h-5" />
                <span className="text-sm">Activity Level</span>
              </div>
              <div className="text-right">
                <div className="font-sans text-sm text-text-primary">{vitals.activityLevel}</div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-hairline">
            <div className="text-[0.6875rem] text-text-secondary uppercase font-bold tracking-wider mb-2">Environment Status</div>
            <div className={`font-medium ${environment.ambientTemp > 35 || environment.airQuality !== 'Good' ? 'text-danger' : 'text-safe'}`}>
              {environment.ambientTemp > 35 || environment.airQuality !== 'Good' ? '🔴 High Environmental Stress' : '🟢 Optimal Environment'}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
