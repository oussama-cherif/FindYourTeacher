'use client';

import { useTranslations } from 'next-intl';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from '@/i18n/navigation';
import api from '@/lib/api';

interface SessionDetail {
  id: string;
  scheduledAt: string;
  durationMinutes: number;
  jitsiRoomId: string;
  jitsiUrl: string;
  status: 'SCHEDULED' | 'LIVE' | 'DONE' | 'CANCELLED';
  isTeacher: boolean;
  group: {
    id: string;
    name: string;
    language: string;
    level: string;
  };
}

export function SessionRoom({
  sessionId,
  backHref,
}: {
  sessionId: string;
  backHref: string;
}) {
  const t = useTranslations();
  const tSessions = useTranslations('sessions');
  const queryClient = useQueryClient();

  const { data: session, isLoading } = useQuery<SessionDetail>({
    queryKey: ['session', sessionId],
    queryFn: () => api.get(`/sessions/${sessionId}`).then((r) => r.data),
    refetchInterval: 10000,
  });

  const startMutation = useMutation({
    mutationFn: () => api.patch(`/sessions/${sessionId}/start`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['session', sessionId] });
    },
  });

  const endMutation = useMutation({
    mutationFn: () => api.patch(`/sessions/${sessionId}/end`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['session', sessionId] });
    },
  });

  if (isLoading) {
    return <p className="text-gray-500">{t('common.loading')}</p>;
  }

  if (!session) {
    return <p className="text-gray-500">{t('common.error')}</p>;
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <Link
            href={backHref}
            className="text-sm text-blue-600 hover:underline"
          >
            {t('common.back')}
          </Link>
          <h1 className="mt-1 text-xl font-bold text-gray-900">
            {session.group.name}
          </h1>
          <p className="text-sm text-gray-500">
            {new Date(session.scheduledAt).toLocaleString()} —{' '}
            {tSessions('durationMinutes', { count: session.durationMinutes })}
          </p>
        </div>

        {session.isTeacher && session.status === 'SCHEDULED' && (
          <button
            onClick={() => startMutation.mutate()}
            disabled={startMutation.isPending}
            className="rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:opacity-50 transition-colors"
          >
            {tSessions('startSession')}
          </button>
        )}

        {session.isTeacher && session.status === 'LIVE' && (
          <button
            onClick={() => endMutation.mutate()}
            disabled={endMutation.isPending}
            className="rounded-lg bg-gray-600 px-4 py-2 text-white hover:bg-gray-700 disabled:opacity-50 transition-colors"
          >
            {tSessions('endSession')}
          </button>
        )}
      </div>

      {session.status === 'LIVE' && (
        <div className="overflow-hidden rounded-xl border border-gray-200 shadow-sm">
          <iframe
            src={session.jitsiUrl}
            allow="camera; microphone; fullscreen; display-capture; autoplay; clipboard-write"
            className="h-[70vh] w-full"
            title="Jitsi Meet"
          />
        </div>
      )}

      {session.status === 'SCHEDULED' && (
        <div className="rounded-xl bg-blue-50 p-8 text-center">
          <p className="text-lg text-blue-700">{tSessions('notStarted')}</p>
          <p className="mt-2 text-sm text-blue-500">
            {tSessions('scheduledFor', {
              date: new Date(session.scheduledAt).toLocaleString(),
            })}
          </p>
        </div>
      )}

      {session.status === 'DONE' && (
        <div className="rounded-xl bg-gray-50 p-8 text-center">
          <p className="text-lg text-gray-600">{tSessions('ended')}</p>
        </div>
      )}

      {session.status === 'CANCELLED' && (
        <div className="rounded-xl bg-red-50 p-8 text-center">
          <p className="text-lg text-red-600">{tSessions('cancelled')}</p>
        </div>
      )}
    </div>
  );
}
