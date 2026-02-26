'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useQuery, useMutation } from '@tanstack/react-query';
import api from '@/lib/api';

interface GroupBalance {
  groupId: string;
  groupName: string;
  remaining: number;
  total: number;
}

interface Purchase {
  id: string;
  groupId: string;
  totalCredits: number;
  usedCredits: number;
  amountPaid: string;
  platformFee: string;
  teacherNet: string;
  status: string;
  paidAt: string | null;
  createdAt: string;
  group: { id: string; name: string; language: string; level: string };
}

interface Group {
  id: string;
  name: string;
  language: string;
  level: string;
  pricePerSession: string;
  platformFee: string;
}

export function StudentPayments() {
  const t = useTranslations();
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [creditCount, setCreditCount] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['student', 'credits'],
    queryFn: () => api.get('/payments/student').then((r) => r.data),
  });

  const { data: groups } = useQuery({
    queryKey: ['student', 'groups'],
    queryFn: () => api.get('/groups/mine').then((r) => r.data),
  });

  const buyMutation = useMutation({
    mutationFn: (payload: { groupId: string; credits: number }) =>
      api.post('/payments/buy-credits', payload).then((r) => r.data),
    onSuccess: (data) => {
      window.location.href = data.paymentUrl;
    },
  });

  const activeGroups: Group[] =
    (groups ?? [])
      .filter((m: { status: string; group: Group }) => m.status === 'ACTIVE')
      .map((m: { group: Group }) => m.group) ?? [];

  const selectedGroup = activeGroups.find((g) => g.id === selectedGroupId);
  const pricePerSession = selectedGroup
    ? Number(selectedGroup.pricePerSession)
    : 0;
  const totalPrice = pricePerSession * creditCount;

  const balances: GroupBalance[] = data?.balances ?? [];
  const purchases: Purchase[] = data?.purchases ?? [];

  if (isLoading) {
    return <p className="text-gray-500">{t('common.loading')}</p>;
  }

  return (
    <div className="space-y-8">
      {/* Buy Credits */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          {t('payments.buyCredits')}
        </h2>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('sessions.selectGroup')}
            </label>
            <select
              value={selectedGroupId}
              onChange={(e) => setSelectedGroupId(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="">--</option>
              {activeGroups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name} ({g.language} - {g.level})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('payments.selectCredits')}
            </label>
            <select
              value={creditCount}
              onChange={(e) => setCreditCount(Number(e.target.value))}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            >
              {[1, 2, 3, 4].map((n) => (
                <option key={n} value={n}>
                  {t('payments.creditCount', { count: n })}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col justify-end">
            {selectedGroup && (
              <p className="text-sm text-gray-600 mb-2">
                {t('payments.totalAmount', {
                  amount: totalPrice.toFixed(3),
                })}
              </p>
            )}
            <button
              onClick={() => {
                if (!selectedGroupId) return;
                buyMutation.mutate({
                  groupId: selectedGroupId,
                  credits: creditCount,
                });
              }}
              disabled={!selectedGroupId || buyMutation.isPending}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {buyMutation.isPending
                ? t('common.loading')
                : t('payments.payNow')}
            </button>
          </div>
        </div>

        {buyMutation.isError && (
          <p className="mt-2 text-sm text-red-600">{t('common.error')}</p>
        )}
      </div>

      {/* Credit Balances */}
      {balances.length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {t('payments.yourCredits')}
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {balances.map((b) => (
              <div
                key={b.groupId}
                className="rounded-lg border border-gray-100 bg-gray-50 p-4"
              >
                <p className="font-medium text-gray-900">{b.groupName}</p>
                <p className="text-sm text-green-600">
                  {t('payments.remaining', { count: b.remaining })}
                </p>
                <p className="text-xs text-gray-500">
                  {t('payments.used', { count: b.total - b.remaining })}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Purchase History */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          {t('payments.purchaseHistory')}
        </h2>

        {purchases.length === 0 ? (
          <p className="text-gray-500">{t('payments.noPayments')}</p>
        ) : (
          <div className="space-y-3">
            {purchases.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between rounded-lg border border-gray-100 p-4"
              >
                <div>
                  <p className="font-medium text-gray-900">
                    {p.group.name} — {p.totalCredits} {t('payments.credits')}
                  </p>
                  <p className="text-sm text-gray-500">
                    {new Date(p.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium">
                    {Number(p.amountPaid).toFixed(3)} DT
                  </p>
                  <span
                    className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                      p.status === 'PAID'
                        ? 'bg-green-100 text-green-700'
                        : p.status === 'PENDING'
                          ? 'bg-yellow-100 text-yellow-700'
                          : p.status === 'FAILED'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {t(`payments.paymentStatus.${p.status}`)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
