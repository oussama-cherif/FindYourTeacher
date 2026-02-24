'use client';

import { useTranslations } from 'next-intl';
import { useQuery } from '@tanstack/react-query';
import { Link } from '@/i18n/navigation';
import api from '@/lib/api';

export default function TeacherDashboardPage() {
  const t = useTranslations();

  const { data: profile } = useQuery({
    queryKey: ['teacher', 'profile'],
    queryFn: () => api.get('/teachers/profile').then((r) => r.data),
  });

  const { data: slots } = useQuery({
    queryKey: ['teacher', 'availability'],
    queryFn: () => api.get('/teachers/availability').then((r) => r.data),
  });

  const { data: groups } = useQuery({
    queryKey: ['teacher', 'groups'],
    queryFn: () => api.get('/groups/teacher').then((r) => r.data),
  });

  const isProfileComplete =
    profile?.bio && profile?.languages?.length > 0 && profile?.audienceTypes?.length > 0;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">
        {t('teacher.welcome', { name: profile?.user?.fullName ?? '' })}
      </h1>

      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {/* Profile status card */}
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">
            {t('teacher.profile')}
          </h3>
          <p
            className={`mt-2 text-lg font-semibold ${isProfileComplete ? 'text-green-600' : 'text-amber-600'}`}
          >
            {isProfileComplete
              ? t('teacher.profileComplete')
              : t('teacher.profileIncomplete')}
          </p>
          <Link
            href="/dashboard/teacher/profile"
            className="mt-4 inline-block text-sm text-blue-600 hover:underline"
          >
            {t('teacher.editProfile')}
          </Link>
        </div>

        {/* Availability card */}
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">
            {t('teacher.availability')}
          </h3>
          <p className="mt-2 text-lg font-semibold text-gray-900">
            {t('teacher.slotsCount', { count: slots?.length ?? 0 })}
          </p>
          <Link
            href="/dashboard/teacher/availability"
            className="mt-4 inline-block text-sm text-blue-600 hover:underline"
          >
            {t('teacher.manageAvailability')}
          </Link>
        </div>

        {/* Groups card */}
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">
            {t('teacher.groups')}
          </h3>
          <p className="mt-2 text-lg font-semibold text-gray-900">
            {groups?.length ?? 0} {t('teacher.groups').toLowerCase()}
          </p>
          <Link
            href="/dashboard/teacher/groups"
            className="mt-4 inline-block text-sm text-blue-600 hover:underline"
          >
            {t('groups.manageMembers')}
          </Link>
        </div>
      </div>
    </div>
  );
}
