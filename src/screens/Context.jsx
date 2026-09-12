import React from 'react';
import { useSimulation } from '../state/SimulationContext';
import { Card } from '../components/common/Card';
import { SegmentedControl } from '../components/common/SegmentedControl';
import { ShieldAlert, Info, Radio, Database, Activity } from 'lucide-react';

const modes = [
  { id: 'normal', label: 'Normal' },
  { id: 'heatwave', label: 'Heatwave' },
  { id: 'pollution', label: 'Pollution' },
  { id: 'flood', label: 'Flood' },
  { id: 'cyclone', label: 'Cyclone' }
];

export default function Context() {
  const { disasterMode, setDisasterMode } = useSimulation();

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="mb-8">
        <h1 className="text-2xl font-sans font-medium text-text-primary mb-2">Context Engine</h1>
        <p className="text-text-secondary text-sm">Tell the AI what situation you are in to re-prioritize risk monitoring.</p>
      </div>

      <SegmentedControl 
        options={modes}
        value={disasterMode}
        onChange={setDisasterMode}
      />

      <div className="mt-8 transition-all duration-300">
        {disasterMode === 'normal' && (
          <Card className="p-8 text-center bg-surface border-hairline">
            <div className="w-16 h-16 mx-auto rounded-full bg-safe/20 text-safe flex items-center justify-center mb-4">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-medium text-text-primary mb-2">Normal Mode Active</h2>
            <p className="text-text-secondary max-w-md mx-auto">All systems nominal. Standard health and environment baselines are being applied.</p>
          </Card>
        )}

        {disasterMode === 'heatwave' && (
          <Card className="p-8 bg-surface border-danger/30">
            <h2 className="text-xl font-medium text-text-primary mb-6 flex items-center gap-2">
              <Info className="w-5 h-5 text-danger" />
              Heatwave Priority Set
            </h2>
            <div className="flex flex-col gap-6">
              <div>
                <h3 className="text-[0.6875rem] font-bold text-text-secondary tracking-widest uppercase mb-4">Elevated Risks</h3>
                <ul className="space-y-3">
                  <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-danger"></div> <span className="text-[0.9375rem]">Heat Stress</span></li>
                  <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-danger"></div> <span className="text-[0.9375rem]">Dehydration</span></li>
                  <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-caution"></div> <span className="text-[0.9375rem]">Cardiovascular Stress</span></li>
                  <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-caution"></div> <span className="text-[0.9375rem]">Fatigue</span></li>
                </ul>
              </div>
              <div>
                <h3 className="text-[0.6875rem] font-bold text-text-secondary tracking-widest uppercase mb-4">AI Inputs Heavily Weighted</h3>
                <div className="flex flex-wrap gap-2 text-[0.8125rem] text-text-primary">
                  <span className="px-3 py-1.5 bg-surface-raised rounded-xl border border-hairline">Temperature</span>
                  <span className="px-3 py-1.5 bg-surface-raised rounded-xl border border-hairline">Humidity</span>
                  <span className="px-3 py-1.5 bg-surface-raised rounded-xl border border-hairline">HR</span>
                  <span className="px-3 py-1.5 bg-surface-raised rounded-xl border border-hairline">Body Temp</span>
                  <span className="px-3 py-1.5 bg-surface-raised rounded-xl border border-hairline">Activity</span>
                  <span className="px-3 py-1.5 bg-surface-raised rounded-xl border border-hairline">Exposure</span>
                </div>
              </div>
            </div>
          </Card>
        )}

        {disasterMode === 'pollution' && (
          <Card className="p-8 bg-surface border-caution/30">
            <h2 className="text-xl font-medium text-text-primary mb-6 flex items-center gap-2">
              <Info className="w-5 h-5 text-caution" />
              Pollution Priority Set
            </h2>
            <div className="flex flex-col gap-6">
              <div>
                <h3 className="text-[0.6875rem] font-bold text-text-secondary tracking-widest uppercase mb-4">Elevated Risks</h3>
                <ul className="space-y-3">
                  <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-caution"></div> <span className="text-[0.9375rem]">Respiratory Risk</span></li>
                </ul>
              </div>
              <div>
                <h3 className="text-[0.6875rem] font-bold text-text-secondary tracking-widest uppercase mb-4">AI Inputs Heavily Weighted</h3>
                <div className="flex flex-wrap gap-2 text-[0.8125rem] text-text-primary">
                  <span className="px-3 py-1.5 bg-surface-raised rounded-xl border border-hairline">Air Quality</span>
                  <span className="px-3 py-1.5 bg-surface-raised rounded-xl border border-hairline">Particulate Exposure</span>
                  <span className="px-3 py-1.5 bg-surface-raised rounded-xl border border-hairline">SpO₂</span>
                  <span className="px-3 py-1.5 bg-surface-raised rounded-xl border border-hairline">HR</span>
                  <span className="px-3 py-1.5 bg-surface-raised rounded-xl border border-hairline">Activity</span>
                </div>
              </div>
            </div>
          </Card>
        )}

        {(disasterMode === 'flood' || disasterMode === 'cyclone') && (
          <div className="space-y-6">
            <div className="bg-caution/20 border border-caution text-caution p-4 rounded-xl flex items-center gap-3">
              <Radio className="w-5 h-5 shrink-0" />
              <span className="font-medium text-[0.9375rem]">⚠️ Limited connectivity expected. Transitioning to local resilience mode.</span>
            </div>
            
            <Card className="p-8 bg-surface border-pulse/30">
              <h2 className="text-xl font-medium text-text-primary mb-6 flex items-center gap-2 capitalize">
                <Info className="w-5 h-5 text-pulse" />
                {disasterMode} Resilience Active
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-surface-raised rounded-xl border border-hairline">
                  <div className="flex items-center gap-3">
                    <Activity className="w-5 h-5 text-text-secondary" />
                    <span className="text-[0.9375rem]">Health Monitoring</span>
                  </div>
                  <span className="text-safe font-bold uppercase tracking-widest text-[0.6875rem] flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-safe"></div> Active
                  </span>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-surface-raised rounded-xl border border-hairline">
                  <div className="flex items-center gap-3">
                    <ShieldAlert className="w-5 h-5 text-text-secondary" />
                    <span className="text-[0.9375rem]">Emergency Assistance</span>
                  </div>
                  <span className="text-safe font-bold uppercase tracking-widest text-[0.6875rem] flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-safe"></div> Active
                  </span>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-surface-raised rounded-xl border border-hairline">
                  <div className="flex items-center gap-3">
                    <Database className="w-5 h-5 text-text-secondary" />
                    <span className="text-[0.9375rem]">Data Storage</span>
                  </div>
                  <span className="text-pulse font-bold uppercase tracking-widest text-[0.6875rem] flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-pulse"></div> Local
                  </span>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
