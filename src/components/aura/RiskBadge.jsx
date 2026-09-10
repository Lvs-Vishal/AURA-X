import React from 'react';
import { twMerge } from 'tailwind-merge';

export function RiskBadge({ severity, className }) {
  const styles = {
    SAFE: 'bg-safe/20 text-safe border-safe/30',
    LOW: 'bg-safe/20 text-safe border-safe/30',
    MEDIUM: 'bg-caution/20 text-caution border-caution/30',
    MODERATE: 'bg-caution/20 text-caution border-caution/30',
    HIGH: 'bg-danger/20 text-danger border-danger/30'
  };

  return (
    <span className={twMerge('inline-flex items-center px-3 py-1 rounded-[999px] text-[0.8125rem] font-bold tracking-wider uppercase border', styles[severity] || styles.SAFE, className)}>
      {severity}
    </span>
  );
}
