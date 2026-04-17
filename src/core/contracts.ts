export type TPluginType = 'delivery' | 'promo' | 'payment';

export type TOrderStatus = 'new' | 'assigned' | 'delivering' | 'completed';

export type TMenuItem = Readonly<{
  id: number;
  name: string;
  description: string;
  category: string;
  price: number;
}>;

export type TCartInputItem = Readonly<{
  menuItemId: number;
  quantity: number;
}>;

export type TOrderDraftItem = Readonly<{
  menuItemId: number;
  name: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}>;

export type TOrderDraft = Readonly<{
  items: TOrderDraftItem[];
  itemCount: number;
  subtotal: number;
}>;

type TBasePlugin<TType extends TPluginType> = Readonly<{
  key: string;
  label: string;
  type: TType;
}>;

export type TDeliveryPlugin = TBasePlugin<'delivery'> &
  Readonly<{
    calculateDelivery: (input: { subtotal: number; itemCount: number }) => {
      fee: number;
    };
  }>;

export type TPromoPlugin = TBasePlugin<'promo'> &
  Readonly<{
    calculateDiscount: (input: { subtotal: number }) => {
      discount: number;
    };
  }>;

export type TPaymentPlugin = TBasePlugin<'payment'> &
  Readonly<{
    createPaymentSession: (input: { total: number; customerName: string }) => {
      method: string;
      sessionReference: string;
    };
  }>;

export type TPluginRegistry = Readonly<{
  deliveryPlugins: TDeliveryPlugin[];
  promoPlugins: TPromoPlugin[];
  paymentPlugins: TPaymentPlugin[];
}>;

export type TRegisteredPlugin = TDeliveryPlugin | TPromoPlugin | TPaymentPlugin;

export type TPaymentMode = 'cash_on_delivery' | 'online';

export type TPluginConfigValues = Readonly<Record<string, number>>;

export type TPluginConfigField = Readonly<{
  key: string;
  label: string;
  defaultValue: number;
  min: number;
  suffix: string | null;
}>;

export type TPluginDefinition<
  TPlugin extends TRegisteredPlugin = TRegisteredPlugin,
> = {
  key: string;
  label: string;
  type: TPluginType;
  configFields: TPluginConfigField[];
  create: (configValues: TPluginConfigValues) => TPlugin;
};

export type TPluginSetting = Readonly<{
  pluginKey: string;
  pluginType: TPluginType;
  pluginLabel: string;
  enabled: boolean;
  configValues: TPluginConfigValues;
}>;

export type TCheckoutResult = Readonly<{
  draft: TOrderDraft;
  status: TOrderStatus;
  subtotal: number;
  discountAmount: number;
  deliveryFee: number;
  total: number;
  promo: {
    plugin: TPromoPlugin | null;
  };
  delivery: {
    plugin: TDeliveryPlugin | null;
  };
  payment: {
    plugin: TPaymentPlugin | null;
    mode: TPaymentMode;
    isPaid: boolean;
    method: string;
    label: string;
    sessionReference: string | null;
  };
}>;
