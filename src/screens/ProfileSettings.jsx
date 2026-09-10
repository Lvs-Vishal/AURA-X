import React, { useState, useEffect } from 'react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { useSimulation } from '../state/SimulationContext';
import { User, Briefcase, Activity, Target, Shield, Heart, CheckCircle2 } from 'lucide-react';
import { clsx } from 'clsx';

const userTypes = [
  { id: 'general', label: 'General Individual', icon: User },
  { id: 'outdoor_worker', label: 'Outdoor Worker', icon: Briefcase },
  { id: 'elderly', label: 'Elderly', icon: Heart },
  { id: 'farmer', label: 'Farmer', icon: Target },
  { id: 'industrial_worker', label: 'Industrial Worker', icon: Activity },
  { id: 'disaster_responder', label: 'Disaster Responder', icon: Shield },
];

export default function ProfileSettings() {
  const { userProfile, setUserProfile } = useSimulation();
  
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    userType: '',
    emergencyName: '',
    emergencyPhone: ''
  });

  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (userProfile) {
      setFormData({
        name: userProfile.name || '',
        age: userProfile.age || '',
        userType: userProfile.userType || '',
        emergencyName: userProfile.emergencyContact?.name || '',
        emergencyPhone: userProfile.emergencyContact?.phone || ''
      });
    }
  }, [userProfile]);

  const isValid = formData.name && formData.age && formData.userType && formData.emergencyName && formData.emergencyPhone;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isValid) {
      setUserProfile({
        name: formData.name,
        age: Number(formData.age),
        userType: formData.userType,
        emergencyContact: {
          name: formData.emergencyName,
          phone: formData.emergencyPhone
        }
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-12">
      <div>
        <h1 className="text-2xl font-sans font-medium text-text-primary mb-2">Profile Settings</h1>
        <p className="text-text-secondary text-sm">Update your personal details and emergency contact.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="p-6 space-y-6 bg-surface-raised border-hairline">
          <div className="flex flex-col gap-6">
            <div className="space-y-2">
              <label className="text-[0.9375rem] text-text-secondary">Name</label>
              <input 
                type="text"
                required
                className="w-full bg-surface border border-hairline rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-pulse focus:ring-1 focus:ring-pulse transition-colors"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[0.9375rem] text-text-secondary">Age</label>
              <input 
                type="number"
                required
                min="1"
                max="120"
                className="w-full bg-surface border border-hairline rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-pulse focus:ring-1 focus:ring-pulse transition-colors"
                value={formData.age}
                onChange={e => setFormData({...formData, age: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[0.9375rem] text-text-secondary">User Type</label>
            <div className="grid grid-cols-2 gap-3">
              {userTypes.map(type => (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => setFormData({...formData, userType: type.id})}
                  className={clsx(
                    "flex flex-col items-center justify-center p-3 rounded-xl border transition-all text-center gap-2",
                    formData.userType === type.id 
                      ? "bg-pulse/10 border-pulse text-pulse"
                      : "bg-surface border-hairline text-text-secondary hover:text-text-primary hover:border-text-secondary"
                  )}
                >
                  <type.icon className="w-5 h-5 mb-1" />
                  <span className="text-[0.75rem] font-medium leading-tight">{type.label}</span>
                </button>
              ))}
            </div>
          </div>
          
          <div className="pt-4 border-t border-hairline space-y-4">
            <h3 className="font-medium text-text-primary">Emergency Contact</h3>
            <div className="flex flex-col gap-6">
              <div className="space-y-2">
                <label className="text-[0.9375rem] text-text-secondary">Contact Name</label>
                <input 
                  type="text"
                  required
                  className="w-full bg-surface border border-hairline rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-pulse focus:ring-1 focus:ring-pulse transition-colors"
                  value={formData.emergencyName}
                  onChange={e => setFormData({...formData, emergencyName: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[0.9375rem] text-text-secondary">Phone Number</label>
                <input 
                  type="tel"
                  required
                  className="w-full bg-surface border border-hairline rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-pulse focus:ring-1 focus:ring-pulse transition-colors"
                  value={formData.emergencyPhone}
                  onChange={e => setFormData({...formData, emergencyPhone: e.target.value})}
                />
              </div>
            </div>
          </div>
        </Card>
        
        <div className="flex justify-end">
          <Button type="submit" disabled={!isValid} className="w-full relative">
            {saved ? (
              <span className="flex items-center justify-center gap-2">
                <CheckCircle2 className="w-5 h-5" /> Saved
              </span>
            ) : 'Save Changes'}
          </Button>
        </div>
      </form>
    </div>
  );
}
