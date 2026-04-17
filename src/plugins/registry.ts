import type {
  TDeliveryPlugin,
  TPaymentPlugin,
  TPluginConfigValues,
  TPluginRegistry,
  TRegisteredPlugin,
  TPluginSetting,
  TPromoPlugin,
} from '@/core/contracts';
import { fixedDeliveryPlugin } from '@/plugins/fixed-delivery-plugin';
import { onlinePaymentPluginDefinition } from '@/plugins/online-payment-plugin';
import { thresholdPromoPlugin } from '@/plugins/threshold-promo-plugin';

const pluginCatalog = [
  fixedDeliveryPlugin,
  thresholdPromoPlugin,
  onlinePaymentPluginDefinition,
];

type TRegisteredPluginDefinition = (typeof pluginCatalog)[number];

export const getPluginCatalog = (): TRegisteredPluginDefinition[] => {
  return pluginCatalog;
};

export const createPluginRegistry = (
  settings: TPluginSetting[],
): TPluginRegistry => {
  const enabledPlugins = pluginCatalog
    .filter((plugin) => isPluginEnabled(settings, plugin.key))
    .map((plugin) =>
      plugin.create(getPluginConfigValues(settings, plugin.key)),
    );

  return {
    deliveryPlugins: enabledPlugins.filter(isDeliveryPlugin),
    promoPlugins: enabledPlugins.filter(isPromoPlugin),
    paymentPlugins: enabledPlugins.filter(isPaymentPlugin),
  };
};

export const isPluginEnabled = (
  settings: TPluginSetting[],
  pluginKey: string,
): boolean => {
  const matchingSetting = settings.find(
    (setting) => setting.pluginKey === pluginKey,
  );

  return matchingSetting?.enabled ?? true;
};

export const getPluginConfigValues = (
  settings: TPluginSetting[],
  pluginKey: string,
): TPluginConfigValues => {
  const matchingSetting = settings.find(
    (setting) => setting.pluginKey === pluginKey,
  );

  return matchingSetting?.configValues ?? {};
};

const isDeliveryPlugin = (
  plugin: TRegisteredPlugin,
): plugin is TDeliveryPlugin => {
  return plugin.type === 'delivery';
};

const isPromoPlugin = (plugin: TRegisteredPlugin): plugin is TPromoPlugin => {
  return plugin.type === 'promo';
};

const isPaymentPlugin = (
  plugin: TRegisteredPlugin,
): plugin is TPaymentPlugin => {
  return plugin.type === 'payment';
};
