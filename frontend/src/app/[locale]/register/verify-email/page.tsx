'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { LanguageSwitcher } from '@/components/language-switcher';
import axios from 'axios';

export default function VerifyEmailPendingPage() {
  const t = useTranslations();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') ?? '';
  const [resent, setResent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleResend() {
    if (!email) return;
    setLoading(true);
    setError('');
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/resend-verification`,
        { email },
      );
      setResent(true);
    } catch {
      setError(t('common.error'));
    } finally {
      setLoading(false);
    }
  }

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
          <div className="mb-4 text-5xl">
            &#9993;
          </div>
          <h1 className="mb-4 text-2xl font-bold text-gray-900">
            {t('auth.checkYourEmail')}
          </h1>
          <p className="mb-2 text-gray-600">
            {t('auth.verificationSent')}
          </p>
          {email && (
            <p className="mb-6 font-medium text-gray-800">{email}</p>
          )}
          <p className="mb-6 text-sm text-gray-500">
            {t('auth.verificationExpiry')}
          </p>
          {error && (
            <div className="mb-4 rounded bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}
          {resent ? (
            <p className="text-sm text-green-600 font-medium">
              {t('auth.verificationResent')}
            </p>
          ) : (
            <button
              onClick={handleResend}
              disabled={loading || !email}
              className="text-sm text-blue-600 hover:underline disabled:opacity-50"
            >
              {loading ? t('common.loading') : t('auth.resendVerification')}
            </button>
          )}
          <div className="mt-6">
            <Link
              href="/login"
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              {t('auth.backToLogin')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
