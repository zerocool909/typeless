import React from 'react';
import { cn } from '@/lib/utils/cn';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost' | 'destructive' | 'gradient';
    size?: 'sm' | 'md' | 'lg' | 'icon';
    isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'primary', size = 'md', isLoading, children, disabled, ...props }, ref) => {
        const variants = {
            primary: 'glass-button-primary',
            gradient: 'glass-button-primary', // Same as primary, uses gradient from CSS
            secondary: 'glass-button-secondary',
            ghost: 'hover:bg-white/5 text-[#a0a0a0] hover:text-white',
            destructive: 'bg-red-500/80 text-white hover:bg-red-500',
        };

        const sizes = {
            sm: 'px-3 py-1.5 text-xs',
            md: 'px-4 py-2 text-sm',
            lg: 'px-6 py-3 text-base',
            icon: 'p-2 rounded-full',
        };

        return (
            <button
                ref={ref}
                disabled={disabled || isLoading}
                className={cn(
                    'glass-button',
                    variants[variant],
                    sizes[size],
                    className
                )}
                {...props}
            >
                {isLoading ? (
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : null}
                {children}
            </button>
        );
    }
);

Button.displayName = 'Button';

export { Button };
