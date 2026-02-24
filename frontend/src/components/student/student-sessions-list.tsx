'use client';

import { useTranslations } from 'next-intl';
import { useQuery } from '@tanstack/react-query';
import { Link } from '@/i18n/navigation';
import api from '@/lib/api';

interface Session {
  id: string;
  scheduledAt: string;
  durationMinutes: number;
  status: 'SCHEDULED' | 'LIVE' | 'DONE' | 'CANCELLED';
  group: {
    id: string;
    name: string;
    language: string;
    level: string;
  };
}

const STATUS_COLORS: Record<string, string> = {
  SCHEDULED: 'bg-blue-100 text-blue-800',
  LIVE: 'bg-green-100 text-green-800',
  DONE: 'bg-gray-100 text-gray-600',
  CANCELLED: 'bg-red-100 text-red-800',
};

export function StudentSessionsList() {
  const t = useTranslations();
  const tSessions = useTranslations('sessions');

  const { data: sessions, isLoading } = useQuery<Session[]>({
    queryKey: ['student', 'sessions'],
    queryFn: () => api.get('/sessions/student').then((r) => r.data),
    refetchInterval: 30000,
  });

  if (isLoading) {
    return <p className="text-gray-500">{t('common.loading')}</p>;
  }

  if (!sessions || sessions.length === 0) {
    return <p className="text-gray-500">{t('student.noSessions')}</p>;
  }

  const live = sessions.filter((s) => s.status === 'LIVE');
  const scheduled = sessions.filter((s) => s.status === 'SCHEDULED');

  return (
    <div className="space-y-4">
      {live.map((session) => (
        <div
          key={session.id}
          className="rounded-xl border-l-4 border-l-green-500 bg-white p-6 shadow-sm"
        >
          <div className="mb-3 flex items-center gap-2 rounded bg-green-50 px-3 py-2 text-sm text-green-700">
            <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-green-500" />
            {tSessions('liveNow')}
          </div>
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-medium text-gray-900">{session.group.name}</h3>
              <p className="mt-1 text-sm text-gray-600">
                {new Date(session.scheduledAt).toLocaleString()}
              </p>
              <p className="text-sm text-gray-500">
                {tSessions('durationMinutes', { count: session.durationMinutes })}
              </p>
            </div>
            <Link
              href={`/dashboard/student/sessions/${session.id}`}
              className="rounded-lg bg-green-600 px-4 py-2 text-sm text-white hover:bg-green-700 transition-colors"
            >
              {tSessions('joinSession')}
            </Link>
          </div>
        </div>
      ))}

      {scheduled.map((session) => (
        <div key={session.id} className="rounded-xl bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-medium text-gray-900">{session.group.name}</h3>
              <p className="mt-1 text-sm text-gray-600">
                {new Date(session.scheduledAt).toLocaleString()}
              </p>
              <p className="text-sm text-gray-500">
                {tSessions('durationMinutes', { count: session.durationMinutes })}
              </p>
            </div>
            <span
              className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${STATUS_COLORS[session.status]}`}
            >
              {tSessions(`status.${session.status}`)}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
