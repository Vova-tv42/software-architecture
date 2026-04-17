import {
  createMenuItemAction,
  deleteMenuItemAction,
  updatePluginStateAction,
  updatePluginConfigAction,
  updateMenuItemAction,
} from '@/actions/order-actions';
import { getAdminDashboard } from '@/bff/admin-bff';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';

export default async function AdminPage() {
  const dashboard = await getAdminDashboard();

  return (
    <div className="space-y-8">
      <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <Card>
          <CardHeader>
            <CardTitle className="pt-4 font-serif text-3xl">
              Налаштування сервісів
            </CardTitle>
            <CardDescription className="text-base leading-7">
              Увімкніть або вимкніть правила доставки, знижок та способів
              оплати.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-176 pr-4">
              <div className="space-y-3">
                {dashboard.plugins.map((plugin) => (
                  <div
                    key={plugin.key}
                    className="flex flex-col gap-3 rounded-3xl border border-border bg-background px-4 py-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <p className="font-medium text-foreground">
                          {plugin.label}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {plugin.typeLabel}
                        </p>
                      </div>
                      <p className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-foreground">
                        {plugin.stateLabel}
                      </p>
                    </div>

                    <p className="text-sm leading-6 text-muted-foreground">
                      {plugin.effectLabel}
                    </p>

                    {plugin.isEnabled && plugin.configFields.length > 0 ? (
                      <div className="space-y-2">
                        <form
                          action={updatePluginConfigAction}
                          className="grid gap-3"
                        >
                          <input
                            type="hidden"
                            name="pluginKey"
                            value={plugin.key}
                          />
                          <input
                            type="hidden"
                            name="pluginType"
                            value={plugin.type}
                          />
                          <input
                            type="hidden"
                            name="pluginLabel"
                            value={plugin.label}
                          />
                          <input
                            type="hidden"
                            name="enabled"
                            value={String(plugin.isEnabled)}
                          />
                          <div className="grid gap-3 sm:grid-cols-2">
                            {plugin.configFields.map((field) => (
                              <div key={field.key} className="space-y-2">
                                <label
                                  htmlFor={`${plugin.key}-${field.key}`}
                                  className="text-sm font-medium text-foreground"
                                >
                                  {field.label}
                                </label>
                                <div className="flex items-center gap-2">
                                  <Input
                                    id={`${plugin.key}-${field.key}`}
                                    name={`config.${field.key}`}
                                    type="number"
                                    min={String(field.min)}
                                    defaultValue={field.value}
                                  />
                                  {field.suffix ? (
                                    <span className="text-sm text-muted-foreground">
                                      {field.suffix}
                                    </span>
                                  ) : null}
                                </div>
                              </div>
                            ))}
                          </div>
                          <Button type="submit" className="justify-self-start">
                            Зберегти
                          </Button>
                        </form>
                      </div>
                    ) : null}

                    <div>
                      <form action={updatePluginStateAction}>
                        <input
                          type="hidden"
                          name="pluginKey"
                          value={plugin.key}
                        />
                        <input
                          type="hidden"
                          name="pluginType"
                          value={plugin.type}
                        />
                        <input
                          type="hidden"
                          name="pluginLabel"
                          value={plugin.label}
                        />
                        <input
                          type="hidden"
                          name="nextEnabled"
                          value={String(!plugin.isEnabled)}
                        />
                        <input
                          type="hidden"
                          name="configValues"
                          value={JSON.stringify(
                            Object.fromEntries(
                              plugin.configFields.map((field) => [
                                field.key,
                                field.value,
                              ]),
                            ),
                          )}
                        />
                        <Button
                          type="submit"
                          variant={plugin.isEnabled ? 'outline' : 'default'}
                        >
                          {plugin.isEnabled
                            ? 'Вимкнути плагін'
                            : 'Увімкнути плагін'}
                        </Button>
                      </form>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-serif text-3xl">Замовлення</CardTitle>
            <CardDescription className="text-base leading-7">
              Огляд поточних замовлень, клієнтів та сум до оплати.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {dashboard.orders.length === 0 ? (
              <p className="rounded-3xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
                Поки що замовлень немає.
              </p>
            ) : (
              <ScrollArea className="h-176">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Замовлення</TableHead>
                      <TableHead>Клієнт</TableHead>
                      <TableHead>Статус</TableHead>
                      <TableHead>Деталі</TableHead>
                      <TableHead className="text-right">Сума</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dashboard.orders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell>
                          <div className="space-y-1">
                            <p className="font-medium text-foreground">
                              #{order.id}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {order.createdAtLabel}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <p>{order.customerName}</p>
                            <p className="text-xs text-muted-foreground">
                              {order.itemCountLabel}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-foreground">
                            {order.statusLabel}
                          </span>
                        </TableCell>
                        <TableCell className="max-w-56">
                          <p className="text-sm text-muted-foreground">
                            {order.pluginLabel}
                          </p>
                        </TableCell>
                        <TableCell className="text-right font-medium text-foreground">
                          {order.totalLabel}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-serif text-3xl">Меню</CardTitle>
          <CardDescription className="text-base leading-7">
            Додавайте нові позиції, оновлюйте ціни та прибирайте неактуальні
            страви.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form
            action={createMenuItemAction}
            className="grid gap-4 rounded-3xl border border-border bg-background p-4 lg:grid-cols-[1fr_1fr_1fr_auto]"
          >
            <div className="space-y-2">
              <label
                htmlFor="new-name"
                className="text-sm font-medium text-foreground"
              >
                Назва
              </label>
              <Input
                id="new-name"
                name="name"
                placeholder="Наприклад, Том ям"
                required
              />
            </div>
            <div className="space-y-2">
              <label
                htmlFor="new-category"
                className="text-sm font-medium text-foreground"
              >
                Категорія
              </label>
              <Input
                id="new-category"
                name="category"
                placeholder="Супи"
                required
              />
            </div>
            <div className="space-y-2">
              <label
                htmlFor="new-price"
                className="text-sm font-medium text-foreground"
              >
                Ціна
              </label>
              <Input
                id="new-price"
                name="price"
                type="number"
                min="0"
                placeholder="210"
                required
              />
            </div>
            <div className="space-y-2 lg:self-end">
              <Button type="submit" className="w-full lg:w-auto">
                Додати позицію
              </Button>
            </div>
            <div className="space-y-2 lg:col-span-4">
              <label
                htmlFor="new-description"
                className="text-sm font-medium text-foreground"
              >
                Опис
              </label>
              <Textarea
                id="new-description"
                name="description"
                placeholder="Короткий опис страви для клієнта"
                required
              />
            </div>
          </form>

          {dashboard.menuItems.length === 0 ? (
            <p className="rounded-3xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
              У меню ще немає жодної позиції.
            </p>
          ) : (
            <div className="space-y-3">
              {dashboard.menuItems.map((menuItem) => (
                <form
                  key={menuItem.id}
                  action={updateMenuItemAction}
                  className="grid gap-4 rounded-3xl border border-border bg-background p-4 lg:grid-cols-[1fr_1fr_1fr_auto]"
                >
                  <input type="hidden" name="menuItemId" value={menuItem.id} />
                  <div className="space-y-2">
                    <label
                      htmlFor={`name-${menuItem.id}`}
                      className="text-sm font-medium text-foreground"
                    >
                      Назва
                    </label>
                    <Input
                      id={`name-${menuItem.id}`}
                      name="name"
                      defaultValue={menuItem.name}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label
                      htmlFor={`category-${menuItem.id}`}
                      className="text-sm font-medium text-foreground"
                    >
                      Категорія
                    </label>
                    <Input
                      id={`category-${menuItem.id}`}
                      name="category"
                      defaultValue={menuItem.category}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label
                      htmlFor={`price-${menuItem.id}`}
                      className="text-sm font-medium text-foreground"
                    >
                      Ціна
                    </label>
                    <Input
                      id={`price-${menuItem.id}`}
                      name="price"
                      type="number"
                      min="0"
                      defaultValue={menuItem.price}
                      required
                    />
                  </div>
                  <div className="flex gap-2 lg:self-end">
                    <Button type="submit">Зберегти</Button>
                    <Button formAction={deleteMenuItemAction} variant="outline">
                      Видалити
                    </Button>
                  </div>
                  <div className="space-y-2 lg:col-span-4">
                    <label
                      htmlFor={`description-${menuItem.id}`}
                      className="text-sm font-medium text-foreground"
                    >
                      Опис
                    </label>
                    <Textarea
                      id={`description-${menuItem.id}`}
                      name="description"
                      defaultValue={menuItem.description}
                      required
                    />
                  </div>
                </form>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
