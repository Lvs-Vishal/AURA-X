import React from 'react';
import { motion } from 'framer-motion';

export function SegmentedControl({ options, value, onChange }) {
  return (
    <div className="flex bg-surface-raised p-1 rounded-full border border-hairline overflow-x-auto no-scrollbar relative max-w-full">
      {options.map((opt) => {
        const isActive = value === opt.id;
        return (
          <button
            key={opt.id}
            onClick={() => onChange(opt.id)}
            className={`relative flex-1 min-w-[100px] px-4 py-2 rounded-full text-sm font-medium transition-colors z-10 whitespace-nowrap
              ${isActive ? 'text-ink' : 'text-text-secondary hover:text-text-primary'}
            `}
          >
            {isActive && (
              <motion.div
                layoutId="segment-active"
                className="absolute inset-0 bg-pulse rounded-full z-[-1]"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
