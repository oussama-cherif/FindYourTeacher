'use client';

import { useTranslations } from 'next-intl';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

interface Payment {
  id: string;
  totalCredits: number;
  usedCredits: number;
  teacherNet: string;
  amountPaid: string;
  platformFee: string;
  paidAt: string;
  group: { id: string; name: string };
  student: { id: string; fullName: string };
}

export function TeacherEarnings() {
  const t = useTranslations();

  const { data, isLoading } = useQuery({
    queryKey: ['teacher', 'earnings'],
    queryFn: () => api.get('/payments/teacher').then((r) => r.data),
  });

  if (isLoading) {
    return <p className="text-gray-500">{t('common.loading')}</p>;
  }

  const payments: Payment[] = data?.payments ?? [];
  const totalEarned = data?.totalEarned ?? '0';

  return (
    <div className="space-y-6">
      {/* Total Earnings Card */}
      <div className="rounded-lg border border-green-200 bg-green-50 p-6">
        <p className="text-sm font-medium text-green-700">
          {t('payments.earnings')}
        </p>
        <p className="mt-1 text-3xl font-bold text-green-900">
          {Number(totalEarned).toFixed(3)} DT
        </p>
      </div>

      {/* Payment List */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          {t('payments.purchaseHistory')}
        </h2>

        {payments.length === 0 ? (
          <p className="text-gray-500">{t('payments.noPayments')}</p>
        ) : (
          <div className="space-y-3">
            {payments.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between rounded-lg border border-gray-100 p-4"
              >
                <div>
                  <p className="font-medium text-gray-900">
                    {p.student.fullName}
                  </p>
                  <p className="text-sm text-gray-500">
                    {p.group.name} — {p.totalCredits} {t('payments.credits')}
                  </p>
                  <p className="text-xs text-gray-400">
                    {p.paidAt
                      ? t('payments.paidOn', {
                          date: new Date(p.paidAt).toLocaleDateString(),
                        })
                      : ''}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-green-600">
                    +{Number(p.teacherNet).toFixed(3)} DT
                  </p>
                  <p className="text-xs text-gray-400">
                    ({Number(p.platformFee).toFixed(3)} DT{' '}
                    {t('groups.priceLabel')})
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
