'use server';

import { revalidatePath } from 'next/cache';
import { checkoutOrder } from '@/core/checkout';
import type {
  TCartInputItem,
  TPluginConfigValues,
  TPaymentMode,
  TPluginType,
} from '@/core/contracts';
import {
  createMenuItem,
  deleteMenuItem,
  listMenuItems,
  listPluginSettings,
  saveOrder,
  savePluginSetting,
  updateMenuItem,
} from '@/lib/db/repositories';
import { formatPrice } from '@/lib/format';
import { createPluginRegistry } from '@/plugins/registry';

type TOrderActionSummary = Readonly<{
  subtotalLabel: string;
  discountLabel: string;
  deliveryFeeLabel: string;
  totalLabel: string;
  paymentLabel: string;
  paymentStatusLabel: string;
}>;

export type TOrderActionState = Readonly<{
  status: 'idle' | 'error' | 'success';
  message: string;
  orderId: number | null;
  summary: TOrderActionSummary | null;
}>;

export const createOrderAction = async (
  _: TOrderActionState,
  formData: FormData,
): Promise<TOrderActionState> => {
  try {
    const customerName = readRequiredText(formData, 'customerName');
    const customerAddress = readRequiredText(formData, 'customerAddress');
    const paymentMode = readPaymentMode(formData, 'paymentMode');
    const cartItems = readCartItems(formData.get('cartPayload'));
    const [menuItems, pluginSettings] = await Promise.all([
      listMenuItems(),
      listPluginSettings(),
    ]);

    const checkoutResult = checkoutOrder({
      customerAddress,
      customerName,
      paymentMode,
      cartItems,
      menuItems,
      pluginRegistry: createPluginRegistry(pluginSettings),
    });

    const createdOrder = await saveOrder({
      customerAddress,
      customerName,
      items: checkoutResult.draft.items,
      status: checkoutResult.status,
      subtotal: checkoutResult.subtotal,
      discountAmount: checkoutResult.discountAmount,
      deliveryFee: checkoutResult.deliveryFee,
      total: checkoutResult.total,
      paymentMethod: checkoutResult.payment.method,
      isPaid: checkoutResult.payment.isPaid,
      paymentReference: checkoutResult.payment.sessionReference,
      deliveryPluginKey: checkoutResult.delivery.plugin?.key ?? null,
      promoPluginKey: checkoutResult.promo.plugin?.key ?? null,
      paymentPluginKey: checkoutResult.payment.plugin?.key ?? null,
    });

    revalidatePath('/');
    revalidatePath('/admin');
    revalidatePath('/courier');

    return {
      status: 'success',
      message: 'Замовлення створено.',
      orderId: createdOrder.id,
      summary: {
        subtotalLabel: formatPrice(checkoutResult.subtotal),
        discountLabel: formatPrice(checkoutResult.discountAmount),
        deliveryFeeLabel: formatPrice(checkoutResult.deliveryFee),
        totalLabel: formatPrice(checkoutResult.total),
        paymentLabel: checkoutResult.payment.label,
        paymentStatusLabel: checkoutResult.payment.isPaid
          ? 'Оплата вже підтверджена'
          : 'Оплата під час отримання',
      },
    };
  } catch (error) {
    return {
      status: 'error',
      message:
        error instanceof Error
          ? error.message
          : 'Не вдалося створити замовлення.',
      orderId: null,
      summary: null,
    };
  }
};

export const updatePluginStateAction = async (formData: FormData) => {
  const pluginKey = readRequiredText(formData, 'pluginKey');
  const pluginLabel = readRequiredText(formData, 'pluginLabel');
  const pluginType = readPluginType(formData, 'pluginType');
  const nextEnabled = readBoolean(formData, 'nextEnabled');
  const configValues = readConfigValuesJson(formData, 'configValues');

  await savePluginSetting({
    pluginKey,
    pluginLabel,
    pluginType,
    enabled: nextEnabled,
    configValues,
  });

  revalidatePath('/');
  revalidatePath('/admin');
};

export const updatePluginConfigAction = async (formData: FormData) => {
  const pluginKey = readRequiredText(formData, 'pluginKey');
  const pluginLabel = readRequiredText(formData, 'pluginLabel');
  const pluginType = readPluginType(formData, 'pluginType');
  const enabled = readBoolean(formData, 'enabled');
  const configValues = readConfigValuesFromFields(formData);

  await savePluginSetting({
    pluginKey,
    pluginLabel,
    pluginType,
    enabled,
    configValues,
  });

  revalidatePath('/');
  revalidatePath('/admin');
};

export const createMenuItemAction = async (formData: FormData) => {
  const menuItem = readMenuItemInput(formData);

  await createMenuItem(menuItem);

  revalidatePath('/');
  revalidatePath('/admin');
};

export const updateMenuItemAction = async (formData: FormData) => {
  const menuItemId = readRequiredInteger(formData, 'menuItemId');
  const menuItem = readMenuItemInput(formData);

  await updateMenuItem(menuItemId, menuItem);

  revalidatePath('/');
  revalidatePath('/admin');
};

export const deleteMenuItemAction = async (formData: FormData) => {
  const menuItemId = readRequiredInteger(formData, 'menuItemId');

  await deleteMenuItem(menuItemId);

  revalidatePath('/');
  revalidatePath('/admin');
};

