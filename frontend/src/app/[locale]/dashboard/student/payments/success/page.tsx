'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import api from '@/lib/api';

export default function PaymentSuccessPage() {
  const t = useTranslations();
  const searchParams = useSearchParams();
  const creditId = searchParams.get('creditId');
  const [status, setStatus] = useState<'verifying' | 'success' | 'failed'>(
    'verifying',
  );

  useEffect(() => {
    if (!creditId) {
      setStatus('failed');
      return;
    }

    api
      .post(`/payments/${creditId}/verify`)
      .then(({ data }) => {
        setStatus(data.status === 'PAID' ? 'success' : 'failed');
      })
      .catch(() => {
        setStatus('failed');
      });
  }, [creditId]);

  return (
    <div className="flex flex-col items-center justify-center py-16">
      {status === 'verifying' && (
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600 mx-auto" />
          <p className="text-lg text-gray-600">{t('payments.verifying')}</p>
        </div>
      )}

      {status === 'success' && (
        <div className="text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mx-auto">
            <svg
              className="h-8 w-8 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {t('payments.paymentSuccess')}
          </h2>
          <Link
            href="/dashboard/student/payments"
            className="text-blue-600 hover:underline"
          >
            {t('common.back')}
          </Link>
        </div>
      )}

      {status === 'failed' && (
        <div className="text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 mx-auto">
            <svg
              className="h-8 w-8 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {t('payments.paymentFailed')}
          </h2>
          <Link
            href="/dashboard/student/payments"
            className="text-blue-600 hover:underline"
          >
            {t('common.back')}
          </Link>
        </div>
      )}
    </div>
  );
}
