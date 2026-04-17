import type { TDeliveryPlugin, TPluginDefinition } from '@/core/contracts';

type TFixedDeliveryPluginOptions = {
  readonly freeDeliveryThreshold: number;
  readonly deliveryFee: number;
};

export const createFixedDeliveryPlugin = ({
  freeDeliveryThreshold,
  deliveryFee,
}: TFixedDeliveryPluginOptions): TDeliveryPlugin => ({
  key: 'fixed-delivery',
  label: 'Фіксована доставка',
  type: 'delivery',
  calculateDelivery: ({ subtotal }) => ({
    fee: subtotal >= freeDeliveryThreshold ? 0 : deliveryFee,
  }),
});

export const fixedDeliveryPlugin: TPluginDefinition<TDeliveryPlugin> = {
  key: 'fixed-delivery',
  label: 'Фіксована доставка',
  type: 'delivery',
  configFields: [
    {
      key: 'freeDeliveryThreshold',
      label: 'Поріг безкоштовної доставки',
      defaultValue: 450,
      min: 0,
      suffix: 'грн',
    },
    {
      key: 'deliveryFee',
      label: 'Вартість доставки',
      defaultValue: 60,
      min: 0,
      suffix: 'грн',
    },
  ],
  create: (configValues) =>
    createFixedDeliveryPlugin({
      freeDeliveryThreshold: configValues.freeDeliveryThreshold ?? 450,
      deliveryFee: configValues.deliveryFee ?? 60,
    }),
};