const readRequiredText = (formData: FormData, key: string): string => {
  const rawValue = formData.get(key);

  if (typeof rawValue !== 'string') {
    throw new Error('Форма містить неповні дані.');
  }

  const value = rawValue.trim();

  if (!value) {
    throw new Error('Заповніть усі обов’язкові поля.');
  }

  return value;
};

const readBoolean = (formData: FormData, key: string): boolean => {
  const rawValue = formData.get(key);

  if (rawValue === 'true') {
    return true;
  }

  if (rawValue === 'false') {
    return false;
  }

  throw new Error('Стан плагіна передано некоректно.');
};

const readPluginType = (formData: FormData, key: string): TPluginType => {
  const rawValue = formData.get(key);

  if (
    rawValue === 'delivery' ||
    rawValue === 'promo' ||
    rawValue === 'payment'
  ) {
    return rawValue;
  }

  throw new Error('Тип плагіна не підтримується.');
};

const readPaymentMode = (formData: FormData, key: string): TPaymentMode => {
  const rawValue = formData.get(key);

  if (rawValue === 'cash_on_delivery' || rawValue === 'online') {
    return rawValue;
  }

  throw new Error('Оберіть спосіб оплати.');
};

const readRequiredInteger = (formData: FormData, key: string): number => {
  const rawValue = formData.get(key);

  if (typeof rawValue !== 'string' || rawValue.trim() === '') {
    throw new Error('Форма містить неповні дані.');
  }

  const parsedValue = Number(rawValue);

  if (!Number.isInteger(parsedValue) || parsedValue <= 0) {
    throw new Error('Передано некоректне значення.');
  }

  return parsedValue;
};

const readMenuItemInput = (formData: FormData) => {
  return {
    name: readRequiredText(formData, 'name'),
    description: readRequiredText(formData, 'description'),
    category: readRequiredText(formData, 'category'),
    price: readRequiredNonNegativeInteger(formData, 'price'),
  };
};

const readRequiredNonNegativeInteger = (
  formData: FormData,
  key: string,
): number => {
  const rawValue = formData.get(key);

  if (typeof rawValue !== 'string' || rawValue.trim() === '') {
    throw new Error('Заповніть усі обов’язкові поля.');
  }

  const parsedValue = Number(rawValue);

  if (!Number.isInteger(parsedValue) || parsedValue < 0) {
    throw new Error('Числове значення передано некоректно.');
  }

  return parsedValue;
};

const readConfigValuesJson = (
  formData: FormData,
  key: string,
): TPluginConfigValues => {
  const rawValue = formData.get(key);

  if (typeof rawValue !== 'string' || rawValue.trim() === '') {
    return {};
  }

  let parsedValue: unknown;

  try {
    parsedValue = JSON.parse(rawValue);
  } catch {
    throw new Error('Налаштування передано некоректно.');
  }

  return normalizeConfigValues(parsedValue);
};

const readConfigValuesFromFields = (
  formData: FormData,
): TPluginConfigValues => {
  const configValues: Record<string, number> = {};

  for (const [key, value] of formData.entries()) {
    if (!key.startsWith('config.')) {
      continue;
    }

    if (typeof value !== 'string') {
      throw new Error('Налаштування передано некоректно.');
    }

    const trimmedValue = value.trim();

    if (!trimmedValue) {
      throw new Error('Заповніть усі поля налаштувань.');
    }

    const parsedValue = Number(trimmedValue);

    if (!Number.isFinite(parsedValue) || parsedValue < 0) {
      throw new Error('Значення налаштувань передано некоректно.');
    }

    configValues[key.replace('config.', '')] = parsedValue;
  }

  return configValues;
};

const normalizeConfigValues = (value: unknown): TPluginConfigValues => {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new Error('Налаштування передано некоректно.');
  }

  const configValues: Record<string, number> = {};

  for (const [key, entryValue] of Object.entries(value)) {
    if (
      typeof entryValue !== 'number' ||
      !Number.isFinite(entryValue) ||
      entryValue < 0
    ) {
      throw new Error('Налаштування передано некоректно.');
    }

    configValues[key] = entryValue;
  }

  return configValues;
};

const readCartItems = (
  rawValue: FormDataEntryValue | null,
): TCartInputItem[] => {
  if (typeof rawValue !== 'string' || !rawValue.trim()) {
    throw new Error('Кошик порожній.');
  }

  let parsedValue: unknown;

  try {
    parsedValue = JSON.parse(rawValue);
  } catch {
    throw new Error('Кошик пошкоджено.');
  }

  if (!Array.isArray(parsedValue)) {
    throw new Error('Кошик пошкоджено.');
  }

  const cartItems: TCartInputItem[] = [];

  for (const entry of parsedValue) {
    if (typeof entry !== 'object' || entry === null) {
      throw new Error('Кошик пошкоджено.');
    }

    const menuItemId = 'menuItemId' in entry ? entry.menuItemId : null;
    const quantity = 'quantity' in entry ? entry.quantity : null;

    if (
      typeof menuItemId !== 'number' ||
      !Number.isInteger(menuItemId) ||
      typeof quantity !== 'number' ||
      !Number.isInteger(quantity)
    ) {
      throw new Error('Кошик пошкоджено.');
    }

    cartItems.push({ menuItemId, quantity });
  }

  return cartItems;
};
