import React from 'react';
import { twMerge } from 'tailwind-merge';

export function Card({ children, className, raised = false, ...props }) {
  return (
    <div 
      className={twMerge(
        'rounded-[20px] border border-hairline',
        raised ? 'bg-surface-raised' : 'bg-surface',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
