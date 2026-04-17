import { getCourierDashboard } from '@/bff/courier-bff';

export async function GET() {
  try {
    return Response.json(await getCourierDashboard());
  } catch {
    return Response.json(
      { message: 'Не вдалося завантажити дані.' },
      { status: 500 },
    );
  }
}
