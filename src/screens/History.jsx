import React, { useState } from 'react';
import { Card } from '../components/common/Card';
import { SegmentedControl } from '../components/common/SegmentedControl';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, LineChart, Line } from 'recharts';
import { TrendingUp, TrendingDown, Minus, Flame, Moon, AlertOctagon, Pill } from 'lucide-react';
import { useFirebaseData } from '../state/useFirebaseData';

const timeRanges = [
  { id: 'today', label: 'Today' },
  { id: '7days', label: 'Last 7 Days' },
  { id: '30days', label: 'Last 30 Days' },
];

const trendDataToday = [
  { metric: 'HR', trend: 'rising', icon: TrendingUp, color: 'text-danger' },
  { metric: 'SpO₂', trend: 'stable', icon: Minus, color: 'text-safe' },
  { metric: 'Heat', trend: 'rising', icon: TrendingUp, color: 'text-caution' },
  { metric: 'Fatigue', trend: 'rising', icon: TrendingUp, color: 'text-caution' },
  { metric: 'Sleep', trend: 'stable', icon: Minus, color: 'text-safe' },
];

const mockWeeklyEvents = [
  { day: 'Mon', heat: 0, fatigue: 1, falls: 0 },
  { day: 'Tue', heat: 2, fatigue: 0, falls: 0 },
  { day: 'Wed', heat: 0, fatigue: 0, falls: 0 },
  { day: 'Thu', heat: 1, fatigue: 1, falls: 0 },
  { day: 'Fri', heat: 0, fatigue: 0, falls: 0 },
  { day: 'Sat', heat: 0, fatigue: 0, falls: 0 },
  { day: 'Sun', heat: 0, fatigue: 0, falls: 0 },
];

const mockWeeklyVitals = [
  { day: 'Mon', hr: 72 },
  { day: 'Tue', hr: 78 },
  { day: 'Wed', hr: 70 },
  { day: 'Thu', hr: 75 },
  { day: 'Fri', hr: 71 },
  { day: 'Sat', hr: 68 },
  { day: 'Sun', hr: 69 },
];

export default function History() {
  const [range, setRange] = useState('7days');
  const { medications, vitalsHistory } = useFirebaseData();

  const adherence = React.useMemo(() => {
    if (!medications || medications.length === 0) return null;
    let total = 0;
    let taken = 0;
    
    const now = new Date();
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(now.getDate() - 7);
    
    medications.forEach(med => {
      med.log.forEach(l => {
        const logDate = new Date(l.date);
        if (logDate >= sevenDaysAgo && logDate <= now) {
          total++;
          if (l.status === 'taken') taken++;
        }
      });
    });
    
    if (total === 0) return { percent: 0, text: 'No doses logged' };
    return {
      percent: Math.round((taken / total) * 100),
      text: `${taken}/${total} doses taken`
    };
  }, [medications]);

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex flex-col flex-col sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-sans font-medium text-text-primary mb-2">History & Trends</h1>
          <p className="text-text-secondary text-sm">Long-term patterns and anomaly detection.</p>
        </div>
        <div className="w-full sm:w-auto">
          <SegmentedControl 
            options={timeRanges}
            value={range}
            onChange={setRange}
          />
        </div>
      </div>

      {range === 'today' && (
        <Card className="p-6 p-6 bg-surface-raised border-hairline">
          <h2 className="text-lg font-medium text-text-primary mb-6">Today's Trends</h2>
          <div className="grid grid-cols-2 gap-4">
            {trendDataToday.map(t => (
              <div key={t.metric} className="p-4 bg-surface rounded-xl border border-hairline flex flex-col items-center justify-center gap-3">
                <span className="text-[0.8125rem] font-bold text-text-secondary tracking-widest uppercase">{t.metric}</span>
                <t.icon className={`w-8 h-8 ${t.color}`} />
              </div>
            ))}
          </div>
        </Card>
      )}

      {range !== 'today' && (
        <div className="space-y-8">
          <div className="flex flex-col gap-4">
            {adherence && (
              <Card className="p-6 bg-surface-raised border-hairline flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-pulse/10 text-pulse flex items-center justify-center shrink-0">
                  <Pill className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-3xl font-mono text-text-primary">{adherence.percent}%</div>
                  <div className="text-[0.6875rem] font-bold tracking-widest text-text-secondary uppercase">{adherence.text} this week</div>
                </div>
              </Card>
            )}
            <Card className="p-6 bg-surface-raised border-hairline flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-danger/10 text-danger flex items-center justify-center shrink-0">
                <Flame className="w-6 h-6" />
              </div>
              <div>
                <div className="text-3xl font-mono text-text-primary">3</div>
                <div className="text-[0.6875rem] font-bold tracking-widest text-text-secondary uppercase">Heat Risk Events</div>
              </div>
            </Card>
            <Card className="p-6 bg-surface-raised border-hairline flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-caution/10 text-caution flex items-center justify-center shrink-0">
                <Moon className="w-6 h-6" />
              </div>
              <div>
                <div className="text-3xl font-mono text-text-primary">2</div>
                <div className="text-[0.6875rem] font-bold tracking-widest text-text-secondary uppercase">Fatigue Events</div>
              </div>
            </Card>
            <Card className="p-6 bg-surface-raised border-hairline flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-safe/10 text-safe flex items-center justify-center shrink-0">
                <AlertOctagon className="w-6 h-6" />
              </div>
              <div>
                <div className="text-3xl font-mono text-text-primary">0</div>
                <div className="text-[0.6875rem] font-bold tracking-widest text-text-secondary uppercase">Falls</div>
              </div>
            </Card>
          </div>

          <div className="flex flex-col gap-8">
            <Card className="p-6 bg-surface-raised border-hairline">
              <h3 className="text-[0.8125rem] font-bold tracking-widest text-text-secondary uppercase mb-6">Risk Events by Day</h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={mockWeeklyEvents} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#8FA39C', fontSize: 12 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#8FA39C', fontSize: 12 }} />
                    <Tooltip cursor={{ fill: '#16231F' }} contentStyle={{ backgroundColor: '#101B19', border: '1px solid #24332F', borderRadius: '8px' }} />
                    <Bar dataKey="heat" stackId="a" fill="#FF6B57" name="Heat Events" radius={[0, 0, 4, 4]} barSize={16} />
                    <Bar dataKey="fatigue" stackId="a" fill="#F2B84B" name="Fatigue Events" radius={[4, 4, 0, 0]} barSize={16} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card className="p-6 bg-surface-raised border-hairline">
              <h3 className="text-[0.8125rem] font-bold tracking-widest text-text-secondary uppercase mb-6">Average Resting HR</h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={mockWeeklyVitals} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#8FA39C', fontSize: 12 }} />
                    <YAxis domain={['auto', 'auto']} axisLine={false} tickLine={false} tick={{ fill: '#8FA39C', fontSize: 12 }} />
                    <Tooltip cursor={false} contentStyle={{ backgroundColor: '#101B19', border: '1px solid #24332F', borderRadius: '8px' }} />
                    <Line type="monotone" dataKey="hr" stroke="#4FD8C4" strokeWidth={3} dot={{ fill: '#0A1412', stroke: '#4FD8C4', strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} name="Heart Rate (BPM)" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
