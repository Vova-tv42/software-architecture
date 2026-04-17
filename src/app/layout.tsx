import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { AppNav } from '@/components/app-nav';
import './globals.css';

export const metadata: Metadata = {
  title: 'Смачна Доставка',
  description: 'Сервіс доставки їжі',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="uk" className="h-full">
      <body className="min-h-full bg-background font-sans text-foreground antialiased">
        <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-6 pt-6 pb-10 sm:px-8">
          <header className="mb-10 flex flex-col gap-6 border-b border-border pb-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-3">
              <div className="space-y-2">
                <h1 className="font-serif text-3xl tracking-tight sm:text-4xl">
                  Смачна Доставка
                </h1>
                <p className="max-w-3xl text-sm leading-6 text-muted-foreground sm:text-base">
                  Меню, оформлення замовлень та керування доставкою в одному
                  сервісі.
                </p>
              </div>
            </div>
            <AppNav />
          </header>

          <main className="flex-1">{children}</main>
        </div>
      </body>
    </html>
  );
}
