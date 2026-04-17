import { getCourierDashboard } from '@/bff/courier-bff';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default async function CourierPage() {
  const dashboard = await getCourierDashboard();

  return (
    <div className="space-y-8">
      <Card className="border-none bg-transparent shadow-none">
        <CardHeader className="px-0 pt-0">
          <CardTitle className="font-serif text-3xl">
            Замовлення для доставки
          </CardTitle>
          <CardDescription className="text-base leading-7">
            Адреси клієнтів, статуси та суми для швидкої обробки замовлень.
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid gap-4">
        {dashboard.orders.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center text-sm text-muted-foreground">
              Поки що немає замовлень для доставки.
            </CardContent>
          </Card>
        ) : (
          dashboard.orders.map((order) => (
            <Card key={order.id}>
              <CardContent className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium text-foreground">#{order.id}</p>
                    <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-foreground">
                      {order.statusLabel}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {order.customerName} • {order.createdAtLabel}
                  </p>
                  <p className="text-sm leading-6 text-foreground">
                    {order.customerAddress}
                  </p>
                </div>

                <div className="grid gap-3 text-sm sm:min-w-64">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Оплата</span>
                    <span className="font-medium text-foreground">
                      {order.paymentMethodLabel}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Статус оплати</span>
                    <span className="font-medium text-foreground">
                      {order.paymentStatusLabel}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Позиції</span>
                    <span className="font-medium text-foreground">
                      {order.itemCountLabel}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Доставка</span>
                    <span className="font-medium text-foreground">
                      {order.deliveryFeeLabel}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Разом</span>
                    <span className="font-medium text-foreground">
                      {order.totalLabel}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
