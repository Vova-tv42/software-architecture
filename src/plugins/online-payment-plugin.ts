import type { TPaymentPlugin, TPluginDefinition } from '@/core/contracts';

export const onlinePaymentPlugin: TPaymentPlugin = {
  key: 'online-payment',
  label: 'Онлайн оплата карткою',
  type: 'payment',
  createPaymentSession: ({ customerName }) => ({
    method: 'Онлайн картка',
    sessionReference: `PAY-${customerName.slice(0, 3).toUpperCase()}-${crypto
      .randomUUID()
      .slice(0, 8)}`,
  }),
};

export const onlinePaymentPluginDefinition: TPluginDefinition<TPaymentPlugin> =
  {
    key: onlinePaymentPlugin.key,
    label: onlinePaymentPlugin.label,
    type: onlinePaymentPlugin.type,
    configFields: [],
    create: () => onlinePaymentPlugin,
  };
