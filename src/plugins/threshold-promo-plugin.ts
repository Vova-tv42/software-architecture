import type { TPluginDefinition, TPromoPlugin } from '@/core/contracts';

type TThresholdPromoPluginOptions = {
  readonly discountThreshold: number;
  readonly discountPercent: number;
};

export const createThresholdPromoPlugin = ({
  discountThreshold,
  discountPercent,
}: TThresholdPromoPluginOptions): TPromoPlugin => ({
  key: 'threshold-promo',
  label: 'Знижка від порогу',
  type: 'promo',
  calculateDiscount: ({ subtotal }) => ({
    discount:
      subtotal >= discountThreshold
        ? Math.round(subtotal * (discountPercent / 100))
        : 0,
  }),
});

export const thresholdPromoPlugin: TPluginDefinition<TPromoPlugin> = {
  key: 'threshold-promo',
  label: 'Знижка від порогу',
  type: 'promo',
  configFields: [
    {
      key: 'discountThreshold',
      label: 'Поріг для знижки',
      defaultValue: 500,
      min: 0,
      suffix: 'грн',
    },
    {
      key: 'discountPercent',
      label: 'Розмір знижки',
      defaultValue: 10,
      min: 0,
      suffix: '%',
    },
  ],
  create: (configValues) =>
    createThresholdPromoPlugin({
      discountThreshold: configValues.discountThreshold ?? 500,
      discountPercent: configValues.discountPercent ?? 10,
    }),
};
