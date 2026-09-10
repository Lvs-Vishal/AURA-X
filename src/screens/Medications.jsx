import React, { useState } from 'react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { useSimulation } from '../state/SimulationContext';
import { Pill, Plus, X, Check, Clock, Trash2, Edit2, AlertCircle } from 'lucide-react';

export default function Medications() {
  const { userProfile, medications, addMedication, editMedication, deleteMedication, logDose } = useSimulation();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMed, setEditingMed] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    dosage: '',
    times: ['08:00'],
    frequency: 'daily',
    days: [],
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    notes: '',
    reminderEnabled: true
  });

  const resetForm = () => {
    setFormData({
      name: '',
      dosage: '',
      times: ['08:00'],
      frequency: 'daily',
      days: [],
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      notes: '',
      reminderEnabled: true
    });
    setEditingMed(null);
  };

  const handleOpenModal = (med = null) => {
    if (med) {
      setFormData(med);
      setEditingMed(med);
    } else {
      resetForm();
    }
    setIsModalOpen(true);
    // Request permission on first open if needed
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    const medData = {
      ...formData,
      id: editingMed ? editingMed.id : Date.now().toString(),
      log: editingMed ? editingMed.log : []
    };

    if (editingMed) {
      editMedication(medData);
    } else {
      addMedication(medData);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id) => {
    deleteMedication(id);
    setIsModalOpen(false);
  };

  const addTime = () => setFormData({ ...formData, times: [...formData.times, '12:00'] });
  const updateTime = (idx, val) => {
    const newTimes = [...formData.times];
    newTimes[idx] = val;
    setFormData({ ...formData, times: newTimes });
  };
  const removeTime = (idx) => setFormData({ ...formData, times: formData.times.filter((_, i) => i !== idx) });

  const toggleDay = (day) => {
    const newDays = formData.days.includes(day)
      ? formData.days.filter(d => d !== day)
      : [...formData.days, day];
    setFormData({ ...formData, days: newDays });
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const dayName = new Date().toLocaleDateString('en-US', { weekday: 'short' });

  // Filter meds due today
  const todaysMeds = medications.filter(med => {
    if (med.endDate && new Date(med.endDate) < new Date()) return false;
    if (med.frequency === 'specific_days' && !med.days?.includes(dayName)) return false;
    return true;
  });

  return (
    <div className="flex flex-col gap-6 relative min-h-full pb-20">
      <div>
        <h1 className="text-2xl font-sans font-medium text-text-primary mb-1">Medications</h1>
        <p className="text-text-secondary text-sm">For {userProfile?.name || 'Patient'}</p>
      </div>

      {todaysMeds.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-16 px-6 text-center border-dashed border-text-secondary/30 bg-transparent">
          <Pill className="w-12 h-12 text-text-secondary mb-4 opacity-50" />
          <h3 className="text-lg font-medium text-text-primary mb-2">No medications added yet</h3>
          <p className="text-sm text-text-secondary mb-6">Keep track of your tablets and get timely reminders.</p>
          <Button onClick={() => handleOpenModal()} className="px-6 rounded-full">
            <Plus className="w-4 h-4 mr-2 inline" /> Add Medication
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {todaysMeds.map(med => {
            const sortedTimes = [...med.times].sort();
            
            return (
              <Card key={med.id} className="p-5 bg-surface-raised border-hairline relative overflow-hidden group">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-pulse/10 flex items-center justify-center text-pulse">
                      <Pill className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-medium text-text-primary leading-tight">{med.name}</h3>
                      <p className="text-sm font-mono text-text-secondary mt-1">{med.dosage}</p>
                    </div>
                  </div>
                  <button onClick={() => handleOpenModal(med)} className="p-2 text-text-secondary hover:text-text-primary">
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>

                {med.notes && <p className="text-xs text-text-secondary mb-4 italic">"{med.notes}"</p>}

                <div className="space-y-3">
                  {sortedTimes.map(time => {
                    const log = med.log.find(l => l.date === todayStr && l.time === time);
                    const status = log?.status || 'upcoming';
                    
                    const isTaken = status === 'taken';
                    const isMissed = status === 'missed';
                    const isPending = status === 'pending';

                    return (
                      <div key={time} className="flex items-center justify-between p-3 rounded-xl bg-surface border border-hairline">
                        <div className="flex items-center gap-3">
                          <div className={`text-sm font-mono font-bold ${isTaken ? 'text-safe' : isMissed ? 'text-danger' : 'text-text-primary'}`}>
                            {time}
                          </div>
                          {isTaken && <span className="text-[0.6875rem] font-bold text-safe uppercase tracking-wider flex items-center gap-1"><Check className="w-3 h-3"/> Taken</span>}
                          {isMissed && <span className="text-[0.6875rem] font-bold text-danger uppercase tracking-wider flex items-center gap-1"><AlertCircle className="w-3 h-3"/> Missed</span>}
                          {!isTaken && !isMissed && <span className="text-[0.6875rem] font-bold text-text-secondary uppercase tracking-wider flex items-center gap-1"><Clock className="w-3 h-3"/> {isPending ? 'Due Now' : 'Upcoming'}</span>}
                        </div>

                        {!isTaken && (
                          <Button 
                            variant="secondary" 
                            onClick={() => logDose(med.id, time, 'taken')}
                            className={`py-1.5 px-3 text-[0.75rem] h-auto rounded-full ${isMissed || isPending ? 'bg-pulse text-ink font-bold' : ''}`}
                          >
                            Mark Taken
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {todaysMeds.length > 0 && (
        <button 
          onClick={() => handleOpenModal()}
          className="fixed bottom-24 right-6 w-14 h-14 bg-pulse text-ink rounded-full flex items-center justify-center shadow-lg shadow-pulse/20 hover:scale-105 transition-transform z-20"
        >
          <Plus className="w-6 h-6" />
        </button>
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4 bg-ink/80 backdrop-blur-sm">
          <Card className="w-full md:max-w-md bg-surface border-t md:border border-hairline rounded-t-3xl md:rounded-3xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="flex justify-between items-center p-6 border-b border-hairline shrink-0">
              <h2 className="text-xl font-medium">{editingMed ? 'Edit Medication' : 'Add Medication'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 -mr-2 text-text-secondary"><X className="w-5 h-5"/></button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              <form id="medForm" onSubmit={handleSave} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[0.875rem] text-text-secondary">Medication Name</label>
                  <input type="text" required className="w-full bg-surface-raised border border-hairline rounded-xl px-4 py-3 text-text-primary focus:border-pulse focus:ring-1 focus:ring-pulse outline-none" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Metformin" />
                </div>
                
                <div className="space-y-2">
                  <label className="text-[0.875rem] text-text-secondary">Dosage</label>
                  <input type="text" required className="w-full bg-surface-raised border border-hairline rounded-xl px-4 py-3 text-text-primary font-mono text-sm focus:border-pulse focus:ring-1 focus:ring-pulse outline-none" value={formData.dosage} onChange={e => setFormData({...formData, dosage: e.target.value})} placeholder="e.g. 500mg, 2 puffs" />
                </div>

                <div className="space-y-3">
                  <label className="text-[0.875rem] text-text-secondary flex justify-between">
                    Scheduled Times
                    <button type="button" onClick={addTime} className="text-pulse font-medium text-xs">+ Add Time</button>
                  </label>
                  {formData.times.map((t, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input type="time" required className="flex-1 bg-surface-raised border border-hairline rounded-xl px-4 py-3 text-text-primary font-mono outline-none focus:border-pulse" value={t} onChange={e => updateTime(i, e.target.value)} />
                      {formData.times.length > 1 && (
                        <button type="button" onClick={() => removeTime(i)} className="p-3 text-text-secondary hover:text-danger bg-surface-raised rounded-xl border border-hairline"><Trash2 className="w-4 h-4"/></button>
                      )}
                    </div>
                  ))}
                </div>

                <div className="space-y-3">
                  <label className="text-[0.875rem] text-text-secondary">Frequency</label>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => setFormData({...formData, frequency: 'daily'})} className={`flex-1 py-2 rounded-lg text-sm font-medium border ${formData.frequency === 'daily' ? 'bg-pulse/10 border-pulse text-pulse' : 'border-hairline text-text-secondary'}`}>Daily</button>
                    <button type="button" onClick={() => setFormData({...formData, frequency: 'specific_days'})} className={`flex-1 py-2 rounded-lg text-sm font-medium border ${formData.frequency === 'specific_days' ? 'bg-pulse/10 border-pulse text-pulse' : 'border-hairline text-text-secondary'}`}>Specific Days</button>
                  </div>
                  
                  {formData.frequency === 'specific_days' && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(day => (
                        <button type="button" key={day} onClick={() => toggleDay(day)} className={`w-10 h-10 rounded-full text-xs font-bold border ${formData.days.includes(day) ? 'bg-pulse text-ink border-pulse' : 'bg-surface-raised border-hairline text-text-secondary'}`}>{day.charAt(0)}</button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-[0.875rem] text-text-secondary">Start Date</label>
                  <input type="date" required className="w-full bg-surface-raised border border-hairline rounded-xl px-4 py-3 text-text-primary outline-none focus:border-pulse" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} />
                </div>

                <div className="space-y-2">
                  <label className="text-[0.875rem] text-text-secondary flex justify-between">
                    End Date <span className="text-xs text-text-secondary/50">(Optional)</span>
                  </label>
                  <input type="date" className="w-full bg-surface-raised border border-hairline rounded-xl px-4 py-3 text-text-primary outline-none focus:border-pulse" value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} />
                </div>

                <div className="space-y-2">
                  <label className="text-[0.875rem] text-text-secondary flex justify-between">
                    Notes <span className="text-xs text-text-secondary/50">(Optional)</span>
                  </label>
                  <input type="text" className="w-full bg-surface-raised border border-hairline rounded-xl px-4 py-3 text-text-primary outline-none focus:border-pulse" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} placeholder="e.g. Take with food" />
                </div>

                <div className="flex items-center justify-between p-4 bg-surface-raised border border-hairline rounded-xl">
                  <div>
                    <div className="font-medium">Reminders</div>
                    <div className="text-xs text-text-secondary">Send a notification when due</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={formData.reminderEnabled} onChange={e => setFormData({...formData, reminderEnabled: e.target.checked})} />
                    <div className="w-11 h-6 bg-surface-raised border border-hairline rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-text-primary after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pulse peer-checked:border-pulse peer-checked:after:bg-ink"></div>
                  </label>
                </div>
              </form>
            </div>
            
            <div className="p-4 border-t border-hairline flex items-center justify-between shrink-0 bg-surface">
              {editingMed ? (
                <button type="button" onClick={() => handleDelete(editingMed.id)} className="p-3 text-danger hover:bg-danger/10 rounded-xl transition-colors"><Trash2 className="w-5 h-5"/></button>
              ) : <div></div>}
              <div className="flex gap-3">
                <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button type="submit" form="medForm">Save</Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
