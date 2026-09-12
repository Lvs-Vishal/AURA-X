import React from 'react';
import { useFirebaseData } from '../state/useFirebaseData';
import { Card } from '../components/common/Card';
import { ResponsiveContainer, AreaChart, Area, LineChart, Line, YAxis } from 'recharts';

function LiveChartCard({ title, value, unit, data, dataKey, color, domain = ['auto', 'auto'], type = 'line' }) {
  return (
    <Card className="p-5 flex flex-col h-64 bg-surface-raised border-hairline">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-sm font-bold tracking-wider text-text-secondary uppercase">{title}</h3>
        <div className="text-right">
          <span className="text-2xl font-mono text-text-primary">{value}</span>
          <span className="text-sm text-text-secondary ml-1">{unit}</span>
        </div>
      </div>
      <div className="flex-1 w-full min-h-0 relative -ml-4">
        <ResponsiveContainer width="100%" height="100%">
          {type === 'area' ? (
            <AreaChart data={data} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id={`color-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={color} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <YAxis domain={domain} hide />
              <Area type="monotone" dataKey={dataKey} stroke={color} fillOpacity={1} fill={`url(#color-${dataKey})`} isAnimationActive={false} />
            </AreaChart>
          ) : (
            <LineChart data={data} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
              <YAxis domain={domain} hide />
              <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} dot={false} isAnimationActive={false} />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

export default function LiveMonitoring() {
  const { vitals, vitalsHistory, environment, environmentHistory } = useFirebaseData();

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-sans font-medium text-text-primary">Live Monitoring</h1>
        <div className="flex items-center gap-2 px-3 py-1 bg-surface-raised rounded-full border border-hairline">
          <div className="w-2 h-2 rounded-full bg-danger animate-pulse"></div>
          <span className="text-[0.6875rem] text-text-secondary font-bold tracking-widest uppercase">Live Data</span>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <LiveChartCard 
          title="Heart Rate" 
          value={vitals.heartRate.toFixed(0)} 
          unit="BPM" 
          data={vitalsHistory} 
          dataKey="heartRate" 
          color="#FF6B57" 
          domain={[40, 200]} 
        />
        <LiveChartCard 
          title="SpO₂" 
          value={vitals.spo2.toFixed(0)} 
          unit="%" 
          data={vitalsHistory} 
          dataKey="spo2" 
          color="#4FD8C4" 
          domain={[80, 100]} 
          type="area"
        />
        <LiveChartCard 
          title="Body Temp" 
          value={vitals.bodyTemp.toFixed(1)} 
          unit="°C" 
          data={vitalsHistory} 
          dataKey="bodyTemp" 
          color="#F2B84B" 
          domain={[35, 42]} 
        />
        <LiveChartCard 
          title="⚡ GSR" 
          value={vitals.gsr?.toFixed(1) || '0.0'} 
          unit="µS" 
          data={vitalsHistory} 
          dataKey="gsr" 
          color="#B48EAD" 
          domain={['auto', 'auto']} 
        />
        <LiveChartCard 
          title="🌫️ PM2.5" 
          value={environment.pm25?.toFixed(0) || '0'} 
          unit="µg/m³" 
          data={environmentHistory} 
          dataKey="pm25" 
          color="#A3BE8C" 
          domain={[0, 200]} 
          type="area"
        />
      </div>

      <h2 className="text-lg font-medium text-text-primary mt-8 mb-4 border-b border-hairline pb-4 pl-2">Environment & Activity</h2>
      
      <div className="grid grid-cols-2 gap-4">
        <Card className="p-5 bg-surface border-hairline">
          <div className="text-[0.6875rem] font-bold text-text-secondary tracking-widest uppercase mb-2">Ambient Temp</div>
          <div className="text-2xl font-mono text-text-primary">{environment.ambientTemp.toFixed(1)}°C</div>
        </Card>
        <Card className="p-5 bg-surface border-hairline">
          <div className="text-[0.6875rem] font-bold text-text-secondary tracking-widest uppercase mb-2">Humidity</div>
          <div className="text-2xl font-mono text-text-primary">{environment.humidity.toFixed(0)}%</div>
        </Card>
        <Card className="p-5 bg-surface border-hairline">
          <div className="text-[0.6875rem] font-bold text-text-secondary tracking-widest uppercase mb-2">Air Quality</div>
          <div className="text-sm font-sans text-text-primary truncate">{environment.airQuality}</div>
          <div className="text-xs text-text-secondary mt-1">{environment.pm25?.toFixed(1) || '0'} µg/m³</div>
        </Card>
        <Card className="p-5 bg-surface border-hairline">
          <div className="text-[0.6875rem] font-bold text-text-secondary tracking-widest uppercase mb-2">Activity Level</div>
          <div className="text-lg font-sans text-text-primary truncate">{vitals.activityLevel}</div>
        </Card>
      </div>
    </div>
  );
}
