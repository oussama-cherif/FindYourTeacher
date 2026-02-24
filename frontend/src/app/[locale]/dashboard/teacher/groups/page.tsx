'use client';

import { useTranslations } from 'next-intl';
import { TeacherGroupsManager } from '@/components/teacher/teacher-groups-manager';

export default function TeacherGroupsPage() {
  const t = useTranslations();

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">
        {t('teacher.groups')}
      </h1>
      <div className="mt-6">
        <TeacherGroupsManager />
      </div>
    </div>
  );
}
