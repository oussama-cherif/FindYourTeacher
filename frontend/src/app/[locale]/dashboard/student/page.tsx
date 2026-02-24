'use client';

import { useTranslations } from 'next-intl';
import { useQuery } from '@tanstack/react-query';
import { Link } from '@/i18n/navigation';
import api from '@/lib/api';

export default function StudentDashboardPage() {
  const t = useTranslations();

  const { data: calls } = useQuery({
    queryKey: ['student', 'calls'],
    queryFn: () => api.get('/onboarding/student').then((r) => r.data),
  });

  const { data: memberships } = useQuery({
    queryKey: ['student', 'groups', 'mine'],
    queryFn: () => api.get('/groups/mine').then((r) => r.data),
  });

  const upcomingCalls =
    calls?.filter(
      (c: { status: string }) =>
        c.status === 'PENDING' || c.status === 'CONFIRMED',
    ) ?? [];

  const activeGroups =
    memberships?.filter(
      (m: { status: string }) => m.status === 'ACTIVE',
    ) ?? [];

  const { data: sessions } = useQuery<{ status: string }[]>({
    queryKey: ['student', 'sessions'],
    queryFn: () => api.get('/sessions/student').then((r) => r.data),
  });

  const upcomingSessions = sessions ?? [];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">
        {t('student.dashboard')}
      </h1>

      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {/* Upcoming calls card */}
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">
            {t('student.upcomingCalls')}
          </h3>
          <p className="mt-2 text-3xl font-semibold text-gray-900">
            {upcomingCalls.length}
          </p>
          <Link
            href="/dashboard/student/calls"
            className="mt-4 inline-block text-sm text-blue-600 hover:underline"
          >
            {t('student.myCalls')}
          </Link>
        </div>

        {/* Active groups card */}
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">
            {t('student.activeGroups')}
          </h3>
          <p className="mt-2 text-3xl font-semibold text-gray-900">
            {activeGroups.length}
          </p>
          <Link
            href="/dashboard/student/groups"
            className="mt-4 inline-block text-sm text-blue-600 hover:underline"
          >
            {t('student.myGroups')}
          </Link>
        </div>

        {/* Upcoming sessions card */}
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">
            {t('student.upcomingSessions')}
          </h3>
          <p className="mt-2 text-3xl font-semibold text-gray-900">
            {upcomingSessions.length}
          </p>
          <Link
            href="/dashboard/student/sessions"
            className="mt-4 inline-block text-sm text-blue-600 hover:underline"
          >
            {t('student.mySessions')}
          </Link>
        </div>
      </div>
    </div>
  );
}
