import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSimulation } from '../state/SimulationContext';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Shield, Cloud, MapPin, Share2, Database, Download, Trash2, CheckCircle2 } from 'lucide-react';

export default function Privacy() {
  const navigate = useNavigate();
  const { privacySettings, setPrivacySettings, setOnboardingComplete, setUserProfile, userProfile } = useSimulation();
  
  const [exporting, setExporting] = useState(false);
  const [exportDone, setExportDone] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const toggleSetting = (key) => {
    setPrivacySettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleExport = () => {
    setExporting(true);
    setExportDone(false);
    setTimeout(() => {
      setExporting(false);
      setExportDone(true);
      setTimeout(() => setExportDone(false), 3000);
    }, 1500);
  };

  const handleDelete = () => {
    localStorage.clear();
    setOnboardingComplete(false);
    setUserProfile(null);
    navigate('/onboarding');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-sans font-medium text-text-primary mb-2">Privacy & Data Control</h1>
        <p className="text-text-secondary text-sm">You own your health data. Control how it's processed and shared.</p>
      </div>

      <Card className="divide-y divide-hairline bg-surface-raised">
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-safe/10 text-safe flex items-center justify-center shrink-0">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="font-medium text-text-primary">Health Processing</div>
              <div className="text-[0.8125rem] text-text-secondary">AI models run directly on your device</div>
            </div>
          </div>
          <div className="text-[0.6875rem] font-bold tracking-widest text-safe uppercase flex items-center gap-1.5 shrink-0 ml-4">
            <CheckCircle2 className="w-3 h-3" /> Local
          </div>
        </div>

        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-surface text-text-secondary flex items-center justify-center shrink-0">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <div className="font-medium text-text-primary">Cloud Sync</div>
              <div className="text-[0.8125rem] text-text-secondary">Backup encrypted data to cloud</div>
            </div>
          </div>
          <button 
            onClick={() => toggleSetting('cloudSync')}
            className={`w-12 h-6 rounded-full transition-colors relative shrink-0 ml-4 ${privacySettings.cloudSync ? 'bg-pulse' : 'bg-surface border border-hairline'}`}
          >
            <div className={`w-4 h-4 rounded-full bg-ink absolute top-1 transition-transform ${privacySettings.cloudSync ? 'left-7' : 'left-[3px]'}`}></div>
          </button>
        </div>

        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-surface text-text-secondary flex items-center justify-center shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <div className="font-medium text-text-primary">Location Sharing</div>
              <div className="text-[0.8125rem] text-text-secondary">Location is never tracked continuously</div>
            </div>
          </div>
          <div className="text-[0.6875rem] font-bold tracking-widest text-text-secondary uppercase shrink-0 ml-4">
            SOS Only
          </div>
        </div>

        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-surface text-text-secondary flex items-center justify-center shrink-0">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <div className="font-medium text-text-primary">Health Data Sharing</div>
              <div className="text-[0.8125rem] text-text-secondary">Share anonymized trends with research</div>
            </div>
          </div>
          <button 
            onClick={() => toggleSetting('healthDataSharing')}
            className={`w-12 h-6 rounded-full transition-colors relative shrink-0 ml-4 ${privacySettings.healthDataSharing ? 'bg-pulse' : 'bg-surface border border-hairline'}`}
          >
            <div className={`w-4 h-4 rounded-full bg-ink absolute top-1 transition-transform ${privacySettings.healthDataSharing ? 'left-7' : 'left-[3px]'}`}></div>
          </button>
        </div>
      </Card>

      <div className="pt-8 border-t border-hairline space-y-4">
        <Button 
          variant="secondary" 
          className="w-full flex justify-between items-center bg-surface hover:bg-surface-raised"
          onClick={handleExport}
          disabled={exporting}
        >
          <div className="flex items-center gap-3">
            <Download className="w-5 h-5 text-text-secondary" />
            <span>Export My Data</span>
          </div>
          {exporting ? (
            <span className="text-sm text-text-secondary animate-pulse">Preparing...</span>
          ) : exportDone ? (
            <span className="text-sm text-safe flex items-center gap-1"><CheckCircle2 className="w-4 h-4" /> Downloaded</span>
          ) : null}
        </Button>
        
        {showDeleteConfirm ? (
          <Card className="p-6 border-danger/30 bg-danger/5">
            <div className="text-center mb-6">
              <div className="text-danger font-medium mb-1 text-lg">Delete all local data?</div>
              <div className="text-sm text-text-secondary">This will remove your profile and clear all history permanently.</div>
            </div>
            <div className="flex gap-4">
              <Button variant="secondary" className="flex-1 bg-transparent hover:bg-surface" onClick={() => setShowDeleteConfirm(false)}>Cancel</Button>
              <Button variant="danger" className="flex-1" onClick={handleDelete}>Delete</Button>
            </div>
          </Card>
        ) : (
          <Button 
            variant="secondary" 
            className="w-full flex justify-between items-center text-danger hover:text-danger hover:bg-danger/10 border-transparent bg-transparent"
            onClick={() => setShowDeleteConfirm(true)}
          >
            <div className="flex items-center gap-3">
              <Trash2 className="w-5 h-5" />
              <span>Delete My Data</span>
            </div>
          </Button>
        )}
      </div>
    </div>
  );
}
