'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', label: 'Клієнт' },
  { href: '/admin', label: 'Адмін' },
  { href: '/courier', label: "Кур'єр" },
];

export const AppNav = () => {
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap gap-2">
      {navItems.map((item) => {
        const isActive =
          item.href === '/'
            ? pathname === item.href
            : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'rounded-full border px-4 py-2 text-sm transition-colors',
              isActive
                ? 'border-accent bg-accent text-accent-foreground'
                : 'border-border bg-card text-foreground hover:bg-muted',
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
};
