import React, { useState } from 'react';
import { Card } from '../components/common/Card';
import { Clock } from 'lucide-react';
import { useFirebaseData } from '../state/useFirebaseData';

const mockTimeline = [
  { time: '08:00', status: 'Normal', severity: 'safe', duration: null, factors: [], action: '' },
  { time: '10:30', status: 'Activity ↑', severity: 'caution', duration: 45, factors: ['Activity ↑', 'HR ↑'], action: '' },
  { time: '12:15', status: 'Heat Risk ↑', severity: 'caution', duration: 45, factors: ['Temperature ↑', 'Humidity ↑'], action: '' },
  { time: '13:00', status: 'High Heat Stress', severity: 'danger', duration: 18, factors: ['HR ↑', 'Temperature ↑', 'Humidity ↑', 'Activity ↑'], action: 'Rest + Hydration', recoveredAt: '13:20' },
  { time: '13:20', status: 'Recovery', severity: 'safe', duration: null, factors: [], action: '' },
  { time: '15:30', status: 'Fatigue ↑', severity: 'caution', duration: 60, factors: ['Prolonged Activity', 'Prior Heat Stress'], action: '' },
];

export default function Timeline() {
  const { timelineEvents } = useFirebaseData();
  const events = timelineEvents && timelineEvents.length > 0 ? timelineEvents : mockTimeline;
  const [selectedEvent, setSelectedEvent] = useState(events[events.length - 1] || events[0]);

  const getColor = (sev) => {
    if (sev === 'safe') return 'bg-safe';
    if (sev === 'caution') return 'bg-caution';
    if (sev === 'danger') return 'bg-danger';
    return 'bg-safe';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-sans font-medium text-text-primary mb-2">Health Stress Timeline</h1>
        <p className="text-text-secondary text-sm">Understand cause, effect, and recovery over the course of your day.</p>
      </div>

      <div className="flex flex-col gap-8 relative">
        
        {/* Timeline Rail */}
        <div className=" relative pl-4 ">
          <div className="absolute left-[27px]  top-4 bottom-4 w-[2px] bg-hairline"></div>
          
          <div className="space-y-8">
            {events.map((ev, idx) => (
              <div 
                key={idx}
                onClick={() => setSelectedEvent(ev)}
                className={`flex items-start gap-4 md:gap-6 cursor-pointer group ${selectedEvent === ev ? 'opacity-100' : 'opacity-60 hover:opacity-100'} transition-opacity`}
              >
                <div className="font-mono text-[0.9375rem] text-text-secondary w-12 pt-0.5">{ev.time || new Date(ev.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                <div className={`w-4 h-4 rounded-full mt-1.5 z-10 relative ring-4 ring-ink transition-transform ${selectedEvent === ev ? 'scale-125' : ''} ${getColor(ev.severity)} shrink-0`}>
                  {selectedEvent === ev && <div className="absolute inset-[-8px] border border-current rounded-full opacity-30 animate-pulse"></div>}
                </div>
                <div className={`font-medium ${ev.severity === 'safe' ? 'text-text-primary' : ev.severity === 'danger' ? 'text-danger' : 'text-caution'}`}>
                  {ev.status}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Detail Panel */}
        <div className="">
          <Card className="p-6 p-6 bg-surface-raised border-hairline sticky top-8">
            <div className="flex justify-between items-start mb-8 border-b border-hairline pb-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className={`w-3 h-3 rounded-full ${getColor(selectedEvent.severity)}`}></div>
                  <h2 className="text-xl font-medium text-text-primary">{selectedEvent.status}</h2>
                </div>
                <div className="text-sm font-mono text-text-secondary flex items-center gap-2">
                  <Clock className="w-4 h-4" /> {selectedEvent?.time || (selectedEvent?.timestamp ? new Date(selectedEvent.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '')}
                </div>
              </div>
              {selectedEvent?.duration && (
                <div className="text-right">
                  <div className="text-[0.6875rem] font-bold tracking-widest uppercase text-text-secondary mb-1">Duration</div>
                  <div className="font-mono text-lg">{selectedEvent.duration} min</div>
                </div>
              )}
            </div>

            {selectedEvent?.factors && selectedEvent.factors.length > 0 ? (
              <div className="space-y-6">
                <div>
                  <h3 className="text-[0.6875rem] font-bold tracking-widest text-text-secondary uppercase mb-4">Main Factors</h3>
                  <ul className="space-y-3">
                    {selectedEvent.factors.map(f => (
                      <li key={f} className="flex items-center gap-3 text-[0.9375rem]">
                        <div className="w-1.5 h-1.5 rounded-full bg-text-secondary"></div>
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
                
                {selectedEvent?.action && (
                  <div>
                    <h3 className="text-[0.6875rem] font-bold tracking-widest text-text-secondary uppercase mb-4">Action Taken</h3>
                    <div className="bg-surface p-4 rounded-xl border border-hairline inline-block text-[0.9375rem]">
                      {selectedEvent.action}
                    </div>
                  </div>
                )}

                {selectedEvent?.recoveredAt && (
                  <div>
                    <h3 className="text-[0.6875rem] font-bold tracking-widest text-text-secondary uppercase mb-2">Recovery</h3>
                    <div className="text-safe font-mono flex items-center gap-2">
                      <Clock className="w-4 h-4" /> {selectedEvent.recoveredAt}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-text-secondary italic py-8 text-center text-sm">
                Baseline state. No notable factors or actions required.
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
