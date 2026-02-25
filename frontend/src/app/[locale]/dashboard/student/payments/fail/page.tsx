'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

export default function PaymentFailPage() {
  const t = useTranslations();

  return (
    <div className="flex flex-col items-center justify-center py-16">
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
      <p className="text-gray-500 mb-4">{t('payments.retryPayment')}</p>
      <Link
        href="/dashboard/student/payments"
        className="text-blue-600 hover:underline"
      >
        {t('common.back')}
      </Link>
    </div>
  );
}
