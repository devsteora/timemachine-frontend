import React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', isLoading, children, disabled, ...props }, ref) => {
    const baseStyles =
      'relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-xl text-sm font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-45 active:scale-[0.98]';

    const variants = {
      primary:
        'bg-gradient-to-r from-teal-400 via-cyan-400 to-teal-500 text-zinc-950 shadow-lg shadow-teal-500/20 hover:shadow-teal-400/35 hover:brightness-105 before:absolute before:inset-0 before:-translate-x-full before:bg-gradient-to-r before:from-transparent before:via-white/25 before:to-transparent before:transition-transform before:duration-700 hover:before:translate-x-full',
      secondary:
        'border border-white/10 bg-white/[0.06] text-foreground backdrop-blur-sm hover:border-white/15 hover:bg-white/[0.1]',
      danger:
        'border border-red-500/30 bg-red-500/15 text-red-200 hover:border-red-400/40 hover:bg-red-500/25',
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], 'h-11 px-5 py-2', className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <>
            <span
              className={cn(
                'size-4 shrink-0 rounded-full border-2 animate-spin',
                variant === 'primary' && 'border-zinc-900/35 border-t-zinc-900',
                variant === 'secondary' && 'border-white/25 border-t-white',
                variant === 'danger' && 'border-red-200/30 border-t-red-200'
              )}
              aria-hidden
            />
            <span className="opacity-90">Please wait</span>
          </>
        ) : (
          children
        )}
      </button>
    );
  }
);
Button.displayName = 'Button';
