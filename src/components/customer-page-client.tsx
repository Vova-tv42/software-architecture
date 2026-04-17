'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import {
  createOrderAction,
  type TOrderActionState,
} from '@/actions/order-actions';
import type { TWebDashboard, TWebMenuItem } from '@/bff/web-bff';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatPrice } from '@/lib/format';

type TCustomerPageClientProps = {
  menuItems: TWebMenuItem[];
  checkoutRules: TWebDashboard['checkoutRules'];
};

type TSelectedCartItem = {
  id: number;
  name: string;
  price: number;
  quantity: number;
};

export const CustomerPageClient = ({
  menuItems,
  checkoutRules,
}: TCustomerPageClientProps) => {
  const initialOrderActionState = {
    status: 'idle',
    message: '',
    orderId: null,
    summary: null,
  } satisfies TOrderActionState;
  const [cartState, setCartState] = useState<Record<number, number>>({});
  const [actionState, formAction, isPending] = useActionState(
    createOrderAction,
    initialOrderActionState,
  );
  const formRef = useRef<HTMLFormElement>(null);

  const selectedItems: TSelectedCartItem[] = menuItems
    .map((menuItem) => ({
      id: menuItem.id,
      name: menuItem.name,
      price: menuItem.price,
      quantity: cartState[menuItem.id] ?? 0,
    }))
    .filter((menuItem) => menuItem.quantity > 0);
  const subtotal = selectedItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );
  const discountAmount =
    checkoutRules.discountThreshold !== null &&
    subtotal >= checkoutRules.discountThreshold
      ? Math.round(subtotal * (checkoutRules.discountPercent / 100))
      : 0;
  const deliveryFee =
    subtotal === 0
      ? 0
      : checkoutRules.freeDeliveryThreshold !== null &&
          subtotal >= checkoutRules.freeDeliveryThreshold
        ? 0
        : checkoutRules.deliveryFee;
  const total = Math.max(subtotal - discountAmount + deliveryFee, 0);
  const amountUntilFreeDelivery =
    checkoutRules.freeDeliveryThreshold !== null
      ? Math.max(checkoutRules.freeDeliveryThreshold - subtotal, 0)
      : null;
  const amountUntilDiscount =
    checkoutRules.discountThreshold !== null
      ? Math.max(checkoutRules.discountThreshold - subtotal, 0)
      : null;
  const cartPayload = JSON.stringify(
    selectedItems.map((item) => ({
      menuItemId: item.id,
      quantity: item.quantity,
    })),
  );

  useEffect(() => {
    if (actionState.status !== 'success') {
      return;
    }

    formRef.current?.reset();
  }, [actionState.status]);

  const increaseItem = (menuItemId: number) => {
    setCartState((currentState) => ({
      ...currentState,
      [menuItemId]: (currentState[menuItemId] ?? 0) + 1,
    }));
  };

  const decreaseItem = (menuItemId: number) => {
    setCartState((currentState) => {
      const currentQuantity = currentState[menuItemId] ?? 0;

      if (currentQuantity <= 1) {
        const nextState = { ...currentState };
        delete nextState[menuItemId];
        return nextState;
      }

      return {
        ...currentState,
        [menuItemId]: currentQuantity - 1,
      };
    });
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
      <Card>
        <CardHeader>
          <CardTitle className="font-serif text-3xl">Меню</CardTitle>
          <CardDescription className="text-base leading-7">
            Доступні страви для замовлення просто зараз.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ScrollArea className="h-176 pr-4">
            <div className="space-y-3">
              {menuItems.map((menuItem) => {
                const quantity = cartState[menuItem.id] ?? 0;

                return (
                  <div
                    key={menuItem.id}
                    className="flex flex-col gap-4 rounded-3xl border border-border bg-background px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium text-foreground">
                          {menuItem.name}
                        </p>
                        <Badge variant="outline">{menuItem.category}</Badge>
                      </div>
                      <p className="max-w-xl text-sm leading-6 text-muted-foreground">
                        {menuItem.description}
                      </p>
                      <p className="text-sm font-medium text-foreground">
                        {menuItem.priceLabel}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => decreaseItem(menuItem.id)}
                      >
                        -
                      </Button>
                      <span className="min-w-8 text-center text-sm font-medium text-foreground">
                        {quantity}
                      </span>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => increaseItem(menuItem.id)}
                      >
                        +
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-serif text-3xl">Оформлення</CardTitle>
          <CardDescription className="text-base leading-7">
            Вкажіть дані для доставки та перевірте підсумок перед
            підтвердженням.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form ref={formRef} action={formAction} className="space-y-4">
            <input type="hidden" name="cartPayload" value={cartPayload} />

            <div className="space-y-2">
              <label
                className="text-sm font-medium text-foreground"
                htmlFor="customerName"
              >
                Ім&apos;я
              </label>
              <Input
                id="customerName"
                name="customerName"
                placeholder="Наприклад, Ірина"
                required
              />
            </div>

            <div className="space-y-2">
              <label
                className="text-sm font-medium text-foreground"
                htmlFor="customerAddress"
              >
                Адреса доставки
              </label>
              <Input
                id="customerAddress"
                name="customerAddress"
                placeholder="вул. Хрещатик, 10"
                required
              />
            </div>

            <div className="rounded-3xl border border-border bg-background px-4 py-4">
              <div className="mb-4 flex items-center justify-between">
                <p className="font-medium text-foreground">Кошик</p>
                <p className="text-sm text-muted-foreground">
                  {selectedItems.length === 0
                    ? 'Порожній'
                    : `${selectedItems.length} позицій`}
                </p>
              </div>

              {selectedItems.length === 0 ? (
                <p className="text-sm leading-6 text-muted-foreground">
                  Додайте хоча б одну позицію, щоб створити замовлення.
                </p>
              ) : (
                <div className="space-y-3">
                  {selectedItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between gap-4"
                    >
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {item.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {item.quantity} × {formatPrice(item.price)}
                        </p>
                      </div>
                      <p className="text-sm font-medium text-foreground">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  ))}
                  <div className="mt-4 space-y-3 border-t border-border pt-4">
                    {checkoutRules.freeDeliveryThreshold !== null ? (
                      <p className="text-xs leading-5 text-muted-foreground">
                        {amountUntilFreeDelivery === 0
                          ? 'Безкоштовна доставка вже застосована.'
                          : `Безкоштовна доставка від ${formatPrice(
                              checkoutRules.freeDeliveryThreshold ?? 0,
                            )}. До неї залишилось ${formatPrice(
                              amountUntilFreeDelivery ?? 0,
                            )}.`}
                      </p>
                    ) : null}
                    {checkoutRules.discountThreshold !== null ? (
                      <p className="text-xs leading-5 text-muted-foreground">
                        {amountUntilDiscount === 0
                          ? `Знижка ${checkoutRules.discountPercent}% вже застосована.`
                          : `Знижка ${checkoutRules.discountPercent}% діє від ${formatPrice(
                              checkoutRules.discountThreshold ?? 0,
                            )}. До неї залишилось ${formatPrice(
                              amountUntilDiscount ?? 0,
                            )}.`}
                      </p>
                    ) : null}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Проміжний підсумок
                      </span>
                      <span className="font-medium text-foreground">
                        {formatPrice(subtotal)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Знижка
                      </span>
                      <span className="font-medium text-foreground">
                        {discountAmount > 0
                          ? `−${formatPrice(discountAmount)}`
                          : formatPrice(0)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Доставка
                      </span>
                      <span className="font-medium text-foreground">
                        {deliveryFee === 0
                          ? 'Безкоштовно'
                          : formatPrice(deliveryFee)}
                      </span>
                    </div>
                    {checkoutRules.onlinePaymentAvailable ? (
                      <div className="space-y-3 border-t border-border pt-4">
                        <p className="text-sm font-medium text-foreground">
                          Спосіб оплати
                        </p>
                        <label className="flex items-start gap-3 rounded-2xl border border-border px-3 py-3">
                          <input
                            type="radio"
                            name="paymentMode"
                            value="cash_on_delivery"
                            defaultChecked
                            className="mt-1"
                          />
                          <span className="space-y-1">
                            <span className="block text-sm font-medium text-foreground">
                              Оплата при отриманні
                            </span>
                            <span className="block text-xs leading-5 text-muted-foreground">
                              Кур&apos;єр прийме оплату під час передачі
                              замовлення.
                            </span>
                          </span>
                        </label>
                        <label className="flex items-start gap-3 rounded-2xl border border-border px-3 py-3">
                          <input
                            type="radio"
                            name="paymentMode"
                            value="online"
                            className="mt-1"
                          />
                          <span className="space-y-1">
                            <span className="block text-sm font-medium text-foreground">
                              Оплатити онлайн
                            </span>
                            <span className="block text-xs leading-5 text-muted-foreground">
                              Замовлення буде позначене як оплачене ще до
                              доставки.
                            </span>
                          </span>
                        </label>
                      </div>
                    ) : (
                      <input
                        type="hidden"
                        name="paymentMode"
                        value="cash_on_delivery"
                      />
                    )}
                    <span className="text-sm text-muted-foreground">
                      Разом до сплати
                    </span>
                    <span className="font-medium text-foreground">
                      {formatPrice(total)}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isPending || selectedItems.length === 0}
            >
              {isPending ? 'Створюємо замовлення...' : 'Підтвердити замовлення'}
            </Button>
          </form>

          {actionState.status !== 'idle' ? (
            <div
              className={`rounded-3xl border px-4 py-4 text-sm leading-6 ${
                actionState.status === 'success'
                  ? 'border-success/30 bg-success/10 text-foreground'
                  : 'border-destructive/30 bg-destructive/10 text-foreground'
              }`}
            >
              <p className="font-medium">{actionState.message}</p>
              {actionState.summary ? (
                <div className="mt-3 grid gap-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Замовлення</span>
                    <span className="font-medium text-foreground">
                      #{actionState.orderId}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Підсумок</span>
                    <span className="font-medium text-foreground">
                      {actionState.summary.subtotalLabel}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Знижка</span>
                    <span className="font-medium text-foreground">
                      {actionState.summary.discountLabel}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Доставка</span>
                    <span className="font-medium text-foreground">
                      {actionState.summary.deliveryFeeLabel}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Оплата</span>
                    <span className="font-medium text-foreground">
                      {actionState.summary.paymentLabel}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Статус оплати</span>
                    <span className="font-medium text-foreground">
                      {actionState.summary.paymentStatusLabel}
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-t border-border pt-3">
                    <span className="text-muted-foreground">Разом</span>
                    <span className="font-medium text-foreground">
                      {actionState.summary.totalLabel}
                    </span>
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
};
