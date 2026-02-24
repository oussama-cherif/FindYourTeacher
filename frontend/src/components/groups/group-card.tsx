'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

interface GroupCardProps {
  group: {
    id: string;
    name: string;
    language: string;
    level: string;
    audienceType: string;
    maxStudents: number;
    pricePerSession: string;
    teacher: {
      user: { id: string; fullName: string; avatarUrl: string | null };
    };
    _count: { memberships: number };
  };
}

export function GroupCard({ group }: GroupCardProps) {
  const t = useTranslations();
  const availableSpots = group.maxStudents - group._count.memberships;

  return (
    <div className="rounded-xl bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <h3 className="text-lg font-semibold text-gray-900">{group.name}</h3>
        <span className="inline-block rounded bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
          {t(`levelOptions.${group.level}`)}
        </span>
      </div>

      <p className="mt-1 text-sm text-gray-500">
        {t('groups.teacherName')}: {group.teacher.user.fullName}
      </p>

      <div className="mt-3 flex flex-wrap gap-2">
        <span className="inline-block rounded bg-blue-50 px-3 py-1 text-sm text-blue-700">
          {t(`languageOptions.${group.language}`)}
        </span>
        <span className="inline-block rounded bg-gray-100 px-3 py-1 text-sm text-gray-600">
          {t(`audienceOptions.${group.audienceType}`)}
        </span>
      </div>

      <div className="mt-4 flex items-center justify-between text-sm">
        <span className="text-gray-600">
          {availableSpots > 0
            ? t('groups.availableSpots', { count: availableSpots })
            : t('groups.groupFull')}
        </span>
        <span className="font-medium text-gray-900">
          {group.pricePerSession} DT
        </span>
      </div>

      <Link
        href={`/groups/${group.id}`}
        className="mt-4 block w-full rounded-lg bg-blue-600 px-4 py-2 text-center text-sm text-white hover:bg-blue-700 transition-colors"
      >
        {t('groups.viewDetails')}
      </Link>
    </div>
  );
}
