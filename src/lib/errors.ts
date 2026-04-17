export const getAppErrorMessage = (error: unknown): string => {
  if (
    error instanceof Error &&
    error.message === 'DATABASE_URL is not configured.'
  ) {
    return 'Тимчасово не вдалося підключитися до сервісу.';
  }

  return 'Під час завантаження даних сталася помилка.';
};
