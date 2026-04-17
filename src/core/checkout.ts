import type {
  TCartInputItem,
  TCheckoutResult,
  TMenuItem,
  TOrderDraft,
  TOrderDraftItem,
  TPaymentMode,
  TPluginRegistry,
} from '@/core/contracts';

type TCheckoutInput = Readonly<{
  customerAddress: string;
  customerName: string;
  paymentMode: TPaymentMode;
  cartItems: TCartInputItem[];
  menuItems: TMenuItem[];
  pluginRegistry: TPluginRegistry;
}>;

export const createOrderDraft = (
  menuItems: TMenuItem[],
  cartItems: TCartInputItem[],
): TOrderDraft => {
  if (cartItems.length === 0) {
    throw new Error('Кошик порожній.');
  }

  const menuItemsById = new Map<number, TMenuItem>(
    menuItems.map((menuItem) => [menuItem.id, menuItem]),
  );
  const draftItems: TOrderDraftItem[] = [];

  for (const cartItem of cartItems) {
    if (cartItem.quantity <= 0) {
      throw new Error('Кількість позицій має бути більшою за нуль.');
    }

    const menuItem = menuItemsById.get(cartItem.menuItemId);

    if (!menuItem) {
      throw new Error('У кошику знайдено невідому позицію.');
    }

    draftItems.push({
      menuItemId: menuItem.id,
      name: menuItem.name,
      quantity: cartItem.quantity,
      unitPrice: menuItem.price,
      lineTotal: menuItem.price * cartItem.quantity,
    });
  }

  return {
    items: draftItems,
    itemCount: draftItems.reduce((count, item) => count + item.quantity, 0),
    subtotal: draftItems.reduce((total, item) => total + item.lineTotal, 0),
  };
};

export const checkoutOrder = ({
  customerAddress,
  customerName,
  paymentMode,
  cartItems,
  menuItems,
  pluginRegistry,
}: TCheckoutInput): TCheckoutResult => {
  if (!customerAddress.trim() || !customerName.trim()) {
    throw new Error('Заповніть ім’я та адресу доставки.');
  }

  const draft = createOrderDraft(menuItems, cartItems);
  const promoPlugin = pluginRegistry.promoPlugins[0] ?? null;
  const deliveryPlugin = pluginRegistry.deliveryPlugins[0] ?? null;
  const paymentPlugin = pluginRegistry.paymentPlugins[0] ?? null;

  const discountAmount = Math.min(
    promoPlugin?.calculateDiscount({ subtotal: draft.subtotal }).discount ?? 0,
    draft.subtotal,
  );
  const deliveryFee =
    deliveryPlugin?.calculateDelivery({
      subtotal: draft.subtotal,
      itemCount: draft.itemCount,
    }).fee ?? 0;
  const total = Math.max(draft.subtotal - discountAmount + deliveryFee, 0);
  const usesOnlinePayment = paymentMode === 'online' && paymentPlugin !== null;
  const paymentResult = usesOnlinePayment
    ? paymentPlugin.createPaymentSession({
        total,
        customerName,
      })
    : null;

  return {
    draft,
    status: 'new',
    subtotal: draft.subtotal,
    discountAmount,
    deliveryFee,
    total,
    promo: {
      plugin: promoPlugin,
    },
    delivery: {
      plugin: deliveryPlugin,
    },
    payment: {
      plugin: paymentPlugin,
      mode: usesOnlinePayment ? 'online' : 'cash_on_delivery',
      isPaid: usesOnlinePayment,
      method: paymentResult?.method ?? 'Оплата при отриманні',
      label: usesOnlinePayment
        ? `Оплачено онлайн • ${paymentResult?.method ?? 'Картка'}`
        : 'Оплата при отриманні',
      sessionReference: paymentResult?.sessionReference ?? null,
    },
  };
};
