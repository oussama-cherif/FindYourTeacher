'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import api, { setAccessToken } from '@/lib/api';

export function LoginForm() {
  const t = useTranslations();
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      const { data } = await api.post('/auth/login', { email, password });
      setAccessToken(data.accessToken);
      // Decode JWT payload to get role for redirect
      const payload = JSON.parse(atob(data.accessToken.split('.')[1]));
      router.push(
        payload.role === 'TEACHER' ? '/dashboard/teacher' : '/dashboard/student',
      );
    } catch (err: unknown) {
      const axiosErr = err as { response?: { status?: number } };
      setError(
        axiosErr.response?.status === 401
          ? t('auth.invalidCredentials')
          : t('common.error'),
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700"
        >
          {t('common.email')}
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>
      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-gray-700"
        >
          {t('common.password')}
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
      >
        {loading ? t('common.loading') : t('common.login')}
      </button>
    </form>
  );
}
