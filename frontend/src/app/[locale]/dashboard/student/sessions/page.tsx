'use client';

import { useTranslations } from 'next-intl';
import { StudentSessionsList } from '@/components/student/student-sessions-list';

export default function StudentSessionsPage() {
  const t = useTranslations();

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">
        {t('student.mySessions')}
      </h1>
      <div className="mt-6">
        <StudentSessionsList />
      </div>
    </div>
  );
}
