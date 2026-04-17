import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

export const Table = ({ className, ...props }: ComponentProps<'table'>) => {
  return (
    <div className="overflow-hidden rounded-3xl border border-border">
      <table
        className={cn('w-full caption-bottom text-sm', className)}
        {...props}
      />
    </div>
  );
};

export const TableHeader = ({
  className,
  ...props
}: ComponentProps<'thead'>) => {
  return <thead className={cn('bg-muted/60', className)} {...props} />;
};

export const TableBody = ({ className, ...props }: ComponentProps<'tbody'>) => {
  return (
    <tbody className={cn('[&_tr:last-child]:border-0', className)} {...props} />
  );
};

export const TableRow = ({ className, ...props }: ComponentProps<'tr'>) => {
  return (
    <tr
      className={cn(
        'border-b border-border transition-colors hover:bg-muted/40',
        className,
      )}
      {...props}
    />
  );
};

export const TableHead = ({ className, ...props }: ComponentProps<'th'>) => {
  return (
    <th
      className={cn(
        'h-12 px-4 text-left align-middle text-xs font-medium tracking-[0.14em] text-muted-foreground uppercase',
        className,
      )}
      {...props}
    />
  );
};

export const TableCell = ({ className, ...props }: ComponentProps<'td'>) => {
  return <td className={cn('px-4 py-3 align-middle', className)} {...props} />;
};
