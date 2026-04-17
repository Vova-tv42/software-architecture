import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

export const Card = ({ className, ...props }: ComponentProps<'section'>) => {
  return (
    <section
      className={cn(
        'rounded-3xl border border-border bg-card shadow-[0_12px_30px_rgba(32,27,23,0.05)]',
        className,
      )}
      {...props}
    />
  );
};

export const CardHeader = ({ className, ...props }: ComponentProps<'div'>) => {
  return <div className={cn('space-y-2 px-6 pt-6', className)} {...props} />;
};

export const CardTitle = ({ className, ...props }: ComponentProps<'h2'>) => {
  return (
    <h2
      className={cn('text-xl font-semibold tracking-tight', className)}
      {...props}
    />
  );
};

export const CardDescription = ({
  className,
  ...props
}: ComponentProps<'p'>) => {
  return (
    <p className={cn('text-sm text-muted-foreground', className)} {...props} />
  );
};

export const CardContent = ({ className, ...props }: ComponentProps<'div'>) => {
  return <div className={cn('px-6 pb-6', className)} {...props} />;
};
