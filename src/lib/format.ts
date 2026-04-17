import type { TOrderStatus, TPluginType } from '@/core/contracts';

const hryvniaFormatter = new Intl.NumberFormat('uk-UA', {
  style: 'currency',
  currency: 'UAH',
  maximumFractionDigits: 0,
});

const dateTimeFormatter = new Intl.DateTimeFormat('uk-UA', {
  day: '2-digit',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
});

const orderStatusLabels: Record<TOrderStatus, string> = {
  new: 'Нове',
  assigned: 'Призначене',
  delivering: 'У дорозі',
  completed: 'Завершене',
};

const pluginTypeLabels: Record<TPluginType, string> = {
  delivery: 'Доставка',
  promo: 'Знижки',
  payment: 'Оплата',
};

export const formatPrice = (value: number): string => {
  return hryvniaFormatter.format(value);
};

export const formatDateTime = (value: string): string => {
  return dateTimeFormatter.format(new Date(value));
};

export const getOrderStatusLabel = (status: TOrderStatus): string => {
  return orderStatusLabels[status];
};

export const getPluginTypeLabel = (pluginType: TPluginType): string => {
  return pluginTypeLabels[pluginType];
};
