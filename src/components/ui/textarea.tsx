import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

export const Textarea = ({
  className,
  ...props
}: ComponentProps<'textarea'>) => {
  return (
    <textarea
      className={cn(
        'flex min-h-24 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-accent',
        className,
      )}
      {...props}
    />
  );
};
