'use client';

import { useTranslations } from 'next-intl';
import { useQuery } from '@tanstack/react-query';
import { Link } from '@/i18n/navigation';
import api from '@/lib/api';

export default function AdminDashboardPage() {
  const t = useTranslations();

  const { data: pending } = useQuery({
    queryKey: ['admin', 'pending-reviews'],
    queryFn: () =>
      api.get('/recommendations/admin/pending').then((r) => r.data),
  });

  const pendingCount = pending?.length ?? 0;

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">
        {t('admin.dashboard')}
      </h1>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Link
          href="/dashboard/admin/reviews"
          className="rounded-lg border border-gray-200 bg-white p-6 hover:border-blue-300 transition-colors"
        >
          <p className="text-sm font-medium text-gray-500">
            {t('admin.pendingReviews')}
          </p>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            {pendingCount}
          </p>
        </Link>
      </div>
    </div>
  );
}
