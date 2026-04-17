'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { getAppErrorMessage } from '@/lib/errors';

type TErrorPageProps = {
  error: Error & {
    digest?: string;
  };
  reset: () => void;
};

export default function ErrorPage({ error, reset }: TErrorPageProps) {
  return (
    <div className="py-8">
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="font-serif text-3xl">
            Не вдалося завантажити сторінку
          </CardTitle>
          <CardDescription className="text-base leading-7">
            {getAppErrorMessage(error)}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3 text-sm leading-6 text-muted-foreground">
          <p>Спробуйте оновити сторінку трохи пізніше.</p>
          <Button type="button" onClick={reset}>
            Спробувати ще раз
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
