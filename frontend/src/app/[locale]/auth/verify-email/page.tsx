'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useRouter, Link } from '@/i18n/navigation';
import { LanguageSwitcher } from '@/components/language-switcher';
import { setAccessToken } from '@/lib/api';
import axios from 'axios';

export default function VerifyEmailPage() {
  const t = useTranslations();
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      return;
    }

    axios
      .get(`${process.env.NEXT_PUBLIC_API_URL}/auth/verify-email?token=${token}`, {
        withCredentials: true,
      })
      .then(({ data }) => {
        setAccessToken(data.accessToken);
        setStatus('success');
        // Decode JWT to get role for redirect
        const payload = JSON.parse(atob(data.accessToken.split('.')[1]));
        const dashboardPath =
          payload.role === 'ADMIN'
            ? '/dashboard/admin'
            : payload.role === 'TEACHER'
              ? '/dashboard/teacher'
              : '/dashboard/student';
        setTimeout(() => router.push(dashboardPath), 2000);
      })
      .catch(() => {
        setStatus('error');
      });
  }, [token, router]);

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="flex items-center justify-between px-6 py-4">
        <Link href="/" className="text-xl font-bold text-blue-600">
          {t('common.appName')}
        </Link>
        <LanguageSwitcher />
      </nav>
      <div className="flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-md text-center">
          {status === 'loading' && (
            <>
              <h1 className="mb-4 text-2xl font-bold text-gray-900">
                {t('auth.verifyingEmail')}
              </h1>
              <p className="text-gray-500">{t('common.loading')}</p>
            </>
          )}
          {status === 'success' && (
            <>
              <div className="mb-4 text-5xl text-green-500">&#10003;</div>
              <h1 className="mb-4 text-2xl font-bold text-gray-900">
                {t('auth.emailVerified')}
              </h1>
              <p className="text-gray-600">{t('auth.redirecting')}</p>
            </>
          )}
          {status === 'error' && (
            <>
              <div className="mb-4 text-5xl text-red-500">&#10007;</div>
              <h1 className="mb-4 text-2xl font-bold text-gray-900">
                {t('auth.verificationFailed')}
              </h1>
              <p className="mb-6 text-gray-600">
                {t('auth.verificationFailedDesc')}
              </p>
              <Link
                href="/register/verify-email"
                className="text-blue-600 hover:underline"
              >
                {t('auth.resendVerification')}
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
