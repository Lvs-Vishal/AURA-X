import React from 'react';
import { twMerge } from 'tailwind-merge';

export function Button({ children, variant = 'primary', className, ...props }) {
  const base = 'px-6 py-3 rounded-[12px] font-sans font-medium transition-colors duration-200 outline-none focus-visible:ring-2 focus-visible:ring-pulse focus-visible:ring-offset-2 focus-visible:ring-offset-ink flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed';
  const variants = {
    primary: 'bg-pulse text-ink hover:bg-opacity-90',
    secondary: 'bg-surface-raised text-text-primary border border-hairline hover:bg-hairline',
    danger: 'bg-danger text-ink hover:bg-danger-strong'
  };

  return (
    <button className={twMerge(base, variants[variant], className)} {...props}>
      {children}
    </button>
  );
}
