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
  audienceType: string;
  maxStudents: number;
  pricePerSession: string;
  _count: { memberships: number };
}

const LANGUAGES = ['french', 'english', 'arabic', 'german', 'spanish', 'italian'];
const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
const AUDIENCES = ['kids', 'adults', 'workers', 'elderly'];

export function TeacherGroupsManager() {
  const t = useTranslations();
  const tLang = useTranslations('languageOptions');
  const tLevel = useTranslations('levelOptions');
  const tAudience = useTranslations('audienceOptions');
  const queryClient = useQueryClient();

  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { data: groupsResponse, isLoading } = useQuery<{ groups: Group[]; pendingMemberships: number }>({
    queryKey: ['teacher', 'groups'],
    queryFn: () => api.get('/groups/teacher').then((r) => r.data),
  });

  const groups = groupsResponse?.groups;

  const createMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => api.post('/groups', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher', 'groups'] });
      setShowForm(false);
      setSuccess(t('groups.groupCreated'));
      setError('');
      setTimeout(() => setSuccess(''), 3000);
    },
    onError: () => setError(t('common.error')),
  });

  const deactivateMutation = useMutation({
    mutationFn: (groupId: string) => api.delete(`/groups/${groupId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher', 'groups'] });
      setSuccess(t('groups.groupDeactivated'));
      setTimeout(() => setSuccess(''), 3000);
    },
  });

  function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    createMutation.mutate({
      name: formData.get('name') as string,
      language: formData.get('language') as string,
      level: formData.get('level') as string,
      audienceType: formData.get('audienceType') as string,
      maxStudents: Number(formData.get('maxStudents')),
      pricePerSession: Number(formData.get('pricePerSession')),
    });
  }

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
          className="mb-6 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 transition-colors"
        >
          {t('groups.create')}
        </button>
      ) : (
        <div className="mb-6 rounded-xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            {t('groups.createTitle')}
          </h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  {t('groups.name')}
                </label>
                <input
                  name="name"
                  required
                  minLength={2}
                  maxLength={100}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  {t('groups.language')}
                </label>
                <select
                  name="language"
                  required
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  {LANGUAGES.map((lang) => (
                    <option key={lang} value={lang}>
                      {tLang(lang)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  {t('groups.level')}
                </label>
                <select
                  name="level"
                  required
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  {LEVELS.map((level) => (
                    <option key={level} value={level}>
                      {tLevel(level)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  {t('groups.audienceType')}
                </label>
                <select
                  name="audienceType"
                  required
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  {AUDIENCES.map((aud) => (
                    <option key={aud} value={aud}>
                      {tAudience(aud)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  {t('groups.maxStudents')}
                </label>
                <input
                  name="maxStudents"
                  type="number"
                  min={2}
                  max={30}
                  defaultValue={10}
                  required
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  {t('groups.pricePerSession')}
                </label>
                <input
                  name="pricePerSession"
                  type="number"
                  min={0.001}
                  step={0.001}
                  required
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={createMutation.isPending}
                className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {t('groups.create')}
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

      {/* Groups list */}
      {isLoading ? (
        <p className="text-gray-500">{t('common.loading')}</p>
      ) : !groups || groups.length === 0 ? (
        <p className="text-gray-500">{t('groups.noGroups')}</p>
      ) : (
        <div className="space-y-4">
          {groups.map((group) => (
            <div key={group.id} className="rounded-xl bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">{group.name}</h3>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <span className="inline-block rounded bg-blue-50 px-2 py-0.5 text-xs text-blue-700">
                      {tLang(group.language)}
                    </span>
                    <span className="inline-block rounded bg-purple-50 px-2 py-0.5 text-xs text-purple-700">
                      {tLevel(group.level)}
                    </span>
                    <span className="inline-block rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                      {tAudience(group.audienceType)}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-gray-600">
                    {t('groups.membersCount', {
                      count: group._count.memberships,
                      max: group.maxStudents,
                    })}
                  </p>
                  <p className="text-sm text-gray-500">
                    {Number(group.pricePerSession).toFixed(3)} DT
                  </p>
                </div>
                <div className="flex gap-2">
                  <Link
                    href={`/dashboard/teacher/groups/${group.id}`}
                    className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    {t('groups.manageMembers')}
                  </Link>
                  <button
                    onClick={() => {
                      if (confirm(t('groups.deactivate') + '?')) {
                        deactivateMutation.mutate(group.id);
                      }
                    }}
                    className="rounded-lg border border-red-200 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    {t('groups.deactivate')}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
