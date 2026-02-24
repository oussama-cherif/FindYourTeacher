'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Link } from '@/i18n/navigation';
import { LanguageSwitcher } from '@/components/language-switcher';
import axios from 'axios';
import api from '@/lib/api';

interface GroupDetailData {
  id: string;
  name: string;
  language: string;
  level: string;
  audienceType: string;
  maxStudents: number;
  pricePerSession: string;
  platformFee: string;
  availableSpots: number;
  teacher: {
    user: { id: string; fullName: string; avatarUrl: string | null };
  };
  _count: { memberships: number };
}

export function GroupPublicDetail({ groupId }: { groupId: string }) {
  const t = useTranslations();

  const [currentUser, setCurrentUser] = useState<{
    id: string;
    role: string;
  } | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [joinSuccess, setJoinSuccess] = useState(false);
  const [joinError, setJoinError] = useState('');

  useEffect(() => {
    api
      .get('/users/me')
      .then(({ data }) => {
        setCurrentUser(data);
        setAuthChecked(true);
      })
      .catch(() => {
        setAuthChecked(true);
      });
  }, []);

  const { data: group, isLoading } = useQuery<GroupDetailData>({
    queryKey: ['groups', 'detail', groupId],
    queryFn: () =>
      axios
        .get(`${process.env.NEXT_PUBLIC_API_URL}/groups/${groupId}`)
        .then((r) => r.data),
  });

  const joinMutation = useMutation({
    mutationFn: () => api.post(`/groups/${groupId}/join`),
    onSuccess: () => {
      setJoinSuccess(true);
      setJoinError('');
    },
    onError: (err: { response?: { status?: number } }) => {
      if (err.response?.status === 409) {
        setJoinError(t('groups.groupFull'));
      } else {
        setJoinError(t('common.error'));
      }
    },
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
        <Link href="/" className="text-xl font-bold text-blue-600">
          {t('common.appName')}
        </Link>
        <div className="flex items-center gap-4">
          <LanguageSwitcher />
          <Link
            href="/groups"
            className="text-gray-700 hover:text-blue-600 transition-colors"
          >
            {t('common.back')}
          </Link>
        </div>
      </nav>

      <div className="mx-auto max-w-3xl px-6 py-8">
        {isLoading ? (
          <p className="text-gray-500">{t('common.loading')}</p>
        ) : !group ? (
          <p className="text-gray-500">{t('groups.noResults')}</p>
        ) : (
          <div className="space-y-6">
            {/* Header */}
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {group.name}
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                {t('groups.teacherName')}: {group.teacher.user.fullName}
              </p>
            </div>

            {/* Details card */}
            <div className="rounded-xl bg-white p-6 shadow-sm">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">{t('groups.language')}</p>
                  <p className="font-medium text-gray-900">
                    {t(`languageOptions.${group.language}`)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">{t('groups.level')}</p>
                  <p className="font-medium text-gray-900">
                    {t(`levelOptions.${group.level}`)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">{t('groups.audienceType')}</p>
                  <p className="font-medium text-gray-900">
                    {t(`audienceOptions.${group.audienceType}`)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">{t('groups.priceLabel')}</p>
                  <p className="font-medium text-gray-900">
                    {group.pricePerSession} DT
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">{t('groups.members')}</p>
                  <p className="font-medium text-gray-900">
                    {t('groups.membersCount', {
                      count: group._count.memberships,
                      max: group.maxStudents,
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">
                    {t('groups.availableSpots', {
                      count: group.availableSpots,
                    })}
                  </p>
                </div>
              </div>
            </div>

            {/* Join section */}
            {joinSuccess ? (
              <div className="rounded-xl bg-green-50 p-6 text-center">
                <p className="text-green-700 font-medium">
                  {t('groups.joinRequested')}
                </p>
              </div>
            ) : joinError ? (
              <div className="rounded-xl bg-red-50 p-6 text-center">
                <p className="text-red-700 font-medium">{joinError}</p>
              </div>
            ) : authChecked && !currentUser ? (
              <Link
                href="/login"
                className="block w-full rounded-lg bg-blue-600 px-4 py-3 text-center text-white hover:bg-blue-700 transition-colors"
              >
                {t('teachers.loginToBook')}
              </Link>
            ) : authChecked && currentUser?.role === 'STUDENT' ? (
              group.availableSpots <= 0 ? (
                <button
                  disabled
                  className="w-full rounded-lg bg-blue-600 px-4 py-3 text-white opacity-50 cursor-not-allowed"
                >
                  {t('groups.groupFull')}
                </button>
              ) : (
                <button
                  onClick={() => joinMutation.mutate()}
                  disabled={joinMutation.isPending}
                  className="w-full rounded-lg bg-blue-600 px-4 py-3 text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {t('groups.joinGroup')}
                </button>
              )
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
