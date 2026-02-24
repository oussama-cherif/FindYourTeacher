'use client';

import { useTranslations } from 'next-intl';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

interface OnboardingCall {
  id: string;
  scheduledAt: string;
  status: 'PENDING' | 'CONFIRMED' | 'DONE' | 'CANCELLED';
  studentNotes: string | null;
  slot: { dayOfWeek: number; startTime: string; endTime: string };
  teacher: { id: string; fullName: string; avatarUrl: string | null };
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  CONFIRMED: 'bg-green-100 text-green-800',
  DONE: 'bg-gray-100 text-gray-600',
  CANCELLED: 'bg-red-100 text-red-800',
};

const CARD_BORDER: Record<string, string> = {
  PENDING: '',
  CONFIRMED: 'border-l-4 border-l-green-500',
  DONE: '',
  CANCELLED: 'border-l-4 border-l-red-400',
};

const STATUS_ORDER: Record<string, number> = {
  CONFIRMED: 0,
  PENDING: 1,
  DONE: 2,
  CANCELLED: 3,
};

export function StudentCallsList() {
  const t = useTranslations();
  const tDays = useTranslations('days');
  const tStatus = useTranslations('student.callStatus');
  const queryClient = useQueryClient();

  const { data: calls, isLoading } = useQuery<OnboardingCall[]>({
    queryKey: ['student', 'calls'],
    queryFn: () => api.get('/onboarding/student').then((r) => r.data),
  });

  const cancelMutation = useMutation({
    mutationFn: (callId: string) => api.patch(`/onboarding/${callId}/cancel`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student', 'calls'] });
    },
  });

  if (isLoading) {
    return <p className="text-gray-500">{t('common.loading')}</p>;
  }

  if (!calls || calls.length === 0) {
    return <p className="text-gray-500">{t('student.noCallsYet')}</p>;
  }

  const sorted = [...calls].sort(
    (a, b) => (STATUS_ORDER[a.status] ?? 9) - (STATUS_ORDER[b.status] ?? 9),
  );

  return (
    <div className="space-y-4">
      {sorted.map((call) => (
        <div
          key={call.id}
          className={`rounded-xl bg-white p-6 shadow-sm ${CARD_BORDER[call.status] ?? ''}`}
        >
          {call.status === 'CONFIRMED' && (
            <div className="mb-3 rounded bg-green-50 px-3 py-2 text-sm text-green-700">
              {t('student.callConfirmedBanner')}
            </div>
          )}
          {call.status === 'CANCELLED' && (
            <div className="mb-3 rounded bg-red-50 px-3 py-2 text-sm text-red-700">
              {t('student.callCancelledBanner')}
            </div>
          )}

          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-700 font-semibold">
                  {call.teacher.fullName.charAt(0)}
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {call.teacher.fullName}
                  </p>
                  <p className="text-sm text-gray-500">
                    {tDays(String(call.slot.dayOfWeek))} {call.slot.startTime} - {call.slot.endTime}
                  </p>
                </div>
              </div>
              <p className="mt-2 text-sm text-gray-600">
                {new Date(call.scheduledAt).toLocaleDateString()}
              </p>
              {call.studentNotes && (
                <p className="mt-1 text-sm text-gray-500 italic">
                  {call.studentNotes}
                </p>
              )}
            </div>
            <div className="flex items-center gap-3">
              <span
                className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${STATUS_COLORS[call.status]}`}
              >
                {tStatus(call.status)}
              </span>
              {call.status === 'PENDING' && (
                <button
                  onClick={() => cancelMutation.mutate(call.id)}
                  disabled={cancelMutation.isPending}
                  className="text-sm text-red-600 hover:text-red-800 disabled:opacity-50"
                >
                  {t('student.cancelCall')}
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
