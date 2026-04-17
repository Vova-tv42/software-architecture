import type { TPluginConfigValues, TPluginType } from '@/core/contracts';
import {
  listMenuItems,
  listOrdersWithItems,
  listPluginSettings,
} from '@/lib/db/repositories';
import {
  formatDateTime,
  formatPrice,
  getOrderStatusLabel,
  getPluginTypeLabel,
} from '@/lib/format';
import {
  getPluginCatalog,
  getPluginConfigValues,
  isPluginEnabled,
} from '@/plugins/registry';

export type TAdminDashboard = Readonly<{
  endpoint: '/api/bff/admin';
  plugins: TAdminPluginView[];
  orders: TAdminOrderView[];
  menuItems: TAdminMenuItemView[];
}>;

type TAdminPluginView = Readonly<{
  key: string;
  label: string;
  type: TPluginType;
  typeLabel: string;
  isEnabled: boolean;
  stateLabel: string;
  effectLabel: string;
  configFields: TAdminPluginConfigFieldView[];
}>;

type TAdminOrderView = Readonly<{
  id: number;
  customerName: string;
  createdAtLabel: string;
  statusLabel: string;
  itemCountLabel: string;
  totalLabel: string;
  pluginLabel: string;
}>;

type TAdminPluginConfigFieldView = Readonly<{
  key: string;
  label: string;
  value: number;
  min: number;
  suffix: string | null;
}>;

type TAdminMenuItemView = Readonly<{
  id: number;
  name: string;
  description: string;
  category: string;
  price: number;
  priceLabel: string;
}>;

export const getAdminDashboard = async (): Promise<TAdminDashboard> => {
  const [orders, pluginSettings, menuItems] = await Promise.all([
    listOrdersWithItems(),
    listPluginSettings(),
    listMenuItems(),
  ]);

  return {
    endpoint: '/api/bff/admin',
    plugins: getPluginCatalog().map((plugin) => {
      const enabled = isPluginEnabled(pluginSettings, plugin.key);

      return {
        key: plugin.key,
        label: plugin.label,
        type: plugin.type,
        typeLabel: getPluginTypeLabel(plugin.type),
        isEnabled: enabled,
        stateLabel: enabled ? 'Увімкнено' : 'Вимкнено',
        effectLabel: getPluginEffectLabel(plugin.key),
        configFields: plugin.configFields.map((field) => ({
          key: field.key,
          label: field.label,
          value: getPluginFieldValue(
            pluginSettings,
            plugin.key,
            field.key,
            field.defaultValue,
          ),
          min: field.min,
          suffix: field.suffix,
        })),
      };
    }),
    orders: orders.map((order) => ({
      id: order.id,
      customerName: order.customerName,
      createdAtLabel: formatDateTime(order.createdAt),
      statusLabel: getOrderStatusLabel(order.status),
      itemCountLabel: `${countItems(order.items)} позицій`,
      totalLabel: formatPrice(order.total),
      pluginLabel: formatOrderPluginLabel(order),
    })),
    menuItems: menuItems.map((menuItem) => ({
      id: menuItem.id,
      name: menuItem.name,
      description: menuItem.description,
      category: menuItem.category,
      price: menuItem.price,
      priceLabel: formatPrice(menuItem.price),
    })),
  };
};

const getPluginEffectLabel = (pluginKey: string): string => {
  if (pluginKey === 'fixed-delivery') {
    return 'Керує вартістю доставки для замовлень.';
  }

  if (pluginKey === 'threshold-promo') {
    return 'Надає знижку для великих замовлень.';
  }

  return 'Керує доступністю безготівкової оплати.';
};

const countItems = (
  items: Awaited<ReturnType<typeof listOrdersWithItems>>[number]['items'],
): number => {
  return items.reduce((total, item) => total + item.quantity, 0);
};

const formatOrderPluginLabel = (
  order: Awaited<ReturnType<typeof listOrdersWithItems>>[number],
): string => {
  const appliedPlugins = [
    order.deliveryPluginKey,
    order.promoPluginKey,
    order.paymentPluginKey,
  ].filter((value) => typeof value === 'string' && value.length > 0);

  return appliedPlugins.length > 0
    ? appliedPlugins.join(' • ')
    : 'Стандартні умови';
};

const getPluginFieldValue = (
  settings: Awaited<ReturnType<typeof listPluginSettings>>,
  pluginKey: string,
  fieldKey: string,
  fallbackValue: number,
): number => {
  const configValues = getPluginConfigValues(settings, pluginKey);

  return getConfigValue(configValues, fieldKey, fallbackValue);
};

const getConfigValue = (
  configValues: TPluginConfigValues,
  fieldKey: string,
  fallbackValue: number,
): number => {
  return configValues[fieldKey] ?? fallbackValue;
};
