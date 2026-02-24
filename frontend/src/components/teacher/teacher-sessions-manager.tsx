'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from '@/i18n/navigation';
import api from '@/lib/api';

interface Group {
  id: string;
  name: string;
  language: string;
  level: string;
}

interface Session {
  id: string;
  scheduledAt: string;
  durationMinutes: number;
  jitsiRoomId: string;
  status: 'SCHEDULED' | 'LIVE' | 'DONE' | 'CANCELLED';
  group: Group;
}

const DURATIONS = [15, 30, 45, 60, 90, 120];

const STATUS_COLORS: Record<string, string> = {
  SCHEDULED: 'bg-blue-100 text-blue-800',
  LIVE: 'bg-green-100 text-green-800',
  DONE: 'bg-gray-100 text-gray-600',
  CANCELLED: 'bg-red-100 text-red-800',
};

export function TeacherSessionsManager() {
  const t = useTranslations();
  const tSessions = useTranslations('sessions');
  const queryClient = useQueryClient();

  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { data: groupsResponse } = useQuery<{ groups: { id: string; name: string }[] }>({
    queryKey: ['teacher', 'groups'],
    queryFn: () => api.get('/groups/teacher').then((r) => r.data),
  });

  const groups = groupsResponse?.groups;

  const { data: sessions, isLoading } = useQuery<Session[]>({
    queryKey: ['teacher', 'sessions'],
    queryFn: () => api.get('/sessions/teacher').then((r) => r.data),
  });

  const createMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => api.post('/sessions', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher', 'sessions'] });
      setShowForm(false);
      setSuccess(tSessions('sessionScheduled'));
      setError('');
      setTimeout(() => setSuccess(''), 3000);
    },
    onError: () => setError(t('common.error')),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, action }: { id: string; action: string }) =>
      api.patch(`/sessions/${id}/${action}`),
    onSuccess: (_, { action }) => {
      queryClient.invalidateQueries({ queryKey: ['teacher', 'sessions'] });
      const msg =
        action === 'start'
          ? tSessions('sessionStarted')
          : action === 'end'
            ? tSessions('sessionEnded')
            : tSessions('sessionCancelled');
      setSuccess(msg);
      setTimeout(() => setSuccess(''), 3000);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/sessions/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher', 'sessions'] });
      setSuccess(tSessions('sessionDeleted'));
      setTimeout(() => setSuccess(''), 3000);
    },
  });

  function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    createMutation.mutate({
      groupId: formData.get('groupId') as string,
      scheduledAt: new Date(formData.get('scheduledAt') as string).toISOString(),
      durationMinutes: Number(formData.get('durationMinutes')),
    });
  }

  const upcoming = sessions?.filter((s) => s.status === 'LIVE' || s.status === 'SCHEDULED') ?? [];
  const past = sessions?.filter((s) => s.status === 'DONE' || s.status === 'CANCELLED') ?? [];

  return (
    <div>
      {success && (
        <div className="mb-4 rounded bg-green-50 p-3 text-sm text-green-600">
          {success}
        </div>
      )}
      {error && (
        <div className="mb-4 rounded bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Create button / form */}
      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          disabled={!groups || groups.length === 0}
          className="mb-6 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {tSessions('schedule')}
        </button>
      ) : (
        <div className="mb-6 rounded-xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            {tSessions('scheduleTitle')}
          </h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  {tSessions('selectGroup')}
                </label>
                <select
                  name="groupId"
                  required
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  {groups?.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  {tSessions('dateTime')}
                </label>
                <input
                  name="scheduledAt"
                  type="datetime-local"
                  required
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  {tSessions('duration')}
                </label>
                <select
                  name="durationMinutes"
                  defaultValue={60}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  {DURATIONS.map((d) => (
                    <option key={d} value={d}>
                      {tSessions('durationMinutes', { count: d })}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={createMutation.isPending}
                className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {tSessions('schedule')}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
              >
                {t('common.cancel')}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Sessions list */}
      {isLoading ? (
        <p className="text-gray-500">{t('common.loading')}</p>
      ) : !sessions || sessions.length === 0 ? (
        <p className="text-gray-500">{tSessions('noSessions')}</p>
      ) : (
        <>
          {/* Upcoming / Live */}
          {upcoming.length > 0 && (
            <div className="mb-8">
              <h2 className="mb-3 text-lg font-semibold text-gray-800">
                {tSessions('upcoming')}
              </h2>
              <div className="space-y-4">
                {upcoming.map((session) => (
                  <SessionCard
                    key={session.id}
                    session={session}
                    tSessions={tSessions}
                    t={t}
                    onAction={(action) =>
                      statusMutation.mutate({ id: session.id, action })
                    }
                    onDelete={() => deleteMutation.mutate(session.id)}
                    isPending={statusMutation.isPending || deleteMutation.isPending}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Past */}
          {past.length > 0 && (
            <div>
              <h2 className="mb-3 text-lg font-semibold text-gray-800">
                {tSessions('past')}
              </h2>
              <div className="space-y-4">
                {past.map((session) => (
                  <SessionCard
                    key={session.id}
                    session={session}
                    tSessions={tSessions}
                    t={t}
                    onAction={() => {}}
                    onDelete={() => {}}
                    isPending={false}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function SessionCard({
  session,
  tSessions,
  t,
  onAction,
  onDelete,
  isPending,
}: {
  session: Session;
  tSessions: ReturnType<typeof useTranslations>;
  t: ReturnType<typeof useTranslations>;
  onAction: (action: string) => void;
  onDelete: () => void;
  isPending: boolean;
}) {
  return (
    <div
      className={`rounded-xl bg-white p-6 shadow-sm ${
        session.status === 'LIVE' ? 'border-l-4 border-l-green-500' : ''
      }`}
    >
      {session.status === 'LIVE' && (
        <div className="mb-3 flex items-center gap-2 rounded bg-green-50 px-3 py-2 text-sm text-green-700">
          <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-green-500" />
          {tSessions('liveNow')}
        </div>
      )}

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

        <div className="flex items-center gap-3">
          <span
            className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${STATUS_COLORS[session.status]}`}
          >
            {tSessions(`status.${session.status}`)}
          </span>

          {session.status === 'SCHEDULED' && (
            <div className="flex gap-2">
              <button
                onClick={() => onAction('start')}
                disabled={isPending}
                className="rounded bg-green-600 px-3 py-1 text-xs text-white hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                {tSessions('startSession')}
              </button>
              <button
                onClick={() => onAction('cancel')}
                disabled={isPending}
                className="rounded bg-red-600 px-3 py-1 text-xs text-white hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                {tSessions('cancelSession')}
              </button>
              <button
                onClick={onDelete}
                disabled={isPending}
                className="text-xs text-gray-400 hover:text-gray-600 disabled:opacity-50 transition-colors"
              >
                {t('common.delete')}
              </button>
            </div>
          )}

          {session.status === 'LIVE' && (
            <div className="flex gap-2">
              <Link
                href={`/dashboard/teacher/sessions/${session.id}`}
                className="rounded bg-blue-600 px-3 py-1 text-xs text-white hover:bg-blue-700 transition-colors"
              >
                {tSessions('joinSession')}
              </Link>
              <button
                onClick={() => onAction('end')}
                disabled={isPending}
                className="rounded bg-gray-600 px-3 py-1 text-xs text-white hover:bg-gray-700 disabled:opacity-50 transition-colors"
              >
                {tSessions('endSession')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
