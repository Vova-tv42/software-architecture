export type TPluginType = 'delivery' | 'promo' | 'payment';

export type TOrderStatus = 'new' | 'assigned' | 'delivering' | 'completed';

export type TMenuItem = {
  readonly id: number;
  readonly name: string;
  readonly description: string;
  readonly category: string;
  readonly price: number;
};

export type TCartInputItem = {
  readonly menuItemId: number;
  readonly quantity: number;
};

export type TOrderDraftItem = {
  readonly menuItemId: number;
  readonly name: string;
  readonly quantity: number;
  readonly unitPrice: number;
  readonly lineTotal: number;
};

export type TOrderDraft = {
  readonly items: readonly TOrderDraftItem[];
  readonly itemCount: number;
  readonly subtotal: number;
};

type TBasePlugin<TType extends TPluginType> = {
  readonly key: string;
  readonly label: string;
  readonly type: TType;
};

export type TDeliveryPlugin = TBasePlugin<'delivery'> & {
  readonly calculateDelivery: (input: {
    readonly subtotal: number;
    readonly itemCount: number;
  }) => {
    readonly fee: number;
  };
};

export type TPromoPlugin = TBasePlugin<'promo'> & {
  readonly calculateDiscount: (input: { readonly subtotal: number }) => {
    readonly discount: number;
  };
};

export type TPaymentPlugin = TBasePlugin<'payment'> & {
  readonly createPaymentSession: (input: {
    readonly total: number;
    readonly customerName: string;
  }) => {
    readonly method: string;
    readonly sessionReference: string;
  };
};

export type TPluginRegistry = {
  readonly deliveryPlugins: readonly TDeliveryPlugin[];
  readonly promoPlugins: readonly TPromoPlugin[];
  readonly paymentPlugins: readonly TPaymentPlugin[];
};

export type TRegisteredPlugin =
  | TDeliveryPlugin
  | TPromoPlugin
  | TPaymentPlugin;

export type TPaymentMode = 'cash_on_delivery' | 'online';

export type TPluginConfigValues = Readonly<Record<string, number>>;

export type TPluginConfigField = {
  readonly key: string;
  readonly label: string;
  readonly defaultValue: number;
  readonly min: number;
  readonly suffix: string | null;
};

export type TPluginDefinition<TPlugin extends TRegisteredPlugin = TRegisteredPlugin> = {
  readonly key: string;
  readonly label: string;
  readonly type: TPluginType;
  readonly configFields: readonly TPluginConfigField[];
  readonly create: (configValues: TPluginConfigValues) => TPlugin;
};

export type TPluginSetting = {
  readonly pluginKey: string;
  readonly pluginType: TPluginType;
  readonly pluginLabel: string;
  readonly enabled: boolean;
  readonly configValues: TPluginConfigValues;
};

export type TCheckoutResult = {
  readonly draft: TOrderDraft;
  readonly status: TOrderStatus;
  readonly subtotal: number;
  readonly discountAmount: number;
  readonly deliveryFee: number;
  readonly total: number;
  readonly promo: {
    readonly plugin: TPromoPlugin | null;
  };
  readonly delivery: {
    readonly plugin: TDeliveryPlugin | null;
  };
  readonly payment: {
    readonly plugin: TPaymentPlugin | null;
    readonly mode: TPaymentMode;
    readonly isPaid: boolean;
    readonly method: string;
    readonly label: string;
    readonly sessionReference: string | null;
  };
};
