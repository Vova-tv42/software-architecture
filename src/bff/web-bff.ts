import { listMenuItems, listPluginSettings } from '@/lib/db/repositories';
import { formatPrice } from '@/lib/format';
import { getPluginConfigValues, isPluginEnabled } from '@/plugins/registry';

export type TWebMenuItem = Readonly<{
  id: number;
  name: string;
  description: string;
  category: string;
  price: number;
  priceLabel: string;
}>;

export type TWebDashboard = Readonly<{
  endpoint: '/api/bff/web';
  menuItems: TWebMenuItem[];
  checkoutRules: {
    freeDeliveryThreshold: number | null;
    deliveryFee: number;
    discountThreshold: number | null;
    discountPercent: number;
    onlinePaymentAvailable: boolean;
  };
}>;

export const getWebDashboard = async (): Promise<TWebDashboard> => {
  const [menuItems, pluginSettings] = await Promise.all([
    listMenuItems(),
    listPluginSettings(),
  ]);

  const { freeDeliveryThreshold = 450, deliveryFee = 60 } =
    getPluginConfigValues(pluginSettings, 'fixed-delivery');

  const { discountThreshold = 500, discountPercent = 10 } =
    getPluginConfigValues(pluginSettings, 'threshold-promo');

  return {
    endpoint: '/api/bff/web',
    menuItems: menuItems.map((menuItem) => ({
      id: menuItem.id,
      name: menuItem.name,
      description: menuItem.description,
      category: menuItem.category,
      price: menuItem.price,
      priceLabel: formatPrice(menuItem.price),
    })),
    checkoutRules: {
      freeDeliveryThreshold: isPluginEnabled(pluginSettings, 'fixed-delivery')
        ? freeDeliveryThreshold
        : null,
      deliveryFee,
      discountThreshold: isPluginEnabled(pluginSettings, 'threshold-promo')
        ? discountThreshold
        : null,
      discountPercent,
      onlinePaymentAvailable: isPluginEnabled(pluginSettings, 'online-payment'),
    },
  };
};
