import { getAdminDashboard } from '@/bff/admin-bff';

export async function GET() {
  try {
    return Response.json(await getAdminDashboard());
  } catch {
    return Response.json(
      { message: 'Не вдалося завантажити дані.' },
      { status: 500 },
    );
  }
}
