'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

interface OnboardingCall {
  id: string;
  scheduledAt: string;
  status: 'PENDING' | 'CONFIRMED' | 'DONE' | 'CANCELLED';
  studentNotes: string | null;
  slot: { dayOfWeek: number; startTime: string; endTime: string };
  student: { id: string; fullName: string; avatarUrl: string | null };
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  CONFIRMED: 'bg-green-100 text-green-800',
  DONE: 'bg-gray-100 text-gray-600',
  CANCELLED: 'bg-red-100 text-red-800',
};

export function TeacherCallsList() {
  const t = useTranslations();
  const tDays = useTranslations('days');
  const tStatus = useTranslations('student.callStatus');
  const queryClient = useQueryClient();
  const [success, setSuccess] = useState('');

  const { data: calls, isLoading } = useQuery<OnboardingCall[]>({
    queryKey: ['teacher', 'calls'],
    queryFn: () => api.get('/onboarding/teacher').then((r) => r.data),
  });

  const statusMutation = useMutation({
    mutationFn: ({ callId, status }: { callId: string; status: string }) =>
      api.patch(`/onboarding/${callId}/status`, { status }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['teacher', 'calls'] });
      setSuccess(
        variables.status === 'CONFIRMED'
          ? t('teacher.callConfirmed')
          : t('teacher.callCancelled'),
      );
      setTimeout(() => setSuccess(''), 3000);
    },
  });

  if (isLoading) {
    return <p className="text-gray-500">{t('common.loading')}</p>;
  }

  if (!calls || calls.length === 0) {
    return <p className="text-gray-500">{t('teacher.noCalls')}</p>;
  }

  return (
    <div>
      {success && (
        <div className="mb-4 rounded bg-green-50 p-3 text-sm text-green-600">
          {success}
        </div>
      )}

      <div className="space-y-4">
        {calls.map((call) => (
          <div key={call.id} className="rounded-xl bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-700 font-semibold">
                    {call.student.fullName.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {call.student.fullName}
                    </p>
                    <p className="text-sm text-gray-500">
                      {tDays(String(call.slot.dayOfWeek))} {call.slot.startTime}{' '}
                      - {call.slot.endTime}
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
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        statusMutation.mutate({
                          callId: call.id,
                          status: 'CONFIRMED',
                        })
                      }
                      disabled={statusMutation.isPending}
                      className="rounded bg-green-600 px-3 py-1 text-xs text-white hover:bg-green-700 disabled:opacity-50 transition-colors"
                    >
                      {t('teacher.confirmCall')}
                    </button>
                    <button
                      onClick={() =>
                        statusMutation.mutate({
                          callId: call.id,
                          status: 'CANCELLED',
                        })
                      }
                      disabled={statusMutation.isPending}
                      className="rounded bg-red-600 px-3 py-1 text-xs text-white hover:bg-red-700 disabled:opacity-50 transition-colors"
                    >
                      {t('teacher.cancelCall')}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
