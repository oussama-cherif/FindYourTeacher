'use client';

import { useTranslations } from 'next-intl';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

interface Recommendation {
  id: string;
  rating: number | null;
  comment: string | null;
  createdAt: string;
  student: { id: string; fullName: string; avatarUrl: string | null };
}

interface RecommendationsListProps {
  teacherId: string;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="text-yellow-400">
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} className={i < rating ? 'text-yellow-400' : 'text-gray-300'}>
          ★
        </span>
      ))}
    </span>
  );
}

export function RecommendationsList({ teacherId }: RecommendationsListProps) {
  const t = useTranslations('recommendations');

  const { data, isLoading } = useQuery({
    queryKey: ['recommendations', teacherId],
    queryFn: () =>
      api.get(`/recommendations/teacher/${teacherId}`).then((r) => r.data),
  });

  if (isLoading) return null;

  const recommendations: Recommendation[] = data?.recommendations ?? [];
  const averageRating = data?.averageRating
    ? Number(data.averageRating)
    : null;
  const totalCount: number = data?.totalCount ?? 0;

  if (totalCount === 0) return null;

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="flex items-center gap-3">
        <h3 className="text-lg font-semibold text-gray-900">
          {t('yourReviews')}
        </h3>
        {averageRating !== null && (
          <div className="flex items-center gap-1">
            <StarRating rating={Math.round(averageRating)} />
            <span className="text-sm text-gray-600">
              ({averageRating.toFixed(1)})
            </span>
          </div>
        )}
        <span className="text-sm text-gray-500">
          {totalCount} {t('yourReviews').toLowerCase()}
        </span>
      </div>

      {/* List */}
      <div className="space-y-3">
        {recommendations.map((rec) => (
          <div
            key={rec.id}
            className="rounded-lg border border-gray-100 bg-gray-50 p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <p className="font-medium text-gray-900">
                {rec.student.fullName}
              </p>
              <span className="text-xs text-gray-400">
                {new Date(rec.createdAt).toLocaleDateString()}
              </span>
            </div>
            {rec.rating && (
              <div className="mb-1">
                <StarRating rating={rec.rating} />
              </div>
            )}
            {rec.comment && (
              <p className="text-sm text-gray-700">{rec.comment}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
