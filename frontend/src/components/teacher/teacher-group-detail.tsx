'use client';

import { useTranslations } from 'next-intl';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from '@/i18n/navigation';
import api from '@/lib/api';

interface Member {
  id: string;
  status: 'PENDING' | 'ACTIVE' | 'LEFT' | 'REMOVED';
  joinedAt: string;
  student: {
    id: string;
    fullName: string;
    avatarUrl: string | null;
    email: string;
  };
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  ACTIVE: 'bg-green-100 text-green-800',
  LEFT: 'bg-gray-100 text-gray-600',
  REMOVED: 'bg-red-100 text-red-800',
};

export function TeacherGroupDetail({ groupId }: { groupId: string }) {
  const t = useTranslations();
  const tStatus = useTranslations('student.membershipStatus');
  const queryClient = useQueryClient();

  const { data: members, isLoading } = useQuery<Member[]>({
    queryKey: ['teacher', 'groups', groupId, 'members'],
    queryFn: () => api.get(`/groups/${groupId}/members`).then((r) => r.data),
  });

  const approveMutation = useMutation({
    mutationFn: (membershipId: string) =>
      api.patch(`/groups/memberships/${membershipId}/approve`),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['teacher', 'groups', groupId, 'members'],
      });
    },
  });

  const removeMutation = useMutation({
    mutationFn: (membershipId: string) =>
      api.patch(`/groups/memberships/${membershipId}/remove`),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['teacher', 'groups', groupId, 'members'],
      });
    },
  });

  return (
    <div>
      <Link
        href="/dashboard/teacher/groups"
        className="text-sm text-blue-600 hover:underline"
      >
        {t('common.back')}
      </Link>

      <h2 className="mt-4 text-xl font-bold text-gray-900">
        {t('groups.members')}
      </h2>

      {isLoading ? (
        <p className="mt-4 text-gray-500">{t('common.loading')}</p>
      ) : !members || members.length === 0 ? (
        <p className="mt-4 text-gray-500">{t('groups.noMembers')}</p>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="py-3 pr-4 font-medium text-gray-500">
                  {t('common.fullName')}
                </th>
                <th className="py-3 pr-4 font-medium text-gray-500">
                  {t('common.email')}
                </th>
                <th className="py-3 pr-4 font-medium text-gray-500">
                  Status
                </th>
                <th className="py-3 font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {members.map((m) => (
                <tr key={m.id} className="border-b border-gray-100">
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">
                        {m.student.fullName.charAt(0)}
                      </div>
                      <span className="text-gray-900">
                        {m.student.fullName}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 pr-4 text-gray-600">
                    {m.student.email}
                  </td>
                  <td className="py-3 pr-4">
                    <span
                      className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${STATUS_COLORS[m.status]}`}
                    >
                      {tStatus(m.status)}
                    </span>
                  </td>
                  <td className="py-3">
                    <div className="flex gap-2">
                      {m.status === 'PENDING' && (
                        <button
                          onClick={() => approveMutation.mutate(m.id)}
                          disabled={approveMutation.isPending}
                          className="rounded bg-green-600 px-3 py-1 text-xs text-white hover:bg-green-700 disabled:opacity-50 transition-colors"
                        >
                          {t('groups.approve')}
                        </button>
                      )}
                      {(m.status === 'PENDING' || m.status === 'ACTIVE') && (
                        <button
                          onClick={() => removeMutation.mutate(m.id)}
                          disabled={removeMutation.isPending}
                          className="rounded bg-red-600 px-3 py-1 text-xs text-white hover:bg-red-700 disabled:opacity-50 transition-colors"
                        >
                          {t('groups.remove')}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
