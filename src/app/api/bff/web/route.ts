import { getWebDashboard } from '@/bff/web-bff';

export async function GET() {
  try {
    return Response.json(await getWebDashboard());
  } catch {
    return Response.json(
      { message: 'Не вдалося завантажити дані.' },
      { status: 500 },
    );
  }
}
