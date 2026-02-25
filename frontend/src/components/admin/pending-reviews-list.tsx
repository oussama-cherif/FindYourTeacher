'use client';

import { useTranslations } from 'next-intl';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

interface PendingReview {
  id: string;
  rating: number | null;
  comment: string;
  createdAt: string;
  student: { id: string; fullName: string };
  teacher: { id: string; fullName: string };
}

export function PendingReviewsList() {
  const t = useTranslations();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'pending-reviews'],
    queryFn: () =>
      api.get('/recommendations/admin/pending').then((r) => r.data),
  });

  const approveMutation = useMutation({
    mutationFn: (id: string) =>
      api.patch(`/recommendations/admin/${id}/approve`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'pending-reviews'] });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/recommendations/admin/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'pending-reviews'] });
    },
  });

  if (isLoading) {
    return <p className="text-gray-500">{t('common.loading')}</p>;
  }

  const reviews: PendingReview[] = data ?? [];

  if (reviews.length === 0) {
    return (
      <p className="text-gray-500">{t('admin.noReviewsPending')}</p>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <div
          key={review.id}
          className="rounded-lg border border-gray-200 bg-white p-6"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-2">
                <div>
                  <span className="text-xs text-gray-500">
                    {t('admin.studentName')}:
                  </span>{' '}
                  <span className="font-medium text-gray-900">
                    {review.student.fullName}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-gray-500">
                    {t('admin.teacherName')}:
                  </span>{' '}
                  <span className="font-medium text-gray-900">
                    {review.teacher.fullName}
                  </span>
                </div>
              </div>

              {review.rating && (
                <div className="mb-2">
                  {Array.from({ length: 5 }, (_, i) => (
                    <span
                      key={i}
                      className={
                        i < review.rating!
                          ? 'text-yellow-400'
                          : 'text-gray-300'
                      }
                    >
                      ★
                    </span>
                  ))}
                </div>
              )}

              <p className="text-gray-700 bg-gray-50 rounded p-3 text-sm">
                {review.comment}
              </p>

              <p className="text-xs text-gray-400 mt-2">
                {new Date(review.createdAt).toLocaleDateString()}
              </p>
            </div>

            <div className="ml-4 flex flex-col gap-2">
              <button
                onClick={() => approveMutation.mutate(review.id)}
                disabled={approveMutation.isPending}
                className="rounded-md bg-green-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
              >
                {t('admin.approve')}
              </button>
              <button
                onClick={() => rejectMutation.mutate(review.id)}
                disabled={rejectMutation.isPending}
                className="rounded-md bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                {t('admin.reject')}
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
