import { listOrdersWithItems } from '@/lib/db/repositories';
import { formatDateTime, formatPrice, getOrderStatusLabel } from '@/lib/format';

export type TCourierDashboard = Readonly<{
  endpoint: '/api/bff/courier';
  orders: TCourierOrderView[];
}>;

type TCourierOrderView = Readonly<{
  id: number;
  customerName: string;
  customerAddress: string;
  createdAtLabel: string;
  statusLabel: string;
  itemCountLabel: string;
  deliveryFeeLabel: string;
  totalLabel: string;
  paymentMethodLabel: string;
  paymentStatusLabel: string;
}>;

export const getCourierDashboard = async (): Promise<TCourierDashboard> => {
  const orders = await listOrdersWithItems();

  return {
    endpoint: '/api/bff/courier',
    orders: orders.map((order) => ({
      id: order.id,
      customerName: order.customerName,
      customerAddress: order.customerAddress,
      createdAtLabel: formatDateTime(order.createdAt),
      statusLabel: getOrderStatusLabel(order.status),
      itemCountLabel: `${order.items.reduce((total, item) => total + item.quantity, 0)} позицій`,
      deliveryFeeLabel: formatPrice(order.deliveryFee),
      totalLabel: formatPrice(order.total),
      paymentMethodLabel: order.paymentMethod,
      paymentStatusLabel: order.isPaid ? 'Оплачено' : 'Оплата при отриманні',
    })),
  };
};
