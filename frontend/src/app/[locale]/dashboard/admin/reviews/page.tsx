'use client';

import { useTranslations } from 'next-intl';
import { PendingReviewsList } from '@/components/admin/pending-reviews-list';

export default function AdminReviewsPage() {
  const t = useTranslations();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">
        {t('admin.pendingReviews')}
      </h1>
      <PendingReviewsList />
    </div>
  );
}
