import * as React from 'react';
import { cn } from '../../lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl', className)}
      {...props}
    />
  )
);
Card.displayName = 'Card';

export default Card;
