import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSimulation } from '../state/SimulationContext';
import { getRiskCopy } from '../data/riskCopy';
import { Card } from '../components/common/Card';
import { ArrowLeft, CheckCircle2, Info } from 'lucide-react';

export default function RiskExplainability() {
  const { riskId } = useParams();
  const navigate = useNavigate();
  const { risks, vitals, environment, baseline } = useSimulation();

  const risk = risks.find(r => r.riskId === riskId);
  const copy = useMemo(() => getRiskCopy(riskId, vitals, environment, baseline), [riskId, vitals, environment, baseline]);

  if (!risk) return null;

  const getColor = (severity) => {
    switch(severity) {
      case 'SAFE':
      case 'LOW': return 'text-safe';
      case 'MEDIUM':
      case 'MODERATE': return 'text-caution';
      case 'HIGH': return 'text-danger';
      default: return 'text-safe';
    }
  };

  const getBgColor = (severity) => {
    switch(severity) {
      case 'SAFE':
      case 'LOW': return 'bg-safe/10 border-safe/30';
      case 'MEDIUM':
      case 'MODERATE': return 'bg-caution/10 border-caution/30';
      case 'HIGH': return 'bg-danger/10 border-danger/30';
      default: return 'bg-safe/10 border-safe/30';
    }
  };

  const colorClass = getColor(risk.severity);
  const bgClass = getBgColor(risk.severity);

  return (
    <div className="max-w-3xl mx-auto">
      <button 
        onClick={() => navigate('/risk')}
        className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors mb-8"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm font-medium">Back to Risks</span>
      </button>

      <div className={`rounded-2xl border p-6 mb-8 ${bgClass}`}>
        <h1 className={`text-3xl font-sans font-bold capitalize ${colorClass}`}>
          {risk.severity !== 'SAFE' && risk.severity !== 'LOW' && '⚠️ '}
          {risk.severity} {riskId} Risk
        </h1>
      </div>

      {/* Process Flow visualization */}
      <div className="flex items-center justify-between max-w-md mx-auto mb-12">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-pulse/20 text-pulse flex items-center justify-center font-mono text-sm border border-pulse/30">1</div>
          <span className="text-[0.65rem] font-bold text-text-secondary uppercase tracking-widest">Detection</span>
        </div>
        <div className="flex-1 h-[1px] bg-hairline mx-4 -mt-6"></div>
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-pulse text-ink flex items-center justify-center font-mono text-sm border border-pulse">2</div>
          <span className="text-[0.65rem] font-bold text-text-primary uppercase tracking-widest">Why?</span>
        </div>
        <div className="flex-1 h-[1px] bg-hairline mx-4 -mt-6"></div>
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-surface-raised text-text-secondary flex items-center justify-center font-mono text-sm border border-hairline">3</div>
          <span className="text-[0.65rem] font-bold text-text-secondary uppercase tracking-widest">Action</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6 p-6 bg-surface-raised border-hairline">
          <h2 className="text-lg font-medium text-text-primary mb-6 flex items-center gap-2 border-b border-hairline pb-4">
            <Info className="w-5 h-5 text-text-secondary" />
            Why?
          </h2>
          <ul className="space-y-4">
            {copy.factors.map((factor, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-pulse mt-2 shrink-0"></div>
                <span className="text-text-primary font-medium leading-relaxed text-[0.9375rem]">{factor}</span>
              </li>
            ))}
            {copy.factors.length === 0 && (
              <li className="text-text-secondary italic">No active contributing factors.</li>
            )}
          </ul>
        </Card>

        <Card className="p-6 p-6 bg-surface-raised border-hairline">
          <h2 className="text-lg font-medium text-text-primary mb-6 flex items-center gap-2 border-b border-hairline pb-4">
            <CheckCircle2 className="w-5 h-5 text-pulse" />
            Recommended Action
          </h2>
          <ul className="space-y-4">
            {copy.actions.map((action, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <input 
                  type="checkbox" 
                  className="mt-1.5 w-4 h-4 rounded border-hairline bg-surface text-pulse focus:ring-pulse focus:ring-offset-ink accent-pulse"
                />
                <span className="text-text-primary leading-relaxed text-[0.9375rem]">{action}</span>
              </li>
            ))}
            {copy.actions.length === 0 && (
              <li className="text-text-secondary italic">Continue normal activities.</li>
            )}
          </ul>
        </Card>
      </div>
    </div>
  );
}
