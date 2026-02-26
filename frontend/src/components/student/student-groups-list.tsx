'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

interface GroupMembership {
  id: string;
  status: 'PENDING' | 'ACTIVE' | 'LEFT' | 'REMOVED';
  joinedAt: string;
  group: {
    id: string;
    name: string;
    language: string;
    level: string;
    audienceType: string;
    pricePerSession: string;
    isActive: boolean;
    teacher: {
      user: { id: string; fullName: string };
    };
  };
}

interface GroupBalance {
  groupId: string;
  groupName: string;
  remaining: number;
  total: number;
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  ACTIVE: 'bg-green-100 text-green-800',
  LEFT: 'bg-gray-100 text-gray-600',
  REMOVED: 'bg-red-100 text-red-800',
};

export function StudentGroupsList() {
  const t = useTranslations();
  const tLang = useTranslations('languageOptions');
  const tAudience = useTranslations('audienceOptions');
  const tStatus = useTranslations('student.membershipStatus');
  const queryClient = useQueryClient();

  const { data: memberships, isLoading } = useQuery<GroupMembership[]>({
    queryKey: ['student', 'groups', 'mine'],
    queryFn: () => api.get('/groups/mine').then((r) => r.data),
  });

  const { data: creditsData } = useQuery({
    queryKey: ['student', 'credits'],
    queryFn: () => api.get('/payments/student').then((r) => r.data),
  });

  const balances: GroupBalance[] = creditsData?.balances ?? [];
  const getGroupBalance = (groupId: string) =>
    balances.find((b) => b.groupId === groupId);

  const leaveMutation = useMutation({
    mutationFn: (groupId: string) => api.patch(`/groups/${groupId}/leave`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student', 'groups', 'mine'] });
    },
  });

  if (isLoading) {
    return <p className="text-gray-500">{t('common.loading')}</p>;
  }

  if (!memberships || memberships.length === 0) {
    return <p className="text-gray-500">{t('student.noGroupsYet')}</p>;
  }

  return (
    <div className="space-y-4">
      {memberships.map((m) => (
        <div
          key={m.id}
          className="rounded-xl bg-white p-6 shadow-sm"
        >
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-medium text-gray-900">{m.group.name}</h3>
              <p className="mt-1 text-sm text-gray-600">
                {t('groups.teacherName')}:{' '}
                <Link
                  href={`/teachers/${m.group.teacher.user.id}`}
                  className="text-blue-600 hover:underline"
                >
                  {m.group.teacher.user.fullName}
                </Link>
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                <span className="inline-block rounded bg-blue-50 px-2 py-0.5 text-xs text-blue-700">
                  {tLang(m.group.language)}
                </span>
                <span className="inline-block rounded bg-purple-50 px-2 py-0.5 text-xs text-purple-700">
                  {m.group.level}
                </span>
                <span className="inline-block rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                  {tAudience(m.group.audienceType)}
                </span>
              </div>
              <p className="mt-2 text-sm text-gray-500">
                {Number(m.group.pricePerSession).toFixed(3)} DT / {t('groups.pricePerSession').toLowerCase().includes('séance') ? 'séance' : 'session'}
              </p>
              {m.status === 'ACTIVE' && (() => {
                const balance = getGroupBalance(m.group.id);
                return balance && balance.remaining > 0 ? (
                  <p className="mt-1 text-sm font-medium text-green-600">
                    {t('payments.remaining', { count: balance.remaining })}
                  </p>
                ) : (
                  <p className="mt-1 text-sm text-gray-400">
                    {t('payments.noCreditsYet')}
                  </p>
                );
              })()}
            </div>
            <div className="flex items-center gap-3">
              <span
                className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${STATUS_COLORS[m.status]}`}
              >
                {tStatus(m.status)}
              </span>
              {(m.status === 'ACTIVE' || m.status === 'PENDING') && (
                <button
                  onClick={() => leaveMutation.mutate(m.group.id)}
                  disabled={leaveMutation.isPending}
                  className="text-sm text-red-600 hover:text-red-800 disabled:opacity-50"
                >
                  {t('student.leaveGroup')}
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
