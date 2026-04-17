import {
  boolean,
  jsonb,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';

export const menuItems = pgTable('menu_items', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 120 }).notNull().unique(),
  description: text('description').notNull(),
  category: varchar('category', { length: 80 }).notNull(),
  price: integer('price').notNull(),
});

export const orders = pgTable('orders', {
  id: serial('id').primaryKey(),
  customerName: varchar('customer_name', { length: 120 }).notNull(),
  customerAddress: text('customer_address').notNull(),
  status: varchar('status', { length: 32 }).notNull(),
  subtotal: integer('subtotal').notNull(),
  discountAmount: integer('discount_amount').notNull(),
  deliveryFee: integer('delivery_fee').notNull(),
  total: integer('total').notNull(),
  deliveryPluginKey: varchar('delivery_plugin_key', { length: 80 }),
  promoPluginKey: varchar('promo_plugin_key', { length: 80 }),
  paymentPluginKey: varchar('payment_plugin_key', { length: 80 }),
  paymentMethod: varchar('payment_method', { length: 120 }).notNull(),
  isPaid: boolean('is_paid').notNull().default(false),
  paymentReference: varchar('payment_reference', { length: 120 }),
  createdAt: timestamp('created_at', {
    withTimezone: true,
    mode: 'string',
  })
    .defaultNow()
    .notNull(),
});

export const orderItems = pgTable('order_items', {
  id: serial('id').primaryKey(),
  orderId: integer('order_id')
    .notNull()
    .references(() => orders.id, { onDelete: 'cascade' }),
  menuItemId: integer('menu_item_id').notNull(),
  itemName: varchar('item_name', { length: 120 }).notNull(),
  quantity: integer('quantity').notNull(),
  unitPrice: integer('unit_price').notNull(),
  lineTotal: integer('line_total').notNull(),
});

export const pluginSettings = pgTable('plugin_settings', {
  pluginKey: varchar('plugin_key', { length: 80 }).primaryKey(),
  pluginType: varchar('plugin_type', { length: 32 }).notNull(),
  pluginLabel: varchar('plugin_label', { length: 120 }).notNull(),
  enabled: boolean('enabled').notNull().default(true),
  configValues: jsonb('config_values').notNull().default({}),
});
