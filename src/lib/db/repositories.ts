import { desc, eq, inArray } from 'drizzle-orm';
import type {
  TOrderDraftItem,
  TOrderStatus,
  TPluginSetting,
} from '@/core/contracts';
import { db } from '@/lib/db/client';
import { menuItems, orderItems, orders, pluginSettings } from '@/lib/db/schema';

type TSaveOrderInput = Readonly<{
  customerName: string;
  customerAddress: string;
  status: TOrderStatus;
  subtotal: number;
  discountAmount: number;
  deliveryFee: number;
  total: number;
  deliveryPluginKey: string | null;
  promoPluginKey: string | null;
  paymentPluginKey: string | null;
  paymentMethod: string;
  isPaid: boolean;
  paymentReference: string | null;
  items: TOrderDraftItem[];
}>;

type TSaveMenuItemInput = Readonly<{
  name: string;
  description: string;
  category: string;
  price: number;
}>;

export const listMenuItems = async () => {
  return db.select().from(menuItems).orderBy(menuItems.id);
};

export const listPluginSettings = async (): Promise<TPluginSetting[]> => {
  const rows = await db
    .select()
    .from(pluginSettings)
    .orderBy(pluginSettings.pluginKey);

  return rows.map((row) => ({
    pluginKey: row.pluginKey,
    pluginType: normalizePluginType(row.pluginType),
    pluginLabel: row.pluginLabel,
    enabled: row.enabled,
    configValues: normalizeConfigValues(row.configValues),
  }));
};

export const savePluginSetting = async (setting: TPluginSetting) => {
  await db
    .insert(pluginSettings)
    .values(setting)
    .onConflictDoUpdate({
      target: pluginSettings.pluginKey,
      set: {
        pluginType: setting.pluginType,
        pluginLabel: setting.pluginLabel,
        enabled: setting.enabled,
        configValues: setting.configValues,
      },
    });
};

export const createMenuItem = async (input: TSaveMenuItemInput) => {
  const [createdMenuItem] = await db
    .insert(menuItems)
    .values(input)
    .returning();

  return createdMenuItem;
};

export const updateMenuItem = async (
  menuItemId: number,
  input: TSaveMenuItemInput,
) => {
  const [updatedMenuItem] = await db
    .update(menuItems)
    .set(input)
    .where(eq(menuItems.id, menuItemId))
    .returning();

  return updatedMenuItem ?? null;
};

export const deleteMenuItem = async (menuItemId: number) => {
  await db.delete(menuItems).where(eq(menuItems.id, menuItemId));
};

export const saveOrder = async (input: TSaveOrderInput) => {
  const [createdOrder] = await db
    .insert(orders)
    .values({
      customerName: input.customerName,
      customerAddress: input.customerAddress,
      status: input.status,
      subtotal: input.subtotal,
      discountAmount: input.discountAmount,
      deliveryFee: input.deliveryFee,
      total: input.total,
      deliveryPluginKey: input.deliveryPluginKey,
      promoPluginKey: input.promoPluginKey,
      paymentPluginKey: input.paymentPluginKey,
      paymentMethod: input.paymentMethod,
      isPaid: input.isPaid,
      paymentReference: input.paymentReference,
    })
    .returning({
      id: orders.id,
    });

  try {
    await db.insert(orderItems).values(
      input.items.map((item) => ({
        orderId: createdOrder.id,
        menuItemId: item.menuItemId,
        itemName: item.name,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        lineTotal: item.lineTotal,
      })),
    );
  } catch (error) {
    await db.delete(orders).where(eq(orders.id, createdOrder.id));
    throw error;
  }

  return createdOrder;
};

export const listOrdersWithItems = async () => {
  const orderRows = await db
    .select()
    .from(orders)
    .orderBy(desc(orders.createdAt));

  if (orderRows.length === 0) {
    return [];
  }

  const itemRows = await db
    .select()
    .from(orderItems)
    .where(
      inArray(
        orderItems.orderId,
        orderRows.map((order) => order.id),
      ),
    )
    .orderBy(orderItems.id);
  const itemsByOrderId = new Map<number, (typeof itemRows)[number][]>();

  for (const item of itemRows) {
    const currentItems = itemsByOrderId.get(item.orderId) ?? [];
    currentItems.push(item);
    itemsByOrderId.set(item.orderId, currentItems);
  }

  return orderRows.map((order) => ({
    ...order,
    status: normalizeOrderStatus(order.status),
    items: itemsByOrderId.get(order.id) ?? [],
  }));
};

const normalizePluginType = (value: string): TPluginSetting['pluginType'] => {
  if (value === 'delivery' || value === 'promo' || value === 'payment') {
    return value;
  }

  throw new Error(`Unsupported plugin type: ${value}`);
};

const normalizeOrderStatus = (value: string): TOrderStatus => {
  if (
    value === 'new' ||
    value === 'assigned' ||
    value === 'delivering' ||
    value === 'completed'
  ) {
    return value;
  }

  throw new Error(`Unsupported order status: ${value}`);
};

const normalizeConfigValues = (
  value: unknown,
): TPluginSetting['configValues'] => {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return {};
  }

  const configValues: Record<string, number> = {};

  for (const [key, entryValue] of Object.entries(value)) {
    if (typeof entryValue === 'number' && Number.isFinite(entryValue)) {
      configValues[key] = entryValue;
    }
  }

  return configValues;
};
