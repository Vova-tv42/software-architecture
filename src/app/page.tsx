import { getWebDashboard } from '@/bff/web-bff';
import { CustomerPageClient } from '@/components/customer-page-client';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default async function CustomerPage() {
  const dashboard = await getWebDashboard();

  return (
    <div className="space-y-8">
      <Card className="border-none bg-transparent shadow-none">
        <CardHeader className="px-0 pt-0">
          <CardTitle className="font-serif text-3xl">
            Оберіть страви та оформіть доставку
          </CardTitle>
          <CardDescription className="max-w-2xl text-base leading-7">
            Актуальне меню, швидке оформлення та підсумок замовлення в одному
            місці.
          </CardDescription>
        </CardHeader>
      </Card>

      <CustomerPageClient
        menuItems={dashboard.menuItems}
        checkoutRules={dashboard.checkoutRules}
      />
    </div>
  );
}
