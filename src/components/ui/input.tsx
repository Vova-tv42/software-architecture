import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

export const Input = ({ className, ...props }: ComponentProps<'input'>) => {
  return (
    <input
      className={cn(
        'flex h-11 w-full rounded-2xl border border-border bg-background px-4 py-2 text-sm text-foreground transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-accent',
        className,
      )}
      {...props}
    />
  );
};
