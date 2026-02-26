'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

interface RecommendationFormProps {
  teacherId: string;
  onSuccess?: () => void;
}

export function RecommendationForm({
  teacherId,
  onSuccess,
}: RecommendationFormProps) {
  const t = useTranslations('recommendations');
  const queryClient = useQueryClient();
  const [rating, setRating] = useState<number | null>(null);
  const [hoveredStar, setHoveredStar] = useState<number | null>(null);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const { data: existing } = useQuery({
    queryKey: ['recommendations', 'mine', teacherId],
    queryFn: () =>
      api.get(`/recommendations/mine/${teacherId}`).then((r) => r.data),
  });

  useEffect(() => {
    if (existing) {
      setRating(existing.rating ?? null);
      setComment(existing.comment ?? '');
    }
  }, [existing]);

  const mutation = useMutation({
    mutationFn: (data: {
      teacherId: string;
      rating?: number;
      comment?: string;
    }) => api.post('/recommendations', data).then((r) => r.data),
    onSuccess: () => {
      setSubmitted(true);
      queryClient.invalidateQueries({ queryKey: ['recommendations', 'teacher', teacherId] });
      onSuccess?.();
    },
  });

  if (submitted) {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 p-4">
        <p className="text-sm font-medium text-green-700">
          {t('reviewSubmitted')}
        </p>
        {comment && (
          <p className="text-xs text-green-600 mt-1">{t('pendingApproval')}</p>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <h3 className="text-sm font-semibold text-gray-900 mb-3">
        {existing ? t('editReview') : t('leaveReview')}
      </h3>

      {/* Star Rating */}
      <div className="mb-3">
        <label className="block text-sm text-gray-600 mb-1">
          {t('rating')} {t('optional')}
        </label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onMouseEnter={() => setHoveredStar(star)}
              onMouseLeave={() => setHoveredStar(null)}
              onClick={() => setRating(star === rating ? null : star)}
              className="text-2xl transition-colors"
            >
              <span
                className={
                  (hoveredStar ?? rating ?? 0) >= star
                    ? 'text-yellow-400'
                    : 'text-gray-300'
                }
              >
                ★
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Comment */}
      <div className="mb-3">
        <label className="block text-sm text-gray-600 mb-1">
          {t('comment')} {t('optional')}
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder={t('commentPlaceholder')}
          rows={3}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
      </div>

      {mutation.isError && (
        <p className="text-sm text-red-600 mb-2">
          {(mutation.error as Error & { response?: { data?: { message?: string } } })?.response?.data?.message ??
            t('ratingRequired')}
        </p>
      )}

      <button
        onClick={() => {
          mutation.mutate({
            teacherId,
            rating: rating ?? undefined,
            comment: comment.trim() || undefined,
          });
        }}
        disabled={mutation.isPending || (!rating && !comment.trim())}
        className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {t('submitReview')}
      </button>
    </div>
  );
}
