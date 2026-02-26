'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import api, { setAccessToken } from '@/lib/api';

export function RegisterForm() {
  const t = useTranslations();
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultRole = searchParams.get('role') === 'teacher' ? 'TEACHER' : 'STUDENT';
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const fullName = formData.get('fullName') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const phone = (formData.get('phone') as string) || undefined;
    const role = formData.get('role') as string;

    try {
      const { data } = await api.post('/auth/register', {
        fullName,
        email,
        password,
        phone,
        role,
      });
      setAccessToken(data.accessToken);
      router.push(role === 'TEACHER' ? '/dashboard/teacher' : '/dashboard/student');
    } catch (err: unknown) {
      const axiosErr = err as { response?: { status?: number } };
      setError(
        axiosErr.response?.status === 409
          ? t('auth.emailTaken')
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
          htmlFor="fullName"
          className="block text-sm font-medium text-gray-700"
        >
          {t('common.fullName')}
        </label>
        <input
          id="fullName"
          name="fullName"
          type="text"
          required
          minLength={2}
          className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>
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
          htmlFor="phone"
          className="block text-sm font-medium text-gray-700"
        >
          {t('common.phone')}
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          maxLength={20}
          placeholder="+216 XX XXX XXX"
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
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t('auth.selectRole')}
        </label>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="role"
              value="STUDENT"
              defaultChecked={defaultRole === 'STUDENT'}
              className="text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">
              {t('auth.roleStudent')}
            </span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="role"
              value="TEACHER"
              defaultChecked={defaultRole === 'TEACHER'}
              className="text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">
              {t('auth.roleTeacher')}
            </span>
          </label>
        </div>
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
      >
        {loading ? t('common.loading') : t('common.register')}
      </button>
    </form>
  );
}
