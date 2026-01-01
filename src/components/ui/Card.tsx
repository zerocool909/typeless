import React from 'react';
import { cn } from '@/lib/utils/cn';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    glass?: boolean;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
    ({ className, glass = true, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={cn(
                    glass ? 'glass-card' : 'bg-[#191923] border border-[#6E4BFF]/10 rounded-2xl',
                    'p-6 overflow-hidden',
                    className
                )}
                {...props}
            />
        );
    }
);

Card.displayName = 'Card';

export { Card };
