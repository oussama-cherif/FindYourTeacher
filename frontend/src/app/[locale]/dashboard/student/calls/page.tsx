'use client';

import { useTranslations } from 'next-intl';
import { StudentCallsList } from '@/components/student/student-calls-list';

export default function StudentCallsPage() {
  const t = useTranslations();

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">
        {t('student.myCalls')}
      </h1>
      <div className="mt-6">
        <StudentCallsList />
      </div>
    </div>
  );
}
