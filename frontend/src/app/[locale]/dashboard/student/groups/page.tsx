'use client';

import { useTranslations } from 'next-intl';
import { StudentGroupsList } from '@/components/student/student-groups-list';

export default function StudentGroupsPage() {
  const t = useTranslations();

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">
        {t('student.myGroups')}
      </h1>
      <div className="mt-6">
        <StudentGroupsList />
      </div>
    </div>
  );
}
